import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/i18n/translations';
import { Globe } from 'lucide-react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [locale, setLocaleState] = useState('en');

    useEffect(() => {
        const savedLocale = localStorage.getItem('portal_locale');
        if (savedLocale && (savedLocale === 'en' || savedLocale === 'so')) {
            setLocaleState(savedLocale);
        }
    }, []);

    const setLocale = (newLocale) => {
        setLocaleState(newLocale);
        localStorage.setItem('portal_locale', newLocale);
    };

    const t = (key, fallback = '') => {
        if (translations[locale] && translations[locale][key] !== undefined) {
            return translations[locale][key];
        }
        if (translations.en && translations.en[key] !== undefined) {
            return translations.en[key];
        }
        return fallback || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (!context) {
        // Fallback if rendered outside provider
        return {
            locale: 'en',
            setLocale: () => {},
            t: (key, fallback = '') => translations.en?.[key] || fallback || key,
        };
    }
    return context;
}

// ─── Real Vector SVG Flags for 100% Cross-Platform Display (Windows, Mac, iOS, Android) ───
export function SomaliFlag({ className = 'w-5 h-3.5' }) {
    return (
        <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/15">
            <svg className={`${className} block`} viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <rect width="600" height="400" fill="#4189DD" />
                <polygon
                    fill="#FFFFFF"
                    points="300,120 324,195 403,195 339,241 364,316 300,270 236,316 261,241 197,195 276,195"
                />
            </svg>
        </span>
    );
}

export function UKFlag({ className = 'w-5 h-3.5' }) {
    return (
        <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.15)] ring-1 ring-slate-900/15">
            <svg className={`${className} block`} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <rect width="60" height="30" fill="#012169" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" strokeWidth="6" />
                <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="2" />
                <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" strokeWidth="10" />
                <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
            </svg>
        </span>
    );
}

export function LanguageSwitcher({ className = '' }) {
    const { locale, setLocale } = useTranslation();

    const isEnglish = locale === 'en';
    const nextLocale = isEnglish ? 'so' : 'en';

    const toggleLanguage = () => {
        setLocale(nextLocale);
    };

    return (
        <button
            type="button"
            onClick={toggleLanguage}
            title={isEnglish ? 'U beddel Soomaali (Switch to Somali)' : 'Switch to English'}
            aria-label={isEnglish ? 'Switch to Somali' : 'Switch to English'}
            className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-150 active:scale-95 hover:border-amber-400/50 dark:hover:border-amber-400/50 cursor-pointer ${className}`}
        >
            {isEnglish ? <SomaliFlag className="w-5 h-3.5" /> : <UKFlag className="w-5 h-3.5" />}
            <span className="text-[11px] font-bold font-mono tracking-tight uppercase group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {isEnglish ? 'SO' : 'EN'}
            </span>
        </button>
    );
}
