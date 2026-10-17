import React from 'react';

/**
 * Dr. Mohammad Sulieman's Official Lecture Portal Logo
 * Academic graduation mortarboard with 3D open knowledge tablet and orange/black theme.
 */
export default function ApplicationLogo({ className = 'w-10 h-10', imgClassName = '', withBadge = true, ...props }) {
    if (!withBadge) {
        return (
            <img
                src="/images/logo.png"
                alt="Dr. Mohammad Sulieman Academic Lecture Portal"
                className={`object-contain select-none shrink-0 ${className}`}
                {...props}
            />
        );
    }

    return (
        <div className={`relative overflow-hidden rounded-xl bg-white p-0.5 shadow-sm ring-1 ring-black/10 dark:ring-white/15 flex items-center justify-center shrink-0 ${className}`}>
            <img
                src="/images/logo.png"
                alt="Dr. Mohammad Sulieman Academic Lecture Portal"
                className={`w-full h-full object-contain select-none ${imgClassName}`}
                {...props}
            />
        </div>
    );
}
