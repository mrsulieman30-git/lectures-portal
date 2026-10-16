import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, Sparkles } from 'lucide-react';

export default function PwaPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already in standalone mode
        const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        if (isApp) {
            setIsStandalone(true);
            return;
        }

        // Check if previously dismissed in this session
        if (sessionStorage.getItem('pwa_prompt_dismissed')) {
            return;
        }

        // iOS detection
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIos(isIosDevice);

        if (isIosDevice) {
            // Delay slightly on iOS for smooth entrance
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 2500);
            return () => clearTimeout(timer);
        }

        // Standard beforeinstallprompt for Chromium / Edge / Android
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (isStandalone || !showPrompt) {
        return null;
    }

    return (
        <aside
            aria-label="Install App Banner"
            className="fixed bottom-5 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-6 duration-300 pointer-events-auto"
        >
            <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-slate-950/85 p-4 text-white shadow-2xl backdrop-blur-xl ring-1 ring-white/10 dark:bg-neutral-900/90">
                {/* Glow accent */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/20 blur-2xl" />

                <div className="flex items-start gap-3.5">
                    {/* App Icon */}
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-md ring-2 ring-white/20">
                        <Smartphone className="h-6 w-6 text-white" />
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-slate-950">
                            <Sparkles className="h-2.5 w-2.5 text-white" />
                        </span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold tracking-tight text-white">
                                Install Lecture Portal App
                            </h4>
                            <button
                                onClick={handleDismiss}
                                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
                                aria-label="Dismiss banner"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-300/90 leading-relaxed">
                            Fast access, offline lectures & instant updates right on your home screen.
                        </p>

                        {isIos ? (
                            <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] text-amber-200 border border-amber-400/20">
                                <span>Tap</span>
                                <Share2 className="inline h-3.5 w-3.5 text-sky-400" />
                                <span>then select</span>
                                <strong className="font-semibold text-white flex items-center gap-1">
                                    <PlusSquare className="h-3 w-3" /> Add to Home Screen
                                </strong>
                            </div>
                        ) : (
                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    onClick={handleInstallClick}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 active:scale-95"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    Install App
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="rounded-xl px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
                                >
                                    Not now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
