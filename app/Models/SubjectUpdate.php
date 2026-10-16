<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubjectUpdate extends Model
{
    protected $fillable = [
        'subject_id',
        'user_id',
        'title',
        'content',
        'is_highlighted',
        'is_pinned',
    ];

    protected $casts = [
        'is_highlighted' => 'boolean',
        'is_pinned' => 'boolean',
    ];

    // ─── Relationships ─────────────────────────────────────────

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeHighlighted($query)
    {
        return $query->where('is_highlighted', true);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }
}
