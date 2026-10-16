<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\Subject;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Get messages for a subject.
     */
    public function index(Subject $subject)
    {
        $user = auth()->user();

        // Check access
        if (! $user->isAdmin()) {
            $isEnrolled = $subject->enrollments()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->exists();

            if (! $isEnrolled) {
                abort(403, 'You are not enrolled in this subject.');
            }
        }

        $messages = Message::where('subject_id', $subject->id)
            ->with('user:id,name,avatar_path,role')
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($messages);
    }

    /**
     * Send a message in a subject.
     */
    public function store(Request $request, Subject $subject)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'content' => 'required|string|max:5000',
            'attachment' => 'nullable|file|max:5120',
            'is_announcement' => 'boolean',
        ]);

        $data = [
            'subject_id' => $subject->id,
            'user_id' => $user->id,
            'content' => $validated['content'],
            'is_announcement' => $user->isAdmin() ? ($validated['is_announcement'] ?? false) : false,
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $data['attachment_path'] = $file->store("messages/{$subject->id}", 'public');
            $data['attachment_name'] = $file->getClientOriginalName();
        }

        $message = Message::create($data);
        $message->load('user:id,name,avatar_path,role');

        return response()->json($message, 201);
    }

    /**
     * Pin/unpin a message (admin only).
     */
    public function togglePin(Message $message)
    {
        $message->update(['is_pinned' => ! $message->is_pinned]);

        return response()->json(['pinned' => $message->is_pinned]);
    }

    /**
     * Delete a message.
     */
    public function destroy(Message $message)
    {
        $user = auth()->user();

        if ($message->user_id !== $user->id && ! $user->isAdmin()) {
            abort(403);
        }

        $message->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
