import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchProfileAnalytics, fetchHeatmapAnalytics } from '../api/analytics';
import { getErrorMessage } from '../utils/errorHandler';
import { getRank, fmtMonthYear } from '../utils/profileUtils';

/**
 * useProfileData: Encapsulated data fetching, cache synchronization,
 * and derived calculations for the user profile workspace.
 */
export function useProfileData() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pRes, hRes] = await Promise.all([
        fetchProfileAnalytics(),
        fetchHeatmapAnalytics(),
      ]);
      if (pRes?.success) setProfile(pRes.data);
      if (hRes?.success) setHeatmap(hRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Synchronize when attempts are logged elsewhere across the app
  useEffect(() => {
    const handleRefresh = () => {
      load();
    };
    window.addEventListener('problem-created', handleRefresh);
    return () => window.removeEventListener('problem-created', handleRefresh);
  }, [load]);

  const initials = useMemo(() => {
    if (!user) return 'U';
    if (user.name) {
      return user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return (user.email?.[0] ?? 'U').toUpperCase();
  }, [user]);

  const solvedPct = useMemo(() => {
    if (!profile || !profile.totalProblems || profile.totalProblems <= 0) return 0;
    return Math.round((profile.totalSolved / profile.totalProblems) * 100);
  }, [profile]);

  const rank = useMemo(() => {
    return getRank(profile?.effectiveTotalSolved ?? profile?.totalSolved ?? 0);
  }, [profile?.effectiveTotalSolved, profile?.totalSolved]);

  const memberSince = useMemo(() => {
    return user?.createdAt ? fmtMonthYear(user.createdAt) : null;
  }, [user?.createdAt]);

  return {
    user,
    profile,
    heatmap,
    loading,
    error,
    refresh: load,
    initials,
    memberSince,
    solvedPct,
    rank,
  };
}

export default useProfileData;
