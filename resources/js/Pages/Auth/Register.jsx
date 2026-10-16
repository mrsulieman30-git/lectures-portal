import React, { useState } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import TiltCard3D from '@/Components/TiltCard3D';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    User, 
    Mail, 
    Lock, 
    Eye, 
    EyeOff, 
    Building2, 
    BadgeCheck, 
    GraduationCap, 
    Calendar, 
    Clock, 
    ShieldCheck, 
    ArrowRight,
    Sparkles
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

export default function Register({ universities = [] }) {
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'student',
        gender: 'male',
        university_id: universities[0]?.id || '',
        student_id_no: '',
        semester: 'Semester 5',
        year: 'Year 3',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title={t('studentRegistrationTitle', 'Medical Student Registration')} />

            <div className="relative z-10 w-full max-w-xl mx-auto my-4">
                <TiltCard3D
                    maxTilt={5}
                    perspective={1400}
                    scale={1.01}
                    glare={true}
                    glowColor="rgba(244, 63, 94, 0.18)"
                    className="w-full"
                >
                    <div className="relative overflow-hidden rounded-3xl border border-white/80 dark:border-white/10 bg-white/90 dark:bg-slate-900/85 p-6 sm:p-9 shadow-2xl backdrop-blur-2xl ring-1 ring-slate-900/5 transition-all">
                        {/* Top Accent Gradient Bar - Hematology Rose/Amber */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-coral-500 to-amber-500" />

                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 mb-2">
                                <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
                                <span>{t('studentRegistrationTitle', 'Medical Student Registration')}</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
                                {t('registerAsStudent', 'Register as New Student')}
                            </h2>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                                {t('studentRegistrationSubtitle', "Join Dr. Mohammad Sulieman's official academic course cabinets & laboratory resources.")}
                            </p>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={submit} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                    {t('fullName', 'Full Name')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        placeholder={t('fullNamePlaceholder', 'Enter your full name')}
                                        className="w-full rounded-2xl border-0 bg-transparent py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none"
                                        autoComplete="name"
                                        autoFocus
                                        required
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.name} className="mt-1 text-xs text-rose-500" />
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                    {t('emailAddress', 'University / Personal Email')} <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        placeholder={t('emailPlaceholder', 'student@university.edu')}
                                        className="w-full rounded-2xl border-0 bg-transparent py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none"
                                        autoComplete="username"
                                        required
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                </div>
                                <InputError message={errors.email} className="mt-1 text-xs text-rose-500" />
                            </div>

                            {/* Passwords Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                        {t('password', 'Password')} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                            <Lock className="w-3.5 h-3.5" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            placeholder="••••••••"
                                            className="w-full rounded-2xl border-0 bg-transparent py-2.5 pl-9 pr-9 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none"
                                            autoComplete="new-password"
                                            required
                                            onChange={(e) => setData('password', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="mt-1 text-xs text-rose-500" />
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                        {t('passwordConfirmation', 'Confirm Password')} <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                            <Lock className="w-3.5 h-3.5" />
                                        </div>
                                        <input
                                            id="password_confirmation"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password_confirmation"
                                            value={data.password_confirmation}
                                            placeholder="••••••••"
                                            className="w-full rounded-2xl border-0 bg-transparent py-2.5 pl-9 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none"
                                            autoComplete="new-password"
                                            required
                                            onChange={(e) => setData('password_confirmation', e.target.value)}
                                        />
                                    </div>
                                    <InputError message={errors.password_confirmation} className="mt-1 text-xs text-rose-500" />
                                </div>
                            </div>

                            {/* Academic Credentials Section */}
                            <div className="pt-2 border-t border-slate-200/80 dark:border-white/10">
                                <span className="text-[11px] font-bold tracking-wider text-rose-600 dark:text-rose-400 uppercase block mb-3">
                                    Academic Affiliation & Course Level
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* University Select */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                            {t('selectUniversity', 'Select Your University')} <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                                <Building2 className="w-4 h-4 text-rose-500" />
                                            </div>
                                            <select
                                                id="university_id"
                                                name="university_id"
                                                value={data.university_id}
                                                className="w-full rounded-2xl border-0 bg-transparent py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-0 focus:outline-none font-medium"
                                                required
                                                onChange={(e) => setData('university_id', e.target.value)}
                                            >
                                                <option value="" disabled className="text-slate-500 dark:bg-slate-900">
                                                    {t('chooseUniversityPrompt', '-- Select University --')}
                                                </option>
                                                {universities.length > 0 ? (
                                                    universities.map((uni) => (
                                                        <option key={uni.id} value={uni.id} className="text-slate-900 dark:bg-slate-900 dark:text-white">
                                                            {uni.name}
                                                        </option>
                                                    ))
                                                ) : (
                                                    <>
                                                        <option value="1" className="dark:bg-slate-900">Red Sea University</option>
                                                        <option value="2" className="dark:bg-slate-900">CITYCOT University</option>
                                                        <option value="3" className="dark:bg-slate-900">University of Bosaso</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        <InputError message={errors.university_id} className="mt-1 text-xs text-rose-500" />
                                    </div>

                                    {/* Student ID Number */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                            {t('studentIdNumber', 'Student ID Number')} <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <BadgeCheck className="w-3.5 h-3.5" />
                                            </div>
                                            <input
                                                id="student_id_no"
                                                type="text"
                                                name="student_id_no"
                                                value={data.student_id_no}
                                                placeholder={t('studentIdPlaceholder', 'e.g. RSU-2024-8841')}
                                                className="w-full rounded-2xl border-0 bg-transparent py-2.5 pl-9 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 focus:outline-none"
                                                required
                                                onChange={(e) => setData('student_id_no', e.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.student_id_no} className="mt-1 text-xs text-rose-500" />
                                    </div>

                                    {/* Semester Select */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                            {t('academicSemester', 'Semester')} <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <Clock className="w-3.5 h-3.5" />
                                            </div>
                                            <select
                                                id="semester"
                                                name="semester"
                                                value={data.semester}
                                                className="w-full rounded-2xl border-0 bg-transparent py-2.5 pl-9 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-0 focus:outline-none font-medium"
                                                required
                                                onChange={(e) => setData('semester', e.target.value)}
                                            >
                                                <option value="Semester 3" className="dark:bg-slate-900">Semester 3</option>
                                                <option value="Semester 5" className="dark:bg-slate-900">Semester 5</option>
                                                <option value="Semester 7" className="dark:bg-slate-900">Semester 7</option>
                                            </select>
                                        </div>
                                        <InputError message={errors.semester} className="mt-1 text-xs text-rose-500" />
                                    </div>

                                    {/* Year Select */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                            {t('academicYear', 'Academic Year')} <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                                <GraduationCap className="w-3.5 h-3.5" />
                                            </div>
                                            <select
                                                id="year"
                                                name="year"
                                                value={data.year}
                                                className="w-full rounded-2xl border-0 bg-transparent py-2.5 pl-9 pr-4 text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-0 focus:outline-none font-medium"
                                                required
                                                onChange={(e) => setData('year', e.target.value)}
                                            >
                                                <option value="Year 2" className="dark:bg-slate-900">{t('year2', 'Year 2 (Second Year)')}</option>
                                                <option value="Year 3" className="dark:bg-slate-900">{t('year3', 'Year 3 (Third Year)')}</option>
                                                <option value="Year 4" className="dark:bg-slate-900">{t('year4', 'Year 4 (Fourth Year / Final)')}</option>
                                            </select>
                                        </div>
                                        <InputError message={errors.year} className="mt-1 text-xs text-rose-500" />
                                    </div>

                                    {/* Gender Select */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                                            {t('selectGender', 'Gender')}
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setData('gender', 'male')}
                                                className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                    data.gender === 'male'
                                                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/30'
                                                        : 'border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400'
                                                }`}
                                            >
                                                <span>👨</span>
                                                <span>{t('maleGender', 'Male')}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setData('gender', 'female')}
                                                className={`py-2 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                                                    data.gender === 'female'
                                                        ? 'border-pink-500 bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 ring-1 ring-pink-500/30'
                                                        : 'border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400'
                                                }`}
                                            >
                                                <span>👩</span>
                                                <span>{t('femaleGender', 'Female')}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Notice */}
                            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-slate-700 dark:text-amber-200 text-xs flex items-start gap-2.5">
                                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <p className="leading-relaxed text-[11px]">
                                    {t('registrationApprovalNote', 'Registration Notice: All new student accounts are verified and approved by Dr. Mohammad Sulieman before course access is granted.')}
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-coral-500 to-rose-600 p-px font-bold text-white shadow-xl shadow-rose-500/25 transition-all duration-300 hover:shadow-rose-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                                >
                                    <div className="relative flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-coral-500 to-rose-600 py-3.5 px-4">
                                        {processing ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span>{t('registeringAccountBtn', 'Submitting Registration...')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{t('registerAccountBtn', 'Complete Registration')}</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </div>
                                </button>
                            </div>

                            {/* Existing Account Link */}
                            <div className="pt-3 text-center">
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {t('alreadyHaveAccount', 'Already have an approved account?')}{' '}
                                    <Link
                                        href={route('login')}
                                        className="font-bold text-rose-600 dark:text-rose-400 hover:underline transition"
                                    >
                                        {t('signInHere', 'Sign in here')}
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </TiltCard3D>
            </div>
        </GuestLayout>
    );
}
