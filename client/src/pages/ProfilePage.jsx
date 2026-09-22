import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Target, Globe, Trophy, BarChart3, Database } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { fetchProblems } from '../api/problems';
import { useProfileData } from '../hooks/useProfileData';
import Reveal from '../components/common/Reveal';

// Profile modular components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileOverviewTab from '../components/profile/tabs/ProfileOverviewTab';
import ProfilePlatformsTab from '../components/profile/tabs/ProfilePlatformsTab';
import ProfileMilestonesTab, { ALL_MILESTONES } from '../components/profile/tabs/ProfileMilestonesTab';
import ProfileActivityTab from '../components/profile/tabs/ProfileActivityTab';
import ProfileSettingsTab from '../components/profile/tabs/ProfileSettingsTab';

// Modals
import EditProfileModal from '../components/profile/EditProfileModal';
import DataImportModal from '../components/profile/DataImportModal';
import MilestoneDetailModal from '../components/profile/MilestoneDetailModal';

const ProfilePage = () => {
  useEffect(() => {
    document.title = 'Profile · DSA Tracker';
  }, []);

  const toast = useToast();
  const {
    user,
    profile,
    heatmap,
    loading,
    error,
    refresh,
    initials,
    memberSince,
    solvedPct,
    rank,
  } = useProfileData();

  // Tab navigation & URL search params synchronization
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = useMemo(() => ['overview', 'platforms', 'milestones', 'activity', 'settings'], []);
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(validTabs.includes(initialTab) ? initialTab : 'overview');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && validTabs.includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, validTabs, activeTab]);

  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tabId === 'overview') {
        next.delete('tab');
      } else {
        next.set('tab', tabId);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Modal states
  const [isExporting, setIsExporting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);

  // Data Export Logic (JSON / CSV)
  const handleExportData = async (format = 'json') => {
    setIsExporting(true);
    try {
      const res = await fetchProblems();
      const problems = res?.data || [];

      if (!problems.length) {
        toast?.error ? toast.error('No problems cataloged to export yet.') : alert('No problems found.');
        return;
      }

      if (format === 'json') {
        const jsonString = JSON.stringify(problems, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', url);
        downloadAnchor.setAttribute('download', `dsa-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
        toast?.success && toast.success(`Successfully exported ${problems.length} problems as JSON!`);
      } else if (format === 'csv') {
        const headers = ['Title', 'Platform', 'Difficulty', 'Topics', 'Link', 'Created At'];
        const rows = problems.map((p) => [
          `"${(p.title || '').replace(/"/g, '""')}"`,
          `"${p.platform || ''}"`,
          `"${p.difficulty || ''}"`,
          `"${(p.topics || []).join('; ').replace(/"/g, '""')}"`,
          `"${p.link || ''}"`,
          `"${p.createdAt || ''}"`,
        ]);
        const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', url);
        downloadAnchor.setAttribute('download', `dsa-tracker-export-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        URL.revokeObjectURL(url);
        toast?.success && toast.success(`Successfully exported ${problems.length} problems as CSV!`);
      }
    } catch (err) {
      toast?.error ? toast.error('Failed to export problem data: ' + err.message) : alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Loading skeleton state
  if (loading) {
    return (
      <div className="space-y-5 pb-12 animate-pulse">
        <div className="h-36 bg-surface border border-line rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-surface border border-line rounded-xl" />
          ))}
        </div>
        <div className="h-24 bg-surface border border-line rounded-xl" />
        <div className="h-52 bg-surface border border-line rounded-xl" />
        <div className="h-40 bg-surface border border-line rounded-xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-surface border border-line rounded-xl p-10 text-center">
        <p className="text-danger text-sm">{error}</p>
        <button onClick={refresh} className="btn-secondary mt-4">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 animate-fade-up">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <ProfileHeader
        user={user}
        profile={profile}
        rank={rank}
        solvedPct={solvedPct}
        initials={initials}
        memberSince={memberSince}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenEditModal={() => setIsEditModalOpen(true)}
      />

      {/* ── Workspace Tab Strip ─────────────────────────────────── */}
      <Reveal delay={20} y={10}>
        <div
          className="flex items-center gap-2 p-1.5 bg-surface border border-line/80 rounded-2xl overflow-x-auto no-scrollbar shadow-xs"
          role="tablist"
          aria-label="Profile workspace sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => handleTabChange('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Overview & Goals</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'platforms'}
            onClick={() => handleTabChange('platforms')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'platforms'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Connected Platforms</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'platforms' ? 'bg-white/20 text-white' : 'bg-accent/15 text-accent'
              }`}
            >
              4 Hubs
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'milestones'}
            onClick={() => handleTabChange('milestones')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'milestones'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Milestones & Badges</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'milestones' ? 'bg-white/20 text-white' : 'bg-surface-2 text-secondary'
              }`}
            >
              {profile?.badges?.length ?? 0}/{ALL_MILESTONES.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'activity'}
            onClick={() => handleTabChange('activity')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'activity'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Activity & Analytics</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'activity' ? 'bg-white/20 text-white' : 'bg-surface-2 text-secondary'
              }`}
            >
              {heatmap.length}d
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'settings'}
            onClick={() => handleTabChange('settings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'text-secondary hover:text-text hover:bg-surface-2'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Data & Settings</span>
          </button>
        </div>
      </Reveal>

      {/* ── Tab 1: Overview & Goals ──────────────────────────────── */}
      {activeTab === 'overview' && (
        <ProfileOverviewTab profile={profile} memberSince={memberSince} />
      )}

      {/* ── Tab: Connected Platforms ────────────────────────────── */}
      {activeTab === 'platforms' && (
        <ProfilePlatformsTab onSyncSuccess={refresh} />
      )}

      {/* ── Tab 2: Milestones & Badges ───────────────────────────── */}
      {activeTab === 'milestones' && (
        <ProfileMilestonesTab
          profile={profile}
          onSelectMilestone={(m) => setSelectedMilestone(m)}
        />
      )}

      {/* ── Tab 3: Activity & Analytics ─────────────────────────── */}
      {activeTab === 'activity' && (
        <ProfileActivityTab profile={profile} heatmap={heatmap} />
      )}

      {/* ── Tab 4: Data & Settings ──────────────────────────────── */}
      {activeTab === 'settings' && (
        <ProfileSettingsTab
          user={user}
          onOpenEditModal={() => setIsEditModalOpen(true)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onExportData={handleExportData}
          isExporting={isExporting}
        />
      )}

      {/* ── Modals ──────────────────────────────────────────────── */}
      {/* Edit Profile & Security Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Data Import & Restore Modal */}
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={refresh}
      />

      {/* Interactive Milestone Detail & Progress Modal */}
      <MilestoneDetailModal
        milestone={selectedMilestone}
        profile={profile}
        isOpen={Boolean(selectedMilestone)}
        onClose={() => setSelectedMilestone(null)}
      />
    </div>
  );
};

export default ProfilePage;
