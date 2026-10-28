import React, { useState, useRef } from 'react';
import { 
    Bold, 
    Italic, 
    Heading2, 
    Heading3, 
    List, 
    ListOrdered, 
    Quote, 
    Code, 
    Link as LinkIcon, 
    Minus, 
    FileText, 
    Eye, 
    Edit3, 
    Sparkles,
    Trash2
} from 'lucide-react';
import RichTextRenderer from './RichTextRenderer';

const TEMPLATES = [
    {
        name: 'Standard Assignment',
        content: `### 🎯 Assignment Objective
Clearly state the core learning objectives and concepts to explore in this task.

### 📋 Instructions & Step-by-Step Requirements
1. **Literature Review**: Read chapters and course notes carefully.
2. **Analysis / Experimentation**: Apply diagnostic principles or run required calculations.
3. **Synthesis & Discussion**: Summarize key findings with proper academic rationale.

### 📦 Submission Deliverables
- A formal PDF or clearly handwritten scanned document.
- Include Student Name, University ID, and Academic Year on the cover.

### ⚖️ Grading Criteria & Rubric
- **Accuracy & Analytical Rigor**: 40%
- **Clarity & Structure**: 30%
- **Adherence to Guidelines**: 30%`
    },
    {
        name: 'Lab Protocol & Report',
        content: `### 🔬 Laboratory Procedure & Diagnostic Protocol
Detail the laboratory investigation or experiment parameters.

### 🧪 Reagents, Materials & Equipment
- Specimen handling requirements
- Standard laboratory diagnostic reagents

### 📋 Clinical / Experimental Workflow
1. Specimen preparation and calibration.
2. Step-by-step procedural execution.
3. Recording observations and microscopic pathology findings.

### 📊 Required Lab Report Output
- Observations table, differential diagnosis, and concluding remarks.`
    },
    {
        name: 'Weekly Practice Exercises',
        content: `### 💡 Weekly Practice Questions
Answer the following problem sets based on this week's lectures:

1. **Question 1**: Explain the pathophysiological mechanism of...
2. **Question 2**: Compare and contrast the clinical presentation of...
3. **Question 3**: Given the following laboratory values, determine...

> **Note**: Cite relevant references from the uploaded course textbook.`
    }
];

export default function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Write assignment instructions, requirements, deliverables, and rubric criteria...',
    label,
    error,
    minRows = 6,
    className = '',
}) {
    const [mode, setMode] = useState('write'); // 'write' | 'preview'
    const textareaRef = useRef(null);

    // Apply formatting wrapper or prefix to selected text in textarea
    const applyFormat = (prefix, suffix = '', defaultText = 'text') => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = value || '';
        const selected = currentText.substring(start, end) || defaultText;

        const replacement = `${prefix}${selected}${suffix}`;
        const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

        if (onChange) {
            onChange(newText);
        }

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + prefix.length,
                start + prefix.length + selected.length
            );
        }, 10);
    };

    // Apply line prefix (e.g. lists, blockquotes, headings)
    const applyLinePrefix = (linePrefix) => {
        if (!textareaRef.current) return;
        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const currentText = value || '';

        // Find start of current line
        const lastNewline = currentText.lastIndexOf('\n', start - 1);
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

        const newText = currentText.substring(0, lineStart) + linePrefix + currentText.substring(lineStart);

        if (onChange) {
            onChange(newText);
        }

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + linePrefix.length,
                start + linePrefix.length
            );
        }, 10);
    };

    const insertTemplate = (templateContent) => {
        if (value && value.trim()) {
            if (!confirm('Apply this template? It will replace or append to your existing text.')) {
                return;
            }
        }
        if (onChange) {
            onChange(templateContent);
        }
    };

    // Handle common keyboard shortcuts
    const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            applyFormat('**', '**', 'bold text');
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            applyFormat('*', '*', 'italic text');
        }
    };

    const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
    const charCount = value.length;

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {label}
                    </label>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{wordCount} words</span>
                        <span>•</span>
                        <span>{charCount} chars</span>
                    </div>
                </div>
            )}

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-[#ff5e36]/30 focus-within:border-[#ff5e36] transition-all">
                {/* Editor Header Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs">
                    {/* Left: Styling buttons */}
                    <div className="flex flex-wrap items-center gap-0.5">
                        <button
                            type="button"
                            onClick={() => applyFormat('**', '**', 'bold text')}
                            title="Bold (Ctrl+B)"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyFormat('*', '*', 'italic text')}
                            title="Italic (Ctrl+I)"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            <Italic className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />

                        <button
                            type="button"
                            onClick={() => applyLinePrefix('## ')}
                            title="Heading 2"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            <Heading2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyLinePrefix('### ')}
                            title="Heading 3"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            <Heading3 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1" />

                        <button
                            type="button"
                            onClick={() => applyLinePrefix('- ')}
                            title="Bullet List"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyLinePrefix('1. ')}
                            title="Numbered List"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            <ListOrdered className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyLinePrefix('> ')}
                            title="Quote / Note"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyFormat('`', '`', 'code')}
                            title="Code snippet"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            <Code className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyFormat('[', '](https://example.com)', 'link text')}
                            title="Insert Link"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyLinePrefix('\n---\n')}
                            title="Divider"
                            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                            <Minus className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Right: Templates & Write/Preview mode switch */}
                    <div className="flex items-center gap-2">
                        {/* Templates Dropdown */}
                        <div className="relative group">
                            <button
                                type="button"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-[#ff5e36] text-[11px] font-bold border border-orange-200 dark:border-orange-900/60 hover:bg-orange-100 transition-colors"
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>Templates</span>
                            </button>
                            <div className="absolute right-0 top-full mt-1 w-52 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-xl py-1 z-20 hidden group-hover:block animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    Load Preset Layout
                                </div>
                                {TEMPLATES.map((tmpl, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => insertTemplate(tmpl.content)}
                                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors"
                                    >
                                        <FileText className="w-3.5 h-3.5 text-[#ff5e36]" />
                                        <span>{tmpl.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Write vs Preview Mode Toggle */}
                        <div className="flex items-center bg-slate-200/80 dark:bg-slate-700/80 rounded-lg p-0.5">
                            <button
                                type="button"
                                onClick={() => setMode('write')}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                                    mode === 'write'
                                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                <Edit3 className="w-3 h-3" />
                                <span>Write</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMode('preview')}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                                    mode === 'preview'
                                        ? 'bg-white dark:bg-slate-900 text-[#ff5e36] shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                                }`}
                            >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Editor Body */}
                {mode === 'write' ? (
                    <textarea
                        ref={textareaRef}
                        rows={minRows}
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange && onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full px-4 py-3 text-sm bg-transparent border-0 focus:ring-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 leading-relaxed font-sans outline-none resize-y"
                    />
                ) : (
                    <div className="p-4 min-h-[160px] max-h-[360px] overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
                        <RichTextRenderer content={value} />
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
        </div>
    );
}
