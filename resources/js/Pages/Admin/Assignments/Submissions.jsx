import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
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
    ChevronUp,
    Eye,
    X,
    Copy,
    UserX,
    Search,
    ExternalLink,
    Paperclip,
    AlertCircle,
    Edit3
} from 'lucide-react';
import RichTextRenderer from '@/Components/RichTextRenderer';
import RichTextEditor from '@/Components/RichTextEditor';

export default function SubmissionsIndex({ 
    assignment = {}, 
    submissions = [], 
    missingStudents = [] 
}) {
    // Robust fallback: use submissions prop or assignment.submissions relation
    const allSubmissions = useMemo(() => {
        if (Array.isArray(submissions) && submissions.length > 0) {
            return submissions;
        }
        if (Array.isArray(assignment?.submissions) && assignment.submissions.length > 0) {
            return assignment.submissions;
        }
        return [];
    }, [submissions, assignment]);

    const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' | 'missing'
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'graded'
    const [searchQuery, setSearchQuery] = useState('');
    const [showAssignmentDetails, setShowAssignmentDetails] = useState(false);

    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [expandedOcr, setExpandedOcr] = useState({});
    const [previewFile, setPreviewFile] = useState(null);
    const [copiedText, setCopiedText] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const { data: editData, setData: setEditData, processing: editProcessing, errors: editErrors } = useForm({
        title: assignment.title || '',
        description: assignment.description || '',
        deadline: '',
        max_grade: assignment.max_grade || 100,
        allow_late: assignment.allow_late ?? true,
        allow_resubmit: assignment.allow_resubmit ?? true,
        rubric: assignment.rubric || '',
        attachment: null,
    });

    const openEditAssignment = () => {
        const d = assignment.deadline ? new Date(assignment.deadline) : new Date();
        const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setEditData({
            title: assignment.title || '',
            description: assignment.description || '',
            deadline: localIso,
            max_grade: assignment.max_grade || 100,
            allow_late: assignment.allow_late ?? true,
            allow_resubmit: assignment.allow_resubmit ?? true,
            rubric: assignment.rubric || '',
            attachment: null,
        });
        setShowEditModal(true);
    };

    const addDaysToDeadline = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        d.setHours(23, 59, 0, 0);
        const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setEditData('deadline', localIso);
    };

    const handleUpdateAssignment = (e) => {
        e.preventDefault();
        if (editData.attachment) {
            router.post(route('admin.assignments.update', assignment.id), {
                _method: 'PATCH',
                ...editData,
            }, {
                forceFormData: true,
                onSuccess: () => {
                    setShowEditModal(false);
                }
            });
        } else {
            router.patch(route('admin.assignments.update', assignment.id), editData, {
                onSuccess: () => {
                    setShowEditModal(false);
                }
            });
        }
    };

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
            preserveScroll: true,
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

    // Quick score calculation from percentage of max_grade
    const applyPercentageScore = (percent) => {
        const max = assignment.max_grade || 100;
        const calculated = Math.round((max * percent) / 100);
        setData('grade', calculated);
    };

    const applyFeedbackPreset = (feedbackText) => {
        setData('feedback', feedbackText);
    };

    const copyStudentText = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
    };

    const isImageFile = (filePath = '') => {
        if (!filePath) return false;
        return /\.(png|jpe?g|webp|gif|bmp|svg|heic|tiff?)$/i.test(filePath);
    };

    const isPdfFile = (filePath = '') => {
        if (!filePath) return false;
        return /\.pdf$/i.test(filePath);
    };

    const getSubmissionFileUrl = (item, download = false) => {
        if (!item) return '';
        let url = item.file_url || (item.id ? route('submissions.file', item.id) : '');
        if (!url && item.file_path) {
            const clean = item.file_path.replace(/^(\/?storage\/|\/?public\/)/, '');
            url = `/storage/${clean}`;
        }
        if (download && url) {
            return url.includes('?') ? `${url}&download=1` : `${url}?download=1`;
        }
        return url;
    };

    const getAssignmentAttachmentUrl = (assign, download = false) => {
        if (!assign) return '';
        let url = assign.attachment_url || (assign.id ? route('assignments.attachment', assign.id) : '');
        if (!url && assign.attachment_path) {
            const clean = assign.attachment_path.replace(/^(\/?storage\/|\/?public\/)/, '');
            url = `/storage/${clean}`;
        }
        if (download && url) {
            return url.includes('?') ? `${url}&download=1` : `${url}?download=1`;
        }
        return url;
    };

    // Filter submissions
    const filteredSubmissions = useMemo(() => {
        return allSubmissions.filter((sub) => {
            const matchesStatus = 
                statusFilter === 'all' ? true :
                statusFilter === 'graded' ? sub.status === 'graded' :
                sub.status === 'pending';

            const name = sub.user?.name?.toLowerCase() || '';
            const email = sub.user?.email?.toLowerCase() || '';
            const idNo = sub.user?.student_id_no?.toLowerCase() || '';
            const query = searchQuery.toLowerCase().trim();

            const matchesSearch = !query || name.includes(query) || email.includes(query) || idNo.includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [allSubmissions, statusFilter, searchQuery]);

    const gradedCount = allSubmissions.filter(s => s.status === 'graded').length;
    const pendingCount = allSubmissions.filter(s => s.status === 'pending').length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.subjects.show', assignment.subject_id)}
                            className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-colors shadow-sm"
                            title="Back to Subject"
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
                                Submissions & Grading • Max Score: <span className="font-bold text-slate-700 dark:text-slate-300">{assignment.max_grade} pts</span> • Due: {new Date(assignment.deadline).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={openEditAssignment}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-white/10 shadow-xs transition-all hover:scale-105 active:scale-95"
                        >
                            <Edit3 className="w-3.5 h-3.5 text-[#ff5e36]" />
                            <span>Edit Assignment & Deadline</span>
                        </button>

                        {assignment.attachment_path && (
                            <a
                                href={getAssignmentAttachmentUrl(assignment)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-white/10 transition-colors"
                            >
                                <Paperclip className="w-3.5 h-3.5 text-[#ff5e36]" />
                                <span>Assignment Brief</span>
                            </a>
                        )}

                        <Link
                            href={route('admin.agent-actions.index')}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition-all"
                        >
                            <Bot className="w-4 h-4" />
                            <span>OpenClaw Approval Hub</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Submissions - ${assignment.title}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Assignment Instructions & Rubric Card (Collapsible) */}
                    <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setShowAssignmentDetails(!showAssignmentDetails)}
                            className="w-full p-4 sm:px-6 flex items-center justify-between text-left hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                            <div className="flex items-center gap-2.5">
                                <FileText className="w-4 h-4 text-[#ff5e36]" />
                                <span className="font-bold text-slate-900 dark:text-white text-sm">
                                    Assignment Prompt & Grading Criteria
                                </span>
                                <span className="text-xs text-slate-400">
                                    ({showAssignmentDetails ? 'Click to collapse' : 'Click to read assignment details'})
                                </span>
                            </div>
                            {showAssignmentDetails ? (
                                <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                        </button>

                        {showAssignmentDetails && (
                            <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-white/10 space-y-4 animate-in fade-in duration-150">
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                        Assignment Instructions
                                    </h4>
                                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/5">
                                        <RichTextRenderer content={assignment.description} />
                                    </div>
                                </div>

                                {assignment.rubric && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                            Rubric & Scoring Breakdown
                                        </h4>
                                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap">
                                            {assignment.rubric}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Submissions Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
                        
                        {/* Tabs and Controls */}
                        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            {/* Tabs */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('submissions')}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                        activeTab === 'submissions'
                                            ? 'bg-[#ff5e36] text-white shadow-md shadow-[#ff5e36]/20'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                                >
                                    Student Submissions ({allSubmissions.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('missing')}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        activeTab === 'missing'
                                            ? 'bg-[#ff5e36] text-white shadow-md shadow-[#ff5e36]/20'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                                >
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Not Submitted ({missingStudents.length})</span>
                                </button>
                            </div>

                            {/* Search and Status Filters */}
                            {activeTab === 'submissions' && (
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <div className="relative">
                                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            placeholder="Search student..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#ff5e36]/20 outline-none w-44 sm:w-56"
                                        />
                                    </div>

                                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs">
                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter('all')}
                                            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                                                statusFilter === 'all'
                                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            All ({allSubmissions.length})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter('pending')}
                                            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                                                statusFilter === 'pending'
                                                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            Pending ({pendingCount})
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStatusFilter('graded')}
                                            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                                                statusFilter === 'graded'
                                                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            Graded ({gradedCount})
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content: Submissions Tab */}
                        {activeTab === 'submissions' && (
                            <>
                                {allSubmissions.length === 0 ? (
                                    <div className="p-16 text-center space-y-3">
                                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#ff5e36] flex items-center justify-center mx-auto">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-base font-bold text-slate-800 dark:text-white font-display">
                                            No student submissions yet
                                        </h4>
                                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                                            As soon as students submit their work via file upload or written answer, their submissions will appear here ready for your review and grading.
                                        </p>
                                    </div>
                                ) : filteredSubmissions.length === 0 ? (
                                    <div className="p-12 text-center text-slate-400 text-xs">
                                        No submissions match your active filter.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/10">
                                                <tr>
                                                    <th className="px-6 py-3.5">Student</th>
                                                    <th className="px-6 py-3.5">Uploaded Work & Notes</th>
                                                    <th className="px-6 py-3.5">AI Check & OCR</th>
                                                    <th className="px-6 py-3.5">Turned In</th>
                                                    <th className="px-6 py-3.5">Score Status</th>
                                                    <th className="px-6 py-3.5 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                                                {filteredSubmissions.map((sub) => {
                                                    const pendingAct = sub.pending_agent_action;
                                                    const aiProb = sub.ai_probability ?? pendingAct?.ai_generated_probability;
                                                    const ocrText = sub.ocr_text || pendingAct?.ocr_text;

                                                    return (
                                                        <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                            {/* Student Info */}
                                                            <td className="px-6 py-4">
                                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                                    {sub.user?.name || 'Student'}
                                                                </div>
                                                                <div className="text-xs font-mono text-slate-400">
                                                                    {sub.user?.student_id_no || sub.user?.email}
                                                                </div>
                                                            </td>

                                                            {/* File Attachment & Text */}
                                                            <td className="px-6 py-4 max-w-sm">
                                                                <div className="space-y-1.5">
                                                                    {sub.file_path && (
                                                                        <div className="flex items-center gap-2">
                                                                            {/* Mini thumbnail if image */}
                                                                            {isImageFile(sub.file_name || sub.file_path) && (
                                                                                <img
                                                                                    src={getSubmissionFileUrl(sub)}
                                                                                    alt=""
                                                                                    className="w-7 h-7 object-cover rounded-md border border-slate-200 dark:border-white/10 shrink-0 cursor-pointer hover:opacity-80"
                                                                                    onClick={() => setPreviewFile(sub)}
                                                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                                                />
                                                                            )}

                                                                            <button
                                                                                type="button"
                                                                                onClick={() => setPreviewFile(sub)}
                                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors"
                                                                                title="Preview uploaded work"
                                                                            >
                                                                                <Eye className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                                                                <span className="truncate max-w-[140px]">
                                                                                    {sub.file_name || 'View File'}
                                                                                </span>
                                                                            </button>

                                                                            <a
                                                                                href={getSubmissionFileUrl(sub, true)}
                                                                                download={sub.file_name || 'submission'}
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                                title="Download File"
                                                                            >
                                                                                <Download className="w-3.5 h-3.5" />
                                                                            </a>
                                                                        </div>
                                                                    )}

                                                                    {sub.text_content && (
                                                                        <div 
                                                                            onClick={() => openGrading(sub)}
                                                                            className="cursor-pointer group p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-white/5 hover:border-orange-300 transition-colors"
                                                                        >
                                                                            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed italic">
                                                                                "{sub.text_content}"
                                                                            </p>
                                                                            <span className="text-[10px] text-[#ff5e36] font-semibold group-hover:underline block mt-0.5">
                                                                                Read full submission &rarr;
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                    {!sub.file_path && !sub.text_content && (
                                                                        <span className="text-xs text-slate-400 italic">No file or note attached</span>
                                                                    )}
                                                                </div>
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
                                                                    <span className="inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 uppercase">
                                                                        Late Submission
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Score Status */}
                                                            <td className="px-6 py-4">
                                                                {sub.status === 'graded' ? (
                                                                    <div className="space-y-1">
                                                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                                                            <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                                            <span>{sub.grade} / {assignment.max_grade}</span>
                                                                        </div>
                                                                        {sub.feedback && (
                                                                            <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                                                                                "{sub.feedback}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ) : pendingAct ? (
                                                                    <div className="space-y-1">
                                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                                                                            <Bot className="w-3 h-3" />
                                                                            Agent: {pendingAct.grade}/{assignment.max_grade}
                                                                        </span>
                                                                        <p className="text-[10px] text-slate-400">Pending Review</p>
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
                                                                        type="button"
                                                                        onClick={() => openGrading(sub)}
                                                                        className="px-3.5 py-1.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-sm shadow-[#ff5e36]/25 transition-all hover:scale-105 active:scale-95"
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
                            </>
                        )}

                        {/* Content: Missing Students Tab */}
                        {activeTab === 'missing' && (
                            <div className="p-6">
                                {missingStudents.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-xs">
                                        🎉 All active enrolled students have submitted their work!
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-white/10">
                                            <span>The following {missingStudents.length} students have not turned in this assignment yet:</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {missingStudents.map((st) => (
                                                <div 
                                                    key={st.id} 
                                                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/5 flex items-center justify-between"
                                                >
                                                    <div>
                                                        <h5 className="font-semibold text-slate-900 dark:text-white text-xs">
                                                            {st.name}
                                                        </h5>
                                                        <p className="text-[11px] text-slate-400 font-mono">
                                                            {st.student_id_no || st.email}
                                                        </p>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        Not Turned In
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                </div>
            </div>

            {/* Grading Modal */}
            {gradingSubmission && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                                    Grade Student Submission
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Student: <span className="font-bold text-slate-800 dark:text-slate-200">{gradingSubmission.user?.name}</span> ({gradingSubmission.user?.student_id_no || gradingSubmission.user?.email}) • Max: {assignment.max_grade} pts
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setGradingSubmission(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Student Submission Display (File & Text) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    Submitted Work
                                </h4>
                                <span className="text-[11px] text-slate-400">
                                    Turned in: {new Date(gradingSubmission.submitted_at || gradingSubmission.created_at).toLocaleString()}
                                    {gradingSubmission.is_late && <span className="text-rose-500 font-bold ml-1.5">(LATE)</span>}
                                </span>
                            </div>

                            {/* Attached File display & inline preview */}
                            {gradingSubmission.file_path && (
                                <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 space-y-3">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2.5 truncate">
                                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="truncate">
                                                <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                                                    {gradingSubmission.file_name || 'Uploaded File'}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    Stored on Portal Storage
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => setPreviewFile(gradingSubmission)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Preview</span>
                                            </button>
                                            <a
                                                href={getSubmissionFileUrl(gradingSubmission, true)}
                                                download={gradingSubmission.file_name || 'submission'}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-white/10 transition-colors"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                <span>Download</span>
                                            </a>
                                        </div>
                                    </div>

                                    {/* Inline image thumbnail if image file */}
                                    {isImageFile(gradingSubmission.file_name || gradingSubmission.file_path) && (
                                        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black/5 dark:bg-black/30 max-h-60 p-2 flex flex-col items-center justify-center">
                                            <img
                                                src={getSubmissionFileUrl(gradingSubmission)}
                                                alt="Submission Preview"
                                                className="max-h-56 max-w-full object-contain rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                                                onClick={() => setPreviewFile(gradingSubmission)}
                                                onError={(e) => {
                                                    if (gradingSubmission.file_path && !e.target.dataset.triedFallback) {
                                                        e.target.dataset.triedFallback = 'true';
                                                        const clean = gradingSubmission.file_path.replace(/^(\/?storage\/|\/?public\/)/, '');
                                                        e.target.src = `/storage/${clean}`;
                                                    }
                                                }}
                                            />
                                            <span className="text-[10px] text-slate-400 mt-1 cursor-pointer hover:underline" onClick={() => setPreviewFile(gradingSubmission)}>
                                                Click to preview full size
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Student's Written Text / Notes */}
                            {gradingSubmission.text_content && (
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                                        <span>Student Notes / Written Response:</span>
                                        <button
                                            type="button"
                                            onClick={() => copyStudentText(gradingSubmission.text_content)}
                                            className="inline-flex items-center gap-1 text-[11px] text-[#ff5e36] hover:underline"
                                        >
                                            {copiedText ? (
                                                <>
                                                    <Check className="w-3 h-3 text-emerald-500" />
                                                    <span className="text-emerald-500">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    <span>Copy Text</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                        {gradingSubmission.text_content}
                                    </div>
                                </div>
                            )}

                            {!gradingSubmission.file_path && !gradingSubmission.text_content && (
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-700 dark:text-amber-300">
                                    The student marked this assignment submitted without attaching a file or text content.
                                </div>
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

                        {/* Grading Form */}
                        <form onSubmit={handleSaveGrade} className="space-y-4 pt-2 border-t border-slate-100 dark:border-white/10">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Score (0 - {assignment.max_grade} pts) *
                                    </label>
                                    {/* Quick Score Percentage buttons */}
                                    <div className="flex items-center gap-1">
                                        {[100, 90, 80, 70, 50].map((pct) => (
                                            <button
                                                key={pct}
                                                type="button"
                                                onClick={() => applyPercentageScore(pct)}
                                                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                                            >
                                                {pct}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max={assignment.max_grade}
                                    value={data.grade}
                                    onChange={(e) => setData('grade', e.target.value)}
                                    placeholder={`Enter score out of ${assignment.max_grade}`}
                                    className="w-full px-4 py-2.5 text-lg font-bold border border-slate-200 dark:border-white/10 rounded-2xl bg-white/70 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36] outline-none"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Instructor Feedback & Remarks
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => applyFeedbackPreset('Excellent work! Clear analysis, proper structure, and thoroughly addressed all rubric points.')}
                                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                        >
                                            + Excellent
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyFeedbackPreset('Good effort. Please review the case study questions for greater diagnostic precision.')}
                                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                                        >
                                            + Good Effort
                                        </button>
                                    </div>
                                </div>
                                <textarea
                                    rows={3}
                                    placeholder="Provide constructive feedback for the student..."
                                    value={data.feedback}
                                    onChange={(e) => setData('feedback', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 dark:border-white/10 rounded-2xl bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36] outline-none leading-relaxed"
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

                            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setGradingSubmission(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 text-xs font-bold bg-[#ff5e36] hover:bg-[#e04822] text-white rounded-xl shadow-md shadow-[#ff5e36]/25 hover:scale-105 active:scale-95 transition-all"
                                >
                                    {processing ? 'Publishing...' : 'Publish Grade & Notify Student'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Quick File Preview Modal (Image / PDF Viewer) */}
            {previewFile && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[95vh] flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-md">
                                    {previewFile.file_name || 'Submission Preview'}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    Student: {previewFile.user?.name}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={getSubmissionFileUrl(previewFile, true)}
                                    download={previewFile.file_name || 'submission'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download Original</span>
                                </a>
                                <button
                                    type="button"
                                    onClick={() => setPreviewFile(null)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto rounded-2xl bg-slate-950/5 dark:bg-black/40 flex items-center justify-center min-h-[300px]">
                            {isImageFile(previewFile.file_name || previewFile.file_path) ? (
                                <img
                                    src={getSubmissionFileUrl(previewFile)}
                                    alt={previewFile.file_name || "Submission"}
                                    className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg"
                                    onError={(e) => {
                                        if (previewFile.file_path && !e.target.dataset.triedFallback) {
                                            e.target.dataset.triedFallback = 'true';
                                            const clean = previewFile.file_path.replace(/^(\/?storage\/|\/?public\/)/, '');
                                            e.target.src = `/storage/${clean}`;
                                        }
                                    }}
                                />
                            ) : isPdfFile(previewFile.file_name || previewFile.file_path) ? (
                                <iframe
                                    src={`${getSubmissionFileUrl(previewFile)}#toolbar=1`}
                                    title="PDF Preview"
                                    className="w-full h-[70vh] rounded-xl border border-slate-200 dark:border-white/10"
                                />
                            ) : (
                                <div className="text-center p-8 space-y-3">
                                    <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                                    <p className="text-xs text-slate-600 dark:text-slate-300">
                                        This file type cannot be previewed directly in the browser.
                                    </p>
                                    <a
                                        href={getSubmissionFileUrl(previewFile, true)}
                                        download={previewFile.file_name || 'submission'}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5e36] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/25"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>Download File to View</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Assignment & Deadline Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                                    Edit Assignment & Adjust Deadline
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Extend or change deadline, update styled instructions, and adjust grading criteria.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateAssignment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Assignment Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editData.title}
                                    onChange={(e) => setEditData('title', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36] outline-none"
                                />
                                {editErrors.title && <p className="text-xs text-rose-600 mt-1">{editErrors.title}</p>}
                            </div>

                            {/* Rich Styled Description Editor */}
                            <RichTextEditor
                                label="Assignment Instructions & Guidelines (Rich Text & Formatting) *"
                                value={editData.description}
                                onChange={(val) => setEditData('description', val)}
                                placeholder="Write clear assignment objectives, step-by-step requirements, submission format, and criteria..."
                                minRows={7}
                                error={editErrors.description}
                            />

                            {/* Deadline with Quick Extension Shortcuts */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                            Submission Deadline *
                                        </label>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => addDaysToDeadline(3)}
                                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                                                title="Extend deadline by 3 days"
                                            >
                                                +3d
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addDaysToDeadline(7)}
                                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                                                title="Extend deadline by 1 week"
                                            >
                                                +1w
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => addDaysToDeadline(14)}
                                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                                                title="Extend deadline by 2 weeks"
                                            >
                                                +2w
                                            </button>
                                        </div>
                                    </div>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={editData.deadline}
                                        onChange={(e) => setEditData('deadline', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36] outline-none"
                                    />
                                    {editErrors.deadline && <p className="text-xs text-rose-600">{editErrors.deadline}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                        Max Grade (Score Base) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="1000"
                                        value={editData.max_grade}
                                        onChange={(e) => setEditData('max_grade', e.target.value)}
                                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36] outline-none"
                                    />
                                    {editErrors.max_grade && <p className="text-xs text-rose-600">{editErrors.max_grade}</p>}
                                </div>
                            </div>

                            {/* Optional Reference Document */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Replace Assignment Document (Optional PDF / Word)
                                </label>
                                {assignment.attachment_path && (
                                    <p className="text-xs text-slate-400 mb-1 font-mono">
                                        Current file attached: {assignment.attachment_path}
                                    </p>
                                )}
                                <input
                                    type="file"
                                    onChange={(e) => setEditData('attachment', e.target.files[0] || null)}
                                    className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#ff5e36]/10 file:text-[#ff5e36] hover:file:bg-[#ff5e36]/20 cursor-pointer"
                                />
                            </div>

                            {/* Rubric Breakdown */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Rubric & Scoring Breakdown (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="e.g. Diagnostic Accuracy (40pts), Morphology Description (30pts), Citations (30pts)"
                                    value={editData.rubric}
                                    onChange={(e) => setEditData('rubric', e.target.value)}
                                    className="w-full px-3.5 py-2 text-xs font-mono border border-slate-200 dark:border-white/10 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36] outline-none"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="flex flex-wrap items-center gap-6 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={editData.allow_late}
                                        onChange={(e) => setEditData('allow_late', e.target.checked)}
                                        className="rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <span>Allow Late Submissions</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={editData.allow_resubmit}
                                        onChange={(e) => setEditData('allow_resubmit', e.target.checked)}
                                        className="rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <span>Allow Resubmissions</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-6 py-2.5 text-xs font-bold bg-[#ff5e36] hover:bg-[#e04822] text-white rounded-xl shadow-md shadow-[#ff5e36]/25 hover:scale-105 active:scale-95 transition-all"
                                >
                                    {editProcessing ? 'Saving Changes...' : 'Save & Update Deadline'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
