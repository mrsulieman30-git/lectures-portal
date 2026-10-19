<?php

namespace App\Http\Controllers;

use App\Models\LectureSchedule;
use App\Models\Reminder;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    /**
     * Calendar view with all lecture schedules.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = LectureSchedule::with([
            'subject' => function ($q) {
                $q->select('id', 'title', 'code', 'color', 'university_id')->with('university:id,name');
            },
            'document:id,title,file_name,file_type,is_downloadable,is_view_only,published_at',
        ]);

        // Students only see schedules for their accessible subjects (enrolled or university)
        if ($user->isStudent()) {
            $enrolledSubjectIds = $user->accessibleSubjects()->pluck('id');
            $query->whereIn('subject_id', $enrolledSubjectIds);
        }

        // Filter by date range if provided
        if ($request->filled('start') && $request->filled('end')) {
            $query->where('start_time', '>=', $request->start)
                ->where('end_time', '<=', $request->end);
        }

        $allSchedules = $query->orderBy('start_time')->get();
        $schedules = $allSchedules->map(fn ($s) => $s->toCalendarEvent());

        $upcomingLectures = $allSchedules->filter(function ($s) {
            return $s->start_time >= now()->subHours(2);
        })->values()->take(10);

        // Get subjects for filter dropdown
        if ($user->isAdmin()) {
            $subjects = Subject::active()->with('university:id,name')->get(['id', 'title', 'code', 'color', 'university_id']);
            $pendingDocuments = \App\Models\Document::whereNull('subject_id')
                ->orderBy('created_at', 'desc')
                ->get(['id', 'title', 'file_name', 'file_size', 'file_type', 'is_view_only', 'is_downloadable']);
        } else {
            $subjects = $user->accessibleSubjects()->with('university:id,name')->get(['id', 'title', 'code', 'color', 'university_id']);
            $pendingDocuments = [];
        }

        // User reminders
        $reminders = Reminder::where('user_id', $user->id)
            ->pending()
            ->orderBy('remind_at')
            ->take(20)
            ->get();

        return Inertia::render('Schedule/Index', [
            'events' => $schedules,
            'upcomingLectures' => $upcomingLectures,
            'subjects' => $subjects,
            'pendingDocuments' => $pendingDocuments,
            'reminders' => $reminders,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    /**
     * Create a new lecture schedule.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'document_id' => 'nullable|exists:documents,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'location' => 'nullable|string|max:255',
            'recurrence_rule' => 'nullable|string',
            'color' => 'nullable|string|max:7',
        ]);

        $schedule = LectureSchedule::create($validated);

        // If a document was attached from Pending Cabinet, link it to the subject and schedule its release
        if (! empty($validated['document_id'])) {
            $doc = \App\Models\Document::find($validated['document_id']);
            if ($doc) {
                $doc->update([
                    'subject_id' => $validated['subject_id'],
                    'published_at' => $validated['start_time'],
                ]);
            }
        }

        return redirect()->back()->with('message', 'Lecture scheduled successfully.');
    }

    /**
     * Update a schedule.
     */
    public function update(Request $request, LectureSchedule $schedule)
    {
        $validated = $request->validate([
            'subject_id' => 'sometimes|required|exists:subjects,id',
            'document_id' => 'nullable|exists:documents,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'location' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:7',
        ]);

        $schedule->update($validated);

        if (! empty($validated['document_id'])) {
            $doc = \App\Models\Document::find($validated['document_id']);
            if ($doc) {
                $doc->update([
                    'subject_id' => $schedule->subject_id,
                    'published_at' => $validated['start_time'],
                ]);
            }
        }

        return redirect()->back()->with('message', 'Schedule updated.');
    }

    /**
     * Delete a schedule.
     */
    public function destroy(LectureSchedule $schedule)
    {
        $schedule->delete();

        return redirect()->back()->with('message', 'Schedule deleted.');
    }

    /**
     * Create a reminder.
     */
    public function createReminder(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'remind_at' => 'required|date|after:now',
            'type' => 'string|max:50',
        ]);

        $validated['user_id'] = auth()->id();

        Reminder::create($validated);

        return redirect()->back()->with('message', 'Reminder set.');
    }

    /**
     * Delete a reminder.
     */
    public function deleteReminder(Reminder $reminder)
    {
        if ($reminder->user_id !== auth()->id()) {
            abort(403);
        }

        $reminder->delete();

        return redirect()->back()->with('message', 'Reminder deleted.');
    }

    /**
     * API endpoint for calendar events (AJAX).
     */
    public function events(Request $request)
    {
        $user = auth()->user();

        $query = LectureSchedule::with('subject:id,title,color');

        if ($user->isStudent()) {
            $enrolledSubjectIds = $user->accessibleSubjects()->pluck('id');
            $query->whereIn('subject_id', $enrolledSubjectIds);
        }

        if ($request->filled('start')) {
            $query->where('start_time', '>=', $request->start);
        }
        if ($request->filled('end')) {
            $query->where('end_time', '<=', $request->end);
        }

        return response()->json(
            $query->get()->map(fn ($s) => $s->toCalendarEvent())
        );
    }
}
