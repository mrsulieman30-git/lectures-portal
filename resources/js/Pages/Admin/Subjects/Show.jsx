import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    BookOpen, 
    FileText, 
    Upload, 
    Download, 
    Eye, 
    Trash2, 
    Calendar, 
    GraduationCap, 
    Users, 
    Building2, 
    Plus, 
    CheckCircle2, 
    Clock, 
    Lock, 
    AlertCircle,
    ArrowLeft,
    Send,
    DownloadCloud,
    Globe,
    BookMarked,
    Sparkles,
    X,
    Loader2,
    Share2,
    ArrowRightLeft,
    Edit3,
    RefreshCw,
    RotateCcw,
    CheckSquare,
    Square
} from 'lucide-react';
import FileUploadZone from '@/Components/FileUploadZone';

export default function SubjectShow({ subject = {}, sharedCampuses = [], allUniversities = [] }) {
    const [activeTab, setActiveTab] = useState('documents');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showNoticeModal, setShowNoticeModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [editDocData, setEditDocData] = useState({
        title: '',
        description: '',
        published_at: '',
        is_downloadable: true,
        is_view_only: false,
        is_universal: false,
    });
    const [editDocProcessing, setEditDocProcessing] = useState(false);

    // Multi-file upload scheduling state
    const [docSchedules, setDocSchedules] = useState({});
    const [selectedDocIndexes, setSelectedDocIndexes] = useState([]);
    const [batchDocScheduleDate, setBatchDocScheduleDate] = useState('');

    // Transfer Form
    const { 
        data: transferData, 
        setData: setTransferData, 
        post: postTransfer, 
        processing: transferProcessing, 
        reset: resetTransfer,
        errors: transferErrors 
    } = useForm({
        university_id: subject.university_id || (allUniversities[0]?.id || ''),
        semester_id: subject.semester_id || '',
        reset_enrollments: true,
    });

    // Share Form
    const { 
        data: shareData, 
        setData: setShareData, 
        post: postShare, 
        processing: shareProcessing, 
        reset: resetShare,
        errors: shareErrors 
    } = useForm({
        target_university_id: '',
        target_semester_id: '',
        copy_documents: true,
        copy_assignments: true,
    });

    // Document Upload Form
    const { 
        data: docData, 
        setData: setDocData, 
        post: postDoc, 
        processing: docProcessing, 
        reset: resetDoc, 
        errors: docErrors,
        progress: docProgress
    } = useForm({
        files: [],
        is_downloadable: true,
        is_view_only: false,
        is_universal: false,
    });

    // Assignment Creation Form
    const { data: assignData, setData: setAssignData, post: postAssign, processing: assignProcessing, reset: resetAssign, errors: assignErrors } = useForm({
        title: '',
        description: '',
        deadline: '',
        max_grade: 100,
        allow_late: true,
        allow_resubmit: true,
        rubric: '',
    });

    // Bulletin Update Form
    const { data: noticeData, setData: setNoticeData, post: postNotice, processing: noticeProcessing, reset: resetNotice } = useForm({
        title: '',
        content: '',
        is_pinned: true,
    });

    const { delete: destroyDoc } = useForm();

    const transferUniversity = allUniversities.find(u => String(u.id) === String(transferData.university_id));
    const transferSemesters = transferUniversity?.semesters || [];

    const shareUniversity = allUniversities.find(u => String(u.id) === String(shareData.target_university_id));
    const shareSemesters = shareUniversity?.semesters || [];

    const handleTransferSubject = (e) => {
        e.preventDefault();
        postTransfer(route('admin.subjects.transfer', subject.id), {
            onSuccess: () => {
                setShowTransferModal(false);
            }
        });
    };

    const handleShareSubject = (e) => {
        e.preventDefault();
        postShare(route('admin.subjects.share', subject.id), {
            onSuccess: () => {
                setShowShareModal(false);
                resetShare();
            }
        });
    };

    const handleSyncMaterials = () => {
        if (confirm('Synchronize new documents from this cabinet to all other campus cabinets sharing this course?')) {
            router.post(route('admin.subjects.sync', subject.id), {}, { preserveScroll: true });
        }
    };

    const handleDeleteSubject = () => {
        if (confirm(`Move '${subject.title}' to Recycle Bin? You can recover it anytime from the Recycle Bin.`)) {
            router.delete(route('admin.subjects.destroy', subject.id));
        }
    };

    const handleUploadDocuments = (e) => {
        e.preventDefault();
        postDoc(route('admin.documents.store', subject.id), {
            data: {
                ...docData,
                schedules: docSchedules,
            },
            onSuccess: () => {
                resetDoc();
                setDocSchedules({});
                setSelectedDocIndexes([]);
                setBatchDocScheduleDate('');
                setShowUploadModal(false);
            }
        });
    };

    const allDocSelected = docData.files.length > 0 && selectedDocIndexes.length === docData.files.length;

    const toggleSelectAllUploadDocs = () => {
        if (allDocSelected) {
            setSelectedDocIndexes([]);
        } else {
            setSelectedDocIndexes(docData.files.map((_, i) => i));
        }
    };

    const toggleSelectUploadDoc = (idx) => {
        if (selectedDocIndexes.includes(idx)) {
            setSelectedDocIndexes(selectedDocIndexes.filter(i => i !== idx));
        } else {
            setSelectedDocIndexes([...selectedDocIndexes, idx]);
        }
    };

    const applyBatchDocSchedule = () => {
        if (!batchDocScheduleDate) return;
        const newSched = { ...docSchedules };
        const targets = selectedDocIndexes.length > 0 ? selectedDocIndexes : docData.files.map((_, i) => i);
        targets.forEach(i => {
            newSched[i] = batchDocScheduleDate;
        });
        setDocSchedules(newSched);
    };

    const handleCreateAssignment = (e) => {
        e.preventDefault();
        postAssign(route('admin.assignments.store', subject.id), {
            onSuccess: () => {
                resetAssign();
                setShowAssignmentModal(false);
            }
        });
    };

    const handlePostNotice = (e) => {
        e.preventDefault();
        postNotice(route('admin.subjects.updates.store', subject.id), {
            onSuccess: () => {
                resetNotice();
                setShowNoticeModal(false);
            }
        });
    };

    const handleDeleteDocument = (docId, docTitle) => {
        if (confirm(`Remove '${docTitle}' from the cabinet?`)) {
            destroyDoc(route('admin.documents.destroy', docId));
        }
    };

    const handleToggleUniversal = (doc) => {
        router.patch(route('admin.documents.update', doc.id), {
            title: doc.title,
            description: doc.description || '',
            is_downloadable: doc.is_downloadable,
            is_view_only: doc.is_view_only,
            is_universal: !doc.is_universal,
        }, {
            preserveScroll: true,
        });
    };

    const openEditDocumentModal = (doc) => {
        setEditingDoc(doc);
        setEditDocData({
            title: doc.title || '',
            description: doc.description || '',
            published_at: doc.published_at ? doc.published_at.substring(0, 16) : '',
            is_downloadable: Boolean(doc.is_downloadable),
            is_view_only: Boolean(doc.is_view_only),
            is_universal: Boolean(doc.is_universal),
        });
    };

    const handleUpdateDocument = (e) => {
        e.preventDefault();
        if (!editingDoc) return;
        setEditDocProcessing(true);
        router.patch(route('admin.documents.update', editingDoc.id), editDocData, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingDoc(null);
                setEditDocProcessing(false);
            },
            onError: () => {
                setEditDocProcessing(false);
            },
        });
    };

    const handleToggleViewOnly = (doc) => {
        const newViewOnly = !doc.is_view_only;
        router.patch(route('admin.documents.update', doc.id), {
            is_view_only: newViewOnly,
            // If activating strict view-only, disable direct student downloading
            is_downloadable: newViewOnly ? false : doc.is_downloadable,
        }, {
            preserveScroll: true,
        });
    };

    const handleToggleDownloadable = (doc) => {
        const newDownloadable = !doc.is_downloadable;
        router.patch(route('admin.documents.update', doc.id), {
            is_downloadable: newDownloadable,
            // If turning on downloads, disable strict view-only
            is_view_only: newDownloadable ? false : doc.is_view_only,
        }, {
            preserveScroll: true,
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
                            href={route('admin.subjects.index')}
                            className="p-2.5 rounded-xl bg-white/80 hover:bg-white text-slate-600 transition-all shadow-sm border border-slate-200/80 hover:scale-105"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span 
                                    className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border shadow-xs"
                                    style={{
                                        backgroundColor: `${subject.color || '#4f46e5'}15`,
                                        borderColor: `${subject.color || '#4f46e5'}40`,
                                        color: subject.color || '#4f46e5'
                                    }}
                                >
                                    {subject.code || 'COURSE'}
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-display">
                                    {subject.title}
                                </h2>
                            </div>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                <span className="font-medium text-slate-700">{subject.university?.name}</span>
                                <span>•</span>
                                <span>{subject.semester?.name}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setShowTransferModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-white/10 transition-all shadow-sm hover:scale-105 active:scale-95"
                            title="Transfer this subject to a different university or semester"
                        >
                            <ArrowRightLeft className="w-4 h-4 text-cyan-600" />
                            <span>Transfer</span>
                        </button>

                        <button
                            onClick={() => setShowShareModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-white/10 transition-all shadow-sm hover:scale-105 active:scale-95"
                            title="Share this subject with another university or semester (separate analytics)"
                        >
                            <Share2 className="w-4 h-4 text-[#ff5e36]" />
                            <span>Share to Campus</span>
                        </button>

                        <Link
                            href={route('admin.subjects.edit', subject.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-white/10 transition-all shadow-sm hover:scale-105 active:scale-95"
                            title="Edit Subject Cabinet Settings"
                        >
                            <Edit3 className="w-4 h-4 text-slate-500" />
                            <span>Edit</span>
                        </Link>

                        <button
                            onClick={handleDeleteSubject}
                            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 transition-colors"
                            title="Move to Recycle Bin"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        {(subject.documents || []).some(d => d.is_downloadable && !d.is_view_only) && (
                            <a
                                href={route('subjects.download-pack', subject.id)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/80 transition-all shadow-sm hover:scale-105 active:scale-95"
                                title="Download all downloadable lecture slides as a single ZIP archive"
                            >
                                <DownloadCloud className="w-4 h-4 text-indigo-600" />
                                <span>Pack (.zip)</span>
                            </a>
                        )}
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5e36] to-[#ff416c] hover:brightness-105 text-white text-xs font-bold shadow-md shadow-[#ff5e36]/25 transition-all hover:scale-105 active:scale-95"
                        >
                            <Upload className="w-4 h-4" />
                            Upload Material
                        </button>
                        <button
                            onClick={() => setShowAssignmentModal(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            New Assignment
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`${subject.code} - ${subject.title}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Navigation Tabs in Liquid Glass Capsule */}
                    <div className="liquid-glass rounded-2xl p-1.5 border border-slate-200/80 dark:border-white/10 shadow-glass flex flex-wrap gap-2 text-xs sm:text-sm font-semibold">
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                                activeTab === 'documents'
                                    ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/30 font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            Cabinet Files ({(subject.documents || []).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('assignments')}
                            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                                activeTab === 'assignments'
                                    ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/30 font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                            }`}
                        >
                            <GraduationCap className="w-4 h-4" />
                            Assignments ({(subject.assignments || []).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('notices')}
                            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                                activeTab === 'notices'
                                    ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/30 font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                            }`}
                        >
                            <AlertCircle className="w-4 h-4" />
                            Bulletins & Notices ({(subject.updates || []).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('students')}
                            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                                activeTab === 'students'
                                    ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/30 font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            Students ({(subject.active_students || []).length})
                        </button>
                        <button
                            onClick={() => setActiveTab('network')}
                            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${
                                activeTab === 'network'
                                    ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/30 font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                            }`}
                        >
                            <Globe className="w-4 h-4" />
                            <span>Campus Network</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                activeTab === 'network' ? 'bg-white text-[#ff5e36]' : 'bg-[#ff5e36]/15 text-[#ff5e36]'
                            }`}>
                                {sharedCampuses.length}
                            </span>
                        </button>
                    </div>

                    {/* TAB 1: Documents Cabinet */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            {(subject.documents || []).length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center mx-auto mb-3">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Cabinet is Empty</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                                        Upload your lecture presentations, official textbook chapters, and exam materials.
                                    </p>
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/20 transition-all"
                                    >
                                        <Upload className="w-3.5 h-3.5" />
                                        Upload Files
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto w-full scrollbar-thin">
                                        <table className="w-full min-w-[700px] text-left text-sm text-slate-600 dark:text-slate-300">
                                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/10">
                                                <tr>
                                                    <th className="px-6 py-3.5">Material Title & Format</th>
                                                    <th className="px-6 py-3.5">File Size</th>
                                                    <th className="px-6 py-3.5">Security / Mode</th>
                                                    <th className="px-6 py-3.5">Engagement</th>
                                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-150/70 dark:divide-white/5">
                                                {subject.documents.map((doc) => (
                                                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-semibold text-slate-900 dark:text-white">{doc.title}</div>
                                                            <div className="text-xs text-slate-400 font-mono mt-0.5">{doc.file_name}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                                                            {formatBytes(doc.file_size)}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                {doc.is_view_only ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleToggleViewOnly(doc)}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                                        title="Strict Anti-Download Mode active. Click to switch to Downloadable."
                                                                    >
                                                                        <Lock className="w-3 h-3 text-amber-500" />
                                                                        <span>View-Only (Strict)</span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleToggleViewOnly(doc)}
                                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                                                                        title="Direct Student Download is enabled. Click to enforce Strict View-Only Mode."
                                                                    >
                                                                        <Download className="w-3 h-3 text-emerald-500" />
                                                                        <span>Downloadable</span>
                                                                    </button>
                                                                )}
                                                                {doc.is_universal && (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ff5e36]/10 text-[#ff5e36] border border-[#ff5e36]/25">
                                                                        <Globe className="w-3 h-3 text-[#ff5e36]" />
                                                                        Universal Library
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                                                            <span>{doc.download_count} downloads</span> • <span>{doc.view_count} views</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="inline-flex items-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditDocumentModal(doc)}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs"
                                                                    title="Edit document title, description, and viewing/downloading permissions"
                                                                >
                                                                    <Edit3 className="w-3.5 h-3.5 text-[#ff5e36]" />
                                                                    Edit Options
                                                                </button>
                                                                <button
                                                                    onClick={() => handleToggleUniversal(doc)}
                                                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition-all ${
                                                                        doc.is_universal
                                                                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                                                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                                                                    }`}
                                                                    title={doc.is_universal ? 'Remove from Universal Library' : 'Publish to Universal Library'}
                                                                >
                                                                    <Globe className="w-3.5 h-3.5" />
                                                                    {doc.is_universal ? 'Universal: ON' : 'Make Universal'}
                                                                </button>
                                                                {/* Highlighted Preview Pill Button */}
                                                                <a
                                                                    href={route('documents.view', doc.id)}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="px-3 py-1.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold inline-flex items-center gap-1 shadow-sm shadow-[#ff5e36]/25 transition-all hover:scale-105 active:scale-95"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    Preview
                                                                </a>
                                                                <button
                                                                    onClick={() => handleDeleteDocument(doc.id, doc.title)}
                                                                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-rose-500 transition-colors shadow-xs"
                                                                    title="Delete file"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: Assignments & Tasks */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-4">
                            {(subject.assignments || []).length === 0 ? (
                                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                                    <GraduationCap className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                    <h3 className="text-base font-bold text-slate-900">No Assignments Created</h3>
                                    <p className="text-xs text-slate-500 mt-1 mb-4">Set deadlines, rubrics, and track student submissions.</p>
                                    <button
                                        onClick={() => setShowAssignmentModal(true)}
                                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                                    >
                                        + New Assignment
                                    </button>
                                </div>
                            ) : (
                                subject.assignments.map((assign) => (
                                    <div key={assign.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 text-base">{assign.title}</h4>
                                                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
                                                    Max: {assign.max_grade} pts
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 max-w-2xl">{assign.description}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                                                <span className="flex items-center gap-1 text-rose-600 font-medium">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Due: {new Date(assign.deadline).toLocaleString()}
                                                </span>
                                                <span>•</span>
                                                <span>{assign.submissions_count || 0} student submission(s)</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('admin.assignments.submissions', assign.id)}
                                            className="px-4 py-2 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-sm shadow-[#ff5e36]/25 text-center shrink-0 transition-all hover:scale-105 active:scale-95"
                                        >
                                            View & Grade Submissions &rarr;
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* TAB 3: Bulletins & Notices */}
                    {activeTab === 'notices' && (
                        <div className="space-y-4">
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setShowNoticeModal(true)}
                                    className="px-4 py-2 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-sm shadow-[#ff5e36]/25 transition-all hover:scale-105 active:scale-95"
                                >
                                    + Post Bulletin
                                </button>
                            </div>

                            {(subject.updates || []).length === 0 ? (
                                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-white/10 p-10 text-center text-xs text-slate-400">
                                    No announcements posted yet.
                                </div>
                            ) : (
                                subject.updates.map((update) => (
                                    <div key={update.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-white/10 p-6 shadow-sm space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-slate-900 dark:text-white text-base">{update.title}</h4>
                                            <span className="text-xs text-slate-400">{new Date(update.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{update.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* TAB 4: Enrolled Students */}
                    {activeTab === 'students' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base">Enrolled Class Roster</h3>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{(subject.active_students || []).length} Students</span>
                            </div>

                            {(subject.active_students || []).length === 0 ? (
                                <div className="p-8 text-center text-xs text-slate-400">
                                    No students actively enrolled in this subject yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto w-full scrollbar-thin">
                                    <table className="w-full min-w-[500px] text-left text-sm text-slate-600 dark:text-slate-300">
                                        <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-white/10">
                                            <tr>
                                                <th className="px-6 py-3">Student Name</th>
                                                <th className="px-6 py-3">Student ID</th>
                                                <th className="px-6 py-3">Email</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-150/70 dark:divide-white/5">
                                            {subject.active_students.map((student) => (
                                                <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{student.name}</td>
                                                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{student.student_id_no || '—'}</td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{student.email}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 5: Multi-Campus Network & Independent Analytics */}
                    {activeTab === 'network' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-slate-900 to-[#121622] text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
                                <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#ff5e36]/20 rounded-full blur-3xl pointer-events-none" />
                                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                                    <div className="space-y-2 max-w-2xl">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff5e36]/20 text-[#ff5e36] text-xs font-bold border border-[#ff5e36]/30">
                                            <Globe className="w-3.5 h-3.5" />
                                            <span>Unified Academic Network</span>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight">
                                            Multi-Campus Course Sharing &amp; Independent Analytics
                                        </h3>
                                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                                            This course syllabus is deployed across <strong>{sharedCampuses.length} partner campus cabinet(s)</strong>.
                                            Each university maintains strict independence: separate student rosters, isolated assignment submissions &amp; grades, and individual download engagement metrics.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap sm:flex-col gap-2.5 shrink-0">
                                        <button
                                            onClick={() => setShowShareModal(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/30 transition-all hover:scale-105 active:scale-95"
                                        >
                                            <Share2 className="w-4 h-4" />
                                            <span>Deploy to Another Campus</span>
                                        </button>
                                        {sharedCampuses.length > 1 && (
                                            <button
                                                onClick={handleSyncMaterials}
                                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-all hover:scale-105 active:scale-95"
                                                title="Push newly added documents to all other campus instances"
                                            >
                                                <RefreshCw className="w-4 h-4 text-cyan-400" />
                                                <span>Sync Materials to All Campuses</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Campuses Comparison Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {sharedCampuses.map((campus) => (
                                    <div 
                                        key={campus.id}
                                        className={`rounded-3xl border p-6 transition-all ${
                                            campus.is_current 
                                                ? 'bg-white dark:bg-[#0c1017] border-[#ff5e36] shadow-md ring-2 ring-[#ff5e36]/20' 
                                                : 'bg-white dark:bg-[#0c1017] border-slate-200/80 dark:border-white/10 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center font-bold text-lg border border-[#ff5e36]/20">
                                                    {campus.university?.name ? campus.university.name.charAt(0) : 'U'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                                            {campus.university?.name || 'Partner Campus'}
                                                        </h4>
                                                        {campus.is_current && (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff5e36] text-white">
                                                                Viewing Now
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium">
                                                        Term: <strong>{campus.semester?.name || 'Standard Term'}</strong> • Code: <span className="font-mono">{campus.code || 'COURSE'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {!campus.is_current && (
                                                <Link
                                                    href={route('admin.subjects.show', campus.id)}
                                                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#ff5e36] hover:text-white text-slate-700 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-[#ff5e36] text-xs font-bold transition-all"
                                                >
                                                    Open Cabinet &rarr;
                                                </Link>
                                            )}
                                        </div>

                                        {/* Isolated Analytics Grid for This Campus */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled Students</span>
                                                <span className="text-lg font-black text-slate-800 dark:text-white">{campus.students_count}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block">File Downloads</span>
                                                <span className="text-lg font-black text-[#ff5e36]">{campus.total_downloads}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Submissions</span>
                                                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{campus.submissions_count}</span>
                                            </div>
                                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Avg. Grade</span>
                                                <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                                                    {campus.average_grade ? `${campus.average_grade}%` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Edit Document Options Modal */}
            {editingDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#161c28] rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-150 dark:border-white/10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center">
                                    <Edit3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                        Edit Document Options
                                    </h3>
                                    <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
                                        {editingDoc.file_name} ({formatBytes(editingDoc.file_size)})
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingDoc(null)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateDocument} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Document Title
                                </label>
                                <input
                                    type="text"
                                    value={editDocData.title}
                                    onChange={(e) => setEditDocData({ ...editDocData, title: e.target.value })}
                                    required
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Description / Note (Optional)
                                </label>
                                <textarea
                                    value={editDocData.description}
                                    onChange={(e) => setEditDocData({ ...editDocData, description: e.target.value })}
                                    rows={2}
                                    placeholder="Add chapter highlights or instructions for students..."
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                                />
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-3.5 border border-slate-200/80 dark:border-white/10">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editDocData.is_view_only}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setEditDocData({
                                                ...editDocData,
                                                is_view_only: checked,
                                                is_downloadable: checked ? false : editDocData.is_downloadable,
                                            });
                                        }}
                                        className="mt-0.5 rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                                            View-Only Protection (Strict Anti-Download Mode)
                                        </span>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                            Students view the document directly in the browser canvas. Download, right-click, and printing are strictly disabled.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer pt-2.5 border-t border-slate-200/60 dark:border-white/10">
                                    <input
                                        type="checkbox"
                                        checked={editDocData.is_downloadable}
                                        onChange={(e) => {
                                            const checked = e.target.checked;
                                            setEditDocData({
                                                ...editDocData,
                                                is_downloadable: checked,
                                                is_view_only: checked ? false : editDocData.is_view_only,
                                            });
                                        }}
                                        className="rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                                        Allow direct student download (auto-disabled if View-Only is active)
                                    </span>
                                </label>

                                <label className="flex items-start gap-2.5 cursor-pointer pt-2.5 border-t border-slate-200/60 dark:border-white/10">
                                    <input
                                        type="checkbox"
                                        checked={editDocData.is_universal}
                                        onChange={(e) => setEditDocData({ ...editDocData, is_universal: e.target.checked })}
                                        className="mt-0.5 rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5 text-indigo-500" />
                                            Publish to Universal Library (Maktabadda Guud)
                                        </span>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                            Makes this document accessible to all students across all universities on the central library shelf.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-150 dark:border-white/10">
                                <button
                                    type="button"
                                    disabled={editDocProcessing}
                                    onClick={() => setEditingDoc(null)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editDocProcessing}
                                    className="px-5 py-2.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {editDocProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    Save Document Options
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Upload Document Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 font-display">Upload to File Cabinet</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Course material for {subject.title} (PDF, Word, PPT, Excel, Archives up to 512MB).
                                </p>
                            </div>
                            <button
                                type="button"
                                disabled={docProcessing}
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadDocuments} className="space-y-4">
                            <FileUploadZone
                                files={docData.files}
                                setFiles={(files) => setDocData('files', files)}
                                processing={docProcessing}
                                progress={docProgress}
                                errors={docErrors}
                                maxFileSizeMB={512}
                                label="Drop files here or click to select multiple files"
                                hint="Upload textbooks, slide decks, assignments, or archives (up to 512MB each)."
                            />

                            {/* Batch & Individual File Scheduling Bar */}
                            {docData.files.length > 0 && (
                                <div className="p-3.5 bg-orange-50/70 rounded-2xl border border-orange-200/80 space-y-2.5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                        <button
                                            type="button"
                                            onClick={toggleSelectAllUploadDocs}
                                            className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#ff5e36]"
                                        >
                                            {allDocSelected ? (
                                                <CheckSquare className="w-4 h-4 text-[#ff5e36]" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                            <span>Select All ({docData.files.length})</span>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="datetime-local"
                                                value={batchDocScheduleDate}
                                                onChange={(e) => setBatchDocScheduleDate(e.target.value)}
                                                className="px-2.5 py-1 text-xs rounded-xl border border-orange-200 bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={applyBatchDocSchedule}
                                                disabled={!batchDocScheduleDate}
                                                className="px-3 py-1 rounded-xl bg-[#ff5e36] text-white font-bold text-xs hover:bg-[#e04822] disabled:opacity-40 whitespace-nowrap shadow-xs"
                                            >
                                                {selectedDocIndexes.length > 0 ? `Schedule (${selectedDocIndexes.length})` : 'Schedule All'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* List of files with individual schedule pickers */}
                                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                                        {docData.files.map((file, idx) => {
                                            const isChecked = selectedDocIndexes.includes(idx);
                                            const sched = docSchedules[idx] || '';

                                            return (
                                                <div
                                                    key={`${file.name}_${idx}`}
                                                    className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                                                        isChecked ? 'bg-orange-100/70 border-orange-300' : 'bg-white border-slate-200/80'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSelectUploadDoc(idx)}
                                                            className="text-slate-400 hover:text-slate-600"
                                                        >
                                                            {isChecked ? (
                                                                <CheckSquare className="w-3.5 h-3.5 text-[#ff5e36]" />
                                                            ) : (
                                                                <Square className="w-3.5 h-3.5" />
                                                            )}
                                                        </button>
                                                        <span className="font-medium text-slate-800 truncate max-w-[160px] sm:max-w-xs">
                                                            {file.name}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <Clock className="w-3 h-3 text-slate-400" />
                                                        <input
                                                            type="datetime-local"
                                                            value={sched}
                                                            onChange={(e) => {
                                                                setDocSchedules({ ...docSchedules, [idx]: e.target.value });
                                                            }}
                                                            className="px-2 py-0.5 text-[11px] rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-slate-50 rounded-2xl space-y-3 border border-slate-200/80">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={docData.is_view_only}
                                        onChange={(e) => setDocData('is_view_only', e.target.checked)}
                                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                            <Lock className="w-3.5 h-3.5 text-amber-500" />
                                            View-Only Protection (Strict Anti-Download Mode)
                                        </span>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                            Students view the document directly in the browser canvas. Download, right-click, and printing are strictly disabled.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-slate-200/60">
                                    <input
                                        type="checkbox"
                                        checked={docData.is_downloadable}
                                        onChange={(e) => setDocData('is_downloadable', e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-xs font-medium text-slate-700">
                                        Allow direct student download (disabled automatically if view-only is active)
                                    </span>
                                </label>

                                <label className="flex items-start gap-2.5 cursor-pointer pt-2.5 border-t border-slate-200/60">
                                    <input
                                        type="checkbox"
                                        checked={docData.is_universal}
                                        onChange={(e) => setDocData('is_universal', e.target.checked)}
                                        className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5 text-indigo-600" />
                                            Publish to Universal Library (Maktabadda Guud)
                                        </span>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                                            Makes this book accessible to all students across all universities on the central library shelf.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={docProcessing}
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={docProcessing || docData.files.length === 0}
                                    className="px-5 py-2.5 text-xs font-bold bg-[#ff5e36] hover:bg-[#e04822] text-white rounded-xl shadow-md shadow-[#ff5e36]/25 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                                >
                                    {docProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Uploading ({docProgress?.percentage || 0}%)...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            <span>Upload {docData.files.length > 0 ? `${docData.files.length} File(s)` : 'Material'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Assignment Modal */}
            {showAssignmentModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Create Course Assignment</h3>
                        <p className="text-xs text-slate-500 mb-4">Set tasks, deadlines, and scoring criteria.</p>

                        <form onSubmit={handleCreateAssignment} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={assignData.title}
                                    onChange={(e) => setAssignData('title', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Description</label>
                                <textarea
                                    rows={3}
                                    value={assignData.description}
                                    onChange={(e) => setAssignData('description', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Deadline *</label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={assignData.deadline}
                                        onChange={(e) => setAssignData('deadline', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Max Grade</label>
                                    <input
                                        type="number"
                                        value={assignData.max_grade}
                                        onChange={(e) => setAssignData('max_grade', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Rubric Criteria</label>
                                <textarea
                                    rows={2}
                                    placeholder="Scoring breakdown..."
                                    value={assignData.rubric}
                                    onChange={(e) => setAssignData('rubric', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl font-mono text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignmentModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={assignProcessing}
                                    className="px-5 py-2 text-xs font-bold bg-[#ff5e36] text-white rounded-xl hover:bg-[#e04822] shadow-md shadow-[#ff5e36]/20 transition-all"
                                >
                                    Publish Assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notice Modal */}
            {showNoticeModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Post Announcement</h3>
                        <form onSubmit={handlePostNotice} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={noticeData.title}
                                    onChange={(e) => setNoticeData('title', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Content</label>
                                <textarea
                                    rows={4}
                                    required
                                    value={noticeData.content}
                                    onChange={(e) => setNoticeData('content', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNoticeModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={noticeProcessing}
                                    className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl"
                                >
                                    Broadcast Notice
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Subject Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0c1017] rounded-3xl border border-slate-200/90 dark:border-white/10 max-w-xl w-full p-6 sm:p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                                    <ArrowRightLeft className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                                        Transfer Course Cabinet
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Move '{subject.title}' to another university campus or academic term.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTransferModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleTransferSubject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Target Partner University *
                                </label>
                                <select
                                    required
                                    value={transferData.university_id}
                                    onChange={(e) => {
                                        const uniId = e.target.value;
                                        const foundUni = allUniversities.find(u => String(u.id) === String(uniId));
                                        setTransferData({
                                            ...transferData,
                                            university_id: uniId,
                                            semester_id: foundUni?.semesters?.[0]?.id || ''
                                        });
                                    }}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                >
                                    <option value="">Select University</option>
                                    {allUniversities.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                                {transferErrors.university_id && <p className="text-xs text-rose-600 mt-1">{transferErrors.university_id}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Target Academic Semester / Term *
                                </label>
                                <select
                                    required
                                    value={transferData.semester_id}
                                    onChange={(e) => setTransferData('semester_id', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                >
                                    <option value="">Select Semester</option>
                                    {transferSemesters.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                {transferErrors.semester_id && <p className="text-xs text-rose-600 mt-1">{transferErrors.semester_id}</p>}
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={transferData.reset_enrollments}
                                        onChange={(e) => setTransferData('reset_enrollments', e.target.checked)}
                                        className="mt-0.5 rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Reset Enrollments for Previous University
                                        </span>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                            Removes students registered under the old campus so they no longer have access to this cabinet. (Recommended when transferring across campuses).
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowTransferModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={transferProcessing || !transferData.semester_id}
                                    className="px-5 py-2.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-md shadow-cyan-600/25 transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    <ArrowRightLeft className="w-4 h-4" />
                                    <span>{transferProcessing ? 'Transferring...' : 'Execute Transfer'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Share Subject with Campus Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0c1017] rounded-3xl border border-slate-200/90 dark:border-white/10 max-w-xl w-full p-6 sm:p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center">
                                    <Share2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                                        Share Course Across Campuses
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Deploy '{subject.title}' to another university with completely isolated analytics.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowShareModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleShareSubject} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Deploy to University *
                                </label>
                                <select
                                    required
                                    value={shareData.target_university_id}
                                    onChange={(e) => {
                                        const uniId = e.target.value;
                                        const foundUni = allUniversities.find(u => String(u.id) === String(uniId));
                                        setShareData({
                                            ...shareData,
                                            target_university_id: uniId,
                                            target_semester_id: foundUni?.semesters?.[0]?.id || ''
                                        });
                                    }}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                >
                                    <option value="">Select University</option>
                                    {allUniversities.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                                {shareErrors.target_university_id && <p className="text-xs text-rose-600 mt-1">{shareErrors.target_university_id}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Semester / Academic Term *
                                </label>
                                <select
                                    required
                                    value={shareData.target_semester_id}
                                    onChange={(e) => setShareData('target_semester_id', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                >
                                    <option value="">Select Semester</option>
                                    {shareSemesters.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                {shareErrors.target_semester_id && <p className="text-xs text-rose-600 mt-1">{shareErrors.target_semester_id}</p>}
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-3">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={shareData.copy_documents}
                                        onChange={(e) => setShareData('copy_documents', e.target.checked)}
                                        className="mt-0.5 rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Replicate Lecture Materials &amp; Slides ({(subject.documents || []).length} Files)
                                        </span>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                            All lecture presentations will be available in the new campus cabinet with fresh, independent download and view metrics.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-2.5 cursor-pointer pt-2.5 border-t border-slate-200/60 dark:border-white/5">
                                    <input
                                        type="checkbox"
                                        checked={shareData.copy_assignments}
                                        onChange={(e) => setShareData('copy_assignments', e.target.checked)}
                                        className="mt-0.5 rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                            Replicate Assignments &amp; Tasks ({(subject.assignments || []).length} Tasks)
                                        </span>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                            Assignment criteria and rubrics will be set up with a clean roster of 0 student submissions.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                                <p className="leading-relaxed">
                                    <strong>Complete Isolation:</strong> Students at this new university will never see other campuses' submissions, grades, chat messages, or analytics.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setShowShareModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={shareProcessing || !shareData.target_semester_id}
                                    className="px-5 py-2.5 text-xs font-bold bg-[#ff5e36] hover:bg-[#e04822] text-white rounded-xl shadow-md shadow-[#ff5e36]/25 transition-all inline-flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span>{shareProcessing ? 'Deploying...' : 'Deploy to Campus'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Document Modal */}
            {editingDoc && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0c1017] rounded-3xl border border-slate-200/90 dark:border-white/10 max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Edit Document Options
                                </h3>
                                <p className="text-xs text-slate-500 font-mono truncate max-w-xs mt-0.5">
                                    {editingDoc.file_name}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingDoc(null)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleUpdateDocument} className="mt-5 space-y-4 text-xs">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Document Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editDocData.title}
                                    onChange={(e) => setEditDocData({ ...editDocData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Scheduled Release Date &amp; Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={editDocData.published_at || ''}
                                    onChange={(e) => setEditDocData({ ...editDocData, published_at: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    If set to a future date, students cannot see, stream, or download this file until that time.
                                </p>
                            </div>

                            <div className="pt-2 space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(editDocData.is_downloadable)}
                                        onChange={(e) => setEditDocData({ ...editDocData, is_downloadable: e.target.checked })}
                                        className="w-4 h-4 rounded text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Allow Student Direct Download
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(editDocData.is_view_only)}
                                        onChange={(e) => setEditDocData({ ...editDocData, is_view_only: e.target.checked })}
                                        className="w-4 h-4 rounded text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Strict View-Only Mode (Anti-Download Protection)
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(editDocData.is_universal)}
                                        onChange={(e) => setEditDocData({ ...editDocData, is_universal: e.target.checked })}
                                        className="w-4 h-4 rounded text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Publish to Universal Library
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setEditingDoc(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editDocProcessing}
                                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#ff5e36] to-[#ff416c] hover:brightness-105 active:scale-95 disabled:opacity-50 shadow-sm"
                                >
                                    {editDocProcessing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
