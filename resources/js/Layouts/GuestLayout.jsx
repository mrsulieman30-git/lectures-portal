import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { LanguageSwitcher } from '@/Context/LanguageContext';

export default function GuestLayout({ children }) {
    return (
        <div className="relative min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-orange-500 selection:text-white">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-indigo-600/15 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 left-1/3 w-[26rem] h-[26rem] bg-amber-500/10 rounded-full blur-3xl" />
                <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
                        backgroundSize: '32px 32px'
                    }}
                />
            </div>

            {/* Top Navigation Bar */}
            <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
                <Link href="/" className="group flex items-center gap-3 transition">
                    <ApplicationLogo className="w-11 h-11 group-hover:scale-105 transition-transform duration-300" />
                    <div>
                        <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-white block leading-none">
                            LECTURE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">PORTAL</span>
                        </span>
                        <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400">
                            Academic OS
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md">
                        <LanguageSwitcher />
                    </div>
                </div>
            </header>

            {/* Main Auth Container */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-6">
                {children}
            </main>

            {/* Subtle Footer */}
            <footer className="relative z-10 py-6 text-center text-xs text-slate-400">
                <p>
                    &copy; {new Date().getFullYear()} <strong className="text-white">Mohammad Sulieman</strong>. All rights reserved. &bull;{' '}
                    <a 
                        href="https://medblog.seeha.tech" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#ff5e36] hover:text-[#ff7a54] underline font-semibold transition"
                    >
                        Dr. Mohammad Sulieman CV &amp; Medical Blog
                    </a>
                </p>
            </footer>
        </div>
    );
}
