import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    MapPin, 
    Plus, 
    Bell, 
    Trash2, 
    ChevronLeft, 
    ChevronRight,
    BookOpen,
    Sparkles,
    CalendarDays,
    GraduationCap,
    CheckCircle2,
    Info,
    Layers,
    UserCheck,
    UploadCloud,
    SlidersHorizontal,
    Eye,
    Settings
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

export default function ScheduleIndex({ 
    events = [], 
    upcomingLectures = [], 
    subjects = [], 
    pendingDocuments = [],
    reminders = [], 
    isAdmin = false 
}) {
    const { t } = useTranslation();
    const user = usePage().props.auth.user;
    const isFemale = user?.gender === 'female';

    // Calendar navigation state: current displayed month/year
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selectedDate, setSelectedDate] = useState(today);
    const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');

    // Calendar Settings (persisted in localStorage)
    const [calendarSettings, setCalendarSettings] = useState(() => {
        try {
            const saved = localStorage.getItem('lecture_portal_calendar_settings');
            return saved ? JSON.parse(saved) : {
                defaultDurationMins: 90,
                defaultLocation: 'Main Lecture Hall',
                hidePastEvents: false,
                defaultView: 'month'
            };
        } catch (e) {
            return {
                defaultDurationMins: 90,
                defaultLocation: 'Main Lecture Hall',
                hidePastEvents: false,
                defaultView: 'month'
            };
        }
    });

    // Modals
    const [showLectureModal, setShowLectureModal] = useState(false);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const updateCalendarSettings = (newSettings) => {
        const merged = { ...calendarSettings, ...newSettings };
        setCalendarSettings(merged);
        try {
            localStorage.setItem('lecture_portal_calendar_settings', JSON.stringify(merged));
        } catch (e) {}
    };

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Lecture Schedule Form (Admin)
    const { data: lecData, setData: setLecData, post: postLec, processing: lecProcessing, reset: resetLec } = useForm({
        subject_id: subjects[0]?.id || '',
        document_id: '',
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        color: '#FF5E36',
    });

    // Reminder Form (Student & Admin)
    const { data: remData, setData: setRemData, post: postRem, processing: remProcessing, reset: resetRem } = useForm({
        title: '',
        description: '',
        remind_at: '',
        type: 'lecture',
    });

    const { delete: destroyRem } = useForm();
    const { delete: destroyLec } = useForm();

    // ─── Month Navigation ──────────────────────────────────────────
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const goToToday = () => {
        const now = new Date();
        setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
        setSelectedDate(now);
    };

    // ─── Calendar Grid Computation ─────────────────────────────────
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Starting day of the week (0 = Sun, 1 = Mon...)
    const firstDayIndex = new Date(year, month, 1).getDay();

    // Days from previous month to fill the first row
    const prevMonthDays = new Date(year, month, 0).getDate();

    const calendarCells = useMemo(() => {
        const cells = [];

        // Previous month padding
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonthDays - i);
            cells.push({ date, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            cells.push({ date, isCurrentMonth: true });
        }

        // Next month padding to complete 35 or 42 grid cells
        const remaining = (7 - (cells.length % 7)) % 7;
        for (let i = 1; i <= remaining; i++) {
            const date = new Date(year, month + 1, i);
            cells.push({ date, isCurrentMonth: false });
        }

        return cells;
    }, [year, month, daysInMonth, firstDayIndex, prevMonthDays]);

    // Format date key: YYYY-MM-DD
    const formatDateKey = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // Map events by date
    const eventsByDate = useMemo(() => {
        const map = {};
        events.forEach((evt) => {
            if (selectedSubjectFilter !== 'all' && String(evt.extendedProps?.subject_id) !== String(selectedSubjectFilter)) {
                return;
            }
            const dateKey = evt.start ? evt.start.substring(0, 10) : '';
            if (!map[dateKey]) map[dateKey] = [];
            map[dateKey].push(evt);
        });
        return map;
    }, [events, selectedSubjectFilter]);

    // Selected day's events
    const selectedDateKey = formatDateKey(selectedDate);
    const dayEvents = eventsByDate[selectedDateKey] || [];

    // Helper checks
    const isSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    const handleCreateLecture = (e) => {
        e.preventDefault();
        postLec(route('admin.schedule.store'), {
            onSuccess: () => {
                setShowLectureModal(false);
                resetLec();
            }
        });
    };

    const handleCreateReminder = (e) => {
        e.preventDefault();
        postRem(route('reminders.store'), {
            onSuccess: () => {
                setShowReminderModal(false);
                resetRem();
            }
        });
    };

    const handleDeleteReminder = (id) => {
        destroyRem(route('reminders.destroy', id));
    };

    const handleDeleteLecture = (id) => {
        if (confirm('Are you sure you want to cancel and remove this lecture?')) {
            destroyLec(route('admin.schedule.destroy', id));
        }
    };

    const openLectureModalForDate = (date) => {
        const dateStr = formatDateKey(date);
        const duration = calendarSettings.defaultDurationMins || 90;
        const startDate = new Date(date);
        startDate.setHours(9, 0, 0, 0);
        const endDate = new Date(startDate.getTime() + duration * 60000);

        const formatIsoInput = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const h = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            return `${y}-${m}-${day}T${h}:${min}`;
        };

        setLecData({
            subject_id: subjects[0]?.id || '',
            document_id: '',
            title: '',
            description: '',
            start_time: formatIsoInput(startDate),
            end_time: formatIsoInput(endDate),
            location: calendarSettings.defaultLocation || '',
            color: '#FF5E36',
        });
        setShowLectureModal(true);
    };

    const handleSelectPendingDocument = (docId) => {
        const chosenDoc = pendingDocuments.find(d => String(d.id) === String(docId));
        setLecData(prev => ({
            ...prev,
            document_id: docId,
            title: (!prev.title || prev.title.trim() === '') && chosenDoc ? chosenDoc.title : prev.title,
            description: (!prev.description || prev.description.trim() === '') && chosenDoc ? `Discussion and materials for ${chosenDoc.title}` : prev.description,
        }));
    };

    const handleStartTimeChange = (newStartTime) => {
        if (!newStartTime) {
            setLecData('start_time', newStartTime);
            return;
        }
        const start = new Date(newStartTime);
        const duration = calendarSettings.defaultDurationMins || 90;
        const end = new Date(start.getTime() + duration * 60000);
        const y = end.getFullYear();
        const m = String(end.getMonth() + 1).padStart(2, '0');
        const day = String(end.getDate()).padStart(2, '0');
        const h = String(end.getHours()).padStart(2, '0');
        const min = String(end.getMinutes()).padStart(2, '0');
        const endIso = `${y}-${m}-${day}T${h}:${min}`;

        setLecData(prev => ({
            ...prev,
            start_time: newStartTime,
            end_time: endIso
        }));
    };

    const openReminderModalForDate = (date) => {
        const dateStr = formatDateKey(date);
        setRemData({
            title: '',
            description: '',
            remind_at: `${dateStr}T08:00`,
            type: 'lecture',
        });
        setShowReminderModal(true);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {t('academicCalendarSchedule')}
                            </h2>
                            {isFemale && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 shadow-xs">
                                    <Sparkles className="w-3 h-3 text-rose-500" />
                                    Rose Theme
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {t('calendarSubtitle', 'Interactive schedule and upcoming sessions with the professor.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition-all"
                            title="Calendar Settings"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Settings</span>
                        </button>
                        <button
                            onClick={() => openReminderModalForDate(selectedDate)}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-xs transition-all"
                        >
                            <Bell className="w-3.5 h-3.5 text-amber-500" />
                            {t('setReminder')}
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => openLectureModalForDate(selectedDate)}
                                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:brightness-105 active:scale-95 ${
                                    isFemale
                                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-rose-500/25 ring-2 ring-rose-300 dark:ring-rose-900'
                                        : 'bg-gradient-to-r from-[#FF5E36] to-[#FF416C] shadow-[#FF5E36]/30'
                                }`}
                            >
                                <Plus className="w-4 h-4" />
                                {t('scheduleLecture')}
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Interactive Academic Calendar & Schedule" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* Controls Bar: Month Picker & Subject Filter */}
                    <div className="liquid-glass rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
                        {/* Month navigation */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-white/80 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-white/10 p-1 shadow-xs">
                                <button
                                    onClick={prevMonth}
                                    title="Previous Month"
                                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 text-sm font-bold text-slate-900 dark:text-white min-w-36 text-center">
                                    {monthName}
                                </span>
                                <button
                                    onClick={nextMonth}
                                    title="Next Month"
                                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#FF5E36] bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors"
                            >
                                Today
                            </button>
                        </div>

                        {/* Subject Filter */}
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                Filter:
                            </label>
                            <select
                                value={selectedSubjectFilter}
                                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                                className="w-full md:w-64 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-800/80 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                            >
                                <option value="all">All Cabinets / Subjects</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ─── 3 Liquid Glass Calendar Cells Grid ─────────────────── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* ─── CELL 1: Interactive Monthly Calendar Grid (Span 7) ──── */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="liquid-glass rounded-3xl p-5 sm:p-6 shadow-sm border border-white/70 dark:border-white/10 relative overflow-hidden">
                                
                                {/* Day of Week Headers */}
                                <div className="grid grid-cols-7 gap-2 mb-3 text-center">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                                        <div 
                                            key={day} 
                                            className={`text-[11px] font-bold uppercase tracking-wider py-1 ${
                                                idx === 0 || idx === 6
                                                    ? 'text-[#FF5E36]'
                                                    : 'text-slate-400 dark:text-slate-500'
                                            }`}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Day Cells */}
                                <div className="grid grid-cols-7 gap-2">
                                    {calendarCells.map((cell, index) => {
                                        const dateKey = formatDateKey(cell.date);
                                        const cellEvents = eventsByDate[dateKey] || [];
                                        const isSelected = isSameDay(cell.date, selectedDate);
                                        const isCurrentDay = isSameDay(cell.date, today);

                                        return (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setSelectedDate(cell.date)}
                                                className={`calendar-cell-glass min-h-20 sm:min-h-24 p-2 rounded-2xl flex flex-col justify-between text-left transition-all relative ${
                                                    !cell.isCurrentMonth
                                                        ? 'opacity-35 hover:opacity-60'
                                                        : ''
                                                } ${
                                                    isSelected
                                                        ? isFemale
                                                            ? 'ring-2 ring-rose-500 bg-rose-50/80 dark:bg-rose-950/40 shadow-rose-500/20'
                                                            : 'ring-2 ring-[#FF5E36] bg-orange-50/80 dark:bg-orange-950/40 shadow-[#FF5E36]/20'
                                                        : ''
                                                }`}
                                            >
                                                {/* Date Number & Today Indicator */}
                                                <div className="flex items-center justify-between w-full">
                                                    <span className={`text-xs font-bold leading-none ${
                                                        isCurrentDay
                                                            ? 'w-5 h-5 rounded-full bg-[#FF5E36] text-white flex items-center justify-center text-[10px]'
                                                            : isSelected
                                                            ? 'text-[#FF5E36] dark:text-[#ff7a54] font-black'
                                                            : 'text-slate-800 dark:text-slate-200'
                                                    }`}>
                                                        {cell.date.getDate()}
                                                    </span>

                                                    {cellEvents.length > 0 && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E36] animate-pulse" />
                                                    )}
                                                </div>

                                                {/* Scheduled Lectures Chips */}
                                                <div className="w-full space-y-1 mt-1 overflow-hidden">
                                                    {cellEvents.slice(0, 2).map((evt) => (
                                                        <div
                                                            key={evt.id}
                                                            title={`${evt.title} (${new Date(evt.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
                                                            className="text-[10px] font-semibold truncate px-1.5 py-0.5 rounded-md text-white shadow-xs"
                                                            style={{
                                                                backgroundColor: evt.color || '#FF5E36'
                                                            }}
                                                        >
                                                            {evt.title}
                                                        </div>
                                                    ))}
                                                    {cellEvents.length > 2 && (
                                                        <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 block text-right">
                                                            +{cellEvents.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Calendar Legend */}
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E36]" />
                                            Active Schedule
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-4 h-4 rounded-full bg-[#FF5E36] text-white text-[9px] font-bold flex items-center justify-center">
                                                •
                                            </span>
                                            Today
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-mono">
                                        Click any date to inspect details
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* ─── CELL 2 & CELL 3: Right Column Split Panels (Span 5) ── */}
                        <div className="lg:col-span-5 space-y-6">

                            {/* ─── CELL 2: Day Schedule Inspector ────────────────────── */}
                            <div className="liquid-glass rounded-3xl p-6 shadow-sm border border-white/70 dark:border-white/10">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF5E36] font-mono">
                                            {t('dayScheduleInspector')}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                            {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </h3>
                                    </div>

                                    {isAdmin && (
                                        <button
                                            onClick={() => openLectureModalForDate(selectedDate)}
                                            className="p-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#FF5E36] hover:bg-orange-100 dark:hover:bg-orange-900/60 transition-colors text-xs font-bold flex items-center gap-1"
                                            title="Schedule lecture on this date"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add
                                        </button>
                                    )}
                                </div>

                                {/* Sessions Timeline */}
                                <div className="mt-4 space-y-3">
                                    {dayEvents.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-2">
                                                <CalendarDays className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs text-slate-400 dark:text-slate-500">
                                                {t('noLecturesOnDay')}
                                            </p>
                                            {isAdmin ? (
                                                <button
                                                    onClick={() => openLectureModalForDate(selectedDate)}
                                                    className="mt-3 text-xs font-bold text-[#FF5E36] hover:underline"
                                                >
                                                    + {t('scheduleNewSession')}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => openReminderModalForDate(selectedDate)}
                                                    className="mt-3 text-xs font-bold text-amber-600 hover:underline"
                                                >
                                                    + Set personal study reminder
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        dayEvents.map((evt) => {
                                            const start = new Date(evt.start);
                                            const end = new Date(evt.end);
                                            const durationMins = Math.round((end - start) / 60000);

                                            return (
                                                <div
                                                    key={evt.id}
                                                    className="p-4 rounded-2xl border border-slate-100 dark:border-white/5 bg-white/60 dark:bg-slate-800/50 shadow-xs relative overflow-hidden"
                                                    style={{ borderLeft: `4px solid ${evt.color || '#FF5E36'}` }}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span
                                                                    className="w-2 h-2 rounded-full shrink-0"
                                                                    style={{ backgroundColor: evt.color || '#FF5E36' }}
                                                                />
                                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                                                    {evt.title}
                                                                </h4>
                                                            </div>
                                                            {evt.extendedProps?.subject_title && (
                                                                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 block">
                                                                    {evt.extendedProps.subject_title}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {isAdmin && (
                                                            <button
                                                                onClick={() => handleDeleteLecture(evt.id)}
                                                                className="text-slate-400 hover:text-rose-600 p-1"
                                                                title="Cancel Lecture"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {evt.extendedProps?.description && (
                                                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-900/40 p-2 rounded-xl">
                                                            {evt.extendedProps.description}
                                                        </p>
                                                    )}

                                                    {evt.extendedProps?.document && (
                                                        <div className="mt-2.5 p-2.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <UploadCloud className="w-4 h-4 text-[#ff5e36] shrink-0" />
                                                                <div className="min-w-0">
                                                                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate block">
                                                                        {evt.extendedProps.document.title || evt.extendedProps.document.file_name}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                                                        Class Material • {evt.extendedProps.document.file_type?.toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Link
                                                                href={route('documents.view', evt.extendedProps.document.id)}
                                                                className="px-2.5 py-1 rounded-lg bg-[#ff5e36] hover:bg-[#e04822] text-white text-[11px] font-bold shrink-0 shadow-xs flex items-center gap-1 transition-all"
                                                            >
                                                                <Eye className="w-3 h-3" />
                                                                <span>Open</span>
                                                            </Link>
                                                        </div>
                                                    )}

                                                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                                                            <Clock className="w-3.5 h-3.5 text-[#FF5E36]" />
                                                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            <span className="text-[10px] text-slate-400 font-normal">({durationMins} {t('mins')})</span>
                                                        </span>

                                                        {evt.extendedProps?.location && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                                {evt.extendedProps.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* ─── CELL 3: Upcoming Lectures with Professor & Study Reminders ── */}
                            <div className="liquid-glass rounded-3xl p-6 shadow-sm border border-white/70 dark:border-white/10">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 font-mono">
                                            {t('upcomingWithProfessor')}
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                                            Upcoming Professor Sessions ({upcomingLectures.length})
                                        </h3>
                                    </div>
                                    <GraduationCap className="w-5 h-5 text-[#FF5E36]" />
                                </div>

                                <div className="mt-4 space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                    {upcomingLectures.length === 0 ? (
                                        <div className="text-center py-6 text-xs text-slate-400">
                                            No upcoming lectures in the immediate pipeline.
                                        </div>
                                    ) : (
                                        upcomingLectures.map((lec) => {
                                            const start = new Date(lec.start_time);
                                            return (
                                                <div 
                                                    key={lec.id}
                                                    onClick={() => {
                                                        setSelectedDate(start);
                                                        setCurrentDate(new Date(start.getFullYear(), start.getMonth(), 1));
                                                    }}
                                                    className="p-3 rounded-2xl border border-slate-100 dark:border-white/5 bg-white/70 dark:bg-slate-800/60 hover:border-[#FF5E36]/40 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                                                >
                                                    <div className="space-y-0.5">
                                                        <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#FF5E36] transition-colors">
                                                            {lec.title}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                                            <span>{lec.subject?.title}</span>
                                                            {lec.location && <span>• {lec.location}</span>}
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="text-[11px] font-bold text-[#FF5E36]">
                                                            {start.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                            {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Active Personal Reminders Drawer */}
                                {reminders.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            <span className="flex items-center gap-1">
                                                <Bell className="w-3.5 h-3.5 text-amber-500" />
                                                Active Reminders ({reminders.length})
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {reminders.slice(0, 3).map((rem) => (
                                                <div key={rem.id} className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-2 text-xs">
                                                    <div>
                                                        <div className="font-semibold text-amber-950 dark:text-amber-200 text-xs">
                                                            {rem.title}
                                                        </div>
                                                        <div className="text-[10px] text-amber-700 dark:text-amber-400">
                                                            {new Date(rem.remind_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteReminder(rem.id)}
                                                        className="text-slate-400 hover:text-rose-600 p-1"
                                                        title="Dismiss"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>

                </div>
            </div>

            {/* ─── Schedule Lecture Modal (Admin) ────────────────────────── */}
            {showLectureModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="liquid-glass border border-white/60 dark:border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('scheduleLecture')}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Schedule a course session for enrolled students.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowLectureModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateLecture} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Subject / Cabinet *
                                </label>
                                <select
                                    required
                                    value={lecData.subject_id}
                                    onChange={(e) => setLecData('subject_id', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                                >
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.title} ({s.university?.name || 'Cabinet'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Attach Staged Document from Pending Cabinet */}
                            {isAdmin && pendingDocuments.length > 0 && (
                                <div className="p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/80 dark:border-orange-900/50 space-y-2">
                                    <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#ff5e36] dark:text-[#ff7a54]">
                                        <span className="flex items-center gap-1.5">
                                            <UploadCloud className="w-4 h-4" />
                                            Attach from Pending Cabinet
                                        </span>
                                        <span className="text-[10px] font-mono lowercase font-normal bg-orange-100 dark:bg-orange-900/60 px-2 py-0.5 rounded-full">
                                            {pendingDocuments.length} files staged
                                        </span>
                                    </label>
                                    <select
                                        value={lecData.document_id}
                                        onChange={(e) => handleSelectPendingDocument(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-orange-200 dark:border-orange-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#ff5e36]"
                                    >
                                        <option value="">-- None (Lecture Without Staged File) --</option>
                                        {pendingDocuments.map((doc) => (
                                            <option key={doc.id} value={doc.id}>
                                                📄 {doc.title} ({doc.file_name}) - {formatBytes(doc.file_size)}
                                            </option>
                                        ))}
                                    </select>
                                    {lecData.document_id && (
                                        <p className="text-[11px] text-orange-900 dark:text-orange-200 leading-relaxed font-medium">
                                            💡 <strong>Scheduled Release Active:</strong> This document will be automatically assigned to the chosen class and unlocked for students on this exact session date at the scheduled start time!
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Lecture Topic / Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={lecData.title}
                                    onChange={(e) => setLecData('title', e.target.value)}
                                    placeholder="e.g. System Pharmacology: Antibiotic Mechanisms"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        Start Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={lecData.start_time}
                                        onChange={(e) => handleStartTimeChange(e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                        End Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={lecData.end_time}
                                        onChange={(e) => setLecData('end_time', e.target.value)}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Location / Room / Hall
                                </label>
                                <input
                                    type="text"
                                    value={lecData.location}
                                    onChange={(e) => setLecData('location', e.target.value)}
                                    placeholder="e.g. Hall 3B or Zoom Lab Link"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Description / Session Agenda
                                </label>
                                <textarea
                                    rows={3}
                                    value={lecData.description}
                                    onChange={(e) => setLecData('description', e.target.value)}
                                    placeholder="Optional preparation instructions for students..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36] resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowLectureModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={lecProcessing}
                                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#FF5E36] to-[#FF416C] shadow-sm hover:brightness-105 active:scale-95 disabled:opacity-50"
                                >
                                    {lecProcessing ? 'Scheduling...' : 'Save Lecture'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Set Reminder Modal (Student & Admin) ───────────────────── */}
            {showReminderModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="liquid-glass border border-white/60 dark:border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    {t('setReminder')}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Personal reminder for upcoming tasks, revisions or lectures.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowReminderModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateReminder} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Reminder Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={remData.title}
                                    onChange={(e) => setRemData('title', e.target.value)}
                                    placeholder="e.g. Review slides before afternoon quiz"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Remind Date & Time *
                                </label>
                                <input
                                    type="datetime-local"
                                    required
                                    value={remData.remind_at}
                                    onChange={(e) => setRemData('remind_at', e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                                    Notes / Details
                                </label>
                                <textarea
                                    rows={3}
                                    value={remData.description}
                                    onChange={(e) => setRemData('description', e.target.value)}
                                    placeholder="Optional notes..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF5E36] resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowReminderModal(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={remProcessing}
                                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition-all"
                                >
                                    {remProcessing ? 'Saving...' : 'Set Reminder'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Calendar Settings Modal ───────────────────────────────── */}
            {showSettingsModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="liquid-glass border border-white/60 dark:border-white/10 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                                    <SlidersHorizontal className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Calendar &amp; Schedule Settings
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Customize default session timings and preferences.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSettingsModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mt-5 space-y-4 text-xs">
                            {/* Default Lecture Duration */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Default Session Duration
                                </label>
                                <select
                                    value={calendarSettings.defaultDurationMins || 90}
                                    onChange={(e) => updateCalendarSettings({ defaultDurationMins: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 dark:text-white"
                                >
                                    <option value={45}>45 Minutes (Express / Quiz)</option>
                                    <option value={60}>60 Minutes (1 Hour Lecture)</option>
                                    <option value={90}>90 Minutes (Standard Academic Block)</option>
                                    <option value={120}>120 Minutes (2 Hour Seminar)</option>
                                    <option value={180}>180 Minutes (3 Hour Lab / Practical)</option>
                                </select>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    When you select any date on the calendar, the end time automatically defaults to this duration.
                                </p>
                            </div>

                            {/* Default Location */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    Default Location / Hall
                                </label>
                                <input
                                    type="text"
                                    value={calendarSettings.defaultLocation || ''}
                                    onChange={(e) => updateCalendarSettings({ defaultLocation: e.target.value })}
                                    placeholder="e.g. Main Lecture Hall"
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Hide Past Lectures */}
                            <div className="pt-2">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={Boolean(calendarSettings.hidePastEvents)}
                                        onChange={(e) => updateCalendarSettings({ hidePastEvents: e.target.checked })}
                                        className="w-4 h-4 rounded text-[#ff5e36] focus:ring-[#ff5e36]"
                                    />
                                    <div>
                                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                                            Dim Past Sessions
                                        </span>
                                        <span className="text-[11px] text-slate-400 block">
                                            Focus primarily on today and future upcoming lectures.
                                        </span>
                                    </div>
                                </label>
                            </div>

                            <div className="flex items-center justify-end pt-4 border-t border-slate-200/80 dark:border-white/10">
                                <button
                                    type="button"
                                    onClick={() => setShowSettingsModal(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-[#ff5e36] to-[#ff416c] hover:brightness-105 active:scale-95 shadow-sm"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </AuthenticatedLayout>
    );
}
