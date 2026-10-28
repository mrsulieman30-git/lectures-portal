<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Assignment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'subject_id',
        'deadline',
        'max_grade',
        'allow_late',
        'late_penalty_percent',
        'allow_resubmit',
        'rubric',
        'attachment_path',
        'is_published',
    ];

    protected $casts = [
        'deadline' => 'datetime',
        'allow_late' => 'boolean',
        'allow_resubmit' => 'boolean',
        'is_published' => 'boolean',
    ];

    protected $appends = [
        'attachment_url',
    ];

    // ─── Relationships ─────────────────────────────────────────

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('deadline', '>', now());
    }

    public function scopePast($query)
    {
        return $query->where('deadline', '<=', now());
    }

    // ─── Helpers ───────────────────────────────────────────────

    public function isOverdue(): bool
    {
        return $this->deadline->isPast();
    }

    public function getSubmissionCountAttribute(): int
    {
        return $this->submissions()->count();
    }

    public function getGradedCountAttribute(): int
    {
        return $this->submissions()->where('status', 'graded')->count();
    }

    public function getAverageGradeAttribute(): ?float
    {
        $avg = $this->submissions()->where('status', 'graded')->avg('grade');

        return $avg ? round($avg, 1) : null;
    }

    public function getSubmissionRateAttribute(): float
    {
        $enrolledCount = $this->subject->activeStudents()->count();
        if ($enrolledCount === 0) {
            return 0;
        }

        return round(($this->submission_count / $enrolledCount) * 100, 1);
    }

    public function getAttachmentUrlAttribute(): ?string
    {
        if ($this->attachment_path && $this->id) {
            return route('assignments.attachment', $this->id);
        }

        return null;
    }
}
