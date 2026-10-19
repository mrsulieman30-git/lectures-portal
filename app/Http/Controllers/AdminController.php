<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Assignment;
use App\Models\Document;
use App\Models\DownloadLog;
use App\Models\Enrollment;
use App\Models\Notification;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Main admin dashboard with analytics.
     */
    public function dashboard()
    {
        $totalUsers = User::count();
        $totalStudents = User::students()->count();
        $approvedStudents = User::students()->approved()->count();
        $pendingUsers = User::pending()->with('university')->get();
        $totalUniversities = University::count();
        $totalSubjects = Subject::count();
        $totalDocuments = Document::count();
        $totalAssignments = Assignment::count();
        $pendingSubmissions = Submission::pending()->count();

        // Recent activity
        $recentActivity = ActivityLog::with('user')
            ->latest()
            ->take(20)
            ->get();

        // Registration trends (last 30 days)
        $registrationTrend = User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        // Downloads by day (last 30 days)
        $downloadTrend = DownloadLog::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalStudents' => $totalStudents,
                'approvedStudents' => $approvedStudents,
                'pendingCount' => $pendingUsers->count(),
                'totalUniversities' => $totalUniversities,
                'totalSubjects' => $totalSubjects,
                'totalDocuments' => $totalDocuments,
                'totalAssignments' => $totalAssignments,
                'pendingSubmissions' => $pendingSubmissions,
            ],
            'pendingUsers' => $pendingUsers,
            'recentActivity' => $recentActivity,
            'registrationTrend' => $registrationTrend,
            'downloadTrend' => $downloadTrend,
        ]);
    }

    /**
     * Approve a pending user.
     */
    public function approveUser(User $user)
    {
        $user->update(['status' => 'approved']);
        $enrolledCount = $user->autoEnrollUniversitySubjects();

        Notification::notify(
            $user->id,
            'account_approved',
            'Account Approved!',
            'Your account has been approved. You now have access to the portal.',
            route('dashboard')
        );

        ActivityLog::log('user_approved', $user);

        $enrollMsg = $enrolledCount > 0 ? " and enrolled into {$enrolledCount} university courses" : '';
        return redirect()->back()->with('message', "User {$user->name} approved successfully{$enrollMsg}.");
    }

    /**
     * Bulk sync all approved students with active subjects of their universities.
     */
    public function syncEnrollments()
    {
        $students = User::where('role', 'student')->where('status', 'approved')->whereNotNull('university_id')->get();
        $totalSynced = 0;
        foreach ($students as $student) {
            $totalSynced += $student->autoEnrollUniversitySubjects();
        }

        return redirect()->back()->with('message', "Synced {$totalSynced} course enrollments across {$students->count()} approved students.");
    }

    /**
     * Reject a pending user.
     */
    public function rejectUser(User $user)
    {
        $user->update(['status' => 'rejected']);

        Notification::notify(
            $user->id,
            'account_rejected',
            'Account Rejected',
            'Your account request has been rejected. Please contact the administrator.'
        );

        ActivityLog::log('user_rejected', $user);

        return redirect()->back()->with('message', "User {$user->name} rejected.");
    }

    /**
     * List all users with filtering.
     */
    public function users(Request $request)
    {
        $query = User::with('university');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('student_id_no', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('university_id')) {
            $query->where('university_id', $request->university_id);
        }

        $users = $query->latest()->paginate(20)->withQueryString();
        $universities = University::active()->get(['id', 'name']);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            'universities' => $universities,
            'filters' => $request->only(['search', 'role', 'status', 'university_id']),
        ]);
    }

    /**
     * Approve a name change request.
     */
    public function approveNameChange(User $user)
    {
        if ($user->pending_name) {
            $oldName = $user->name;
            $user->update([
                'name' => $user->pending_name,
                'pending_name' => null,
            ]);

            Notification::notify(
                $user->id,
                'name_approved',
                'Name Change Approved',
                "Your name has been updated to {$user->name}."
            );

            ActivityLog::log('name_change_approved', $user, [
                'old_name' => $oldName,
                'new_name' => $user->name,
            ]);
        }

        return redirect()->back()->with('message', 'Name change approved.');
    }

    /**
     * Reject a name change request.
     */
    public function rejectNameChange(User $user)
    {
        $user->update(['pending_name' => null]);

        Notification::notify(
            $user->id,
            'name_rejected',
            'Name Change Rejected',
            'Your name change request has been rejected.'
        );

        return redirect()->back()->with('message', 'Name change rejected.');
    }

    /**
     * Enroll students in subjects.
     */
    public function enrollStudent(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'subject_ids' => 'required|array',
            'subject_ids.*' => 'exists:subjects,id',
        ]);

        $user = User::findOrFail($request->user_id);

        foreach ($request->subject_ids as $subjectId) {
            Enrollment::firstOrCreate(
                ['user_id' => $user->id, 'subject_id' => $subjectId],
                ['status' => 'active', 'enrolled_at' => now()]
            );
        }

        Notification::notify(
            $user->id,
            'enrollment',
            'New Subject Access',
            'You have been enrolled in new subjects. Check your dashboard.',
            route('dashboard')
        );

        ActivityLog::log('student_enrolled', $user, ['subject_ids' => $request->subject_ids]);

        return redirect()->back()->with('message', 'Student enrolled in '.count($request->subject_ids).' subject(s).');
    }

    /**
     * Remove enrollment.
     */
    public function unenrollStudent(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        Enrollment::where('user_id', $request->user_id)
            ->where('subject_id', $request->subject_id)
            ->delete();

        return redirect()->back()->with('message', 'Student unenrolled.');
    }

    /**
     * Academic & Cabinet Analytics with comprehensive metrics.
     */
    public function analytics()
    {
        // 1. High-Level Real Stats
        $totalDownloads = (int) Document::sum('download_count');
        $logDownloads = (int) DownloadLog::count();
        $effectiveDownloads = max($totalDownloads, $logDownloads);

        $totalViews = (int) Document::sum('view_count');
        $totalDocuments = (int) Document::count();
        $approvedStudents = (int) User::students()->approved()->count();
        $totalUniversities = (int) University::count();
        $totalSubjects = (int) Subject::count();
        $totalAssignments = (int) Assignment::count();
        $totalSubmissions = (int) Submission::count();

        $stats = [
            'totalDownloads' => $effectiveDownloads,
            'totalViews' => $totalViews,
            'totalDocuments' => $totalDocuments,
            'approvedStudents' => $approvedStudents,
            'totalUniversities' => $totalUniversities,
            'totalSubjects' => $totalSubjects,
            'totalAssignments' => $totalAssignments,
            'totalSubmissions' => $totalSubmissions,
        ];

        // 2. University Breakdown with real student and subject counts
        $universityBreakdown = University::withCount([
            'students' => function ($q) {
                $q->approved();
            },
            'subjects',
        ])
        ->get(['id', 'name', 'slug'])
        ->map(function ($uni) {
            return [
                'id' => $uni->id,
                'name' => $uni->name,
                'students_count' => (int) $uni->students_count,
                'subjects_count' => (int) $uni->subjects_count,
            ];
        });

        // 3. Top Downloaded Cabinet Materials with subject info
        $topDocuments = Document::with('subject:id,title')
            ->orderBy('download_count', 'desc')
            ->take(8)
            ->get(['id', 'title', 'download_count', 'view_count', 'file_type', 'subject_id']);

        // 4. Real Recent Security & Activity Audit Trail
        $recentActivity = ActivityLog::with('user:id,name,email')
            ->latest()
            ->take(15)
            ->get(['id', 'user_id', 'action', 'model_type', 'ip_address', 'created_at']);

        // 5. 7-Day Download Activity Trends
        $downloadTrends = collect(range(6, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo);
            $dateStr = $date->toDateString();
            $logCount = DownloadLog::whereDate('created_at', $dateStr)->count();
            $activityCount = ActivityLog::where('action', 'document_downloaded')
                ->whereDate('created_at', $dateStr)
                ->count();
            return [
                'date' => $date->format('M d'),
                'downloads' => max($logCount, $activityCount),
            ];
        })->values();

        // 6. User Growth Over Last 6 Months
        $userGrowth = collect(range(5, 0))->map(function ($monthsAgo) {
            $date = now()->subMonths($monthsAgo);
            $count = User::students()
                ->where('created_at', '<=', $date->endOfMonth())
                ->count();
            return [
                'month' => $date->format('M Y'),
                'students' => $count,
            ];
        })->values();

        // 7. Assignment Completion Stats
        $assignmentStats = Assignment::withCount(['submissions', 'submissions as graded_count' => function ($q) {
            $q->where('status', 'graded');
        }])->latest()->take(10)->get();

        return Inertia::render('Admin/Analytics', [
            'stats' => $stats,
            'universityBreakdown' => $universityBreakdown,
            'topDocuments' => $topDocuments,
            'recentActivity' => $recentActivity,
            'downloadTrends' => $downloadTrends,
            'userGrowth' => $userGrowth,
            'usersByUniversity' => $universityBreakdown,
            'assignmentStats' => $assignmentStats,
        ]);
    }
}
