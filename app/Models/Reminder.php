<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reminder extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'remind_at',
        'is_sent',
        'type',
        'remindable_type',
        'remindable_id',
    ];

    protected $casts = [
        'remind_at' => 'datetime',
        'is_sent' => 'boolean',
    ];

    // ─── Relationships ─────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the remindable model (polymorphic manual relation).
     */
    public function remindable()
    {
        if ($this->remindable_type && $this->remindable_id) {
            return $this->remindable_type::find($this->remindable_id);
        }

        return null;
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopePending($query)
    {
        return $query->where('is_sent', false);
    }

    public function scopeDue($query)
    {
        return $query->where('is_sent', false)
            ->where('remind_at', '<=', now());
    }

    // ─── Helpers ───────────────────────────────────────────────

    public function markAsSent(): void
    {
        $this->update(['is_sent' => true]);
    }
}
