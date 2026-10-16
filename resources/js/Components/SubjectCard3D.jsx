import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    BookOpen, 
    FileText, 
    ArrowUpRight, 
    Building2
} from 'lucide-react';
import TiltCard3D from '@/Components/TiltCard3D';

export default function SubjectCard3D({ subject, url, className = '' }) {
    const color = subject.color || '#FF5E36';
    const docsCount = subject.documents_count ?? subject.documents?.length ?? 0;
    const assignmentsCount = subject.assignments_count ?? subject.assignments?.length ?? 0;
    const universityName = subject.university?.name || 'Academic Campus';

    return (
        <TiltCard3D
            maxTilt={10}
            perspective={1200}
            scale={1.025}
            glowColor={color}
            className={`rounded-3xl p-6 transition-all duration-300 liquid-glass border border-white/80 dark:border-white/10 group ${className}`}
            style={{
                borderTop: `3px solid ${color}`,
            }}
        >
            {/* Ambient Colored Backlight Glow */}
            <div
                className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-20 group-hover:opacity-45 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: color }}
            />

            <div className="relative z-10 flex flex-col justify-between h-full preserve-3d">
                {/* Top Row: Course Code & University Identity */}
                <div className="flex items-center justify-between gap-3 translate-z-20">
                    <div className="flex items-center gap-2">
                        <span
                            className="px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider text-white shadow-md"
                            style={{ 
                                backgroundColor: color,
                                boxShadow: `0 4px 15px -2px ${color}60`
                            }}
                        >
                            {subject.code || 'CRS'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate max-w-[170px]">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{universityName}</span>
                        </span>
                    </div>

                    <Link
                        href={url}
                        className="w-8 h-8 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12"
                        aria-label="Open Course Cabinet"
                    >
                        <ArrowUpRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Middle: Title & Description */}
                <div className="mt-5 mb-4 preserve-3d">
                    <Link href={url} className="block">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-[#FF5E36] transition-colors line-clamp-1 translate-z-30 font-display">
                            {subject.title}
                        </h3>
                    </Link>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed translate-z-10">
                        {subject.description || 'Comprehensive lecture notes, reference textbooks, presentation slides, and assignments.'}
                    </p>
                </div>

                {/* Visual Accent Line */}
                <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 my-2 translate-z-10">
                    <div
                        className="h-full rounded-full transition-all duration-700 group-hover:w-full"
                        style={{
                            backgroundColor: color,
                            width: '45%',
                        }}
                    />
                </div>

                {/* Bottom Row: Resource Counters & Launch Button */}
                <div className="pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 translate-z-20">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200" title="Course Materials">
                            <BookOpen className="w-3.5 h-3.5" style={{ color }} />
                            <span>{docsCount}</span>
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200" title="Active Assignments">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>{assignmentsCount}</span>
                        </span>
                    </div>

                    <Link
                        href={url}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-[#FF5E36] transition-colors"
                    >
                        <span>Open Cabinet</span>
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>
                </div>
            </div>
        </TiltCard3D>
    );
}
