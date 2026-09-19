import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { createProblem, updateProblem, resolveProblemMetadata } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';
import {
  Sparkles,
  X,
  Link2,
  Plus,
  Hash,
  ChevronDown,
  Check,
  AlertCircle,
  PlusCircle,
  Edit3,
} from 'lucide-react';

const PLATFORMS = [
  { value: 'leetcode', label: 'LeetCode' },
  { value: 'gfg', label: 'GeeksforGeeks' },
  { value: 'codeforces', label: 'Codeforces' },
  { value: 'codechef', label: 'CodeChef' },
  { value: 'hackerrank', label: 'HackerRank' },
  { value: 'atcoder', label: 'AtCoder' },
  { value: 'other', label: 'Other' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const POPULAR_TOPICS = [
  'Array',
  'String',
  'Hash Table',
  'Two Pointers',
  'Binary Search',
  'Dynamic Programming',
  'Tree',
  'Graph',
  'Greedy',
  'Stack',
  'Heap',
  'Recursion',
  'Backtracking',
  'Sliding Window',
  'Bit Manipulation',
  'Math',
];

const isValidUrl = (string) => {
  try {
    const url = new URL(string.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

/**
 * Smart URL Parser: Extracts platform and clean Title from LeetCode, GFG, CodeChef, HackerRank
 */
const detectPlatformAndTitle = (inputUrl) => {
  if (!inputUrl) return { platform: null, title: null };
  try {
    const url = new URL(inputUrl.trim());
    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname;

    let detectedPlatform = null;
    let slug = null;

    if (hostname.includes('leetcode.com') || hostname.includes('leetcode.cn')) {
      detectedPlatform = 'leetcode';
      const match = pathname.match(/\/problems\/([^/]+)/);
      if (match) slug = match[1];
    } else if (hostname.includes('geeksforgeeks.org')) {
      detectedPlatform = 'gfg';
      const match = pathname.match(/\/problems\/([^/]+)/);
      if (match) {
        slug = match[1].replace(/-\d{5,}$/, '').replace(/\d{4,}$/, '');
      }
    } else if (hostname.includes('codechef.com')) {
      detectedPlatform = 'codechef';
      const parts = pathname.split('/').filter(Boolean);
      const probIdx = parts.indexOf('problems');
      if (probIdx !== -1 && parts[probIdx + 1]) {
        slug = parts[probIdx + 1];
      }
    } else if (hostname.includes('hackerrank.com')) {
      detectedPlatform = 'hackerrank';
      const match = pathname.match(/\/challenges\/([^/]+)/);
      if (match) slug = match[1];
    }

    let formattedTitle = null;
    if (slug) {
      formattedTitle = slug
        .split(/[-_]/)
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
    }

    return { platform: detectedPlatform, title: formattedTitle };
  } catch {
    return { platform: null, title: null };
  }
};

const ProblemForm = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const toast = useToast();
  const problemId = initialData?.id || initialData?._id;
  const isEdit = Boolean(initialData && problemId);

  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('leetcode');
  const [link, setLink] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [topics, setTopics] = useState([]);
  const [topicInput, setTopicInput] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Smart detection state tracking
  const [autoDetected, setAutoDetected] = useState({ platform: null, title: null });
  const [lastAutoTitle, setLastAutoTitle] = useState('');
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  // Stable reference to onClose callback to prevent effect tear-down cycles
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Handle ESC key and prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onCloseRef.current?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, isSubmitting]);

  // Sync state on open or initialData change
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setPlatform(initialData.platform || 'leetcode');
      setLink(initialData.link || '');
      setDifficulty(initialData.difficulty || 'easy');
      setTopics(Array.isArray(initialData.topics) ? [...initialData.topics] : []);
    } else {
      setTitle('');
      setPlatform('leetcode');
      setLink('');
      setDifficulty('easy');
      setTopics([]);
    }
    setTopicInput('');
    setErrors({});
    setApiError('');
    setAutoDetected({ platform: null, title: null });
    setLastAutoTitle('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Auto-resolve problem details via backend API
  const handleFetchMetadata = async (urlOverride) => {
    const targetUrl = (urlOverride || link).trim();
    if (!targetUrl || !isValidUrl(targetUrl)) {
      setErrors((prev) => ({ ...prev, link: 'Please enter a valid URL first' }));
      return;
    }

    setIsFetchingMetadata(true);
    try {
      const res = await resolveProblemMetadata(targetUrl);
      if (res?.success && res.data) {
        const { title: fetchedTitle, platform: fetchedPlat, difficulty: fetchedDiff, topics: fetchedTopics } = res.data;
        if (fetchedTitle) {
          setTitle(fetchedTitle);
          setLastAutoTitle(fetchedTitle);
          setErrors((prev) => ({ ...prev, title: undefined }));
        }
        if (fetchedPlat) {
          setPlatform(fetchedPlat);
          setErrors((prev) => ({ ...prev, platform: undefined }));
        }
        if (fetchedDiff && ['easy', 'medium', 'hard'].includes(fetchedDiff.toLowerCase())) {
          setDifficulty(fetchedDiff.toLowerCase());
        }
        if (Array.isArray(fetchedTopics) && fetchedTopics.length > 0) {
          setTopics((prev) => Array.from(new Set([...prev, ...fetchedTopics])));
        }
        setAutoDetected({ platform: fetchedPlat, title: fetchedTitle });
        toast.success(`Loaded details for "${fetchedTitle || 'problem'}"`);
      }
    } catch (err) {
      console.warn('Metadata fetch failed:', err);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // Handle URL change with smart platform and title auto-detection
  const handleLinkChange = (newLink) => {
    setLink(newLink);
    if (errors.link) setErrors((prev) => ({ ...prev, link: undefined }));

    const { platform: detectedPlat, title: detectedTitle } = detectPlatformAndTitle(newLink);

    let changedPlat = null;
    let changedTitle = null;

    if (detectedPlat) {
      setPlatform(detectedPlat);
      changedPlat = detectedPlat;
      if (errors.platform) setErrors((prev) => ({ ...prev, platform: undefined }));
    }

    // Auto-fill title if user hasn't typed a custom title yet, or if current title matches previous auto-fill
    if (detectedTitle && (!title.trim() || title === lastAutoTitle)) {
      setTitle(detectedTitle);
      setLastAutoTitle(detectedTitle);
      changedTitle = detectedTitle;
      if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
    }

    if (changedPlat || changedTitle) {
      setAutoDetected({ platform: changedPlat, title: changedTitle });
    }
  };

  const handleToggleTopic = (topicName) => {
    const exists = topics.some((t) => t.toLowerCase() === topicName.toLowerCase());
    if (exists) {
      setTopics(topics.filter((t) => t.toLowerCase() !== topicName.toLowerCase()));
    } else {
      setTopics([...topics, topicName]);
    }
  };

  const handleAddTopic = () => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (!topics.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setTopics([...topics, trimmed]);
    }
    setTopicInput('');
  };

  const handleTopicKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
      handleAddTopic();
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setTopics(topics.filter((t) => t !== topicToRemove));
  };

  const validate = () => {
    const newErrors = {};
    if (!link.trim()) {
      newErrors.link = 'Problem URL is required';
    } else if (!isValidUrl(link.trim())) {
      newErrors.link = 'Enter a valid URL (http:// or https://)';
    }
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!platform) newErrors.platform = 'Platform is required';
    if (!difficulty) newErrors.difficulty = 'Difficulty is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        platform,
        link: link.trim(),
        difficulty,
        topics: topics.map((t) => t.trim()).filter(Boolean),
      };
      if (isEdit) {
        await updateProblem(problemId, payload);
        toast.success(`"${payload.title}" updated.`);
      } else {
        await createProblem(payload);
        toast.success(`"${payload.title}" cataloged.`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to save problem.');
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-form-title"
    >
      {/* Clickable Backdrop Overlay (Uses onMouseDown to avoid swallowing trigger click events) */}
      <div
        className="fixed inset-0 bg-black/70 transition-opacity"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !isSubmitting) {
            onClose();
          }
        }}
      />

      {/* Modal Dialog Card */}
      <div
        data-lenis-prevent
        className="panel relative w-full max-w-lg sm:max-w-xl max-h-[90vh] flex flex-col bg-surface border border-line shadow-modal rounded-xl overflow-hidden my-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line bg-surface-2/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/12 border border-accent/25 flex items-center justify-center text-accent shrink-0">
              {isEdit ? <Edit3 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
            </div>
            <div>
              <h2 id="problem-form-title" className="text-sm sm:text-base font-semibold text-text tracking-tight">
                {isEdit ? 'Edit Problem' : 'Catalog New Problem'}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {isEdit ? 'Update problem classification and metadata' : 'Paste problem link or enter details manually'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="text-muted hover:text-text transition-all p-2 rounded-lg hover:bg-surface-2 active:scale-95 cursor-pointer disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1 overflow-hidden" noValidate>
          <div className="flex-1 overflow-y-auto min-h-0 px-5 sm:px-6 py-5 space-y-4.5 overscroll-contain">
            {/* API Error Alert */}
            {apiError && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-danger/10 border border-danger/25 text-xs text-danger">
                <AlertCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                <p className="flex-1">{apiError}</p>
                <button
                  type="button"
                  onClick={() => setApiError('')}
                  className="text-danger hover:underline cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 1. Problem URL + Auto-Fetch */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="problem-link" className="section-label flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-accent" />
                  Problem URL <span className="text-danger">*</span>
                </label>
                {link && (
                  <button
                    type="button"
                    onClick={() => handleLinkChange('')}
                    className="text-xs text-muted hover:text-text transition-colors cursor-pointer"
                  >
                    Clear URL
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="problem-link"
                    type="url"
                    value={link}
                    disabled={isSubmitting}
                    onChange={(e) => handleLinkChange(e.target.value)}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData('text');
                      if (pasted && isValidUrl(pasted)) {
                        handleLinkChange(pasted);
                        handleFetchMetadata(pasted);
                      }
                    }}
                    placeholder="https://leetcode.com/problems/..."
                    className={`input-base text-xs sm:text-sm ${errors.link ? 'input-error' : ''}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchMetadata()}
                  disabled={isSubmitting || isFetchingMetadata || !link.trim()}
                  title="Auto-fetch problem title, platform, difficulty, and topics"
                  className="btn-primary text-xs !px-3 sm:!px-4 shrink-0 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isFetchingMetadata ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isFetchingMetadata ? 'Fetching…' : 'Auto-Fetch'}</span>
                  <span className="sm:hidden">{isFetchingMetadata ? '…' : 'Fetch'}</span>
                </button>
              </div>
              {errors.link && <p className="mt-1.5 text-xs text-danger">{errors.link}</p>}

              {/* Smart Detection Feedback Badge */}
              {(autoDetected.platform || autoDetected.title) && (
                <div className="flex items-center justify-between gap-2 mt-2 px-3 py-2 rounded-lg bg-accent/12 border border-accent/25 text-accent text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="truncate">
                      Auto-detected:{' '}
                      {autoDetected.platform && <strong className="text-text capitalize">{autoDetected.platform}</strong>}
                      {autoDetected.platform && autoDetected.title && ' · '}
                      {autoDetected.title && <strong className="text-text font-medium">"{autoDetected.title}"</strong>}
                    </span>
                  </div>
                  <span className="text-xs text-success bg-success/12 border border-success/25 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Detected</span>
                  </span>
                </div>
              )}
            </div>

            {/* 2. Problem Title */}
            <div>
              <label htmlFor="problem-title" className="block section-label mb-1.5">
                Problem Title <span className="text-danger">*</span>
              </label>
              <input
                id="problem-title"
                type="text"
                value={title}
                disabled={isSubmitting}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Trapping Rain Water"
                className={`input-base text-xs sm:text-sm ${errors.title ? 'input-error' : ''}`}
              />
              {errors.title && <p className="mt-1.5 text-xs text-danger">{errors.title}</p>}
            </div>

            {/* 3. Platform & Difficulty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Platform */}
              <div>
                <label htmlFor="problem-platform" className="block section-label mb-1.5">
                  Platform <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    id="problem-platform"
                    value={platform}
                    disabled={isSubmitting}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="input-base text-xs sm:text-sm appearance-none pr-9 font-medium bg-surface cursor-pointer"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p.value} value={p.value} className="bg-surface text-text py-1">
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {errors.platform && <p className="mt-1.5 text-xs text-danger">{errors.platform}</p>}
              </div>

              {/* Difficulty - Segmented Touch Pills */}
              <div>
                <label className="block section-label mb-1.5">
                  Difficulty <span className="text-danger">*</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-2 border border-line rounded-lg h-[42px] items-center">
                  {DIFFICULTIES.map((d) => {
                    const isSelected = difficulty === d.value;
                    let activeClasses = '';
                    let dotColor = '';
                    if (d.value === 'easy') {
                      activeClasses = isSelected
                        ? 'bg-easy/15 text-easy border-easy/30 font-semibold'
                        : 'text-muted hover:text-text border-transparent';
                      dotColor = 'bg-easy';
                    } else if (d.value === 'medium') {
                      activeClasses = isSelected
                        ? 'bg-medium/15 text-medium border-medium/30 font-semibold'
                        : 'text-muted hover:text-text border-transparent';
                      dotColor = 'bg-medium';
                    } else {
                      activeClasses = isSelected
                        ? 'bg-hard/15 text-hard border-hard/30 font-semibold'
                        : 'text-muted hover:text-text border-transparent';
                      dotColor = 'bg-hard';
                    }

                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDifficulty(d.value)}
                        disabled={isSubmitting}
                        className={`h-full flex items-center justify-center gap-1.5 px-2 rounded-md text-xs transition-all border cursor-pointer ${activeClasses}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? dotColor : 'bg-transparent'} transition-colors`} />
                        <span>{d.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.difficulty && <p className="mt-1.5 text-xs text-danger">{errors.difficulty}</p>}
              </div>
            </div>

            {/* 4. Topics */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="topic-input" className="section-label">
                  Topics & Categories
                </label>
                <span className="text-xs text-muted">
                  Tap chips or type below
                </span>
              </div>

              {/* Quick Suggestion Chips */}
              <div className="mb-2.5">
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                  {POPULAR_TOPICS.map((popTopic) => {
                    const isSelected = topics.some((t) => t.toLowerCase() === popTopic.toLowerCase());
                    return (
                      <button
                        key={popTopic}
                        type="button"
                        onClick={() => handleToggleTopic(popTopic)}
                        disabled={isSubmitting}
                        className={`px-2 py-1 rounded-md text-xs transition-all border cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-accent/12 border-accent/30 text-accent font-medium'
                            : 'bg-surface-2 border-line text-muted hover:text-text hover:border-line'
                        }`}
                      >
                        <span>{popTopic}</span>
                        {isSelected ? <Check className="w-3 h-3 text-accent" /> : <Plus className="w-2.5 h-2.5 opacity-50" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Custom Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    id="topic-input"
                    type="text"
                    value={topicInput}
                    disabled={isSubmitting}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={handleTopicKeyDown}
                    placeholder="Custom topic (Enter or comma to add)..."
                    className="input-base text-xs sm:text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTopic}
                  disabled={isSubmitting || !topicInput.trim()}
                  className="btn-secondary !px-3.5 text-xs shrink-0 disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Selected Topics Badges */}
              {topics.length > 0 && (
                <div className="mt-2.5 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Attached Topics ({topics.length}):</span>
                    <button
                      type="button"
                      onClick={() => setTopics([])}
                      className="text-danger hover:underline transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-surface-2 border border-line max-h-24 overflow-y-auto">
                    {topics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-md bg-surface border border-line text-text-secondary group"
                      >
                        <Hash className="w-3 h-3 text-accent shrink-0" />
                        <span>{topic}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(topic)}
                          disabled={isSubmitting}
                          className="text-muted group-hover:text-danger transition-colors ml-0.5 p-0.5 rounded hover:bg-surface-2 cursor-pointer"
                          aria-label={`Remove ${topic}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Sticky Footer */}
          <div className="px-5 sm:px-6 py-3.5 border-t border-line bg-surface-2/40 shrink-0 flex items-center justify-between gap-3">
            <div className="text-xs text-muted hidden sm:block">
              Press <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line text-text">Esc</kbd> to exit
            </div>
            <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="btn-secondary text-xs w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary text-xs w-full sm:w-auto disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-bg/30 border-t-bg rounded-full animate-spin" />
                    <span>Saving…</span>
                  </>
                ) : isEdit ? (
                  'Update Problem'
                ) : (
                  'Create Problem'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default ProblemForm;
