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
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Course & Lecture Cabinets
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Individual subject cabinets containing lectures, assignments, and student files.
                        </p>
                    </div>
                    <Link
                        href={route('admin.subjects.create')}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all shadow-indigo-600/20"
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
                            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                !universityId 
                                    ? 'bg-slate-900 text-white shadow-sm' 
                                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            All Universities
                        </button>
                        {universities.map((uni) => (
                            <button
                                key={uni.id}
                                onClick={() => handleFilter(uni.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                                    String(universityId) === String(uni.id)
                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                                }`}
                            >
                                {uni.name}
                            </button>
                        ))}
                    </div>

                    {/* Subjects Grid */}
                    {subjects.data.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">No Course Cabinets Found</h3>
                            <p className="text-xs text-slate-500 mt-1 mb-4">Create your first subject cabinet to start uploading lectures and textbooks.</p>
                            <Link
                                href={route('admin.subjects.create')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
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
                                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <span 
                                                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wider"
                                                style={{ backgroundColor: `${subj.color || '#4F46E5'}15`, color: subj.color || '#4F46E5' }}
                                            >
                                                {subj.code || 'COURSE'}
                                            </span>
                                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                            {subj.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 font-medium">
                                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{subj.university?.name}</span>
                                            {subj.semester && (
                                                <>
                                                    <span>•</span>
                                                    <span>{subj.semester.name}</span>
                                                </>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                                            {subj.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                                                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                                {subj.documents_count || 0} Files
                                            </span>
                                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                                                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                                                {subj.assignments_count || 0} Tasks
                                            </span>
                                        </div>
                                        <span className="font-semibold text-indigo-600 group-hover:underline">
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
