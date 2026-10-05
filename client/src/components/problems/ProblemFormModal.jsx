import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, Link as LinkIcon } from 'lucide-react';
import FormAlert from '../common/FormAlert';
import { PLATFORM_NAMES } from './ProblemBadges';

const PLATFORMS = ['leetcode', 'gfg', 'codechef', 'hackerrank', 'other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * ProblemFormModal
 * Modal dialog for creating or editing a problem in the practice workspace.
 */
export default function ProblemFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = 'Add Problem',
}) {
  const [formData, setFormData] = useState({
    title: '',
    platform: 'leetcode',
    link: '',
    difficulty: 'easy',
    topics: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const triggerRef = useRef(null);

  // Focus restoration to opening trigger
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
    } else if (triggerRef.current && typeof triggerRef.current.focus === 'function') {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Populate data when editing or reset when adding
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        platform: initialData.platform || 'leetcode',
        link: initialData.link || '',
        difficulty: initialData.difficulty || 'easy',
        topics: Array.isArray(initialData.topics)
          ? initialData.topics.join(', ')
          : '',
      });
    } else {
      setFormData({
        title: '',
        platform: 'leetcode',
        link: '',
        difficulty: 'easy',
        topics: '',
      });
    }
    setError(null);
  }, [initialData, isOpen]);

  // Lock body scroll when modal is open and restore on close/unmount
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    const cleanTitle = formData.title.trim();
    if (!cleanTitle) {
      setError('Problem title is required');
      return;
    }

    const cleanLink = formData.link.trim();
    if (!cleanLink || !/^https?:\/\/.+/i.test(cleanLink)) {
      setError('Please provide a valid problem URL starting with http:// or https://');
      return;
    }

    const parsedTopics = formData.topics
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (parsedTopics.length === 0) {
      setError('Please specify at least one topic (e.g. Array, Dynamic Programming)');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        title: cleanTitle,
        platform: formData.platform,
        link: cleanLink,
        difficulty: formData.difficulty,
        topics: parsedTopics,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save problem. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const parsedTopicList = formData.topics
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  // Common topics for rapid tagging
  const SUGGESTED_TOPICS = [
    'Array',
    'String',
    'Hash Table',
    'Dynamic Programming',
    'Tree',
    'Binary Search',
    'Two Pointers',
    'Graph',
    'Stack',
    'Heap',
    'Sliding Window',
    'Greedy',
  ];

  // Smart URL parsing helper
  const handleUrlChange = (url) => {
    let nextPlatform = formData.platform;
    let nextTitle = formData.title;

    try {
      const trimmed = url.trim();
      if (/leetcode\.com\/problems\/([^/?#]+)/i.test(trimmed)) {
        nextPlatform = 'leetcode';
        const match = trimmed.match(/leetcode\.com\/problems\/([^/?#]+)/i);
        if (match && match[1] && !formData.title.trim()) {
          // Format slug: e.g. "trapping-rain-water" -> "Trapping Rain Water"
          nextTitle = match[1]
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
        }
      } else if (/geeksforgeeks\.org/i.test(trimmed)) {
        nextPlatform = 'gfg';
      } else if (/codechef\.com/i.test(trimmed)) {
        nextPlatform = 'codechef';
      } else if (/hackerrank\.com/i.test(trimmed)) {
        nextPlatform = 'hackerrank';
      }
    } catch (e) {}

    setFormData((prev) => ({
      ...prev,
      link: url,
      platform: nextPlatform,
      title: nextTitle,
    }));
  };

  // Toggle suggested topic in comma-separated list
  const toggleTopic = (topicName) => {
    const current = formData.topics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const exists = current.some((t) => t.toLowerCase() === topicName.toLowerCase());
    let next;
    if (exists) {
      next = current.filter((t) => t.toLowerCase() !== topicName.toLowerCase());
    } else {
      next = [...current, topicName];
    }
    setFormData((prev) => ({ ...prev, topics: next.join(', ') }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col bg-surface border border-line rounded-xl shadow-elevated overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="problem-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-surface shrink-0">
          <div>
            <h2 id="problem-modal-title" className="text-sm font-semibold text-text">
              {initialData ? 'Edit Problem' : title}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {initialData
                ? 'Update problem identity, classification, and external link.'
                : 'Track a new DSA problem in your practice workspace.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-muted hover:text-text rounded-md hover:bg-surface-hover transition-all duration-150 active:scale-95 disabled:opacity-50 focus-visible:ring-1 focus-visible:ring-accent"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body with Scroll */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <FormAlert message={error} />

          {/* Reference Link (First for smart auto-fill when adding) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-text-secondary">
                Problem URL <span className="text-danger">*</span>
              </label>
              {!initialData && (
                <span className="text-[10px] font-mono text-accent">
                  Auto-detects title & platform
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="problem-url-input"
                name="url"
                type="url"
                required
                value={formData.link}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://leetcode.com/problems/merge-intervals/"
                className="w-full h-9 pl-8 pr-3 bg-surface-2 text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-mono placeholder:text-muted/60"
              />
              <LinkIcon className="w-3.5 h-3.5 text-muted absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Problem Identity */}
          <div className="space-y-3.5">
            <div>
              <label htmlFor="problem-title-input" className="block text-xs font-medium text-text-secondary mb-1.5">
                Problem Title <span className="text-danger">*</span>
              </label>
              <input
                id="problem-title-input"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Merge Intervals"
                className="w-full h-9 px-3 bg-surface-2 text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-muted/60"
              />
            </div>

            {/* Platform & Difficulty Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Platform <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full h-9 px-3 bg-surface-2 text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {PLATFORM_NAMES[p] || p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Difficulty <span className="text-danger">*</span>
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full h-9 px-3 bg-surface-2 text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Topics Classification */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-text-secondary">
                Topics (comma-separated) <span className="text-danger">*</span>
              </label>
              <span className="text-[10px] text-muted">Click chips to toggle</span>
            </div>
            <input
              type="text"
              required
              value={formData.topics}
              onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
              placeholder="Array, Sorting, Two Pointers"
              className="w-full h-9 px-3 bg-surface-2 text-text text-xs rounded-md border border-line focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-muted/60"
            />

            {/* Quick Suggested Topics Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {SUGGESTED_TOPICS.map((topicName) => {
                const isSelected = parsedTopicList.some(
                  (t) => t.toLowerCase() === topicName.toLowerCase()
                );
                return (
                  <button
                    key={topicName}
                    type="button"
                    onClick={() => toggleTopic(topicName)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? 'bg-accent text-white font-medium shadow-xs'
                        : 'bg-surface-2 text-text-secondary hover:text-text hover:bg-surface-hover border border-line'
                    }`}
                  >
                    {isSelected ? `✓ ${topicName}` : `+ ${topicName}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-line mt-6 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-9 px-3.5 text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line rounded-md transition-all duration-150 active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-9 inline-flex items-center justify-center gap-1.5 px-4 text-xs font-medium bg-accent hover:bg-accent-hover active:scale-[0.99] text-white rounded-md transition-all duration-150 shadow-xs disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{initialData ? 'Save Changes' : 'Create Problem'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
