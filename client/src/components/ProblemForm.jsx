import React, { useState, useEffect } from 'react';
import { createProblem, updateProblem } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';
import { Sparkles, X } from 'lucide-react';

const PLATFORMS = [
  { value: 'leetcode', label: 'LeetCode' },
  { value: 'gfg', label: 'GeeksforGeeks' },
  { value: 'codechef', label: 'CodeChef' },
  { value: 'hackerrank', label: 'HackerRank' },
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
        className="panel max-w-lg w-full p-6 sm:p-7 shadow-2xl border-[#262320] animate-scale-in"
        style={{ background: 'linear-gradient(165deg, #1C1A18, #181614)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#262320] mb-5">
          <div>
            <h2 id="problem-form-title" className="text-base font-bold text-[#F5F5F4] tracking-tight">
              {isEdit ? 'Edit Problem' : 'Catalog New Problem'}
            </h2>
            <p className="text-xs text-[#6B6560] mt-0.5">
              {isEdit ? 'Update metadata and problem topics' : 'Paste problem link to auto-detect title and platform'}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="text-[#6B6560] hover:text-[#F5F5F4] transition-colors p-1.5 -m-1 rounded-lg hover:bg-[#211F1D]"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {apiError && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
            <p className="text-xs text-rose-300">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* 1. Problem URL (With Smart Auto-Fill on Paste) */}
          <div>
            <label htmlFor="problem-link" className="block section-label mb-1.5 flex items-center justify-between">
              <span>Problem URL *</span>
              <span className="text-[10px] font-mono text-[#F97316] font-normal lowercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                auto-fills title & platform
              </span>
            </label>
            <input
              id="problem-link"
              type="url"
              value={link}
              disabled={isSubmitting}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="https://leetcode.com/problems/trapping-rain-water/..."
              className={`input-base ${errors.link ? 'input-error' : ''}`}
            />
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
                  {autoDetected.platform && autoDetected.title && ' & '}
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
              <span className="text-[#6B6560] font-normal ml-1 normal-case tracking-normal">
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
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#141312] border border-[#262320] text-[#A8A29E]"
                  >
                    <span>#{topic}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      disabled={isSubmitting}
                      className="text-[#6B6560] hover:text-rose-400 transition-colors ml-0.5"
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
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#262320]">
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
