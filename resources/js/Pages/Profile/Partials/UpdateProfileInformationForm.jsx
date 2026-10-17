import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, Camera, CheckCircle2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);

    const [previewUrl, setPreviewUrl] = useState(null);
    const [imgLoadError, setImgLoadError] = useState(false);
    const [avatarProcessing, setAvatarProcessing] = useState(false);
    const [avatarError, setAvatarError] = useState(null);
    const [avatarSuccess, setAvatarSuccess] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            gender: user.gender || 'male',
        });

    const handleAvatarSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset status
        setAvatarError(null);
        setAvatarSuccess(false);
        setImgLoadError(false);

        // Validation
        if (!file.type.startsWith('image/')) {
            setAvatarError('Please select a valid image file (JPG, PNG, WEBP, or GIF).');
            return;
        }

        if (file.size > 4 * 1024 * 1024) {
            setAvatarError('Image size must be less than 4MB.');
            return;
        }

        // Show instant preview
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        // Upload
        const formData = new FormData();
        formData.append('avatar', file);

        setAvatarProcessing(true);
        router.post(route('profile.avatar'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setAvatarProcessing(false);
                setAvatarSuccess(true);
                setTimeout(() => setAvatarSuccess(false), 4000);
            },
            onError: (err) => {
                setAvatarProcessing(false);
                setPreviewUrl(null);
                setAvatarError(err.avatar || 'Failed to upload profile picture. Please try again.');
            },
        });
    };

    const handleDeleteAvatar = () => {
        if (!confirm('Are you sure you want to remove your profile picture?')) return;

        setAvatarProcessing(true);
        setAvatarError(null);
        setAvatarSuccess(false);

        router.delete(route('profile.avatar.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                setAvatarProcessing(false);
                setPreviewUrl(null);
                setAvatarSuccess(true);
                setTimeout(() => setAvatarSuccess(false), 4000);
            },
            onError: () => {
                setAvatarProcessing(false);
                setAvatarError('Failed to remove profile picture.');
            },
        });
    };

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    const isFemale = user.gender === 'female';

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Profile Information
                </h2>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Update your account's profile photo, details, and gender personalization.
                </p>
            </header>

            {/* Profile Picture Upload Card */}
            <div className="mt-6 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-900 shadow-md bg-gradient-to-tr from-[#ff5e36] to-[#ff416c] flex items-center justify-center text-white text-3xl font-extrabold select-none">
                        {(previewUrl || user.avatar_url) && !imgLoadError ? (
                            <img
                                src={previewUrl || user.avatar_url}
                                alt={user.name}
                                onError={() => setImgLoadError(true)}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center text-white ${
                                isFemale && user.role !== 'admin'
                                    ? 'bg-gradient-to-tr from-rose-500 to-pink-500'
                                    : 'bg-gradient-to-tr from-[#ff5e36] to-[#ff416c]'
                            }`}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <label
                        htmlFor="avatar-upload-input"
                        className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-[2px]"
                        title="Upload new profile picture"
                    >
                        <Camera className="w-6 h-6" />
                        <span className="text-[10px] font-bold mt-1">Change</span>
                    </label>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                            Profile Picture
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Upload your portrait (JPG, PNG, or WEBP, max 4MB). It will appear across the portal header and assignments.
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        id="avatar-upload-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarSelect}
                    />

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarProcessing}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#ff5e36] to-[#e04822] shadow-sm shadow-[#ff5e36]/30 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{avatarProcessing ? 'Uploading...' : 'Upload Photo'}</span>
                        </button>

                        {(user.avatar_url || previewUrl) && (
                            <button
                                type="button"
                                onClick={handleDeleteAvatar}
                                disabled={avatarProcessing}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                            </button>
                        )}
                    </div>

                    {avatarError && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{avatarError}</span>
                        </div>
                    )}
                    {avatarSuccess && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Profile picture updated successfully!</span>
                        </div>
                    )}
                </div>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-6">
                {user.pending_name && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-3">
                        <div className="mt-0.5 p-1 rounded-full bg-amber-200/60 dark:bg-amber-800 text-amber-900 dark:text-amber-100 shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                                Official Name Change Pending Verification
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                You requested to update your name to <strong className="font-bold text-amber-950 dark:text-white">"{user.pending_name}"</strong>. This is awaiting authorization from your professor.
                            </p>
                        </div>
                    </div>
                )}

                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    {user.role === 'student' && (
                        <p className="text-[11px] text-slate-500 mt-1">
                            Note: Since you are registered as a student, official name modifications require instructor review.
                        </p>
                    )}

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                {/* Gender Personalization */}
                <div>
                    <InputLabel value="Gender & Theme Accent" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-2.5">
                        Select your gender to customize lecture preview tabs and status highlights.
                    </p>

                    <div className="grid grid-cols-2 gap-3 max-w-md">
                        <button
                            type="button"
                            onClick={() => setData('gender', 'male')}
                            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                                data.gender === 'male'
                                    ? 'bg-orange-50 dark:bg-orange-950/40 border-[#ff5e36] ring-2 ring-[#ff5e36]/30 shadow-sm'
                                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ff5e36] to-[#ff9900] text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-[#ff5e36]/30">
                                    M
                                </span>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Male</div>
                                    <div className="text-[11px] text-orange-600 dark:text-orange-400 font-medium">Nimbuzz Coral</div>
                                </div>
                            </div>
                            {data.gender === 'male' && (
                                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5e36]" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setData('gender', 'female')}
                            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                                data.gender === 'female'
                                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/30 shadow-sm'
                                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-rose-500/30">
                                    F
                                </span>
                                <div>
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">Female</div>
                                    <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">Rose Blossom</div>
                                </div>
                            </div>
                            {data.gender === 'female' && (
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            )}
                        </button>
                    </div>

                    <InputError className="mt-2" message={errors.gender} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
