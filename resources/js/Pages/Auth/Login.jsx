import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Smartphone, 
    Laptop, 
    ShieldAlert, 
    AlertTriangle, 
    CheckCircle2, 
    Clock, 
    ArrowRight,
    Send,
    HelpCircle,
    XCircle
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';
import { getOrCreateDeviceToken, detectDeviceName } from '@/Utils/deviceDetector';

export default function Login({ status, canResetPassword, deviceBlocked }) {
    const { t } = useTranslation();
    const [detectedName, setDetectedName] = useState('Detecting device...');
    const [showRequestForm, setShowRequestForm] = useState(false);

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

    return (
        <GuestLayout>
            <Head title={t('logIn', 'Log in')} />

            {/* General Status Flash */}
            {status && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{status}</span>
                </div>
            )}

            {/* UNREGISTERED DEVICE BLOCK WARNING */}
            {deviceBlocked && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200/90 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                            <ShieldAlert className="w-5 h-5 text-amber-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-amber-950">
                                {t('unregisteredDeviceTitle', 'Unregistered Device Detected')}
                            </h3>
                            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                {t('unregisteredDeviceDesc', 'This student account is strictly locked to your registered device. You are attempting to log in from an unauthorized device.')}
                            </p>

                            {/* Device Breakdown Card */}
                            <div className="mt-3 p-3 rounded-xl bg-white/80 border border-amber-200/80 space-y-2 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                                        {t('currentDevice', 'This Device')}:
                                    </span>
                                    <span className="font-bold text-slate-800 bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200/60 truncate max-w-[180px]">
                                        {deviceBlocked.current_device_name}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-100">
                                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        {t('registeredDevice', 'Your Registered Device')}:
                                    </span>
                                    <span className="font-bold text-slate-800 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200/60 truncate max-w-[180px]">
                                        {deviceBlocked.registered_device_name}
                                    </span>
                                </div>
                            </div>

                            {/* Instruction */}
                            <p className="text-[11px] text-amber-700 font-medium mt-2.5">
                                👉 {t('useRegisteredDeviceNotice', 'Please switch back to your registered device to log in and access your course cabinets.')}
                            </p>

                            {/* Pending Request Notification */}
                            {deviceBlocked.has_pending_request ? (
                                <div className="mt-3 p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex items-start gap-2">
                                    <Clock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
                                    <div>
                                        <span className="font-bold block">
                                            {t('pendingDeviceRequestTitle', 'Device Switch Request Under Review')}
                                        </span>
                                        <span className="text-[11px] text-indigo-700">
                                            {t('pendingDeviceRequestDesc', 'Your request to authorize')} <strong>"{deviceBlocked.pending_device_name}"</strong> {t('isAwaitingApproval', 'is waiting for instructor authorization.')}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-3 pt-3 border-t border-amber-200/60">
                                    {!showRequestForm ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowRequestForm(true)}
                                            className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <Smartphone className="w-3.5 h-3.5" />
                                            <span>{t('requestDeviceSwitch', 'Request Authorization For This Device')}</span>
                                        </button>
                                    ) : (
                                        <form onSubmit={submitDeviceRequest} className="space-y-3 pt-1">
                                            <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                                                <span>{t('requestDeviceChangeTitle', 'Submit Device Switch Request')}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRequestForm(false)}
                                                    className="text-[10px] text-amber-700 hover:underline font-semibold"
                                                >
                                                    {t('cancel', 'Cancel')}
                                                </button>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                    {t('reasonForSwitch', 'Reason for Device Change')}
                                                </label>
                                                <select
                                                    value={requestForm.data.reason}
                                                    onChange={(e) => requestForm.setData('reason', e.target.value)}
                                                    className="w-full text-xs rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5 px-2.5"
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
                                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                    {t('confirmPassword', 'Confirm Your Password')}
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="Enter your student account password..."
                                                    value={requestForm.data.password}
                                                    onChange={(e) => requestForm.setData('password', e.target.value)}
                                                    required
                                                    className="w-full text-xs rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-1.5 px-2.5"
                                                />
                                                <InputError message={requestForm.errors.password} className="mt-1" />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={requestForm.processing}
                                                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
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
            <form onSubmit={submit}>
                {/* Detected Device Indicator */}
                <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium text-slate-500">
                        <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{t('detectedHardware', 'Detected Device')}:</span>
                    </span>
                    <span className="font-bold text-slate-800 truncate max-w-[200px]">
                        {detectedName}
                    </span>
                </div>

                <div>
                    <InputLabel htmlFor="email" value={t('registeredEmail', 'Email Address')} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full text-sm"
                        autoComplete="username"
                        isFocused={!deviceBlocked}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value={t('password', 'Password')} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full text-sm"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-xs text-slate-600">
                            {t('rememberMe', 'Remember me')}
                        </span>
                    </label>
                </div>

                <div className="mt-5 flex items-center justify-between">
                    {canResetPassword ? (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-xs text-slate-500 underline hover:text-slate-800 focus:outline-none"
                        >
                            {t('forgotPassword', 'Forgot your password?')}
                        </Link>
                    ) : <span />}

                    <PrimaryButton className="ms-4 text-xs font-bold" disabled={processing}>
                        {processing ? t('loggingIn', 'Signing In...') : t('logIn', 'Log in')}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
