import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    GraduationCap, 
    ArrowLeft, 
    CheckCircle2, 
    Clock, 
    FileText, 
    Download, 
    Award,
    MessageSquare,
    Bot,
    ScanLine,
    ShieldAlert,
    Sparkles,
    Check,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export default function SubmissionsIndex({ assignment = {}, submissions = [] }) {
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [expandedOcr, setExpandedOcr] = useState({});

    const { data, setData, post, processing, reset } = useForm({
        grade: '',
        feedback: '',
        ocr_text: '',
        ai_probability: '',
        ai_verdict: '',
    });

    const toggleOcr = (id) => {
        setExpandedOcr(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const openGrading = (sub) => {
        setGradingSubmission(sub);
        const pendingAction = sub.pending_agent_action;

        setData({
            grade: sub.grade !== null && sub.grade !== undefined 
                ? sub.grade 
                : (pendingAction?.grade !== undefined ? pendingAction.grade : ''),
            feedback: sub.feedback || pendingAction?.feedback || '',
            ocr_text: sub.ocr_text || pendingAction?.ocr_text || '',
            ai_probability: sub.ai_probability ?? pendingAction?.ai_generated_probability ?? '',
            ai_verdict: sub.ai_verdict || pendingAction?.ai_detection_verdict || '',
        });
    };

    const handleSaveGrade = (e) => {
        e.preventDefault();
        post(route('admin.submissions.grade', gradingSubmission.id), {
            onSuccess: () => {
                setGradingSubmission(null);
                reset();
            }
        });
    };

    const handleQuickAcceptAgent = (sub) => {
        if (!sub.pending_agent_action) return;
        const act = sub.pending_agent_action;
        router.post(route('admin.agent-actions.approve', act.id), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.subjects.show', assignment.subject_id)}
                            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/20 px-2.5 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-500/30 font-mono">
                                    {assignment.subject?.code || 'COURSE'}
                                </span>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                                    {assignment.title}
                                </h2>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Submissions & Grading • Max Score: {assignment.max_grade} pts • Due: {new Date(assignment.deadline).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.agent-actions.index')}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
                    >
                        <Bot className="w-4 h-4" />
                        <span>OpenClaw Approval Hub</span>
                    </Link>
                </div>
            }
        >
            <Head title={`Submissions - ${assignment.title}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base font-display">
                                Student Submissions ({submissions.length})
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span>{submissions.filter(s => s.status === 'graded').length} Graded</span>
                                <span>•</span>
                                <span>{submissions.filter(s => s.status === 'pending').length} Pending Review</span>
                                <span>•</span>
                                <span className="text-amber-500 font-bold">
                                    {submissions.filter(s => !!s.pending_agent_action).length} OpenClaw Recommendations
                                </span>
                            </div>
                        </div>

                        {submissions.length === 0 ? (
                            <div className="p-12 text-center text-slate-400 text-sm">
                                No students have submitted work for this assignment yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/10">
                                        <tr>
                                            <th className="px-6 py-3.5">Student</th>
                                            <th className="px-6 py-3.5">Submission & Attachments</th>
                                            <th className="px-6 py-3.5">AI Check & OCR</th>
                                            <th className="px-6 py-3.5">Turned In</th>
                                            <th className="px-6 py-3.5">Score Status</th>
                                            <th className="px-6 py-3.5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                        {submissions.map((sub) => {
                                            const pendingAct = sub.pending_agent_action;
                                            const aiProb = sub.ai_probability ?? pendingAct?.ai_generated_probability;
                                            const ocrText = sub.ocr_text || pendingAct?.ocr_text;

                                            return (
                                                <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                    {/* Student Info */}
                                                    <td className="px-6 py-4">
                                                        <div className="font-semibold text-slate-900 dark:text-white">{sub.user?.name}</div>
                                                        <div className="text-xs font-mono text-slate-400">{sub.user?.student_id_no || sub.user?.email}</div>
                                                    </td>

                                                    {/* File Attachment & Text */}
                                                    <td className="px-6 py-4 max-w-xs">
                                                        {sub.file_path && (
                                                            <a
                                                                href={`/storage/${sub.file_path}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mb-1"
                                                            >
                                                                <Download className="w-3.5 h-3.5" />
                                                                <span className="truncate">{sub.file_name || 'Download Work'}</span>
                                                            </a>
                                                        )}
                                                        {sub.text_content && (
                                                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                                                                "{sub.text_content}"
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* AI Check & OCR */}
                                                    <td className="px-6 py-4">
                                                        <div className="space-y-1.5">
                                                            {aiProb !== null && aiProb !== undefined ? (
                                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                                                    aiProb >= 70
                                                                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                                                        : aiProb >= 35
                                                                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                                                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                                }`}>
                                                                    <ShieldAlert className="w-3 h-3" />
                                                                    {aiProb}% AI ({sub.ai_verdict || pendingAct?.ai_detection_verdict || (aiProb >= 60 ? 'Likely AI' : 'Human')})
                                                                </span>
                                                            ) : (
                                                                <span className="text-[11px] text-slate-400 font-mono">No AI scan</span>
                                                            )}

                                                            {ocrText && (
                                                                <div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleOcr(sub.id)}
                                                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                                                                    >
                                                                        <ScanLine className="w-3 h-3" />
                                                                        <span>Handwriting OCR</span>
                                                                    </button>

                                                                    {expandedOcr[sub.id] && (
                                                                        <div className="mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-200 max-h-32 overflow-y-auto whitespace-pre-wrap">
                                                                            {ocrText}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Turned In */}
                                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                                                        <div>{new Date(sub.submitted_at || sub.created_at).toLocaleString()}</div>
                                                        {sub.is_late && (
                                                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                                                                Late Submission
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Score Status */}
                                                    <td className="px-6 py-4">
                                                        {sub.status === 'graded' ? (
                                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                                                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                {sub.grade} / {assignment.max_grade}
                                                            </div>
                                                        ) : pendingAct ? (
                                                            <div className="space-y-1">
                                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                                                                    <Bot className="w-3 h-3" />
                                                                    Agent: {pendingAct.grade}/{assignment.max_grade}
                                                                </span>
                                                                <p className="text-[10px] text-slate-400">Pending Permission</p>
                                                            </div>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                                                <Clock className="w-3 h-3 text-slate-400" />
                                                                Pending Review
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Action Buttons */}
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {pendingAct && sub.status !== 'graded' && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleQuickAcceptAgent(sub)}
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                                                                    title="Accept OpenClaw recommended grade and feedback"
                                                                >
                                                                    <Check className="w-3.5 h-3.5" />
                                                                    <span>Accept {pendingAct.grade}pts</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => openGrading(sub)}
                                                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
                                                            >
                                                                {sub.status === 'graded' ? 'Edit Score' : 'Review & Grade'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Grading Modal */}
            {gradingSubmission && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                                    Grade Submission
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Student: <span className="font-semibold text-slate-800 dark:text-slate-200">{gradingSubmission.user?.name}</span> (Max: {assignment.max_grade} pts)
                                </p>
                            </div>
                            {gradingSubmission.file_path && (
                                <a
                                    href={`/storage/${gradingSubmission.file_path}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download Work
                                </a>
                            )}
                        </div>

                        {/* OpenClaw Agent Recommendation Banner inside modal if present */}
                        {gradingSubmission.pending_agent_action && (
                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                                <div className="flex items-center justify-between font-bold text-amber-700 dark:text-amber-400">
                                    <span className="flex items-center gap-1.5">
                                        <Bot className="w-4 h-4" />
                                        OpenClaw Recommendation:
                                    </span>
                                    <span className="font-mono text-sm">{gradingSubmission.pending_agent_action.grade} / {assignment.max_grade} pts</span>
                                </div>
                                {gradingSubmission.pending_agent_action.reasoning && (
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                                        {gradingSubmission.pending_agent_action.reasoning}
                                    </p>
                                )}
                                {gradingSubmission.pending_agent_action.ai_generated_probability !== null && (
                                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                        AI Probability: {gradingSubmission.pending_agent_action.ai_generated_probability}% ({gradingSubmission.pending_agent_action.ai_detection_verdict})
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={handleSaveGrade} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Score (0 - {assignment.max_grade}) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max={assignment.max_grade}
                                    value={data.grade}
                                    onChange={(e) => setData('grade', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-lg font-bold border border-slate-200 dark:border-white/10 rounded-2xl bg-white/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Feedback / Professor Notes
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Provide constructive feedback for the student..."
                                    value={data.feedback}
                                    onChange={(e) => setData('feedback', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-2xl bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none leading-relaxed"
                                />
                            </div>

                            {data.ocr_text && (
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Handwriting OCR Text (Captured by OpenClaw)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={data.ocr_text}
                                        onChange={(e) => setData('ocr_text', e.target.value)}
                                        className="w-full px-3 py-2 text-xs font-mono border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 outline-none"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setGradingSubmission(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all"
                                >
                                    Publish Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
