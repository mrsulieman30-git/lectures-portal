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
    Shield
} from 'lucide-react';

export default function ChatBubble() {
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState({ professor: null, subjects: [], classmates: [], unread_counts: {} });
    const [activeChannel, setActiveChannel] = useState(null); // { type: 'direct'|'subject', targetId, title, subtitle, color }
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
                        color: data.subjects[0].color || '#ff5e36',
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
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // 10-Second Silent Polling (Auto-refresh without page reload)
    useEffect(() => {
        const interval = setInterval(() => {
            fetchChannels();
            if (isOpen && activeChannel) {
                fetchMessages();
            }
        }, 10000); // exactly 10 seconds

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
                // Ensure strictly http or https
                const safeUrl = part.startsWith('http://') || part.startsWith('https://') ? part : `https://${part}`;
                return (
                    <a
                        key={index}
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 font-bold underline text-amber-300 hover:text-white transition break-all"
                    >
                        <span>{part.length > 35 ? `${part.substring(0, 32)}...` : part}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <>
            {/* ─── Floating Chat Bubble Button ─── */}
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
                    className="relative flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#ff5e36] via-[#ff6b4a] to-[#ff416c] text-white shadow-xl shadow-[#ff5e36]/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                    aria-label="Open Academic Messenger"
                >
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <>
                            <MessageSquare className="w-6 h-6" />
                            {unreadTotal > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                                    {unreadTotal}
                                </span>
                            )}
                        </>
                    )}
                </button>
            </div>

            {/* ─── Floating Chat Drawer Window ─── */}
            {isOpen && (
                <div className="fixed inset-x-3 bottom-20 sm:inset-x-auto sm:right-6 sm:bottom-22 z-50 sm:w-[410px] h-[540px] max-h-[82vh] rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                    
                    {/* Header */}
                    <div className="p-3.5 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div 
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0"
                                style={{ backgroundColor: activeChannel?.color || '#ff5e36' }}
                            >
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
                                    {activeChannel?.isProfessor && (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-orange-100 text-[#ff5e36] dark:bg-orange-950/60 dark:text-orange-400 font-bold uppercase">
                                            Prof
                                        </span>
                                    )}
                                </h4>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                    {activeChannel?.subtitle || 'Direct & Class Messages'}
                                </p>
                            </div>
                        </div>

                        {/* Top Controls: Manual Refresh & Close */}
                        <div className="flex items-center gap-1">
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

                    {/* Channels Pill Selector Bar (Thin, Line-Separated) */}
                    <div className="px-3 py-2 border-b border-slate-200/80 dark:border-white/10 bg-slate-100/60 dark:bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px] font-semibold">
                        {/* Dr. Mohammad Sulieman Channel */}
                        {channels.professor && (
                            <button
                                type="button"
                                onClick={() => setActiveChannel({
                                    type: 'direct',
                                    targetId: channels.professor.id,
                                    title: channels.professor.name,
                                    subtitle: 'Doctor & Senior Lecturer',
                                    color: '#ff5e36',
                                    isProfessor: true
                                })}
                                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl transition ${
                                    activeChannel?.targetId === channels.professor.id && activeChannel?.type === 'direct'
                                        ? 'bg-[#ff5e36] text-white shadow-xs font-bold'
                                        : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white'
                                }`}
                            >
                                <span>🩺</span>
                                <span>Dr. Sulieman</span>
                                {channels.unread_counts?.[channels.professor.id] > 0 && (
                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                )}
                            </button>
                        )}

                        {/* Subject Class Rooms */}
                        {channels.subjects?.map((sub) => (
                            <button
                                key={sub.id}
                                type="button"
                                onClick={() => setActiveChannel({
                                    type: 'subject',
                                    targetId: sub.id,
                                    title: sub.title,
                                    subtitle: `${sub.code} Class Channel`,
                                    color: sub.color || '#ff5e36',
                                })}
                                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl transition ${
                                    activeChannel?.targetId === sub.id && activeChannel?.type === 'subject'
                                        ? 'bg-[#ff5e36] text-white shadow-xs font-bold'
                                        : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white'
                                }`}
                            >
                                <span>🩸</span>
                                <span>{sub.code}</span>
                            </button>
                        ))}

                        {/* Classmates */}
                        {channels.classmates?.map((mate) => (
                            <button
                                key={mate.id}
                                type="button"
                                onClick={() => setActiveChannel({
                                    type: 'direct',
                                    targetId: mate.id,
                                    title: mate.name,
                                    subtitle: mate.student_id_no || 'Classmate',
                                    color: '#9333ea',
                                })}
                                className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl transition ${
                                    activeChannel?.targetId === mate.id && activeChannel?.type === 'direct'
                                        ? 'bg-[#ff5e36] text-white shadow-xs font-bold'
                                        : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white'
                                }`}
                            >
                                <span>👤</span>
                                <span>{mate.name.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Messages Feed */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
                                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#ff5e36] flex items-center justify-center mb-2 shadow-xs">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h5 className="font-bold text-slate-700 dark:text-slate-300">Start the Discussion</h5>
                                <p className="text-[11px] mt-1 max-w-xs">
                                    Send text, lecture notes, safe resource links, or lab report photos.
                                </p>
                            </div>
                        ) : (
                            messages.map((m) => {
                                const isMe = m.user_id === channels.professor?.id ? false : (m.user.name.includes('Dr.') ? false : m.user_id !== activeChannel?.targetId);
                                
                                return (
                                    <div
                                        key={m.id}
                                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className="flex items-center gap-1.5 mb-1 px-1">
                                            <span className="font-bold text-[10px] text-slate-600 dark:text-slate-400">
                                                {m.user.name}
                                            </span>
                                            <span className="text-[9px] text-slate-400">
                                                {m.created_at}
                                            </span>
                                        </div>

                                        <div
                                            className={`max-w-[85%] rounded-2xl p-3 shadow-xs space-y-1.5 ${
                                                isMe
                                                    ? 'bg-gradient-to-r from-[#ff5e36] to-[#ff416c] text-white rounded-br-xs'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-white/10 rounded-bl-xs'
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
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition">
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
                        <div className="px-3.5 py-2 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <img src={imagePreview} alt="Upload preview" className="w-10 h-10 object-cover rounded-lg border border-slate-300" />
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
                    <form onSubmit={handleSend} className="p-2.5 border-t border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 flex items-center gap-2">
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
                            className="flex-1 bg-slate-100 dark:bg-slate-900 border-0 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-[#ff5e36] focus:outline-none"
                        />

                        {/* Send Button */}
                        <button
                            type="submit"
                            disabled={loading || (!text.trim() && !imageFile)}
                            className="p-2.5 rounded-xl bg-gradient-to-r from-[#ff5e36] to-[#ff416c] text-white shadow-sm hover:brightness-105 active:scale-95 disabled:opacity-40 transition shrink-0 cursor-pointer"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </button>
                    </form>
                </div>
            )}

            {/* ─── Lightbox Modal for Full Image Expansion ─── */}
            {previewImageModal && (
                <div 
                    onClick={() => setPreviewImageModal(null)}
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                >
                    <div className="relative max-w-3xl max-h-[90vh]">
                        <img 
                            src={previewImageModal} 
                            alt="Expanded preview" 
                            className="max-h-[85vh] w-auto rounded-2xl shadow-2xl object-contain"
                        />
                        <button
                            type="button"
                            onClick={() => setPreviewImageModal(null)}
                            className="absolute top-2 right-2 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-900"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
