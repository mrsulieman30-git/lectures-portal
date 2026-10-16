import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share2, PlusSquare, Sparkles, CheckCircle, MoreVertical } from 'lucide-react';

export default function PwaPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showManualGuide, setShowManualGuide] = useState(false);

    useEffect(() => {
        // Check if running as installed standalone PWA
        const isApp = 
            window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');
            
        if (isApp) {
            setIsStandalone(true);
            return;
        }

        // iOS detection
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIos(isIosDevice);

        // Capture standard beforeinstallprompt
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Always show the prompt on mobile after 1.5 seconds if not installed
        const timer = setTimeout(() => {
            if (!sessionStorage.getItem('pwa_prompt_dismissed')) {
                setShowPrompt(true);
            }
        }, 1500);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setShowPrompt(false);
            }
            setDeferredPrompt(null);
        } else {
            // If beforeinstallprompt hasn't fired or is not supported (iOS / Firefox / Chrome variant), show manual 1-click guide
            setShowManualGuide(true);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setShowManualGuide(false);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (isStandalone || !showPrompt) {
        return null;
    }

    return (
        <aside
            aria-label="Install App Banner"
            className="fixed bottom-4 left-3 right-3 sm:bottom-6 sm:left-auto sm:right-6 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
        >
            <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 dark:border-white/15 bg-white/95 dark:bg-slate-900/95 p-4 text-slate-900 dark:text-white shadow-2xl backdrop-blur-2xl ring-1 ring-slate-900/10">
                {/* Glow accent */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-500/15 blur-2xl" />

                <div className="flex items-start gap-3">
                    {/* App Icon */}
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-amber-600 shadow-md ring-2 ring-rose-500/20">
                        <img 
                            src="/icons/icon-192.png" 
                            alt="Dr. Sulieman Portal" 
                            className="h-10 w-10 rounded-xl object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900">
                            <Sparkles className="h-2.5 w-2.5 text-white" />
                        </span>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                                Install Dr. Sulieman Portal App
                            </h4>
                            <button
                                onClick={handleDismiss}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-700 dark:hover:text-white transition shrink-0 ml-1"
                                aria-label="Dismiss banner"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-snug">
                            Instant access to hematology lectures & offline course cabinets on your home screen.
                        </p>

                        {/* Manual Guide Expand */}
                        {showManualGuide ? (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 text-[11px] text-slate-700 dark:text-rose-200 space-y-1 animate-in fade-in">
                                {isIos ? (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span>1. Tap</span>
                                        <Share2 className="inline h-3.5 w-3.5 text-sky-500" />
                                        <span><strong>Share</strong> at bottom</span>
                                        <span>2. Tap <strong>'Add to Home Screen'</strong></span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span>1. Tap browser menu</span>
                                        <MoreVertical className="inline h-3.5 w-3.5 text-rose-500" />
                                        <span>2. Tap <strong>'Install app'</strong> or <strong>'Add to Home screen'</strong></span>
                                    </div>
                                )}
                            </div>
                        ) : isIos ? (
                            <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-white/5 px-2.5 py-1.5 text-[11px] text-rose-700 dark:text-amber-200 border border-rose-200 dark:border-amber-400/20">
                                <span>Tap</span>
                                <Share2 className="inline h-3.5 w-3.5 text-sky-500" />
                                <span>then</span>
                                <strong className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                                    <PlusSquare className="h-3 w-3" /> Add to Home Screen
                                </strong>
                            </div>
                        ) : (
                            <div className="mt-3 flex items-center gap-2">
                                <button
                                    onClick={handleInstallClick}
                                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 via-coral-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/25 transition hover:brightness-110 active:scale-95 cursor-pointer"
                                >
                                    <Download className="h-3.5 w-3.5" />
                                    <span>Download / Install</span>
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
                                >
                                    Later
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}
