import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import NotificationBell from '@/Components/NotificationBell';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { 
    BookOpen, 
    Building2, 
    Users, 
    BarChart3, 
    Calendar, 
    LayoutDashboard, 
    Menu, 
    X, 
    ChevronDown, 
    FolderKanban,
    FileEdit,
    Sparkles,
    Bot
} from 'lucide-react';
import { useTranslation, LanguageSwitcher } from '@/Context/LanguageContext';
import { ThemeToggle } from '@/Context/ThemeContext';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const { t } = useTranslation();

    const isAdmin = user.role === 'admin';
    const isFemale = user?.gender === 'female';

    const isAcademicsActive = route().current('admin.universities.*') || 
                              route().current('library.*') || 
                              route().current('schedule.*') || 
                              route().current('notes.*');

    const isToolsActive = route().current('admin.agent-actions.*') || 
                          route().current('admin.analytics');

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b0e14] text-slate-800 dark:text-slate-100 flex flex-col relative selection:bg-[#ff5e36] selection:text-white transition-colors duration-200">
            {/* Ambient Background Glows - Nimbuzz Coral/Tangerine & Deep Violet */}
            <div className="fixed top-0 -left-32 w-96 h-96 bg-[#ff5e36]/15 dark:bg-[#ff5e36]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
            <div className="fixed top-1/3 -right-32 w-96 h-96 bg-[#ff416c]/15 dark:bg-[#ff416c]/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed -bottom-32 left-1/3 w-96 h-96 bg-purple-500/10 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Top Navigation */}
            <nav className="border-b border-white/80 dark:border-white/10 sticky top-0 z-40 backdrop-blur-2xl bg-white/80 dark:bg-[#121622]/80 shadow-xs transition-colors duration-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        
                        {/* Logo & Desktop Nav Links */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2.5 group">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff5e36] via-[#ff6b4a] to-[#ff416c] text-white flex items-center justify-center font-bold text-base shadow-sm shadow-[#ff5e36]/30 group-hover:scale-105 transition-all">
                                    <FolderKanban className="w-5 h-5 drop-shadow" />
                                </div>
                                <div>
                                    <span className="font-bold text-slate-900 dark:text-white tracking-tight text-base block leading-none">
                                        {t('appName')}
                                    </span>
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ff5e36] font-mono mt-0.5 block flex items-center gap-1">
                                        {t('cabinetOS')}
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff5e36] animate-pulse" />
                                    </span>
                                </div>
                            </Link>

                            <div className="hidden lg:flex items-center space-x-1 lg:space-x-1.5">
                                {isAdmin ? (
                                    <>
                                        <NavLink
                                            href={route('admin.dashboard')}
                                            active={route().current('admin.dashboard')}
                                            className="px-4.5 text-sm lg:text-base font-bold tracking-tight"
                                        >
                                            {t('commandCenter')}
                                        </NavLink>

                                        <NavLink
                                            href={route('admin.subjects.index')}
                                            active={route().current('admin.subjects.*')}
                                        >
                                            {t('courseCabinets')}
                                        </NavLink>

                                        <NavLink
                                            href={route('admin.users')}
                                            active={route().current('admin.users')}
                                        >
                                            {t('students')}
                                        </NavLink>

                                        {/* Academics Dropdown */}
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button
                                                    type="button"
                                                    className={`h-9 shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-150 active:scale-95 select-none whitespace-nowrap ${
                                                        isAcademicsActive
                                                            ? 'bg-gradient-to-r from-[#ff5e36] to-[#e04822] text-white shadow-sm shadow-[#ff5e36]/25 font-bold'
                                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                                                    }`}
                                                >
                                                    <span>{t('academics', 'Academics')}</span>
                                                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${isAcademicsActive ? 'text-white' : 'text-slate-400'}`} />
                                                </button>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content align="left" width="w-60" contentClasses="p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl space-y-0.5">
                                                <Dropdown.Link
                                                    href={route('admin.universities.index')}
                                                    className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                                                        route().current('admin.universities.*')
                                                            ? 'bg-[#ff5e36]/15 text-[#ff5e36] dark:text-[#ff7a54] font-bold'
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-100">{t('universities')}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">Campuses & Semesters</div>
                                                    </div>
                                                </Dropdown.Link>

                                                <Dropdown.Link
                                                    href={route('library.index')}
                                                    className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                                                        route().current('library.*')
                                                            ? 'bg-[#ff5e36]/15 text-[#ff5e36] dark:text-[#ff7a54] font-bold'
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <BookOpen className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-100">{t('universalLibrary', 'Library')}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">Shared Reference Repository</div>
                                                    </div>
                                                </Dropdown.Link>

                                                <Dropdown.Link
                                                    href={route('schedule.index')}
                                                    className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                                                        route().current('schedule.*')
                                                            ? 'bg-[#ff5e36]/15 text-[#ff5e36] dark:text-[#ff7a54] font-bold'
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <Calendar className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-100">{t('schedule')}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">Lectures & Academic Calendar</div>
                                                    </div>
                                                </Dropdown.Link>

                                                <Dropdown.Link
                                                    href={route('notes.index')}
                                                    className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                                                        route().current('notes.*')
                                                            ? 'bg-[#ff5e36]/15 text-[#ff5e36] dark:text-[#ff7a54] font-bold'
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <FileEdit className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-100">{t('studyNotes')}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">Internal Notes & Drafts</div>
                                                    </div>
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>

                                        {/* Agent & Tools Dropdown */}
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button
                                                    type="button"
                                                    className={`h-9 shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-150 active:scale-95 select-none whitespace-nowrap ${
                                                        isToolsActive
                                                            ? 'bg-gradient-to-r from-[#ff5e36] to-[#e04822] text-white shadow-sm shadow-[#ff5e36]/25 font-bold'
                                                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10'
                                                    }`}
                                                >
                                                    <span>{t('agentTools', 'Agent & Tools')}</span>
                                                    <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-150 ${isToolsActive ? 'text-white' : 'text-slate-400'}`} />
                                                </button>
                                            </Dropdown.Trigger>

                                            <Dropdown.Content align="left" width="w-60" contentClasses="p-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl space-y-0.5">
                                                <Dropdown.Link
                                                    href={route('admin.agent-actions.index')}
                                                    className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                                                        route().current('admin.agent-actions.*')
                                                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <Bot className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-100">Agent Approval Hub</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">OpenClaw OCR & Approvals</div>
                                                    </div>
                                                </Dropdown.Link>

                                                <Dropdown.Link
                                                    href={route('admin.analytics')}
                                                    className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs transition-all ${
                                                        route().current('admin.analytics')
                                                            ? 'bg-[#ff5e36]/15 text-[#ff5e36] dark:text-[#ff7a54] font-bold'
                                                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <BarChart3 className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-slate-100">{t('analytics')}</div>
                                                        <div className="text-[10px] text-slate-400 font-normal">Activity & Usage Metrics</div>
                                                    </div>
                                                </Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </>
                                ) : (
                                    <>
                                        <NavLink
                                            href={route('dashboard')}
                                            active={route().current('dashboard')}
                                            className="px-4.5 text-sm lg:text-base font-bold tracking-tight"
                                        >
                                            {t('myDashboard')}
                                        </NavLink>
                                        <NavLink
                                            href={route('library.index')}
                                            active={route().current('library.*')}
                                        >
                                            {t('universalLibrary', 'Library')}
                                        </NavLink>
                                        <NavLink
                                            href={route('schedule.index')}
                                            active={route().current('schedule.*')}
                                        >
                                            {t('lectureSchedule')}
                                        </NavLink>
                                        <NavLink
                                            href={route('notes.index')}
                                            active={route().current('notes.*')}
                                        >
                                            {t('studyNotes')}
                                        </NavLink>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Top Right Controls: Theme Toggle, Notifications, Flag Switcher & Compact User Card */}
                        <div className="flex items-center gap-2">
                            <ThemeToggle />

                            <NotificationBell />

                            <div className="hidden sm:block">
                                <LanguageSwitcher />
                            </div>

                            {/* User Account Trigger: Profile Picture + Dropdown Arrow */}
                            <div className="hidden sm:block">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-1.5 p-1 pr-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#161B26] hover:bg-slate-50 dark:hover:bg-[#1E2433] focus:outline-none transition-all shadow-xs group"
                                            title={user.name}
                                        >
                                            {user.avatar_url ? (
                                                <img
                                                    src={user.avatar_url}
                                                    alt={user.name}
                                                    className="w-8 h-8 rounded-xl object-cover shrink-0 shadow-xs"
                                                />
                                            ) : (
                                                <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                                                    isFemale && !isAdmin
                                                        ? 'bg-gradient-to-tr from-rose-500 to-pink-500'
                                                        : 'bg-gradient-to-tr from-[#ff5e36] to-[#ff416c]'
                                                }`}>
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors shrink-0" />
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content width="w-56" contentClasses="p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xl">
                                        <div className="px-3 py-2.5 mb-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-white/5">
                                            <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                {user.name}
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                {user.email}
                                            </div>
                                            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#ff5e36]/10 text-[#ff5e36]">
                                                {isAdmin ? t('administrator') : isFemale ? 'Female Student' : t('student')}
                                            </div>
                                        </div>

                                        <Dropdown.Link href={route('profile.edit')}>
                                            {t('myProfileSettings')}
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('notes.index')}>
                                            {t('studyNotes')}
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">
                                            {t('logOut')}
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            {/* Mobile / Tablet Hamburger Button */}
                            <button
                                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                                className="inline-flex items-center justify-center rounded-xl p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none lg:hidden"
                            >
                                {showingNavigationDropdown ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>

                    </div>
                </div>

                {/* Mobile Navigation Dropdown Menu */}
                {showingNavigationDropdown && (
                    <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121622] px-4 pt-2 pb-4 space-y-1">
                        <div className="pb-2 pt-1 flex items-center justify-between gap-2">
                            <LanguageSwitcher className="w-full justify-center" />
                        </div>

                        {isAdmin ? (
                            <>
                                <ResponsiveNavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')}>
                                    {t('commandCenter')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.universities.index')} active={route().current('admin.universities.*')}>
                                    {t('universities')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.subjects.index')} active={route().current('admin.subjects.*')}>
                                    {t('courseCabinets')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('library.index')} active={route().current('library.*')}>
                                    {t('universalLibrary', 'Library')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.users')} active={route().current('admin.users')}>
                                    {t('students')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.analytics')} active={route().current('admin.analytics')}>
                                    {t('analytics')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('schedule.index')} active={route().current('schedule.*')}>
                                    {t('schedule')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('notes.index')} active={route().current('notes.*')}>
                                    {t('studyNotes')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('admin.agent-actions.index')} active={route().current('admin.agent-actions.*')} className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2">
                                    <Bot className="w-4 h-4" />
                                    <span>Agent Approval Hub</span>
                                </ResponsiveNavLink>
                            </>
                        ) : (
                            <>
                                <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    {t('myDashboard')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('library.index')} active={route().current('library.*')}>
                                    {t('universalLibrary', 'Library')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('schedule.index')} active={route().current('schedule.*')}>
                                    {t('lectureSchedule')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('notes.index')} active={route().current('notes.*')}>
                                    {t('studyNotes')}
                                </ResponsiveNavLink>
                            </>
                        )}

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 px-3 py-1.5">
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-xs"
                                    />
                                ) : (
                                    <div className={`w-9 h-9 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs ${
                                        isFemale && !isAdmin
                                            ? 'bg-gradient-to-tr from-rose-500 to-pink-500'
                                            : 'bg-gradient-to-tr from-[#ff5e36] to-[#ff416c]'
                                    }`}>
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate flex items-center justify-between">
                                        <span className="truncate">{user.name}</span>
                                        {isFemale && !isAdmin && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300 font-semibold border border-rose-200 shrink-0">
                                                Rose
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                                </div>
                            </div>
                            <div className="mt-2 space-y-1">
                                <ResponsiveNavLink href={route('profile.edit')}>
                                    {t('profileSettings')}
                                </ResponsiveNavLink>
                                <ResponsiveNavLink href={route('logout')} method="post" as="button">
                                    {t('logOut')}
                                </ResponsiveNavLink>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Header section (if provided) */}
            {header && (
                <header className="bg-white/90 dark:bg-[#121622]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 transition-colors">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            {/* Main Content Area */}
            <main className="flex-1">
                {children}
            </main>

            {/* Dashboard Footer */}
            <footer className="border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md py-5 text-xs text-slate-500 dark:text-slate-400 mt-auto">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <p>
                        &copy; {new Date().getFullYear()} <strong className="text-slate-800 dark:text-slate-200">Mohammad Sulieman</strong>. All rights reserved.
                    </p>
                    <div>
                        <a 
                            href="https://medblog.seeha.tech" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-bold text-rose-600 dark:text-rose-400 hover:underline"
                        >
                            Dr. Mohammad Sulieman CV &amp; Medical Blog
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
