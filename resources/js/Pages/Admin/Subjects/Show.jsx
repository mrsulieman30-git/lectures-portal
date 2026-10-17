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
    Loader2
} from 'lucide-react';
import FileUploadZone from '@/Components/FileUploadZone';

export default function SubjectShow({ subject = {} }) {
    const [activeTab, setActiveTab] = useState('documents');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showNoticeModal, setShowNoticeModal] = useState(false);

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

    const handleUploadDocuments = (e) => {
        e.preventDefault();
        postDoc(route('admin.documents.store', subject.id), {
            onSuccess: () => {
                resetDoc();
                setShowUploadModal(false);
            }
        });
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

                    <div className="flex flex-wrap items-center gap-2.5">
                        {(subject.documents || []).some(d => d.is_downloadable && !d.is_view_only) && (
                            <a
                                href={route('subjects.download-pack', subject.id)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/80 transition-all shadow-sm hover:scale-105 active:scale-95"
                                title="Download all downloadable lecture slides as a single ZIP archive"
                            >
                                <DownloadCloud className="w-4 h-4 text-indigo-600" />
                                <span>Download Pack (.zip)</span>
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
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                                                        <Lock className="w-3 h-3 text-amber-600" />
                                                                        View-Only
                                                                    </span>
                                                                ) : (
                                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                                        <Download className="w-3 h-3 text-emerald-600" />
                                                                        Downloadable
                                                                    </span>
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

                </div>
            </div>

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

        </AuthenticatedLayout>
    );
}
