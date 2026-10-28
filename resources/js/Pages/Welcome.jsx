import React, { useState, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import Interactive3DScene from '@/Components/Interactive3DScene';
import TiltCard3D from '@/Components/TiltCard3D';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Smartphone, 
    Laptop, 
    ShieldCheck, 
    ShieldAlert, 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    ArrowRight,
    Send,
    HelpCircle,
    XCircle,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Sparkles,
    GraduationCap,
    Shield,
    Microscope,
    FlaskConical,
    Activity,
    Award,
    Check
} from 'lucide-react';
import { useTranslation, LanguageSwitcher } from '@/Context/LanguageContext';
import { ThemeToggle } from '@/Context/ThemeContext';
import { getOrCreateDeviceToken, detectDeviceName } from '@/Utils/deviceDetector';

export default function Welcome({ status, info, canResetPassword = true, deviceBlocked }) {
    const { t } = useTranslation();
    const [detectedName, setDetectedName] = useState('Detecting device...');
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: deviceBlocked?.email || '',
        password: '',
        remember: false,
        device_token: '',
        device_name: '',
    });

    const requestForm = useForm({
        email: deviceBlocked?.email || '',
        password: '',
        device_token: deviceBlocked?.current_device_token || '',
        device_name: deviceBlocked?.current_device_name || '',
        reason: 'Replaced / Upgraded to this device',
    });

    useEffect(() => {
        const token = getOrCreateDeviceToken();
        detectDeviceName().then((name) => {
            setDetectedName(name);
            setData((prev) => ({
                ...prev,
                device_token: token,
                device_name: name,
            }));
            requestForm.setData((prev) => ({
                ...prev,
                device_token: token,
                device_name: name,
            }));
        });
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const submitDeviceRequest = (e) => {
        e.preventDefault();
        requestForm.post(route('device.request-change'), {
            onSuccess: () => {
                setShowRequestForm(false);
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b19] text-slate-800 dark:text-slate-100 selection:bg-orange-500 selection:text-white relative overflow-x-hidden flex flex-col justify-between transition-colors duration-200">
            <Head title="Student Sign In — Dr. Mohammad Sulieman Academic Portal" />

            {/* Glowing Ambient Background Orbs */}
            <div className="fixed top-0 -left-32 w-96 h-96 bg-[#ff5e36]/15 dark:bg-[#ff5e36]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
            <div className="fixed top-1/3 -right-32 w-96 h-96 bg-amber-500/10 dark:bg-amber-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="fixed -bottom-32 left-1/3 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-950/20 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* Interactive 3D Background Canvas Layer */}
            <div className="fixed inset-0 z-0 opacity-25 dark:opacity-40 pointer-events-none">
                <Interactive3DScene height="100%" interactive={true} />
            </div>

            {/* Clean, Modern Top Header */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/10 backdrop-blur-2xl bg-white/80 dark:bg-[#0b0f19]/80 shadow-xs transition-colors duration-200">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 sm:h-20 items-center justify-between">
                        {/* Brand Logo & Academic Credentials */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#ff5e36] to-amber-500 text-white shadow-lg shadow-[#ff5e36]/30">
                                <Microscope className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-base sm:text-lg font-heading tracking-tight text-slate-900 dark:text-white">
                                        Dr. Mohammad Sulieman
                                    </span>
                                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                        <Award className="w-3 h-3" />
                                        <span>MLS Portal</span>
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[240px] sm:max-w-none">
                                    Medical Laboratory Sciences &amp; Hematology Academic Cabinet
                                </p>
                            </div>
                        </div>

                        {/* Right Quick Controls */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <LanguageSwitcher />
                            <ThemeToggle />
                            <Link
                                href={route('admin.login')}
                                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-xs"
                            >
                                <Shield className="w-3.5 h-3.5" />
                                <span>Instructor Portal</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Central Container: Direct Student Login Screen */}
            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
                <div className="w-full max-w-md mx-auto">
                    <TiltCard3D
                        maxTilt={6}
                        perspective={1200}
                        scale={1.01}
                        glare={true}
                        glowColor="rgba(255, 94, 54, 0.15)"
                        className="w-full"
                    >
                        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/95 dark:bg-slate-900/85 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300">
                            {/* Accent Gradient Line */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-indigo-500" />

                            {/* Card Header */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-600 dark:text-orange-400 mb-3 backdrop-blur-md">
                                    <GraduationCap className="w-3.5 h-3.5 text-orange-500" />
                                    <span>Student Portal Access</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
                                    Student Sign In
                                </h2>
                                <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    Enter your enrolled credentials to access course cabinets &amp; assignments
                                </p>
                            </div>

                            {/* REGISTRATION PENDING CONFIRMATION / STATUS FLASH ALERT */}
                            {status && (
                                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-start gap-3 backdrop-blur-md shadow-lg shadow-emerald-500/5 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                                    <div className="space-y-1">
                                        <span className="font-bold block text-sm text-emerald-950 dark:text-white">
                                            Awaiting Administrator Approval
                                        </span>
                                        <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed font-normal">
                                            {status}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Info Alert */}
                            {info && (
                                <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2.5 backdrop-blur-md">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                    <span>{info}</span>
                                </div>
                            )}

                            {/* UNREGISTERED DEVICE BLOCK WARNING */}
                            {deviceBlocked && (
                                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 shadow-xl backdrop-blur-md animate-in fade-in duration-200">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500 shrink-0 mt-0.5 border border-rose-500/30">
                                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {t('unregisteredDeviceTitle', 'Unregistered Device Detected')}
                                            </h3>
                                            <p className="text-xs text-rose-700 dark:text-rose-200/90 mt-1 leading-relaxed">
                                                {t('unregisteredDeviceDesc', 'This student account is locked to your primary registered device for academic integrity.')}
                                            </p>

                                            {/* Device Comparison Card */}
                                            <div className="mt-3 p-3 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                                                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                                        {t('currentDevice', 'This Device')}:
                                                    </span>
                                                    <span className="font-bold text-rose-700 dark:text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 truncate max-w-[180px]">
                                                        {deviceBlocked.current_device_name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/5">
                                                    <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                        {t('registeredDevice', 'Registered Device')}:
                                                    </span>
                                                    <span className="font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-[180px]">
                                                        {deviceBlocked.registered_device_name}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Pending Device Authorization Notification */}
                                            {deviceBlocked.has_pending_request ? (
                                                <div className="mt-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-700 dark:text-indigo-300 flex items-start gap-2">
                                                    <Clock className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
                                                    <div>
                                                        <span className="font-bold block text-slate-900 dark:text-white">
                                                            {t('pendingDeviceRequestTitle', 'Device Switch Request Under Review')}
                                                        </span>
                                                        <span className="text-[11px] text-indigo-600 dark:text-indigo-200">
                                                            {t('pendingDeviceRequestDesc', 'Your request to authorize')} <strong>"{deviceBlocked.pending_device_name}"</strong> {t('isAwaitingApproval', 'is waiting for instructor authorization.')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-3 pt-3 border-t border-rose-500/20">
                                                    {!showRequestForm ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowRequestForm(true)}
                                                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                                                        >
                                                            <Smartphone className="w-3.5 h-3.5" />
                                                            <span>{t('requestDeviceSwitch', 'Request Authorization For This Device')}</span>
                                                        </button>
                                                    ) : (
                                                        <form onSubmit={submitDeviceRequest} className="space-y-3">
                                                            <div>
                                                                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                                    {t('reasonForDeviceChange', 'Reason for device change')}
                                                                </label>
                                                                <textarea
                                                                    rows={2}
                                                                    value={requestForm.data.reason}
                                                                    onChange={(e) => requestForm.setData('reason', e.target.value)}
                                                                    placeholder="e.g. My old phone broke, upgraded to this new phone..."
                                                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setShowRequestForm(false)}
                                                                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    disabled={requestForm.processing}
                                                                    className="flex-1 py-1.5 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-sm"
                                                                >
                                                                    {requestForm.processing ? 'Submitting...' : 'Submit Request to Admin'}
                                                                </button>
                                                            </div>
                                                        </form>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Student Login Form */}
                            <form onSubmit={submit} className="space-y-4">
                                {/* Hardware Lock Indicator Badge */}
                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2 truncate">
                                        <Smartphone className="w-4 h-4 text-orange-500 shrink-0" />
                                        <div className="truncate">
                                            <span className="font-semibold text-slate-900 dark:text-white truncate block">
                                                {detectedName}
                                            </span>
                                            <span className="text-[10px] text-slate-400">
                                                Single-Device Protection Active
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                                        <ShieldCheck className="w-3 h-3" />
                                        <span>Verified</span>
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('email', 'Student Email Address')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={data.email}
                                            autoComplete="username"
                                            autoFocus
                                            placeholder="student@university.edu"
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-xs"
                                            required
                                        />
                                    </div>
                                    <InputError message={errors.email} className="mt-1.5" />
                                </div>

                                {/* Password Field */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                            {t('password', 'Password')}
                                        </label>
                                        {canResetPassword && (
                                            <Link
                                                href={route('password.request')}
                                                className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-500 hover:underline font-semibold"
                                            >
                                                {t('forgotPassword', 'Forgot password?')}
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="w-full pl-10 pr-10 py-3 text-sm bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all shadow-xs"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1.5" />
                                </div>

                                {/* Remember Me & Security SSL */}
                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center cursor-pointer select-none">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="rounded border-slate-300 dark:border-white/20 bg-white dark:bg-slate-900 text-orange-500 focus:ring-orange-500/30"
                                        />
                                        <span className="ms-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                                            {t('rememberMe', 'Remember this device')}
                                        </span>
                                    </label>
                                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>256-bit SSL</span>
                                    </span>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-px font-bold text-white shadow-xl shadow-orange-500/25 transition-all duration-300 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                                    >
                                        <div className="relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 py-3.5 px-4">
                                            {processing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>{t('loggingIn', 'Authenticating...')}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{t('logIn', 'Authenticate to Cabinet')}</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </div>
                            </form>

                            {/* INSTRUCTOR / FACULTY PORTAL LOGIN (ALWAYS AS BUTTON BELOW) */}
                            <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 text-center">
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-2.5">
                                    Professor, Lecturer, or System Administrator?
                                </span>
                                <Link
                                    href={route('admin.login')}
                                    className="inline-flex items-center justify-center gap-2.5 w-full py-3.5 px-4 rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-50 dark:from-indigo-950/60 via-purple-50 dark:via-purple-950/40 to-slate-100 dark:to-slate-900/60 hover:from-indigo-100 dark:hover:from-indigo-900/80 hover:to-purple-100 dark:hover:to-purple-900/70 text-indigo-700 dark:text-indigo-200 hover:text-indigo-950 dark:hover:text-white text-xs font-bold transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] group backdrop-blur-md"
                                >
                                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                                    <span>Instructor &amp; Faculty Portal Sign In</span>
                                    <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {/* Student Registration Callout */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Don't have an enrolled account?{' '}
                                    <Link
                                        href={route('register')}
                                        className="font-bold text-orange-600 dark:text-orange-400 hover:text-orange-500 hover:underline transition"
                                    >
                                        Register as Student &rarr;
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </TiltCard3D>
                </div>
            </main>

            {/* Bottom Footer */}
            <footer className="relative z-10 w-full py-4 px-4 text-center border-t border-slate-200/60 dark:border-white/5 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    &copy; {new Date().getFullYear()} Dr. Mohammad Sulieman • Medical Laboratory &amp; Hematology Academic Portal • All Rights Reserved.
                </p>
            </footer>
        </div>
    );
}
