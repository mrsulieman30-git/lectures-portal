<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Subject extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'code',
        'description',
        'guidelines',
        'university_id',
        'semester_id',
        'original_subject_id',
        'color',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ─── Relationships ─────────────────────────────────────────

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function originalSubject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'original_subject_id');
    }

    public function sharedInstances(): HasMany
    {
        return $this->hasMany(Subject::class, 'original_subject_id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class)->orderBy('sort_order');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class)->orderBy('deadline');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot('status', 'enrolled_at')
            ->withTimestamps();
    }

    public function activeStudents(): BelongsToMany
    {
        return $this->students()->wherePivot('status', 'active');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'desc');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(SubjectUpdate::class)->orderBy('created_at', 'desc');
    }

    public function lectureSchedules(): HasMany
    {
        return $this->hasMany(LectureSchedule::class);
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForUniversity($query, $universityId)
    {
        return $query->where('university_id', $universityId);
    }

    // ─── Helpers ───────────────────────────────────────────────

    public function getStudentCountAttribute(): int
    {
        return $this->activeStudents()->count();
    }

    public function getDocumentCountAttribute(): int
    {
        return $this->documents()->count();
    }
}
