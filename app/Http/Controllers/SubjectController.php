<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Enrollment;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\University;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::with(['university:id,name', 'semester:id,name', 'originalSubject:id,title'])
            ->withCount(['documents', 'assignments', 'enrollments', 'sharedInstances']);

        if ($request->filled('university_id')) {
            $query->where('university_id', $request->university_id);
        }

        $subjects = $query->active()->latest()->paginate(20)->withQueryString();
        $universities = University::active()->get(['id', 'name']);

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects,
            'universities' => $universities,
            'filters' => $request->only(['university_id']),
        ]);
    }

    public function create(Request $request)
    {
        $universities = University::active()->with('semesters')->get(['id', 'name']);

        return Inertia::render('Admin/Subjects/Create', [
            'universities' => $universities,
            'preselectedUniversityId' => $request->university_id,
            'preselectedSemesterId' => $request->semester_id,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'guidelines' => 'nullable|string',
            'university_id' => 'required|exists:universities,id',
            'semester_id' => 'required|exists:semesters,id',
            'color' => 'nullable|string|max:7',
        ]);

        $subject = Subject::create($validated);
        $subject->enrollUniversityStudents();
        ActivityLog::log('subject_created', $subject);

        return redirect()->route('admin.subjects.show', $subject)
            ->with('message', "Subject '{$subject->title}' created.");
    }

    public function show(Subject $subject)
    {
        $subject->load([
            'university:id,name,logo_path',
            'semester:id,name',
            'documents' => fn ($q) => $q->orderBy('sort_order'),
            'assignments' => fn ($q) => $q->withCount('submissions')->orderBy('deadline', 'desc'),
            'updates' => fn ($q) => $q->with('user:id,name')->latest(),
            'activeStudents' => fn ($q) => $q->select('users.id', 'users.name', 'users.email', 'users.avatar_path', 'users.student_id_no'),
        ]);

        // Multi-Campus Analytics & Separation: Find all campus instances sharing this course
        $rootId = $subject->original_subject_id ?: $subject->id;
        $sharedCampuses = Subject::where(function ($q) use ($rootId) {
            $q->where('id', $rootId)->orWhere('original_subject_id', $rootId);
        })
            ->with(['university:id,name,logo_path', 'semester:id,name'])
            ->withCount(['documents', 'assignments'])
            ->get()
            ->map(function ($instance) use ($subject) {
                $studentCount = $instance->activeStudents()->count();
                $totalDownloads = (int) $instance->documents()->sum('download_count');
                $totalViews = (int) $instance->documents()->sum('view_count');
                $submissionsCount = Submission::whereHas('assignment', fn ($q) => $q->where('subject_id', $instance->id))->count();
                $graded = Submission::whereHas('assignment', fn ($q) => $q->where('subject_id', $instance->id))->where('status', 'graded')->get();
                $avgGrade = $graded->count() > 0 ? round((float) $graded->avg('grade'), 1) : null;

                return [
                    'id' => $instance->id,
                    'title' => $instance->title,
                    'code' => $instance->code,
                    'is_current' => $instance->id === $subject->id,
                    'is_original' => empty($instance->original_subject_id),
                    'university' => $instance->university,
                    'semester' => $instance->semester,
                    'documents_count' => (int) $instance->documents_count,
                    'assignments_count' => (int) $instance->assignments_count,
                    'students_count' => $studentCount,
                    'total_downloads' => $totalDownloads,
                    'total_views' => $totalViews,
                    'submissions_count' => $submissionsCount,
                    'average_grade' => $avgGrade,
                ];
            });

        $allUniversities = University::active()->with('semesters')->get(['id', 'name']);

        return Inertia::render('Admin/Subjects/Show', [
            'subject' => $subject,
            'sharedCampuses' => $sharedCampuses,
            'allUniversities' => $allUniversities,
        ]);
    }

    public function edit(Subject $subject)
    {
        $subject->load(['university', 'semester']);
        $universities = University::active()->with('semesters')->get(['id', 'name']);

        return Inertia::render('Admin/Subjects/Edit', [
            'subject' => $subject,
            'universities' => $universities,
        ]);
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'guidelines' => 'nullable|string',
            'color' => 'nullable|string|max:7',
            'is_active' => 'boolean',
            'university_id' => 'nullable|exists:universities,id',
            'semester_id' => 'nullable|exists:semesters,id',
        ]);

        $subject->update($validated);
        ActivityLog::log('subject_updated', $subject);

        return redirect()->back()->with('message', 'Subject updated successfully.');
    }

    public function destroy(Subject $subject)
    {
        $title = $subject->title;
        $id = $subject->id;

        ActivityLog::log('subject_deleted', $subject);
        $subject->delete();

        session()->flash('undo', [
            'type' => 'subject',
            'id' => $id,
            'name' => $title,
        ]);

        return redirect()->route('admin.subjects.index')
            ->with('message', "Subject '{$title}' moved to Recycle Bin.");
    }

    /**
     * Transfer a subject between universities and semesters.
     */
    public function transfer(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,id',
            'semester_id' => 'required|exists:semesters,id',
            'reset_enrollments' => 'nullable|boolean',
        ]);

        $targetUni = University::findOrFail($validated['university_id']);
        $targetSem = Semester::findOrFail($validated['semester_id']);

        $previousUniName = $subject->university?->name ?? 'Unknown';
        $previousSemName = $subject->semester?->name ?? 'Unknown';

        // Update target university and semester
        $subject->update([
            'university_id' => $targetUni->id,
            'semester_id' => $targetSem->id,
        ]);

        // If requested, reset enrollments of students who do not belong to the target university
        if ($request->boolean('reset_enrollments')) {
            Enrollment::where('subject_id', $subject->id)
                ->whereHas('user', fn ($q) => $q->where('university_id', '!=', $targetUni->id))
                ->delete();
        }

        ActivityLog::log('subject_transferred', $subject, [
            'from_university' => $previousUniName,
            'to_university' => $targetUni->name,
            'from_semester' => $previousSemName,
            'to_semester' => $targetSem->name,
        ]);

        return redirect()->back()->with('message', "Subject transferred to {$targetUni->name} ({$targetSem->name}).");
    }

    /**
     * Share a subject with another university or semester (multi-campus with independent analytics).
     */
    public function share(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'target_university_id' => 'required|exists:universities,id',
            'target_semester_id' => 'required|exists:semesters,id',
            'copy_documents' => 'nullable|boolean',
            'copy_assignments' => 'nullable|boolean',
        ]);

        $targetUni = University::findOrFail($validated['target_university_id']);
        $targetSem = Semester::findOrFail($validated['target_semester_id']);

        // Check if an instance already exists for this university and semester
        $rootId = $subject->original_subject_id ?: $subject->id;
        $alreadyExists = Subject::where(function ($q) use ($rootId) {
            $q->where('id', $rootId)->orWhere('original_subject_id', $rootId);
        })
            ->where('university_id', $targetUni->id)
            ->where('semester_id', $targetSem->id)
            ->exists();

        if ($alreadyExists) {
            return redirect()->back()->with('error', "This subject is already shared with {$targetUni->name} for {$targetSem->name}.");
        }

        // Create new isolated subject instance for the target university
        $newSubject = Subject::create([
            'title' => $subject->title,
            'code' => $subject->code,
            'description' => $subject->description,
            'guidelines' => $subject->guidelines,
            'color' => $subject->color,
            'university_id' => $targetUni->id,
            'semester_id' => $targetSem->id,
            'original_subject_id' => $rootId,
            'is_active' => true,
        ]);

        // Copy documents if requested (same physical file, clean independent view/download metrics)
        if ($request->boolean('copy_documents', true)) {
            foreach ($subject->documents as $doc) {
                $newSubject->documents()->create([
                    'title' => $doc->title,
                    'description' => $doc->description,
                    'file_name' => $doc->file_name,
                    'file_path' => $doc->file_path,
                    'file_size' => $doc->file_size,
                    'file_type' => $doc->file_type,
                    'mime_type' => $doc->mime_type,
                    'uploaded_by' => $doc->uploaded_by ?? auth()->id(),
                    'is_downloadable' => $doc->is_downloadable,
                    'is_view_only' => $doc->is_view_only,
                    'is_universal' => $doc->is_universal,
                    'sort_order' => $doc->sort_order,
                    'download_count' => 0,
                    'view_count' => 0,
                ]);
            }
        }

        // Copy assignments if requested (clean independent submission roster)
        if ($request->boolean('copy_assignments', true)) {
            foreach ($subject->assignments as $assign) {
                $newSubject->assignments()->create([
                    'title' => $assign->title,
                    'description' => $assign->description,
                    'deadline' => $assign->deadline,
                    'max_grade' => $assign->max_grade,
                    'allow_late' => $assign->allow_late,
                    'allow_resubmit' => $assign->allow_resubmit,
                    'rubric' => $assign->rubric,
                    'is_published' => $assign->is_published,
                ]);
            }
        }

        ActivityLog::log('subject_shared', $newSubject, [
            'original_subject_id' => $subject->id,
            'target_university' => $targetUni->name,
            'target_semester' => $targetSem->name,
        ]);

        return redirect()->back()->with('message', "Subject successfully shared with {$targetUni->name}. Analytics, students, and submissions will remain 100% separate.");
    }

    /**
     * Synchronize materials to all shared campuses.
     */
    public function sync(Request $request, Subject $subject)
    {
        $rootId = $subject->original_subject_id ?: $subject->id;

        $siblingInstances = Subject::where('id', '!=', $subject->id)
            ->where(function ($q) use ($rootId) {
                $q->where('id', $rootId)->orWhere('original_subject_id', $rootId);
            })
            ->get();

        $syncedFilesCount = 0;

        foreach ($siblingInstances as $instance) {
            $existingFilePaths = $instance->documents()->pluck('file_path')->toArray();

            foreach ($subject->documents as $doc) {
                if (! in_array($doc->file_path, $existingFilePaths, true)) {
                    $instance->documents()->create([
                        'title' => $doc->title,
                        'description' => $doc->description,
                        'file_name' => $doc->file_name,
                        'file_path' => $doc->file_path,
                        'file_size' => $doc->file_size,
                        'file_type' => $doc->file_type,
                        'mime_type' => $doc->mime_type,
                        'uploaded_by' => $doc->uploaded_by ?? auth()->id(),
                        'is_downloadable' => $doc->is_downloadable,
                        'is_view_only' => $doc->is_view_only,
                        'is_universal' => $doc->is_universal,
                        'sort_order' => $doc->sort_order,
                        'download_count' => 0,
                        'view_count' => 0,
                    ]);
                    $syncedFilesCount++;
                }
            }
        }

        ActivityLog::log('subject_synced', $subject, ['synced_files' => $syncedFilesCount]);

        return redirect()->back()->with('message', "Synced {$syncedFilesCount} new material file(s) across {$siblingInstances->count()} shared campus cabinet(s).");
    }

    /**
     * Add an update/announcement to a subject.
     */
    public function addUpdate(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_highlighted' => 'boolean',
            'is_pinned' => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();

        $update = $subject->updates()->create($validated);
        ActivityLog::log('subject_update_created', $update);

        return redirect()->back()->with('message', 'Update posted.');
    }

    /**
     * Student view of a subject they're enrolled in.
     */
    public function studentView(Subject $subject)
    {
        $user = auth()->user();

        // Check RBAC access
        if (! $user->canAccessSubject($subject)) {
            abort(403, 'You do not have access to this subject.');
        }

        $isEnrolled = true;

        // Auto-enroll if accessing via university affiliation
        if (! $user->isAdmin()) {
            Enrollment::firstOrCreate([
                'user_id' => $user->id,
                'subject_id' => $subject->id,
            ], [
                'status' => 'active',
                'enrolled_at' => now(),
            ]);
        }

        $subject->load([
            'university:id,name,logo_path',
            'semester:id,name',
            'documents' => fn ($q) => $user->isAdmin()
                ? $q->orderBy('sort_order')
                : $q->published()->orderBy('sort_order'),
            'assignments' => fn ($q) => $q->published()->orderBy('deadline'),
            'updates' => fn ($q) => $q->with('user:id,name')->latest()->take(10),
        ]);

        // Get user's submissions for this subject's assignments
        $submissionsByAssignment = $user->submissions()
            ->whereHas('assignment', fn ($q) => $q->where('subject_id', $subject->id))
            ->get()
            ->keyBy('assignment_id');

        return Inertia::render('Student/Subject', [
            'subject' => $subject,
            'submissions' => $submissionsByAssignment,
            'isEnrolled' => $isEnrolled,
        ]);
    }
}
