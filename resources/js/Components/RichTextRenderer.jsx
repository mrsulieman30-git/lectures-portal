import React from 'react';
import { ExternalLink, CheckCircle2, ChevronRight } from 'lucide-react';

/**
 * Parses inline markdown-like styles (bold, italic, inline code, links).
 */
function parseInline(text) {
    if (!text) return null;

    // Tokens matching:
    // 1. [text](url)
    // 2. **bold** or __bold__
    // 3. *italic* or _italic_
    // 4. `code`
    // 5. Raw URLs (https?://\S+)
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_|(https?:\/\/[^\s<]+))/g;

    const elements = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            elements.push(text.substring(lastIndex, match.index));
        }

        if (match[1]?.startsWith('[') && match[2] && match[3]) {
            // [text](url)
            elements.push(
                <a
                    key={`link-${key++}`}
                    href={match[3]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-[#ff5e36] hover:text-[#e04822] hover:underline font-semibold"
                >
                    <span>{match[2]}</span>
                    <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-70" />
                </a>
            );
        } else if (match[4] || match[5]) {
            // **bold** or __bold__
            elements.push(
                <strong key={`bold-${key++}`} className="font-bold text-slate-900 dark:text-white">
                    {match[4] || match[5]}
                </strong>
            );
        } else if (match[6]) {
            // `code`
            elements.push(
                <code
                    key={`code-${key++}`}
                    className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] border border-slate-200 dark:border-white/10"
                >
                    {match[6]}
                </code>
            );
        } else if (match[7] || match[8]) {
            // *italic* or _italic_
            elements.push(
                <em key={`italic-${key++}`} className="italic text-slate-800 dark:text-slate-200">
                    {match[7] || match[8]}
                </em>
            );
        } else if (match[9]) {
            // raw url
            elements.push(
                <a
                    key={`url-${key++}`}
                    href={match[9]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-[#ff5e36] hover:underline break-all"
                >
                    <span>{match[9]}</span>
                    <ExternalLink className="w-3 h-3 inline ml-0.5 opacity-70 shrink-0" />
                </a>
            );
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        elements.push(text.substring(lastIndex));
    }

    return elements;
}

/**
 * RichTextRenderer: Safely and beautifully renders markdown-formatted assignment text.
 */
export default function RichTextRenderer({ content = '', className = '' }) {
    if (!content || !content.trim()) {
        return <p className={`text-slate-400 italic text-xs ${className}`}>No description provided.</p>;
    }

    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const nodes = [];
    let i = 0;
    let nodeKey = 0;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        // 1. Code blocks: ```
        if (trimmed.startsWith('```')) {
            const lang = trimmed.slice(3).trim();
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            nodes.push(
                <div key={`cb-${nodeKey++}`} className="my-2.5 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 text-slate-100 text-xs font-mono shadow-sm">
                    {lang && (
                        <div className="px-3 py-1 bg-slate-800/80 border-b border-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            {lang}
                        </div>
                    )}
                    <pre className="p-3 overflow-x-auto leading-relaxed">
                        <code>{codeLines.join('\n')}</code>
                    </pre>
                </div>
            );
            i++;
            continue;
        }

        // 2. Horizontal divider: --- or ***
        if (/^([-*_]){3,}$/.test(trimmed)) {
            nodes.push(
                <hr key={`hr-${nodeKey++}`} className="my-3 border-t border-slate-200 dark:border-white/10" />
            );
            i++;
            continue;
        }

        // 3. Headings: #, ##, ###
        if (trimmed.startsWith('#')) {
            const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                const text = headingMatch[2];
                if (level === 1) {
                    nodes.push(
                        <h2 key={`h1-${nodeKey++}`} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-3.5 mb-1.5 flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-1 font-display">
                            <span className="w-1.5 h-4 rounded-full bg-[#ff5e36]" />
                            {parseInline(text)}
                        </h2>
                    );
                } else if (level === 2) {
                    nodes.push(
                        <h3 key={`h2-${nodeKey++}`} className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-3 mb-1 flex items-center gap-2 font-display">
                            <span className="w-1.5 h-3.5 rounded-full bg-[#ff5e36]/70" />
                            {parseInline(text)}
                        </h3>
                    );
                } else {
                    nodes.push(
                        <h4 key={`h3-${nodeKey++}`} className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 mt-2.5 mb-1 flex items-center gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 text-[#ff5e36]" />
                            {parseInline(text)}
                        </h4>
                    );
                }
                i++;
                continue;
            }
        }

        // 4. Blockquotes: >
        if (trimmed.startsWith('>')) {
            const quoteLines = [];
            while (i < lines.length && lines[i].trim().startsWith('>')) {
                quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
                i++;
            }
            nodes.push(
                <blockquote key={`bq-${nodeKey++}`} className="border-l-4 border-[#ff5e36] bg-[#ff5e36]/5 dark:bg-[#ff5e36]/10 px-3.5 py-2 my-2 rounded-r-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic space-y-1">
                    {quoteLines.map((ql, idx) => (
                        <p key={idx}>{parseInline(ql)}</p>
                    ))}
                </blockquote>
            );
            continue;
        }

        // 5. Bullet Lists: - or *
        if (/^[-*]\s+/.test(trimmed)) {
            const listItems = [];
            while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
                const itemText = lines[i].trim().replace(/^[-*]\s+/, '');
                listItems.push(itemText);
                i++;
            }
            nodes.push(
                <ul key={`ul-${nodeKey++}`} className="space-y-1.5 my-2 pl-1">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff5e36] mt-2 shrink-0 shadow-xs" />
                            <span className="flex-1 leading-relaxed">{parseInline(item)}</span>
                        </li>
                    ))}
                </ul>
            );
            continue;
        }

        // 6. Numbered Lists: 1. 2. 3.
        if (/^\d+\.\s+/.test(trimmed)) {
            const listItems = [];
            let currentNum = 1;
            while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
                const itemMatch = lines[i].trim().match(/^(\d+)\.\s+(.+)$/);
                if (itemMatch) {
                    listItems.push({ num: itemMatch[1], text: itemMatch[2] });
                }
                i++;
            }
            nodes.push(
                <ol key={`ol-${nodeKey++}`} className="space-y-1.5 my-2 pl-1">
                    {listItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-[#ff5e36] border border-slate-200 dark:border-white/10 shrink-0 mt-0.5">
                                {item.num}
                            </span>
                            <span className="flex-1 leading-relaxed">{parseInline(item.text)}</span>
                        </li>
                    ))}
                </ol>
            );
            continue;
        }

        // 7. Empty line: vertical space
        if (!trimmed) {
            nodes.push(<div key={`sp-${nodeKey++}`} className="h-1.5" />);
            i++;
            continue;
        }

        // 8. Normal paragraph
        nodes.push(
            <p key={`p-${nodeKey++}`} className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {parseInline(line)}
            </p>
        );
        i++;
    }

    return (
        <div className={`rich-text-content space-y-1 ${className}`}>
            {nodes}
        </div>
    );
}
