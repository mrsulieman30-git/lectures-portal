import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
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
    GraduationCap
} from 'lucide-react';

export default function UniversityShow({ university = {} }) {
    const [showAddSemester, setShowAddSemester] = useState(false);
    
    const { data: semData, setData: setSemData, post: postSem, processing: semProcessing, reset: resetSem, errors: semErrors } = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_active: true,
    });

    const { delete: destroySem } = useForm();

    const handleCreateSemester = (e) => {
        e.preventDefault();
        postSem(route('admin.universities.semesters.store', university.id), {
            onSuccess: () => {
                resetSem();
                setShowAddSemester(false);
            }
        });
    };

    const handleDeleteSemester = (semesterId, semesterName) => {
        if (confirm(`Delete semester '${semesterName}'? This will unassign all subjects in this semester.`)) {
            destroySem(route('admin.universities.semesters.destroy', [university.id, semesterId]));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.universities.index')}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                    {university.name}
                                </h2>
                                <Link
                                    href={route('admin.universities.edit', university.id)}
                                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg"
                                >
                                    Edit Campus
                                </Link>
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {university.students_count || 0} students enrolled • {university.subjects_count || 0} subjects
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAddSemester(true)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Add Semester
                        </button>
                        <Link
                            href={route('admin.subjects.create')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all shadow-indigo-600/20"
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
                    
                    {/* Add Semester Modal / Form Drawer */}
                    {showAddSemester && (
                        <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-md ring-2 ring-indigo-500/20">
                            <h3 className="text-base font-bold text-slate-900 mb-4">
                                Create Academic Semester / Term
                            </h3>
                            <form onSubmit={handleCreateSemester} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Semester Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Fall 2026 or Term 1"
                                        value={semData.name}
                                        onChange={(e) => setSemData('name', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                    {semErrors.name && <p className="text-xs text-rose-600 mt-1">{semErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={semData.start_date}
                                        onChange={(e) => setSemData('start_date', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={semData.end_date}
                                        onChange={(e) => setSemData('end_date', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                                    />
                                </div>
                                <div className="sm:col-span-4 flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddSemester(false)}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={semProcessing}
                                        className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                                    >
                                        Save Semester
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Semesters & Subjects Cabinet Tree */}
                    <div className="space-y-6">
                        {(university.semesters || []).length === 0 ? (
                            <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center">
                                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <h4 className="text-sm font-bold text-slate-800">No Semesters Defined</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-4">Create a semester to organize your courses and subjects.</p>
                                <button
                                    onClick={() => setShowAddSemester(true)}
                                    className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
                                >
                                    + Add Semester
                                </button>
                            </div>
                        ) : (
                            university.semesters.map((sem) => (
                                <div key={sem.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                                    <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base">{sem.name}</h3>
                                                <span className="text-xs text-slate-400">
                                                    {(sem.subjects || []).length} Course Modules
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleDeleteSemester(sem.id, sem.name)}
                                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Delete Semester"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subjects inside Semester */}
                                    <div className="p-6">
                                        {(sem.subjects || []).length === 0 ? (
                                            <p className="text-xs text-slate-400 italic py-2">
                                                No subjects assigned to this semester yet.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {sem.subjects.map((subj) => (
                                                    <Link
                                                        key={subj.id}
                                                        href={route('admin.subjects.show', subj.id)}
                                                        className="p-4 rounded-xl border border-slate-200/70 hover:border-indigo-300 hover:shadow-sm bg-white transition-all group flex flex-col justify-between"
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                                                                    {subj.code || 'MOD'}
                                                                </span>
                                                                <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                                                                    Open Cabinet &rarr;
                                                                </span>
                                                            </div>
                                                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                                                                {subj.title}
                                                            </h4>
                                                        </div>

                                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
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
