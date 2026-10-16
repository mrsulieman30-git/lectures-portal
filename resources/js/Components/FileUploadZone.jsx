import { useState, useRef } from 'react';
import { 
    Upload, 
    X, 
    FileText, 
    FileSpreadsheet, 
    Presentation, 
    FileArchive, 
    File, 
    AlertCircle, 
    CheckCircle2, 
    Loader2 
} from 'lucide-react';

export default function FileUploadZone({
    files = [],
    setFiles,
    processing = false,
    progress = null,
    errors = {},
    maxFileSizeMB = 512,
    acceptedTypes = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt',
    label = 'Drop files here or click to browse',
    hint = 'Supports PDF, Word, PowerPoint, Excel, and archives up to 512MB per file.'
}) {
    const [isDragging, setIsDragging] = useState(false);
    const [clientError, setClientError] = useState(null);
    const fileInputRef = useRef(null);

    const formatBytes = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileName = '') => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (ext === 'pdf') {
            return <FileText className="w-5 h-5 text-rose-500 shrink-0" />;
        }
        if (['doc', 'docx'].includes(ext)) {
            return <FileText className="w-5 h-5 text-blue-500 shrink-0" />;
        }
        if (['ppt', 'pptx'].includes(ext)) {
            return <Presentation className="w-5 h-5 text-orange-500 shrink-0" />;
        }
        if (['xls', 'xlsx', 'csv'].includes(ext)) {
            return <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />;
        }
        if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
            return <FileArchive className="w-5 h-5 text-amber-500 shrink-0" />;
        }
        return <File className="w-5 h-5 text-indigo-500 shrink-0" />;
    };

    const handleFilesAdded = (incomingFiles) => {
        setClientError(null);
        const newFiles = Array.from(incomingFiles || []);
        if (newFiles.length === 0) return;

        // Check file size limits client-side
        const maxBytes = maxFileSizeMB * 1024 * 1024;
        const oversized = newFiles.filter(f => f.size > maxBytes);
        if (oversized.length > 0) {
            setClientError(`Some files exceed the ${maxFileSizeMB}MB limit: ${oversized.map(f => f.name).join(', ')}`);
            return;
        }

        // Merge with existing files avoiding exact duplicates
        const existingNames = new Set(files.map(f => `${f.name}_${f.size}`));
        const filteredNew = newFiles.filter(f => !existingNames.has(`${f.name}_${f.size}`));

        setFiles([...files, ...filteredNew]);
    };

    const removeFile = (indexToRemove) => {
        const updated = files.filter((_, idx) => idx !== indexToRemove);
        setFiles(updated);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const clearAllFiles = () => {
        setFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);

    return (
        <div className="space-y-3.5">
            {/* Drag and Drop Zone */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!processing) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (!processing && e.dataTransfer.files) {
                        handleFilesAdded(e.dataTransfer.files);
                    }
                }}
                onClick={() => !processing && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-7 text-center transition-all cursor-pointer select-none group ${
                    isDragging 
                        ? 'border-indigo-500 bg-indigo-50/80 scale-[1.01] shadow-lg shadow-indigo-500/10' 
                        : 'border-slate-200 hover:border-indigo-400 bg-slate-50/60 hover:bg-white hover:shadow-md'
                } ${processing ? 'opacity-60 pointer-events-none' : ''}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes}
                    onChange={(e) => handleFilesAdded(e.target.files)}
                    className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 group-hover:from-indigo-500/20 group-hover:to-violet-500/20 text-indigo-600 flex items-center justify-center transition-all group-hover:scale-110 shadow-sm">
                        <Upload className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 font-display">
                            {label}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                            {hint}
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 text-[11px] font-medium text-slate-600 shadow-xs">
                        <span>Max {maxFileSizeMB}MB per file</span>
                        <span>•</span>
                        <span className="font-semibold text-indigo-600">Multiple files enabled</span>
                    </div>
                </div>
            </div>

            {/* Client Error or Backend Validation Errors */}
            {(clientError || errors.files || Object.keys(errors).some(k => k.startsWith('files.'))) && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                        {clientError && <p className="font-semibold">{clientError}</p>}
                        {errors.files && <p className="font-semibold">{errors.files}</p>}
                        {Object.entries(errors)
                            .filter(([k]) => k.startsWith('files.'))
                            .map(([k, msg]) => (
                                <p key={k}>{msg}</p>
                            ))}
                    </div>
                </div>
            )}

            {/* Selected Files Queue */}
            {files.length > 0 && (
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 font-display flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            {files.length} {files.length === 1 ? 'file ready' : 'files ready'} ({formatBytes(totalBytes)})
                        </span>
                        {!processing && (
                            <button
                                type="button"
                                onClick={clearAllFiles}
                                className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {files.map((file, idx) => (
                            <div
                                key={`${file.name}_${file.size}_${idx}`}
                                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all text-xs"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {getFileIcon(file.name)}
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-800 truncate max-w-xs sm:max-w-sm">
                                            {file.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono">
                                            {formatBytes(file.size)}
                                        </p>
                                    </div>
                                </div>

                                {!processing && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFile(idx);
                                        }}
                                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                                        title="Remove file"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Real-time Upload Progress Bar */}
            {processing && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                            <span>Uploading {files.length} file(s)...</span>
                        </span>
                        <span className="font-mono text-indigo-700 font-bold">
                            {progress?.percentage ? `${progress.percentage}%` : 'Transferring...'}
                        </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden shadow-inner relative">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 rounded-full transition-all duration-200 ease-out relative"
                            style={{ width: `${progress?.percentage || 15}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>
                            {progress?.loaded ? formatBytes(progress.loaded) : '0 B'} of {progress?.total ? formatBytes(progress.total) : formatBytes(totalBytes)}
                        </span>
                        <span className="text-indigo-600 font-medium">Please wait, do not close</span>
                    </div>
                </div>
            )}
        </div>
    );
}
