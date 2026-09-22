import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Code2,
  Copy,
  Check,
  Edit3,
  Save,
  X,
  Terminal,
  Sparkles,
  Maximize2,
  Minimize2,
  WrapText,
  Palette,
  CheckCircle2,
  Cpu,
  Database
} from 'lucide-react';
import { updateProblem } from '../../api/problems';
import { useToast } from '../../context/ToastContext';
import { useDialog } from '../../hooks/useDialog';

import { colors } from '../../theme/colors';

const SUPPORTED_LANGS = [
  { id: 'cpp',        label: 'C++',        ext: '.cpp' },
  { id: 'python',     label: 'Python 3',   ext: '.py' },
  { id: 'java',       label: 'Java',       ext: '.java' },
  { id: 'javascript', label: 'JavaScript', ext: '.js' },
  { id: 'typescript', label: 'TypeScript', ext: '.ts' },
  { id: 'go',         label: 'Go',         ext: '.go' },
  { id: 'rust',       label: 'Rust',       ext: '.rs' },
];

const THEMES = {
  obsidian: {
    id: 'obsidian',
    name: 'LeetCode Dark',
    bg: colors.bg,
    gutterBg: colors.surface,
    border: colors.line,
    text: colors.text,
    activeLine: 'rgba(255,161,22,0.06)'
  },
  midnight: {
    id: 'midnight',
    name: 'Charcoal',
    bg: colors.surface2,
    gutterBg: colors.surface,
    border: colors.line,
    text: colors.textSecondary,
    activeLine: 'rgba(255,161,22,0.06)'
  },
  matrix: {
    id: 'matrix',
    name: 'Teal Dark',
    bg: colors.bg,
    gutterBg: colors.surface,
    border: colors.line,
    text: colors.easy,
    activeLine: `${colors.easy}0f`
  }
};

const SolutionCodeViewer = ({ problem, onProblemUpdated }) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(problem?.solutionCode || '');
  const [language, setLanguage] = useState(problem?.solutionLanguage || 'cpp');
  const [themeKey, setThemeKey] = useState('obsidian');
  const [wordWrap, setWordWrap] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [timeComplexity, setTimeComplexity] = useState(problem?.timeComplexity || '');
  const [spaceComplexity, setSpaceComplexity] = useState(problem?.spaceComplexity || '');
  const [intuition, setIntuition] = useState(problem?.intuition || '');
  const [copied, setCopied] = useState(false);

  const modalRef = useRef(null);

  useDialog({
    isOpen: isExpanded,
    onClose: () => setIsExpanded(false),
    dialogRef: modalRef,
    closeOnEscape: true,
  });

  useEffect(() => {
    setCode(problem?.solutionCode || '');
    setLanguage(problem?.solutionLanguage || 'cpp');
    setTimeComplexity(problem?.timeComplexity || '');
    setSpaceComplexity(problem?.spaceComplexity || '');
    setIntuition(problem?.intuition || '');
  }, [problem]);

  const problemId = problem?._id || problem?.id;

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast?.success ? toast.success('Code copied to clipboard!') : null;
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast?.error ? toast.error('Failed to copy code.') : null;
    }
  };

  const handleSave = async () => {
    if (!problemId) {
      toast?.error ? toast.error('Problem reference not found.') : null;
      return;
    }
    setIsSaving(true);
    try {
      const res = await updateProblem(problemId, {
        solutionCode: code,
        solutionLanguage: language,
        timeComplexity: timeComplexity.trim(),
        spaceComplexity: spaceComplexity.trim(),
        intuition: intuition.trim(),
      });
      if (res.success) {
        toast?.success ? toast.success('Solution code and complexities saved!') : null;
        setIsEditing(false);
        onProblemUpdated?.(res.data);
      }
    } catch (err) {
      toast?.error ? toast.error(err.response?.data?.message || 'Failed to save solution code.') : null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    // Tab key 4-space indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const lines = (code || '').split('\n');
  const currentLangObj = SUPPORTED_LANGS.find((l) => l.id === language) || SUPPORTED_LANGS[0];
  const activeTheme = THEMES[themeKey] || THEMES.obsidian;

  const container = (
    <div
      className={`panel overflow-hidden border transition-all duration-300 rounded-xl flex flex-col ${
        isExpanded
          ? 'w-full max-w-5xl h-[92vh] max-h-[880px] bg-surface shadow-modal z-50'
          : 'relative'
      }`}
      style={{ borderColor: activeTheme.border }}
      onClick={(e) => isExpanded && e.stopPropagation()}
    >
      {/* ── IDE Window Header ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-5 py-3 border-b border-line bg-surface-2/40 gap-2.5">
        
        {/* Left: Window Dots + Title */}
        <div className="flex items-center gap-3">
          {/* Traffic Light Dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-danger/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-medium/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-success/80" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text tracking-tight">
              Optimal Solution Snippet
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-surface-2 border border-line text-muted">
              {code ? `${lines.length} lines` : 'Empty'}
            </span>
          </div>
        </div>

        {/* Right: Actions, Language, Theme, and Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {isEditing ? (
            <>
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-surface border border-line text-xs font-mono text-text focus:outline-none focus:border-accent cursor-pointer"
              >
                {SUPPORTED_LANGS.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-surface text-text">
                    {lang.label} ({lang.ext})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => {
                  setCode(problem?.solutionCode || '');
                  setLanguage(problem?.solutionLanguage || 'cpp');
                  setIsEditing(false);
                }}
                className="px-3 h-8 rounded-lg text-xs text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary px-3.5 h-8 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving…' : 'Save Solution'}</span>
              </button>
            </>
          ) : (
            <>
              {/* Theme Pill Switcher */}
              <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-surface-2 border border-line text-xs font-mono">
                {Object.values(THEMES).map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setThemeKey(th.id)}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      themeKey === th.id
                        ? 'bg-surface text-text font-semibold border border-line'
                        : 'text-muted hover:text-text'
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>

              {/* Language Chip */}
              <span className="text-xs font-mono font-semibold px-2 py-1 rounded-lg bg-accent/12 border border-accent/25 text-accent">
                {currentLangObj.label}
              </span>

              {/* Word wrap toggle */}
              {code && (
                <button
                  type="button"
                  onClick={() => setWordWrap(!wordWrap)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    wordWrap
                      ? 'bg-accent/12 border-accent/25 text-accent'
                      : 'border-transparent text-muted hover:text-text hover:bg-surface-2'
                  }`}
                  title={wordWrap ? 'Disable Word Wrap' : 'Enable Word Wrap'}
                >
                  <WrapText className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Copy Code Button */}
              {code && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-surface border border-line text-xs font-mono text-text transition-all cursor-pointer"
                  title="Copy Solution Code"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-success" />
                      <span className="text-xs text-success font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-muted" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </button>
              )}

              {/* Expand / Maximize toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                title={isExpanded ? 'Exit Full Screen' : 'Expand Full Screen'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Edit / Add Code Button */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-secondary px-3 h-8 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{code ? 'Edit Code' : '+ Add Code'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Editor or Viewer Body ───────────────────────────────────── */}
      {isEditing ? (
        <div className="flex-1 flex flex-col divide-y divide-line" style={{ backgroundColor: activeTheme.bg }}>
          {/* Complexity & Intuition Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-surface-2/30">
            <div>
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Cpu className="w-3.5 h-3.5 text-accent" />
                <span>Time Complexity</span>
              </label>
              <input
                type="text"
                value={timeComplexity}
                onChange={(e) => setTimeComplexity(e.target.value)}
                placeholder="e.g. O(N), O(N log N)"
                className="w-full px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-mono text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Database className="w-3.5 h-3.5 text-medium" />
                <span>Space Complexity</span>
              </label>
              <input
                type="text"
                value={spaceComplexity}
                onChange={(e) => setSpaceComplexity(e.target.value)}
                placeholder="e.g. O(1), O(N)"
                className="w-full px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-mono text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>Core Intuition / Algorithmic Pattern / Edge Cases</span>
              </label>
              <textarea
                rows={2}
                value={intuition}
                onChange={(e) => setIntuition(e.target.value)}
                placeholder="Key insight, invariant, or edge case trick to remember during interviews..."
                className="w-full px-3 py-1.5 rounded-lg bg-surface border border-line text-xs text-text focus:outline-none focus:border-accent leading-relaxed resize-y placeholder:text-muted"
              />
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              rows={isExpanded ? 22 : 14}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`// Paste or write your optimal ${currentLangObj.label} implementation here...\n// Press Tab to insert 4 spaces.`}
              className="w-full flex-1 font-mono text-xs sm:text-sm text-text bg-transparent border-0 focus:outline-none resize-y leading-relaxed selection:bg-accent/30 placeholder:text-muted"
              spellCheck={false}
              autoFocus
            />
          </div>
        </div>
      ) : (
        <>
          {/* Complexity & Intuition Readout (When available) */}
          {(problem?.timeComplexity || problem?.spaceComplexity || problem?.intuition) && (
            <div className="p-4 border-b border-line bg-surface-2/20 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                {problem.timeComplexity && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/25 text-xs font-mono font-medium text-accent">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Time: {problem.timeComplexity}</span>
                  </span>
                )}
                {problem.spaceComplexity && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-medium/10 border border-medium/25 text-xs font-mono font-medium text-medium">
                    <Database className="w-3.5 h-3.5" />
                    <span>Space: {problem.spaceComplexity}</span>
                  </span>
                )}
              </div>
              {problem.intuition && (
                <div className="p-3 rounded-lg bg-surface border border-line text-xs text-text-secondary leading-relaxed">
                  <div className="flex items-center gap-1.5 font-semibold text-text mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span>Core Intuition & Strategy</span>
                  </div>
                  <p className="whitespace-pre-wrap">{problem.intuition}</p>
                </div>
              )}
            </div>
          )}

          {code ? (
            <div
              className={`relative overflow-x-auto flex text-xs sm:text-sm font-mono divide-x divide-line transition-all ${
                isExpanded ? 'flex-1 max-h-[85vh]' : 'max-h-[480px]'
              }`}
              style={{ backgroundColor: activeTheme.bg }}
            >
              {/* Line Numbers Column */}
              <div
                className="select-none py-4 px-3 text-right text-muted font-mono text-xs leading-relaxed shrink-0 border-r border-line"
                style={{ backgroundColor: activeTheme.gutterBg }}
              >
                {lines.map((_, idx) => (
                  <div key={idx} className="h-[21px] leading-[21px]">
                    {idx + 1}
                  </div>
                ))}
              </div>

              {/* Actual Code View with optional Word Wrap */}
              <pre
                className={`py-4 px-4 leading-relaxed overflow-x-auto flex-1 font-mono selection:bg-accent/30 ${
                  wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
                }`}
                style={{ color: activeTheme.text }}
              >
                <code>{code}</code>
              </pre>
            </div>
          ) : (
            /* Empty State */
            <div className="p-10 text-center bg-surface">
              <div className="w-12 h-12 rounded-xl bg-surface-2 border border-line flex items-center justify-center mx-auto mb-3 text-muted">
                <Terminal className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-text">No Solution Snippet Saved</h4>
              <p className="text-xs text-muted mt-1.5 max-w-md mx-auto leading-relaxed">
                Record your optimal solution, time and space complexities, or memory notes to review during spaced repetition recall sessions.
              </p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-5 btn-primary text-xs inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add Solution Snippet</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (isExpanded) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3 sm:p-6 animate-fade-in"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setIsExpanded(false);
        }}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label="Expanded Solution Code Viewer"
          tabIndex={-1}
          data-lenis-prevent
          className="w-full max-w-5xl h-full max-h-[92vh] flex flex-col outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {container}
        </div>
      </div>,
      document.body
    );
  }

  return container;
};

export default SolutionCodeViewer;
