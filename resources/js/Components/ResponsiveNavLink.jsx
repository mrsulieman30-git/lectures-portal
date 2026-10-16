import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 active:scale-95 ${
                active
                    ? 'bg-gradient-to-r from-[#ff5e36] to-[#e04822] text-white shadow-sm shadow-[#ff5e36]/25 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
