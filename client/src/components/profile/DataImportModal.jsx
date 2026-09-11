import React, { useState, useRef } from 'react';
import { X, Upload, FileJson, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, FileCheck } from 'lucide-react';
import { importProblems } from '../../api/problems';
import { useToast } from '../../context/ToastContext';
import Badge from '../ui/Badge';

const DIFFICULTY_MAP = {
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

const parseCSV = (text) => {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());
  const titleIdx = headers.findIndex((h) => h.includes('title'));
  const platformIdx = headers.findIndex((h) => h.includes('platform'));
  const diffIdx = headers.findIndex((h) => h.includes('diff'));
  const topicsIdx = headers.findIndex((h) => h.includes('topic'));
  const linkIdx = headers.findIndex((h) => h.includes('link') || h.includes('url'));

  if (titleIdx === -1) {
    throw new Error('CSV must contain a "Title" column.');
  }

  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Basic CSV cell extraction respecting quotes
    const cells = [];
    let cur = '';
    let inQuote = false;
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        cells.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    cells.push(cur.trim());

    const title = (cells[titleIdx] || '').replace(/^["']|["']$/g, '');
    if (!title) continue;

    const platform = platformIdx !== -1 ? (cells[platformIdx] || 'other').replace(/^["']|["']$/g, '').toLowerCase() : 'other';
    const difficulty = diffIdx !== -1 ? (cells[diffIdx] || 'medium').replace(/^["']|["']$/g, '').toLowerCase() : 'medium';
    const rawTopics = topicsIdx !== -1 ? (cells[topicsIdx] || '').replace(/^["']|["']$/g, '') : '';
    const topics = rawTopics.split(/[;,]/).map((t) => t.trim()).filter(Boolean);
    const link = linkIdx !== -1 ? (cells[linkIdx] || '').replace(/^["']|["']$/g, '') : '';

    result.push({
      title,
      platform,
      difficulty,
      topics,
      link: link || `https://example.com/problem/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}`,
    });
  }

  return result;
};

const DataImportModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [parsedProblems, setParsedProblems] = useState([]);
  const [parseError, setParseError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    processFile(selected);
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    setParseError('');
    setParsedProblems([]);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content !== 'string') {
          throw new Error('Failed to read file content.');
        }

        let problemsList = [];
        if (selectedFile.name.endsWith('.json')) {
          const json = JSON.parse(content);
          if (Array.isArray(json)) {
            problemsList = json;
          } else if (Array.isArray(json.problems)) {
            problemsList = json.problems;
          } else if (Array.isArray(json.data)) {
            problemsList = json.data;
          } else {
            throw new Error('JSON must contain an array of problems.');
          }
        } else if (selectedFile.name.endsWith('.csv')) {
          problemsList = parseCSV(content);
        } else {
          throw new Error('Unsupported format. Please upload a .json or .csv file.');
        }

        if (problemsList.length === 0) {
          throw new Error('No valid problems detected in the uploaded file.');
        }

        setParsedProblems(problemsList);
      } catch (err) {
        setParseError(err.message || 'Failed to parse file.');
      }
    };
    reader.onerror = () => setParseError('Error reading file.');
    reader.readAsText(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleExecuteImport = async () => {
    if (!parsedProblems.length) return;
    setIsImporting(true);
    setParseError('');
    try {
      const res = await importProblems(parsedProblems);
      setImportResult(res);
      toast.success(`Import complete! ${res.count} problems added.`);
      onSuccess?.();
    } catch (err) {
      setParseError(err.response?.data?.message || 'Failed to import problems. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedProblems([]);
    setParseError('');
    setImportResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#10131A] border border-white/[0.12] rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle glow */}
        <div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-orange-500/10 pointer-events-none"
          style={{ filter: 'blur(50px)' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Import & Restore Data</h2>
              <p className="text-[11px] text-slate-400">Restore your problems from a JSON or CSV backup</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Result view */}
          {importResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Import Complete!</h3>
              <div className="p-3.5 rounded-xl bg-[#090B0E] border border-white/[0.06] text-xs font-mono text-slate-300 max-w-sm mx-auto space-y-1">
                <p className="text-emerald-400 font-semibold">{importResult.count} problems successfully added</p>
                {importResult.skipped > 0 && (
                  <p className="text-slate-500">{importResult.skipped} duplicate problems skipped</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-semibold text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Error Notice */}
              {parseError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Upload Dropzone */}
              {!parsedProblems.length ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-white/[0.12] hover:border-orange-500/50 bg-[#090B0E]/60 hover:bg-[#090B0E] rounded-2xl text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-3 text-orange-400 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200">
                    Click to browse or drag & drop backup file
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Supports <span className="text-slate-400">.JSON</span> (DSA Tracker backup) or{' '}
                    <span className="text-slate-400">.CSV</span>
                  </p>
                </div>
              ) : (
                /* Parsed Preview Section */
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#090B0E] border border-white/[0.08] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200 truncate max-w-[200px]">{file?.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {parsedProblems.length} problems detected
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setParsedProblems([]);
                        setParseError('');
                      }}
                      className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                    >
                      Change File
                    </button>
                  </div>

                  {/* Sample preview cards */}
                  <div className="p-3 rounded-xl bg-[#090B0E]/80 border border-white/[0.06] space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                      Preview (First {Math.min(3, parsedProblems.length)} items)
                    </p>
                    {parsedProblems.slice(0, 3).map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] flex items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-semibold text-slate-200 truncate">{p.title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-400 uppercase">
                            {p.platform || 'other'}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                              p.difficulty === 'hard'
                                ? 'text-rose-400 bg-rose-500/10'
                                : p.difficulty === 'medium'
                                ? 'text-amber-400 bg-amber-500/10'
                                : 'text-emerald-400 bg-emerald-500/10'
                            }`}
                          >
                            {p.difficulty || 'medium'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 h-10 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteImport}
                      disabled={isImporting}
                      className="px-5 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-semibold text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Importing…</span>
                        </>
                      ) : (
                        <span>Import {parsedProblems.length} Problems</span>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataImportModal;
