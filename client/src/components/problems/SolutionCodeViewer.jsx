import React, { useState, useEffect } from 'react';
import { Code2, Copy, Check, Edit3, Save, X, Terminal, Sparkles } from 'lucide-react';
import { updateProblem } from '../../api/problems';
import { useToast } from '../../context/ToastContext';

const SUPPORTED_LANGS = [
  { id: 'cpp', label: 'C++' },
  { id: 'python', label: 'Python 3' },
  { id: 'java', label: 'Java' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
];

const SolutionCodeViewer = ({ problem, onProblemUpdated }) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(problem?.solutionCode || '');
  const [language, setLanguage] = useState(problem?.solutionLanguage || 'cpp');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(problem?.solutionCode || '');
    setLanguage(problem?.solutionLanguage || 'cpp');
  }, [problem]);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Solution code copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy code.');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateProblem(problem.id, {
        solutionCode: code,
        solutionLanguage: language,
      });
      if (res.success) {
        toast.success('Solution code updated successfully!');
        setIsEditing(false);
        onProblemUpdated?.(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save solution code.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    // Support Tab indentation in code editor
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

  return (
    <div className="panel overflow-hidden border-white/[0.09] bg-[#101217]">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-[#0C0E13]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 tracking-tight">Optimal Solution & Approach</span>
            <span className="text-[10px] text-slate-500 ml-2 font-mono">
              {code ? `${lines.length} lines` : 'No code yet'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-[#151821] border border-white/[0.1] text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500"
              >
                {SUPPORTED_LANGS.map((lang) => (
                  <option key={lang.id} value={lang.id} className="bg-[#101217]">
                    {lang.label}
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
                className="px-3 h-8 rounded-lg text-xs text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-3.5 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-semibold text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving…' : 'Save'}</span>
              </button>
            </>
          ) : (
            <>
              {/* Language pill */}
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300">
                {currentLangObj.label}
              </span>

              {code && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
                  title="Copy Solution Code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                <span>{code ? 'Edit Code' : '+ Add Code'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor or Viewer Body */}
      {isEditing ? (
        <div className="p-4 bg-[#080A0D]">
          <textarea
            rows={14}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`// Paste or write your ${currentLangObj.label} solution here...\n// Press Tab for 4-space indentation.`}
            className="w-full font-mono text-xs sm:text-sm text-slate-200 bg-transparent border-0 focus:outline-none resize-y leading-relaxed selection:bg-orange-500/30 placeholder:text-slate-600"
            spellCheck={false}
            autoFocus
          />
        </div>
      ) : code ? (
        <div className="relative overflow-x-auto bg-[#080A0D] flex text-xs sm:text-sm font-mono max-h-[460px] divide-x divide-white/[0.04]">
          {/* Line Numbers Column */}
          <div className="select-none py-4 px-3 text-right text-slate-600 font-mono text-[11px] leading-relaxed bg-[#06080B] shrink-0">
            {lines.map((_, idx) => (
              <div key={idx}>{idx + 1}</div>
            ))}
          </div>

          {/* Actual Code View */}
          <pre className="py-4 px-4 text-slate-200 leading-relaxed overflow-x-auto flex-1 font-mono">
            <code>{code}</code>
          </pre>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 text-center bg-[#0C0E13]">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Terminal className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-300">No Solution Snippet Saved</h4>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
            Save your optimal solution, time/space complexity notes, or code template for spaced repetition revision.
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="mt-4 px-3.5 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500 border border-orange-500/30 hover:border-transparent text-xs font-semibold text-orange-400 hover:text-white transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
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
