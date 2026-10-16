import React, { useState, useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import Interactive3DScene from '@/Components/Interactive3DScene';
import TiltCard3D from '@/Components/TiltCard3D';
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
    Shield
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';
import { getOrCreateDeviceToken, detectDeviceName } from '@/Utils/deviceDetector';

export default function Login({ status, canResetPassword, deviceBlocked }) {
    const { t } = useTranslation();
    const [detectedName, setDetectedName] = useState('Scanning Hardware...');
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'instructor'

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
        reason: 'Replaced / Upgraded to this phone',
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

    const handleQuickFill = (role) => {
        setSelectedRole(role);
        if (role === 'student') {
            setData((prev) => ({
                ...prev,
                email: 'alex.hayes@utas.edu',
                password: 'password',
            }));
        } else {
            setData((prev) => ({
                ...prev,
                email: 'admin@portal.com',
                password: 'password',
            }));
        }
    };

    return (
        <GuestLayout>
            <Head title={t('logIn', 'Portal Login')} />

            {/* Interactive 3D Background Canvas */}
            <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
                <Interactive3DScene height="100%" interactive={true} />
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto">
                <TiltCard3D
                    maxTilt={7}
                    perspective={1200}
                    scale={1.01}
                    glare={true}
                    glowColor="rgba(255, 94, 54, 0.15)"
                    className="w-full"
                >
                    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/75 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 transition-all duration-300">
                        {/* Top Accent Gradient Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-indigo-500" />

                        {/* Card Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400 mb-3 backdrop-blur-md">
                                <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />
                                <span>Academic OS Authentication</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="mt-1 text-xs text-slate-400 font-medium">
                                Sign in with your registered university credentials
                            </p>
                        </div>

                        {/* Role Switcher Pill Tabs */}
                        <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-slate-950/60 p-1 border border-white/10 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => handleQuickFill('student')}
                                className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 transition-all duration-200 ${
                                    selectedRole === 'student'
                                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 ring-1 ring-white/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <GraduationCap className="w-4 h-4" />
                                <span>Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickFill('instructor')}
                                className={`flex items-center justify-center gap-2 rounded-xl py-2 px-3 transition-all duration-200 ${
                                    selectedRole === 'instructor'
                                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-white/20'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Shield className="w-4 h-4" />
                                <span>Faculty / Admin</span>
                            </button>
                        </div>

                        {/* Status Flash Alert */}
                        {status && (
                            <div className="mb-5 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2.5 backdrop-blur-md">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* UNREGISTERED DEVICE BLOCK WARNING */}
                        {deviceBlocked && (
                            <div className="mb-6 p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 shadow-xl backdrop-blur-md animate-in fade-in duration-200">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 border border-rose-500/30">
                                        <ShieldAlert className="w-5 h-5 text-rose-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-bold text-white">
                                            {t('unregisteredDeviceTitle', 'Unregistered Device Detected')}
                                        </h3>
                                        <p className="text-xs text-rose-200/90 mt-1 leading-relaxed">
                                            {t('unregisteredDeviceDesc', 'This student account is strictly locked to your registered device. You are attempting to log in from an unauthorized device.')}
                                        </p>

                                        {/* Device Breakdown Card */}
                                        <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-white/10 space-y-2 text-xs">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                                    {t('currentDevice', 'This Device')}:
                                                </span>
                                                <span className="font-bold text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 truncate max-w-[180px]">
                                                    {deviceBlocked.current_device_name}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                                                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                                    {t('registeredDevice', 'Registered Device')}:
                                                </span>
                                                <span className="font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 truncate max-w-[180px]">
                                                    {deviceBlocked.registered_device_name}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Pending Request Notification */}
                                        {deviceBlocked.has_pending_request ? (
                                            <div className="mt-3 p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-300 flex items-start gap-2">
                                                <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                                                <div>
                                                    <span className="font-bold block text-white">
                                                        {t('pendingDeviceRequestTitle', 'Device Switch Request Under Review')}
                                                    </span>
                                                    <span className="text-[11px] text-indigo-200">
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
                                                    <form onSubmit={submitDeviceRequest} className="space-y-3 pt-1">
                                                        <div className="text-xs font-bold text-white flex items-center justify-between">
                                                            <span>{t('requestDeviceChangeTitle', 'Submit Device Switch Request')}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowRequestForm(false)}
                                                                className="text-[10px] text-slate-400 hover:text-white underline font-semibold"
                                                            >
                                                                {t('cancel', 'Cancel')}
                                                            </button>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                                {t('reasonForSwitch', 'Reason for Device Change')}
                                                            </label>
                                                            <select
                                                                value={requestForm.data.reason}
                                                                onChange={(e) => requestForm.setData('reason', e.target.value)}
                                                                className="w-full text-xs rounded-xl bg-slate-900 border-white/10 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 py-2 px-2.5"
                                                            >
                                                                <option value="Replaced / Upgraded to this phone">
                                                                    {t('reasonUpgrade', 'Replaced / Upgraded to this new device')}
                                                                </option>
                                                                <option value="Old phone was lost or stolen">
                                                                    {t('reasonLost', 'Previous device was lost or stolen')}
                                                                </option>
                                                                <option value="Old phone is damaged or broken">
                                                                    {t('reasonBroken', 'Previous device screen/hardware is broken')}
                                                                </option>
                                                                <option value="Temporary laptop or tablet for study">
                                                                    {t('reasonLaptop', 'Temporary computer / tablet for study')}
                                                                </option>
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                                                                {t('confirmPassword', 'Confirm Your Password')}
                                                            </label>
                                                            <input
                                                                type="password"
                                                                placeholder="Enter your student password..."
                                                                value={requestForm.data.password}
                                                                onChange={(e) => requestForm.setData('password', e.target.value)}
                                                                required
                                                                className="w-full text-xs rounded-xl bg-slate-900 border-white/10 text-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 py-2 px-2.5"
                                                            />
                                                            <InputError message={requestForm.errors.password} className="mt-1" />
                                                        </div>

                                                        <button
                                                            type="submit"
                                                            disabled={requestForm.processing}
                                                            className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                                                        >
                                                            <Send className="w-3.5 h-3.5" />
                                                            <span>{requestForm.processing ? t('submitting', 'Submitting...') : t('submitForApproval', 'Submit Request to Professor')}</span>
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Standard Login Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Detected Hardware Security Chip */}
                            <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-white/10 flex items-center justify-between text-xs backdrop-blur-md">
                                <span className="flex items-center gap-2 text-slate-400 font-medium">
                                    <Smartphone className="w-3.5 h-3.5 text-orange-400" />
                                    <span>Hardware Profile:</span>
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="font-bold text-white text-[11px] truncate max-w-[160px]">
                                        {detectedName}
                                    </span>
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                                    <span>{t('registeredEmail', 'Email Address')}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">UTF-8</span>
                                </label>
                                <div className="relative rounded-2xl border border-white/10 bg-slate-950/70 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        placeholder="your.email@university.edu"
                                        className="w-full rounded-2xl border-0 bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
                                        autoComplete="username"
                                        autoFocus={!deviceBlocked}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1.5 text-xs text-rose-400" />
                            </div>

                            {/* Password Field */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-slate-300">
                                        {t('password', 'Password')}
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-[11px] text-orange-400 hover:text-orange-300 hover:underline transition"
                                        >
                                            {t('forgotPassword', 'Forgot Password?')}
                                        </Link>
                                    )}
                                </div>
                                <div className="relative rounded-2xl border border-white/10 bg-slate-950/70 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        placeholder="••••••••••••"
                                        className="w-full rounded-2xl border-0 bg-transparent py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white transition"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1.5 text-xs text-rose-400" />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-white/20 bg-slate-900 text-orange-500 focus:ring-orange-500/30"
                                    />
                                    <span className="ms-2 text-xs text-slate-300">
                                        {t('rememberMe', 'Remember this device')}
                                    </span>
                                </label>
                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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

                        {/* Demo Quick-Fill Buttons */}
                        <div className="mt-6 pt-5 border-t border-white/10 text-center">
                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2.5">
                                Quick Demo Logins
                            </span>
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('student')}
                                    className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/30 transition flex items-center gap-1.5"
                                >
                                    <GraduationCap className="w-3.5 h-3.5 text-orange-400" />
                                    <span>Alex (Student)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleQuickFill('instructor')}
                                    className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 hover:border-indigo-500/30 transition flex items-center gap-1.5"
                                >
                                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Professor (Admin)</span>
                                </button>
                            </div>
                        </div>

                        {/* Register Link */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-slate-400">
                                Don't have an enrolled account?{' '}
                                <Link
                                    href={route('register')}
                                    className="font-bold text-orange-400 hover:text-orange-300 hover:underline transition"
                                >
                                    Register as Student
                                </Link>
                            </p>
                        </div>
                    </div>
                </TiltCard3D>
            </div>
        </GuestLayout>
    );
}
