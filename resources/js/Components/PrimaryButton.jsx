export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-xl border border-transparent bg-gradient-to-r from-[#ff5e36] to-[#ff416c] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm shadow-[#ff5e36]/30 transition duration-150 ease-in-out hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#ff5e36] focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
