import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import { renderAsync as renderDocx } from 'docx-preview';
import { pptxToHtml } from '@jvmr/pptx-to-html';
import { 
    ArrowLeft, 
    Lock, 
    Download, 
    FileText, 
    ZoomIn, 
    ZoomOut, 
    RotateCw, 
    Maximize, 
    Minimize, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    AlertCircle, 
    RefreshCw,
    Presentation,
    FileSpreadsheet,
    Layers
} from 'lucide-react';
import { useTranslation, LanguageSwitcher } from '@/Context/LanguageContext';

// Configure local PDF.js worker (Bundled 100% locally with Vite, NO CDN dependencies)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function DocumentView({ 
    document = {}, 
    streamUrl = '', 
    fileUrl = '', 
    isViewOnly = false,
    userName = '',
    studentId = ''
}) {
    const { t } = useTranslation();
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [pageRendering, setPageRendering] = useState(false);

    // Presentation Slide States (PPT / PPTX)
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(1);
    const [viewMode, setViewMode] = useState('slide'); // 'slide' (presentation) or 'continuous' (all slides)

    const canvasRef = useRef(null);
    const docxContainerRef = useRef(null);
    const renderTaskRef = useRef(null);
    const containerRef = useRef(null);

    const fileExt = (document.file_type || '').toLowerCase();
    const isPdf = fileExt === 'pdf';
    const isDocx = ['docx', 'doc'].includes(fileExt);
    const isPpt = ['ppt', 'pptx'].includes(fileExt);
    const isSheet = ['xls', 'xlsx'].includes(fileExt);
    const isOffice = isSheet; // only spreadsheets are fallback office showcase now
    const effectiveStreamUrl = streamUrl || fileUrl;

    // ─── Security Handlers: Anti-Download, Anti-Print & Anti-Scrape ─────────
    useEffect(() => {
        if (isViewOnly) {
            const handleContextMenu = (e) => {
                e.preventDefault();
                return false;
            };

            const handleKeyDown = (e) => {
                // Block Ctrl+S (Save), Ctrl+P (Print), Ctrl+U (Source), Ctrl+Shift+I, F12
                if (
                    (e.ctrlKey || e.metaKey) && 
                    ['s', 'p', 'u', 'S', 'P', 'U'].includes(e.key)
                ) {
                    e.preventDefault();
                    return false;
                }
                if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))) {
                    e.preventDefault();
                    return false;
                }
            };

            window.addEventListener('contextmenu', handleContextMenu);
            window.addEventListener('keydown', handleKeyDown);

            return () => {
                window.removeEventListener('contextmenu', handleContextMenu);
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isViewOnly]);

    // ─── Slide Keyboard Navigation (Arrow Left/Right, Space, PageUp/Down) ────
    useEffect(() => {
        const handleSlideNavKeys = (e) => {
            if (!isPpt || slides.length === 0) return;
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
                e.preventDefault();
                setCurrentSlide((prev) => Math.min(prev + 1, slides.length));
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                e.preventDefault();
                setCurrentSlide((prev) => Math.max(prev - 1, 1));
            }
        };

        window.addEventListener('keydown', handleSlideNavKeys);
        return () => window.removeEventListener('keydown', handleSlideNavKeys);
    }, [isPpt, slides.length]);

    // ─── Fast & Safe Base64 to Uint8Array Converter ─────────────────────────
    const decodeBase64ToUint8Array = (base64) => {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        const CHUNK_SIZE = 65536;
        for (let i = 0; i < len; i += CHUNK_SIZE) {
            const end = Math.min(i + CHUNK_SIZE, len);
            for (let j = i; j < end; j++) {
                bytes[j] = binaryString.charCodeAt(j);
            }
        }
        return bytes;
    };

    // ─── Fetch Document via JSON Base64 (100% IDM-Proof) ─────────────────────
    const fetchDocumentBuffer = useCallback(async () => {
        if (!effectiveStreamUrl) {
            throw new Error('No stream URL provided');
        }

        const csrfToken = window.document?.querySelector?.('meta[name="csrf-token"]')?.getAttribute?.('content') || '';
        const jsonStreamUrl = effectiveStreamUrl + (effectiveStreamUrl.includes('?') ? '&' : '?') + 'format=json';

        const jsonHeaders = {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
        };
        if (csrfToken) {
            jsonHeaders['X-CSRF-TOKEN'] = csrfToken;
        }

        // Method 1: POST JSON Base64 (IDM completely ignores JSON responses)
        try {
            const postResponse = await fetch(jsonStreamUrl, {
                method: 'POST',
                headers: jsonHeaders,
                credentials: 'same-origin',
                body: JSON.stringify({ format: 'json' }),
            });

            if (postResponse.ok) {
                const data = await postResponse.json();
                if (data && data.base64) {
                    return decodeBase64ToUint8Array(data.base64);
                }
            }
        } catch (postErr) {
            console.warn('POST JSON stream fallback to GET JSON:', postErr);
        }

        // Method 2: GET JSON Base64
        try {
            const getJsonResponse = await fetch(jsonStreamUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (getJsonResponse.ok) {
                const data = await getJsonResponse.json();
                if (data && data.base64) {
                    return decodeBase64ToUint8Array(data.base64);
                }
            }
        } catch (getJsonErr) {
            console.warn('GET JSON stream fallback to binary:', getJsonErr);
        }

        // Method 3: Fallback binary stream
        const binaryResponse = await fetch(effectiveStreamUrl, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'same-origin',
        });

        if (!binaryResponse.ok) {
            throw new Error(`Failed to load document (HTTP ${binaryResponse.status})`);
        }

        const getBuf = await binaryResponse.arrayBuffer();
        if (!getBuf || getBuf.byteLength === 0) {
            throw new Error('The document file stream returned 0 bytes.');
        }

        return new Uint8Array(getBuf);
    }, [effectiveStreamUrl]);

    // ─── Document Loading Engine (PDF + DOCX + PPTX) ────────────────────────
    const loadDocument = useCallback(async () => {
        if (!effectiveStreamUrl) {
            setIsLoading(false);
            return;
        }

        if (!isPdf && !isDocx && !isPpt) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setLoadError(null);

        try {
            const uint8Data = await fetchDocumentBuffer();

            if (isPdf) {
                const loadingTask = pdfjsLib.getDocument({
                    data: uint8Data,
                });

                const loadedDoc = await loadingTask.promise;
                setPdfDoc(loadedDoc);
                setNumPages(loadedDoc.numPages);
                setPageNum(1);
            } else if (isDocx && docxContainerRef.current) {
                docxContainerRef.current.innerHTML = '';
                await renderDocx(uint8Data, docxContainerRef.current, null, {
                    className: 'docx',
                    inWrapper: false,
                    ignoreWidth: false,
                    ignoreHeight: false,
                    ignoreFonts: false,
                    breakPages: true,
                    experimental: true,
                });
            } else if (isPpt) {
                try {
                    const slidesHtml = await pptxToHtml(uint8Data.buffer, {
                        scaleToFit: false,
                    });

                    if (!slidesHtml || slidesHtml.length === 0) {
                        throw new Error('No slides could be extracted from this presentation.');
                    }

                    setSlides(slidesHtml);
                    setNumPages(slidesHtml.length);
                    setCurrentSlide(1);
                } catch (pptErr) {
                    if (fileExt === 'ppt') {
                        throw new Error('Legacy binary .PPT files must be saved as modern .PPTX to view in-browser, or downloaded.');
                    }
                    throw pptErr;
                }
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Document viewer error:', err);
            setLoadError(err.message || 'Unable to render document in browser.');
            setIsLoading(false);
        }
    }, [isPdf, isDocx, isPpt, fileExt, effectiveStreamUrl, fetchDocumentBuffer]);

    useEffect(() => {
        loadDocument();
    }, [loadDocument]);

    // ─── Render PDF Page onto HTML5 Canvas ──────────────────────────────────
    const renderPage = useCallback(async (pageNumber, docInstance, pageScale, pageRotation) => {
        if (!docInstance || !canvasRef.current) return;

        try {
            setPageRendering(true);

            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }

            const page = await docInstance.getPage(pageNumber);
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const viewport = page.getViewport({ scale: pageScale, rotation: pageRotation });

            // High-DPI screen support (Retina / 4K displays)
            const outputScale = window.devicePixelRatio || 1;
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = Math.floor(viewport.width) + 'px';
            canvas.style.height = Math.floor(viewport.height) + 'px';

            const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

            const renderContext = {
                canvasContext: ctx,
                transform: transform,
                viewport: viewport,
            };

            const renderTask = page.render(renderContext);
            renderTaskRef.current = renderTask;
            await renderTask.promise;
            setPageRendering(false);
        } catch (err) {
            if (err?.name !== 'RenderingCancelledException') {
                console.error('Page render error:', err);
                setPageRendering(false);
            }
        }
    }, []);

    useEffect(() => {
        if (pdfDoc && pageNum) {
            renderPage(pageNum, pdfDoc, scale, rotation);
        }
    }, [pdfDoc, pageNum, scale, rotation, renderPage]);

    // ─── Zoom & Page Handlers ────────────────────────────────────────────────
    const handlePrevPage = () => {
        if (pageNum > 1) setPageNum(pageNum - 1);
    };

    const handleNextPage = () => {
        if (pageNum < numPages) setPageNum(pageNum + 1);
    };

    const handleZoomIn = () => {
        setScale((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3.0));
    };

    const handleZoomOut = () => {
        setScale((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
    };

    const handleResetZoom = () => {
        setScale(1.0);
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    // ─── Sync Fullscreen State with Browser ──────────────────────────────────
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(Boolean(window.document.fullscreenElement));
        };
        window.document.addEventListener('fullscreenchange', handleFullscreenChange);
        window.document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        return () => {
            window.document.removeEventListener('fullscreenchange', handleFullscreenChange);
            window.document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!window.document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.().catch((err) => {
                console.warn('Fullscreen request failed:', err);
            });
        } else {
            window.document.exitFullscreen?.().catch((err) => {
                console.warn('Exit fullscreen failed:', err);
            });
        }
    };

    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleBack = (e) => {
        e?.preventDefault();

        // 1. If user came from a page within the same domain, use browser history back
        if (typeof window !== 'undefined' && window.document.referrer && window.document.referrer.includes(window.location.host)) {
            window.history.back();
            return;
        }

        // 2. If history stack exists, attempt back with a fast fallback
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
            setTimeout(() => {
                // If history.back didn't unload the page, navigate directly
                if (document.subject_id) {
                    router.visit(route('subjects.show', document.subject_id));
                } else {
                    router.visit(route('dashboard'));
                }
            }, 250);
            return;
        }

        // 3. Fallback: navigate directly to subject or student dashboard
        if (document.subject_id) {
            router.visit(route('subjects.show', document.subject_id));
        } else {
            router.visit(route('dashboard'));
        }
    };

    return (
        <div 
            ref={containerRef}
            className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${isViewOnly ? 'select-none' : ''}`}
            onContextMenu={isViewOnly ? (e) => e.preventDefault() : undefined}
        >
            <Head title={`View: ${document.title || 'Document'}`} />

            {/* Top Toolbar */}
            <header className="h-14 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30 shadow-md">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 transition-all hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                        title={t('back', 'Back')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="truncate">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md font-display">
                                {document.title}
                            </h1>
                            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                                {fileExt || 'DOC'}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                            {document.subject?.title || 'Universal Library'} • {formatBytes(document.file_size)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <LanguageSwitcher className="bg-slate-800 border-white/10 text-white" />

                    {isViewOnly ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
                            <Lock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span className="hidden sm:inline">{t('protectedReadingMode', 'Protected View-Only Mode')}</span>
                            <span className="sm:hidden">Protected</span>
                        </div>
                    ) : (
                        document.is_downloadable && (
                            <a
                                href={route('documents.download', document.id)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Download className="w-3.5 h-3.5" />
                                <span>{t('downloadFile', 'Download File')}</span>
                            </a>
                        )
                    )}
                </div>
            </header>

            {/* In-Browser Controls Bar for PDF, Word & PowerPoint */}
            {(isPdf || isDocx || isPpt) && !loadError && (
                <div className="bg-slate-900/80 backdrop-blur-sm border-b border-white/10 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs z-20">
                    {/* Pagination Controls (for PDF & PPT) */}
                    {isPdf ? (
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={handlePrevPage}
                                disabled={pageNum <= 1 || isLoading || pageRendering}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 transition-colors"
                                title="Previous Page"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1 font-mono text-slate-300">
                                <input
                                    type="number"
                                    min={1}
                                    max={numPages || 1}
                                    value={pageNum}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (val >= 1 && val <= numPages) setPageNum(val);
                                    }}
                                    className="w-14 text-center py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:ring-1 focus:ring-indigo-500"
                                />
                                <span>/ {numPages || '—'}</span>
                            </div>
                            <button
                                onClick={handleNextPage}
                                disabled={pageNum >= numPages || isLoading || pageRendering}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 transition-colors"
                                title="Next Page"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : isPpt ? (
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 1))}
                                    disabled={currentSlide <= 1 || isLoading}
                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 transition-colors"
                                    title="Previous Slide (or use Left Arrow)"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1.5 font-mono text-slate-300">
                                    <span className="text-[11px] font-bold text-amber-400">Slide</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={numPages || 1}
                                        value={currentSlide}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val >= 1 && val <= numPages) setCurrentSlide(val);
                                        }}
                                        className="w-12 text-center py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white font-mono focus:ring-1 focus:ring-indigo-500"
                                    />
                                    <span>/ {numPages || '—'}</span>
                                </div>
                                <button
                                    onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, numPages))}
                                    disabled={currentSlide >= numPages || isLoading}
                                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 transition-colors"
                                    title="Next Slide (or use Right Arrow / Space)"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* View Mode Toggle: Slide vs Continuous */}
                            <div className="flex items-center p-0.5 rounded-xl bg-slate-800 border border-white/10">
                                <button
                                    onClick={() => setViewMode('slide')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'slide' ? 'bg-[#ff5e36] text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                    title="Single Slide Presentation"
                                >
                                    <Presentation className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Slideshow</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('continuous')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'continuous' ? 'bg-[#ff5e36] text-white shadow' : 'text-slate-400 hover:text-white'}`}
                                    title="All Slides Continuous Scroll"
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">All Slides</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span>Word Document Reader (In-Browser)</span>
                        </div>
                    )}

                    {/* Zoom & View Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                            title="Zoom Out"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="font-mono text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer w-14 text-center"
                            title="Click to reset zoom to 100%"
                        >
                            {Math.round(scale * 100)}%
                        </button>
                        <button
                            onClick={handleZoomIn}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                            title="Zoom In"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        {isPdf && (
                            <button
                                onClick={handleRotate}
                                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors ml-1"
                                title="Rotate 90°"
                            >
                                <RotateCw className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={toggleFullscreen}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            )}

            {/* Viewer Stage */}
            <main className="flex-1 relative w-full h-full overflow-auto bg-slate-950 min-h-0">
                {/* Subtle Anti-Scrape Watermark for Protected View-Only Mode */}
                {isViewOnly && (
                    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center opacity-[0.05] select-none overflow-hidden">
                        <div className="rotate-[-25deg] text-center space-y-12">
                            <div className="text-3xl sm:text-5xl font-black uppercase tracking-widest text-white">
                                {userName || 'AUTHORIZED STUDENT'} {studentId ? `• ${studentId}` : ''}
                            </div>
                            <div className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-white">
                                PROTECTED ACADEMIC REFERENCE • DO NOT REDISTRIBUTE
                            </div>
                        </div>
                    </div>
                )}

                {/* Inner Content Scroller: min-w-full and w-max guarantees horizontal & vertical scrolling at 200%+ zoom without clipping */}
                <div className="min-w-full w-max min-h-full flex flex-col items-center justify-start p-4 sm:p-8 pb-28">
                    {/* PDF Canvas Stage */}
                    {isPdf ? (
                        <div className="relative flex flex-col items-center justify-start">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                                    <p className="text-sm text-slate-200 font-semibold font-display">
                                        Rendering Document...
                                    </p>
                                    <span className="text-xs text-slate-400 font-mono">
                                        Canvas Acceleration Active
                                    </span>
                                </div>
                            )}

                            {loadError && (
                                <div className="p-8 max-w-md text-center bg-slate-900 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
                                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                                    <h3 className="text-base font-bold text-white font-display">Document Stream Failed</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">{loadError}</p>
                                    <button
                                        onClick={loadDocument}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/20"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Retry Streaming
                                    </button>
                                </div>
                            )}

                            {!isLoading && !loadError && (
                                <div className="relative shadow-2xl rounded-xl bg-white border border-slate-800 my-2 shrink-0 transition-all duration-150">
                                    <canvas 
                                        ref={canvasRef} 
                                        className="block rounded-xl shadow-inner"
                                    />
                                    {isViewOnly && (
                                        <div 
                                            className="absolute inset-0 z-10 select-none rounded-xl" 
                                            onContextMenu={(e) => e.preventDefault()}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    ) : isDocx ? (
                        /* Word Document In-Browser Render Stage (DOCX) */
                        <div className="relative flex flex-col items-center justify-start w-full max-w-5xl">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                                    <p className="text-sm text-slate-200 font-semibold font-display">
                                        Parsing Word Document...
                                    </p>
                                    <span className="text-xs text-slate-400 font-mono">
                                        DOCX Native Engine
                                    </span>
                                </div>
                            )}

                            {loadError && (
                                <div className="p-8 max-w-md text-center bg-slate-900 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
                                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                                    <h3 className="text-base font-bold text-white font-display">Word Document Stream Failed</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">{loadError}</p>
                                    <button
                                        onClick={loadDocument}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/20"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Retry
                                    </button>
                                </div>
                            )}

                            <div 
                                className={`w-full flex justify-center transition-transform duration-150 origin-top ${isLoading || loadError ? 'hidden' : 'block'}`}
                                style={{ transform: `scale(${scale})` }}
                            >
                                <div 
                                    ref={docxContainerRef}
                                    className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl p-6 sm:p-12 border border-slate-300 relative select-text leading-relaxed docx-document-view"
                                />
                            </div>
                        </div>
                    ) : isPpt ? (
                        /* Presentation Slides In-Browser Render Stage (PPTX) */
                        <div className="relative flex flex-col items-center justify-start w-full">
                            {isLoading && (
                                <div className="flex flex-col items-center justify-center p-12 space-y-3">
                                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                                    <p className="text-sm text-slate-200 font-semibold font-display">
                                        Rendering PowerPoint Slides in Browser...
                                    </p>
                                    <span className="text-xs text-slate-400 font-mono">
                                        Native Presentation Engine Active • Zero External Downloads
                                    </span>
                                </div>
                            )}

                            {loadError && (
                                <div className="p-8 max-w-md text-center bg-slate-900 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
                                    <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
                                    <h3 className="text-base font-bold text-white font-display">Presentation Stream Failed</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed">{loadError}</p>
                                    <button
                                        onClick={loadDocument}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/20"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Retry
                                    </button>
                                </div>
                            )}

                            {!isLoading && !loadError && slides.length > 0 && (
                                viewMode === 'slide' ? (
                                    /* Single Slide Presentation Mode */
                                    <div 
                                        className="relative transition-transform duration-150 origin-top shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-white my-2 inline-block"
                                        style={{ transform: `scale(${scale})` }}
                                    >
                                        <div 
                                            className="relative overflow-hidden select-none pptx-slide-viewport"
                                            dangerouslySetInnerHTML={{ __html: slides[currentSlide - 1] }}
                                        />
                                        {isViewOnly && (
                                            <div 
                                                className="absolute inset-0 z-20 select-none" 
                                                onContextMenu={(e) => e.preventDefault()} 
                                            />
                                        )}
                                    </div>
                                ) : (
                                    /* Continuous All Slides Mode */
                                    <div 
                                        className="w-full flex flex-col items-center gap-8 my-2 transition-transform duration-150 origin-top"
                                        style={{ transform: `scale(${scale})` }}
                                    >
                                        {slides.map((slideHtml, idx) => (
                                            <div 
                                                key={idx}
                                                className="relative shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-white inline-block"
                                            >
                                                <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-md bg-slate-900/80 text-white font-mono text-[11px] backdrop-blur-sm border border-white/10 font-bold shadow-md">
                                                    Slide {idx + 1} of {slides.length}
                                                </div>
                                                <div 
                                                    className="relative overflow-hidden select-none pptx-slide-viewport"
                                                    dangerouslySetInnerHTML={{ __html: slideHtml }}
                                                />
                                                {isViewOnly && (
                                                    <div 
                                                        className="absolute inset-0 z-20 select-none" 
                                                        onContextMenu={(e) => e.preventDefault()} 
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )
                            )}
                        </div>
                    ) : isOffice ? (
                        /* Presentation & Office Documents Showcase (PPT, PPTX) */
                        <div className="w-full max-w-2xl py-8">
                            <div className="bg-slate-900/90 rounded-3xl border border-white/10 p-8 sm:p-12 text-center space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                                
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                                    <FileSpreadsheet className="w-10 h-10" />
                                </div>

                                <div className="space-y-2">
                                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-white/10 text-indigo-300 border border-white/15">
                                        Spreadsheet Guide ({fileExt.toUpperCase()})
                                    </span>
                                <h3 className="text-xl font-extrabold text-white font-display">
                                    {document.title}
                                </h3>
                                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                                    {document.description || 'Verified course reference material cataloged in the academic portal.'}
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2.5 text-xs text-slate-400 font-mono">
                                <div className="flex justify-between">
                                    <span>File Format:</span>
                                    <span className="text-white font-bold uppercase">{fileExt}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>File Size:</span>
                                    <span className="text-white font-bold">{formatBytes(document.file_size)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Access Mode:</span>
                                    <span className={isViewOnly ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                                        {isViewOnly ? 'Protected (View-Only)' : 'Download Permitted'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Original File:</span>
                                    <span className="text-white truncate max-w-[220px]">{document.file_name}</span>
                                </div>
                            </div>

                            {isViewOnly ? (
                                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center justify-center gap-2">
                                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>Protected Content: Downloading and unauthorized copying are strictly disabled.</span>
                                </div>
                            ) : (
                                document.is_downloadable && (
                                    <a
                                        href={route('documents.download', document.id)}
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download {fileExt.toUpperCase()} File
                                    </a>
                                )
                            )}
                        </div>
                    </div>
                ) : (
                    /* Other generic files */
                    <div className="bg-slate-900/90 rounded-3xl border border-white/10 p-8 max-w-md text-center space-y-4 shadow-xl">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                            <FileText className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{document.file_name}</h3>
                        <p className="text-xs text-slate-400">
                            {formatBytes(document.file_size)} • {fileExt.toUpperCase()}
                        </p>
                        {isViewOnly ? (
                            <p className="text-xs text-amber-400 font-semibold">
                                Protected reading mode active.
                            </p>
                        ) : (
                            document.is_downloadable && (
                                <a
                                    href={route('documents.download', document.id)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff5e36] hover:bg-[#e04822] text-white text-xs font-bold shadow-md shadow-[#ff5e36]/20"
                                >
                                    <Download className="w-4 h-4" />
                                    Download File
                                </a>
                            )
                        )}
                    </div>
                )}
                </div>
            </main>
        </div>
    );
}
