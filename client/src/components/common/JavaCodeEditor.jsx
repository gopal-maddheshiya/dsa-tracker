import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Code2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Maximize2,
  Minimize2,
  FileCode2,
  ChevronDown,
  Layers,
} from 'lucide-react';
import {
  highlightJavaCode,
  DEFAULT_JAVA_TEMPLATE,
  APPROACH_OPTIONS,
} from '../../utils/javaCodeHighlighter';
import CopyButton from './CopyButton';

export { highlightJavaCode, DEFAULT_JAVA_TEMPLATE, APPROACH_OPTIONS };


/**
 * JavaCodeEditor Component
 *
 * Provides a full LeetCode / VS Code style editing experience with:
 * - Syntax highlighting (Java keywords, types, strings, comments)
 * - Line numbers gutter synchronized on scroll
 * - Tab key indentation and auto-indent preservation on Enter
 * - Approach selector pill buttons
 * - Copy to clipboard with visual feedback
 * - Expand / Fullscreen toggle
 */
export default function JavaCodeEditor({
  value = '',
  onChange,
  approach = 'optimal',
  onApproachChange,
  readOnly = false,
  minHeight = '240px',
  maxHeight = '420px',
  label = 'Java Solution Code',
  allowApproachSelection = true,
  problemTitle,
}) {
  const [copied, setCopied] = useState(false);
  const [activeLine, setActiveLine] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const lineGutterRef = useRef(null);

  // Split lines for line numbers
  const lines = useMemo(() => {
    const code = value || '';
    const split = code.split('\n');
    return split.length > 0 ? split : [''];
  }, [value]);

  const lineCount = lines.length;
  const charCount = (value || '').length;

  // Highlighted HTML output
  const highlightedHtml = useMemo(() => {
    return highlightJavaCode(value || '');
  }, [value]);

  // Synchronize scrolling between textarea, highlight layer, and line number gutter
  const handleScroll = (e) => {
    const { scrollTop, scrollLeft } = e.target;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (lineGutterRef.current) {
      lineGutterRef.current.scrollTop = scrollTop;
    }
  };

  // Track active line from cursor position
  const updateActiveLine = () => {
    if (!textareaRef.current) return;
    const { selectionStart, value: text } = textareaRef.current;
    const textBeforeCursor = text.substring(0, selectionStart);
    const lineNum = textBeforeCursor.split('\n').length;
    setActiveLine(lineNum);
  };

  // Keyboard ergonomics: Tab indentation, auto-indent on Enter
  const handleKeyDown = (e) => {
    if (readOnly) return;

    // 1. Handle Tab Key
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, selectionEnd, value: currentVal } = textarea;
      const tabSpaces = '    '; // 4 spaces for standard Java style

      if (e.shiftKey) {
        // Shift + Tab: unindent current line
        const lastNewLine = currentVal.lastIndexOf('\n', selectionStart - 1);
        const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
        const lineContent = currentVal.substring(lineStart, selectionStart);

        if (lineContent.startsWith(tabSpaces)) {
          const nextVal =
            currentVal.substring(0, lineStart) +
            currentVal.substring(lineStart + tabSpaces.length);
          onChange && onChange(nextVal);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(
              lineStart,
              selectionStart - tabSpaces.length
            );
          }, 0);
        }
      } else {
        // Tab: insert 4 spaces
        const nextVal =
          currentVal.substring(0, selectionStart) +
          tabSpaces +
          currentVal.substring(selectionEnd);
        onChange && onChange(nextVal);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + tabSpaces.length;
          updateActiveLine();
        }, 0);
      }
      return;
    }

    // 2. Handle Enter Key (Preserve indent & auto-indent after '{')
    if (e.key === 'Enter') {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionStart, value: currentVal } = textarea;
      const lastNewLine = currentVal.lastIndexOf('\n', selectionStart - 1);
      const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
      const currentLine = currentVal.substring(lineStart, selectionStart);

      // Match leading whitespace
      const matchIndent = currentLine.match(/^(\s*)/);
      let indent = matchIndent ? matchIndent[1] : '';

      // If line ends with '{', increase indent
      if (currentLine.trim().endsWith('{')) {
        indent += '    ';
      }

      if (indent.length > 0) {
        e.preventDefault();
        const nextVal =
          currentVal.substring(0, selectionStart) +
          '\n' +
          indent +
          currentVal.substring(selectionStart);
        onChange && onChange(nextVal);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd =
            selectionStart + 1 + indent.length;
          updateActiveLine();
        }, 0);
      }
    }
  };

  // Copy code handler
  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Load starter template
  const handleLoadTemplate = () => {
    if (value && value.trim().length > 0) {
      if (!window.confirm('Replace existing code with standard Java template?')) {
        return;
      }
    }
    onChange && onChange(DEFAULT_JAVA_TEMPLATE);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Wheel forwarding to parent container when code editor reaches boundaries or is non-scrollable
  const handleEditorWheel = (e) => {
    const el = textareaRef.current;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight + 4;
    if (!isScrollable) {
      const modalScroll = el.closest('.overflow-y-auto') || el.closest('[data-lenis-prevent]');
      if (modalScroll && modalScroll !== el) {
        modalScroll.scrollTop += e.deltaY;
      }
      return;
    }
    const atTop = el.scrollTop <= 0 && e.deltaY < 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2 && e.deltaY > 0;
    if (atTop || atBottom) {
      const modalScroll = el.closest('.overflow-y-auto') || el.closest('[data-lenis-prevent]');
      if (modalScroll && modalScroll !== el) {
        modalScroll.scrollTop += e.deltaY;
      }
    }
  };

  const handleReadOnlyWheel = (e) => {
    const el = e.currentTarget;
    if (!el) return;
    const isScrollable = el.scrollHeight > el.clientHeight + 4;
    if (!isScrollable) {
      const modalScroll = el.closest('.overflow-y-auto') || el.closest('[data-lenis-prevent]');
      if (modalScroll && modalScroll !== el) {
        modalScroll.scrollTop += e.deltaY;
      }
      return;
    }
    const atTop = el.scrollTop <= 0 && e.deltaY < 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2 && e.deltaY > 0;
    if (atTop || atBottom) {
      const modalScroll = el.closest('.overflow-y-auto') || el.closest('[data-lenis-prevent]');
      if (modalScroll && modalScroll !== el) {
        modalScroll.scrollTop += e.deltaY;
      }
    }
  };

  // Clear code
  const handleClear = () => {
    if (value && value.trim().length > 0) {
      if (window.confirm('Clear all code?')) {
        onChange && onChange('');
      }
    }
  };

  const selectedApproach =
    APPROACH_OPTIONS.find((opt) => opt.value === approach) || APPROACH_OPTIONS[0];

  return (
    <div
      data-lenis-prevent
      className={`rounded-xl border border-line bg-[#0d1117] shadow-xl overflow-hidden flex flex-col transition-all duration-200 ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl max-h-none' : ''
      }`}
    >
      {/* 1. Editor Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#161b22] border-b border-line/80 select-none">
        <div className="flex items-center gap-2.5">
          {/* Language Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#21262d] border border-line/60 text-xs font-mono font-medium text-amber-300 shadow-xs">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Java</span>
            <span className="text-[10px] text-muted font-sans font-normal ml-0.5">
              JDK 17/21
            </span>
          </div>

          {/* Current Approach Tag or Selector Trigger */}
          {allowApproachSelection ? (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted hidden sm:inline">Approach:</span>
              <div className="flex items-center gap-1 p-0.5 bg-[#0d1117] rounded-lg border border-line/80">
                {APPROACH_OPTIONS.map((opt) => {
                  const isCur = approach === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onApproachChange && onApproachChange(opt.value)}
                      title={opt.description}
                      className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                        isCur
                          ? `${opt.badgeClass} border shadow-xs font-semibold`
                          : 'text-text-secondary hover:text-text hover:bg-[#21262d]'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${opt.dotClass}`} />
                      <span>{opt.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${selectedApproach.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${selectedApproach.dotClass}`} />
              <span>{selectedApproach.label}</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 text-xs text-muted">
          {/* Metrics */}
          <span className="text-[11px] font-mono text-muted hidden md:inline px-1.5">
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {charCount} chars
          </span>

          {!readOnly && (
            <>
              {/* Load Template */}
              <button
                type="button"
                onClick={handleLoadTemplate}
                title="Load clean Java solution boilerplate"
                className="px-2 py-1 text-[11px] font-mono text-muted hover:text-text bg-[#21262d] hover:bg-[#30363d] rounded border border-line/60 transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Template</span>
              </button>

              {/* Clear */}
              {charCount > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  title="Clear code"
                  className="px-2 py-1 text-[11px] font-mono text-muted hover:text-danger bg-[#21262d] hover:bg-danger/15 rounded border border-line/60 transition-colors"
                >
                  Clear
                </button>
              )}
            </>
          )}

          {/* Morphing Animated Copy Button */}
          <CopyButton
            text={value}
            label="Copy"
            copiedLabel="Copied!"
            disabled={charCount === 0}
            className="!px-2.5 !py-1 !text-[11px] !bg-[#21262d] hover:!bg-[#30363d]"
          />

          {/* Expand / Minimize Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Exit full screen' : 'Full screen editor'}
            className="p-1 text-muted hover:text-text bg-[#21262d] hover:bg-[#30363d] rounded border border-line/60 transition-colors"
          >
            {isExpanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Code Area with Line Numbers Gutter */}
      <div
        className="relative flex flex-1 overflow-hidden font-mono text-xs"
        style={{
          minHeight: isExpanded ? 'calc(100vh - 120px)' : minHeight,
          maxHeight: isExpanded ? 'calc(100vh - 120px)' : maxHeight,
        }}
      >
        {/* Line Numbers Gutter */}
        <div
          ref={lineGutterRef}
          aria-hidden="true"
          className="w-12 bg-[#0d1117] border-r border-line/70 select-none overflow-hidden shrink-0 py-3 text-right pr-2.5 leading-[20px]"
        >
          {lines.map((_, idx) => {
            const lineNum = idx + 1;
            const isCur = lineNum === activeLine;
            return (
              <div
                key={lineNum}
                className={`font-mono text-[11px] transition-colors ${
                  isCur
                    ? 'text-amber-400 font-bold drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                    : 'text-slate-500/60'
                }`}
              >
                {lineNum}
              </div>
            );
          })}
        </div>

        {/* Code Container: Overlayed Textarea & Syntax-Highlighted Layer */}
        <div className="relative flex-1 overflow-hidden bg-[#0a0d14]">
          {!readOnly ? (
            <>
              {/* Syntax Highlighted Background Layer */}
              <pre
                ref={preRef}
                aria-hidden="true"
                className="absolute inset-0 p-3 m-0 overflow-hidden font-mono text-xs leading-[20px] whitespace-pre pointer-events-none select-none tab-size-4"
                dangerouslySetInnerHTML={{
                  __html: highlightedHtml + (value?.endsWith('\n') ? ' ' : ''),
                }}
              />

              {/* Editable Transparent Textarea (Top Layer) */}
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  onChange && onChange(e.target.value);
                  updateActiveLine();
                }}
                onScroll={handleScroll}
                onWheel={handleEditorWheel}
                onKeyDown={handleKeyDown}
                onClick={updateActiveLine}
                onKeyUp={updateActiveLine}
                placeholder={`// Write or paste your Java code here...\n// e.g. class Solution {\n//     public int solve(...) {\n//     }\n// }`}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="absolute inset-0 p-3 m-0 w-full h-full font-mono text-xs leading-[20px] whitespace-pre bg-transparent text-transparent caret-amber-400 resize-none border-0 outline-none focus:ring-0 selection:bg-indigo-500/30 selection:text-transparent placeholder:text-slate-500/50 tab-size-4 overflow-auto"
              />
            </>
          ) : (
            /* Read-only interactive scroll wrapper */
            <div
              onScroll={handleScroll}
              onWheel={handleReadOnlyWheel}
              className="absolute inset-0 p-3 m-0 overflow-auto font-mono text-xs leading-[20px] whitespace-pre tab-size-4 select-text"
            >
              <pre
                className="m-0 p-0 font-mono text-xs leading-[20px]"
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Status Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161b22] border-t border-line/60 text-[10px] text-muted font-mono select-none">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready</span>
          </span>
          <span>·</span>
          <span>UTF-8</span>
          <span>·</span>
          <span>Spaces: 4</span>
        </div>

        <div className="flex items-center gap-2">
          <span>Ln {activeLine}, Col 1</span>
        </div>
      </div>
    </div>
  );
}
