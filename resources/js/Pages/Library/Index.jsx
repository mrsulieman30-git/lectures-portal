import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import TiltCard3D from '@/Components/TiltCard3D';
import { 
    BookOpen, 
    Search, 
    Download, 
    Eye, 
    Lock, 
    FileText, 
    Sparkles, 
    Filter, 
    Building2, 
    Layers, 
    CheckCircle2,
    BookMarked,
    Globe,
    ArrowUpRight,
    Upload,
    Plus,
    X,
    FolderKanban,
    Loader2
} from 'lucide-react';
import { useTranslation } from '@/Context/LanguageContext';
import FileUploadZone from '@/Components/FileUploadZone';

export default function LibraryIndex({ documents = { data: [] }, filters = {}, stats = {}, subjects = [] }) {
    const { t, locale } = useTranslation();
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    const [search, setSearch] = useState(filters.search || '');
    const [fileType, setFileType] = useState(filters.type || '');
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Direct Universal Library Upload Form
    const { 
        data: uploadData, 
        setData: setUploadData, 
        post: postUpload, 
        processing: uploadProcessing, 
        reset: resetUpload, 
        errors: uploadErrors,
        progress: uploadProgress
    } = useForm({
        files: [],
        subject_id: '',
        description: '',
        is_downloadable: true,
        is_view_only: false,
    });

    const handleDirectUpload = (e) => {
        e.preventDefault();
        postUpload(route('admin.library.upload'), {
            onSuccess: () => {
                resetUpload();
                setShowUploadModal(false);
            }
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('library.index'), {
            search: search,
            type: fileType,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilterType = (type) => {
        setFileType(type);
        router.get(route('library.index'), {
            search: search,
            type: type,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff5e36] via-[#ff6b4a] to-[#ff416c] text-white flex items-center justify-center shadow-lg shadow-[#ff5e36]/25">
                            <BookMarked className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display leading-tight">
                                    {t('universalLibrary', 'Universal Library')}
                                </h2>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ff5e36]/10 text-[#ff5e36] border border-[#ff5e36]/25">
                                    <Sparkles className="w-3 h-3 text-[#ff5e36]" />
                                    3D Shelf
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                {t('universalLibrarySubtitle', 'Shared cross-university academic repository, textbooks & reference guides')}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {/* Admin Direct Upload Button */}
                        {isAdmin && (
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff5e36] to-[#ff416c] hover:brightness-105 text-white text-xs font-bold shadow-md shadow-[#ff5e36]/25 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Upload className="w-4 h-4" />
                                <span>{t('uploadToLibrary', 'Upload to Universal Library')}</span>
                            </button>
                        )}

                        {/* Quick Stats Badges in Liquid Pills */}
                        <div className="liquid-pill px-3.5 py-1.5 flex items-center gap-2 dark:bg-slate-800/80 dark:border-white/10">
                            <BookOpen className="w-3.5 h-3.5 text-[#ff5e36]" />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {stats.totalBooks || 0} {t('materials', 'Resources')}
                            </span>
                        </div>
                        <div className="liquid-pill px-3.5 py-1.5 flex items-center gap-2 dark:bg-slate-800/80 dark:border-white/10">
                            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {stats.totalViews || 0} {t('views', 'Views')}
                            </span>
                        </div>
                        <div className="liquid-pill px-3.5 py-1.5 flex items-center gap-2 dark:bg-slate-800/80 dark:border-white/10">
                            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {stats.totalDownloads || 0} {t('downloads', 'Downloads')}
                            </span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={t('universalLibrary', 'Universal Library')} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

                    {/* Banner Announcement in Liquid Glass Dark Panel */}
                    <div className="relative overflow-hidden liquid-glass-dark rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/10">
                        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-1/3 -mb-8 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="relative z-10 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-300 border border-white/15 text-xs font-semibold mb-3.5">
                                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                                <span>{t('crossCampusAccess', 'Cross-Campus Academic Shelf')}</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
                                {t('universalBannerTitle', 'Access Professor Reference Materials Everywhere')}
                            </h3>
                            <p className="mt-2.5 text-sm text-slate-300 leading-relaxed font-sans">
                                {t('universalBannerDesc', 'All universal textbooks, standard curriculum guides, and core scientific reference materials are centralized here. Regardless of your university campus, you have full reading and study access.')}
                            </p>
                        </div>
                    </div>

                    {/* Search & Filter Toolbar in Liquid Glass */}
                    <div className="liquid-glass rounded-2xl p-4 border border-white/60 dark:border-white/10 dark:bg-slate-900/80 shadow-glass flex flex-col md:flex-row gap-3 items-center justify-between">
                        <form onSubmit={handleSearch} className="relative w-full md:w-96">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('searchLibraryPlaceholder', 'Search textbooks, manuals, guides by title...')}
                                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-white/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400"
                            />
                        </form>

                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            {[
                                { key: '', label: t('allMaterials', 'All Resources') },
                                { key: 'pdf', label: 'PDFs' },
                                { key: 'document', label: 'Docs' },
                                { key: 'presentation', label: 'Slides' },
                            ].map((btn) => (
                                <button
                                    key={btn.key}
                                    type="button"
                                    onClick={() => handleFilterType(btn.key)}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
                                        fileType === btn.key
                                            ? 'bg-[#ff5e36] text-white shadow-sm shadow-[#ff5e36]/30 font-bold'
                                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#0d1117] dark:hover:bg-[#161b22] text-slate-700 dark:text-slate-300 border border-transparent dark:border-white/10'
                                    }`}
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Resources Grid */}
                    {documents.data && documents.data.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documents.data.map((doc) => {
                                const docColor = doc.subject?.color || '#4f46e5';
                                return (
                                    <TiltCard3D
                                        key={doc.id}
                                        className="h-full liquid-glass rounded-3xl border border-white/60 dark:border-white/10 dark:bg-slate-900/80 p-6 shadow-glass flex flex-col justify-between group transition-all duration-200"
                                        glowColor={`${docColor}30`}
                                        maxTilt={12}
                                    >
                                        <div>
                                            {/* Top Badges */}
                                            <div className="flex items-center justify-between gap-2 mb-3.5">
                                                <span 
                                                    className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs font-mono"
                                                    style={{ backgroundColor: docColor }}
                                                >
                                                    {doc.subject?.code || 'LIB'}
                                                </span>

                                                <div className="flex items-center gap-1.5">
                                                    {doc.is_view_only ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                                                            <Lock className="w-2.5 h-2.5" />
                                                            {t('viewOnlyProtected', 'Protected')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                                            {t('downloadable', 'Downloadable')}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/10">
                                                        {doc.file_type}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Document Info */}
                                            <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-display">
                                                {doc.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                {doc.description || t('noDescription', 'No description provided for this academic resource.')}
                                            </p>

                                            {/* Course and Campus Source */}
                                            <div className="mt-4 pt-3 border-t border-slate-100/80 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                                    <span className="truncate font-medium">{doc.subject?.university?.name || t('allUniversities', 'Cross-University')}</span>
                                                </div>
                                                <span className="shrink-0 font-mono text-[11px] text-slate-400">{formatBytes(doc.file_size)}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-5 pt-3.5 border-t border-slate-100/80 dark:border-white/10 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5" />
                                                    {doc.view_count || 0}
                                                </span>
                                                {!doc.is_view_only && (
                                                    <span className="flex items-center gap-1">
                                                        <Download className="w-3.5 h-3.5" />
                                                        {doc.download_count || 0}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={route('documents.view', doc.id)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-sm shadow-[#ff5e36]/25 transition-all hover:scale-105 active:scale-95"
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-white" />
                                                    <span>{t('readOnline', 'Read')}</span>
                                                </a>

                                                {!doc.is_view_only && (
                                                    <a
                                                        href={route('documents.download', doc.id)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all hover:scale-105 active:scale-95"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${docColor} 0%, #1e1b4b 100%)`,
                                                            boxShadow: `0 3px 10px ${docColor}30`
                                                        }}
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>{t('download', 'Download')}</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </TiltCard3D>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-white/10 p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-[#ff5e36]/10 text-[#ff5e36] flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                                {t('noUniversalMaterials', 'No Universal Books or Resources Found')}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                {search
                                    ? t('noResultsMatchingFilter', 'No universal documents match your search query.')
                                    : t('noUniversalAvailable', 'The professor has not yet designated materials as universal. Check your individual course cabinets.')}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {documents.links && documents.links.length > 3 && (
                        <div className="flex justify-center items-center gap-1 pt-4">
                            {documents.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                                        link.active
                                            ? 'bg-[#ff5e36] text-white border-[#ff5e36] shadow-sm shadow-[#ff5e36]/30 font-bold'
                                            : !link.url
                                            ? 'opacity-40 cursor-not-allowed border-transparent text-slate-400'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}

                </div>
            </div>

            {/* Direct Upload to Universal Library Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="liquid-glass rounded-3xl border border-white/60 dark:border-white/10 dark:bg-slate-900 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                                    <BookMarked className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                                        {t('uploadToLibrary', 'Upload to Universal Library')}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Publish cross-campus reference books, guides & textbooks.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleDirectUpload} className="space-y-4 pt-2">
                            {/* File Upload Zone */}
                            <FileUploadZone
                                files={uploadData.files}
                                setFiles={(files) => setUploadData('files', files)}
                                processing={uploadProcessing}
                                progress={uploadProgress}
                                errors={uploadErrors}
                                maxFileSizeMB={512}
                                label="Drop textbooks or documents here, or click to select"
                                hint="Universal references (PDF, DOCX, PPT, Archives up to 512MB each)."
                            />

                            {/* Academic Domain / Subject Categorization */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('categorySubject', 'Academic Category / Subject (Optional)')}
                                </label>
                                <select
                                    value={uploadData.subject_id}
                                    onChange={(e) => setUploadData('subject_id', e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white/70 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="">🌐 General Universal Reference (All Departments)</option>
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>
                                            {sub.code ? `[${sub.code}] ` : ''}{sub.title} ({sub.university?.name || 'Campus'})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Reference Notes / Description */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('descriptionEdition', 'Description / Edition / Author Notes (Optional)')}
                                </label>
                                <textarea
                                    rows={2}
                                    value={uploadData.description}
                                    onChange={(e) => setUploadData('description', e.target.value)}
                                    placeholder="e.g. 10th Edition standard reference manual for all engineering students"
                                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white/70 dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>

                            {/* Security & Download Rules */}
                            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-white/10 space-y-2.5">
                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={uploadData.is_view_only}
                                        onChange={(e) => setUploadData('is_view_only', e.target.checked)}
                                        className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                            Protected View-Only Mode (Recommended for proprietary books)
                                        </span>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                                            Students read online in the secure streaming viewer. Downloads, printing, and file copying are completely locked.
                                        </p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-slate-200/60 dark:border-white/10">
                                    <input
                                        type="checkbox"
                                        checked={uploadData.is_downloadable}
                                        onChange={(e) => setUploadData('is_downloadable', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                        Allow students to download offline study copy (when view-only is off)
                                    </span>
                                </label>
                            </div>

                            {/* Submit & Cancel */}
                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-white/10">
                                <button
                                    type="button"
                                    disabled={uploadProcessing}
                                    onClick={() => setShowUploadModal(false)}
                                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
                                >
                                    {t('cancel', 'Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploadProcessing || uploadData.files.length === 0}
                                    className="px-5 py-2.5 text-xs font-bold bg-[#ff5e36] hover:bg-[#e04822] text-white rounded-xl shadow-md shadow-[#ff5e36]/25 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
                                >
                                    {uploadProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Uploading ({uploadProgress?.percentage || 0}%)...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            <span>Publish {uploadData.files.length > 0 ? `${uploadData.files.length} Book(s)` : 'to Library'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

