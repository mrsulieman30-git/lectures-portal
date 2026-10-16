<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\AgentAction;
use App\Models\Assignment;
use App\Models\Document;
use App\Models\LectureSchedule;
use App\Models\Notification;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AgentController extends Controller
{
    /**
     * Authenticate OpenClaw agent using username (email) and password.
     * Issues a persistent Sanctum Bearer token for API access.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password credentials.',
            ], 401);
        }

        // Verify status is approved or active
        if ($user->status && $user->status !== 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Account is not approved yet.',
            ], 403);
        }

        // Revoke previous tokens named 'openclaw-agent' to keep token pool clean
        $user->tokens()->where('name', 'openclaw-agent')->delete();

        $tokenName = $validated['device_name'] ?? 'openclaw-agent';
        $token = $user->createToken($tokenName)->plainTextToken;

        ActivityLog::log('agent_api_login', $user, [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agent authenticated successfully.',
            'token' => $token,
            'token_type' => 'Bearer',
            'agent' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'capabilities' => [
                'assignment_ocr' => true,
                'ai_detection' => true,
                'human_in_the_loop_mode' => 'always_ask_permission',
                'endpoints' => [
                    'pending_submissions' => '/api/agent/submissions/pending',
                    'propose_grade' => '/api/agent/submissions/{id}/propose-grade',
                    'pending_actions' => '/api/agent/actions/pending',
                    'propose_action' => '/api/agent/actions/propose',
                ],
            ],
        ]);
    }

    /**
     * Authenticated agent profile and overview.
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'agent' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'pending_actions_count' => AgentAction::pending()->count(),
            'pending_submissions_count' => Submission::pending()->count(),
        ]);
    }

    /**
     * Portal status overview.
     */
    public function status()
    {
        return response()->json([
            'portal_status' => 'online',
            'total_users' => User::count(),
            'total_students' => User::students()->count(),
            'approved_students' => User::students()->approved()->count(),
            'pending_approvals' => User::pending()->count(),
            'total_universities' => University::count(),
            'total_subjects' => Subject::count(),
            'total_documents' => Document::count(),
            'total_assignments' => Assignment::count(),
            'pending_submissions' => Submission::pending()->count(),
            'pending_agent_actions' => AgentAction::pending()->count(),
            'upcoming_lectures' => LectureSchedule::where('start_time', '>', now())->count(),
        ]);
    }

    /**
     * List all subjects with details.
     */
    public function subjects()
    {
        $subjects = Subject::with(['university:id,name', 'semester:id,name'])
            ->withCount('documents', 'assignments', 'enrollments')
            ->active()
            ->get();

        return response()->json($subjects);
    }

    /**
     * Get pending submissions awaiting grading, with student details and direct file URLs.
     */
    public function pendingSubmissions(Request $request)
    {
        $limit = $request->input('limit', 50);

        $submissions = Submission::pending()
            ->with([
                'user:id,name,email,student_id_no,university_id',
                'user.university:id,name',
                'assignment:id,title,max_grade,deadline,description,rubric,subject_id',
                'assignment.subject:id,title,code',
                'pendingAgentAction',
            ])
            ->latest('submitted_at')
            ->limit($limit)
            ->get();

        $data = $submissions->map(function ($sub) {
            $fileUrl = null;
            if ($sub->file_path) {
                // Generate absolute URL for file download/viewing
                $fileUrl = url('/storage/' . $sub->file_path);
            }

            return [
                'id' => $sub->id,
                'assignment' => [
                    'id' => $sub->assignment->id,
                    'title' => $sub->assignment->title,
                    'course_code' => $sub->assignment->subject?->code,
                    'course_name' => $sub->assignment->subject?->title,
                    'max_grade' => $sub->assignment->max_grade,
                    'deadline' => $sub->assignment->deadline,
                    'rubric' => $sub->assignment->rubric,
                    'description' => $sub->assignment->description,
                ],
                'student' => [
                    'id' => $sub->user->id,
                    'name' => $sub->user->name,
                    'student_id' => $sub->user->student_id_no,
                    'university' => $sub->user->university?->name,
                ],
                'file_name' => $sub->file_name,
                'file_url' => $fileUrl,
                'text_content' => $sub->text_content,
                'is_late' => $sub->is_late,
                'submitted_at' => $sub->submitted_at,
                'has_pending_agent_action' => (bool) $sub->pendingAgentAction,
                'pending_action_id' => $sub->pendingAgentAction?->id,
            ];
        });

        return response()->json([
            'total_pending' => $submissions->count(),
            'submissions' => $data,
        ]);
    }

    /**
     * Get detail of a specific submission.
     */
    public function submissionDetail(Submission $submission)
    {
        $submission->load([
            'user:id,name,email,student_id_no,university_id',
            'user.university:id,name',
            'assignment:id,title,max_grade,deadline,description,rubric,subject_id',
            'assignment.subject:id,title,code',
            'pendingAgentAction',
            'agentAction',
        ]);

        $fileUrl = $submission->file_path ? url('/storage/' . $submission->file_path) : null;

        return response()->json([
            'id' => $submission->id,
            'assignment' => $submission->assignment,
            'student' => $submission->user,
            'file_name' => $submission->file_name,
            'file_url' => $fileUrl,
            'text_content' => $submission->text_content,
            'ocr_text' => $submission->ocr_text,
            'ai_probability' => $submission->ai_probability,
            'ai_verdict' => $submission->ai_verdict,
            'is_late' => $submission->is_late,
            'status' => $submission->status,
            'grade' => $submission->grade,
            'feedback' => $submission->feedback,
            'submitted_at' => $submission->submitted_at,
            'pending_agent_action' => $submission->pendingAgentAction,
        ]);
    }

    /**
     * OpenClaw proposes a grade for a student submission.
     * Includes OCR transcribed handwriting, AI-detection score, feedback, and rubric reasoning.
     * Enqueues into agent_actions awaiting professor approval.
     */
    public function proposeGrade(Request $request, Submission $submission)
    {
        $maxGrade = $submission->assignment->max_grade ?? 100;

        $validated = $request->validate([
            'grade' => "required|integer|min:0|max:{$maxGrade}",
            'feedback' => 'required|string',
            'ocr_text' => 'nullable|string',
            'ai_probability' => 'nullable|numeric|min:0|max:100',
            'ai_verdict' => 'nullable|string|max:100',
            'reasoning' => 'nullable|string',
        ]);

        // If an existing pending action exists for this submission, update it
        $action = AgentAction::where('target_type', Submission::class)
            ->where('target_id', $submission->id)
            ->where('status', 'pending_approval')
            ->first();

        if ($action) {
            $action->update([
                'agent_id' => $request->user()->id,
                'grade' => $validated['grade'],
                'feedback' => $validated['feedback'],
                'ocr_text' => $validated['ocr_text'] ?? $action->ocr_text,
                'ai_generated_probability' => $validated['ai_probability'] ?? $action->ai_generated_probability,
                'ai_detection_verdict' => $validated['ai_verdict'] ?? $action->ai_detection_verdict,
                'reasoning' => $validated['reasoning'] ?? $action->reasoning,
            ]);
        } else {
            $action = AgentAction::create([
                'agent_id' => $request->user()->id,
                'action_type' => 'grade_submission',
                'target_type' => Submission::class,
                'target_id' => $submission->id,
                'grade' => $validated['grade'],
                'feedback' => $validated['feedback'],
                'ocr_text' => $validated['ocr_text'] ?? null,
                'ai_generated_probability' => $validated['ai_probability'] ?? null,
                'ai_detection_verdict' => $validated['ai_verdict'] ?? ($validated['ai_probability'] !== null ? ($validated['ai_probability'] > 60 ? 'Likely AI Generated' : 'Human Written') : null),
                'reasoning' => $validated['reasoning'] ?? 'Automated evaluation against assignment rubric.',
                'status' => 'pending_approval',
            ]);
        }

        ActivityLog::log('agent_grade_proposed', $submission, [
            'agent_id' => $request->user()->id,
            'action_id' => $action->id,
            'grade' => $validated['grade'],
            'ai_probability' => $validated['ai_probability'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'status' => 'pending_approval',
            'action_id' => $action->id,
            'message' => 'Grade review and OCR analysis submitted. Awaiting professor permission before applying.',
            'proposal' => [
                'submission_id' => $submission->id,
                'student_name' => $submission->user->name,
                'proposed_grade' => $validated['grade'],
                'max_grade' => $maxGrade,
                'ai_verdict' => $action->ai_detection_verdict,
                'ai_probability' => $action->ai_generated_probability,
                'has_ocr_text' => !empty($action->ocr_text),
            ],
        ], 202);
    }

    /**
     * Generic proposal endpoint: Agent proposes any portal action.
     * Enforces the human-in-the-loop permission rule.
     */
    public function proposeAction(Request $request)
    {
        $validated = $request->validate([
            'action_type' => 'required|string|max:100',
            'target_type' => 'nullable|string|max:255',
            'target_id' => 'nullable|integer',
            'payload' => 'nullable|array',
            'reasoning' => 'nullable|string',
        ]);

        $action = AgentAction::create([
            'agent_id' => $request->user()->id,
            'action_type' => $validated['action_type'],
            'target_type' => $validated['target_type'] ?? null,
            'target_id' => $validated['target_id'] ?? null,
            'payload' => $validated['payload'] ?? null,
            'reasoning' => $validated['reasoning'] ?? null,
            'status' => 'pending_approval',
        ]);

        ActivityLog::log('agent_action_proposed', $action, [
            'agent_id' => $request->user()->id,
            'action_type' => $validated['action_type'],
        ]);

        return response()->json([
            'success' => true,
            'status' => 'pending_approval',
            'action_id' => $action->id,
            'message' => "Action '{$action->action_type}' proposed. Awaiting professor permission before applying.",
        ], 202);
    }

    /**
     * List all actions currently pending professor approval.
     */
    public function pendingActions(Request $request)
    {
        $actions = AgentAction::pending()
            ->with(['agent:id,name,email'])
            ->latest()
            ->get();

        return response()->json([
            'total_pending' => $actions->count(),
            'actions' => $actions,
        ]);
    }

    /**
     * Check the status of a specific proposed action.
     */
    public function actionStatus(AgentAction $action)
    {
        $action->load(['agent:id,name', 'reviewer:id,name']);

        return response()->json([
            'id' => $action->id,
            'action_type' => $action->action_type,
            'status' => $action->status,
            'reviewed_by' => $action->reviewer?->name,
            'reviewed_at' => $action->reviewed_at,
            'rejection_reason' => $action->rejection_reason,
            'applied_at' => $action->applied_at,
        ]);
    }

    /**
     * Approve and execute a proposed agent action.
     * Can be called by professor via API, Telegram bot, or Web portal.
     */
    public function approveAction(Request $request, AgentAction $action)
    {
        $user = $request->user();

        // Must be instructor/admin or authorized reviewer
        if (! $user->isAdmin() && ! $user->isAssistant()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Only the professor can approve agent actions.',
            ], 403);
        }

        $success = $action->approve($user);

        if (! $success) {
            return response()->json([
                'success' => false,
                'message' => 'Action cannot be approved (already reviewed or invalid status).',
                'current_status' => $action->status,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "Action #{$action->id} approved and applied successfully.",
            'action_id' => $action->id,
            'status' => 'approved',
        ]);
    }

    /**
     * Reject a proposed agent action.
     */
    public function rejectAction(Request $request, AgentAction $action)
    {
        $user = $request->user();

        if (! $user->isAdmin() && ! $user->isAssistant()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Only the professor can reject agent actions.',
            ], 403);
        }

        $reason = $request->input('reason', 'Rejected by professor');
        $success = $action->reject($user, $reason);

        if (! $success) {
            return response()->json([
                'success' => false,
                'message' => 'Action cannot be rejected (already reviewed or invalid status).',
                'current_status' => $action->status,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "Action #{$action->id} rejected.",
            'action_id' => $action->id,
            'status' => 'rejected',
        ]);
    }

    /**
     * Get students who missed an assignment submission.
     */
    public function missedSubmissions(Assignment $assignment)
    {
        $submittedUserIds = $assignment->submissions()->pluck('user_id');
        $missingStudents = $assignment->subject->activeStudents()
            ->whereNotIn('users.id', $submittedUserIds)
            ->get(['users.id', 'users.name', 'users.email', 'users.student_id_no']);

        return response()->json([
            'assignment' => $assignment->title,
            'deadline' => $assignment->deadline,
            'is_overdue' => $assignment->isOverdue(),
            'total_enrolled' => $assignment->subject->activeStudents()->count(),
            'total_submitted' => $submittedUserIds->count(),
            'missing_students' => $missingStudents,
        ]);
    }

    /**
     * Get assignment statistics.
     */
    public function assignmentStats(Assignment $assignment)
    {
        $assignment->load(['submissions', 'subject:id,title']);

        return response()->json([
            'assignment' => $assignment->title,
            'subject' => $assignment->subject->title,
            'deadline' => $assignment->deadline,
            'max_grade' => $assignment->max_grade,
            'total_submissions' => $assignment->submissions->count(),
            'graded_count' => $assignment->submissions->where('status', 'graded')->count(),
            'pending_count' => $assignment->submissions->where('status', 'pending')->count(),
            'average_grade' => $assignment->average_grade,
            'highest_grade' => $assignment->submissions->where('status', 'graded')->max('grade'),
            'lowest_grade' => $assignment->submissions->where('status', 'graded')->min('grade'),
            'late_submissions' => $assignment->submissions->where('is_late', true)->count(),
            'submission_rate' => $assignment->submission_rate.'%',
        ]);
    }

    /**
     * Schedule a lecture via API.
     */
    public function scheduleLecture(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'title' => 'required|string|max:255',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $schedule = LectureSchedule::create($validated);

        return response()->json([
            'message' => 'Lecture scheduled successfully.',
            'schedule' => $schedule->toCalendarEvent(),
        ], 201);
    }

    /**
     * Get upcoming schedule.
     */
    public function upcomingSchedule(Request $request)
    {
        $days = $request->input('days', 7);

        $schedules = LectureSchedule::with('subject:id,title,color')
            ->where('start_time', '>=', now())
            ->where('start_time', '<=', now()->addDays($days))
            ->orderBy('start_time')
            ->get();

        return response()->json($schedules);
    }

    /**
     * Direct grade submission (legacy/manual direct grading).
     */
    public function gradeSubmission(Request $request, Submission $submission)
    {
        $validated = $request->validate([
            'grade' => "required|integer|min:0|max:{$submission->assignment->max_grade}",
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            'grade' => $validated['grade'],
            'feedback' => $validated['feedback'] ?? 'Graded by AI Agent',
            'status' => 'graded',
            'graded_at' => now(),
            'graded_by' => $request->user()?->id,
        ]);

        Notification::notify(
            $submission->user_id,
            'assignment_graded',
            "Assignment Graded: {$submission->assignment->title}",
            "Score: {$validated['grade']}/{$submission->assignment->max_grade}"
        );

        ActivityLog::log('submission_graded', $submission, [
            'grade' => $validated['grade'],
            'graded_by' => $request->user()?->id,
        ]);

        return response()->json([
            'message' => 'Submission graded successfully.',
            'submission_id' => $submission->id,
            'grade' => $validated['grade'],
        ]);
    }

    /**
     * Send notification via API.
     */
    public function sendNotification(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'nullable|string',
            'type' => 'string|max:100',
        ]);

        $notification = Notification::notify(
            $validated['user_id'],
            $validated['type'] ?? 'agent',
            $validated['title'],
            $validated['message'] ?? null
        );

        return response()->json([
            'message' => 'Notification sent.',
            'notification_id' => $notification->id,
        ], 201);
    }
}
