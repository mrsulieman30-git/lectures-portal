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
    ShieldAlert,
    Edit3,
    KeyRound,
    Trash2,
    Lock,
    X,
    Mail,
    Phone,
    Sparkles,
    AlertCircle
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';

export default function UsersIndex({ users = { data: [] }, universities = [], filters = {} }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [role, setRole] = useState(filters.role || '');
    const [status, setStatus] = useState(filters.status || '');
    const [universityId, setUniversityId] = useState(filters.university_id || '');
    const [semesterId, setSemesterId] = useState(filters.semester_id || '');

    const { post, processing } = useForm();

    // Edit User Modal State
    const [editingUser, setEditingUser] = useState(null);
    const [editData, setEditData] = useState({
        name: '',
        role: 'student',
        status: 'approved',
        university_id: '',
        semester_id: '',
        semester: '',
        year: 'Year 1',
        student_id_no: '',
        phone: '',
        gender: 'male',
        bio: '',
    });
    const [editProcessing, setEditProcessing] = useState(false);
    const [editErrors, setEditErrors] = useState({});

    // Filter handling
    const handleFilter = (e) => {
        e?.preventDefault();
        router.get(
            route('admin.users'),
            { search, role, status, university_id: universityId, semester_id: semesterId },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setRole('');
        setStatus('');
        setUniversityId('');
        setSemesterId('');
        router.get(route('admin.users'));
    };

    // User Approval / Rejection
    const handleApprove = (userId) => {
        post(route('admin.users.approve', userId), { preserveScroll: true });
    };

    const handleReject = (userId) => {
        if (confirm('Are you sure you want to reject this user?')) {
            post(route('admin.users.reject', userId), { preserveScroll: true });
        }
    };

    // Name Change Requests
    const handleApproveName = (userId) => {
        post(route('admin.users.approve-name', userId), { preserveScroll: true });
    };

    const handleRejectName = (userId) => {
        if (confirm('Are you sure you want to decline this name change request?')) {
            post(route('admin.users.reject-name', userId), { preserveScroll: true });
        }
    };

    // Device Management
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

    // Enrollment Sync
    const handleSyncEnrollments = () => {
        if (confirm('Sync all approved students with active subjects of their universities?')) {
            router.post(route('admin.users.sync-enrollments'));
        }
    };

    // Helper: Infer Year from Semester name
    const inferYearFromSemester = (semName) => {
        if (!semName) return 'Year 1';
        const match = semName.match(/\d+/);
        if (!match) return 'Year 1';
        const num = parseInt(match[0], 10);
        if (num <= 2) return 'Year 1';
        if (num <= 4) return 'Year 2';
        if (num <= 6) return 'Year 3';
        return 'Year 4';
    };

    // Open Edit User Modal
    const openEditUser = (user) => {
        setEditingUser(user);
        setEditData({
            name: user.name || '',
            role: user.role || 'student',
            status: user.status || 'approved',
            university_id: user.university_id ? String(user.university_id) : '',
            semester_id: user.semester_id ? String(user.semester_id) : '',
            semester: user.semester || '',
            year: user.year || (user.semester ? inferYearFromSemester(user.semester) : 'Year 1'),
            student_id_no: user.student_id_no || '',
            phone: user.phone || '',
            gender: user.gender || 'male',
            bio: user.bio || '',
        });
        setEditErrors({});
    };

    // Handle University change in Edit Modal
    const handleEditUniversityChange = (newUniId) => {
        const selectedUni = universities.find(u => String(u.id) === String(newUniId));
        const firstSem = selectedUni?.semesters?.[0];

        setEditData(prev => ({
            ...prev,
            university_id: newUniId,
            semester_id: firstSem ? String(firstSem.id) : '',
            semester: firstSem ? firstSem.name : '',
            year: firstSem ? inferYearFromSemester(firstSem.name) : prev.year,
        }));
    };

    // Handle Semester change in Edit Modal
    const handleEditSemesterChange = (newSemId) => {
        const selectedUni = universities.find(u => String(u.id) === String(editData.university_id));
        const sem = selectedUni?.semesters?.find(s => String(s.id) === String(newSemId));

        setEditData(prev => ({
            ...prev,
            semester_id: newSemId,
            semester: sem ? sem.name : prev.semester,
            year: sem ? inferYearFromSemester(sem.name) : prev.year,
        }));
    };

    // Save User Updates
    const handleUpdateUser = (e) => {
        e.preventDefault();
        setEditProcessing(true);
        router.put(
            route('admin.users.update', editingUser.id),
            editData,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingUser(null);
                    setEditProcessing(false);
                },
                onError: (errs) => {
                    setEditErrors(errs);
                    setEditProcessing(false);
                }
            }
        );
    };

    // Reset Password to default '11111111'
    const handleResetPassword = (user) => {
        if (confirm(`Reset password for "${user.name}" to the default password "11111111"?\n\nThe user can immediately sign in using 11111111 and then update it in their profile settings.`)) {
            router.post(route('admin.users.reset-password', user.id), {}, {
                preserveScroll: true,
            });
        }
    };

    // Delete User
    const handleDeleteUser = (user) => {
        if (confirm(`Are you sure you want to delete user "${user.name}" (${user.email})? This action can be undone from the Recycle Bin.`)) {
            router.delete(route('admin.users.destroy', user.id), {
                preserveScroll: true,
                onSuccess: () => {
                    if (editingUser?.id === user.id) {
                        setEditingUser(null);
                    }
                }
            });
        }
    };

    // Find available semesters for the current university selection in the filter
    const selectedFilterUni = universities.find(u => String(u.id) === String(universityId));
    const filterSemesters = selectedFilterUni?.semesters || [];

    // Find available semesters for the selected university in the edit modal
    const selectedEditUni = universities.find(u => String(u.id) === String(editData.university_id));
    const editSemesters = selectedEditUni?.semesters || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Student & User Directory
                            </h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ff5e36]/10 text-[#ff5e36] border border-[#ff5e36]/20">
                                {users.total || users.data?.length || 0} Registered
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Fully manage user profiles, university/semester assignments, device authorizations, and password resets.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                            type="button"
                            onClick={handleSyncEnrollments}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/50 text-[#ff5e36] text-xs font-bold border border-orange-200 dark:border-orange-800 transition shadow-2xs"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Sync Course Enrollments</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="User Directory & Management" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">

                    {/* Filter Card */}
                    <div className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 p-5 shadow-sm">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                            <div className="relative lg:col-span-2">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, student ID, phone..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36] transition-all"
                                />
                            </div>

                            <select
                                value={universityId}
                                onChange={(e) => {
                                    setUniversityId(e.target.value);
                                    setSemesterId('');
                                }}
                                className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                            >
                                <option value="">All Universities</option>
                                {universities.map((uni) => (
                                    <option key={uni.id} value={uni.id}>{uni.name}</option>
                                ))}
                            </select>

                            <select
                                value={semesterId}
                                onChange={(e) => setSemesterId(e.target.value)}
                                disabled={filterSemesters.length === 0}
                                className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36] disabled:opacity-50"
                            >
                                <option value="">All Semesters</option>
                                {filterSemesters.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>

                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full py-2 px-3 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                            >
                                <option value="">All Roles</option>
                                <option value="student">Student</option>
                                <option value="admin">Administrator</option>
                                <option value="university">University Staff</option>
                            </select>

                            <div className="flex gap-2">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="flex-1 py-2 px-3 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="approved">Approved</option>
                                    <option value="pending">Pending Review</option>
                                    <option value="rejected">Rejected</option>
                                </select>

                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#ff5e36] hover:bg-[#e04822] text-white rounded-xl text-xs font-bold shadow-md shadow-[#ff5e36]/20 transition-all"
                                >
                                    Filter
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-3 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all"
                                    title="Reset filters"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Users Directory Table */}
                    <div className="bg-white dark:bg-[#0c1017] rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                                <thead className="bg-slate-50 dark:bg-white/5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5">
                                    <tr>
                                        <th className="px-6 py-3.5">User Identity & Account</th>
                                        <th className="px-6 py-3.5">University & ID</th>
                                        <th className="px-6 py-3.5">Curriculum Term</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5">IP & Login</th>
                                        <th className="px-6 py-3.5 text-right">Management</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {users.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">
                                                No users found matching current criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.data.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff5e36]/20 to-amber-500/20 text-[#ff5e36] font-bold text-xs flex items-center justify-center shrink-0 uppercase border border-[#ff5e36]/30">
                                                            {user.initials || user.name?.substring(0, 2) || 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                                <span>{user.name}</span>
                                                                {user.gender && (
                                                                    <span className="text-[10px] text-slate-400 font-normal capitalize">
                                                                        ({user.gender})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5" title="Email address (immutable by administrator)">
                                                                <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                                                                <span>{user.email}</span>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                                    user.role === 'admin' 
                                                                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20' 
                                                                        : user.role === 'university'
                                                                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                                            : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                                                                }`}>
                                                                    {user.role}
                                                                </span>

                                                                {user.phone && (
                                                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                                                        <Phone className="w-3 h-3" />
                                                                        {user.phone}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {user.role === 'student' && (
                                                                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                                                                    <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                    {user.registered_device_name ? (
                                                                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]" title={user.registered_device_name}>
                                                                            {user.registered_device_name}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-slate-400 italic">
                                                                            No device registered
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Pending Name Change Alert */}
                                                            {user.pending_name && (
                                                                <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 max-w-xs">
                                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                                                                        <UserPen className="w-3.5 h-3.5 shrink-0" />
                                                                        <span>Name Change Request:</span>
                                                                    </div>
                                                                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                                                                        {user.pending_name}
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 mt-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleApproveName(user.id)}
                                                                            disabled={processing}
                                                                            className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRejectName(user.id)}
                                                                            disabled={processing}
                                                                            className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-800 text-[10px] font-bold"
                                                                        >
                                                                            Decline
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Pending Device Change Alert */}
                                                            {user.pending_device_name && (
                                                                <div className="mt-2.5 p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 max-w-xs">
                                                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 dark:text-violet-400">
                                                                        <Smartphone className="w-3.5 h-3.5 shrink-0" />
                                                                        <span>Device Change Request:</span>
                                                                    </div>
                                                                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                                                                        {user.pending_device_name}
                                                                    </div>
                                                                    {user.pending_device_reason && (
                                                                        <div className="text-[11px] text-slate-500 mt-0.5 italic">
                                                                            "{user.pending_device_reason}"
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-1.5 mt-2">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleApproveDevice(user.id)}
                                                                            disabled={processing}
                                                                            className="px-2 py-0.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRejectDevice(user.id)}
                                                                            disabled={processing}
                                                                            className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-rose-600 border border-rose-200 dark:border-rose-800 text-[10px] font-bold"
                                                                        >
                                                                            Decline
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* University & ID */}
                                                <td className="px-6 py-4">
                                                    <div className="text-slate-900 dark:text-white font-medium flex items-center gap-1.5">
                                                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                                        {user.university?.name || <span className="text-slate-400 italic">None</span>}
                                                    </div>
                                                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                                                        ID: {user.student_id_no || '—'}
                                                    </div>
                                                </td>

                                                {/* Academic Term */}
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                                        {user.semester || user.semester_relation?.name || '—'}
                                                    </div>
                                                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#ff5e36]/10 text-[#ff5e36]">
                                                        {user.year || 'Year 1'}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4">
                                                    {user.status === 'approved' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            Approved
                                                        </span>
                                                    )}
                                                    {user.status === 'pending' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                                                            Pending Review
                                                        </span>
                                                    )}
                                                    {user.status === 'rejected' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            Rejected
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Registration IP & Login */}
                                                <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                                                    <div>IP: {user.registration_ip_address || '127.0.0.1'}</div>
                                                    {user.last_login_at && (
                                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                                            Active: {new Date(user.last_login_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-flex items-center gap-1.5 flex-wrap justify-end">
                                                        {/* Edit User Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditUser(user)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white text-xs font-bold transition shadow-xs"
                                                            title="Edit user profile and academic info"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5 text-[#ff5e36]" />
                                                            <span>Edit</span>
                                                        </button>

                                                        {/* Reset Password to 11111111 Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleResetPassword(user)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold transition shadow-xs"
                                                            title="Reset password to default '11111111'"
                                                        >
                                                            <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                            <span>Reset PW</span>
                                                        </button>

                                                        {/* Pending Actions */}
                                                        {user.status === 'pending' && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(user.id)}
                                                                    disabled={processing}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(user.id)}
                                                                    disabled={processing}
                                                                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-all"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        {/* Reset Device Lock */}
                                                        {user.role === 'student' && user.registered_device_name && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleResetDevice(user.id, user.name)}
                                                                disabled={processing}
                                                                title="Reset Device Lock"
                                                                className="inline-flex items-center gap-1 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
                                                            >
                                                                <RotateCcw className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}

                                                        {/* Delete User Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteUser(user)}
                                                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                            title="Delete User (Recycle Bin)"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Links */}
                        {users.links && users.links.length > 3 && (
                            <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Showing <span className="font-semibold">{users.from || 0}</span> to <span className="font-semibold">{users.to || 0}</span> of <span className="font-semibold">{users.total || 0}</span> registered members
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                    {users.links.map((link, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true, replace: true })}
                                            disabled={!link.url || link.active}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1 text-xs rounded-xl transition-all ${
                                                link.active 
                                                    ? 'bg-[#ff5e36] text-white font-bold shadow-xs' 
                                                    : link.url 
                                                        ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10' 
                                                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Edit User Modal */}
                    {editingUser && (
                        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                            <div className="bg-white dark:bg-[#0c1017] rounded-3xl border border-slate-200/90 dark:border-white/10 max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 relative">
                                
                                {/* Modal Header */}
                                <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-white/5 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff5e36] to-amber-500 text-white font-black text-base flex items-center justify-center shadow-md shadow-[#ff5e36]/20 uppercase">
                                            {editingUser.initials || editingUser.name?.substring(0, 2) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                Edit User: {editingUser.name}
                                            </h3>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                                                <span>Member #{editingUser.id}</span>
                                                <span>•</span>
                                                <span className="font-mono">{editingUser.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setEditingUser(null)}
                                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleUpdateUser} className="space-y-5">
                                    
                                    {/* Email & Password Security Banner (Non-editable Notice & Reset) */}
                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                                                <Lock className="w-3.5 h-3.5 shrink-0" />
                                                <span>Protected Credentials (Email & Password)</span>
                                            </div>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                                Email and password are locked for user security. Need to grant access? Reset their password to default <strong>11111111</strong>.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleResetPassword(editingUser)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff5e36] hover:from-amber-600 hover:to-[#e04822] text-white text-xs font-bold shadow-xs whitespace-nowrap self-start sm:self-auto shrink-0 transition"
                                        >
                                            <KeyRound className="w-3.5 h-3.5" />
                                            <span>Reset to 11111111</span>
                                        </button>
                                    </div>

                                    {/* Account Identity (Name, Email, Role, Status) */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={editData.name}
                                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                            />
                                            {editErrors.name && <p className="text-xs text-rose-600 mt-1">{editErrors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                                                <span>Email Address</span>
                                                <span className="text-[10px] font-normal text-slate-400 flex items-center gap-1">
                                                    <Lock className="w-2.5 h-2.5" /> Immutable
                                                </span>
                                            </label>
                                            <input
                                                type="email"
                                                disabled
                                                value={editingUser.email}
                                                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 rounded-xl cursor-not-allowed"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Account Role *
                                            </label>
                                            <select
                                                value={editData.role}
                                                onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                            >
                                                <option value="student">Student</option>
                                                <option value="university">University Staff</option>
                                                <option value="admin">Administrator</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                Account Status *
                                            </label>
                                            <select
                                                value={editData.status}
                                                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                            >
                                                <option value="approved">Approved (Active Access)</option>
                                                <option value="pending">Pending Review</option>
                                                <option value="rejected">Rejected (Suspended)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Academic Affiliation (University, Semester, Academic Year, Student ID) */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-4">
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                            <GraduationCap className="w-4 h-4 text-[#ff5e36]" />
                                            <span>Academic Affiliation & Curriculum Placement</span>
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    Affiliated University
                                                </label>
                                                <select
                                                    value={editData.university_id}
                                                    onChange={(e) => handleEditUniversityChange(e.target.value)}
                                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                                >
                                                    <option value="">No University Selected</option>
                                                    {universities.map((uni) => (
                                                        <option key={uni.id} value={uni.id}>{uni.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    Semester / Term
                                                </label>
                                                {editSemesters.length > 0 ? (
                                                    <select
                                                        value={editData.semester_id}
                                                        onChange={(e) => handleEditSemesterChange(e.target.value)}
                                                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl focus:ring-2 focus:ring-[#ff5e36]/20 focus:border-[#ff5e36]"
                                                    >
                                                        <option value="">Choose Semester</option>
                                                        {editSemesters.map((s) => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Semester 1 or Fall 2026"
                                                        value={editData.semester}
                                                        onChange={(e) => setEditData({ ...editData, semester: e.target.value })}
                                                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl"
                                                    />
                                                )}
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    Changing semester automatically re-syncs active course module enrollments.
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    Academic Year
                                                </label>
                                                <select
                                                    value={editData.year}
                                                    onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl"
                                                >
                                                    <option value="Year 1">Year 1</option>
                                                    <option value="Year 2">Year 2</option>
                                                    <option value="Year 3">Year 3</option>
                                                    <option value="Year 4">Year 4</option>
                                                    <option value="Postgraduate">Postgraduate</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                    Student ID / Registration Number
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. RSU-2026-089"
                                                    value={editData.student_id_no}
                                                    onChange={(e) => setEditData({ ...editData, student_id_no: e.target.value })}
                                                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal & Contact Details */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="+252 61..."
                                                value={editData.phone}
                                                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Gender
                                            </label>
                                            <select
                                                value={editData.gender}
                                                onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                                                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl"
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                Administrative Notes / Bio
                                            </label>
                                            <textarea
                                                rows={2}
                                                placeholder="Add special notes, standing, or student background..."
                                                value={editData.bio}
                                                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                                className="w-full px-3.5 py-2 text-sm border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    {/* Modal Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteUser(editingUser)}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span>Delete User</span>
                                        </button>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditingUser(null)}
                                                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={editProcessing}
                                                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#ff5e36] hover:bg-[#e04822] text-white shadow-md shadow-[#ff5e36]/20 transition"
                                            >
                                                {editProcessing ? 'Saving Changes...' : 'Save User Profile'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
