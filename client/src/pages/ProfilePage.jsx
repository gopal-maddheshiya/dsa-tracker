import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Calendar,
  Briefcase,
  Code2,
  ExternalLink,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Award,
  Zap,
  Target,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSummary, getAdvanced } from '../api/analytics.api.js';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  // Profile Form States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Development Engineer');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'C++');
  const [bio, setBio] = useState(user?.bio || '');
  const [leetcodeHandle, setLeetcodeHandle] = useState(user?.leetcodeHandle || '');
  const [codeforcesHandle, setCodeforcesHandle] = useState(user?.codeforcesHandle || '');
  const [githubHandle, setGithubHandle] = useState(user?.githubHandle || '');

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Quick stats state
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalAttempted: 0,
    totalProblems: 0,
    currentStreak: 0,
    totalHours: '0.0',
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadStats() {
      try {
        const [sumRes, advRes] = await Promise.allSettled([
          getSummary(),
          getAdvanced({ scope: 'all' }),
        ]);

        if (isMounted) {
          const sum = sumRes.status === 'fulfilled' ? sumRes.value.data : null;
          const adv = advRes.status === 'fulfilled' ? advRes.value.data : null;

          setStats({
            totalSolved: sum?.totalSolved || 0,
            totalAttempted: sum?.totalAttempted || 0,
            totalProblems: sum?.totalProblems || 0,
            currentStreak: adv?.rhythmMetrics?.currentStreak || 0,
            totalHours: adv?.timeStats?.totalHours || '0.0',
            loading: false,
          });
        }
      } catch (err) {
        if (isMounted) setStats((s) => ({ ...s, loading: false }));
      }
    }
    loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetRole(user.targetRole || 'Software Development Engineer');
      setPreferredLanguage(user.preferredLanguage || 'C++');
      setBio(user.bio || '');
      setLeetcodeHandle(user.leetcodeHandle || '');
      setCodeforcesHandle(user.codeforcesHandle || '');
      setGithubHandle(user.githubHandle || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!name.trim()) {
      setFeedback({ type: 'error', message: 'Display name cannot be empty.' });
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        targetRole: targetRole.trim(),
        preferredLanguage: preferredLanguage.trim(),
        bio: bio.trim(),
        leetcodeHandle: leetcodeHandle.trim(),
        codeforcesHandle: codeforcesHandle.trim(),
        githubHandle: githubHandle.trim(),
      });

      setFeedback({ type: 'success', message: 'Profile updated successfully!' });
      setIsEditing(false);
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  const displayInitial = (user?.name || 'A').charAt(0).toUpperCase();

  const formattedJoinedDate = (() => {
    if (!user?.createdAt) return 'Active Member';
    try {
      return new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Active Member';
    }
  })();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-wider block mb-1">
            Developer Portfolio
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-text tracking-tight">
            User Profile
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage your public coding identity, target goals, and programming background.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-medium rounded-xl bg-surface border border-line text-text-secondary hover:text-text hover:bg-surface-hover transition-all active:scale-95 shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
          </button>

          <Link
            to="/settings"
            className="h-9 inline-flex items-center gap-1.5 px-3.5 text-xs font-medium rounded-xl bg-accent text-white hover:bg-accent-hover transition-all active:scale-95 shadow-xs"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1. Identity & Portfolio Hero Banner */}
      <div className="p-5 sm:p-7 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-4 sm:gap-5 min-w-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#ed8641] to-[#f97316] text-white font-bold flex items-center justify-center text-3xl font-mono shadow-[0_0_24px_rgba(237,134,65,0.35)] shrink-0">
            {displayInitial}
          </div>

          <div className="min-w-0 space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-text tracking-tight truncate">
                {user?.name}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Verified Dev
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
              <span className="flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-muted" />
                <span>{user?.email}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-mono">
                <Calendar className="w-3.5 h-3.5 text-muted" />
                <span>Joined {formattedJoinedDate}</span>
              </span>
            </div>

            {user?.bio && (
              <p className="text-xs text-text-secondary pt-1 italic line-clamp-2">
                “{user.bio}”
              </p>
            )}
          </div>
        </div>

        {/* Target and Language Chips */}
        <div className="flex md:flex-col items-start md:items-end gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 border border-line text-xs font-medium text-text">
            <Target className="w-3.5 h-3.5 text-accent" />
            <span>{user?.targetRole || 'Software Engineer'}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 border border-line text-xs font-mono text-text-secondary">
            <Code2 className="w-3.5 h-3.5 text-accent-secondary" />
            <span>Primary: {user?.preferredLanguage || 'C++'}</span>
          </div>
        </div>
      </div>

      {/* 2. Quick Practice KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-surface border border-line shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-accent" />
            <span>Solved Problems</span>
          </span>
          <div className="text-2xl font-mono font-bold text-text mt-2">
            {stats.loading ? '—' : stats.totalSolved}
          </div>
          <span className="text-[10px] text-muted font-mono mt-0.5">
            of {stats.totalProblems} tracked
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-line shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Current Streak</span>
          </span>
          <div className="text-2xl font-mono font-bold text-text mt-2 flex items-center gap-1">
            <span>{stats.loading ? '—' : stats.currentStreak}</span>
            <span className="text-base text-amber-400">🔥</span>
          </div>
          <span className="text-[10px] text-muted font-mono mt-0.5">consecutive days</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-line shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>Practice Sessions</span>
          </span>
          <div className="text-2xl font-mono font-bold text-text mt-2">
            {stats.loading ? '—' : stats.totalAttempted}
          </div>
          <span className="text-[10px] text-muted font-mono mt-0.5">logged attempts</span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-line shadow-subtle flex flex-col justify-between">
          <span className="text-[11px] font-medium text-text-secondary flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>Deliberate Practice</span>
          </span>
          <div className="text-2xl font-mono font-bold text-text mt-2">
            {stats.loading ? '—' : `${stats.totalHours}h`}
          </div>
          <span className="text-[10px] text-muted font-mono mt-0.5">coding time invested</span>
        </div>
      </div>

      {/* 3. Interactive Edit Form (Toggleable or Full View) */}
      {isEditing ? (
        <div className="p-5 sm:p-7 rounded-2xl bg-surface border border-line shadow-elevated">
          <div className="flex items-center justify-between border-b border-line pb-4 mb-5">
            <div>
              <h3 className="text-base font-bold text-text">Edit Profile Details</h3>
              <p className="text-xs text-text-secondary">
                Update public identity, handles, and target role settings.
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Verma"
                  required
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-2 border border-line text-xs text-text placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Target Role / Career Goal
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. SDE-1 @ FAANG, Backend Specialist"
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-2 border border-line text-xs text-text placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Primary Coding Language
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-2 border border-line text-xs text-text focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="C++">C++</option>
                  <option value="Java">Java</option>
                  <option value="Python">Python</option>
                  <option value="JavaScript / TypeScript">JavaScript / TypeScript</option>
                  <option value="Go">Go</option>
                  <option value="Rust">Rust</option>
                  <option value="C#">C#</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Bio / Motivation Headline
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Solving 2 problems daily until top tech offer."
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-2 border border-line text-xs text-text placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                />
              </div>
            </div>

            {/* Coding Profile Handles */}
            <div className="pt-2 border-t border-line/60">
              <span className="text-xs font-semibold text-text block mb-3">
                Coding Platform Handles
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-muted mb-1">
                    LeetCode Username
                  </label>
                  <input
                    type="text"
                    value={leetcodeHandle}
                    onChange={(e) => setLeetcodeHandle(e.target.value)}
                    placeholder="e.g. aditya_codes"
                    className="w-full h-9 px-3 rounded-lg bg-surface-2 border border-line text-xs text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted mb-1">
                    Codeforces Handle
                  </label>
                  <input
                    type="text"
                    value={codeforcesHandle}
                    onChange={(e) => setCodeforcesHandle(e.target.value)}
                    placeholder="e.g. tourist"
                    className="w-full h-9 px-3 rounded-lg bg-surface-2 border border-line text-xs text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted mb-1">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                    placeholder="e.g. adityaverma"
                    className="w-full h-9 px-3 rounded-lg bg-surface-2 border border-line text-xs text-text placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text bg-surface-2 hover:bg-surface-hover border border-line transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 inline-flex items-center gap-2 rounded-xl text-xs font-semibold text-white bg-accent hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-50 shadow-xs"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* 4. Portfolio Handles Display & Links */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* LeetCode Card */}
          <div className="p-4 rounded-xl bg-surface border border-line shadow-subtle flex items-center justify-between group hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                LC
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-text block">LeetCode</span>
                <span className="text-[11px] font-mono text-text-secondary truncate block">
                  {user?.leetcodeHandle || 'Not linked'}
                </span>
              </div>
            </div>
            {user?.leetcodeHandle && (
              <a
                href={`https://leetcode.com/u/${user.leetcodeHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                title="View LeetCode Profile"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Codeforces Card */}
          <div className="p-4 rounded-xl bg-surface border border-line shadow-subtle flex items-center justify-between group hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                CF
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-text block">Codeforces</span>
                <span className="text-[11px] font-mono text-text-secondary truncate block">
                  {user?.codeforcesHandle || 'Not linked'}
                </span>
              </div>
            </div>
            {user?.codeforcesHandle && (
              <a
                href={`https://codeforces.com/profile/${user.codeforcesHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                title="View Codeforces Profile"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* GitHub Card */}
          <div className="p-4 rounded-xl bg-surface border border-line shadow-subtle flex items-center justify-between group hover:border-purple-500/40 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                GH
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-text block">GitHub</span>
                <span className="text-[11px] font-mono text-text-secondary truncate block">
                  {user?.githubHandle || 'Not linked'}
                </span>
              </div>
            </div>
            {user?.githubHandle && (
              <a
                href={`https://github.com/${user.githubHandle}`}
                target="_blank"
                rel="noreferrer"
                className="text-muted hover:text-text p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
                title="View GitHub Profile"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
