import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    BookOpen, 
    FileText, 
    GraduationCap, 
    Users, 
    Plus, 
    Building2, 
    ArrowUpRight,
    Search
} from 'lucide-react';
import { useState } from 'react';

export default function SubjectsIndex({ subjects = { data: [] }, universities = [], filters = {} }) {
    const [universityId, setUniversityId] = useState(filters.university_id || '');

    const handleFilter = (uniId) => {
        setUniversityId(uniId);
        router.get(
            route('admin.subjects.index'),
            { university_id: uniId || undefined },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-display">
                            Course &amp; Lecture Cabinets
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Individual subject cabinets containing lectures, assignments, and student files.
                        </p>
                    </div>
                    <Link
                        href={route('admin.subjects.create')}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-sm shadow-[#ff5e36]/25 transition-all hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        New Subject Cabinet
                    </Link>
                </div>
            }
        >
            <Head title="Course Cabinets" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* University Filter Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        <button
                            onClick={() => handleFilter('')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                !universityId 
                                    ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/25' 
                                    : 'bg-white dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/90 dark:border-white/10'
                            }`}
                        >
                            All Universities
                        </button>
                        {universities.map((uni) => (
                            <button
                                key={uni.id}
                                onClick={() => handleFilter(uni.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    String(universityId) === String(uni.id)
                                        ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/25'
                                        : 'bg-white dark:bg-[#0d1117] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200/90 dark:border-white/10'
                                }`}
                            >
                                {uni.name}
                            </button>
                        ))}
                    </div>

                    {/* Subjects Grid */}
                    {subjects.data.length === 0 ? (
                        <div className="bg-white dark:bg-[#090c10] rounded-2xl border border-slate-200/90 dark:border-white/10 p-12 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center mx-auto mb-3">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Course Cabinets Found</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Create your first subject cabinet to start uploading lectures and textbooks.</p>
                            <Link
                                href={route('admin.subjects.create')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-sm shadow-[#ff5e36]/25"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Create Subject Cabinet
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subjects.data.map((subj) => (
                                <Link
                                    key={subj.id}
                                    href={route('admin.subjects.show', subj.id)}
                                    className="bg-white dark:bg-[#090c10] rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md hover:border-[#ff5e36]/50 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <span 
                                                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider"
                                                style={{ backgroundColor: `${subj.color || '#ff5e36'}15`, color: subj.color || '#ff5e36' }}
                                            >
                                                {subj.code || 'COURSE'}
                                            </span>
                                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-[#ff5e36] transition-colors" />
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#ff5e36] transition-colors line-clamp-2">
                                            {subj.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{subj.university?.name}</span>
                                            {subj.semester && (
                                                <>
                                                    <span>•</span>
                                                    <span>{subj.semester.name}</span>
                                                </>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                                            {subj.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-50/70 dark:bg-[#0d1117] border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                <FileText className="w-3.5 h-3.5 text-[#ff5e36]" />
                                                {subj.documents_count || 0} Files
                                            </span>
                                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                                                {subj.assignments_count || 0} Tasks
                                            </span>
                                        </div>
                                        <span className="font-bold text-[#ff5e36] group-hover:underline">
                                            Open Cabinet &rarr;
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
