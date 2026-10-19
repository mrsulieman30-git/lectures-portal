import React, { useState } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import Interactive3DScene from '@/Components/Interactive3DScene';
import TiltCard3D from '@/Components/TiltCard3D';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Shield, 
    ShieldAlert, 
    Lock, 
    Mail, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    ArrowLeft, 
    CheckCircle2, 
    AlertTriangle,
    KeyRound
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

export default function AdminLogin({ status, info, canResetPassword }) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Faculty & Staff Login — Portal Administration" />

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
                    glowColor="rgba(99, 102, 241, 0.2)"
                    className="w-full"
                >
                    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-900/85 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 transition-all duration-300">
                        {/* Top Accent Gradient Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500" />

                        {/* Card Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-3 backdrop-blur-md">
                                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Faculty &amp; Staff Console</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black font-heading text-white tracking-tight">
                                Instructor Sign In
                            </h2>
                            <p className="mt-1 text-xs text-slate-400 font-medium">
                                Secure access for professors, instructors, and administrators
                            </p>
                        </div>

                        {/* Status Flash Alert */}
                        {status && (
                            <div className="mb-5 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-2.5 backdrop-blur-md">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Info Flash Alert */}
                        {info && (
                            <div className="mb-5 p-3 rounded-2xl bg-amber-950/60 border border-amber-500/30 text-xs font-semibold text-amber-300 flex items-center gap-2.5 backdrop-blur-md">
                                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                <span>{info}</span>
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Email Field */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                                    <span>Faculty / Administrator Email</span>
                                    <span className="text-[10px] text-slate-500 font-mono">STAFF</span>
                                </label>
                                <div className="relative rounded-2xl border border-white/10 bg-slate-950/70 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="admin_email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        placeholder="dr.sulieman@university.edu"
                                        className="w-full rounded-2xl border-0 bg-transparent py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:ring-0 focus:outline-none"
                                        autoComplete="username"
                                        autoFocus
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
                                        Password
                                    </label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-[11px] text-indigo-400 hover:text-indigo-300 hover:underline transition"
                                        >
                                            Forgot Password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative rounded-2xl border border-white/10 bg-slate-950/70 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="admin_password"
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
                                        className="rounded border-white/20 bg-slate-900 text-indigo-500 focus:ring-indigo-500/30"
                                    />
                                    <span className="ms-2 text-xs text-slate-300">
                                        Remember session
                                    </span>
                                </label>
                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                    <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Faculty Keyring</span>
                                </span>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-px font-bold text-white shadow-xl shadow-indigo-600/30 transition-all duration-300 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                                >
                                    <div className="relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-3.5 px-4">
                                        {processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>Verifying Credentials...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In to Admin Console</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>
                        </form>

                        {/* Link back to Student Portal */}
                        <div className="mt-6 pt-5 border-t border-white/10 text-center">
                            <span className="text-[11px] text-slate-400 font-medium block mb-2">
                                Are you a registered student?
                            </span>
                            <Link
                                href={route('login')}
                                className="inline-flex items-center justify-center gap-2 text-xs font-bold text-orange-400 hover:text-orange-300 hover:underline transition"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>Go to Student Portal Login</span>
                            </Link>
                        </div>
                    </div>
                </TiltCard3D>
            </div>
        </GuestLayout>
    );
}
