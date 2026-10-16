import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Users, 
    Search, 
    Filter, 
    CheckCircle2, 
    XCircle, 
    UserCheck, 
    GraduationCap, 
    Building2,
    Clock,
    RefreshCw,
    UserPen,
    Smartphone,
    RotateCcw,
    ShieldAlert
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

export default function UsersIndex({ users = { data: [] }, universities = [], filters = {} }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [status, setStatus] = useState(filters.status || '');
    const [universityId, setUniversityId] = useState(filters.university_id || '');

    const { post, processing } = useForm();

    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('admin.users'),
            { search, role, status, university_id: universityId },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setRole('');
        setStatus('');
        setUniversityId('');
        router.get(route('admin.users'));
    };

    const handleApprove = (userId) => {
        post(route('admin.users.approve', userId), { preserveScroll: true });
    };

    const handleReject = (userId) => {
        if (confirm('Are you sure you want to reject this user?')) {
            post(route('admin.users.reject', userId), { preserveScroll: true });
        }
    };

    const handleApproveName = (userId) => {
        post(route('admin.users.approve-name', userId), { preserveScroll: true });
    };

    const handleRejectName = (userId) => {
        if (confirm('Are you sure you want to decline this name change request?')) {
            post(route('admin.users.reject-name', userId), { preserveScroll: true });
        }
    };

    const handleApproveDevice = (userId) => {
        post(route('admin.users.approve-device', userId), { preserveScroll: true });
    };

    const handleRejectDevice = (userId) => {
        if (confirm('Are you sure you want to decline this device authorization request?')) {
            post(route('admin.users.reject-device', userId), { preserveScroll: true });
        }
    };

    const handleResetDevice = (userId, userName) => {
        if (confirm(`Reset registered device lock for ${userName}? The next device they log in with will become their new authorized device.`)) {
            post(route('admin.users.reset-device', userId), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Student & User Directory
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Verify enrollments, approve student accounts, and inspect university memberships.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="User Directory" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Filter Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, ID..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                />
                            </div>

                            <select
                                value={universityId}
                                onChange={(e) => setUniversityId(e.target.value)}
                                className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="">All Universities</option>
                                {universities.map((uni) => (
                                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                                ))}
                            </select>

                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="">All Roles</option>
                                <option value="student">Student</option>
                                <option value="assistant">Teaching Assistant (TA)</option>
                                <option value="admin">Administrator</option>
                                <option value="university">University Staff</option>
                            </select>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full py-2 px-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                                <option value="">All Statuses</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending Review</option>
                                <option value="rejected">Rejected</option>
                            </select>

                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all shadow-indigo-600/20"
                                >
                                    Filter
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all"
                                    title="Reset filters"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Users Directory Table */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-3.5">User Details</th>
                                        <th className="px-6 py-3.5">University & ID</th>
                                        <th className="px-6 py-3.5">Term</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5">Registration IP</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                                                No users found matching current filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900">{user.name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600">
                                                        {user.role}
                                                    </span>

                                                    {user.role === 'student' && (
                                                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                                                            <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                            {user.registered_device_name ? (
                                                                <span className="font-medium text-slate-700 truncate max-w-[200px]" title={user.registered_device_name}>
                                                                    {user.registered_device_name}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 italic">
                                                                    No device registered yet
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {user.pending_name && (
                                                        <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/90 shadow-2xs max-w-xs">
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
                                                                <UserPen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                                <span>Name Change Request</span>
                                                            </div>
                                                            <div className="text-xs font-medium text-slate-700 mt-1">
                                                                New: <strong className="font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{user.pending_name}</strong>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleApproveName(user.id)}
                                                                    disabled={processing}
                                                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRejectName(user.id)}
                                                                    disabled={processing}
                                                                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors"
                                                                >
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {user.pending_device_name && (
                                                        <div className="mt-2.5 p-2.5 rounded-xl bg-violet-50/90 border border-violet-200/90 shadow-2xs max-w-xs">
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-950">
                                                                <Smartphone className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                                                                <span>Device Change Request</span>
                                                            </div>
                                                            <div className="text-xs font-semibold text-slate-800 mt-1">
                                                                New: <strong className="font-bold text-violet-700 bg-white px-1.5 py-0.5 rounded border border-violet-200">{user.pending_device_name}</strong>
                                                            </div>
                                                            {user.pending_device_reason && (
                                                                <div className="text-[11px] text-slate-600 mt-1 italic">
                                                                    "{user.pending_device_reason}"
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1.5 mt-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleApproveDevice(user.id)}
                                                                    disabled={processing}
                                                                    className="px-2.5 py-1 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold shadow-xs transition-colors"
                                                                >
                                                                    Approve Device
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRejectDevice(user.id)}
                                                                    disabled={processing}
                                                                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold transition-colors"
                                                                >
                                                                    Decline
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-800 font-medium">
                                                        {user.university?.name || <span className="text-slate-400 italic">None</span>}
                                                    </div>
                                                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                                                        {user.student_id_no || '—'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-600">
                                                    {user.semester ? `${user.semester} (${user.year || 'Current'})` : '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.status === 'approved' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                            Approved
                                                        </span>
                                                    )}
                                                    {user.status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                                            Pending Review
                                                        </span>
                                                    )}
                                                    {user.status === 'rejected' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                                            Rejected
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                                    {user.registration_ip_address || '127.0.0.1'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        {user.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(user.id)}
                                                                    disabled={processing}
                                                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(user.id)}
                                                                    disabled={processing}
                                                                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-all"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        {user.role === 'student' && user.registered_device_name && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleResetDevice(user.id, user.name)}
                                                                disabled={processing}
                                                                title="Reset Device Lock"
                                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold transition-colors"
                                                            >
                                                                <RotateCcw className="w-3 h-3 text-slate-500" />
                                                                <span>Reset Device</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
