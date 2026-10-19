import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Building2, 
    BookOpen, 
    Users, 
    ArrowLeft, 
    Plus, 
    Calendar, 
    Trash2, 
    FileText, 
    ExternalLink,
    ChevronRight,
    GraduationCap,
    Edit3,
    X,
    CheckCircle2,
    Clock
} from 'lucide-react';

export default function UniversityShow({ university = {} }) {
    const [showAddSemester, setShowAddSemester] = useState(false);
    const [editingSemester, setEditingSemester] = useState(null);
    
    // Create Semester Form
    const { 
        data: semData, 
        setData: setSemData, 
        post: postSem, 
        processing: semProcessing, 
        reset: resetSem, 
        errors: semErrors 
    } = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_active: true,
        sort_order: 0,
    });

    // Edit Semester Form
    const [editData, setEditData] = useState({
        name: '',
        start_date: '',
        end_date: '',
        is_active: true,
        sort_order: 0,
    });
    const [editProcessing, setEditProcessing] = useState(false);
    const [editErrors, setEditErrors] = useState({});

    const handleCreateSemester = (e) => {
        e.preventDefault();
        postSem(route('admin.universities.semesters.store', university.id), {
            onSuccess: () => {
                resetSem();
                setShowAddSemester(false);
            }
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const clean = String(dateStr).split('T')[0];
        try {
            const [y, m, d] = clean.split('-');
            if (y && m && d) {
                const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
                return dateObj.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            }
        } catch (e) {}
        return clean;
    };

    const openEditSemester = (sem) => {
        setEditingSemester(sem);
        setEditData({
            name: sem.name || '',
            start_date: sem.start_date ? String(sem.start_date).split('T')[0] : '',
            end_date: sem.end_date ? String(sem.end_date).split('T')[0] : '',
            is_active: Boolean(sem.is_active),
            sort_order: sem.sort_order || 0,
        });
        setEditErrors({});
    };

    const handleUpdateSemester = (e) => {
        e.preventDefault();
        setEditProcessing(true);
        router.put(
            route('admin.universities.semesters.update', [university.id, editingSemester.id]),
            editData,
            {
                onSuccess: () => {
                    setEditingSemester(null);
                    setEditProcessing(false);
                },
                onError: (errs) => {
                    setEditErrors(errs);
                    setEditProcessing(false);
                }
            }
        );
    };

    const handleDeleteSemester = (semesterId, semesterName) => {
        if (confirm(`Move semester '${semesterName}' to Recycle Bin? You can recover it anytime from the Recycle Bin.`)) {
            router.delete(route('admin.universities.semesters.destroy', [university.id, semesterId]));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.universities.index')}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/80 dark:border-white/10"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    {university.name}
                                </h2>
                                <Link
                                    href={route('admin.universities.edit', university.id)}
                                    className="text-xs font-semibold text-[#ff5e36] hover:text-[#e04822] bg-[#ff5e36]/10 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                    Edit Campus
                                </Link>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                {university.students_count || 0} students enrolled • {university.subjects_count || 0} subjects
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddSemester(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Semester
                        </button>
                        <Link
                            href={route('admin.subjects.create')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/20 transition-all hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            Add Subject
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={university.name} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Add Semester Drawer / Form */}
                    {showAddSemester && (
                        <div className="bg-white dark:bg-[#0c1017] rounded-2xl border border-[#ff5e36]/40 p-6 shadow-md ring-2 ring-[#ff5e36]/20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#ff5e36]" />
                                    Create Academic Semester / Term
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowAddSemester(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSemester} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Semester Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Fall 2026 or Term 1"
                                        value={semData.name}
                                        onChange={(e) => setSemData('name', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                    />
                                    {semErrors.name && <p className="text-xs text-rose-600 mt-1">{semErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={semData.start_date}
                                        onChange={(e) => setSemData('start_date', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={semData.end_date}
                                        onChange={(e) => setSemData('end_date', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl"
                                    />
                                </div>

                                <div className="sm:col-span-4 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={semData.is_active}
                                            onChange={(e) => setSemData('is_active', e.target.checked)}
                                            className="rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                        />
                                        <span>Active Term (Visible to students in dropdowns)</span>
                                    </label>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddSemester(false)}
                                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={semProcessing}
                                            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ff5e36] text-white hover:bg-[#e04822] shadow-sm transition-all"
                                        >
                                            Save Semester
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Edit Semester Modal */}
                    {editingSemester && (
                        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
                            <div className="bg-white dark:bg-[#0c1017] rounded-3xl border border-slate-200/90 dark:border-white/10 max-w-xl w-full p-6 sm:p-8 shadow-2xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center">
                                            <Edit3 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                Edit Semester: {editingSemester.name}
                                            </h3>
                                            <p className="text-xs text-slate-500">Update academic term timeframe and status.</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditingSemester(null)}
                                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-white/5"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateSemester} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                            Semester Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                        />
                                        {editErrors.name && <p className="text-xs text-rose-600 mt-1">{editErrors.name}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={editData.start_date || ''}
                                                onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                                                className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                End Date
                                            </label>
                                            <input
                                                type="date"
                                                value={editData.end_date || ''}
                                                onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                                                className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editData.is_active}
                                                onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                                                className="rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                            />
                                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                                Active Term (currently active in the academic year)
                                            </span>
                                        </label>
                                    </div>

                                    <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setEditingSemester(null)}
                                            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-xl"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={editProcessing}
                                            className="px-5 py-2 text-xs font-bold bg-[#ff5e36] hover:bg-[#e04822] text-white rounded-xl shadow-sm transition-all"
                                        >
                                            {editProcessing ? 'Saving...' : 'Update Semester'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Semesters & Subjects Cabinet Tree */}
                    <div className="space-y-6">
                        {(university.semesters || []).length === 0 ? (
                            <div className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 p-10 text-center">
                                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No Semesters Defined</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Create a semester to organize your courses and subjects.</p>
                                <button
                                    onClick={() => setShowAddSemester(true)}
                                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-semibold"
                                >
                                    + Add Semester
                                </button>
                            </div>
                        ) : (
                            university.semesters.map((sem) => (
                                <div key={sem.id} className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
                                    <div className="p-5 bg-slate-50/70 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{sem.name}</h3>
                                                    {sem.is_active ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500">
                                                            Archived
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    {(sem.subjects || []).length} Course Module(s)
                                                    {sem.start_date && ` • ${formatDate(sem.start_date)} to ${sem.end_date ? formatDate(sem.end_date) : 'Ongoing'}`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openEditSemester(sem)}
                                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                                title="Edit Semester"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSemester(sem.id, sem.name)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                                title="Delete Semester (Recycle Bin)"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subjects inside Semester */}
                                    <div className="p-6">
                                        {(sem.subjects || []).length === 0 ? (
                                            <div className="py-6 text-center">
                                                <p className="text-xs text-slate-400 italic">
                                                    No subjects assigned to this semester yet.
                                                </p>
                                                <Link
                                                    href={route('admin.subjects.create')}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#ff5e36] mt-2 hover:underline"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Add Course Cabinet Here
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {sem.subjects.map((subj) => (
                                                    <Link
                                                        key={subj.id}
                                                        href={route('admin.subjects.show', subj.id)}
                                                        className="p-4 rounded-xl border border-slate-200/70 dark:border-white/10 hover:border-[#ff5e36]/40 hover:shadow-sm bg-white dark:bg-[#0c1017] transition-all group flex flex-col justify-between"
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300">
                                                                    {subj.code || 'MOD'}
                                                                </span>
                                                                <span className="text-xs font-bold text-[#ff5e36] group-hover:translate-x-0.5 transition-transform">
                                                                    Open Cabinet &rarr;
                                                                </span>
                                                            </div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#ff5e36] transition-colors">
                                                                {subj.title}
                                                            </h4>
                                                        </div>

                                                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs text-slate-400">
                                                            <span className="flex items-center gap-1">
                                                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                                {subj.documents_count || 0} Files
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                                                {subj.assignments_count || 0} Assignments
                                                            </span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
