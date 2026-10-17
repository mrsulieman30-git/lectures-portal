<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'gender',
        'status',
        'university_id',
        'student_id_no',
        'semester',
        'year',
        'avatar_path',
        'phone',
        'bio',
        'registration_ip_address',
        'last_login_at',
        'last_login_ip',
        'pending_name',
        'registered_device_token',
        'registered_device_name',
        'registered_device_ip',
        'registered_device_at',
        'pending_device_token',
        'pending_device_name',
        'pending_device_ip',
        'pending_device_reason',
        'pending_device_requested_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     */
    protected $appends = [
        'avatar_url',
        'initials',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'registered_device_at' => 'datetime',
            'pending_device_requested_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ─── Relationships ─────────────────────────────────────────

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'enrollments')
            ->withPivot('status', 'enrolled_at')
            ->withTimestamps();
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(Reminder::class);
    }

    public function downloadLogs(): HasMany
    {
        return $this->hasMany(DownloadLog::class);
    }

    public function studentNotes(): HasMany
    {
        return $this->hasMany(StudentNote::class);
    }

    public function agentActions(): HasMany
    {
        return $this->hasMany(AgentAction::class, 'agent_id');
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeStudents($query)
    {
        return $query->where('role', 'student');
    }

    public function scopeAssistants($query)
    {
        return $query->where('role', 'assistant');
    }

    public function scopeUniversityAccounts($query)
    {
        return $query->where('role', 'university');
    }

    // ─── Helpers ───────────────────────────────────────────────

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isFemale(): bool
    {
        return strtolower($this->gender ?? 'male') === 'female';
    }

    public function isMale(): bool
    {
        return ! $this->isFemale();
    }

    public function isAssistant(): bool
    {
        return $this->role === 'assistant';
    }

    public function isTeachingAssistant(): bool
    {
        return $this->role === 'assistant';
    }

    public function isAdminOrAssistant(): bool
    {
        return in_array($this->role, ['admin', 'assistant'], true);
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isUniversity(): bool
    {
        return $this->role === 'university';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function hasRegisteredDevice(): bool
    {
        return ! empty($this->registered_device_token);
    }

    public function hasPendingDeviceRequest(): bool
    {
        return ! empty($this->pending_device_token);
    }

    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar_path) {
            return null;
        }

        if (str_starts_with($this->avatar_path, 'http://') || str_starts_with($this->avatar_path, 'https://')) {
            return $this->avatar_path;
        }

        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($this->avatar_path)) {
            return asset('storage/'.$this->avatar_path);
        }

        return null;
    }

    public function getInitialsAttribute(): string
    {
        $words = explode(' ', $this->name);
        $initials = '';
        foreach (array_slice($words, 0, 2) as $word) {
            $initials .= mb_strtoupper(mb_substr($word, 0, 1));
        }

        return $initials;
    }
}
