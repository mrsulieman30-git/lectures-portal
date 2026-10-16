<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Submission extends Model
{
    protected $fillable = [
        'assignment_id',
        'user_id',
        'file_path',
        'file_name',
        'text_content',
        'ocr_text',
        'ai_probability',
        'ai_verdict',
        'grade',
        'feedback',
        'status',
        'is_late',
        'submitted_at',
        'graded_at',
        'graded_by',
        'agent_action_id',
    ];

    protected $casts = [
        'is_late' => 'boolean',
        'submitted_at' => 'datetime',
        'graded_at' => 'datetime',
        'grade' => 'integer',
        'ai_probability' => 'float',
    ];

    // ─── Relationships ─────────────────────────────────────────

    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    public function agentAction(): BelongsTo
    {
        return $this->belongsTo(AgentAction::class, 'agent_action_id');
    }

    public function pendingAgentAction()
    {
        return $this->hasOne(AgentAction::class, 'target_id')
            ->where('target_type', static::class)
            ->where('status', 'pending_approval')
            ->latestOfMany();
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeGraded($query)
    {
        return $query->where('status', 'graded');
    }

    // ─── Helpers ───────────────────────────────────────────────

    public function isGraded(): bool
    {
        return $this->status === 'graded';
    }

    public function getGradePercentageAttribute(): ?float
    {
        if (! $this->grade || ! $this->assignment) {
            return null;
        }

        return round(($this->grade / $this->assignment->max_grade) * 100, 1);
    }

    public function getFileUrlAttribute(): ?string
    {
        if ($this->file_path) {
            return asset('storage/'.$this->file_path);
        }

        return null;
    }
}
