import React, { useState, useEffect } from 'react';
import { createProblem, updateProblem, resolveProblemMetadata } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';
import { Sparkles, X, RefreshCw } from 'lucide-react';

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
  { value: 'easy', label: 'Easy', color: 'text-emerald-400' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400' },
  { value: 'hard', label: 'Hard', color: 'text-rose-400' },
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
  const isEdit = Boolean(initialData && initialData.id);

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
        await updateProblem(initialData.id, payload);
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

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-form-title"
    >
      <div
        className="panel max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-7 shadow-2xl bg-[#131519] border border-white/[0.08] animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/[0.08] mb-5">
          <div>
            <h2 id="problem-form-title" className="text-base font-bold text-[#F3F4F6] tracking-tight">
              {isEdit ? 'Edit Problem' : 'Catalog New Problem'}
            </h2>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {isEdit ? 'Update metadata and problem topics' : 'Paste problem link to auto-detect title and platform'}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="text-[#9CA3AF] hover:text-[#F3F4F6] transition-colors p-1.5 -m-1 rounded-lg hover:bg-white/[0.06]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {apiError && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
            <p className="text-xs text-rose-300">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* 1. Problem URL (With Auto-Fetch from LeetCode) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="problem-link" className="section-label">
                Problem URL *
              </label>
              <button
                type="button"
                onClick={() => handleFetchMetadata()}
                disabled={isSubmitting || isFetchingMetadata || !link.trim()}
                className="text-[11px] font-mono text-[#F97316] hover:text-[#FB923C] disabled:opacity-40 disabled:hover:text-[#F97316] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isFetchingMetadata ? 'animate-spin' : ''}`} />
                <span>{isFetchingMetadata ? 'Fetching details…' : 'Auto-Fetch Details'}</span>
              </button>
            </div>
            <div className="relative">
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
                placeholder="https://leetcode.com/problems/two-sum/..."
                className={`input-base pr-20 ${errors.link ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => handleFetchMetadata()}
                disabled={isSubmitting || isFetchingMetadata || !link.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/25 text-[10px] font-mono font-bold transition-all disabled:opacity-40 cursor-pointer"
              >
                {isFetchingMetadata ? 'Fetching…' : 'Fetch'}
              </button>
            </div>
            {errors.link && <p className="mt-1.5 text-xs text-rose-400">{errors.link}</p>}

            {/* Smart Detection Feedback Badge */}
            {(autoDetected.platform || autoDetected.title) && (
              <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg animate-fadeIn">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Detected{' '}
                  {autoDetected.platform && (
                    <strong className="capitalize text-white">{autoDetected.platform}</strong>
                  )}
                  {autoDetected.platform && autoDetected.title && ' · '}
                  {autoDetected.title && (
                    <strong className="text-white font-semibold">"{autoDetected.title}"</strong>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* 2. Problem Title */}
          <div>
            <label htmlFor="problem-title" className="block section-label mb-1.5">
              Problem Title *
            </label>
            <input
              id="problem-title"
              type="text"
              value={title}
              disabled={isSubmitting}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Trapping Rain Water"
              className={`input-base ${errors.title ? 'input-error' : ''}`}
            />
            {errors.title && <p className="mt-1.5 text-xs text-rose-400">{errors.title}</p>}
          </div>

          {/* 3. Platform + Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="problem-platform" className="block section-label mb-1.5">
                Platform *
              </label>
              <select
                id="problem-platform"
                value={platform}
                disabled={isSubmitting}
                onChange={(e) => setPlatform(e.target.value)}
                className="input-base"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="problem-difficulty" className="block section-label mb-1.5">
                Difficulty *
              </label>
              <select
                id="problem-difficulty"
                value={difficulty}
                disabled={isSubmitting}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-base"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Topics */}
          <div>
            <label htmlFor="topic-input" className="block section-label mb-1.5">
              Topics
              <span className="text-[#9CA3AF] font-normal ml-1 normal-case tracking-normal">
                (Enter or comma to add)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                id="topic-input"
                type="text"
                value={topicInput}
                disabled={isSubmitting}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleTopicKeyDown}
                placeholder="e.g. Dynamic Programming, Trees"
                className="input-base flex-1"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                disabled={isSubmitting || !topicInput.trim()}
                className="btn-ghost disabled:opacity-50 text-xs px-3"
              >
                Add
              </button>
            </div>

            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#0E1015] border border-white/[0.08] text-[#9CA3AF]"
                  >
                    <span>#{topic}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      disabled={isSubmitting}
                      className="text-[#9CA3AF] hover:text-rose-400 transition-colors ml-0.5"
                      aria-label={`Remove ${topic}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving…</span>
                </>
              ) : isEdit ? (
                'Update Problem'
              ) : (
                'Create Problem'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemForm;
