import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

import { LanguageProvider } from '@/Context/LanguageContext';
import { ThemeProvider } from '@/Context/ThemeContext';
import PwaPrompt from '@/Components/PwaPrompt';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Register Service Worker for PWA
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch((err) => {
            console.warn('PWA ServiceWorker registration failed: ', err);
        });
    });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <LanguageProvider>
                    <App {...props} />
                    <PwaPrompt />
                </LanguageProvider>
            </ThemeProvider>
        );
    },
    progress: {
        color: '#FF5E36',
    },
});
