<?php

namespace App\Http\Controllers;

use App\Models\StudentNote;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NoteController extends Controller
{
    /**
     * Display a listing of the student's notes.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = StudentNote::with('subject:id,title,code,color')
            ->where('user_id', $user->id);

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $notes = $query->orderByDesc('is_pinned')
            ->orderByDesc('updated_at')
            ->get();

        // Subjects available to the user for tagging notes
        if ($user->isAdmin()) {
            $subjects = Subject::active()->get(['id', 'title', 'color']);
        } else {
            $enrolledIds = $user->enrollments()->active()->pluck('subject_id');
            $subjects = Subject::whereIn('id', $enrolledIds)->get(['id', 'title', 'color']);
        }

        return Inertia::render('Notes/Index', [
            'notes' => $notes,
            'subjects' => $subjects,
            'filters' => $request->only(['search', 'subject_id']),
        ]);
    }

    /**
     * Store a newly created note.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'subject_id' => 'nullable|exists:subjects,id',
            'color' => 'nullable|string|max:30',
            'is_pinned' => 'boolean',
            'tags' => 'nullable|string|max:255',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['color'] = $validated['color'] ?? '#FF5E36';

        $note = StudentNote::create($validated);

        if ($request->wantsJson()) {
            return response()->json($note->load('subject:id,title,color'));
        }

        return redirect()->back()->with('message', 'Note saved successfully.');
    }

    /**
     * Update the specified note.
     */
    public function update(Request $request, StudentNote $note)
    {
        if ($note->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'subject_id' => 'nullable|exists:subjects,id',
            'color' => 'nullable|string|max:30',
            'is_pinned' => 'boolean',
            'tags' => 'nullable|string|max:255',
        ]);

        $note->update($validated);

        if ($request->wantsJson()) {
            return response()->json($note->load('subject:id,title,color'));
        }

        return redirect()->back()->with('message', 'Note updated successfully.');
    }

    /**
     * Toggle pinned status.
     */
    public function togglePin(StudentNote $note)
    {
        if ($note->user_id !== auth()->id()) {
            abort(403);
        }

        $note->update(['is_pinned' => ! $note->is_pinned]);

        return redirect()->back()->with('message', $note->is_pinned ? 'Note pinned.' : 'Note unpinned.');
    }

    /**
     * Remove the specified note.
     */
    public function destroy(StudentNote $note)
    {
        if ($note->user_id !== auth()->id()) {
            abort(403);
        }

        $note->delete();

        return redirect()->back()->with('message', 'Note deleted successfully.');
    }
}
