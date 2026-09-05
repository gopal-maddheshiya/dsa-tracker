import React, { useState, useEffect } from 'react';
import { createProblem, updateProblem } from '../api/problems';

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

const ProblemForm = ({ isOpen, onClose, onSuccess, initialData = null }) => {
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
      setTopics(Array.isArray(initialData.topics) ? initialData.topics : []);
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
    if (trimmed && !topics.includes(trimmed)) {
      setTopics([...topics, trimmed]);
      setTopicInput('');
    }
  };

  const handleTopicKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
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
    if (!link.trim()) newErrors.link = 'Problem link is required';
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
        topics,
      };

      if (isEdit) {
        await updateProblem(initialData.id, payload);
      } else {
        await createProblem(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save problem. Please check your inputs.';
      setApiError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-lg w-full p-6 shadow-xl relative animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isEdit ? 'Edit Problem' : 'Add New Problem'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {apiError && (
          <div className="mb-4 p-3 rounded bg-red-950/50 border border-red-800 text-xs text-red-300">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Problem Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Trapping Rain Water"
              className={`w-full px-3 py-2 bg-slate-950 border rounded-md text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                errors.title ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Difficulty *
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
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
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Problem URL *
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://leetcode.com/problems/..."
              className={`w-full px-3 py-2 bg-slate-950 border rounded-md text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition-colors ${
                errors.link ? 'border-red-500' : 'border-slate-800 focus:border-emerald-500'
              }`}
            />
            {errors.link && <p className="mt-1 text-xs text-red-400">{errors.link}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Topics / Tags (Press Enter to add)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleTopicKeyDown}
                placeholder="e.g. Dynamic Programming"
                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddTopic}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md border border-slate-700 transition-colors"
              >
                Add
              </button>
            </div>

            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      className="text-slate-400 hover:text-red-400 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-slate-950 text-xs font-semibold rounded-md transition-colors shadow-sm"
            >
              {isSubmitting ? 'Saving...' : isEdit ? 'Update Problem' : 'Create Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemForm;
