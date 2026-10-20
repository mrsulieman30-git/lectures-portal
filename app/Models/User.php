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
        'semester_id',
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

    public function semesterRelation(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'semester_id');
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

        try {
            return route('user.avatar', [
                'user' => $this->id,
                'v' => substr(md5((string) $this->avatar_path . (string) ($this->updated_at?->timestamp ?? '')), 0, 8),
            ]);
        } catch (\Throwable $e) {
            return asset('storage/'.ltrim($this->avatar_path, '/'));
        }
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

    /**
     * Resolve and synchronize the semester_id based on the string semester and university_id.
     */
    public function resolveSemesterId(): ?int
    {
        if ($this->semester_id) {
            return (int) $this->semester_id;
        }

        if (empty($this->semester) || empty($this->university_id)) {
            return null;
        }

        $semStr = trim((string) $this->semester);

        $semesterModel = Semester::where('university_id', $this->university_id)
            ->where(function ($q) use ($semStr) {
                $q->whereRaw('LOWER(name) = ?', [strtolower($semStr)]);
                if (preg_match('/\d+/', $semStr, $m)) {
                    $num = (int) $m[0];
                    $q->orWhere('sort_order', $num)
                      ->orWhere('name', 'like', "%{$num}%");
                }
            })
            ->first();

        if ($semesterModel) {
            $this->semester_id = $semesterModel->id;
            $this->saveQuietly();
            return (int) $semesterModel->id;
        }

        return null;
    }

    /**
     * Determine if this user's assigned semester strictly matches the given subject's semester.
     */
    public function matchesSemesterOfSubject(Subject $subject): bool
    {
        // If subject has no semester assigned, consider it accessible
        if (! $subject->semester_id) {
            return true;
        }

        $userSemId = $this->resolveSemesterId();
        if ($userSemId && (int) $userSemId === (int) $subject->semester_id) {
            return true;
        }

        if (! empty($this->semester)) {
            $userSem = trim((string) $this->semester);
            $subjectSem = $subject->semester;
            if ($subjectSem) {
                // Exact name match (case-insensitive)
                if (strtolower($userSem) === strtolower(trim((string) $subjectSem->name))) {
                    return true;
                }

                // Match numeric component (e.g. "Semester 7" vs "7" or "Year 4 Semester 7")
                if (preg_match('/\d+/', $userSem, $mUser) && preg_match('/\d+/', (string) $subjectSem->name, $mSub)) {
                    if ((int) $mUser[0] === (int) $mSub[0]) {
                        return true;
                    }
                }

                // Match against sort_order
                if (preg_match('/\d+/', $userSem, $mUser) && $subjectSem->sort_order) {
                    if ((int) $mUser[0] === (int) $subjectSem->sort_order) {
                        return true;
                    }
                }
            }

            return false;
        }

        // If user has no semester assigned at all, check if they have an active explicit enrollment
        if (empty($this->semester) && empty($this->semester_id)) {
            return $this->enrollments()
                ->where('subject_id', $subject->id)
                ->where('status', 'active')
                ->exists();
        }

        return false;
    }

    /**
     * Check if user has RBAC access to a subject (admin, active enrollment, or matching university & semester).
     */
    public function canAccessSubject(Subject|int|null $subject): bool
    {
        if (! $subject) {
            return false;
        }

        if ($this->isAdmin()) {
            return true;
        }

        $subjectId = $subject instanceof Subject ? $subject->id : $subject;
        $subjectModel = $subject instanceof Subject ? $subject : Subject::with('semester')->find($subjectId);

        if (! $subjectModel) {
            return false;
        }

        $matchesUniversity = $this->university_id && $subjectModel->university_id && (int) $this->university_id === (int) $subjectModel->university_id;

        // If the subject belongs to the user's university, strictly require matching semester!
        if ($matchesUniversity) {
            return $this->matchesSemesterOfSubject($subjectModel);
        }

        // If from another university or unassigned, require explicit active enrollment
        return $this->enrollments()
            ->where('subject_id', $subjectId)
            ->where('status', 'active')
            ->exists();
    }

    /**
     * Query of subjects accessible to this user strictly isolated to their university & semester.
     */
    public function accessibleSubjects()
    {
        if ($this->isAdmin()) {
            return Subject::query();
        }

        $semId = $this->resolveSemesterId();
        $userSem = trim((string) $this->semester);

        return Subject::active()
            ->where(function ($query) use ($semId, $userSem) {
                if ($this->university_id) {
                    $query->where('university_id', $this->university_id)
                        ->where(function ($semQuery) use ($semId, $userSem) {
                            if ($semId) {
                                $semQuery->where('semester_id', $semId);
                            } elseif (! empty($userSem)) {
                                $semQuery->whereHas('semester', function ($q) use ($userSem) {
                                    $q->whereRaw('LOWER(name) = ?', [strtolower($userSem)]);
                                    if (preg_match('/\d+/', $userSem, $m)) {
                                        $num = (int) $m[0];
                                        $q->orWhere('sort_order', $num)
                                          ->orWhere('name', 'like', "%{$num}%");
                                    }
                                });
                            } else {
                                $semQuery->whereHas('enrollments', function ($eq) {
                                    $eq->where('user_id', $this->id)
                                       ->where('status', 'active');
                                });
                            }
                        });
                } else {
                    $query->whereHas('enrollments', function ($eq) {
                        $eq->where('user_id', $this->id)
                           ->where('status', 'active');
                    });
                }
            });
    }

    /**
     * Auto-enroll student strictly into active subjects of their assigned university and semester.
     * Prunes any outdated enrollments from different semesters in the same university.
     */
    public function autoEnrollUniversitySubjects(): int
    {
        if (! $this->university_id) {
            return 0;
        }

        $this->resolveSemesterId();

        if (! $this->semester_id && empty($this->semester)) {
            return 0;
        }

        $allUniSubjects = Subject::where('university_id', $this->university_id)
            ->active()
            ->with('semester')
            ->get();

        $validSubjectIds = [];
        $invalidSubjectIds = [];

        foreach ($allUniSubjects as $sub) {
            if ($this->matchesSemesterOfSubject($sub)) {
                $validSubjectIds[] = $sub->id;
            } else {
                $invalidSubjectIds[] = $sub->id;
            }
        }

        // Clean up any cross-semester enrollments for this university
        if (! empty($invalidSubjectIds)) {
            Enrollment::where('user_id', $this->id)
                ->whereIn('subject_id', $invalidSubjectIds)
                ->delete();
        }

        $enrolledCount = 0;
        foreach ($validSubjectIds as $subjectId) {
            $enrollment = Enrollment::firstOrCreate([
                'user_id' => $this->id,
                'subject_id' => $subjectId,
            ], [
                'status' => 'active',
                'enrolled_at' => now(),
            ]);

            if ($enrollment->wasRecentlyCreated) {
                $enrolledCount++;
            }
        }

        return $enrolledCount;
    }
}

