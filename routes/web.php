<?php

use App\Http\Controllers\Admin\AgentActionController;
use App\Http\Controllers\Admin\PendingCabinetController;
use App\Http\Controllers\Admin\RecycleBinController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\LibraryController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\UniversityController;
use App\Models\Assignment;
use App\Models\LectureSchedule;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ─── Public Routes ─────────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('welcome');

Route::get('/avatar/{user}', [ProfileController::class, 'avatar'])->name('user.avatar');
Route::get('/storage/{path}', [ProfileController::class, 'serveStorage'])->where('path', '.*')->name('storage.serve');
Route::post('/device-change-request', [DeviceController::class, 'submitChangeRequest'])->name('device.request-change');

// ─── Pending Approval Page ─────────────────────────────────────
Route::get('/pending-approval', function () {
    return Inertia::render('PendingApproval');
})->middleware('auth')->name('pending-approval');

// ─── Authenticated + Approved Routes ───────────────────────────
Route::middleware(['auth', 'verified', 'approved'])->group(function () {

    // Dashboard (role-aware)
    Route::get('/dashboard', function () {
        $user = auth()->user();

        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        // Auto-enroll student into university subjects if not enrolled yet
        if ($user->university_id && $user->enrollments()->count() === 0) {
            $user->autoEnrollUniversitySubjects();
        }

        // Student dashboard data (accessible subjects via active enrollment OR university affiliation)
        $enrolledSubjects = $user->accessibleSubjects()
            ->with(['university:id,name', 'semester:id,name'])
            ->withCount('documents', 'assignments')
            ->get();

        $upcomingAssignments = Assignment::whereIn('subject_id', $enrolledSubjects->pluck('id'))
            ->where('deadline', '>', now())
            ->published()
            ->orderBy('deadline')
            ->take(5)
            ->with('subject:id,title,color')
            ->get();

        $recentGrades = $user->submissions()
            ->where('status', 'graded')
            ->latest('graded_at')
            ->take(5)
            ->with('assignment:id,title,max_grade,subject_id', 'assignment.subject:id,title')
            ->get();

        $todaySchedules = LectureSchedule::whereIn('subject_id', $enrolledSubjects->pluck('id'))
            ->whereDate('start_time', today())
            ->orderBy('start_time')
            ->with('subject:id,title,color')
            ->get();

        $unreadNotifications = $user->notifications()->unread()->count();

        return Inertia::render('Dashboard', [
            'enrolledSubjects' => $enrolledSubjects,
            'upcomingAssignments' => $upcomingAssignments,
            'recentGrades' => $recentGrades,
            'todaySchedules' => $todaySchedules,
            'unreadNotifications' => $unreadNotifications,
        ]);
    })->name('dashboard');

    // ─── Profile ───────────────────────────────────────────────
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::delete('/profile/avatar', [ProfileController::class, 'destroyAvatar'])->name('profile.avatar.destroy');
    Route::post('/profile/name-change', [ProfileController::class, 'requestNameChange'])->name('profile.name-change');

    // ─── Student Subject View ──────────────────────────────────
    Route::get('/subjects/{subject}', [SubjectController::class, 'studentView'])->name('subjects.show');

    // ─── Documents ─────────────────────────────────────────────
    Route::get('/documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');
    Route::get('/documents/{document}/view', [DocumentController::class, 'view'])->name('documents.view');
    Route::match(['get', 'post'], '/documents/{document}/stream', [DocumentController::class, 'stream'])->name('documents.stream');
    Route::get('/subjects/{subject}/download-pack', [DocumentController::class, 'downloadPack'])->name('subjects.download-pack');
    Route::get('/library', [LibraryController::class, 'index'])->name('library.index');

    // ─── Assignment Submissions ────────────────────────────────
    Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submit'])->name('assignments.submit');

    // ─── Schedule & Calendar ───────────────────────────────────
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
    Route::get('/schedule/events', [ScheduleController::class, 'events'])->name('schedule.events');
    Route::post('/reminders', [ScheduleController::class, 'createReminder'])->name('reminders.store');
    Route::delete('/reminders/{reminder}', [ScheduleController::class, 'deleteReminder'])->name('reminders.destroy');

    // ─── Student Dedicated Notes ──────────────────────────────
    Route::get('/notes', [NoteController::class, 'index'])->name('notes.index');
    Route::post('/notes', [NoteController::class, 'store'])->name('notes.store');
    Route::put('/notes/{note}', [NoteController::class, 'update'])->name('notes.update');
    Route::patch('/notes/{note}/pin', [NoteController::class, 'togglePin'])->name('notes.pin');
    Route::delete('/notes/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');

    // ─── Direct & Class Messaging (AJAX & Real-time Chat) ─────
    Route::get('/chat/channels', [MessageController::class, 'channels'])->name('chat.channels');
    Route::get('/chat/messages', [MessageController::class, 'getThread'])->name('chat.messages');
    Route::post('/chat/send', [MessageController::class, 'send'])->name('chat.send');
    Route::get('/chat/unread-count', [MessageController::class, 'unreadCount'])->name('chat.unread');
    Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');

    // ─── Notifications (AJAX) ──────────────────────────────────
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount'])->name('notifications.unread-count');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');

    // ─── Admin Routes ──────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {

        // Dashboard & Analytics
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        Route::get('/analytics', [AdminController::class, 'analytics'])->name('analytics');

        // User Management
        Route::get('/users', [AdminController::class, 'users'])->name('users');
        Route::post('/users/{user}/approve', [AdminController::class, 'approveUser'])->name('users.approve');
        Route::post('/users/{user}/reject', [AdminController::class, 'rejectUser'])->name('users.reject');
        Route::post('/users/{user}/approve-name', [AdminController::class, 'approveNameChange'])->name('users.approve-name');
        Route::post('/users/{user}/reject-name', [AdminController::class, 'rejectNameChange'])->name('users.reject-name');
        Route::post('/users/{user}/approve-device', [DeviceController::class, 'approveDevice'])->name('users.approve-device');
        Route::post('/users/{user}/reject-device', [DeviceController::class, 'rejectDevice'])->name('users.reject-device');
        Route::post('/users/{user}/reset-device', [DeviceController::class, 'resetDevice'])->name('users.reset-device');

        // Enrollment Management
        Route::post('/users/sync-enrollments', [AdminController::class, 'syncEnrollments'])->name('users.sync-enrollments');
        Route::post('/enroll', [AdminController::class, 'enrollStudent'])->name('enroll');
        Route::post('/unenroll', [AdminController::class, 'unenrollStudent'])->name('unenroll');

        // University & Semester Management
        Route::resource('universities', UniversityController::class);
        Route::post('/universities/{university}/semesters', [UniversityController::class, 'addSemester'])->name('universities.semesters.store');
        Route::put('/universities/{university}/semesters/{semester}', [UniversityController::class, 'updateSemester'])->name('universities.semesters.update');
        Route::delete('/universities/{university}/semesters/{semester}', [UniversityController::class, 'deleteSemester'])->name('universities.semesters.destroy');
        Route::resource('semesters', SemesterController::class)->only(['store', 'update', 'destroy']);

        // Subject Management
        Route::resource('subjects', SubjectController::class);
        Route::post('/subjects/{subject}/transfer', [SubjectController::class, 'transfer'])->name('subjects.transfer');
        Route::post('/subjects/{subject}/share', [SubjectController::class, 'share'])->name('subjects.share');
        Route::post('/subjects/{subject}/sync', [SubjectController::class, 'sync'])->name('subjects.sync');
        Route::post('/subjects/{subject}/updates', [SubjectController::class, 'addUpdate'])->name('subjects.updates.store');

        // Recycle Bin (Undo & Trash Management)
        Route::get('/recycle-bin', [RecycleBinController::class, 'index'])->name('recycle-bin.index');
        Route::post('/recycle-bin/restore', [RecycleBinController::class, 'restore'])->name('recycle-bin.restore');
        Route::delete('/recycle-bin/force-delete', [RecycleBinController::class, 'forceDelete'])->name('recycle-bin.force-delete');
        Route::post('/recycle-bin/restore-all', [RecycleBinController::class, 'restoreAll'])->name('recycle-bin.restore-all');
        Route::delete('/recycle-bin/empty', [RecycleBinController::class, 'emptyTrash'])->name('recycle-bin.empty');

        // Pending Cabinet (Staged Documents & Bulk Assignment)
        Route::get('/pending-cabinet', [PendingCabinetController::class, 'index'])->name('pending-cabinet.index');
        Route::post('/pending-cabinet/upload', [PendingCabinetController::class, 'upload'])->name('pending-cabinet.upload');
        Route::post('/pending-cabinet/assign', [PendingCabinetController::class, 'assign'])->name('pending-cabinet.assign');
        Route::post('/pending-cabinet/bulk-schedule', [PendingCabinetController::class, 'bulkSchedule'])->name('pending-cabinet.bulk-schedule');
        Route::post('/pending-cabinet/bulk-delete', [PendingCabinetController::class, 'bulkDelete'])->name('pending-cabinet.bulk-delete');

        // Document Management
        Route::post('/subjects/{subject}/documents', [DocumentController::class, 'store'])->name('documents.store');
        Route::patch('/documents/{document}', [DocumentController::class, 'update'])->name('documents.update');
        Route::delete('/documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy');
        Route::post('/subjects/{subject}/documents/reorder', [DocumentController::class, 'reorder'])->name('documents.reorder');
        Route::post('/library/upload', [LibraryController::class, 'upload'])->name('library.upload');

        // Assignment Management
        Route::post('/subjects/{subject}/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
        Route::patch('/assignments/{assignment}', [AssignmentController::class, 'update'])->name('assignments.update');
        Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');
        Route::get('/assignments/{assignment}/submissions', [AssignmentController::class, 'submissions'])->name('assignments.submissions');
        Route::post('/submissions/{submission}/grade', [AssignmentController::class, 'grade'])->name('submissions.grade');

        // Schedule Management
        Route::post('/schedule', [ScheduleController::class, 'store'])->name('schedule.store');
        Route::patch('/schedule/{schedule}', [ScheduleController::class, 'update'])->name('schedule.update');
        Route::delete('/schedule/{schedule}', [ScheduleController::class, 'destroy'])->name('schedule.destroy');

        // Messages (admin actions)
        Route::post('/messages/{message}/pin', [MessageController::class, 'togglePin'])->name('messages.pin');

        // Agent Approvals & Control Hub (OpenClaw / Human-In-The-Loop)
        Route::get('/agent-actions', [AgentActionController::class, 'index'])->name('agent-actions.index');
        Route::post('/agent-actions/{action}/approve', [AgentActionController::class, 'approve'])->name('agent-actions.approve');
        Route::post('/agent-actions/{action}/reject', [AgentActionController::class, 'reject'])->name('agent-actions.reject');
        Route::post('/agent-actions/batch-approve', [AgentActionController::class, 'batchApprove'])->name('agent-actions.batch-approve');
    });
});

require __DIR__.'/auth.php';
