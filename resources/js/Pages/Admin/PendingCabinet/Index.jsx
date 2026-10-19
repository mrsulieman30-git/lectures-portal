import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, useMemo, useRef } from 'react';
import {
    UploadCloud,
    FolderPlus,
    Calendar,
    Clock,
    FileText,
    Presentation,
    FileSpreadsheet,
    FileArchive,
    File,
    Trash2,
    CheckSquare,
    Square,
    Search,
    Filter,
    ArrowRight,
    CheckCircle2,
    Eye,
    Download,
    Lock,
    Unlock,
    Building2,
    GraduationCap,
    SlidersHorizontal,
    Layers,
    X,
    Loader2,
    AlertCircle,
    Send,
    Edit3
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

export default function PendingCabinetIndex({
    documents = [],
    universities = [],
    filters = {},
    stats = { total_pending: 0, scheduled: 0, total_bytes: 0 }
}) {
    const { t } = useTranslation();

    // ─── Filter States ──────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    // ─── Selection States for Batch Operations ──────────────────────
    const [selectedDocIds, setSelectedDocIds] = useState([]);

    // ─── Modals State ───────────────────────────────────────────────
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);

    // ─── Assign Target Class Cascading Selection ────────────────────
    const [targetUniversityId, setTargetUniversityId] = useState('');
    const [targetSemesterId, setTargetSemesterId] = useState('');
    const [targetSubjectId, setTargetSubjectId] = useState('');
    const [assignPublishDate, setAssignPublishDate] = useState('');
    const [assignDownloadable, setAssignDownloadable] = useState(true);
    const [assignViewOnly, setAssignViewOnly] = useState(false);

    // ─── Batch Schedule Modal State ─────────────────────────────────
    const [batchScheduleDate, setBatchScheduleDate] = useState('');

    // ─── Upload Queue State ─────────────────────────────────────────
    const [uploadFiles, setUploadFiles] = useState([]); // Array of File objects
    const [fileSchedules, setFileSchedules] = useState({}); // { [fileIndex]: 'YYYY-MM-DDTHH:mm' }
    const [selectedUploadIndexes, setSelectedUploadIndexes] = useState([]); // Array of indexes
    const [uploadBatchScheduleDate, setUploadBatchScheduleDate] = useState('');
    const [uploadDefaultDownloadable, setUploadDefaultDownloadable] = useState(true);
    const [uploadDefaultViewOnly, setUploadDefaultViewOnly] = useState(false);
    const [uploadDefaultUniversal, setUploadDefaultUniversal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // ─── Upload Inertia Form ────────────────────────────────────────
    const { 
        data: uploadData, 
        setData: setUploadData, 
        post: postUpload, 
        processing: uploadProcessing, 
        progress: uploadProgress, 
        reset: resetUploadForm,
        errors: uploadErrors 
    } = useForm({
        files: [],
        schedules: {},
        is_downloadable: true,
        is_view_only: false,
        is_universal: false,
        published_at: '',
    });

    // ─── Edit Document Inertia Form ─────────────────────────────────
    const {
        data: editData,
        setData: setEditData,
        patch: patchEdit,
        processing: editProcessing,
        reset: resetEditForm,
    } = useForm({
        title: '',
        description: '',
        published_at: '',
        is_downloadable: true,
        is_view_only: false,
    });

    // ─── Format Bytes Helper ────────────────────────────────────────
    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // ─── File Icon Resolver ─────────────────────────────────────────
    const getFileIcon = (fileName = '', fileType = '') => {
        const ext = (fileType || fileName.split('.').pop() || '').toLowerCase();
        if (ext === 'pdf') return <FileText className="w-5 h-5 text-rose-500 shrink-0" />;
        if (['doc', 'docx'].includes(ext)) return <FileText className="w-5 h-5 text-blue-500 shrink-0" />;
        if (['ppt', 'pptx'].includes(ext)) return <Presentation className="w-5 h-5 text-orange-500 shrink-0" />;
        if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />;
        if (['zip', 'rar', '7z'].includes(ext)) return <FileArchive className="w-5 h-5 text-amber-500 shrink-0" />;
        return <File className="w-5 h-5 text-indigo-500 shrink-0" />;
    };

    // ─── Filtered Documents ─────────────────────────────────────────
    const filteredDocuments = useMemo(() => {
        return documents.filter((doc) => {
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchTitle = doc.title?.toLowerCase().includes(q);
                const matchName = doc.file_name?.toLowerCase().includes(q);
                if (!matchTitle && !matchName) return false;
            }

            if (selectedType !== 'all') {
                const ext = (doc.file_type || '').toLowerCase();
                if (selectedType === 'pdf' && ext !== 'pdf') return false;
                if (selectedType === 'presentation' && !['ppt', 'pptx'].includes(ext)) return false;
                if (selectedType === 'document' && !['doc', 'docx', 'txt', 'rtf'].includes(ext)) return false;
                if (selectedType === 'archive' && !['zip', 'rar', '7z'].includes(ext)) return false;
                if (selectedType === 'media' && !['mp4', 'mp3', 'mov', 'wav', 'png', 'jpg', 'jpeg'].includes(ext)) return false;
            }

            if (selectedStatus === 'scheduled') {
                if (!doc.published_at || new Date(doc.published_at) <= new Date()) return false;
            } else if (selectedStatus === 'ready') {
                if (doc.published_at && new Date(doc.published_at) > new Date()) return false;
            }

            return true;
        });
    }, [documents, searchQuery, selectedType, selectedStatus]);

    // ─── Multi-select Logic for Staged Documents ────────────────────
    const allFilteredSelected = filteredDocuments.length > 0 && selectedDocIds.length === filteredDocuments.length;

    const toggleSelectAllDocs = () => {
        if (allFilteredSelected) {
            setSelectedDocIds([]);
        } else {
            setSelectedDocIds(filteredDocuments.map(d => d.id));
        }
    };

    const toggleSelectDoc = (id) => {
        if (selectedDocIds.includes(id)) {
            setSelectedDocIds(selectedDocIds.filter(docId => docId !== id));
        } else {
            setSelectedDocIds([...selectedDocIds, id]);
        }
    };

    // ─── Universities, Semesters, Subjects Cascading Selectors ──────
    const selectedUniversity = useMemo(() => {
        return universities.find(u => String(u.id) === String(targetUniversityId)) || null;
    }, [universities, targetUniversityId]);

    const availableSemesters = useMemo(() => {
        return selectedUniversity?.semesters || [];
    }, [selectedUniversity]);

    const selectedSemester = useMemo(() => {
        return availableSemesters.find(s => String(s.id) === String(targetSemesterId)) || null;
    }, [availableSemesters, targetSemesterId]);

    const availableSubjects = useMemo(() => {
        return selectedSemester?.subjects || [];
    }, [selectedSemester]);

    // ─── Upload Queue Handling ──────────────────────────────────────
    const handleAddUploadFiles = (incomingFiles) => {
        const newFiles = Array.from(incomingFiles || []);
        if (newFiles.length === 0) return;

        const maxBytes = 512 * 1024 * 1024;
        const oversized = newFiles.filter(f => f.size > maxBytes);
        if (oversized.length > 0) {
            alert(`Files exceed 512MB limit: ${oversized.map(f => f.name).join(', ')}`);
            return;
        }

        const existingNames = new Set(uploadFiles.map(f => `${f.name}_${f.size}`));
        const filteredNew = newFiles.filter(f => !existingNames.has(`${f.name}_${f.size}`));

        const updatedFiles = [...uploadFiles, ...filteredNew];
        setUploadFiles(updatedFiles);
    };

    const removeUploadFile = (index) => {
        const updated = uploadFiles.filter((_, idx) => idx !== index);
        setUploadFiles(updated);

        const newSchedules = { ...fileSchedules };
        delete newSchedules[index];
        setFileSchedules(newSchedules);

        setSelectedUploadIndexes(selectedUploadIndexes.filter(i => i !== index));
    };

    // ─── Batch Schedule within Upload Queue ─────────────────────────
    const allUploadSelected = uploadFiles.length > 0 && selectedUploadIndexes.length === uploadFiles.length;

    const toggleSelectAllUpload = () => {
        if (allUploadSelected) {
            setSelectedUploadIndexes([]);
        } else {
            setSelectedUploadIndexes(uploadFiles.map((_, idx) => idx));
        }
    };

    const toggleSelectUploadIndex = (idx) => {
        if (selectedUploadIndexes.includes(idx)) {
            setSelectedUploadIndexes(selectedUploadIndexes.filter(i => i !== idx));
        } else {
            setSelectedUploadIndexes([...selectedUploadIndexes, idx]);
        }
    };

    const applyUploadBatchSchedule = () => {
        if (!uploadBatchScheduleDate) return;
        const newSchedules = { ...fileSchedules };
        
        // If items are selected, apply to selected. Otherwise apply to all in queue!
        const targets = selectedUploadIndexes.length > 0 ? selectedUploadIndexes : uploadFiles.map((_, i) => i);
        targets.forEach((idx) => {
            newSchedules[idx] = uploadBatchScheduleDate;
        });

        setFileSchedules(newSchedules);
    };

    const setIndividualFileSchedule = (idx, value) => {
        setFileSchedules(prev => ({
            ...prev,
            [idx]: value
        }));
    };

    const clearAllUploadSchedules = () => {
        setFileSchedules({});
        setUploadBatchScheduleDate('');
    };

    // ─── Perform Upload Submission ──────────────────────────────────
    const submitUpload = (e) => {
        e.preventDefault();
        if (uploadFiles.length === 0) return;

        postUpload(route('admin.pending-cabinet.upload'), {
            data: {
                files: uploadFiles,
                schedules: fileSchedules,
                is_downloadable: uploadDefaultDownloadable,
                is_view_only: uploadDefaultViewOnly,
                is_universal: uploadDefaultUniversal,
            },
            onSuccess: () => {
                setShowUploadModal(false);
                setUploadFiles([]);
                setFileSchedules({});
                setSelectedUploadIndexes([]);
                resetUploadForm();
            }
        });
    };

    // ─── Perform Assignment to Class ────────────────────────────────
    const submitAssignment = (e) => {
        e.preventDefault();
        if (!targetSubjectId || selectedDocIds.length === 0) return;

        router.post(route('admin.pending-cabinet.assign'), {
            document_ids: selectedDocIds,
            subject_id: targetSubjectId,
            published_at: assignPublishDate || null,
            is_downloadable: assignDownloadable,
            is_view_only: assignViewOnly,
        }, {
            onSuccess: () => {
                setShowAssignModal(false);
                setSelectedDocIds([]);
                setTargetSubjectId('');
                setAssignPublishDate('');
            }
        });
    };

    // ─── Perform Batch Schedule ─────────────────────────────────────
    const submitBatchSchedule = (e) => {
        e.preventDefault();
        if (selectedDocIds.length === 0) return;

        router.post(route('admin.pending-cabinet.bulk-schedule'), {
            document_ids: selectedDocIds,
            published_at: batchScheduleDate || null,
        }, {
            onSuccess: () => {
                setShowScheduleModal(false);
                setBatchScheduleDate('');
                setSelectedDocIds([]);
            }
        });
    };

    // ─── Perform Bulk Delete ────────────────────────────────────────
    const handleBulkDelete = () => {
        if (selectedDocIds.length === 0) return;
        if (!confirm(`Are you sure you want to permanently delete ${selectedDocIds.length} staged file(s)?`)) return;

        router.post(route('admin.pending-cabinet.bulk-delete'), {
            document_ids: selectedDocIds,
        }, {
            onSuccess: () => {
                setSelectedDocIds([]);
            }
        });
    };

    // ─── Single Document Edit ───────────────────────────────────────
    const openEditModal = (doc) => {
        setEditingDoc(doc);
        setEditData({
            title: doc.title || '',
            description: doc.description || '',
            published_at: doc.published_at ? doc.published_at.substring(0, 16) : '',
            is_downloadable: Boolean(doc.is_downloadable),
            is_view_only: Boolean(doc.is_view_only),
        });
        setShowEditModal(true);
    };

    const submitSingleEdit = (e) => {
        e.preventDefault();
        if (!editingDoc) return;

        patchEdit(route('admin.documents.update', editingDoc.id), {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingDoc(null);
                resetEditForm();
            }
        });
    };

    const handleDeleteSingle = (id) => {
        if (!confirm('Are you sure you want to delete this file from the pending cabinet?')) return;
        router.delete(route('admin.documents.destroy', id));
    };

    const openAssignSingle = (doc) => {
        setSelectedDocIds([doc.id]);
        setShowAssignModal(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff5e36] to-[#ff416c] text-white flex items-center justify-center shadow-md shadow-[#ff5e36]/25">
                                <UploadCloud className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                        Pending Cabinet
                                    </h2>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ff5e36]/15 text-[#ff5e36] dark:text-[#ff7a54] border border-[#ff5e36]/20">
                                        {stats.total_pending} Staged
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Central staging area: upload materials now, schedule releases, and assign them later to universities and classes.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Open Upload Modal */}
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5e36] to-[#ff416c] hover:brightness-105 active:scale-95 text-white text-xs font-bold uppercase tracking-wider shadow-sm shadow-[#ff5e36]/30 transition-all"
                        >
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload Files</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Pending Cabinet - Staging & Class Assignment" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* ─── Metric Cards ────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="liquid-glass p-5 rounded-2xl border border-white/70 dark:border-white/10 shadow-xs flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                                    Total Staged Files
                                </span>
                                <div className="text-2xl font-black text-slate-900 dark:text-white">
                                    {stats.total_pending}
                                </div>
                                <p className="text-[11px] text-slate-500">Unassigned pending materials</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                <Layers className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="liquid-glass p-5 rounded-2xl border border-white/70 dark:border-white/10 shadow-xs flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                                    Scheduled for Future
                                </span>
                                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                    {stats.scheduled}
                                </div>
                                <p className="text-[11px] text-slate-500">Auto-release timed release</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>

                        <div className="liquid-glass p-5 rounded-2xl border border-white/70 dark:border-white/10 shadow-xs flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                                    Staged Footprint
                                </span>
                                <div className="text-2xl font-black text-slate-900 dark:text-white">
                                    {formatBytes(stats.total_bytes)}
                                </div>
                                <p className="text-[11px] text-slate-500">Fast Cloud & Local Storage</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* ─── Search & Filters Bar ───────────────────────────────── */}
                    <div className="liquid-glass p-4 rounded-2xl border border-white/70 dark:border-white/10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="relative w-full md:w-80">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, filename..."
                                className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            {/* Type filter */}
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                            >
                                <option value="all">All File Types</option>
                                <option value="pdf">PDF Documents</option>
                                <option value="presentation">PowerPoint (PPT/PPTX)</option>
                                <option value="document">Word Documents (DOC/DOCX)</option>
                                <option value="archive">Archives (ZIP/RAR)</option>
                                <option value="media">Audio & Video</option>
                            </select>

                            {/* Status filter */}
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                            >
                                <option value="all">All Publish Status</option>
                                <option value="scheduled">Scheduled for Future</option>
                                <option value="ready">Ready / Unscheduled</option>
                            </select>
                        </div>
                    </div>

                    {/* ─── Sticky Batch Action Bar (Appears when items are selected) ─── */}
                    {selectedDocIds.length > 0 && (
                        <div className="sticky top-20 z-30 p-3.5 rounded-2xl bg-slate-900 text-white dark:bg-[#161B26] border border-slate-700/80 dark:border-white/15 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[#ff5e36] text-white text-xs font-bold">
                                    {selectedDocIds.length}
                                </span>
                                <span className="text-xs font-bold text-slate-200">
                                    {selectedDocIds.length === 1 ? 'file selected' : 'files selected'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Assign Selected to Class */}
                                <button
                                    onClick={() => setShowAssignModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#ff5e36] to-[#ff416c] hover:brightness-105 active:scale-95 text-xs font-bold text-white shadow-sm"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Assign to Class</span>
                                </button>

                                {/* Batch Schedule */}
                                <button
                                    onClick={() => setShowScheduleModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-xs font-bold text-white shadow-sm"
                                >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Schedule Release</span>
                                </button>

                                {/* Bulk Delete */}
                                <button
                                    onClick={handleBulkDelete}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-xs font-bold text-white shadow-sm"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                </button>

                                {/* Deselect All */}
                                <button
                                    onClick={() => setSelectedDocIds([])}
                                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-300"
                                >
                                    Deselect
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ─── Documents Table / List ─────────────────────────────── */}
                    <div className="liquid-glass rounded-3xl overflow-hidden border border-white/70 dark:border-white/10 shadow-sm">
                        {filteredDocuments.length === 0 ? (
                            <div className="text-center py-16 px-4 space-y-3">
                                <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-[#ff5e36] flex items-center justify-center mx-auto">
                                    <UploadCloud className="w-8 h-8" />
                                </div>
                                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                    No documents in Pending Cabinet
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                                    {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                                        ? 'No files matched your filters. Try clearing search or filters.'
                                        : 'Upload files here to stage them in advance, set scheduled releases, and assign them to specific classes later.'}
                                </p>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5e36] to-[#ff416c] text-white text-xs font-bold uppercase tracking-wider shadow-sm mt-2"
                                >
                                    <UploadCloud className="w-4 h-4" />
                                    <span>Upload Files Now</span>
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                                        <tr>
                                            <th className="py-3.5 px-4 w-10 text-center">
                                                <button
                                                    type="button"
                                                    onClick={toggleSelectAllDocs}
                                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                                    title={allFilteredSelected ? 'Deselect All' : 'Select All'}
                                                >
                                                    {allFilteredSelected ? (
                                                        <CheckSquare className="w-4 h-4 text-[#ff5e36]" />
                                                    ) : (
                                                        <Square className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </th>
                                            <th className="py-3.5 px-4">Document Title & Filename</th>
                                            <th className="py-3.5 px-4">Size</th>
                                            <th className="py-3.5 px-4">Status & Schedule</th>
                                            <th className="py-3.5 px-4">Permissions</th>
                                            <th className="py-3.5 px-4">Uploaded</th>
                                            <th className="py-3.5 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-normal">
                                        {filteredDocuments.map((doc) => {
                                            const isSelected = selectedDocIds.includes(doc.id);
                                            const isScheduledFuture = doc.published_at && new Date(doc.published_at) > new Date();

                                            return (
                                                <tr
                                                    key={doc.id}
                                                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                                                        isSelected ? 'bg-orange-50/50 dark:bg-orange-950/20' : ''
                                                    }`}
                                                >
                                                    {/* Checkbox */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSelectDoc(doc.id)}
                                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                                        >
                                                            {isSelected ? (
                                                                <CheckSquare className="w-4 h-4 text-[#ff5e36]" />
                                                            ) : (
                                                                <Square className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </td>

                                                    {/* Title & File Info */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="flex items-center gap-3">
                                                            {getFileIcon(doc.file_name, doc.file_type)}
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-xs sm:max-w-md">
                                                                    {doc.title}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
                                                                    {doc.file_name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Size */}
                                                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                        {formatBytes(doc.file_size)}
                                                    </td>

                                                    {/* Status & Schedule */}
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        {isScheduledFuture ? (
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                                <Clock className="w-3 h-3 shrink-0" />
                                                                <span>Release: {new Date(doc.published_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                                <CheckCircle2 className="w-3 h-3 shrink-0" />
                                                                <span>Ready to Assign</span>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Permissions */}
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-1.5">
                                                            {doc.is_downloadable ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                                    <Download className="w-2.5 h-2.5" />
                                                                    Download
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                                                    <Eye className="w-2.5 h-2.5" />
                                                                    View Only
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Upload Date */}
                                                    <td className="py-3.5 px-4 text-[11px] text-slate-400 whitespace-nowrap font-mono">
                                                        {new Date(doc.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>

                                                    {/* Action Buttons */}
                                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {/* Assign single file */}
                                                            <button
                                                                type="button"
                                                                onClick={() => openAssignSingle(doc)}
                                                                className="px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-[#ff5e36] text-[11px] font-bold transition-all flex items-center gap-1"
                                                                title="Assign to university class"
                                                            >
                                                                <Send className="w-3 h-3" />
                                                                Assign
                                                            </button>

                                                            {/* Edit options */}
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditModal(doc)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                                title="Edit details & schedule"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>

                                                            {/* Preview */}
                                                            <a
                                                                href={route('documents.view', doc.id)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                                                                title="Preview Document"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </a>

                                                            {/* Delete */}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteSingle(doc.id)}
                                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                                                title="Delete file"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
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

            {/* ═══════════════════════════════════════════════════════════════════
                 MODAL 1: BULK UPLOAD WITH INDIVIDUAL & BATCH SCHEDULING
               ═══════════════════════════════════════════════════════════════════ */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                    <div className="liquid-glass border border-white/60 dark:border-white/10 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center">
                                    <UploadCloud className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Upload to Pending Cabinet
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Bulk stage files, configure permissions, and schedule release times individually or all at once.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowUploadModal(false);
                                    setUploadFiles([]);
                                    setFileSchedules({});
                                }}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitUpload} className="mt-5 space-y-5">
                            {/* Drag and Drop Zone */}
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    if (!uploadProcessing) setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    if (!uploadProcessing && e.dataTransfer.files) {
                                        handleAddUploadFiles(e.dataTransfer.files);
                                    }
                                }}
                                onClick={() => !uploadProcessing && fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer select-none transition-all ${
                                    isDragging
                                        ? 'border-[#ff5e36] bg-[#ff5e36]/5 scale-[1.01]'
                                        : 'border-slate-200 dark:border-white/10 hover:border-[#ff5e36]/50 bg-slate-50/50 dark:bg-slate-900/40'
                                } ${uploadProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={(e) => handleAddUploadFiles(e.target.files)}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-[#ff5e36] flex items-center justify-center">
                                        <UploadCloud className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        Drop files here or click to browse
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Supports PDF, Word, PowerPoint, Excel, Audio/Video &amp; Archives up to 512MB per file.
                                    </p>
                                </div>
                            </div>

                            {/* Upload Queue Table with Individual Scheduling & Batch Schedule Toolbar */}
                            {uploadFiles.length > 0 && (
                                <div className="space-y-3">
                                    {/* Batch Scheduling Action Bar */}
                                    <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={toggleSelectAllUpload}
                                                className="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 hover:text-[#ff5e36]"
                                            >
                                                {allUploadSelected ? (
                                                    <CheckSquare className="w-4 h-4 text-[#ff5e36]" />
                                                ) : (
                                                    <Square className="w-4 h-4" />
                                                )}
                                                <span>Select All ({uploadFiles.length})</span>
                                            </button>

                                            {selectedUploadIndexes.length > 0 && (
                                                <span className="text-[11px] font-mono font-semibold text-[#ff5e36]">
                                                    • {selectedUploadIndexes.length} chosen
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <input
                                                type="datetime-local"
                                                value={uploadBatchScheduleDate}
                                                onChange={(e) => setUploadBatchScheduleDate(e.target.value)}
                                                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                                            />
                                            <button
                                                type="button"
                                                onClick={applyUploadBatchSchedule}
                                                disabled={!uploadBatchScheduleDate}
                                                className="px-3 py-1.5 rounded-xl bg-[#ff5e36] text-white font-bold text-xs hover:brightness-105 disabled:opacity-40 whitespace-nowrap shadow-xs"
                                            >
                                                {selectedUploadIndexes.length > 0 
                                                    ? `Apply to Selected (${selectedUploadIndexes.length})` 
                                                    : 'Apply to All'}
                                            </button>
                                            {Object.keys(fileSchedules).length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={clearAllUploadSchedules}
                                                    className="text-slate-400 hover:text-rose-500 text-[11px] whitespace-nowrap"
                                                >
                                                    Clear Schedules
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Scrollable File Items List */}
                                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                                        {uploadFiles.map((file, idx) => {
                                            const isChecked = selectedUploadIndexes.includes(idx);
                                            const scheduledTime = fileSchedules[idx] || '';

                                            return (
                                                <div
                                                    key={`${file.name}_${idx}`}
                                                    className={`p-3 rounded-2xl border transition-all text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                                        isChecked
                                                            ? 'border-[#ff5e36]/50 bg-orange-50/40 dark:bg-orange-950/20'
                                                            : 'border-slate-200/80 dark:border-white/10 bg-white dark:bg-slate-900/60'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => toggleSelectUploadIndex(idx)}
                                                            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                                        >
                                                            {isChecked ? (
                                                                <CheckSquare className="w-4 h-4 text-[#ff5e36]" />
                                                            ) : (
                                                                <Square className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        {getFileIcon(file.name)}
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-xs sm:max-w-sm">
                                                                {file.name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400 font-mono">
                                                                {formatBytes(file.size)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Individual Schedule Picker & Remove Button */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                            <input
                                                                type="datetime-local"
                                                                value={scheduledTime}
                                                                onChange={(e) => setIndividualFileSchedule(idx, e.target.value)}
                                                                placeholder="Schedule publish"
                                                                className="px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 dark:text-white"
                                                            />
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeUploadFile(idx)}
                                                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
                                                            title="Remove file"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Global Permissions & Settings */}
                            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 space-y-3">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                                    Default Upload Permissions
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={uploadDefaultDownloadable}
                                            onChange={(e) => setUploadDefaultDownloadable(e.target.checked)}
                                            className="w-4 h-4 rounded text-[#ff5e36] focus:ring-[#ff5e36]"
                                        />
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            Allow Students to Download Files
                                        </span>
                                    </label>

                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={uploadDefaultViewOnly}
                                            onChange={(e) => setUploadDefaultViewOnly(e.target.checked)}
                                            className="w-4 h-4 rounded text-[#ff5e36] focus:ring-[#ff5e36]"
                                        />
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            Strict Anti-Download / View-Only Mode
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Upload Progress Bar */}
                            {uploadProcessing && (
                                <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-2">
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 text-[#ff5e36] animate-spin" />
                                            <span>Uploading {uploadFiles.length} file(s) into Pending Cabinet...</span>
                                        </span>
                                        <span className="font-mono text-[#ff5e36] font-bold">
                                            {uploadProgress?.percentage ? `${uploadProgress.percentage}%` : 'Transferring...'}
                                        </span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#ff5e36] to-[#ff416c] rounded-full transition-all duration-200"
                                            style={{ width: `${uploadProgress?.percentage || 20}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Footer Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadModal(false);
                                        setUploadFiles([]);
                                        setFileSchedules({});
                                    }}
                                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadFiles.length === 0 || uploadProcessing}
                                    className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#ff5e36] to-[#ff416c] hover:brightness-105 active:scale-95 disabled:opacity-50 shadow-sm shadow-[#ff5e36]/30 flex items-center gap-2"
                                >
                                    {uploadProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Staging Files...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-4 h-4" />
                                            <span>Stage {uploadFiles.length} File(s)</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                 MODAL 2: ASSIGN SELECTED DOCUMENTS TO A CLASS / SUBJECT
               ═══════════════════════════════════════════════════════════════════ */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="liquid-glass border border-white/60 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center">
                                    <Send className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Assign to Class / Course Cabinet
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Assigning {selectedDocIds.length} staged file(s) to a university semester &amp; subject.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitAssignment} className="mt-5 space-y-4">
                            {/* University Selector */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    1. Select University / Campus *
                                </label>
                                <select
                                    required
                                    value={targetUniversityId}
                                    onChange={(e) => {
                                        setTargetUniversityId(e.target.value);
                                        setTargetSemesterId('');
                                        setTargetSubjectId('');
                                    }}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                                >
                                    <option value="">-- Choose University --</option>
                                    {universities.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.semesters?.length || 0} Semesters)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Semester Selector */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    2. Select Semester / Year *
                                </label>
                                <select
                                    required
                                    disabled={!targetUniversityId}
                                    value={targetSemesterId}
                                    onChange={(e) => {
                                        setTargetSemesterId(e.target.value);
                                        setTargetSubjectId('');
                                    }}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36] disabled:opacity-50"
                                >
                                    <option value="">-- Choose Semester --</option>
                                    {availableSemesters.map((sem) => (
                                        <option key={sem.id} value={sem.id}>
                                            {sem.name} ({sem.subjects?.length || 0} Subjects)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subject / Class Selector */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    3. Select Course Cabinet / Class *
                                </label>
                                <select
                                    required
                                    disabled={!targetSemesterId}
                                    value={targetSubjectId}
                                    onChange={(e) => setTargetSubjectId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36] disabled:opacity-50 font-bold"
                                >
                                    <option value="">-- Choose Course Cabinet --</option>
                                    {availableSubjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.title} ({sub.code || 'Cabinet'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Optional Scheduled Release override */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Schedule Availability / Release Date (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={assignPublishDate}
                                    onChange={(e) => setAssignPublishDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Leave blank to publish immediately upon assignment, or pick a date to keep it hidden from students until that time.
                                </p>
                            </div>

                            {/* Permissions */}
                            <div className="pt-2 flex items-center gap-4 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={assignDownloadable}
                                        onChange={(e) => setAssignDownloadable(e.target.checked)}
                                        className="w-4 h-4 rounded text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Downloadable
                                    </span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={assignViewOnly}
                                        onChange={(e) => setAssignViewOnly(e.target.checked)}
                                        className="w-4 h-4 rounded text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Strict View-Only
                                    </span>
                                </label>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowAssignModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!targetSubjectId}
                                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#ff5e36] to-[#ff416c] hover:brightness-105 active:scale-95 disabled:opacity-50 shadow-sm"
                                >
                                    Confirm Assignment ({selectedDocIds.length})
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                 MODAL 3: BATCH SCHEDULE FOR SELECTED STAGED DOCUMENTS
               ═══════════════════════════════════════════════════════════════════ */}
            {showScheduleModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="liquid-glass border border-white/60 dark:border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Batch Schedule Release
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Set publication release time for {selectedDocIds.length} staged file(s).
                                </p>
                            </div>
                            <button
                                onClick={() => setShowScheduleModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitBatchSchedule} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Scheduled Release Date &amp; Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={batchScheduleDate}
                                    onChange={(e) => setBatchScheduleDate(e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Clear this field to remove existing schedule and make files ready immediately when assigned.
                                </p>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowScheduleModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-amber-500 hover:bg-amber-600 active:scale-95 shadow-sm"
                                >
                                    Apply Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════
                 MODAL 4: EDIT SINGLE DOCUMENT SETTINGS & OPTIONS
               ═══════════════════════════════════════════════════════════════════ */}
            {showEditModal && editingDoc && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="liquid-glass border border-white/60 dark:border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Edit Document Options
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate max-w-xs">
                                    {editingDoc.file_name}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitSingleEdit} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Document Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editData.title}
                                    onChange={(e) => setEditData('title', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Scheduled Release Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={editData.published_at}
                                    onChange={(e) => setEditData('published_at', e.target.value)}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                                />
                            </div>

                            <div className="pt-2 space-y-2 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editData.is_downloadable}
                                        onChange={(e) => setEditData('is_downloadable', e.target.checked)}
                                        className="w-4 h-4 rounded text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Allow Download
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editData.is_view_only}
                                        onChange={(e) => setEditData('is_view_only', e.target.checked)}
                                        className="w-4 h-4 rounded text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                        Strict Anti-Download / View-Only Mode
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#ff5e36] to-[#ff416c] hover:brightness-105 active:scale-95 disabled:opacity-50 shadow-sm"
                                >
                                    {editProcessing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
