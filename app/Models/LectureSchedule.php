<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LectureSchedule extends Model
{
    protected $fillable = [
        'subject_id',
        'document_id',
        'title',
        'description',
        'start_time',
        'end_time',
        'location',
        'recurrence_rule',
        'color',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    // ─── Relationships ─────────────────────────────────────────

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function document(): BelongsTo
    {
        return $this->belongsTo(Document::class);
    }

    // ─── Helpers ───────────────────────────────────────────────

    public function getDurationMinutesAttribute(): int
    {
        return $this->start_time->diffInMinutes($this->end_time);
    }

    public function isUpcoming(): bool
    {
        return $this->start_time->isFuture();
    }

    /**
     * Convert to FullCalendar event format.
     */
    public function toCalendarEvent(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'start' => $this->start_time->toIso8601String(),
            'end' => $this->end_time->toIso8601String(),
            'color' => $this->color ?? $this->subject->color ?? '#3B82F6',
            'extendedProps' => [
                'subject_id' => $this->subject_id,
                'subject_title' => $this->subject->title ?? '',
                'location' => $this->location,
                'description' => $this->description,
                'document_id' => $this->document_id,
                'document' => $this->document ? [
                    'id' => $this->document->id,
                    'title' => $this->document->title,
                    'file_name' => $this->document->file_name,
                    'file_type' => $this->document->file_type,
                    'is_downloadable' => $this->document->is_downloadable,
                    'is_view_only' => $this->document->is_view_only,
                ] : null,
            ],
        ];
    }
}
