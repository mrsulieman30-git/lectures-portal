<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AgentAction;
use App\Models\Submission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgentActionController extends Controller
{
    /**
     * Display the Agent Permission & Control Hub.
     */
    public function index(Request $request): Response
    {
        $pendingActions = AgentAction::pending()
            ->with([
                'agent:id,name,email,role',
            ])
            ->latest()
            ->get()
            ->map(function ($action) {
                $targetDetails = null;
                if ($action->action_type === 'grade_submission' && $action->target_id) {
                    $submission = Submission::with([
                        'user:id,name,student_id_no,email',
                        'assignment:id,title,max_grade,deadline,subject_id',
                        'assignment.subject:id,title,code'
                    ])->find($action->target_id);

                    if ($submission) {
                        $targetDetails = [
                            'submission_id' => $submission->id,
                            'student_name' => $submission->user?->name,
                            'student_id' => $submission->user?->student_id_no,
                            'assignment_title' => $submission->assignment?->title,
                            'course_code' => $submission->assignment?->subject?->code,
                            'max_grade' => $submission->assignment?->max_grade,
                            'file_path' => $submission->file_path ? url('/storage/' . $submission->file_path) : null,
                            'file_name' => $submission->file_name,
                            'submitted_text' => $submission->text_content,
                            'submitted_at' => $submission->submitted_at,
                            'is_late' => $submission->is_late,
                        ];
                    }
                }

                $action->target_details = $targetDetails;
                return $action;
            });

        $recentHistory = AgentAction::where('status', '!=', 'pending_approval')
            ->with(['agent:id,name,email', 'reviewer:id,name'])
            ->latest('reviewed_at')
            ->take(25)
            ->get();

        $stats = [
            'pending_count' => AgentAction::pending()->count(),
            'approved_count' => AgentAction::where('status', 'approved')->count(),
            'rejected_count' => AgentAction::where('status', 'rejected')->count(),
            'ocr_count' => AgentAction::whereNotNull('ocr_text')->count(),
        ];

        return Inertia::render('Admin/AgentActions/Index', [
            'pendingActions' => $pendingActions,
            'recentHistory' => $recentHistory,
            'stats' => $stats,
        ]);
    }

    /**
     * Approve an agent proposed action and apply its changes.
     */
    public function approve(Request $request, AgentAction $action)
    {
        $success = $action->approve($request->user());

        if (! $success) {
            return back()->with('error', 'Unable to approve action (it may have already been processed).');
        }

        return back()->with('success', "Agent proposal #{$action->id} approved and applied.");
    }

    /**
     * Reject an agent proposed action.
     */
    public function reject(Request $request, AgentAction $action)
    {
        $reason = $request->input('reason', 'Rejected by professor');
        $success = $action->reject($request->user(), $reason);

        if (! $success) {
            return back()->with('error', 'Unable to reject action (it may have already been processed).');
        }

        return back()->with('info', "Agent proposal #{$action->id} rejected.");
    }

    /**
     * Batch approve all selected pending agent actions.
     */
    public function batchApprove(Request $request)
    {
        $validated = $request->validate([
            'action_ids' => 'required|array',
            'action_ids.*' => 'exists:agent_actions,id',
        ]);

        $approvedCount = 0;
        $actions = AgentAction::whereIn('id', $validated['action_ids'])->pending()->get();

        foreach ($actions as $action) {
            if ($action->approve($request->user())) {
                $approvedCount++;
            }
        }

        return back()->with('success', "{$approvedCount} agent actions approved and applied.");
    }
}
