import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'h-9 shrink-0 inline-flex items-center justify-center px-3.5 rounded-xl text-xs lg:text-sm font-semibold transition-all duration-150 active:scale-95 select-none whitespace-nowrap ' +
                (active
                    ? 'bg-gradient-to-r from-[#ff5e36] to-[#e04822] text-white shadow-sm shadow-[#ff5e36]/25 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
