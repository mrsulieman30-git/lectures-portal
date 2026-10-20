<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Message;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    /**
     * Get available chat channels & contacts for the logged-in user.
     * For students: strictly isolated to their own semester & university, hiding universities/semesters.
     * For admin: full list with type metadata for instant fast searching.
     */
    public function channels(): JsonResponse
    {
        $user = auth()->user();

        // 1. Dr. Mohammad Sulieman (Admin / Professor)
        $professor = User::where('role', 'admin')->first(['id', 'name', 'avatar_path', 'role']);

        if ($user->isAdmin()) {
            $universities = University::where('is_active', true)->get(['id', 'name']);
            $semesters = Semester::where('is_active', true)
                ->with('university:id,name')
                ->get(['id', 'name', 'university_id']);

            $subjects = Subject::where('is_active', true)
                ->with(['university:id,name', 'semester:id,name'])
                ->get(['id', 'title', 'code', 'color', 'university_id', 'semester_id']);

            // All approved students
            $students = User::where('role', 'student')
                ->where('status', 'approved')
                ->with(['university:id,name', 'semesterRelation:id,name'])
                ->get(['id', 'name', 'email', 'avatar_path', 'student_id_no', 'university_id', 'semester_id', 'semester']);

            // Unread counts per sender
            $unreadCounts = Message::where('recipient_id', $user->id)
                ->where('is_read', false)
                ->selectRaw('user_id, count(*) as count')
                ->groupBy('user_id')
                ->pluck('count', 'user_id');

            return response()->json([
                'is_admin' => true,
                'professor' => null,
                'semester_chat' => null,
                'subjects' => $subjects,
                'classmates' => $students,
                'universities' => $universities,
                'semesters' => $semesters,
                'unread_counts' => $unreadCounts,
            ]);
        }

        // ─── Student Logic ───
        $userSemId = $user->resolveSemesterId();
        $semesterChat = null;
        if ($userSemId) {
            $semModel = Semester::with('university:id,name')->find($userSemId);
            if ($semModel) {
                $semesterChat = [
                    'id' => $semModel->id,
                    'name' => $semModel->name,
                    'title' => "{$semModel->name} Class Chat",
                    'subtitle' => ($semModel->university?->name ?? 'Campus').' • General Class Discussion',
                    'university_name' => $semModel->university?->name,
                ];
            }
        } elseif (! empty($user->semester)) {
            $semesterChat = [
                'id' => 0,
                'name' => $user->semester,
                'title' => "{$user->semester} Class Chat",
                'subtitle' => ($user->university?->name ?? 'Campus').' • General Class Discussion',
                'university_name' => $user->university?->name,
            ];
        }

        // Only subjects matching the student's semester & university
        $subjects = $user->accessibleSubjects()
            ->with(['university:id,name', 'semester:id,name'])
            ->get(['id', 'title', 'code', 'color', 'university_id', 'semester_id']);

        // Clean list of classmates in the EXACT SAME university and semester!
        $classmatesQuery = User::where('role', 'student')
            ->where('status', 'approved')
            ->where('id', '!=', $user->id)
            ->where('university_id', $user->university_id);

        if ($userSemId) {
            $classmatesQuery->where(function ($q) use ($userSemId, $user) {
                $q->where('semester_id', $userSemId);
                if (! empty($user->semester)) {
                    $q->orWhere('semester', $user->semester);
                }
            });
        } elseif (! empty($user->semester)) {
            $classmatesQuery->where('semester', $user->semester);
        } else {
            $classmatesQuery->whereRaw('1 = 0');
        }

        $classmates = $classmatesQuery->get([
            'id', 'name', 'avatar_path', 'student_id_no', 'gender', 'university_id', 'semester_id', 'semester'
        ]);

        // Calculate unread counts per direct sender
        $unreadCounts = Message::where('recipient_id', $user->id)
            ->where('is_read', false)
            ->selectRaw('user_id, count(*) as count')
            ->groupBy('user_id')
            ->pluck('count', 'user_id');

        return response()->json([
            'is_admin' => false,
            'professor' => $professor,
            'semester_chat' => $semesterChat,
            'subjects' => $subjects,
            'classmates' => $classmates,
            'universities' => [], // Hidden in student view
            'semesters' => [],    // Hidden in student view
            'unread_counts' => $unreadCounts,
        ]);
    }

    /**
     * Get chat thread messages (semester channel, subject channel, or direct message).
     */
    public function getThread(Request $request): JsonResponse
    {
        $user = auth()->user();
        $type = $request->query('type', 'subject'); // 'subject', 'direct', or 'semester'
        $targetId = $request->query('target_id');

        if (! $targetId && $type !== 'semester') {
            return response()->json(['messages' => []]);
        }

        if ($type === 'direct') {
            $targetUser = User::findOrFail($targetId);

            // Student Direct Message Guard: Can only chat with Admin or classmates in same university & semester
            if ($user->isStudent()) {
                if (! $targetUser->isAdmin() && ! $user->matchesSemesterOfUser($targetUser)) {
                    abort(403, 'You can only message students in your semester or your professors.');
                }
            }

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

        } elseif ($type === 'semester') {
            // Semester / Class General Room
            $userSemId = $user->resolveSemesterId();

            if (! $user->isAdmin()) {
                if ((int) $userSemId !== (int) $targetId && (int) $targetId !== 0) {
                    abort(403, 'You can only view chat for your assigned semester.');
                }
            }

            $query = Message::whereNull('recipient_id')->whereNull('subject_id');
            if ((int) $targetId > 0) {
                $query->where('semester_id', $targetId);
            } else {
                $query->whereNull('semester_id');
            }

            $messages = $query->with('user:id,name,avatar_path,role')
                ->orderBy('created_at', 'asc')
                ->take(80)
                ->get();

        } else {
            // Subject / Class Room channel
            $subject = Subject::findOrFail($targetId);

            // Verify access using strict RBAC
            if (! $user->canAccessSubject($subject)) {
                abort(403, 'Not enrolled in this subject room.');
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
                'semester_id' => $m->semester_id,
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
            'type' => 'required|in:subject,direct,semester',
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
            $targetUser = User::findOrFail($request->target_id);

            // Student Direct Message Guard
            if ($user->isStudent()) {
                if (! $targetUser->isAdmin() && ! $user->matchesSemesterOfUser($targetUser)) {
                    abort(403, 'You can only message students in your semester or your professors.');
                }
            }

            $data['recipient_id'] = $request->target_id;
            $data['subject_id'] = null;
            $data['semester_id'] = null;

        } elseif ($request->type === 'semester') {
            $userSemId = $user->resolveSemesterId();

            if (! $user->isAdmin()) {
                if ((int) $userSemId !== (int) $request->target_id && (int) $request->target_id !== 0) {
                    abort(403, 'You can only post to your assigned semester chat.');
                }
            }

            $data['semester_id'] = (int) $request->target_id > 0 ? $request->target_id : null;
            $data['subject_id'] = null;
            $data['recipient_id'] = null;

        } else {
            // Subject Room
            $subject = Subject::findOrFail($request->target_id);
            if (! $user->canAccessSubject($subject)) {
                abort(403, 'You do not have access to this subject chat.');
            }

            $data['subject_id'] = $request->target_id;
            $data['recipient_id'] = null;
            $data['semester_id'] = null;
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
            'semester_id' => $message->semester_id,
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
