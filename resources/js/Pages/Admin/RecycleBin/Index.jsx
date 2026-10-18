import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Trash2, 
    RotateCcw, 
    BookOpen, 
    Calendar, 
    Building2, 
    AlertTriangle, 
    Search, 
    ArrowLeft, 
    CheckCircle2, 
    FileText, 
    GraduationCap, 
    Clock,
    Sparkles
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

export default function RecycleBinIndex({ 
    subjects = [], 
    semesters = [], 
    universities = [], 
    counts = { subjects: 0, semesters: 0, universities: 0, total: 0 } 
}) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: null, title: '', isForceDelete: false });

    const { post, delete: destroy, processing } = useForm();

    const handleRestore = (type, id, title) => {
        router.post(route('admin.recycle-bin.restore'), {
            type,
            id,
        }, {
            preserveScroll: true,
        });
    };

    const handleForceDelete = (type, id, title) => {
        if (confirm(`Permanently delete '${title}'? This action is completely IRREVERSIBLE and cannot be undone.`)) {
            router.delete(route('admin.recycle-bin.force-delete'), {
                data: { type, id },
                preserveScroll: true,
            });
        }
    };

    const handleRestoreAll = () => {
        if (confirm('Restore all items in the Recycle Bin back to active status?')) {
            router.post(route('admin.recycle-bin.restore-all'), {}, { preserveScroll: true });
        }
    };

    const handleEmptyTrash = () => {
        if (confirm('Are you sure you want to completely empty the Recycle Bin? All items will be permanently erased forever.')) {
            router.delete(route('admin.recycle-bin.empty'), {}, { preserveScroll: true });
        }
    };

    // Filter items
    const filteredSubjects = subjects.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredSemesters = semesters.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.university?.name && s.university.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filteredUniversities = universities.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalFiltered = (activeTab === 'all' || activeTab === 'subjects' ? filteredSubjects.length : 0) +
                          (activeTab === 'all' || activeTab === 'semesters' ? filteredSemesters.length : 0) +
                          (activeTab === 'all' || activeTab === 'universities' ? filteredUniversities.length : 0);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.dashboard')}
                            className="p-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-all shadow-xs border border-slate-200/80 dark:border-white/10"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                                    {t('recycleBin', 'Recycle Bin')}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                    {counts.total} in trash
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Restore deleted course modules, academic semesters, and campus cabinets, or erase them permanently.
                            </p>
                        </div>
                    </div>

                    {counts.total > 0 && (
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={handleRestoreAll}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/25 transition-all hover:scale-105 active:scale-95"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Restore All Items</span>
                            </button>
                            <button
                                onClick={handleEmptyTrash}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/25 transition-all hover:scale-105 active:scale-95"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Empty Trash</span>
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Recycle Bin - Lecture Portal" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Stat Badges / Quick Glance */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-[#0c1017] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total in Trash</span>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{counts.total}</div>
                            <span className="text-[11px] text-slate-400">Eligible for 1-click restore</span>
                        </div>
                        <div className="bg-white dark:bg-[#0c1017] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-[#ff5e36]" />
                                Trashed Subjects
                            </span>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{counts.subjects}</div>
                            <span className="text-[11px] text-slate-400">Course cabinets</span>
                        </div>
                        <div className="bg-white dark:bg-[#0c1017] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                Trashed Semesters
                            </span>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{counts.semesters}</div>
                            <span className="text-[11px] text-slate-400">Academic terms</span>
                        </div>
                        <div className="bg-white dark:bg-[#0c1017] p-5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                                Trashed Campuses
                            </span>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{counts.universities}</div>
                            <span className="text-[11px] text-slate-400">Universities</span>
                        </div>
                    </div>

                    {/* Filter Bar & Search */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    activeTab === 'all'
                                        ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/25'
                                        : 'bg-white dark:bg-[#0c1017] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10'
                                }`}
                            >
                                All Items ({counts.total})
                            </button>
                            <button
                                onClick={() => setActiveTab('subjects')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    activeTab === 'subjects'
                                        ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/25'
                                        : 'bg-white dark:bg-[#0c1017] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10'
                                }`}
                            >
                                Subjects ({counts.subjects})
                            </button>
                            <button
                                onClick={() => setActiveTab('semesters')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    activeTab === 'semesters'
                                        ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/25'
                                        : 'bg-white dark:bg-[#0c1017] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10'
                                }`}
                            >
                                Semesters ({counts.semesters})
                            </button>
                            <button
                                onClick={() => setActiveTab('universities')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    activeTab === 'universities'
                                        ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/25'
                                        : 'bg-white dark:bg-[#0c1017] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/80 dark:border-white/10'
                                }`}
                            >
                                Universities ({counts.universities})
                            </button>
                        </div>

                        <div className="relative min-w-[260px]">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search trashed items..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0c1017] text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                            />
                        </div>
                    </div>

                    {/* Content Section */}
                    {counts.total === 0 ? (
                        <div className="bg-white dark:bg-[#0c1017] rounded-3xl border border-slate-200/80 dark:border-white/10 p-16 text-center shadow-xs">
                            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recycle Bin is Completely Empty</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                No deleted subjects, semesters, or campuses are currently in the trash. When you delete items, you can always recover them here.
                            </p>
                            <div className="mt-6">
                                <Link
                                    href={route('admin.subjects.index')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-bold transition-all shadow-sm"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    <span>Browse Active Course Cabinets</span>
                                </Link>
                            </div>
                        </div>
                    ) : totalFiltered === 0 ? (
                        <div className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 p-12 text-center">
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No items match your filter criteria.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">

                            {/* Subjects List */}
                            {(activeTab === 'all' || activeTab === 'subjects') && filteredSubjects.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
                                        <BookOpen className="w-3.5 h-3.5 text-[#ff5e36]" />
                                        Trashed Subjects ({filteredSubjects.length})
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {filteredSubjects.map((subj) => (
                                            <div 
                                                key={`subj-${subj.id}`}
                                                className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-xs hover:border-[#ff5e36]/40 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
                                            >
                                                <div className="flex items-start gap-3.5">
                                                    <div 
                                                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-xs"
                                                        style={{ backgroundColor: `${subj.color || '#ff5e36'}15`, color: subj.color || '#ff5e36' }}
                                                    >
                                                        {subj.code || 'SUBJ'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-[#ff5e36] transition-colors">
                                                                {subj.title}
                                                            </h4>
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                                                Deleted Subject
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            <span>Campus: <strong>{subj.university?.name || 'Unknown Campus'}</strong></span>
                                                            <span>•</span>
                                                            <span>Term: <strong>{subj.semester?.name || 'Unassigned'}</strong></span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1 text-slate-400">
                                                                <FileText className="w-3 h-3" />
                                                                {subj.documents_count || 0} Files
                                                            </span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1 text-slate-400">
                                                                <GraduationCap className="w-3 h-3" />
                                                                {subj.assignments_count || 0} Tasks
                                                            </span>
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Deleted: {new Date(subj.deleted_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleRestore('subject', subj.id, subj.title)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        <span>Restore Subject</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleForceDelete('subject', subj.id, subj.title)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 transition-colors"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Semesters List */}
                            {(activeTab === 'all' || activeTab === 'semesters') && filteredSemesters.length > 0 && (
                                <div className="space-y-3 pt-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
                                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                        Trashed Semesters & Terms ({filteredSemesters.length})
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {filteredSemesters.map((sem) => (
                                            <div 
                                                key={`sem-${sem.id}`}
                                                className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-xs hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
                                            >
                                                <div className="flex items-start gap-3.5">
                                                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                                                {sem.name}
                                                            </h4>
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                                                                Academic Semester
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            <span>Campus: <strong>{sem.university?.name || 'Unknown'}</strong></span>
                                                            <span>•</span>
                                                            <span>Subjects Attached: <strong>{sem.subjects_count || 0}</strong></span>
                                                            {sem.start_date && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>Duration: {sem.start_date} to {sem.end_date || 'Ongoing'}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Deleted: {new Date(sem.deleted_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleRestore('semester', sem.id, sem.name)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        <span>Restore Semester</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleForceDelete('semester', sem.id, sem.name)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-600 transition-colors"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Universities List */}
                            {(activeTab === 'all' || activeTab === 'universities') && filteredUniversities.length > 0 && (
                                <div className="space-y-3 pt-4">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-1">
                                        <Building2 className="w-3.5 h-3.5 text-amber-500" />
                                        Trashed Universities & Campuses ({filteredUniversities.length})
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {filteredUniversities.map((uni) => (
                                            <div 
                                                key={`uni-${uni.id}`}
                                                className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-xs hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 group"
                                            >
                                                <div className="flex items-start gap-3.5">
                                                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 font-bold">
                                                        {uni.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-base">
                                                                {uni.name}
                                                            </h4>
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                                                Partner Campus
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                            <span>Semesters: <strong>{uni.semesters_count || 0}</strong></span>
                                                            <span>•</span>
                                                            <span>Subjects: <strong>{uni.subjects_count || 0}</strong></span>
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            Deleted: {new Date(uni.deleted_at).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleRestore('university', uni.id, uni.name)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                        <span>Restore Campus</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleForceDelete('university', uni.id, uni.name)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-rose-600 transition-colors"
                                                        title="Delete Permanently"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
