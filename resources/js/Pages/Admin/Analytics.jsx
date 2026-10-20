import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    BarChart3, 
    TrendingUp, 
    DownloadCloud, 
    Users, 
    Building2, 
    FileText, 
    Activity, 
    ShieldCheck, 
    Globe, 
    ArrowUpRight,
    Eye,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock
} from 'lucide-react';

export default function Analytics({
    stats = {},
    universityBreakdown = [],
    topDocuments = [],
    recentActivity = [],
    userGrowth = [],
    downloadTrends = []
}) {
    // Calculate max downloads in the 7-day trend for chart scaling
    const maxDailyDownloads = Math.max(...downloadTrends.map((d) => d.downloads || 0), 1);
    const maxStudentsGrowth = Math.max(...userGrowth.map((g) => g.students || 0), 1);

    const getActionBadgeColor = (action) => {
        if (action.includes('download')) return 'bg-blue-50 text-blue-700 border-blue-200';
        if (action.includes('upload')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        if (action.includes('approved') || action.includes('login')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (action.includes('reject') || action.includes('blocked')) return 'bg-rose-50 text-rose-700 border-rose-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                                Academic & Cabinet Analytics
                            </h2>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live Metrics
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            Real-time intelligence on student downloads, engagement trends, and multi-campus distributions.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Academic & Cabinet Analytics" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Top Overview KPI Cards (Real Data) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                        {/* Total Downloads */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Downloads</span>
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <DownloadCloud className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900 font-display">{stats.totalDownloads || 0}</div>
                            <div className="text-[11px] text-slate-400 mt-1.5">Student file downloads</div>
                        </div>

                        {/* Total Document Views */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Document Views</span>
                                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                                    <Eye className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900 font-display">{stats.totalViews || 0}</div>
                            <div className="text-[11px] text-slate-400 mt-1.5">In-browser read sessions</div>
                        </div>

                        {/* Cabinet Material */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cabinet Material</span>
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900 font-display">{stats.totalDocuments || 0}</div>
                            <div className="text-[11px] text-slate-400 mt-1.5">Lectures & handbooks</div>
                        </div>

                        {/* Verified Students */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Verified Students</span>
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900 font-display">{stats.approvedStudents || 0}</div>
                            <div className="text-[11px] text-slate-400 mt-1.5">Active enrollments</div>
                        </div>

                        {/* Partner Campuses */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Universities</span>
                                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <Building2 className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900 font-display">{stats.totalUniversities || 0}</div>
                            <div className="text-[11px] text-slate-400 mt-1.5">Partner institutions</div>
                        </div>

                        {/* Active Subjects */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Curricula</span>
                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="text-2xl font-black text-slate-900 font-display">{stats.totalSubjects || 0}</div>
                            <div className="text-[11px] text-slate-400 mt-1.5">Academic subjects</div>
                        </div>
                    </div>

                    {/* Visual Activity & Growth Trends */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 7-Day Download Activity Chart */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <BarChart3 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">7-Day Download Activity</h3>
                                        <p className="text-xs text-slate-400">Daily academic document access volume</p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md">
                                    Last 7 Days
                                </span>
                            </div>

                            <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-100">
                                {downloadTrends.map((trend, idx) => {
                                    const heightPercent = Math.max(12, Math.round(((trend.downloads || 0) / maxDailyDownloads) * 100));
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                            <div className="text-[10px] font-mono font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {trend.downloads}
                                            </div>
                                            <div 
                                                className="w-full max-w-[36px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-lg transition-all duration-500 group-hover:brightness-110 shadow-sm"
                                                style={{ height: `${heightPercent}%` }}
                                            />
                                            <span className="text-[10px] font-mono text-slate-400 text-center truncate w-full">
                                                {trend.date}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Student Enrollment Cumulative Growth */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">Student Registration Growth</h3>
                                        <p className="text-xs text-slate-400">Verified student population over past months</p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md">
                                    {stats.approvedStudents || 0} Total
                                </span>
                            </div>

                            <div className="space-y-3.5">
                                {userGrowth.map((point, idx) => {
                                    const percent = Math.min(100, Math.round(((point.students || 0) / maxStudentsGrowth) * 100));
                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="font-semibold text-slate-700">{point.month}</span>
                                                <span className="font-mono font-bold text-slate-900">{point.students} students</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-700"
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Split View: Top Downloaded Files & University Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Most Popular Cabinet Documents */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">Top Downloaded Materials</h3>
                                        <p className="text-xs text-slate-400">Real-time student download leaderboards</p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">Ranked by count</span>
                            </div>

                            <div className="space-y-3">
                                {topDocuments.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-6">No downloads recorded yet.</p>
                                ) : (
                                    topDocuments.map((doc, idx) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-slate-100/70 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="w-6 h-6 rounded-md bg-white border border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-center shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-slate-900 truncate">{doc.title}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                        <span>{doc.subject?.title || 'General'}</span>
                                                        <span>•</span>
                                                        <span className="font-mono uppercase font-bold text-indigo-600">{doc.file_type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 ml-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <DownloadCloud className="w-3.5 h-3.5" />
                                                    {doc.download_count}
                                                </span>
                                                <Link
                                                    href={route('documents.view', doc.id)}
                                                    className="p-1.5 rounded-lg bg-white hover:bg-slate-200/80 text-slate-600 border border-slate-200 transition-colors"
                                                    title="View Document Online"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* University Student Distribution */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">University Distribution</h3>
                                        <p className="text-xs text-slate-400">Enrolled student counts across institutions</p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400">{stats.totalUniversities || 0} Campuses</span>
                            </div>

                            <div className="space-y-4">
                                {universityBreakdown.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-6">No universities added yet.</p>
                                ) : (
                                    universityBreakdown.map((uni) => {
                                        const total = Math.max(1, stats.approvedStudents || 1);
                                        const sharePercent = Math.round(((uni.students_count || 0) / total) * 100);
                                        return (
                                            <div key={uni.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                                                <div className="flex justify-between items-center text-sm font-semibold text-slate-900">
                                                    <span>{uni.name}</span>
                                                    <span className="text-indigo-600 font-bold">{uni.students_count || 0} students</span>
                                                </div>
                                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                                    <div 
                                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500" 
                                                        style={{ width: `${Math.min(100, sharePercent)}%` }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                                                    <span>Active subjects: {uni.subjects_count || 0}</span>
                                                    <span>{sharePercent}% of total student body</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Detailed Security & Activity Audit Table */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">Comprehensive Audit Log</h3>
                                    <p className="text-xs text-slate-500">Real-time security and action trail with client IP tracking</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                                Live Audit Feed
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3.5">User</th>
                                        <th className="px-6 py-3.5">Action Event</th>
                                        <th className="px-6 py-3.5">Client IP</th>
                                        <th className="px-6 py-3.5">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentActivity.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-xs">
                                                No audit entries recorded yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        recentActivity.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-3.5">
                                                    <span className="font-semibold text-slate-900 block">
                                                        {log.user?.name || 'System / Guest'}
                                                    </span>
                                                    <span className="block text-xs text-slate-400 font-mono">
                                                        {log.user?.email || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${getActionBadgeColor(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 font-mono text-xs text-slate-500">
                                                    {log.ip_address || '127.0.0.1'}
                                                </td>
                                                <td className="px-6 py-3.5 text-xs text-slate-400">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
