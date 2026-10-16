import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    BookOpen, 
    Plus, 
    Pin, 
    Search, 
    Trash2, 
    Edit3, 
    Folder, 
    Sparkles, 
    Check, 
    Clock, 
    FileText,
    Bookmark
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

const NOTE_COLORS = [
    { name: 'Nimbuzz Tangerine', value: '#FF5E36', bg: 'bg-[#FF5E36]', border: 'border-[#FF5E36]' },
    { name: 'Rose Blossom', value: '#F43F5E', bg: 'bg-[#F43F5E]', border: 'border-[#F43F5E]' },
    { name: 'Amber Gold', value: '#F59E0B', bg: 'bg-[#F59E0B]', border: 'border-[#F59E0B]' },
    { name: 'Emerald', value: '#10B981', bg: 'bg-[#10B981]', border: 'border-[#10B981]' },
    { name: 'Cyan Sky', value: '#06B6D4', bg: 'bg-[#06B6D4]', border: 'border-[#06B6D4]' },
    { name: 'Royal Violet', value: '#8B5CF6', bg: 'bg-[#8B5CF6]', border: 'border-[#8B5CF6]' },
];

export default function NotesIndex({ notes = [], subjects = [], filters = {} }) {
    const { t } = useTranslation();
    const user = usePage().props.auth.user;
    const isFemale = user?.gender === 'female';

    const defaultColor = isFemale ? '#F43F5E' : '#FF5E36';

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedSubject, setSelectedSubject] = useState(filters.subject_id || 'all');
    const [isEditing, setIsEditing] = useState(false);
    const [activeNote, setActiveNote] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Form for creating / updating notes
    const { data, setData, post, put, processing, reset, errors } = useForm({
        title: '',
        content: '',
        subject_id: '',
        color: defaultColor,
        is_pinned: false,
    });

    const openCreateModal = () => {
        reset();
        setData({
            title: '',
            content: '',
            subject_id: subjects[0]?.id || '',
            color: defaultColor,
            is_pinned: false,
        });
        setIsEditing(false);
        setActiveNote(null);
        setShowModal(true);
    };

    const openEditModal = (note) => {
        setActiveNote(note);
        setIsEditing(true);
        setData({
            title: note.title,
            content: note.content || '',
            subject_id: note.subject_id || '',
            color: note.color || defaultColor,
            is_pinned: !!note.is_pinned,
        });
        setShowModal(true);
    };

    const handleSaveNote = (e) => {
        e.preventDefault();
        if (isEditing && activeNote) {
            put(route('notes.update', activeNote.id), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        } else {
            post(route('notes.store'), {
                onSuccess: () => {
                    setShowModal(false);
                    reset();
                },
            });
        }
    };

    const handleDeleteNote = (noteId) => {
        if (confirm(t('deleteNoteConfirm'))) {
            router.delete(route('notes.destroy', noteId));
        }
    };

    const handleTogglePin = (noteId) => {
        router.patch(route('notes.pin', noteId), {}, {
            preserveScroll: true,
        });
    };

    // Filter notes locally for instantaneous responsiveness
    const filteredNotes = useMemo(() => {
        return notes.filter((n) => {
            const matchesSearch = !searchQuery || 
                n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (n.content && n.content.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesSubject = selectedSubject === 'all' || 
                String(n.subject_id) === String(selectedSubject);
            return matchesSearch && matchesSubject;
        });
    }, [notes, searchQuery, selectedSubject]);

    const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
    const otherNotes = filteredNotes.filter((n) => !n.is_pinned);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {t('studyNotes')}
                            </h2>
                            {isFemale && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 shadow-xs">
                                    <Sparkles className="w-3 h-3 text-rose-500" />
                                    Rose Theme
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('notesSubtitle')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={openCreateModal}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-sm transition-all hover:brightness-105 active:scale-95 ${
                                isFemale
                                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-500/25 ring-2 ring-rose-300 dark:ring-rose-900'
                                    : 'bg-gradient-to-r from-[#FF5E36] to-[#FF416C] shadow-[#FF5E36]/30'
                            }`}
                        >
                            <Plus className="w-4 h-4" />
                            {t('newNote')}
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Dedicated Student Notes" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Filter & Search Bar - Apple Liquid Glass Container */}
                    <div className="liquid-glass rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
                        {/* Search Input */}
                        <div className="relative w-full md:w-96">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('searchNotesPlaceholder')}
                                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-800/60 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                            />
                        </div>

                        {/* Subject Filter Chips */}
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                            <button
                                onClick={() => setSelectedSubject('all')}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                                    selectedSubject === 'all'
                                        ? 'bg-[#FF5E36] text-white border-[#FF5E36] shadow-xs'
                                        : 'bg-white/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                                }`}
                            >
                                {t('allSubjects')}
                            </button>
                            {subjects.map((sub) => (
                                <button
                                    key={sub.id}
                                    onClick={() => setSelectedSubject(String(sub.id))}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                                        selectedSubject === String(sub.id)
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                                            : 'bg-white/80 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300'
                                    }`}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: sub.color || '#FF5E36' }}
                                    />
                                    {sub.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Empty State */}
                    {filteredNotes.length === 0 && (
                        <div className="liquid-glass rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm my-8">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#FF5E36]/10 to-[#FF416C]/10 text-[#FF5E36] flex items-center justify-center mb-4">
                                <FileText className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {t('noNotesYet')}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
                                Save lecture key points, formulas, homework reminders, and study thoughts in one sleek place.
                            </p>
                            <button
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5E36] to-[#FF416C] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105"
                            >
                                <Plus className="w-4 h-4" />
                                {t('newNote')}
                            </button>
                        </div>
                    )}

                    {/* Pinned Notes Section */}
                    {pinnedNotes.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Pin className="w-3.5 h-3.5 text-[#FF5E36] fill-[#FF5E36]" />
                                {t('pinnedNotes')} ({pinnedNotes.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {pinnedNotes.map((note) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onEdit={() => openEditModal(note)}
                                        onDelete={() => handleDeleteNote(note.id)}
                                        onTogglePin={() => handleTogglePin(note.id)}
                                        isFemale={isFemale}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* General Notes Section */}
                    {otherNotes.length > 0 && (
                        <div className="space-y-3 pt-4">
                            {pinnedNotes.length > 0 && (
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                                    {t('generalNotes')} ({otherNotes.length})
                                </h3>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {otherNotes.map((note) => (
                                    <NoteCard
                                        key={note.id}
                                        note={note}
                                        onEdit={() => openEditModal(note)}
                                        onDelete={() => handleDeleteNote(note.id)}
                                        onTogglePin={() => handleTogglePin(note.id)}
                                        isFemale={isFemale}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Note Create / Edit Liquid Glass Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="liquid-glass border border-white/60 dark:border-white/10 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {isEditing ? t('editNote') : t('newNote')}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {t('notesSubtitle')}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveNote} className="mt-5 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    {t('noteTitle')} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Chapter 4 Key Formulas & Mechanisms"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                                />
                            </div>

                            {/* Subject Picker */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Subject / Cabinet
                                </label>
                                <select
                                    value={data.subject_id}
                                    onChange={(e) => setData('subject_id', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                                >
                                    <option value="">General (No specific subject)</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Content & Equations
                                </label>
                                <textarea
                                    rows={6}
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder={t('noteContent')}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36] resize-none"
                                />
                            </div>

                            {/* Note Card Color Selection */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                                    Card Glow Accent Color
                                </label>
                                <div className="flex items-center gap-3">
                                    {NOTE_COLORS.map((col) => (
                                        <button
                                            key={col.value}
                                            type="button"
                                            onClick={() => setData('color', col.value)}
                                            title={col.name}
                                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                                                col.bg
                                            } ${
                                                data.color === col.value
                                                    ? 'ring-4 ring-offset-2 ring-slate-400 dark:ring-offset-slate-900 scale-110 shadow-sm'
                                                    : 'opacity-80 hover:opacity-100 hover:scale-105'
                                            }`}
                                        >
                                            {data.color === col.value && (
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pinned Checkbox */}
                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="is_pinned"
                                    checked={data.is_pinned}
                                    onChange={(e) => setData('is_pinned', e.target.checked)}
                                    className="rounded border-slate-300 text-[#FF5E36] focus:ring-[#FF5E36]"
                                />
                                <label htmlFor="is_pinned" className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none cursor-pointer flex items-center gap-1.5">
                                    <Pin className="w-3.5 h-3.5 text-[#FF5E36]" />
                                    Pin this note to the top of my board
                                </label>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-sm transition-all hover:brightness-105 active:scale-95 disabled:opacity-50 ${
                                        isFemale
                                            ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                                            : 'bg-gradient-to-r from-[#FF5E36] to-[#FF416C]'
                                    }`}
                                >
                                    {processing ? t('savingNote') : t('saveNote')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

// ─── Individual Note Card (Apple Curved Liquid Glass) ───────────────────────────
function NoteCard({ note, onEdit, onDelete, onTogglePin, isFemale }) {
    const cardColor = note.color || (isFemale ? '#F43F5E' : '#FF5E36');

    return (
        <div 
            className="calendar-cell-glass rounded-2xl p-5 flex flex-col justify-between relative group transition-all duration-300 hover:shadow-lg"
            style={{
                borderTop: `3px solid ${cardColor}`
            }}
        >
            <div>
                {/* Header: Subject & Pin */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                    {note.subject ? (
                        <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold"
                            style={{ 
                                backgroundColor: `${note.subject.color || cardColor}18`,
                                color: note.subject.color || cardColor
                            }}
                        >
                            <span 
                                className="w-1.5 h-1.5 rounded-full" 
                                style={{ backgroundColor: note.subject.color || cardColor }} 
                            />
                            {note.subject.title}
                        </span>
                    ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            General Note
                        </span>
                    )}

                    <button
                        onClick={onTogglePin}
                        title={note.is_pinned ? 'Unpin' : 'Pin to top'}
                        className={`p-1.5 rounded-lg transition-colors ${
                            note.is_pinned
                                ? 'text-[#FF5E36] bg-orange-50 dark:bg-orange-950/40'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                    >
                        <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Title */}
                <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">
                    {note.title}
                </h4>

                {/* Content */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-4 whitespace-pre-wrap leading-relaxed font-sans">
                    {note.content || <span className="italic text-slate-400">No content...</span>}
                </p>
            </div>

            {/* Footer with date & quick actions */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(note.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>

                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Note"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Note"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
