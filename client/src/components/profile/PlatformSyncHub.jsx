import React, { useState, useEffect, useCallback } from 'react';
import {
  RotateCcw, CheckCircle2, ExternalLink,
  Unlink, ShieldCheck, Zap, Trophy, Flame, Layers, Sparkles,
  ArrowRight, RefreshCw, Globe, HelpCircle, Award, Star
} from 'lucide-react';
import { getSyncStatus, connectPlatform, disconnectPlatform, syncPlatform, syncAllPlatforms } from '../../api/sync';
import { useToast } from '../../context/ToastContext';

/* ── Branded SVG Logos ─────────────────────────────────────────── */
const LeetCodeLogo = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 4.818 3.551 5.973 5.973 0 0 0 3.324-.766l5.882-4.148a1.378 1.378 0 0 0 .438-.961 1.378 1.378 0 0 0-.438-.962L10.37 8.07l4.074-4.36A1.374 1.374 0 0 0 13.483 0zm-2.88 8.877l4.364 4.364-4.819 3.398a3.178 3.178 0 0 1-1.77.408 3.16 3.16 0 0 1-2.568-1.892 3.11 3.11 0 0 1-.186-.542 2.946 2.946 0 0 1-.033-1.258 2.808 2.808 0 0 1 .644-1.121l4.368-3.357zM19.98 12.012a1.374 1.374 0 0 0-.961.438l-2.073 2.073a1.378 1.378 0 0 0 1.95 1.95l2.073-2.073a1.374 1.374 0 0 0-.989-2.388z" />
  </svg>
);

const CodeforcesLogo = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <rect x="1.5" y="9" width="5" height="13" rx="1.5" fill="#FFC107" />
    <rect x="9.5" y="3" width="5" height="19" rx="1.5" fill="#2196F3" />
    <rect x="17.5" y="6.5" width="5" height="15.5" rx="1.5" fill="#F44336" />
  </svg>
);

const GFGLogo = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path
      d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"
      fill="#2F8D46"
    />
    <path
      d="M9.5 10a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm5 0a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"
      fill="#FFFFFF"
    />
  </svg>
);

const CodeChefLogo = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a6 6 0 0 0-5.657 4H5a3 3 0 0 0-3 3v1a3 3 0 0 0 2 2.816V17a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-4.184A3 3 0 0 0 22 10V9a3 3 0 0 0-3-3h-1.343A6 6 0 0 0 12 2zm-4 7a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V9zm1 5h6v1H9v-1zm0 3h6v1H9v-1z" />
  </svg>
);

const fmtRelativeTime = (d) => {
  if (!d) return 'Never synced';
  const diffSec = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

const PlatformSyncHub = ({ onSyncSuccess }) => {
  const toast = useToast();
  const [status, setStatus] = useState({
    leetcode: { handle: null, isConnected: false, lastSyncedAt: null, totalSynced: 0, stats: {} },
    codeforces: { handle: null, isConnected: false, lastSyncedAt: null, totalSynced: 0, stats: {} },
    gfg: { handle: null, isConnected: false, lastSyncedAt: null, totalSynced: 0, stats: {} },
    codechef: { handle: null, isConnected: false, lastSyncedAt: null, totalSynced: 0, stats: {} },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Per-platform input handles
  const [handles, setHandles] = useState({
    leetcode: '',
    codeforces: '',
    gfg: '',
    codechef: '',
  });

  // Connecting and syncing spin flags
  const [connecting, setConnecting] = useState({
    leetcode: false,
    codeforces: false,
    gfg: false,
    codechef: false,
  });

  const [syncing, setSyncing] = useState({
    leetcode: false,
    codeforces: false,
    gfg: false,
    codechef: false,
    all: false,
  });

  const loadStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getSyncStatus();
      if (res?.data) {
        setStatus(res.data);
        setHandles({
          leetcode: res.data.leetcode?.handle || '',
          codeforces: res.data.codeforces?.handle || '',
          gfg: res.data.gfg?.handle || '',
          codechef: res.data.codechef?.handle || '',
        });
      }
    } catch (err) {
      toast.error('Failed to load platform connections');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleConnect = async (platform) => {
    const handle = handles[platform]?.trim();
    if (!handle) {
      toast.error(`Please enter your ${platform.toUpperCase()} username or handle`);
      return;
    }

    try {
      setConnecting((prev) => ({ ...prev, [platform]: true }));
      const res = await connectPlatform(platform, handle);
      toast.success(res.message || `Connected ${platform.toUpperCase()} account!`);
      await loadStatus();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Verification failed';
      toast.error(msg);
    } finally {
      setConnecting((prev) => ({ ...prev, [platform]: false }));
    }
  };

  const handleDisconnect = async (platform) => {
    if (!window.confirm(`Unlink your ${platform.toUpperCase()} account? (Your previously synced problems will remain safe)`)) {
      return;
    }

    try {
      await disconnectPlatform(platform);
      toast.info(`Disconnected ${platform.toUpperCase()} account`);
      await loadStatus();
    } catch (err) {
      toast.error('Failed to disconnect platform');
    }
  };

  const handleSync = async (platform) => {
    try {
      setSyncing((prev) => ({ ...prev, [platform]: true }));
      const res = await syncPlatform(platform);
      const data = res.data;
      toast.success(
        `Synced ${data.syncedCount} new problem${data.syncedCount === 1 ? '' : 's'} (${data.skippedDuplicates} duplicates skipped)`
      );
      await loadStatus();
      onSyncSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Sync failed';
      toast.error(msg);
    } finally {
      setSyncing((prev) => ({ ...prev, [platform]: false }));
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing((prev) => ({ ...prev, all: true }));
      const res = await syncAllPlatforms();
      const data = res.data;
      toast.success(`Complete: ${data.totalSynced} new problems synced across connected accounts!`);
      await loadStatus();
      onSyncSuccess?.();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Batch sync failed';
      toast.error(msg);
    } finally {
      setSyncing((prev) => ({ ...prev, all: false }));
    }
  };

  const connectedCount = [
    status.leetcode?.isConnected,
    status.codeforces?.isConnected,
    status.gfg?.isConnected,
    status.codechef?.isConnected,
  ].filter(Boolean).length;

  const isAnySyncing = syncing.all || syncing.leetcode || syncing.codeforces || syncing.gfg || syncing.codechef;

  return (
    <div className="space-y-6">
      {/* ── Top Header Strip ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-line shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-text tracking-tight flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" />
              <span>Platform Sync Hub</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-accent/15 text-accent border border-accent/30">
              Phase 2 Live (4 Platforms)
            </span>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            Link your coding handles to automatically pull solved questions, track your competitive ratings, and keep your Activity Heatmap populated.
          </p>
        </div>

        {connectedCount > 0 && (
          <button
            type="button"
            disabled={isAnySyncing}
            onClick={handleSyncAll}
            className="btn-primary min-h-[38px] px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 active:scale-95 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing.all ? 'animate-spin' : ''}`} />
            <span>{syncing.all ? 'Syncing All Accounts...' : `Sync All (${connectedCount} Linked)`}</span>
          </button>
        )}
      </div>

      {/* ── Cards Grid (LeetCode, Codeforces, GeeksforGeeks, CodeChef) ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. LeetCode Card */}
        <div className="rounded-2xl bg-surface border border-line p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#FFA116]/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#FFA116]/8 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FFA116]/12 border border-[#FFA116]/30 flex items-center justify-center text-[#FFA116] shrink-0 shadow-inner">
                  <LeetCodeLogo className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text tracking-tight">
                    LeetCode
                  </h3>
                  <span className="text-xs text-muted">
                    Official GraphQL Sync
                  </span>
                </div>
              </div>

              {status.leetcode?.isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/15 border border-success/30 text-success shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-2 border border-line text-muted shrink-0">
                  <span>Not Linked</span>
                </span>
              )}
            </div>

            {/* Body */}
            {status.leetcode?.isConnected ? (
              <div className="space-y-4 my-2">
                <div className="p-3 rounded-xl bg-surface-2/60 border border-line/70 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-muted block">Username</span>
                    <a
                      href={`https://leetcode.com/u/${status.leetcode.handle}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-text hover:text-[#FFA116] transition-colors flex items-center gap-1 truncate group/link"
                    >
                      <span>@{status.leetcode.handle}</span>
                      <ExternalLink className="w-3 h-3 text-muted group-hover/link:text-[#FFA116]" />
                    </a>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted block">Last Synced</span>
                    <span className="text-xs font-medium text-secondary">
                      {fmtRelativeTime(status.leetcode.lastSyncedAt)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Solved</span>
                    <span className="text-sm font-bold text-text tabular-nums">
                      {status.leetcode.stats?.totalSolved ?? status.leetcode.totalSynced ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-easy font-semibold block">Easy</span>
                    <span className="text-sm font-bold text-easy tabular-nums">
                      {status.leetcode.stats?.easy ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-medium font-semibold block">Med.</span>
                    <span className="text-sm font-bold text-medium tabular-nums">
                      {status.leetcode.stats?.medium ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-hard font-semibold block">Hard</span>
                    <span className="text-sm font-bold text-hard tabular-nums">
                      {status.leetcode.stats?.hard ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 my-2">
                <p className="text-xs text-secondary leading-relaxed">
                  Enter your public LeetCode username. No passwords or tokens required.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={handles.leetcode}
                    onChange={(e) => setHandles({ ...handles, leetcode: e.target.value })}
                    placeholder="e.g. lee215 or your_handle"
                    disabled={connecting.leetcode}
                    className="flex-1 input-field text-xs h-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect('leetcode')}
                  />
                  <button
                    type="button"
                    disabled={connecting.leetcode || !handles.leetcode.trim()}
                    onClick={() => handleConnect('leetcode')}
                    className="btn-primary px-3.5 h-9 text-xs font-semibold cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {connecting.leetcode ? 'Verifying...' : 'Connect'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {status.leetcode?.isConnected && (
            <div className="pt-4 mt-2 border-t border-line/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDisconnect('leetcode')}
                className="text-xs text-muted hover:text-danger transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>

              <button
                type="button"
                disabled={syncing.leetcode || isAnySyncing}
                onClick={() => handleSync('leetcode')}
                className="btn-secondary h-8 px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${syncing.leetcode ? 'animate-spin text-[#FFA116]' : ''}`} />
                <span>{syncing.leetcode ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Codeforces Card */}
        <div className="rounded-2xl bg-surface border border-line p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#2196F3]/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#2196F3]/8 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#2196F3]/12 border border-[#2196F3]/30 flex items-center justify-center text-[#2196F3] shrink-0 shadow-inner">
                  <CodeforcesLogo className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text tracking-tight">
                    Codeforces
                  </h3>
                  <span className="text-xs text-muted">
                    Official Public API Sync
                  </span>
                </div>
              </div>

              {status.codeforces?.isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/15 border border-success/30 text-success shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-2 border border-line text-muted shrink-0">
                  <span>Not Linked</span>
                </span>
              )}
            </div>

            {/* Body */}
            {status.codeforces?.isConnected ? (
              <div className="space-y-4 my-2">
                <div className="p-3 rounded-xl bg-surface-2/60 border border-line/70 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-muted block">Handle</span>
                    <a
                      href={`https://codeforces.com/profile/${status.codeforces.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-text hover:text-[#2196F3] transition-colors flex items-center gap-1 truncate group/link"
                    >
                      <span>@{status.codeforces.handle}</span>
                      <ExternalLink className="w-3 h-3 text-muted group-hover/link:text-[#2196F3]" />
                    </a>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted block">Last Synced</span>
                    <span className="text-xs font-medium text-secondary">
                      {fmtRelativeTime(status.codeforces.lastSyncedAt)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Rating</span>
                    <span className="text-sm font-bold text-text tabular-nums">
                      {status.codeforces.stats?.rating ?? 'Unrated'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Max Rating</span>
                    <span className="text-sm font-bold text-[#2196F3] tabular-nums">
                      {status.codeforces.stats?.maxRating ?? '—'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Rank Title</span>
                    <span className="text-sm font-bold text-text capitalize truncate block">
                      {status.codeforces.stats?.rank ?? 'unranked'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 my-2">
                <p className="text-xs text-secondary leading-relaxed">
                  Enter your Codeforces handle to sync AC submissions and contest problems.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={handles.codeforces}
                    onChange={(e) => setHandles({ ...handles, codeforces: e.target.value })}
                    placeholder="e.g. tourist or your_handle"
                    disabled={connecting.codeforces}
                    className="flex-1 input-field text-xs h-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect('codeforces')}
                  />
                  <button
                    type="button"
                    disabled={connecting.codeforces || !handles.codeforces.trim()}
                    onClick={() => handleConnect('codeforces')}
                    className="btn-primary px-3.5 h-9 text-xs font-semibold cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {connecting.codeforces ? 'Verifying...' : 'Connect'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {status.codeforces?.isConnected && (
            <div className="pt-4 mt-2 border-t border-line/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDisconnect('codeforces')}
                className="text-xs text-muted hover:text-danger transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>

              <button
                type="button"
                disabled={syncing.codeforces || isAnySyncing}
                onClick={() => handleSync('codeforces')}
                className="btn-secondary h-8 px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${syncing.codeforces ? 'animate-spin text-[#2196F3]' : ''}`} />
                <span>{syncing.codeforces ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. GeeksforGeeks Card */}
        <div className="rounded-2xl bg-surface border border-line p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#2F8D46]/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#2F8D46]/8 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#2F8D46]/12 border border-[#2F8D46]/30 flex items-center justify-center text-[#2F8D46] shrink-0 shadow-inner">
                  <GFGLogo className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text tracking-tight">
                    GeeksforGeeks
                  </h3>
                  <span className="text-xs text-muted">
                    Profile & Practice Sync
                  </span>
                </div>
              </div>

              {status.gfg?.isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/15 border border-success/30 text-success shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-2 border border-line text-muted shrink-0">
                  <span>Not Linked</span>
                </span>
              )}
            </div>

            {/* Body */}
            {status.gfg?.isConnected ? (
              <div className="space-y-4 my-2">
                <div className="p-3 rounded-xl bg-surface-2/60 border border-line/70 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-muted block">Username</span>
                    <a
                      href={`https://www.geeksforgeeks.org/user/${status.gfg.handle}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-text hover:text-[#2F8D46] transition-colors flex items-center gap-1 truncate group/link"
                    >
                      <span>@{status.gfg.handle}</span>
                      <ExternalLink className="w-3 h-3 text-muted group-hover/link:text-[#2F8D46]" />
                    </a>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted block">Last Synced</span>
                    <span className="text-xs font-medium text-secondary">
                      {fmtRelativeTime(status.gfg.lastSyncedAt)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Coding Score</span>
                    <span className="text-sm font-bold text-[#2F8D46] tabular-nums">
                      {status.gfg.stats?.score ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Solved</span>
                    <span className="text-sm font-bold text-text tabular-nums">
                      {status.gfg.stats?.totalSolved ?? status.gfg.totalSynced ?? 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Inst. Rank</span>
                    <span className="text-sm font-bold text-text tabular-nums">
                      {status.gfg.stats?.instituteRank ? `#${status.gfg.stats.instituteRank}` : '—'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-accent font-semibold block">Streak</span>
                    <span className="text-sm font-bold text-accent tabular-nums flex items-center justify-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 text-accent inline" />
                      <span>{status.gfg.stats?.streak ?? 0}d</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 my-2">
                <p className="text-xs text-secondary leading-relaxed">
                  Enter your GeeksforGeeks handle to sync your problem solving stats and score.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={handles.gfg}
                    onChange={(e) => setHandles({ ...handles, gfg: e.target.value })}
                    placeholder="e.g. gopalmaddheshiya or your_handle"
                    disabled={connecting.gfg}
                    className="flex-1 input-field text-xs h-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect('gfg')}
                  />
                  <button
                    type="button"
                    disabled={connecting.gfg || !handles.gfg.trim()}
                    onClick={() => handleConnect('gfg')}
                    className="btn-primary px-3.5 h-9 text-xs font-semibold cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {connecting.gfg ? 'Verifying...' : 'Connect'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {status.gfg?.isConnected && (
            <div className="pt-4 mt-2 border-t border-line/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDisconnect('gfg')}
                className="text-xs text-muted hover:text-danger transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>

              <button
                type="button"
                disabled={syncing.gfg || isAnySyncing}
                onClick={() => handleSync('gfg')}
                className="btn-secondary h-8 px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${syncing.gfg ? 'animate-spin text-[#2F8D46]' : ''}`} />
                <span>{syncing.gfg ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. CodeChef Card */}
        <div className="rounded-2xl bg-surface border border-line p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group hover:border-[#8B572A]/40 transition-all duration-300">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#8B572A]/8 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#8B572A]/15 border border-[#8B572A]/30 flex items-center justify-center text-[#D4A373] shrink-0 shadow-inner">
                  <CodeChefLogo className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text tracking-tight flex items-center gap-1.5">
                    <span>CodeChef</span>
                    {status.codechef?.stats?.stars && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#8B572A]/20 text-[#D4A373] border border-[#8B572A]/30">
                        {status.codechef.stats.stars}
                      </span>
                    )}
                  </h3>
                  <span className="text-xs text-muted">
                    Contests & Problems Sync
                  </span>
                </div>
              </div>

              {status.codechef?.isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success/15 border border-success/30 text-success shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-2 border border-line text-muted shrink-0">
                  <span>Not Linked</span>
                </span>
              )}
            </div>

            {/* Body */}
            {status.codechef?.isConnected ? (
              <div className="space-y-4 my-2">
                <div className="p-3 rounded-xl bg-surface-2/60 border border-line/70 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase text-muted block">Handle</span>
                    <a
                      href={`https://www.codechef.com/users/${status.codechef.handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-text hover:text-[#D4A373] transition-colors flex items-center gap-1 truncate group/link"
                    >
                      <span>@{status.codechef.handle}</span>
                      <ExternalLink className="w-3 h-3 text-muted group-hover/link:text-[#D4A373]" />
                    </a>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted block">Last Synced</span>
                    <span className="text-xs font-medium text-secondary">
                      {fmtRelativeTime(status.codechef.lastSyncedAt)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Rating</span>
                    <span className="text-sm font-bold text-[#D4A373] tabular-nums">
                      {status.codechef.stats?.rating ?? 'Unrated'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Max Rating</span>
                    <span className="text-sm font-bold text-text tabular-nums">
                      {status.codechef.stats?.highestRating ?? '—'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Global Rank</span>
                    <span className="text-sm font-bold text-text tabular-nums">
                      {status.codechef.stats?.globalRank ? `#${status.codechef.stats.globalRank}` : '—'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface-2/40 border border-line/50 text-center">
                    <span className="text-[10px] text-muted font-mono block">Solved</span>
                    <span className="text-sm font-bold text-text tabular-nums">
                      {status.codechef.stats?.totalSolved ?? status.codechef.totalSynced ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 my-2">
                <p className="text-xs text-secondary leading-relaxed">
                  Enter your CodeChef handle to sync your contest rating, stars, and solved questions.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={handles.codechef}
                    onChange={(e) => setHandles({ ...handles, codechef: e.target.value })}
                    placeholder="e.g. tourist or your_handle"
                    disabled={connecting.codechef}
                    className="flex-1 input-field text-xs h-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleConnect('codechef')}
                  />
                  <button
                    type="button"
                    disabled={connecting.codechef || !handles.codechef.trim()}
                    onClick={() => handleConnect('codechef')}
                    className="btn-primary px-3.5 h-9 text-xs font-semibold cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {connecting.codechef ? 'Verifying...' : 'Connect'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {status.codechef?.isConnected && (
            <div className="pt-4 mt-2 border-t border-line/60 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleDisconnect('codechef')}
                className="text-xs text-muted hover:text-danger transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>

              <button
                type="button"
                disabled={syncing.codechef || isAnySyncing}
                onClick={() => handleSync('codechef')}
                className="btn-secondary h-8 px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${syncing.codechef ? 'animate-spin text-[#D4A373]' : ''}`} />
                <span>{syncing.codechef ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Feature Explainer Banner ────────────────────────────── */}
      <div className="p-4 rounded-xl bg-surface-2/40 border border-line/70 flex items-start gap-3 text-xs text-secondary">
        <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-text">Intelligent Deduplication & Historical Activity</p>
          <p className="text-muted leading-relaxed">
            Synced problems automatically map to your DSA Tracker catalog across LeetCode, Codeforces, GeeksforGeeks, and CodeChef. Problems already in your catalog are skipped so you never get duplicates. Past submission timestamps are preserved to keep your Activity Heatmap and practice rhythm accurate.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlatformSyncHub;
