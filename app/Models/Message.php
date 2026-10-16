<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'subject_id',
        'user_id',
        'content',
        'attachment_path',
        'attachment_name',
        'is_announcement',
        'is_pinned',
    ];

    protected $casts = [
        'is_announcement' => 'boolean',
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

    public function scopeAnnouncements($query)
    {
        return $query->where('is_announcement', true);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }
}
