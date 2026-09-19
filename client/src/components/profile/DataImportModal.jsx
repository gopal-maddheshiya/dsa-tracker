import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/70 animate-fade-in"
      onClick={handleClose}
    >
      <div
        data-lenis-prevent
        className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-surface border border-line rounded-xl shadow-modal my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-line sticky top-0 bg-surface-2/40 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/12 border border-accent/25 flex items-center justify-center text-accent">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text tracking-tight">Import & Restore Data</h2>
              <p className="text-xs text-muted">Restore your problems from a JSON or CSV backup</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            type="button"
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Result view */}
          {importResult ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-xl bg-success/12 border border-success/25 flex items-center justify-center mx-auto text-success">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-text">Import Complete!</h3>
              <div className="p-3.5 rounded-xl bg-surface-2 border border-line text-xs text-text-secondary max-w-sm mx-auto space-y-1">
                <p className="text-success font-semibold">{importResult.count} problems successfully added</p>
                {importResult.skipped > 0 && (
                  <p className="text-muted">{importResult.skipped} duplicate problems skipped</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="btn-primary text-xs px-5 py-2.5"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Error Notice */}
              {parseError && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/25 flex items-start gap-2.5 text-xs text-danger">
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
                  className="p-8 border-2 border-dashed border-line hover:border-accent/50 bg-surface-2/40 hover:bg-surface-2 rounded-xl text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-xl bg-accent/12 border border-accent/25 flex items-center justify-center mx-auto mb-3 text-accent group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-semibold text-text mb-1">
                    Click to upload or drag & drop backup file
                  </h3>
                  <p className="text-xs text-muted mb-3">Supports .JSON or .CSV format</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-line text-xs text-muted">
                    <FileCheck className="w-3.5 h-3.5 text-accent" /> Choose Backup File
                  </span>
                </div>
              ) : (
                /* Parsed Preview */
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-surface-2 border border-line flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-success/12 border border-success/25 flex items-center justify-center text-success shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-text truncate">{file?.name}</p>
                        <p className="text-xs text-muted">
                          {parsedProblems.length} {parsedProblems.length === 1 ? 'problem' : 'problems'} ready to import
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
                      className="text-xs text-danger hover:underline font-medium px-2 py-1 rounded hover:bg-danger/10 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Sample problem preview list */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    <span className="text-xs uppercase tracking-wider text-muted block mb-1">
                      Previewing first {Math.min(5, parsedProblems.length)} of {parsedProblems.length} items:
                    </span>
                    {parsedProblems.slice(0, 5).map((p, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-surface border border-line flex items-center justify-between text-xs"
                      >
                        <span className="text-text truncate max-w-[240px]">{p.title}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-mono uppercase text-muted">{p.platform}</span>
                          <Badge variant={p.difficulty || 'medium'} size="xs">
                            {p.difficulty || 'medium'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="btn-secondary px-4 h-10 rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteImport}
                      disabled={isImporting}
                      className="btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-bg" />
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
    </div>,
    document.body
  );
};

export default DataImportModal;
