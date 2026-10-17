import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import TiltCard3D from '@/Components/TiltCard3D';
import { 
    BookOpen, 
    FileText, 
    Download, 
    Eye, 
    Lock, 
    GraduationCap, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Upload, 
    Building2,
    Calendar,
    Award,
    ArrowLeft,
    DownloadCloud,
    Sparkles,
    Layers,
    FileSpreadsheet,
    Camera,
    Image as ImageIcon
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';
import CountdownTimer from '@/Components/CountdownTimer';

export default function StudentSubject({ subject = {}, enrolled = false, submissionMap = {} }) {
    const [submittingAssignment, setSubmittingAssignment] = useState(null);
    const { t } = useTranslation();
    const user = usePage().props.auth.user;
    const isFemale = user?.gender === 'female';

    const subjectColor = subject.color || '#FF5E36';

    const { data, setData, post, processing, reset, errors } = useForm({
        file: null,
        text_content: '',
    });

    const handleSubmitAssignment = (e) => {
        e.preventDefault();
        post(route('assignments.submit', submittingAssignment.id), {
            onSuccess: () => {
                setSubmittingAssignment(null);
                reset();
            }
        });
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('dashboard')}
                            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 transition-all shadow-sm border border-slate-200/80 dark:border-white/10 hover:scale-105"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span 
                                    className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border shadow-xs"
                                    style={{
                                        backgroundColor: `${subjectColor}15`,
                                        borderColor: `${subjectColor}40`,
                                        color: subjectColor
                                    }}
                                >
                                    {subject.code || 'COURSE'}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                                    {subject.title}
                                </h2>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                    {subject.university?.name}
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                    {subject.semester?.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`${subject.code} - ${subject.title}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">

                    {/* 3D Interactive Hero Cabinet Showcase */}
                    <TiltCard3D
                        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/20"
                        glowColor={`${subjectColor}40`}
                        maxTilt={8}
                    >
                        <div 
                            className="absolute inset-0 opacity-95 transition-opacity"
                            style={{
                                background: `linear-gradient(135deg, ${subjectColor}ee 0%, #0f172a 100%)`
                            }}
                        />
                        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                        <div className="absolute right-12 bottom-4 opacity-10 hidden md:flex items-end gap-2 pointer-events-none">
                            <div className="w-12 h-44 rounded-t-lg bg-white/30 transform -skew-x-3" />
                            <div className="w-10 h-52 rounded-t-lg bg-white/40 transform -skew-x-1" />
                            <div className="w-14 h-40 rounded-t-lg bg-white/20 transform skew-x-2" />
                            <div className="w-11 h-48 rounded-t-lg bg-white/50" />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div className="space-y-3 max-w-2xl">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-sm">
                                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                    <span>Interactive 3D Course Cabinet</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                                    {subject.title}
                                </h1>
                                <p className="text-sm text-white/80 leading-relaxed font-sans">
                                    {subject.description || 'Welcome to this interactive course cabinet. Explore verified slides, documents, syllabus notes, and active assignments with 3D interactions.'}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                    <span className="px-3 py-1 rounded-xl bg-black/25 backdrop-blur-md text-xs font-mono border border-white/10">
                                        {(subject.documents || []).length} {t('cabinetDocuments')}
                                    </span>
                                    <span className="px-3 py-1 rounded-xl bg-black/25 backdrop-blur-md text-xs font-mono border border-white/10">
                                        {(subject.assignments || []).length} {t('assignmentsAndProjects')}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                                {(subject.documents || []).some(d => d.is_downloadable && !d.is_view_only) && (
                                    <a
                                        href={route('subjects.download-pack', subject.id)}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 text-xs font-extrabold shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group"
                                        title="Download all downloadable lecture slides as a single ZIP file"
                                    >
                                        <DownloadCloud className="w-4 h-4 text-indigo-600 group-hover:animate-bounce" />
                                        <span>{t('downloadCoursePack', 'Download Course Pack (.zip)')}</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </TiltCard3D>

                    {/* Guidelines & Bulletins Box */}
                    {(subject.updates || []).length > 0 && (
                        <div className="liquid-glass rounded-3xl p-6 border border-amber-200/80 shadow-glass">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shadow-inner">
                                    <AlertCircle className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-amber-950 text-base font-display">{t('courseAnnouncements')}</h3>
                            </div>
                            <div className="space-y-3">
                                {subject.updates.map((update) => (
                                    <div key={update.id} className="liquid-glass-frosted rounded-2xl p-4 border border-amber-200/50 hover:border-amber-300 transition-colors">
                                        <h4 className="font-bold text-slate-900 text-sm font-display">{update.title}</h4>
                                        <p className="text-xs text-slate-600 mt-1 whitespace-pre-line leading-relaxed">{update.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section 1: Lecture Materials Cabinet */}
                    <div className="liquid-glass rounded-3xl border border-white/60 dark:border-white/10 shadow-glass overflow-hidden">
                        <div className="p-6 border-b border-slate-100/80 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner border"
                                    style={{
                                        backgroundColor: `${subjectColor}15`,
                                        borderColor: `${subjectColor}30`,
                                        color: subjectColor
                                    }}
                                >
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base font-display">{t('lectureMaterialsBooks')}</h3>
                                        {isFemale && (
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                Rose Tab
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('officialPresentationsSubtitle')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-semibold px-3 py-1 bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-200 rounded-xl shadow-xs shrink-0">
                                    {(subject.documents || []).length} {t('items')}
                                </span>
                            </div>
                        </div>

                        {(subject.documents || []).length === 0 ? (
                            <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                                {t('noMaterialsPublished')}
                            </div>
                        ) : (
                            <div className="overflow-x-auto w-full scrollbar-thin">
                                <div className="min-w-[640px] divide-y divide-slate-150/70 dark:divide-white/5 bg-white/40 dark:bg-slate-900/40">
                                    {subject.documents.map((doc) => (
                                        <div key={doc.id} className="p-5 flex items-center justify-between gap-4 hover:bg-white/80 dark:hover:bg-slate-800/60 transition-all duration-200 group border-b border-slate-100 dark:border-white/5 last:border-b-0">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div 
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs border transition-transform duration-200 group-hover:scale-105"
                                                    style={{
                                                        backgroundColor: `${subjectColor}15`,
                                                        borderColor: `${subjectColor}35`,
                                                        color: subjectColor
                                                    }}
                                                >
                                                    {doc.file_type || 'DOC'}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#FF5E36] transition-colors font-display truncate">{doc.title}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{doc.description}</p>
                                                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5 font-mono">
                                                        <span>{formatBytes(doc.file_size)}</span>
                                                        {doc.is_view_only ? (
                                                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold font-sans">
                                                                <Lock className="w-3 h-3" />
                                                                {t('viewOnlyReading')}
                                                            </span>
                                                        ) : (
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-sans">
                                                                {t('downloadable')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5 shrink-0">
                                                {/* Fully Highlighted View / Read Button */}
                                                <a
                                                    href={route('documents.view', doc.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 ${
                                                        isFemale
                                                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-rose-500/25 hover:brightness-105'
                                                            : 'bg-[#ff5e36] text-white hover:bg-[#e04822] shadow-[#ff5e36]/30'
                                                    }`}
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>{t('viewOnline')}</span>
                                                </a>
                                                {doc.is_downloadable && !doc.is_view_only && (
                                                    <a
                                                        href={route('documents.download', doc.id)}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${subjectColor} 0%, #1e1b4b 100%)`,
                                                            boxShadow: `0 4px 12px ${subjectColor}33`
                                                        }}
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>{t('download')}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Course Assignments with Student Marks */}
                    <div className="liquid-glass rounded-3xl border border-white/60 dark:border-white/10 shadow-glass overflow-hidden">
                        <div className="p-6 border-b border-slate-100/80 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#FF5E36] flex items-center justify-center shadow-inner">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base font-display">{t('assignmentsAndProjects')}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('trackDueDatesSubtitle')}</p>
                                </div>
                            </div>
                        </div>

                        {(subject.assignments || []).length === 0 ? (
                            <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                                {t('noAssignmentsCreated')}
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100/70 dark:divide-white/5 bg-white/30 dark:bg-slate-900/20">
                                {subject.assignments.map((assign) => {
                                    const submission = submissionMap[assign.id];
                                    const isDue = new Date(assign.deadline) < new Date();

                                    return (
                                        <div key={assign.id} className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-white/60 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-white/5 last:border-b-0">
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-base font-display">{assign.title}</h4>
                                                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-[#FF5E36] dark:text-[#ff7a54]">
                                                        {assign.max_grade} {t('pts')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">{assign.description}</p>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                                                        <Clock className="w-3.5 h-3.5 text-[#FF5E36]" />
                                                        {t('deadline')}: {new Date(assign.deadline).toLocaleString()}
                                                    </span>
                                                    <CountdownTimer deadline={assign.deadline} allowLate={assign.allow_late} />
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex flex-col sm:items-end gap-2">
                                                {submission ? (
                                                    submission.status === 'graded' ? (
                                                        <div className="flex flex-col sm:items-end gap-1.5">
                                                            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
                                                                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                                <span>{t('score')}: {submission.grade} / {assign.max_grade}</span>
                                                                <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px]">
                                                                    {Math.round((submission.grade / assign.max_grade) * 100)}%
                                                                </span>
                                                            </div>
                                                            {submission.feedback && (
                                                                <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 max-w-xs shadow-xs">
                                                                    <span className="font-bold text-slate-800 dark:text-white">Feedback: </span>
                                                                    "{submission.feedback}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col sm:items-end gap-1">
                                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shadow-xs">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                                                                {t('submittedPending')}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400">Under review by Dr. Mohammad Sulieman</span>
                                                        </div>
                                                    )
                                                ) : isDue && !assign.allow_late ? (
                                                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-not-allowed">
                                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                        {t('deadlineLocked', 'Deadline Locked')}
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => setSubmittingAssignment(assign)}
                                                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95 ${
                                                            isDue
                                                                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                                                                : isFemale
                                                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 hover:brightness-105 shadow-rose-500/20'
                                                                : 'bg-gradient-to-r from-[#FF5E36] to-[#FF416C] hover:brightness-105 shadow-[#FF5E36]/20'
                                                        }`}
                                                    >
                                                        <Upload className="w-3.5 h-3.5" />
                                                        {isDue ? t('turnInLate', 'Turn In (Late)') : t('turnInAssignment')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Turn In Assignment Modal with Direct Mobile Camera Capture */}
            {submittingAssignment && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="liquid-glass rounded-3xl border border-white/60 dark:border-white/10 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden bg-white/95 dark:bg-[#121622]/95 max-h-[92vh] overflow-y-auto">
                        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#ff5e36]/15 blur-2xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">{t('turnInAssignment')}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{submittingAssignment.title}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setSubmittingAssignment(null);
                                    reset();
                                }}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <Lock className="w-4 h-4 hidden" />
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmitAssignment} className="space-y-4">
                            {/* Upload Options: Regular File OR Camera Photo Scan */}
                            <div className="space-y-3">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Submission File or Handwritten Report Scan
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {/* Direct Mobile Camera Capture Button */}
                                    <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-[#ff5e36]/50 bg-[#ff5e36]/5 hover:bg-[#ff5e36]/10 text-[#ff5e36] cursor-pointer transition-all hover:scale-[1.02] active:scale-95 text-center">
                                        <Camera className="w-6 h-6" />
                                        <div>
                                            <span className="text-xs font-bold block">Snap with Camera</span>
                                            <span className="text-[10px] opacity-75">Scan handwritten paper</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setData('file', file);
                                                }
                                            }}
                                        />
                                    </label>

                                    {/* Standard File Upload (PDF, Word, etc.) */}
                                    <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 text-slate-600 dark:text-slate-300 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 text-center">
                                        <Upload className="w-6 h-6 text-slate-400" />
                                        <div>
                                            <span className="text-xs font-bold block">Browse Files</span>
                                            <span className="text-[10px] text-slate-400">PDF, Word, or Image</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setData('file', file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>

                                {/* File selected indicator */}
                                {data.file && (
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                                        <div className="flex items-center gap-2 truncate">
                                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                                            <span className="font-semibold truncate">{data.file.name}</span>
                                            <span className="text-[10px] font-mono text-emerald-600">({(data.file.size / 1024).toFixed(0)} KB)</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData('file', null)}
                                            className="text-xs text-rose-600 hover:underline font-bold shrink-0 ml-2"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}

                                {errors.file && <p className="text-xs text-rose-600">{errors.file}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('notesRepoLink')}
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder={t('notesPlaceholder')}
                                    value={data.text_content}
                                    onChange={(e) => setData('text_content', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-[#ff5e36]/30 focus:border-[#ff5e36] text-slate-800 dark:text-white transition-all"
                                />
                            </div>

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSubmittingAssignment(null);
                                        reset();
                                    }}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-xl transition-colors"
                                >
                                    {t('cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing || (!data.file && !data.text_content.trim())}
                                    className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-[#ff5e36] to-[#ff416c] text-white rounded-xl shadow-md shadow-[#ff5e36]/25 hover:brightness-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Submitting...' : t('submitWork')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
