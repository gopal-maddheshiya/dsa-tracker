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
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
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
      setTitle('');
      setPlatform('leetcode');
      setLink('');
      setDifficulty('easy');
      setTopics([]);
    }
    setTopicInput('');
    setErrors({});
    setApiError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddTopic = () => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;

    // Check case-insensitive duplicate
    const isDuplicate = topics.some(
      (t) => t.toLowerCase() === trimmed.toLowerCase()
    );

    if (!isDuplicate) {
      setTopics([...topics, trimmed]);
      setTopicInput('');
    } else {
      setTopicInput('');
    }
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
      newErrors.link = 'Please enter a valid URL starting with http:// or https://';
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
        toast.success(`Problem "${payload.title}" updated successfully.`);
      } else {
        await createProblem(payload);
        toast.success(`Problem "${payload.title}" added to repository.`);
      }

      onSuccess();
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to save problem. Please review your inputs.');
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="problem-form-title"
    >
      <div className="bg-[#0d121f] border border-slate-800/80 rounded-lg max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-5">
          <h2 id="problem-form-title" className="text-sm font-semibold text-white tracking-tight font-mono">
            {isEdit ? 'Edit Problem' : 'Add New Problem'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors text-sm"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded bg-rose-950/40 border border-rose-900/60 text-xs text-rose-300 font-mono">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="problem-title" className="block text-[11px] font-mono text-slate-300 mb-1">
              Problem Title *
            </label>
            <input
              id="problem-title"
              type="text"
              value={title}
              disabled={isSubmitting}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Trapping Rain Water"
              className={`w-full px-3 py-2 bg-slate-950 border rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors ${
                errors.title ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-800/80 focus:border-slate-600 focus:ring-slate-600'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-400 font-mono">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="problem-platform" className="block text-[11px] font-mono text-slate-300 mb-1">
                Platform *
              </label>
              <select
                id="problem-platform"
                value={platform}
                disabled={isSubmitting}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800/80 rounded text-xs text-slate-100 focus:outline-none focus:border-slate-600 transition-colors font-mono"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="problem-difficulty" className="block text-[11px] font-mono text-slate-300 mb-1">
                Difficulty *
              </label>
              <select
                id="problem-difficulty"
                value={difficulty}
                disabled={isSubmitting}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800/80 rounded text-xs text-slate-100 focus:outline-none focus:border-slate-600 transition-colors font-mono"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="problem-link" className="block text-[11px] font-mono text-slate-300 mb-1">
              Problem URL *
            </label>
            <input
              id="problem-link"
              type="url"
              value={link}
              disabled={isSubmitting}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className={`w-full px-3 py-2 bg-slate-950 border rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 transition-colors font-mono ${
                errors.link ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-800/80 focus:border-slate-600 focus:ring-slate-600'
              }`}
            />
            {errors.link && <p className="mt-1 text-xs text-rose-400 font-mono">{errors.link}</p>}
          </div>

          <div>
            <label htmlFor="topic-input" className="block text-[11px] font-mono text-slate-300 mb-1">
              Topics / Tags <span className="text-slate-500 font-normal">(Press Enter or comma to add)</span>
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
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800/80 rounded text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                disabled={isSubmitting || !topicInput.trim()}
                className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-mono rounded transition-colors"
              >
                Add
              </button>
            </div>

            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-950 text-slate-300 border border-slate-800/80"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      disabled={isSubmitting}
                      className="text-slate-500 hover:text-rose-400 font-bold ml-0.5"
                      aria-label={`Remove topic ${topic}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-3.5 border-t border-slate-800/80 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-50 text-slate-300 text-xs font-mono rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 text-xs font-semibold rounded transition-colors shadow-sm inline-flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? 'Update Problem' : 'Create Problem'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemForm;
