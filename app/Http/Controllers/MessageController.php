<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Message;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    /**
     * Get available chat channels & contacts for the logged-in user.
     * Includes Dr. Mohammad Sulieman (Professor), enrolled subject channels, and classmates.
     */
    public function channels(): JsonResponse
    {
        $user = auth()->user();

        // 1. Dr. Mohammad Sulieman (Admin / Professor)
        $professor = User::where('role', 'admin')->first(['id', 'name', 'avatar_path', 'role']);

        // 2. Class / Subject channels the user has access to
        if ($user->isAdmin()) {
            $subjects = Subject::where('is_active', true)->get(['id', 'title', 'code', 'color']);
            
            // List students who have messaged or are enrolled
            $recentSenderIds = Message::where('recipient_id', $user->id)
                ->orWhere('user_id', $user->id)
                ->whereNotNull('recipient_id')
                ->pluck('user_id')
                ->merge(Message::where('recipient_id', $user->id)->pluck('user_id'))
                ->unique()
                ->reject(fn ($id) => $id == $user->id);

            $students = User::whereIn('id', $recentSenderIds)
                ->orWhere('role', 'student')
                ->limit(20)
                ->get(['id', 'name', 'email', 'avatar_path', 'student_id_no']);
        } else {
            // Student's enrolled subjects
            $enrolledSubjectIds = Enrollment::where('user_id', $user->id)
                ->where('status', 'active')
                ->pluck('subject_id');

            $subjects = Subject::whereIn('id', $enrolledSubjectIds)
                ->where('is_active', true)
                ->get(['id', 'title', 'code', 'color']);

            // Classmates from the same subjects
            $classmateIds = Enrollment::whereIn('subject_id', $enrolledSubjectIds)
                ->where('status', 'active')
                ->where('user_id', '!=', $user->id)
                ->pluck('user_id')
                ->unique();

            $students = User::whereIn('id', $classmateIds)
                ->get(['id', 'name', 'email', 'avatar_path', 'student_id_no']);
        }

        // Calculate unread counts per channel / sender
        $unreadCounts = Message::where('recipient_id', $user->id)
            ->where('is_read', false)
            ->selectRaw('user_id, count(*) as count')
            ->groupBy('user_id')
            ->pluck('count', 'user_id');

        return response()->json([
            'professor' => $user->isAdmin() ? null : $professor,
            'subjects' => $subjects,
            'classmates' => $students,
            'unread_counts' => $unreadCounts,
        ]);
    }

    /**
     * Get chat thread messages (either class channel or direct message).
     */
    public function getThread(Request $request): JsonResponse
    {
        $user = auth()->user();
        $type = $request->query('type', 'subject'); // 'subject' or 'direct'
        $targetId = $request->query('target_id');

        if (! $targetId) {
            return response()->json(['messages' => []]);
        }

        if ($type === 'direct') {
            // Direct messages between current user and target user
            $messages = Message::where(function ($q) use ($user, $targetId) {
                $q->where('user_id', $user->id)->where('recipient_id', $targetId);
            })->orWhere(function ($q) use ($user, $targetId) {
                $q->where('user_id', $targetId)->where('recipient_id', $user->id);
            })
            ->with('user:id,name,avatar_path,role')
            ->orderBy('created_at', 'asc')
            ->take(80)
            ->get();

            // Mark incoming messages as read
            Message::where('recipient_id', $user->id)
                ->where('user_id', $targetId)
                ->where('is_read', false)
                ->update(['is_read' => true]);

        } else {
            // Subject / Class Room channel
            $subject = Subject::findOrFail($targetId);

            // Verify access
            if (! $user->isAdmin()) {
                $isEnrolled = Enrollment::where('user_id', $user->id)
                    ->where('subject_id', $subject->id)
                    ->where('status', 'active')
                    ->exists();

                if (! $isEnrolled) {
                    abort(403, 'Not enrolled in this subject room.');
                }
            }

            $messages = Message::where('subject_id', $subject->id)
                ->whereNull('recipient_id')
                ->with('user:id,name,avatar_path,role')
                ->orderBy('created_at', 'asc')
                ->take(80)
                ->get();
        }

        // Format and append attachment full URL
        $formatted = $messages->map(function ($m) {
            return [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'recipient_id' => $m->recipient_id,
                'subject_id' => $m->subject_id,
                'content' => $m->content,
                'attachment_url' => $m->attachment_path ? Storage::disk('public')->url($m->attachment_path) : null,
                'attachment_name' => $m->attachment_name,
                'is_announcement' => (bool) $m->is_announcement,
                'is_pinned' => (bool) $m->is_pinned,
                'created_at' => $m->created_at->format('H:i • M d'),
                'user' => [
                    'id' => $m->user->id,
                    'name' => $m->user->name,
                    'role' => $m->user->role,
                ],
            ];
        });

        return response()->json(['messages' => $formatted]);
    }

    /**
     * Send a message with text, strict link safety, or image attachment.
     */
    public function send(Request $request): JsonResponse
    {
        $user = auth()->user();

        $request->validate([
            'type' => 'required|in:subject,direct',
            'target_id' => 'required|integer',
            'content' => 'nullable|string|max:4000',
            'attachment' => 'nullable|image|mimes:jpeg,png,jpg,webp,gif|max:5120', // max 5MB image
        ]);

        $content = trim($request->input('content', ''));

        if (empty($content) && ! $request->hasFile('attachment')) {
            return response()->json(['error' => 'Message or image is required.'], 422);
        }

        // Strict Link Safety: Sanitize illegal schemes like javascript: or data:
        if (! empty($content)) {
            $content = preg_replace('/javascript:/i', 'unsafe-link:', $content);
        }

        $data = [
            'user_id' => $user->id,
            'content' => $content,
            'is_read' => false,
        ];

        if ($request->type === 'direct') {
            $data['recipient_id'] = $request->target_id;
            $data['subject_id'] = null;
        } else {
            $data['subject_id'] = $request->target_id;
            $data['recipient_id'] = null;
        }

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('chat_attachments', 'public');
            $data['attachment_path'] = $path;
            $data['attachment_name'] = $file->getClientOriginalName();
        }

        $message = Message::create($data);
        $message->load('user:id,name,avatar_path,role');

        return response()->json([
            'id' => $message->id,
            'user_id' => $message->user_id,
            'recipient_id' => $message->recipient_id,
            'subject_id' => $message->subject_id,
            'content' => $message->content,
            'attachment_url' => $message->attachment_path ? Storage::disk('public')->url($message->attachment_path) : null,
            'attachment_name' => $message->attachment_name,
            'created_at' => $message->created_at->format('H:i • M d'),
            'user' => [
                'id' => $message->user->id,
                'name' => $message->user->name,
                'role' => $message->user->role,
            ],
        ], 201);
    }

    /**
     * Get global unread message count for the current user.
     */
    public function unreadCount(): JsonResponse
    {
        $user = auth()->user();

        $count = Message::where('recipient_id', $user->id)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }
}
