import React from 'react';

/**
 * Super-minimalist, professional Medical Laboratory & Hematology Logo.
 * Combines an erythrocyte (red blood cell) disc, precision laboratory cross, 
 * and clinical microscopy reticle.
 */
export default function ApplicationLogo({ className = 'w-10 h-10', ...props }) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <defs>
                <linearGradient id="hematoGrad" x1="10%" y1="10%" x2="90%" y2="90%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="55%" stopColor="#e11d48" />
                    <stop offset="100%" stopColor="#9f1239" />
                </linearGradient>
                <linearGradient id="hematoHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
            </defs>
            
            {/* Base Rounded Hex-Shield / Cell Contour */}
            <rect x="8" y="8" width="84" height="84" rx="26" fill="url(#hematoGrad)" />
            <rect x="8" y="8" width="84" height="42" rx="26" fill="url(#hematoHighlight)" />

            {/* Precision Microscopic Reticle Orbit */}
            <circle
                cx="50"
                cy="50"
                r="32"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="3 5"
                strokeOpacity="0.5"
            />

            {/* Minimalist Clinical Laboratory Cross */}
            <path
                d="M44 26C44 24.3431 45.3431 23 47 23H53C54.6569 23 56 24.3431 56 26V44H74C75.6569 44 77 45.3431 77 47V53C77 54.6569 75.6569 56 74 56H56V74C56 75.6569 54.6569 77 53 77H47C45.3431 77 44 75.6569 44 74V56H26C24.3431 56 23 54.6569 23 53V47C23 45.3431 24.3431 44 26 44H44V26Z"
                fill="white"
            />

            {/* Inner Erythrocyte / Lab Core */}
            <circle cx="50" cy="50" r="5" fill="#be123c" />
        </svg>
    );
}
