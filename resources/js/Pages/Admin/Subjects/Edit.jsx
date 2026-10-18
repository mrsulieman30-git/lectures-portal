import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Trash2, ArrowRightLeft, Share2 } from 'lucide-react';
import { useState } from 'react';

export default function SubjectEdit({ subject = {}, universities = [] }) {
    const { data, setData, put, processing, errors } = useForm({
        title: subject.title || '',
        code: subject.code || '',
        description: subject.description || '',
        guidelines: subject.guidelines || '',
        university_id: subject.university_id || '',
        semester_id: subject.semester_id || '',
        color: subject.color || '#ff5e36',
        is_active: Boolean(subject.is_active),
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
        put(route('admin.subjects.update', subject.id));
    };

    const handleDelete = () => {
        if (confirm(`Move '${subject.title}' to the Recycle Bin? All lecture files and assignments will be preserved and can be restored anytime.`)) {
            router.delete(route('admin.subjects.destroy', subject.id));
        }
    };

    const colorPalette = [
        '#ff5e36', '#4F46E5', '#0284C7', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777'
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('admin.subjects.show', subject.id)}
                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span 
                                    className="px-2.5 py-0.5 rounded text-xs font-mono font-bold"
                                    style={{ backgroundColor: `${data.color}20`, color: data.color }}
                                >
                                    {data.code || 'COURSE'}
                                </span>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Edit Course Cabinet
                                </h2>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Modify course title, syllabus guidelines, and campus assignment.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Cabinet (Recycle Bin)
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${subject.title}`} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-[#0c1017] rounded-3xl border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Campus and Term Selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/60 dark:border-white/5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Partner University
                                    </label>
                                    <select
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
                                        Semester / Term
                                    </label>
                                    <select
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

                            {/* Title & Code */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                        Subject Title *
                                    </label>
                                    <input
                                        type="text"
                                        required
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
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl font-mono focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                    />
                                    {errors.code && <p className="text-xs text-rose-600 mt-1">{errors.code}</p>}
                                </div>
                            </div>

                            {/* Theme Color Picker */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    Cabinet Theme Accent
                                </label>
                                <div className="flex items-center gap-3">
                                    {colorPalette.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setData('color', color)}
                                            className={`w-8 h-8 rounded-full transition-transform ${data.color === color ? 'scale-125 ring-2 ring-offset-2 ring-[#ff5e36]' : 'hover:scale-110'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        value={data.color}
                                        onChange={(e) => setData('color', e.target.value)}
                                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                                        title="Custom Color"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    Course Description & Syllabus Summary
                                </label>
                                <textarea
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                />
                            </div>

                            {/* Guidelines */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    Course Guidelines & Student Instructions
                                </label>
                                <textarea
                                    rows={5}
                                    value={data.guidelines}
                                    onChange={(e) => setData('guidelines', e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36] font-mono text-xs"
                                />
                            </div>

                            {/* Active Status */}
                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-slate-300 text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 dark:text-white block">
                                            Cabinet is Active & Published
                                        </span>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                            When inactive, enrolled students cannot see or download new materials from this cabinet.
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                <Link
                                    href={route('admin.subjects.show', subject.id)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-slate-900 text-sm font-semibold"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-sm font-bold shadow-md shadow-[#ff5e36]/25 transition-all disabled:opacity-50"
                                >
                                    {processing ? 'Saving Changes...' : 'Save Subject Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
