import React, { useState, useEffect, useRef } from 'react';
import { 
    MessageSquare, 
    X, 
    Send, 
    Image as ImageIcon, 
    RefreshCw, 
    User, 
    GraduationCap, 
    ExternalLink, 
    Camera, 
    Sparkles, 
    Users, 
    Check, 
    CheckCheck,
    ChevronDown,
    Building2,
    Shield,
    Search,
    Filter,
    Layers
} from 'lucide-react';

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [showContactPicker, setShowContactPicker] = useState(false);
    const [channels, setChannels] = useState({ 
        professor: null, 
        subjects: [], 
        classmates: [], 
        universities: [], 
        semesters: [], 
        unread_counts: {} 
    });
    const [activeChannel, setActiveChannel] = useState(null); // { type: 'direct'|'subject', targetId, title, subtitle, color, isProfessor }
    
    // Quick Search & Filter States
    const [selectedUniId, setSelectedUniId] = useState('all');
    const [selectedSemester, setSelectedSemester] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [pickerTab, setPickerTab] = useState('all'); // 'all', 'classes', 'students'

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [unreadTotal, setUnreadTotal] = useState(0);
    const [previewImageModal, setPreviewImageModal] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 1. Fetch channels on mount & calculate unread
    const fetchChannels = async () => {
        try {
            const res = await fetch('/chat/channels');
            if (!res.ok) return;
            const data = await res.json();
            setChannels(data);

            // Calculate total unread count
            const counts = Object.values(data.unread_counts || {});
            const sum = counts.reduce((acc, c) => acc + parseInt(c || 0), 0);
            setUnreadTotal(sum);

            // Default to Professor if not set yet, or first subject
            if (!activeChannel) {
                if (data.professor) {
                    setActiveChannel({
                        type: 'direct',
                        targetId: data.professor.id,
                        title: data.professor.name,
                        subtitle: 'Doctor & Senior Lecturer',
                        color: '#ff5e36',
                        isProfessor: true
                    });
                } else if (data.subjects?.length > 0) {
                    setActiveChannel({
                        type: 'subject',
                        targetId: data.subjects[0].id,
                        title: data.subjects[0].title,
                        subtitle: `${data.subjects[0].code} Class Room`,
                        color: '#ff5e36',
                    });
                }
            }
        } catch (e) {
            // fail silently on background poll
        }
    };

    // 2. Fetch messages for active channel
    const fetchMessages = async (showSpin = false) => {
        if (!activeChannel) return;
        if (showSpin) setIsRefreshing(true);
        try {
            const params = new URLSearchParams({
                type: activeChannel.type,
                target_id: activeChannel.targetId,
            });
            const res = await fetch(`/chat/messages?${params.toString()}`);
            if (!res.ok) return;
            const data = await res.json();
            setMessages(data.messages || []);
        } catch (e) {
            // silent catch
        } finally {
            if (showSpin) {
                setTimeout(() => setIsRefreshing(false), 400);
            }
        }
    };

    // Initial load
    useEffect(() => {
        fetchChannels();
    }, []);

    // Load messages when active channel changes or chat opens
    useEffect(() => {
        if (activeChannel && isOpen) {
            fetchMessages();
        }
    }, [activeChannel, isOpen]);

    // Scroll to bottom when messages update
    useEffect(() => {
        if (isOpen && !showContactPicker) {
            scrollToBottom();
        }
    }, [messages, isOpen, showContactPicker]);

    // 10-Second Silent Polling (Auto-refresh without page reload)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchChannels();
            if (isOpen && activeChannel) {
                fetchMessages();
            }
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
    }, [isOpen, activeChannel]);

    // Handle image selection
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Send message
    const handleSend = async (e) => {
        e?.preventDefault();
        if ((!text.trim() && !imageFile) || !activeChannel || loading) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('type', activeChannel.type);
        formData.append('target_id', activeChannel.targetId);
        if (text.trim()) {
            formData.append('content', text.trim());
        }
        if (imageFile) {
            formData.append('attachment', imageFile);
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/chat/send', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            if (res.ok) {
                setText('');
                setImageFile(null);
                setImagePreview(null);
                fetchMessages();
            }
        } catch (err) {
            console.error('Failed to send message', err);
        } finally {
            setLoading(false);
        }
    };

    // Safe Link Parser: Strictly detects http/https links and parses safe clickable tags
    const renderMessageContent = (content) => {
        if (!content) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = content.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                const safeUrl = part.startsWith('http://') || part.startsWith('https://') ? part : `https://${part}`;
                return (
                    <a
                        key={index}
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 font-bold underline text-white hover:text-amber-200 transition break-all"
                    >
                        <span>{part.length > 35 ? `${part.substring(0, 32)}...` : part}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    // ─── Filtered Subjects & Students (University & Semester Filter) ───
    const shortlistedSubjects = (channels.subjects || []).filter(sub => {
        const matchesUni = selectedUniId === 'all' || String(sub.university_id) === String(selectedUniId);
        const matchesSem = selectedSemester === 'all' || 
                           String(sub.semester_id) === String(selectedSemester) || 
                           (sub.semester?.name && sub.semester.name.toLowerCase().includes(selectedSemester.toLowerCase()));
        const matchesQuery = !searchQuery.trim() || 
                             sub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             sub.code.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesUni && matchesSem && matchesQuery;
    });

    const shortlistedStudents = (channels.classmates || []).filter(st => {
        const matchesUni = selectedUniId === 'all' || String(st.university_id) === String(selectedUniId);
        const matchesSem = selectedSemester === 'all' || 
                           String(st.semester) === String(selectedSemester) ||
                           (st.semester && `semester ${st.semester}`.toLowerCase().includes(selectedSemester.toLowerCase()));
        const matchesQuery = !searchQuery.trim() || 
                             st.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (st.student_id_no && st.student_id_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
                             (st.email && st.email.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesUni && matchesSem && matchesQuery;
    });

    const selectContact = (channelObj) => {
        setActiveChannel(channelObj);
        setShowContactPicker(false);
    };

    return (
        <>
            {/* ─── Floating Chat Bubble Button (Nimbuzz Orange) ─── */}
            <div className="fixed bottom-5 right-5 z-40">
                <button
                    type="button"
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (!isOpen) {
                            fetchChannels();
                            fetchMessages();
                        }
                    }}
                    className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-[#ff5e36] hover:bg-[#e04822] text-white shadow-xl shadow-[#ff5e36]/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                    aria-label="Open Academic Messenger"
                >
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <>
                            <MessageSquare className="w-6 h-6" />
                            {unreadTotal > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black text-white px-1 text-[11px] font-black ring-2 ring-[#ff5e36] animate-bounce">
                                    {unreadTotal}
                                </span>
                            )}
                        </>
                    )}
                </button>
            </div>

            {/* ─── Floating Chat Drawer Window (Pure White & Deep Black) ─── */}
            {isOpen && (
                <div className="fixed inset-x-3 bottom-20 sm:inset-x-auto sm:right-6 sm:bottom-22 z-50 sm:w-[420px] h-[560px] max-h-[85vh] rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#090c10] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                    
                    {/* Header with Switcher Trigger */}
                    <div className="p-3.5 border-b border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#090c10] flex items-center justify-between gap-2">
                        <button
                            type="button"
                            onClick={() => setShowContactPicker(!showContactPicker)}
                            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-85 transition group p-1 -m-1 rounded-xl"
                            title="Click to switch student or class"
                        >
                            <div className="w-9 h-9 rounded-xl bg-[#ff5e36] flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                                {activeChannel?.isProfessor ? (
                                    <Shield className="w-4 h-4" />
                                ) : activeChannel?.type === 'direct' ? (
                                    <User className="w-4 h-4" />
                                ) : (
                                    <GraduationCap className="w-4 h-4" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                    <span>{activeChannel?.title || 'Academic Messenger'}</span>
                                    <ChevronDown className={`w-3.5 h-3.5 text-[#ff5e36] transition-transform ${showContactPicker ? 'rotate-180' : ''}`} />
                                </h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                    {activeChannel?.subtitle || 'Tap to change conversation'}
                                </p>
                            </div>
                        </button>

                        {/* Top Controls: Filter Toggle, Manual Refresh & Close */}
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowContactPicker(!showContactPicker)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                                    showContactPicker 
                                        ? 'bg-[#ff5e36] text-white' 
                                        : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:text-[#ff5e36]'
                                }`}
                                title="Quick Filter Contacts"
                            >
                                <Filter className="w-3 h-3" />
                                <span className="hidden sm:inline">Filter</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => fetchMessages(true)}
                                className={`p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-[#ff5e36] hover:bg-slate-100 dark:hover:bg-white/5 transition ${isRefreshing ? 'animate-spin text-[#ff5e36]' : ''}`}
                                title="Refresh Messages (Auto-syncs every 10s)"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* ─── CONTACT PICKER & SHORTLIST FILTER DROPDOWN ─── */}
                    {showContactPicker ? (
                        <div className="flex-1 flex flex-col bg-slate-50/80 dark:bg-[#07090e] overflow-hidden p-3 space-y-3">
                            
                            {/* University & Semester Dropdowns */}
                            <div className="space-y-2 bg-white dark:bg-[#0d1117] p-3 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-xs">
                                <div className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center justify-between">
                                    <span className="flex items-center gap-1.5">
                                        <Filter className="w-3.5 h-3.5 text-[#ff5e36]" />
                                        <span>Select University &amp; Semester</span>
                                    </span>
                                    {(selectedUniId !== 'all' || selectedSemester !== 'all' || searchQuery) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedUniId('all');
                                                setSelectedSemester('all');
                                                setSearchQuery('');
                                            }}
                                            className="text-[10px] text-[#ff5e36] hover:underline font-bold"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {/* University Dropdown */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">University</label>
                                        <select
                                            value={selectedUniId}
                                            onChange={(e) => setSelectedUniId(e.target.value)}
                                            className="w-full text-xs font-semibold bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#ff5e36] focus:border-[#ff5e36]"
                                        >
                                            <option value="all">All Universities</option>
                                            {(channels.universities || []).map((u) => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Semester Dropdown */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Semester</label>
                                        <select
                                            value={selectedSemester}
                                            onChange={(e) => setSelectedSemester(e.target.value)}
                                            className="w-full text-xs font-semibold bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl px-2.5 py-1.5 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#ff5e36] focus:border-[#ff5e36]"
                                        >
                                            <option value="all">All Semesters</option>
                                            <option value="5">Semester 5</option>
                                            <option value="7">Semester 7</option>
                                            {(channels.semesters || []).map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Quick Search Bar */}
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Quick search student or class name..."
                                        className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-black border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#ff5e36] focus:border-[#ff5e36]"
                                    />
                                </div>
                            </div>

                            {/* Section Switcher Tabs: All / Classes / Students */}
                            <div className="flex items-center gap-1 text-[11px] font-bold border-b border-slate-200 dark:border-white/10 pb-1">
                                <button
                                    type="button"
                                    onClick={() => setPickerTab('all')}
                                    className={`px-3 py-1 rounded-lg transition ${
                                        pickerTab === 'all' 
                                            ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-[#ff5e36]'
                                    }`}
                                >
                                    All ({shortlistedSubjects.length + shortlistedStudents.length + (channels.professor ? 1 : 0)})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPickerTab('classes')}
                                    className={`px-3 py-1 rounded-lg transition ${
                                        pickerTab === 'classes' 
                                            ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-[#ff5e36]'
                                    }`}
                                >
                                    Classes ({shortlistedSubjects.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPickerTab('students')}
                                    className={`px-3 py-1 rounded-lg transition ${
                                        pickerTab === 'students' 
                                            ? 'bg-black text-white dark:bg-white dark:text-black font-extrabold' 
                                            : 'text-slate-600 dark:text-slate-400 hover:text-[#ff5e36]'
                                    }`}
                                >
                                    Students ({shortlistedStudents.length})
                                </button>
                            </div>

                            {/* Shortlisted Results List */}
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                                
                                {/* Professor Card (Always available) */}
                                {channels.professor && (pickerTab === 'all' || pickerTab === 'students') && (
                                    <div
                                        onClick={() => selectContact({
                                            type: 'direct',
                                            targetId: channels.professor.id,
                                            title: channels.professor.name,
                                            subtitle: 'Doctor & Senior Lecturer',
                                            color: '#ff5e36',
                                            isProfessor: true
                                        })}
                                        className="p-2.5 rounded-2xl bg-[#ff5e36]/10 hover:bg-[#ff5e36]/15 border border-[#ff5e36]/30 cursor-pointer transition flex items-center justify-between gap-3 group"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-xl bg-[#ff5e36] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                                                <Shield className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                                    <span>{channels.professor.name}</span>
                                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#ff5e36] text-white font-bold uppercase">
                                                        Professor
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 dark:text-slate-400">Direct Academic Inquiries</div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#ff5e36] group-hover:translate-x-0.5 transition-transform">
                                            Message &rarr;
                                        </span>
                                    </div>
                                )}

                                {/* Shortlisted Subject Classes */}
                                {(pickerTab === 'all' || pickerTab === 'classes') && shortlistedSubjects.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1">
                                            Course Cabinets &amp; Class Rooms
                                        </div>
                                        {shortlistedSubjects.map(sub => (
                                            <div
                                                key={`sub-${sub.id}`}
                                                onClick={() => selectContact({
                                                    type: 'subject',
                                                    targetId: sub.id,
                                                    title: sub.title,
                                                    subtitle: `${sub.code} Class Room`,
                                                    color: sub.color || '#ff5e36',
                                                })}
                                                className="p-2 rounded-xl bg-white dark:bg-[#0d1117] hover:bg-slate-100 dark:hover:bg-[#161b22] border border-slate-200/80 dark:border-white/10 cursor-pointer transition flex items-center justify-between gap-2.5"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-7 h-7 rounded-lg bg-[#ff5e36]/15 text-[#ff5e36] font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                                        {sub.code.substring(0, 3)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                            {sub.title}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                                            {sub.university?.name || 'Class Room'} • {sub.semester?.name || 'Semester'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-mono font-bold text-[#ff5e36] bg-[#ff5e36]/10 px-1.5 py-0.5 rounded">
                                                    {sub.code}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Shortlisted Students */}
                                {(pickerTab === 'all' || pickerTab === 'students') && shortlistedStudents.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 pt-1">
                                            Students &amp; Classmates
                                        </div>
                                        {shortlistedStudents.map(st => (
                                            <div
                                                key={`student-${st.id}`}
                                                onClick={() => selectContact({
                                                    type: 'direct',
                                                    targetId: st.id,
                                                    title: st.name,
                                                    subtitle: st.student_id_no ? `ID: ${st.student_id_no}` : (st.university?.name || 'Student'),
                                                    color: '#ff5e36',
                                                })}
                                                className="p-2 rounded-xl bg-white dark:bg-[#0d1117] hover:bg-slate-100 dark:hover:bg-[#161b22] border border-slate-200/80 dark:border-white/10 cursor-pointer transition flex items-center justify-between gap-2.5"
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="w-7 h-7 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold text-[11px] flex items-center justify-center shrink-0">
                                                        {st.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                            {st.name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                                            {st.university?.name || 'Enrolled Student'} {st.semester ? `• Sem ${st.semester}` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                                {channels.unread_counts?.[st.id] > 0 && (
                                                    <span className="w-2 h-2 rounded-full bg-[#ff5e36]" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {shortlistedSubjects.length === 0 && shortlistedStudents.length === 0 && (
                                    <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                                        <div>No classes or students match your filter criteria.</div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedUniId('all');
                                                setSelectedSemester('all');
                                                setSearchQuery('');
                                            }}
                                            className="px-3 py-1.5 rounded-xl bg-[#ff5e36] text-white text-xs font-bold"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Messages Feed */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-slate-50/50 dark:bg-[#07090e]">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                                        <div className="w-12 h-12 rounded-2xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center mb-2 shadow-xs">
                                            <MessageSquare className="w-6 h-6" />
                                        </div>
                                        <h5 className="font-bold text-slate-900 dark:text-white">Start the Discussion</h5>
                                        <p className="text-[11px] mt-1 max-w-xs text-slate-500 dark:text-slate-400">
                                            Send text, safe study links, or snap lab report photos directly.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((m) => {
                                        const isMe = m.user_id !== activeChannel?.targetId;
                                        
                                        return (
                                            <div
                                                key={m.id}
                                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1 px-1">
                                                    <span className="font-bold text-[10px] text-slate-700 dark:text-slate-300">
                                                        {m.user.name}
                                                    </span>
                                                    <span className="text-[9px] text-slate-400">
                                                        {m.created_at}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`max-w-[85%] rounded-2xl p-3 shadow-xs space-y-1.5 ${
                                                        isMe
                                                            ? 'bg-[#ff5e36] text-white rounded-br-xs font-medium'
                                                            : 'bg-white dark:bg-[#0d1117] text-slate-900 dark:text-white border border-slate-200/90 dark:border-white/10 rounded-bl-xs'
                                                    }`}
                                                >
                                                    {/* Text Content with Safe Link Highlighting */}
                                                    {m.content && (
                                                        <p className="leading-relaxed whitespace-pre-wrap break-words">
                                                            {renderMessageContent(m.content)}
                                                        </p>
                                                    )}

                                                    {/* Image Attachment Lightbox Thumbnail */}
                                                    {m.attachment_url && (
                                                        <div 
                                                            onClick={() => setPreviewImageModal(m.attachment_url)}
                                                            className="relative cursor-pointer rounded-xl overflow-hidden border border-white/20 group mt-1"
                                                        >
                                                            <img
                                                                src={m.attachment_url}
                                                                alt="Attachment"
                                                                className="max-h-48 w-full object-cover rounded-xl transition group-hover:scale-102"
                                                                loading="lazy"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
                                                                Click to expand
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Image Preview Thumbnail Before Sending */}
                            {imagePreview && (
                                <div className="px-3.5 py-2 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#090c10] flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <img src={imagePreview} alt="Upload preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300 dark:border-white/10" />
                                        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                                            {imageFile?.name}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null);
                                            setImagePreview(null);
                                        }}
                                        className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-rose-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {/* Chat Input Bar */}
                            <form onSubmit={handleSend} className="p-2.5 border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#090c10] flex items-center gap-2">
                                {/* Camera / Image Attachment Button */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-xl text-slate-500 hover:text-[#ff5e36] hover:bg-slate-100 dark:hover:bg-white/5 transition shrink-0"
                                    title="Attach image or take photo"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>

                                {/* Input Field */}
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type a message or paste a link..."
                                    className="flex-1 bg-slate-100 dark:bg-black border border-transparent dark:border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#ff5e36] focus:outline-none"
                                />

                                {/* Send Button (Nimbuzz Orange) */}
                                <button
                                    type="submit"
                                    disabled={loading || (!text.trim() && !imageFile)}
                                    className="p-2.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white shadow-sm shadow-[#ff5e36]/30 active:scale-95 disabled:opacity-40 transition shrink-0 cursor-pointer font-bold"
                                >
                                    <Send className="w-3.5 h-3.5" />
                                </button>
                            </form>
                        </>
                    )}
                </div>
            )}

            {/* ─── Lightbox Modal for Full Image Expansion ─── */}
            {previewImageModal && (
                <div 
                    onClick={() => setPreviewImageModal(null)}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                >
                    <div className="relative max-w-3xl max-h-[90vh]">
                        <img 
                            src={previewImageModal} 
                            alt="Expanded preview" 
                            className="max-h-[85vh] w-auto rounded-2xl shadow-2xl object-contain border border-white/10"
                        />
                        <button
                            type="button"
                            onClick={() => setPreviewImageModal(null)}
                            className="absolute top-2 right-2 p-2 rounded-full bg-black/80 text-white hover:bg-black"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
