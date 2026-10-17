import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useTranslation, LanguageSwitcher } from '@/Context/LanguageContext';

export default function PendingApproval() {
    const { auth } = usePage().props;
    const { post, processing } = useForm();
    const { t } = useTranslation();

    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
            <Head title={t('registrationUnderReview')} />

            {/* Language Switcher in top corner */}
            <div className="absolute top-6 right-6 z-20">
                <LanguageSwitcher className="bg-slate-900 border-slate-800" />
            </div>

            {/* Background Decorative Glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="w-full max-w-lg z-10">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl p-8 sm:p-10 text-center relative">
                    {/* Glowing animated badge */}
                    <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-20" />
                        <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                        {t('registrationUnderReview')}
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                        {t('welcomeBack')}, <span className="text-indigo-400 font-semibold">{auth?.user?.name}</span>! {t('pendingNotice')}
                    </p>

                    {/* Account Details Box */}
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 mb-6 text-left space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between py-1 border-b border-slate-800/50">
                            <span className="text-slate-500">{t('studentId')}:</span>
                            <span className="text-slate-200 font-mono font-medium">{auth?.user?.student_id_no || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/50">
                            <span className="text-slate-500">{t('registeredEmail')}:</span>
                            <span className="text-slate-200 font-medium">{auth?.user?.email}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/50">
                            <span className="text-slate-500">{t('academicTerm')}:</span>
                            <span className="text-slate-200">{auth?.user?.semester || 'Fall 2026'} ({auth?.user?.year || 'Current'})</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-slate-500">{t('status')}:</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                {t('awaitingInstructorApproval')}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={handleRefresh}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white font-bold text-sm transition-all shadow-lg shadow-[#ff5e36]/25 active:scale-95"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {t('checkStatusNow')}
                        </button>
                        <button
                            onClick={handleLogout}
                            disabled={processing}
                            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-sm transition-all border border-slate-700 active:scale-95"
                        >
                            {t('logOut')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
