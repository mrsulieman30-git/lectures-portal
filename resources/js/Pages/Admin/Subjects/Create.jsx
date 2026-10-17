import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useState } from 'react';

export default function SubjectCreate({ 
    universities = [], 
    preselectedUniversityId = '', 
    preselectedSemesterId = '' 
}) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        code: '',
        description: '',
        guidelines: '',
        university_id: preselectedUniversityId || (universities[0]?.id || ''),
        semester_id: preselectedSemesterId || '',
        color: '#4F46E5',
    });

    const selectedUniversity = universities.find(u => String(u.id) === String(data.university_id));
    const availableSemesters = selectedUniversity?.semesters || [];

    const handleUniversityChange = (uniId) => {
        setData(prev => ({
            ...prev,
            university_id: uniId,
            semester_id: universities.find(u => String(u.id) === String(uniId))?.semesters?.[0]?.id || ''
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.subjects.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('admin.subjects.index')}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Create Subject Cabinet
                        </h2>
                        <p className="text-sm text-slate-500">
                            Create a course folder to host lectures, textbooks, guidelines, and assignments.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Create Subject Cabinet" />

            <div className="py-8">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Partner University *
                                    </label>
                                    <select
                                        required
                                        value={data.university_id}
                                        onChange={(e) => handleUniversityChange(e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                    >
                                        <option value="">Select University</option>
                                        {universities.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                    {errors.university_id && <p className="text-xs text-rose-600 mt-1">{errors.university_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Semester / Term *
                                    </label>
                                    <select
                                        required
                                        value={data.semester_id}
                                        onChange={(e) => setData('semester_id', e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                    >
                                        <option value="">Select Semester</option>
                                        {availableSemesters.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                    {errors.semester_id && <p className="text-xs text-rose-600 mt-1">{errors.semester_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Subject Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Advanced Operating Systems"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                    />
                                    {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Course Code
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. CS401"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl font-mono focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                    />
                                    {errors.code && <p className="text-xs text-rose-600 mt-1">{errors.code}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    Course Description & Syllabus Summary
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Overview of topics, lecture roadmap, objectives..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    Course Guidelines & Student Instructions (Markdown supported)
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Attendance policy, grading breakdown, exam rules, lab environment instructions..."
                                    value={data.guidelines}
                                    onChange={(e) => setData('guidelines', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36] font-mono text-xs"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
                                <Link
                                    href={route('admin.subjects.index')}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-semibold"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-sm font-bold shadow-md shadow-[#ff5e36]/25 transition-all disabled:opacity-50"
                                >
                                    Create Subject
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
