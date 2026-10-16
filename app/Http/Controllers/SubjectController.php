<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Subject;
use App\Models\University;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::with(['university:id,name', 'semester:id,name'])
            ->withCount('documents', 'assignments', 'enrollments');

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

        return Inertia::render('Admin/Subjects/Show', [
            'subject' => $subject,
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
        ]);

        $subject->update($validated);
        ActivityLog::log('subject_updated', $subject);

        return redirect()->back()->with('message', 'Subject updated.');
    }

    public function destroy(Subject $subject)
    {
        ActivityLog::log('subject_deleted', $subject);
        $subject->delete();

        return redirect()->route('admin.subjects.index')
            ->with('message', 'Subject deleted.');
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

        // Check enrollment
        $isEnrolled = $subject->enrollments()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->exists();

        if (! $isEnrolled && ! $user->isAdmin()) {
            abort(403, 'You are not enrolled in this subject.');
        }

        $subject->load([
            'university:id,name,logo_path',
            'semester:id,name',
            'documents' => fn ($q) => $q->orderBy('sort_order'),
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
