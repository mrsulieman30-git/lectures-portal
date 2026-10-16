import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('portal_theme');
            if (saved === 'dark' || saved === 'light') {
                return saved;
            }
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('portal_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    const setTheme = (newTheme) => {
        if (newTheme === 'dark' || newTheme === 'light') {
            setThemeState(newTheme);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        return {
            theme: 'light',
            isDark: false,
            toggleTheme: () => {},
            setTheme: () => {},
        };
    }
    return context;
}

export function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme, isDark } = useTheme();

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Light / Dark Mode"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-xl transition-all duration-200 border flex items-center justify-center ${
                isDark
                    ? 'bg-slate-800/80 text-amber-400 border-slate-700 hover:bg-slate-700/80 hover:text-amber-300 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 shadow-sm'
            } ${className}`}
        >
            {isDark ? (
                <Sun className="w-4 h-4 transition-transform hover:rotate-45" />
            ) : (
                <Moon className="w-4 h-4 transition-transform hover:-rotate-12" />
            )}
        </button>
    );
}
