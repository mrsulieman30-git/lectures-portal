import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Bot, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ShieldAlert, 
    FileText, 
    Sparkles, 
    Award, 
    Download, 
    Eye, 
    Key, 
    ChevronDown, 
    ChevronUp, 
    AlertTriangle, 
    Send, 
    Check, 
    X,
    Cpu,
    ScanLine,
    ArrowUpRight
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

export default function AgentActionsIndex({ 
    pendingActions = [], 
    recentHistory = [], 
    stats = {} 
}) {
    const { t } = useTranslation();
    const [selectedTab, setSelectedTab] = useState('pending'); // 'pending' | 'history' | 'api_guide'
    const [expandedOcr, setExpandedOcr] = useState({});
    const [rejectingAction, setRejectingAction] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [editingAction, setEditingAction] = useState(null);

    const { data: editData, setData: setEditData, post: postEdit, processing: editProcessing } = useForm({
        grade: '',
        feedback: '',
    });

    const toggleOcr = (id) => {
        setExpandedOcr(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleApprove = (actionId) => {
        router.post(route('admin.agent-actions.approve', actionId), {}, {
            preserveScroll: true,
        });
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectingAction) return;
        router.post(route('admin.agent-actions.reject', rejectingAction.id), {
            reason: rejectReason || 'Declined by professor',
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setRejectingAction(null);
                setRejectReason('');
            }
        });
    };

    const openEditModal = (action) => {
        setEditingAction(action);
        setEditData({
            grade: action.grade || '',
            feedback: action.feedback || '',
        });
    };

    const handleEditAndApprove = (e) => {
        e.preventDefault();
        if (!editingAction || !editingAction.target_id) return;
        router.post(route('admin.submissions.grade', editingAction.target_id), {
            grade: editData.grade,
            feedback: editData.feedback,
            ocr_text: editingAction.ocr_text,
            ai_probability: editingAction.ai_generated_probability,
            ai_verdict: editingAction.ai_detection_verdict,
        }, {
            preserveScroll: true,
            onSuccess: () => setEditingAction(null)
        });
    };

    const handleApproveAll = () => {
        if (!confirm(`Are you sure you want to approve and apply all ${pendingActions.length} pending agent proposals?`)) return;
        const ids = pendingActions.map(a => a.id);
        router.post(route('admin.agent-actions.batch-approve'), {
            action_ids: ids,
        }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                            <Bot className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display leading-tight">
                                    Agent Approval Hub
                                </h2>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono">
                                    <Cpu className="w-3 h-3" />
                                    OpenClaw Connected
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                Human-in-the-Loop review: Inspect handwriting OCR transcriptions and AI-detection before approving grades.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {pendingActions.length > 0 && (
                            <button
                                onClick={handleApproveAll}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Approve All ({pendingActions.length})</span>
                            </button>
                        )}
                        <button
                            onClick={() => setSelectedTab('api_guide')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold transition-all"
                        >
                            <Key className="w-3.5 h-3.5 text-amber-500" />
                            <span>API Guide</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Agent Approvals & Control Hub - OpenClaw" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="liquid-glass rounded-2xl p-5 border border-amber-500/20 dark:border-amber-500/20 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                    Pending Approvals
                                </span>
                                <Clock className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-display">
                                {stats.pending_count || 0}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">Awaiting your permission</p>
                        </div>

                        <div className="liquid-glass rounded-2xl p-5 border border-emerald-500/20 dark:border-emerald-500/20 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                    Approved & Applied
                                </span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-display">
                                {stats.approved_count || 0}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">Grades released to students</p>
                        </div>

                        <div className="liquid-glass rounded-2xl p-5 border border-indigo-500/20 dark:border-indigo-500/20 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                    Handwriting OCR
                                </span>
                                <ScanLine className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-display">
                                {stats.ocr_count || 0}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">Images & handwriting read</p>
                        </div>

                        <div className="liquid-glass rounded-2xl p-5 border border-rose-500/20 dark:border-rose-500/20 shadow-sm relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                                    Rejected Proposals
                                </span>
                                <XCircle className="w-4 h-4 text-rose-500" />
                            </div>
                            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-display">
                                {stats.rejected_count || 0}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">Declined or adjusted</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
                        <button
                            type="button"
                            onClick={() => setSelectedTab('pending')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedTab === 'pending'
                                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            Pending Proposals ({pendingActions.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTab('history')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedTab === 'history'
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            Action History ({recentHistory.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedTab('api_guide')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                selectedTab === 'api_guide'
                                    ? 'bg-slate-800 text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                        >
                            OpenClaw & Telegram Integration
                        </button>
                    </div>

                    {/* TAB 1: PENDING PROPOSALS */}
                    {selectedTab === 'pending' && (
                        <div className="space-y-6">
                            {pendingActions.length === 0 ? (
                                <div className="liquid-glass rounded-3xl border border-white/60 dark:border-white/10 p-12 text-center max-w-lg mx-auto">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                                        All Clear! No Pending Actions
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                                        When OpenClaw reviews student submissions or OCRs handwritten assignments, its suggested grades and AI-checks will appear here for your 1-click approval.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {pendingActions.map((action) => {
                                        const details = action.target_details || {};
                                        const isOcrOpen = expandedOcr[action.id];
                                        const aiProb = action.ai_generated_probability;

                                        return (
                                            <div 
                                                key={action.id}
                                                className="liquid-glass rounded-3xl border border-amber-500/30 dark:border-amber-500/20 p-6 sm:p-7 shadow-glass relative overflow-hidden space-y-5 transition-all"
                                            >
                                                {/* Header Row */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 shadow-inner">
                                                            <Bot className="w-5 h-5" />
                                                        </span>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                                                    {details.student_name || 'Student Submission'}
                                                                </h4>
                                                                <span className="text-xs font-mono font-bold text-slate-400">
                                                                    ({details.student_id || 'ID'})
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                {details.course_code ? `[${details.course_code}] ` : ''}{details.assignment_title || 'Assignment'}
                                                                {details.is_late && <span className="ml-2 text-rose-500 font-bold uppercase text-[10px]">Late</span>}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Score & AI Verdict Badges */}
                                                    <div className="flex items-center gap-3">
                                                        {/* AI Probability Badge */}
                                                        {aiProb !== null && aiProb !== undefined && (
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                                                                aiProb >= 70
                                                                    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                                                    : aiProb >= 35
                                                                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                                                    : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                                            }`}>
                                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                                <span>AI Check: {aiProb}% ({action.ai_detection_verdict || (aiProb >= 60 ? 'Likely AI' : 'Human Written')})</span>
                                                            </span>
                                                        )}

                                                        {/* Proposed Grade Pill */}
                                                        <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                                                            <Award className="w-4 h-4 text-indigo-500" />
                                                            <span className="text-xs font-semibold">Suggested:</span>
                                                            <span className="text-base font-extrabold font-mono">
                                                                {action.grade} / {details.max_grade || 100}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content Grid: Original File / Submission Text & Agent Rubric Rationale */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    {/* Left: Original Submission Info */}
                                                    <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/10 space-y-3">
                                                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                            <span>Student Attached Work</span>
                                                            {details.file_path && (
                                                                <a 
                                                                    href={details.file_path} 
                                                                    target="_blank" 
                                                                    rel="noreferrer"
                                                                    className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold"
                                                                >
                                                                    <Download className="w-3.5 h-3.5" />
                                                                    Download File
                                                                </a>
                                                            )}
                                                        </div>

                                                        {details.file_name && (
                                                            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-300">
                                                                <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                                                <span className="truncate">{details.file_name}</span>
                                                            </div>
                                                        )}

                                                        {details.submitted_text && (
                                                            <div className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                                                                "{details.submitted_text}"
                                                            </div>
                                                        )}

                                                        {/* OCR Handwriting Transcription Dropdown */}
                                                        {action.ocr_text && (
                                                            <div className="pt-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleOcr(action.id)}
                                                                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-500/20 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/70 transition-all"
                                                                >
                                                                    <span className="flex items-center gap-1.5">
                                                                        <ScanLine className="w-4 h-4 text-indigo-500" />
                                                                        <span>Handwriting OCR Transcription ({action.ocr_text.length} chars)</span>
                                                                    </span>
                                                                    {isOcrOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                                </button>

                                                                {isOcrOpen && (
                                                                    <div className="mt-2 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/20 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed shadow-inner">
                                                                        {action.ocr_text}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right: Agent Reasoning & Proposed Feedback */}
                                                    <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-slate-800/60 border border-amber-500/20 dark:border-white/10 space-y-3">
                                                        <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-between">
                                                            <span>Agent Rubric Rationale</span>
                                                            <span className="text-[11px] font-mono text-slate-400">By {action.agent?.name || 'OpenClaw'}</span>
                                                        </div>

                                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                                                            {action.reasoning || 'Evaluated against assignment questions and rubric criteria.'}
                                                        </p>

                                                        <div className="pt-2 border-t border-slate-200/60 dark:border-white/10">
                                                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                                                                Student Feedback Message:
                                                            </span>
                                                            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/10 text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
                                                                "{action.feedback}"
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Bar */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/10">
                                                    <span className="text-[11px] text-slate-400 font-mono">
                                                        Proposed on {new Date(action.created_at).toLocaleString()}
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setRejectingAction(action)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition-all"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                            <span>Reject</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(action)}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                                                        >
                                                            <span>Edit Grade</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(action.id)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/25 hover:scale-105 active:scale-95 transition-all"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            <span>Approve & Release Grade</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: AUDIT HISTORY */}
                    {selectedTab === 'history' && (
                        <div className="liquid-glass rounded-3xl border border-white/60 dark:border-white/10 overflow-hidden shadow-glass">
                            <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                    Agent Action Audit Trail ({recentHistory.length})
                                </h3>
                                <span className="text-xs text-slate-400">
                                    Full history of approved and declined automated proposals
                                </span>
                            </div>

                            {recentHistory.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 text-sm">
                                    No historical agent actions recorded yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                                        <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase tracking-wider text-[11px] font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/10">
                                            <tr>
                                                <th className="px-6 py-3.5">Action ID</th>
                                                <th className="px-6 py-3.5">Type & Target</th>
                                                <th className="px-6 py-3.5">Agent Details</th>
                                                <th className="px-6 py-3.5">Outcome</th>
                                                <th className="px-6 py-3.5">Reviewed By</th>
                                                <th className="px-6 py-3.5 text-right">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-white/10 font-mono">
                                            {recentHistory.map((h) => (
                                                <tr key={h.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                                        #{h.id}
                                                    </td>
                                                    <td className="px-6 py-4 font-sans">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                                                            {h.action_type}
                                                        </div>
                                                        {h.grade !== null && (
                                                            <div className="text-[11px] text-slate-400 font-mono">
                                                                Grade: {h.grade} pts • AI Prob: {h.ai_generated_probability ?? 'N/A'}%
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-sans">
                                                        <div className="font-medium text-slate-700 dark:text-slate-300">
                                                            {h.agent?.name || 'Agent'}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400">{h.agent?.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {h.status === 'approved' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                                Approved & Applied
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                                                Rejected
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-sans">
                                                        <div className="font-medium text-slate-700 dark:text-slate-200">
                                                            {h.reviewer?.name || 'Professor'}
                                                        </div>
                                                        {h.rejection_reason && (
                                                            <p className="text-[11px] text-rose-500 italic mt-0.5">
                                                                "{h.rejection_reason}"
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-[11px] text-slate-400">
                                                        {new Date(h.reviewed_at || h.created_at).toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: OPENCLAW & TELEGRAM INTEGRATION GUIDE */}
                    {selectedTab === 'api_guide' && (
                        <div className="liquid-glass rounded-3xl border border-white/60 dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-glass">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">
                                    OpenClaw & Telegram Integration Architecture
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    How your external OpenClaw agent connects with username & password, handles OCR/AI detection, and requests permission.
                                </p>
                            </div>

                            {/* Workflow Diagram */}
                            <div className="p-5 rounded-2xl bg-slate-900 text-white font-mono text-xs space-y-3 border border-white/10">
                                <div className="text-cyan-400 font-bold">1. Authentication (Username & Password)</div>
                                <p className="text-slate-400">
                                    POST /api/agent/login with email & password. OpenClaw receives a Bearer Token.
                                </p>
                                <div className="text-cyan-400 font-bold pt-2">2. Fetching Work to Grade</div>
                                <p className="text-slate-400">
                                    GET /api/agent/submissions/pending. OpenClaw receives student handwriting photos, PDFs, and assignment rubrics.
                                </p>
                                <div className="text-cyan-400 font-bold pt-2">3. OCR & AI-Detection Grading Proposal</div>
                                <p className="text-slate-400">
                                    POST /api/agent/submissions/{'{id}'}/propose-grade with <code className="text-amber-300">grade</code>, <code className="text-amber-300">feedback</code>, <code className="text-amber-300">ocr_text</code>, and <code className="text-amber-300">ai_probability</code>.
                                </p>
                                <div className="text-cyan-400 font-bold pt-2">4. Human-In-The-Loop Approval (Required)</div>
                                <p className="text-slate-400">
                                    The action is placed in <code className="text-emerald-300">pending_approval</code>. You can approve it with 1-click in this web portal or via your Telegram bot calling <code className="text-emerald-300">POST /api/agent/actions/{'{id}'}/approve</code>.
                                </p>
                            </div>

                            {/* Quick Curl Example */}
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                                    Example OpenClaw Proposal Request (cURL)
                                </span>
                                <pre className="p-4 rounded-2xl bg-slate-950 text-cyan-300 font-mono text-xs overflow-x-auto border border-white/10 leading-relaxed">
{`curl -X POST https://your-domain/api/agent/submissions/42/propose-grade \\
  -H "Authorization: Bearer YOUR_OPENCLAW_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "grade": 94,
    "feedback": "Outstanding work on questions 1-4. Clear derivations in handwritten steps.",
    "ocr_text": "Student handwriting OCR extracted text: Question 1: f(x) = 3x^2 + 2x...",
    "ai_probability": 4.5,
    "ai_verdict": "Human Written",
    "reasoning": "Accurate handwriting, step-by-step mathematical logic matching assignment rubric."
  }'`}
                                </pre>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Reject Modal */}
            {rejectingAction && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="liquid-glass rounded-3xl border border-white/60 dark:border-white/10 dark:bg-slate-900 max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                                <XCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                    Reject Agent Proposal
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Provide feedback so OpenClaw or your agent logs why it was declined.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                                    Rejection Reason (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="e.g. Handwriting OCR missed page 2, or score was too lenient for question 3..."
                                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500/20"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingAction(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition-all"
                                >
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Grade Modal */}
            {editingAction && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="liquid-glass rounded-3xl border border-white/60 dark:border-white/10 dark:bg-slate-900 max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
                                <Award className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                    Adjust Score & Approve
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Modify the agent's proposed grade or feedback before publishing.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleEditAndApprove} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                                    Adjusted Grade (0 - {editingAction.target_details?.max_grade || 100}) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max={editingAction.target_details?.max_grade || 100}
                                    value={editData.grade}
                                    onChange={(e) => setEditData('grade', e.target.value)}
                                    className="w-full px-3.5 py-2 text-sm font-bold text-slate-900 dark:text-white rounded-2xl bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                                    Feedback to Student
                                </label>
                                <textarea
                                    rows={4}
                                    value={editData.feedback}
                                    onChange={(e) => setEditData('feedback', e.target.value)}
                                    className="w-full px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 rounded-2xl bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingAction(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all"
                                >
                                    Approve with Adjusted Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
