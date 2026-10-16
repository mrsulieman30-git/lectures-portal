<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AgentAction extends Model
{
    use HasFactory;

    protected $fillable = [
        'agent_id',
        'action_type',
        'target_type',
        'target_id',
        'grade',
        'feedback',
        'ocr_text',
        'ai_generated_probability',
        'ai_detection_verdict',
        'reasoning',
        'payload',
        'status',
        'reviewed_by',
        'reviewed_at',
        'applied_at',
        'rejection_reason',
    ];

    protected $casts = [
        'payload' => 'array',
        'grade' => 'integer',
        'ai_generated_probability' => 'float',
        'reviewed_at' => 'datetime',
        'applied_at' => 'datetime',
    ];

    // ─── Relationships ─────────────────────────────────────────

    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function target(): MorphTo
    {
        return $this->morphTo();
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', 'pending_approval');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    // ─── Execution Methods ─────────────────────────────────────

    /**
     * Approve and execute the proposed action.
     */
    public function approve(User $reviewer): bool
    {
        if ($this->status !== 'pending_approval') {
            return false;
        }

        if ($this->action_type === 'grade_submission') {
            $submission = Submission::find($this->target_id);
            if ($submission) {
                $submission->update([
                    'grade' => $this->grade,
                    'feedback' => $this->feedback,
                    'ocr_text' => $this->ocr_text,
                    'ai_probability' => $this->ai_generated_probability,
                    'ai_verdict' => $this->ai_detection_verdict,
                    'status' => 'graded',
                    'graded_at' => now(),
                    'graded_by' => $reviewer->id,
                    'agent_action_id' => $this->id,
                ]);

                // Notify student
                Notification::notify(
                    $submission->user_id,
                    'assignment_graded',
                    "Assignment Graded: {$submission->assignment->title}",
                    "Score: {$this->grade}/{$submission->assignment->max_grade} (Reviewed by Professor & AI Agent)"
                );

                ActivityLog::log('agent_grade_approved', $submission, [
                    'agent_id' => $this->agent_id,
                    'approved_by' => $reviewer->id,
                    'grade' => $this->grade,
                    'ai_probability' => $this->ai_generated_probability,
                ]);
            }
        } elseif ($this->action_type === 'schedule_lecture' && !empty($this->payload)) {
            $schedule = LectureSchedule::create($this->payload);
            ActivityLog::log('agent_schedule_approved', $schedule, [
                'agent_id' => $this->agent_id,
                'approved_by' => $reviewer->id,
            ]);
        }

        $this->update([
            'status' => 'approved',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'applied_at' => now(),
        ]);

        return true;
    }

    /**
     * Reject the proposed action.
     */
    public function reject(User $reviewer, ?string $reason = null): bool
    {
        if ($this->status !== 'pending_approval') {
            return false;
        }

        $this->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'rejection_reason' => $reason ?? 'Rejected by professor',
        ]);

        ActivityLog::log('agent_action_rejected', $this, [
            'agent_id' => $this->agent_id,
            'rejected_by' => $reviewer->id,
            'reason' => $reason,
        ]);

        return true;
    }
}
