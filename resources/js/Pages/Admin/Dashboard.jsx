import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import TiltCard3D from '@/Components/TiltCard3D';
import { 
    Users, 
    GraduationCap, 
    Building2, 
    BookOpen, 
    FileText, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    TrendingUp, 
    AlertCircle,
    ChevronRight,
    ArrowUpRight,
    Calendar,
    Activity,
    ShieldAlert,
    Sparkles
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

export default function Dashboard({ stats = {}, pendingUsers = [], recentActivity = [] }) {
    const { post, processing } = useForm();
    const { t } = useTranslation();

    const handleApprove = (userId) => {
        post(route('admin.users.approve', userId), {
            preserveScroll: true,
        });
    };

    const handleReject = (userId) => {
        if (confirm('Are you sure you want to reject this registration?')) {
            post(route('admin.users.reject', userId), {
                preserveScroll: true,
            });
        }
    };

    const statCards = [
        {
            title: t('universities'),
            value: stats.totalUniversities || 0,
            icon: Building2,
            href: route('admin.universities.index'),
            gradient: 'from-blue-600 to-indigo-600',
            glowColor: 'rgba(59, 130, 246, 0.25)',
            textColor: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
            badge: t('activeCampuses')
        },
        {
            title: t('courseCabinets'),
            value: stats.totalSubjects || 0,
            icon: BookOpen,
            href: route('admin.subjects.index'),
            gradient: 'from-violet-600 to-purple-600',
            glowColor: 'rgba(139, 92, 246, 0.25)',
            textColor: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
            badge: t('courseModules')
        },
        {
            title: t('cabinetDocuments'),
            value: stats.totalDocuments || 0,
            icon: FileText,
            href: route('admin.subjects.index'),
            gradient: 'from-emerald-600 to-teal-600',
            glowColor: 'rgba(16, 185, 129, 0.25)',
            textColor: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20',
            badge: t('lecturesBooks')
        },
        {
            title: t('pendingApprovals'),
            value: stats.pendingCount || 0,
            icon: Clock,
            href: route('admin.users'),
            gradient: 'from-amber-600 to-orange-600',
            glowColor: 'rgba(245, 158, 11, 0.3)',
            textColor: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/30',
            badge: t('actionRequired'),
            alert: (stats.pendingCount || 0) > 0
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-indigo-700 border border-indigo-200/50">
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                {t('commandCenter')}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display mt-1">
                            {t('commandCenter')}
                        </h2>
                        <p className="text-sm text-slate-500 mt-0.5">
                            {t('overviewSubtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('admin.universities.create')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-900/15 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {t('addUniversity')}
                        </Link>
                        <Link
                            href={route('admin.subjects.create')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <BookOpen className="w-3.5 h-3.5 text-white/80" />
                            {t('newSubject')}
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Admin Command Center" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Stat Grid with 3D Tilt Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {statCards.map((card) => {
                            const IconComponent = card.icon;
                            return (
                                <Link
                                    key={card.title}
                                    href={card.href}
                                    className="block"
                                >
                                    <TiltCard3D
                                        className="h-full rounded-2xl p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 shadow-glass transition-all"
                                        glowColor={card.glowColor}
                                        maxTilt={12}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 rounded-xl ${card.bgColor} ${card.textColor} ${card.borderColor} border flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-110`}>
                                                <IconComponent className="w-6 h-6" />
                                            </div>
                                            {card.alert ? (
                                                <span className="flex h-3.5 w-3.5 relative">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
                                                </span>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-700 transition-colors">
                                                    <ArrowUpRight className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                                {card.title}
                                            </span>
                                            <div className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
                                                {card.value}
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
                                            <span>{card.badge}</span>
                                            <span className="font-bold text-[#ff5e36] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                Manage &rarr;
                                            </span>
                                        </div>
                                    </TiltCard3D>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Secondary Quick Metrics in Liquid Glass Dark Panel */}
                    <div className="relative overflow-hidden liquid-glass-dark rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/10">
                        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                        <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
                        
                        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <div className="border-r border-white/10 pr-4">
                                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{t('totalRegisteredUsers')}</div>
                                <div className="text-3xl font-extrabold mt-1.5 font-display text-white tracking-tight">{stats.totalUsers || 0}</div>
                                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                    All accounts
                                </div>
                            </div>
                            <div className="border-r border-white/10 pr-4">
                                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{t('approvedStudents')}</div>
                                <div className="text-3xl font-extrabold mt-1.5 font-display text-emerald-400 tracking-tight">{stats.approvedStudents || 0}</div>
                                <div className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Authorized
                                </div>
                            </div>
                            <div className="border-r border-white/10 pr-4">
                                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{t('activeAssignments')}</div>
                                <div className="text-3xl font-extrabold mt-1.5 font-display text-indigo-400 tracking-tight">{stats.totalAssignments || 0}</div>
                                <div className="text-[11px] text-indigo-300/80 mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    Cabinet tasks
                                </div>
                            </div>
                            <div>
                                <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">{t('pendingSubmissions')}</div>
                                <div className="text-3xl font-extrabold mt-1.5 font-display text-amber-400 tracking-tight">{stats.pendingSubmissions || 0}</div>
                                <div className="text-[11px] text-amber-300/80 mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    Need review
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Split: Pending Approvals & Activity Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Pending Approvals Table (2 Cols) */}
                        <div className="lg:col-span-2 liquid-glass rounded-3xl border border-white/60 shadow-glass overflow-hidden">
                            <div className="p-6 border-b border-slate-100/80 bg-white/40 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shadow-inner">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base font-display">
                                            {t('studentRegistrationQueue')}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            {pendingUsers.length} {t('waitingVerification')}
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.users')}
                                    className="text-xs font-bold text-[#ff5e36] hover:text-[#e04822] inline-flex items-center gap-1 group"
                                >
                                    {t('viewAllUsers')} 
                                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                                </Link>
                            </div>

                            {pendingUsers.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                                        <CheckCircle2 className="w-7 h-7" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 font-display">{t('queueClear')}</h4>
                                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{t('queueClearDesc')}</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-slate-600">
                                        <thead className="bg-slate-50/60 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-3.5">{t('studentDetails')}</th>
                                                <th className="px-6 py-3.5">{t('universityAndId')}</th>
                                                <th className="px-6 py-3.5">{t('registrationIp')}</th>
                                                <th className="px-6 py-3.5 text-right">{t('actions')}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100/60 bg-white/30">
                                            {pendingUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-[#ff5e36]/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-900 group-hover:text-[#ff5e36] transition-colors">{user.name}</div>
                                                        <div className="text-xs text-slate-500">{user.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-slate-800 font-medium">{user.university?.name || 'Unassigned'}</div>
                                                        <div className="text-xs font-mono text-[#ff5e36] bg-[#ff5e36]/10 inline-block px-1.5 py-0.5 rounded border border-[#ff5e36]/20 mt-0.5">{user.student_id_no || 'No ID'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                                        {user.registration_ip_address || '127.0.0.1'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="inline-flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleApprove(user.id)}
                                                                disabled={processing}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                {t('approve')}
                                                            </button>
                                                            <button
                                                                onClick={() => handleReject(user.id)}
                                                                disabled={processing}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200/80 transition-all hover:scale-105 active:scale-95"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                {t('reject')}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Recent Activity Audit Log (1 Col) */}
                        <div className="liquid-glass rounded-3xl border border-white/60 shadow-glass overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100/80 bg-white/40 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#ff5e36]/10 border border-[#ff5e36]/20 text-[#ff5e36] flex items-center justify-center shadow-inner">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base font-display">{t('activityAudit')}</h3>
                                        <p className="text-xs text-slate-500">{t('realtimePortalActions')}</p>
                                    </div>
                                </div>
                                <Link
                                    href={route('admin.analytics')}
                                    className="text-xs font-bold text-[#ff5e36] hover:text-[#e04822] inline-flex items-center gap-1 group"
                                >
                                    {t('analytics')} 
                                    <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
                                </Link>
                            </div>

                            <div className="p-6 divide-y divide-slate-100/70 flex-1 overflow-y-auto max-h-[420px]">
                                {recentActivity.length === 0 ? (
                                    <div className="text-center py-8 text-xs text-slate-400">
                                        {t('noRecentActivity')}
                                    </div>
                                ) : (
                                    recentActivity.map((log) => (
                                        <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-800">
                                                    <span className="font-semibold">{log.user?.name || 'System'}</span>{' '}
                                                    <span className="text-slate-500">{log.action.replace('_', ' ')}</span>
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">
                                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • IP {log.ip_address}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
