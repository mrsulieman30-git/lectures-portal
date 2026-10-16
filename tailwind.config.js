import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Plus Jakarta Sans"', ...defaultTheme.fontFamily.sans],
                display: ['"Outfit"', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: {
                    50: '#fff5f0',
                    100: '#ffe8dd',
                    200: '#ffd0bc',
                    300: '#ffb091',
                    400: '#ff855c',
                    500: '#ff5e36',
                    600: '#f04218',
                    700: '#c8310e',
                    800: '#9d270e',
                    900: '#7e2410',
                    DEFAULT: '#ff5e36',
                },
                nimbuzz: {
                    orange: '#FF5E36',
                    coral: '#FF416C',
                    amber: '#FF9900',
                    dark: '#14171F',
                    slate: '#1E2330',
                },
                female: {
                    rose: '#F43F5E',
                    pink: '#EC4899',
                    soft: '#FFF1F2',
                },
            },
            animation: {
                'float-slow': 'float 8s ease-in-out infinite',
                'float-reverse': 'float-reverse 9s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2.5s linear infinite',
                'aurora': 'aurora 15s ease infinite',
                'spin-slow': 'spin 20s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-14px) rotate(1.5deg)' },
                },
                'float-reverse': {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(14px) rotate(-1.5deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
                    '50%': { opacity: '1', transform: 'scale(1.05)' },
                },
                shimmer: {
                    'from': { backgroundPosition: '200% 0' },
                    'to': { backgroundPosition: '-200% 0' },
                },
                aurora: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            },
            boxShadow: {
                'liquid-glass': '0 8px 32px 0 rgba(31, 38, 135, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.6)',
                'liquid-glow': '0 20px 50px -15px rgba(255, 94, 54, 0.35)',
                'nimbuzz-glow': '0 12px 35px -8px rgba(255, 94, 54, 0.45)',
                'female-glow': '0 12px 35px -8px rgba(244, 63, 94, 0.4)',
                'apple-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.7)',
                'apple-glass-dark': '0 12px 40px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)',
                'neon-violet': '0 0 35px -5px rgba(139, 92, 246, 0.45)',
                'neon-cyan': '0 0 35px -5px rgba(6, 182, 212, 0.45)',
            },
        },
    },

    plugins: [forms],
};
