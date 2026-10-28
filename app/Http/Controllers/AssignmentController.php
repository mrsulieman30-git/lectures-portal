<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Assignment;
use App\Models\Notification;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AssignmentController extends Controller
{
    /**
     * Create a new assignment.
     */
    public function store(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'max_grade' => 'required|integer|min:1|max:1000',
            'allow_late' => 'boolean',
            'late_penalty_percent' => 'integer|min:0|max:100',
            'allow_resubmit' => 'boolean',
            'rubric' => 'nullable|string',
            'attachment' => 'nullable|file|max:10240',
        ]);

        if ($request->hasFile('attachment')) {
            $validated['attachment_path'] = $request->file('attachment')
                ->store("assignments/{$subject->id}", 'public');
        }
        unset($validated['attachment']);

        $assignment = $subject->assignments()->create($validated);

        // Notify enrolled students
        $enrolledUserIds = $subject->activeStudents()->pluck('users.id');
        foreach ($enrolledUserIds as $userId) {
            Notification::notify(
                $userId,
                'new_assignment',
                "New Assignment: {$assignment->title}",
                "Deadline: {$assignment->deadline->format('M d, Y h:i A')}",
                route('subjects.show', $subject)
            );
        }

        ActivityLog::log('assignment_created', $assignment);

        return redirect()->back()->with('message', "Assignment '{$assignment->title}' created.");
    }

    /**
     * Update assignment.
     */
    public function update(Request $request, Assignment $assignment)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'required|date',
            'max_grade' => 'required|integer|min:1|max:1000',
            'allow_late' => 'boolean',
            'late_penalty_percent' => 'integer|min:0|max:100',
            'allow_resubmit' => 'boolean',
            'rubric' => 'nullable|string',
            'is_published' => 'boolean',
            'attachment' => 'nullable|file|max:10240',
        ]);

        if ($request->hasFile('attachment')) {
            if ($assignment->attachment_path) {
                Storage::disk('public')->delete($assignment->attachment_path);
            }
            $validated['attachment_path'] = $request->file('attachment')
                ->store("assignments/{$assignment->subject_id}", 'public');
        }
        $originalDeadline = $assignment->deadline;

        $assignment->update($validated);

        if ($originalDeadline && $assignment->deadline && $originalDeadline->ne($assignment->deadline)) {
            // Re-evaluate late status for all submissions against the new deadline
            foreach ($assignment->submissions as $sub) {
                if ($sub->submitted_at) {
                    $sub->update([
                        'is_late' => $sub->submitted_at->gt($assignment->deadline),
                    ]);
                }
            }
        }

        return redirect()->back()->with('message', 'Assignment updated successfully.');
    }

    /**
     * Student submits an assignment.
     */
    public function submit(Request $request, Assignment $assignment)
    {
        $user = auth()->user();

        // Check RBAC access
        if (! $user->canAccessSubject($assignment->subject)) {
            abort(403, 'You do not have access to this assignment.');
        }

        // Check for existing submission
        $existing = Submission::where('assignment_id', $assignment->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing && ! $assignment->allow_resubmit) {
            return redirect()->back()->withErrors(['submit' => 'Resubmission is not allowed for this assignment.']);
        }

        // Check deadline hard lock
        if ($assignment->deadline->isPast() && ! $assignment->allow_late) {
            return redirect()->back()->withErrors(['submit' => 'The submission deadline has passed and late submissions are locked by the professor.']);
        }

        $request->validate([
            'file' => 'nullable|file|max:20480',
            'text_content' => 'nullable|string',
        ]);

        $data = [
            'assignment_id' => $assignment->id,
            'user_id' => $user->id,
            'text_content' => $request->text_content,
            'status' => 'pending',
            'is_late' => $assignment->deadline->isPast(),
            'submitted_at' => now(),
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $data['file_path'] = $file->store("submissions/{$assignment->id}", 'public');
            $data['file_name'] = $file->getClientOriginalName();
        }

        if ($existing) {
            // Delete old file if resubmitting
            if ($existing->file_path) {
                Storage::disk('public')->delete($existing->file_path);
            }
            $existing->update($data);
        } else {
            Submission::create($data);
        }

        ActivityLog::log('assignment_submitted', $assignment);

        // Notify admin
        $admins = User::where('role', 'admin')->pluck('id');
        foreach ($admins as $adminId) {
            Notification::notify(
                $adminId,
                'new_submission',
                "New Submission: {$assignment->title}",
                "{$user->name} submitted their assignment.",
                route('admin.assignments.submissions', $assignment)
            );
        }

        return redirect()->back()->with('message', 'Assignment submitted successfully.');
    }

    /**
     * View submissions for an assignment (admin).
     */
    public function submissions(Assignment $assignment)
    {
        $assignment->load([
            'subject:id,title,code',
            'submissions' => fn ($q) => $q->with([
                'user:id,name,email,student_id_no,avatar_path',
                'pendingAgentAction.agent:id,name',
                'agentAction.agent:id,name',
            ])->latest('submitted_at'),
        ]);

        // Get list of enrolled students who haven't submitted
        $submittedUserIds = $assignment->submissions->pluck('user_id');
        $missingStudents = $assignment->subject->activeStudents()
            ->whereNotIn('users.id', $submittedUserIds)
            ->get(['users.id', 'users.name', 'users.email', 'users.student_id_no']);

        return Inertia::render('Admin/Assignments/Submissions', [
            'assignment' => $assignment,
            'submissions' => $assignment->submissions,
            'missingStudents' => $missingStudents,
        ]);
    }

    /**
     * Grade a submission.
     */
    public function grade(Request $request, Submission $submission)
    {
        $validated = $request->validate([
            'grade' => "required|integer|min:0|max:{$submission->assignment->max_grade}",
            'feedback' => 'nullable|string',
            'ocr_text' => 'nullable|string',
            'ai_probability' => 'nullable|numeric',
            'ai_verdict' => 'nullable|string',
        ]);

        $submission->update([
            'grade' => $validated['grade'],
            'feedback' => $validated['feedback'] ?? null,
            'ocr_text' => $validated['ocr_text'] ?? $submission->ocr_text,
            'ai_probability' => $validated['ai_probability'] ?? $submission->ai_probability,
            'ai_verdict' => $validated['ai_verdict'] ?? $submission->ai_verdict,
            'status' => 'graded',
            'graded_at' => now(),
            'graded_by' => auth()->id(),
        ]);

        // If there was a pending agent proposal for this submission, mark it approved
        if ($submission->pendingAgentAction) {
            $submission->pendingAgentAction->update([
                'status' => 'approved',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
                'applied_at' => now(),
            ]);
            $submission->update(['agent_action_id' => $submission->pendingAgentAction->id]);
        }

        // Notify student
        Notification::notify(
            $submission->user_id,
            'assignment_graded',
            "Assignment Graded: {$submission->assignment->title}",
            "You scored {$validated['grade']}/{$submission->assignment->max_grade}.",
            route('subjects.show', $submission->assignment->subject_id)
        );

        ActivityLog::log('submission_graded', $submission, [
            'grade' => $validated['grade'],
        ]);

        return redirect()->back()->with('message', 'Submission graded.');
    }

    /**
     * Delete an assignment.
     */
    public function destroy(Assignment $assignment)
    {
        ActivityLog::log('assignment_deleted', $assignment);
        $assignment->delete();

        return redirect()->back()->with('message', 'Assignment deleted.');
    }

    /**
     * View or download a student's uploaded submission file.
     */
    public function file(Submission $submission)
    {
        $user = auth()->user();

        // Students can only view their own submission file; Admins can view any submission
        if (! $user->isAdmin() && $submission->user_id !== $user->id) {
            abort(403, 'Unauthorized access to submission file.');
        }

        if (! $submission->file_path) {
            abort(404, 'No file was uploaded for this submission.');
        }

        $cleanPath = ltrim(str_replace('\\', '/', $submission->file_path), '/');
        $cleanPath = preg_replace('#^/?(public/|storage/)?#', '', $cleanPath);

        $candidates = [
            storage_path('app/public/'.$cleanPath),
            public_path('storage/'.$cleanPath),
            storage_path('app/'.$cleanPath),
            public_path($cleanPath),
        ];

        $filePath = null;
        foreach ($candidates as $cand) {
            if (file_exists($cand) && ! is_dir($cand)) {
                $filePath = $cand;
                break;
            }
        }

        if (! $filePath) {
            abort(404, 'File not found on storage.');
        }

        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'bmp' => 'image/bmp',
            'heic' => 'image/heic',
            'tiff' => 'image/tiff',
            'tif' => 'image/tiff',
            'pdf' => 'application/pdf',
            'txt' => 'text/plain',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'zip' => 'application/zip',
        ];

        $mime = $mimeTypes[$extension] ?? (@mime_content_type($filePath) ?: 'application/octet-stream');
        $fileName = $submission->file_name ?: basename($filePath);
        $isDownload = request()->boolean('download');
        $disposition = $isDownload ? 'attachment' : 'inline';

        return response()->file($filePath, [
            'Content-Type' => $mime,
            'Content-Disposition' => "{$disposition}; filename=\"{$fileName}\"",
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }

    /**
     * View or download an assignment reference attachment.
     */
    public function attachment(Assignment $assignment)
    {
        $user = auth()->user();

        if (! $user->isAdmin() && ! $user->canAccessSubject($assignment->subject)) {
            abort(403, 'Unauthorized access to assignment attachment.');
        }

        if (! $assignment->attachment_path) {
            abort(404, 'No attachment associated with this assignment.');
        }

        $cleanPath = ltrim(str_replace('\\', '/', $assignment->attachment_path), '/');
        $cleanPath = preg_replace('#^/?(public/|storage/)?#', '', $cleanPath);

        $candidates = [
            storage_path('app/public/'.$cleanPath),
            public_path('storage/'.$cleanPath),
            storage_path('app/'.$cleanPath),
            public_path($cleanPath),
        ];

        $filePath = null;
        foreach ($candidates as $cand) {
            if (file_exists($cand) && ! is_dir($cand)) {
                $filePath = $cand;
                break;
            }
        }

        if (! $filePath) {
            abort(404, 'Attachment file not found on storage.');
        }

        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'bmp' => 'image/bmp',
            'heic' => 'image/heic',
            'tiff' => 'image/tiff',
            'tif' => 'image/tiff',
            'pdf' => 'application/pdf',
            'txt' => 'text/plain',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'zip' => 'application/zip',
        ];

        $mime = $mimeTypes[$extension] ?? (@mime_content_type($filePath) ?: 'application/octet-stream');
        $fileName = basename($filePath);
        $isDownload = request()->boolean('download');
        $disposition = $isDownload ? 'attachment' : 'inline';

        return response()->file($filePath, [
            'Content-Type' => $mime,
            'Content-Disposition' => "{$disposition}; filename=\"{$fileName}\"",
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
