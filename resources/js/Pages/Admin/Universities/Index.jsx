import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Building2, 
    BookOpen, 
    Users, 
    ExternalLink, 
    Plus, 
    ChevronRight, 
    MoreVertical, 
    MapPin, 
    Mail 
} from 'lucide-react';

export default function UniversitiesIndex({ universities = [] }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id, name) => {
        if (confirm(`Are you sure you want to delete ${name}? All associated courses and materials will be affected.`)) {
            destroy(route('admin.universities.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Partner Universities
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Campuses, faculties, academic terms, and departmental courses.
                        </p>
                    </div>
                    <Link
                        href={route('admin.universities.create')}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/20 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add New University
                    </Link>
                </div>
            }
        >
            <Head title="Universities" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {universities.length === 0 ? (
                        <div className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 p-12 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center mx-auto mb-3">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Universities Yet</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">Add the universities or colleges where you lecture.</p>
                            <Link
                                href={route('admin.universities.create')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-sm"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add First University
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {universities.map((uni) => (
                                <div
                                    key={uni.id}
                                    className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:border-[#ff5e36]/40 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center font-bold text-lg border border-[#ff5e36]/20 group-hover:scale-105 transition-transform">
                                                {uni.name.charAt(0)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.universities.edit', uni.id)}
                                                    className="px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </Link>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                                            {uni.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                            {uni.description || 'No description provided for this campus.'}
                                        </p>

                                        {uni.address && (
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
                                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{uni.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-slate-50/80 dark:bg-black/30 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                                                <BookOpen className="w-3.5 h-3.5 text-[#ff5e36]" />
                                                <span>{uni.subjects_count || 0} Subjects</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                                                <Users className="w-3.5 h-3.5 text-emerald-500" />
                                                <span>{uni.students_count || 0} Students</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={route('admin.universities.show', uni.id)}
                                            className="inline-flex items-center gap-1 font-bold text-[#ff5e36] hover:text-[#e04822] hover:translate-x-0.5 transition-all"
                                        >
                                            Manage Cabinet &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
