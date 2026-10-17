import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
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
    Award,
    Menu,
    X,
    Microscope,
    FlaskConical,
    Activity,
    HeartPulse,
    Dna,
    Droplet
} from 'lucide-react';
import { useTranslation, LanguageSwitcher } from '@/Context/LanguageContext';
import { ThemeToggle } from '@/Context/ThemeContext';
import TiltCard3D from '@/Components/TiltCard3D';
import Interactive3DScene from '@/Components/Interactive3DScene';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth }) {
    const { t } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const medicalCourses = [
        {
            code: 'MLS-411',
            title: 'Blood Banking & Immunohematology',
            campus: 'Red Sea University',
            semester: 'Semester 7',
            color: '#E11D48',
            topics: 'ABO/Rh Discrepancies, Crossmatching & HDFN',
        },
        {
            code: 'HEM-402',
            title: 'Hematology II',
            campus: 'CITYCOT University',
            semester: 'Semester 7',
            color: '#9333EA',
            topics: 'Leukemia Cytochemistry, Hemostasis & Marrow',
        },
        {
            code: 'RBC-305',
            title: 'Advanced RBCs Disorders',
            campus: 'University of Bosaso',
            semester: 'Semester 5',
            color: '#EA580C',
            topics: 'Hemoglobinopathies, Thalassemia & Anemias',
        },
        {
            code: 'BAC-302',
            title: 'Bacteriology III',
            campus: 'CITYCOT University',
            semester: 'Semester 5',
            color: '#0D9488',
            topics: 'Diagnostic Culture, AST & Mycobacteriology',
        },
        {
            code: 'HIS-201',
            title: 'Histopathology I',
            campus: 'University of Bosaso',
            semester: 'Semester 3',
            color: '#DB2777',
            topics: 'Tissue Grossing, Fixation & H&E Staining',
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b19] text-slate-800 dark:text-slate-100 selection:bg-rose-500 selection:text-white relative overflow-x-hidden flex flex-col justify-between transition-colors duration-200">
            <Head title="Dr. Mohammad Sulieman — Medical Laboratory & Hematology Academic Portal" />

            {/* Nimbuzzy Soft Ambient Background Glows */}
            <div className="fixed top-0 -left-32 w-96 h-96 bg-[#ff5e36]/15 dark:bg-[#ff5e36]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
            <div className="fixed top-1/3 -right-32 w-96 h-96 bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed -bottom-32 left-1/3 w-96 h-96 bg-orange-500/10 dark:bg-orange-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Interactive 3D Background Canvas Layer */}
            <div className="fixed inset-0 z-0 opacity-25 dark:opacity-40 pointer-events-none">
                <Interactive3DScene height="100%" interactive={true} />
            </div>

            {/* Top Navigation Bar — Organized and 100% Mobile Responsive */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/10 backdrop-blur-2xl bg-white/80 dark:bg-[#0b0f19]/80 shadow-xs transition-colors duration-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 sm:h-20 items-center justify-between">
                        
                        {/* Brand Logo & Title */}
                        <Link href="/" className="flex items-center gap-3 group min-w-0">
                            <ApplicationLogo className="w-10 h-10 sm:w-11 sm:h-11 group-hover:scale-105 transition-transform duration-200 shrink-0" />
                            <div className="min-w-0">
                                <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight block leading-tight font-heading truncate">
                                    Dr. Mohammad Sulieman
                                </span>
                                <span className="text-[10px] sm:text-[11px] font-semibold text-[#ff5e36] dark:text-[#ff7a54] block tracking-wide truncate">
                                    Medical Laboratory &amp; Hematology
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 p-1 backdrop-blur-md">
                                <ThemeToggle />
                                <LanguageSwitcher />
                            </div>

                            <nav className="flex items-center gap-2">
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5e36] to-[#e04822] hover:from-[#e04822] hover:to-[#ff5e36] text-white text-xs font-bold shadow-lg shadow-[#ff5e36]/25 transition-all active:scale-95"
                                    >
                                        <span>{t('goToDashboard', 'Go to My Dashboard')}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#ff5e36] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                                        >
                                            {t('signIn', 'Sign In')}
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5e36] to-[#e04822] text-white hover:brightness-110 text-xs font-extrabold shadow-md shadow-[#ff5e36]/25 transition-all active:scale-95"
                                        >
                                            <span>{t('studentAccess', 'Student Access')}</span>
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>

                        {/* Mobile Hamburger Toggle Button */}
                        <div className="flex md:hidden items-center gap-2">
                            <ThemeToggle />
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 hover:text-rose-600 transition"
                                aria-label="Toggle Navigation Menu"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Panel — Clean, Organized, Zero Text Overlap */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-3 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                Language
                            </span>
                            <LanguageSwitcher />
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#ff5e36] to-[#e04822] text-white font-bold text-xs shadow-md"
                                >
                                    <span>{t('goToDashboard', 'Go to Dashboard')}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="flex items-center justify-center w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white font-bold text-xs"
                                    >
                                        {t('signIn', 'Sign In to Portal')}
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-gradient-to-r from-[#ff5e36] to-[#e04822] text-white font-bold text-xs shadow-md"
                                    >
                                        <span>{t('studentAccess', 'Student Registration')}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Hero Section */}
            <main className="relative z-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-14 flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    
                    {/* Left Column: Hero Text */}
                    <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                        
                        {/* Medical Science Pill Badge */}
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#ff5e36]/30 bg-[#ff5e36]/10 text-xs font-bold text-[#ff5e36] dark:text-[#ff7a54] shadow-xs backdrop-blur-md">
                            <Droplet className="w-3.5 h-3.5 text-[#ff5e36] animate-pulse" />
                            <span>Dr. Mohammad Sulieman • Medical Laboratory Academic OS</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12] font-heading">
                            Academic Cabinets for{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5e36] via-[#ff7043] to-amber-500">
                                Medical &amp; Laboratory Students.
                            </span>
                        </h1>

                        {/* Description */}
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                            Access verified clinical hematology lectures, diagnostic laboratory protocols, blood banking guidelines, and microscopic pathology case studies across Red Sea University, CITYCOT University, and University of Bosaso.
                        </p>

                        {/* Call to Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff5e36] via-[#ff7043] to-[#e04822] hover:brightness-105 text-white font-extrabold text-sm shadow-xl shadow-[#ff5e36]/30 transition-all active:scale-95 cursor-pointer"
                                >
                                    <span>{t('goToDashboard', 'Go to My Dashboard')}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff5e36] via-[#ff7043] to-[#e04822] hover:brightness-105 text-white font-extrabold text-sm shadow-xl shadow-[#ff5e36]/30 transition-all active:scale-95 cursor-pointer"
                                    >
                                        <span>{t('instructorStudentSignIn', 'Doctor & Student Sign In')}</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                                    >
                                        <span>{t('registerAsStudent', 'Register as Student')}</span>
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Partner Universities Chips */}
                        <div className="pt-3">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                                Teaching Across Partner Universities:
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                {['Red Sea University', 'CITYCOT University', 'University of Bosaso'].map((uni, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 shadow-2xs"
                                    >
                                        🏛️ {uni}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: 3D Interactive Medical Laboratory Showcase */}
                    <div className="lg:col-span-5 flex justify-center w-full">
                        <TiltCard3D
                            maxTilt={10}
                            perspective={1400}
                            scale={1.02}
                            glowColor="rgba(255, 94, 54, 0.25)"
                            className="w-full max-w-md"
                        >
                            <div className="relative overflow-hidden rounded-3xl border border-white/80 dark:border-white/15 bg-white/95 dark:bg-[#0f131f]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl ring-1 ring-slate-900/5">
                                {/* Featured Visual Banner with Official Logo */}
                                <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-sm mb-4 group/banner bg-slate-950">
                                    <img 
                                        src="/images/og-preview.jpg" 
                                        alt="Dr. Mohammad Sulieman Official Academic Portal"
                                        className="w-full h-40 object-cover object-center group-hover/banner:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-3.5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#ff5e36] animate-pulse" />
                                                <span className="text-xs font-bold text-white tracking-wide">
                                                    Official Academic Cabinets
                                                </span>
                                            </div>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#ff5e36]/30 text-white border border-[#ff5e36]/40 backdrop-blur-md">
                                                Verified Portal
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stacked Course List */}
                                <div className="space-y-2">
                                    {medicalCourses.slice(0, 3).map((c, idx) => (
                                        <div
                                            key={idx}
                                            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 hover:border-[#ff5e36]/40 transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-[10px] shadow-sm shrink-0"
                                                    style={{ backgroundColor: c.color }}
                                                >
                                                    {c.code.substring(0, 3)}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-[#ff5e36] transition-colors">
                                                        {c.title}
                                                    </h4>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                                                        {c.campus} • {c.semester}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="w-5 h-5 rounded-full bg-slate-200/60 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-[#ff5e36] group-hover:text-white transition-colors shrink-0 ml-2">
                                                <ArrowRight className="w-2.5 h-2.5" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Card Bottom Indicators */}
                                <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1.5">
                                        <Smartphone className="w-3.5 h-3.5 text-[#ff5e36]" />
                                        <span>Single-Device Protection</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>View-Only Cabinets</span>
                                    </span>
                                </div>
                            </div>
                        </TiltCard3D>
                    </div>

                </div>

                {/* Medical Laboratory Academic Feature Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-14 sm:mt-20">
                    {[
                        {
                            icon: Microscope,
                            color: '#E11D48',
                            title: 'Blood Banking & Immunohematology',
                            desc: 'ABO/Rh discrepancy resolution, compatibility crossmatching, donor screening, and component therapy.',
                        },
                        {
                            icon: FlaskConical,
                            color: '#9333EA',
                            title: 'Hematology II & Leukemias',
                            desc: 'Peripheral blood film morphology, acute/chronic leukemias, myeloproliferative neoplasms, and coagulation.',
                        },
                        {
                            icon: HeartPulse,
                            color: '#EA580C',
                            title: 'Advanced RBCs Disorders',
                            desc: 'Sickle cell disease, thalassemia electrophoresis, hemolytic anemias, and red cell enzyme deficiencies.',
                        },
                        {
                            icon: Dna,
                            color: '#0D9488',
                            title: 'Bacteriology & Quality Assurance',
                            desc: 'Diagnostic culture, antimicrobial susceptibility testing (AST), and ISO 15189 laboratory management.',
                        },
                    ].map((feat, idx) => {
                        const Icon = feat.icon;
                        return (
                            <TiltCard3D
                                key={idx}
                                maxTilt={7}
                                perspective={1000}
                                scale={1.02}
                                className="h-full"
                            >
                                <div className="h-full p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 shadow-md backdrop-blur-xl flex flex-col justify-between">
                                    <div>
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-md"
                                            style={{ backgroundColor: feat.color }}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 font-heading">
                                            {feat.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {feat.desc}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-1.5 text-[11px] font-bold text-[#ff5e36] dark:text-[#ff7a54]">
                                        <span>Clinical Course Cabinet</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </TiltCard3D>
                        );
                    })}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md py-6 text-xs text-slate-600 dark:text-slate-400">
                <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div>
                        <p className="font-medium">
                            &copy; {new Date().getFullYear()} <strong className="text-slate-900 dark:text-white">Mohammad Sulieman</strong>. All rights reserved.
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Teaching across Red Sea University &bull; CITYCOT University &bull; University of Bosaso
                        </p>
                    </div>

                    <div>
                        <a 
                            href="https://medblog.seeha.tech" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#ff5e36]/30 bg-[#ff5e36]/10 text-[#ff5e36] dark:text-[#ff7a54] hover:bg-[#ff5e36]/20 text-xs font-bold transition shadow-xs"
                        >
                            <span>Dr. Mohammad Sulieman CV &amp; Medical Blog</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
