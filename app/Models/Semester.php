<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Semester extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'university_id',
        'start_date',
        'end_date',
        'is_active',
        'sort_order',
        'auto_promote',
        'next_semester_id',
        'promoted_at',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_active' => 'boolean',
        'auto_promote' => 'boolean',
        'promoted_at' => 'datetime',
    ];

    // ─── Relationships ─────────────────────────────────────────

    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    public function nextSemester(): BelongsTo
    {
        return $this->belongsTo(Semester::class, 'next_semester_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class, 'semester_id');
    }

    // ─── Scopes ────────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCurrent($query)
    {
        return $query->where('start_date', '<=', now())
            ->where('end_date', '>=', now());
    }

    public function scopeDueForPromotion($query)
    {
        return $query->where('auto_promote', true)
            ->whereNotNull('end_date')
            ->where('end_date', '<=', now()->toDateString())
            ->whereNull('promoted_at');
    }

    // ─── Progression & Next Semester Logic ─────────────────────

    /**
     * Resolve the next consecutive semester in this university's academic sequence.
     */
    public function resolveNextSemester(): ?Semester
    {
        if ($this->next_semester_id) {
            $explicit = Semester::where('university_id', $this->university_id)->find($this->next_semester_id);
            if ($explicit) {
                return $explicit;
            }
        }

        // 1. Match by sort_order
        if ($this->sort_order > 0) {
            $next = Semester::where('university_id', $this->university_id)
                ->where('id', '!=', $this->id)
                ->where('sort_order', '>', $this->sort_order)
                ->orderBy('sort_order', 'asc')
                ->first();

            if ($next) {
                return $next;
            }
        }

        // 2. Match by extracted number (e.g. Semester 3 -> 4, Semester 5 -> 6, Semester 7 -> 8)
        if (preg_match('/\d+/', $this->name, $matches)) {
            $currentNum = (int) $matches[0];
            $targetNum = $currentNum + 1;

            $next = Semester::where('university_id', $this->university_id)
                ->where('id', '!=', $this->id)
                ->where(function ($q) use ($targetNum) {
                    $q->where('sort_order', $targetNum)
                      ->orWhere('name', 'like', "%{$targetNum}%");
                })
                ->first();

            if ($next) {
                return $next;
            }
        }

        return null;
    }

    /**
     * Upgrade / shift students in this semester to the next academic semester in the curriculum.
     */
    public function promoteStudents(bool $force = false): int
    {
        if ($this->promoted_at && ! $force) {
            return 0;
        }

        $nextSemester = $this->resolveNextSemester();
        if (! $nextSemester) {
            return 0; // Final semester reached
        }

        // Query all approved students currently in this semester
        $students = User::where('role', 'student')
            ->where('status', 'approved')
            ->where('university_id', $this->university_id)
            ->where(function ($q) {
                $q->where('semester_id', $this->id)
                  ->orWhere('semester', $this->name);
            })
            ->get();

        $promotedCount = 0;

        foreach ($students as $student) {
            $oldSemName = $student->semester;
            $student->semester_id = $nextSemester->id;
            $student->semester = $nextSemester->name;

            // Auto-advance academic year if semester number is known
            if (preg_match('/\d+/', $nextSemester->name, $m)) {
                $num = (int) $m[0];
                if ($num <= 2) {
                    $student->year = 'Year 1';
                } elseif ($num <= 4) {
                    $student->year = 'Year 2';
                } elseif ($num <= 6) {
                    $student->year = 'Year 3';
                } else {
                    $student->year = 'Year 4';
                }
            }

            $student->save();

            // Auto-enroll into new semester subjects and prune previous semester enrollments
            $student->autoEnrollUniversitySubjects();

            // Send in-app notification
            Notification::notify(
                $student->id,
                'semester_promoted',
                "Academic Promotion: {$nextSemester->name}",
                "You have been successfully upgraded from {$oldSemName} to {$nextSemester->name}. Your course cabinets and laboratory schedules have been automatically updated.",
                route('dashboard')
            );

            ActivityLog::log('student_promoted', $student, [
                'from_semester' => $this->name,
                'to_semester' => $nextSemester->name,
            ]);

            $promotedCount++;
        }

        $this->promoted_at = now();
        $this->is_active = false;
        $this->saveQuietly();

        // Ensure next semester is marked active
        $nextSemester->is_active = true;
        $nextSemester->saveQuietly();

        ActivityLog::log('semester_promoted_all', $this, [
            'promoted_count' => $promotedCount,
            'next_semester' => $nextSemester->name,
        ]);

        return $promotedCount;
    }

    /**
     * Scan and automatically promote students in all ended semesters.
     */
    public static function checkAndPromoteEndedSemesters(): array
    {
        $dueSemesters = self::dueForPromotion()->with('university')->get();
        $results = [];

        foreach ($dueSemesters as $sem) {
            $count = $sem->promoteStudents();
            $results[] = [
                'semester_id' => $sem->id,
                'semester_name' => $sem->name,
                'university' => $sem->university?->name,
                'students_promoted' => $count,
            ];
        }

        return $results;
    }
}
