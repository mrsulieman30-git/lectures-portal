import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    FileText, 
    GraduationCap, 
    Calendar, 
    Clock, 
    Award, 
    ArrowUpRight, 
    Download, 
    Building2,
    CheckCircle2,
    Sparkles,
    Layers,
    BookMarked
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';
import CountdownTimer from '@/Components/CountdownTimer';
import TiltCard3D from '@/Components/TiltCard3D';
import SubjectCard3D from '@/Components/SubjectCard3D';

export default function Dashboard({
    enrolledSubjects = [],
    upcomingAssignments = [],
    recentGrades = [],
    todaySchedules = [],
    unreadNotifications = 0
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const { t } = useTranslation();
    const isFemale = user?.gender === 'female';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-pill text-xs font-semibold text-[#FF5E36] dark:text-[#ff7a54] mb-2 border border-orange-200 dark:border-orange-900/50">
                            <Sparkles className="w-3.5 h-3.5 text-[#FF5E36] animate-pulse" />
                            <span>Academic Cabinet OS Active</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                            {t('welcomeBack')}, <span className={`text-transparent bg-clip-text ${
                                isFemale 
                                    ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-[#FF5E36]'
                                    : 'bg-gradient-to-r from-[#FF5E36] via-[#FF416C] to-amber-500'
                            }`}>{user.name}</span>
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{user.university?.name || 'Academic Portal'}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{user.semester || 'Fall 2026'}</span>
                            <span className="font-mono text-slate-400">({user.student_id_no || 'Student'})</span>
                        </p>
                    </div>

                    <Link
                        href={route('library.index')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl liquid-pill hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#FF5E36] transition-all shadow-xs group"
                    >
                        <BookMarked className="w-4 h-4 text-[#FF5E36] group-hover:scale-110 transition-transform" />
                        <span>{t('universalLibrary', 'Universal Library')}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                </div>
            }
        >
            <Head title="Student Portal" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* 3D Liquid Glass Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 perspective-1000">
                        <TiltCard3D
                            maxTilt={10}
                            scale={1.03}
                            glowColor="#FF5E36"
                            className="liquid-glass rounded-3xl p-6 shadow-sm border border-white/80 dark:border-white/10 flex items-center justify-between group"
                        >
                            <div className="translate-z-20">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('enrolledCourses')}</span>
                                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1 font-display group-hover:text-[#FF5E36] transition-colors">
                                    {enrolledSubjects.length}
                                </div>
                                <span className="text-[11px] font-medium text-[#FF5E36] dark:text-[#ff7a54] mt-0.5 block">Active Curriculums</span>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-orange-50/80 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-[#FF5E36] flex items-center justify-center font-bold shadow-md shadow-orange-500/10 translate-z-30 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                <BookOpen className="w-7 h-7" />
                            </div>
                        </TiltCard3D>

                        <TiltCard3D
                            maxTilt={10}
                            scale={1.03}
                            glowColor="#f59e0b"
                            className="liquid-glass rounded-3xl p-6 shadow-sm border border-white/80 dark:border-white/10 flex items-center justify-between group"
                        >
                            <div className="translate-z-20">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('upcomingTasks')}</span>
                                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1 font-display group-hover:text-amber-500 transition-colors">
                                    {upcomingAssignments.length}
                                </div>
                                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-0.5 block">Pending Deadlines</span>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shadow-md shadow-amber-500/10 translate-z-30 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                <Clock className="w-7 h-7" />
                            </div>
                        </TiltCard3D>

                        <TiltCard3D
                            maxTilt={10}
                            scale={1.03}
                            glowColor="#10b981"
                            className="liquid-glass rounded-3xl p-6 shadow-sm border border-white/80 dark:border-white/10 flex items-center justify-between group"
                        >
                            <div className="translate-z-20">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{t('gradedWork')}</span>
                                <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-1 font-display group-hover:text-emerald-500 transition-colors">
                                    {recentGrades.length}
                                </div>
                                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5 block">Graded & Feedback</span>
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-md shadow-emerald-500/10 translate-z-30 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                                <Award className="w-7 h-7" />
                            </div>
                        </TiltCard3D>
                    </div>

                    {/* Section 1: 3D Interactive Enrolled Subject Cabinets */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-xl font-display">{t('myCourseCabinets')}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('accessLecturesSubtitle')}</p>
                            </div>
                        </div>

                        {enrolledSubjects.length === 0 ? (
                            <div className="liquid-glass rounded-3xl p-12 text-center text-xs text-slate-400 border border-white/80 dark:border-white/10">
                                <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="font-semibold text-slate-600 dark:text-slate-300">{t('noEnrolledSubjects')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 perspective-1000">
                                {enrolledSubjects.map((subj) => (
                                    <SubjectCard3D
                                        key={subj.id}
                                        subject={subj}
                                        url={route('subjects.show', subj.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Split View: Upcoming Deadlines & Recent Grades */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Upcoming Deadlines with Liquid Glass */}
                        <div className="liquid-glass rounded-3xl border border-white/80 dark:border-white/10 shadow-sm p-6 sm:p-7">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2 font-display">
                                    <Clock className="w-4 h-4 text-amber-500" />
                                    <span>{t('upcomingDeadlines')}</span>
                                </h3>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                    {upcomingAssignments.length} pending
                                </span>
                            </div>

                            {upcomingAssignments.length === 0 ? (
                                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">{t('noUpcomingDeadlines')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingAssignments.map((assign) => (
                                        <div
                                            key={assign.id}
                                            className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 group"
                                        >
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#FF5E36] transition-colors">
                                                    {assign.title}
                                                </div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                                    {assign.subject?.title}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                                        {t('due')}: {new Date(assign.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <CountdownTimer deadline={assign.deadline} allowLate={assign.allow_late} />
                                                </div>
                                            </div>
                                            <Link
                                                href={route('subjects.show', assign.subject_id)}
                                                className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs shrink-0 text-center transition-all active:scale-95 ${
                                                    isFemale
                                                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-105'
                                                        : 'bg-gradient-to-r from-[#FF5E36] to-[#FF416C] hover:brightness-105'
                                                }`}
                                            >
                                                <span>{t('submit')}</span> &rarr;
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Grades with Liquid Glass */}
                        <div className="liquid-glass rounded-3xl border border-white/80 dark:border-white/10 shadow-sm p-6 sm:p-7">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2 font-display">
                                    <Award className="w-4 h-4 text-emerald-500" />
                                    <span>{t('recentGradesFeedback')}</span>
                                </h3>
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                                    {recentGrades.length} graded
                                </span>
                            </div>

                            {recentGrades.length === 0 ? (
                                <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-8">{t('noGradedSubmissions')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {recentGrades.map((sub) => (
                                        <div key={sub.id} className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 transition-all space-y-2">
                                            <div className="flex justify-between items-center gap-2">
                                                <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                                    {sub.assignment?.title}
                                                </div>
                                                <span className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 shadow-2xs">
                                                    {sub.grade} / {sub.assignment?.max_grade}
                                                </span>
                                            </div>
                                            {sub.feedback && (
                                                <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 italic">
                                                    "{sub.feedback}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
