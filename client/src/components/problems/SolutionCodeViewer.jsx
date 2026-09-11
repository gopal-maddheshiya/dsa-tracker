import React, { useState, useEffect } from 'react';
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
    name: 'Obsidian',
    bg: '#0A0C10',
    gutterBg: '#07080B',
    border: 'rgba(255,255,255,0.08)',
    text: '#E2E8F0',
    activeLine: 'rgba(249,115,22,0.06)'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    bg: '#0D1117',
    gutterBg: '#090D12',
    border: 'rgba(56,189,248,0.15)',
    text: '#E6EDF3',
    activeLine: 'rgba(56,189,248,0.06)'
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix',
    bg: '#050D0A',
    gutterBg: '#030806',
    border: 'rgba(16,185,129,0.2)',
    text: '#A7F3D0',
    activeLine: 'rgba(16,185,129,0.08)'
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(problem?.solutionCode || '');
    setLanguage(problem?.solutionLanguage || 'cpp');
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
      });
      if (res.success) {
        toast?.success ? toast.success('Solution code updated successfully!') : null;
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

  return (
    <div
      className={`panel overflow-hidden border transition-all duration-300 rounded-2xl shadow-xl ${
        isExpanded ? 'fixed inset-4 sm:inset-8 z-50 flex flex-col bg-[#0A0C10]' : 'relative'
      }`}
      style={{ borderColor: activeTheme.border }}
    >
      {/* ── IDE Window Header ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between px-4 sm:px-5 py-3 border-b border-white/[0.08] bg-[#0E1116] gap-2.5">
        
        {/* Left: Window Dots + Title */}
        <div className="flex items-center gap-3">
          {/* Mac Terminal Traffic Light Dots */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-[0_0_6px_rgba(244,63,94,0.4)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.4)]" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#F3F4F6] tracking-tight">
              Optimal Solution Snippet
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[#9CA3AF]">
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
                className="h-8 px-2.5 rounded-lg bg-[#151821] border border-white/[0.1] text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                {SUPPORTED_LANGS.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-[#101217]">
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
                className="px-3 h-8 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-3.5 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-semibold text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving…' : 'Save Solution'}</span>
              </button>
            </>
          ) : (
            <>
              {/* Theme Pill Switcher */}
              <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] font-mono">
                {Object.values(THEMES).map((th) => (
                  <button
                    key={th.id}
                    onClick={() => setThemeKey(th.id)}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      themeKey === th.id
                        ? 'bg-white/[0.12] text-white font-bold'
                        : 'text-[#6B7280] hover:text-[#9CA3AF]'
                    }`}
                  >
                    {th.name}
                  </button>
                ))}
              </div>

              {/* Language Chip */}
              <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-orange-400">
                {currentLangObj.label}
              </span>

              {/* Word wrap toggle */}
              {code && (
                <button
                  type="button"
                  onClick={() => setWordWrap(!wordWrap)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    wordWrap
                      ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                      : 'border-transparent text-[#6B7280] hover:text-[#9CA3AF] hover:bg-white/[0.04]'
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
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
                  title="Copy Solution Code"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              )}

              {/* Expand / Maximize toggle */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#9CA3AF] hover:bg-white/[0.06] transition-colors cursor-pointer"
                title={isExpanded ? 'Exit Full Screen' : 'Expand Full Screen'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Edit / Add Code Button */}
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 h-8 rounded-lg bg-orange-500/10 hover:bg-orange-500 border border-orange-500/30 hover:border-transparent text-xs font-semibold text-orange-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
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
        <div className="p-4 flex-1 flex flex-col" style={{ backgroundColor: activeTheme.bg }}>
          <textarea
            rows={isExpanded ? 24 : 14}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`// Paste or write your optimal ${currentLangObj.label} implementation here...\n// Press Tab to insert 4 spaces.`}
            className="w-full flex-1 font-mono text-xs sm:text-sm text-[#E2E8F0] bg-transparent border-0 focus:outline-none resize-y leading-relaxed selection:bg-orange-500/30 placeholder:text-[#4B5563]"
            spellCheck={false}
            autoFocus
          />
        </div>
      ) : code ? (
        <div
          className={`relative overflow-x-auto flex text-xs sm:text-sm font-mono divide-x divide-white/[0.04] transition-all ${
            isExpanded ? 'flex-1 max-h-[85vh]' : 'max-h-[480px]'
          }`}
          style={{ backgroundColor: activeTheme.bg }}
        >
          {/* Line Numbers Column */}
          <div
            className="select-none py-4 px-3 text-right text-[#4B5563] font-mono text-[11px] leading-relaxed shrink-0 border-r border-white/[0.04]"
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
            className={`py-4 px-4 leading-relaxed overflow-x-auto flex-1 font-mono selection:bg-orange-500/30 ${
              wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
            style={{ color: activeTheme.text }}
          >
            <code>{code}</code>
          </pre>
        </div>
      ) : (
        /* Empty State */
        <div className="p-10 text-center bg-[#0C0E13]">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-[#6B7280]">
            <Terminal className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-[#F3F4F6]">No Solution Snippet Saved</h4>
          <p className="text-xs text-[#9CA3AF] mt-1.5 max-w-md mx-auto leading-relaxed">
            Record your optimal solution, time & space complexities, or memory notes to review during spaced repetition recall sessions.
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-5 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500 border border-orange-500/30 hover:border-transparent text-xs font-semibold text-orange-400 hover:text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Add Solution Snippet</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SolutionCodeViewer;
