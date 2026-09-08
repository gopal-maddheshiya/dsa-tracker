import React, { useState, useEffect } from 'react';
import { createProblem, updateProblem } from '../api/problems';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorHandler';

const PLATFORMS = [
  { value: 'leetcode', label: 'LeetCode' },
  { value: 'gfg', label: 'GeeksforGeeks' },
  { value: 'codechef', label: 'CodeChef' },
  { value: 'hackerrank', label: 'HackerRank' },
  { value: 'other', label: 'Other' },
];

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy', color: 'text-orange-400' },
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

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setPlatform(initialData.platform || 'leetcode');
      setLink(initialData.link || '');
      setDifficulty(initialData.difficulty || 'easy');
      setTopics(Array.isArray(initialData.topics) ? [...initialData.topics] : []);
    } else {
      setTitle(''); setPlatform('leetcode'); setLink('');
      setDifficulty('easy'); setTopics([]);
    }
    setTopicInput('');
    setErrors({});
    setApiError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

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
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!platform) newErrors.platform = 'Platform is required';
    if (!link.trim()) {
      newErrors.link = 'Problem URL is required';
    } else if (!isValidUrl(link.trim())) {
      newErrors.link = 'Enter a valid URL (http:// or https://)';
    }
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
        toast.success(`"${payload.title}" added.`);
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-form-title"
    >
      <div className="panel max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#2E2A27] mb-5">
          <h2 id="problem-form-title" className="text-base font-semibold text-[#F5F5F4]">
            {isEdit ? 'Edit Problem' : 'Add New Problem'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="text-[#78716C] hover:text-[#F5F5F4] transition-colors p-1 -m-1"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {apiError && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
            <p className="text-xs text-rose-300">{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Title */}
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

          {/* Platform + Difficulty */}
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

          {/* URL */}
          <div>
            <label htmlFor="problem-link" className="block section-label mb-1.5">
              Problem URL *
            </label>
            <input
              id="problem-link"
              type="url"
              value={link}
              disabled={isSubmitting}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className={`input-base ${errors.link ? 'input-error' : ''}`}
            />
            {errors.link && <p className="mt-1.5 text-xs text-rose-400">{errors.link}</p>}
          </div>

          {/* Topics */}
          <div>
            <label htmlFor="topic-input" className="block section-label mb-1.5">
              Topics
              <span className="text-zinc-500 font-normal ml-1 normal-case tracking-normal">
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
                placeholder="e.g. Dynamic Programming"
                className="input-base flex-1"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                disabled={isSubmitting || !topicInput.trim()}
                className="btn-ghost disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="badge"
                  >
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      disabled={isSubmitting}
                      className="text-zinc-500 hover:text-rose-400 font-bold transition-colors ml-0.5"
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
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#2E2A27]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                isEdit ? 'Update Problem' : 'Create Problem'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemForm;
