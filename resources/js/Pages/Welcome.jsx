import { Head, Link } from '@inertiajs/react';
import { 
    BookOpen, 
    FileText, 
    Building2, 
    GraduationCap, 
    Lock, 
    Download, 
    Calendar, 
    ShieldCheck, 
    ArrowRight, 
    Sparkles,
    FolderKanban,
    Layers,
    Globe,
    Smartphone,
    Award
} from 'lucide-react';
import { useTranslation, LanguageSwitcher } from '@/Context/LanguageContext';
import TiltCard3D from '@/Components/TiltCard3D';
import Interactive3DScene from '@/Components/Interactive3DScene';

export default function Welcome({ auth }) {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-[#070b19] text-slate-100 selection:bg-indigo-500 selection:text-white relative overflow-hidden flex flex-col justify-between">
            <Head title="Professor's Academic Cabinet OS - 3D Interactive Portal" />

            {/* Aurora Ambient Liquid Mesh Backdrops */}
            <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none animate-morph" />
            <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-purple-600/20 rounded-full blur-[180px] pointer-events-none" />

            {/* Interactive 3D Background Canvas Layer */}
            <div className="absolute inset-0 z-0 opacity-70">
                <Interactive3DScene height="100%" interactive={true} />
            </div>

            {/* Navigation Header with Liquid Glass Bar */}
            <header className="relative z-20 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6">
                <div className="liquid-glass-dark rounded-2xl px-5 py-3.5 flex items-center justify-between border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25">
                            <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                                <FolderKanban className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>
                        <div>
                            <span className="font-extrabold text-white text-base sm:text-lg tracking-tight block leading-none font-display">
                                {t('appName')}
                            </span>
                            <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-bold uppercase mt-0.5 block">
                                {t('appTagline')}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <LanguageSwitcher className="bg-slate-900/80 border-white/10 text-white" />

                        <nav className="flex items-center gap-2 sm:gap-3">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 border border-indigo-400/30"
                                >
                                    <span>{t('goToDashboard')}</span>
                                    <span>&rarr;</span>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        {t('signIn')}
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 text-xs font-extrabold transition-all shadow-lg shadow-white/10 active:scale-95"
                                    >
                                        <span>{t('studentAccess')}</span>
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Interactive Hero Section */}
            <main className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 py-8 lg:py-16 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Column: Hero Text */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass-dark border border-indigo-500/30 text-xs font-semibold text-indigo-300 shadow-lg">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            <span>{t('welcomeBadge')}</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] font-display">
                            {t('welcomeTitle')}{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-fuchsia-400">
                                {t('welcomeTitleAccent')}
                            </span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-xl font-normal">
                            {t('welcomeDescription')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/35 transition-all active:scale-95 border border-white/20"
                                >
                                    <span>{t('goToDashboard')}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/35 transition-all active:scale-95 border border-indigo-400/30"
                                    >
                                        <span>{t('instructorStudentSignIn')}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl liquid-glass-dark hover:bg-slate-800/80 text-slate-200 border border-white/10 font-bold text-sm transition-all active:scale-95"
                                    >
                                        <span>{t('registerAsStudent')}</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: 3D Floating Interactive Cabinet Showcase */}
                    <div className="lg:col-span-5 perspective-1500 flex justify-center">
                        <TiltCard3D
                            maxTilt={18}
                            perspective={1500}
                            scale={1.04}
                            glowColor="#6366f1"
                            className="w-full max-w-md liquid-glass-dark rounded-3xl p-6 sm:p-7 border border-white/15 shadow-2xl relative"
                        >
                            {/* 3D Floating Tag */}
                            <div className="flex items-center justify-between mb-5 translate-z-30">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
                                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                                        Professor's Cabinet OS
                                    </span>
                                </div>
                                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    v2.5 Live
                                </span>
                            </div>

                            {/* 3D Stacked Mini Cabinets */}
                            <div className="space-y-3 preserve-3d">
                                {[
                                    { code: 'CS401', title: 'Distributed Cloud Systems', color: '#06b6d4', campus: 'UTAS Tech', files: '14 Books & Packs' },
                                    { code: 'AI302', title: 'Neural Networks & Deep Learning', color: '#8b5cf6', campus: 'MGU Campus', files: '9 Lecture Decks' },
                                    { code: 'SEC501', title: 'Applied Cryptography & Cyber', color: '#ec4899', campus: 'Somali Cyber Inst', files: '12 Lab Guides' },
                                ].map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-2xl liquid-glass border border-white/20 hover:border-white/40 transition-all cursor-pointer flex items-center justify-between group/item"
                                        style={{
                                            transform: `translateZ(${25 + idx * 15}px)`,
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md"
                                                style={{ backgroundColor: item.color }}
                                            >
                                                {item.code.substring(0, 2)}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-slate-900 group-hover/item:text-indigo-600 transition-colors line-clamp-1">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[10px] text-slate-500 mt-0.5">
                                                    {item.campus} • {item.files}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                                            <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom 3D Hardware Security Badge */}
                            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 translate-z-20">
                                <span className="flex items-center gap-1.5">
                                    <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Single-Device Lock Active</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Universal Shelf</span>
                                </span>
                            </div>
                        </TiltCard3D>
                    </div>

                </div>

                {/* 3D Liquid Glass Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-16 lg:mt-24 perspective-1000">
                    {[
                        {
                            icon: Building2,
                            color: '#6366f1',
                            title: t('multiUniversityCard'),
                            desc: t('multiUniversityDesc'),
                        },
                        {
                            icon: Lock,
                            color: '#06b6d4',
                            title: t('viewOnlyCard'),
                            desc: t('viewOnlyDesc'),
                        },
                        {
                            icon: GraduationCap,
                            color: '#ec4899',
                            title: t('assignmentsCard'),
                            desc: t('assignmentsDesc'),
                        },
                        {
                            icon: ShieldCheck,
                            color: '#10b981',
                            title: t('approvalCard'),
                            desc: t('approvalDesc'),
                        },
                    ].map((feat, idx) => {
                        const Icon = feat.icon;
                        return (
                            <TiltCard3D
                                key={idx}
                                maxTilt={10}
                                scale={1.03}
                                glowColor={feat.color}
                                className="liquid-glass-dark rounded-3xl p-6 border border-white/10 transition-all group"
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold mb-4 translate-z-20 shadow-md"
                                    style={{
                                        backgroundColor: `${feat.color}20`,
                                        color: feat.color,
                                        border: `1px solid ${feat.color}40`,
                                    }}
                                >
                                    <Icon className="w-6 h-6" />
                                </div>
                                <h3 className="font-extrabold text-white text-base font-display translate-z-30 group-hover:text-cyan-300 transition-colors">
                                    {feat.title}
                                </h3>
                                <p className="text-xs text-slate-400 mt-2 leading-relaxed translate-z-10">
                                    {feat.desc}
                                </p>
                            </TiltCard3D>
                        );
                    })}
                </div>
            </main>

            {/* Liquid Glass Footer */}
            <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-xs text-slate-400 liquid-glass-dark">
                <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span>{t('footerText')}</span>
                    <span className="font-mono text-[11px] text-indigo-400">
                        Professor's Academic Cabinet • 3D Liquid Glass Architecture
                    </span>
                </div>
            </footer>
        </div>
    );
}
