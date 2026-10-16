import React, { useState, useEffect, useRef } from 'react';
import { 
    Bell, 
    Check, 
    CheckCheck, 
    ExternalLink, 
    AlertCircle, 
    BookOpen, 
    Award, 
    Clock, 
    Info 
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';
import { router } from '@inertiajs/react';

export default function NotificationBell() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch unread count
    const fetchUnreadCount = async () => {
        try {
            const res = await fetch(route('notifications.unread-count'), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.count || 0);
            }
        } catch (e) {
            // silent fail
        }
    };

    // Fetch notification list
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(route('notifications.index'), {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.data || []);
            }
        } catch (e) {
            // silent fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    // Toggle dropdown
    const handleToggle = () => {
        if (!isOpen) {
            fetchNotifications();
        }
        setIsOpen(!isOpen);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mark single as read
    const handleMarkAsRead = async (id, actionUrl) => {
        try {
            await fetch(route('notifications.read', id), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) {
            // silent fail
        }

        if (actionUrl) {
            setIsOpen(false);
            router.visit(actionUrl);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        try {
            await fetch(route('notifications.read-all'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (e) {
            // silent fail
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'assignment_new':
            case 'assignment_deadline':
                return <Clock className="w-4 h-4 text-amber-500" />;
            case 'submission_graded':
                return <Award className="w-4 h-4 text-emerald-500" />;
            case 'document_added':
                return <BookOpen className="w-4 h-4 text-indigo-500" />;
            case 'user_approved':
            case 'name_change_approved':
                return <Check className="w-4 h-4 text-emerald-500" />;
            case 'name_change_rejected':
                return <AlertCircle className="w-4 h-4 text-rose-500" />;
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return t('justNow', 'Just now');
        if (diffMins < 60) return `${diffMins}m ${t('ago', 'ago')}`;
        if (diffHours < 24) return `${diffHours}h ${t('ago', 'ago')}`;
        return `${diffDays}d ${t('ago', 'ago')}`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={handleToggle}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                aria-label={t('notifications', 'Notifications')}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200/90 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    {/* Header */}
                    <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">
                                {t('notifications', 'Notifications')}
                            </span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    {unreadCount} {t('new', 'new')}
                                </span>
                            )}
                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>{t('markAllRead', 'Mark all read')}</span>
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                        {loading && notifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                                {t('loading', 'Loading notifications...')}
                            </div>
                        ) : notifications.length > 0 ? (
                            notifications.map((notif) => {
                                const isUnread = !notif.read_at;
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleMarkAsRead(notif.id, notif.action_url)}
                                        className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                                            isUnread ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200 shadow-xs shrink-0">
                                            {getIcon(notif.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <h5 className={`text-xs truncate ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                                    {notif.title}
                                                </h5>
                                                <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                                                    {formatTime(notif.created_at)}
                                                </span>
                                            </div>

                                            {notif.message && (
                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                            )}
                                        </div>

                                        {isUnread && (
                                            <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold text-slate-700">
                                    {t('noNotifications', 'No notifications right now')}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    {t('allCaughtUp', "You're all caught up!")}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
