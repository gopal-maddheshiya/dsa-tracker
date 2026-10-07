import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { analyticsApi } from '../api/analytics.api';
import { webPush } from '../lib/webPush';

const NotificationContext = createContext(null);

const STORAGE_KEY_PREFIX = 'dsa_notifications_state_';
const DEVICE_ALERT_DATE_KEY = 'dsa_last_device_alert_date';

/**
 * Computes deterministic relative time label
 */
function getRelativeTimeLabel(dateStr) {
  if (!dateStr) return 'Recently';
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * NotificationProvider: Manages real-time spaced repetition alerts, topic friction
 * warnings, and daily practice reminders.
 */
export function NotificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [devicePermission, setDevicePermission] = useState(() => webPush.getPermission());

  // Storage key isolated per user
  const storageKey = useMemo(() => {
    return user?.id || user?._id ? `${STORAGE_KEY_PREFIX}${user.id || user._id}` : `${STORAGE_KEY_PREFIX}guest`;
  }, [user]);

  // Read saved state (read IDs, dismissed IDs) from localStorage
  const loadSavedState = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.warn('Could not read notification state from storage:', err);
    }
    return { readIds: [], dismissedIds: [] };
  }, [storageKey]);

  // Persist read/dismissed IDs
  const saveState = useCallback((readIds, dismissedIds) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ readIds, dismissedIds }));
    } catch (err) {
      console.warn('Could not save notification state to storage:', err);
    }
  }, [storageKey]);

  /**
   * Fetches data from revision-queue, topics, and heatmap to generate real notifications
   */
  const fetchAndGenerateNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const { readIds, dismissedIds } = loadSavedState();
      const readSet = new Set(readIds);
      const dismissedSet = new Set(dismissedIds);

      // Parallel query to analytics endpoints
      const [queueRes, topicsRes, heatmapRes] = await Promise.allSettled([
        analyticsApi.getRevisionQueue(),
        analyticsApi.getTopics(),
        analyticsApi.getHeatmap(),
      ]);

      const items = [];
      const todayStr = new Date().toISOString().slice(0, 10);

      // 1. Spaced Repetition Due & Overdue Items
      if (queueRes.status === 'fulfilled' && Array.isArray(queueRes.value?.data?.queue)) {
        const queue = queueRes.value.data.queue;

        queue.forEach((problem) => {
          const isOverdue = problem.daysSinceLastAttempt > problem.intervalDays;
          const isDue = problem.daysSinceLastAttempt >= problem.intervalDays;

          if (isOverdue) {
            const notifId = `rev-overdue-${problem.id}`;
            if (!dismissedSet.has(notifId)) {
              items.push({
                id: notifId,
                category: 'revisions',
                urgency: 'high',
                title: `Overdue: ${problem.title}`,
                message: `Exceeded spaced interval by ${problem.daysSinceLastAttempt - problem.intervalDays} day(s). Priority score: ${problem.priorityScore.toFixed(1)}.`,
                timestamp: problem.lastAttemptedAt,
                timeLabel: getRelativeTimeLabel(problem.lastAttemptedAt),
                badge: 'OVERDUE',
                actionLabel: 'Review Problem',
                actionUrl: `/problems/${problem.id}`,
                read: readSet.has(notifId),
              });
            }
          } else if (isDue) {
            const notifId = `rev-due-${problem.id}`;
            if (!dismissedSet.has(notifId)) {
              items.push({
                id: notifId,
                category: 'revisions',
                urgency: 'medium',
                title: `Revision Due: ${problem.title}`,
                message: `Leitner interval of ${problem.intervalDays} day(s) reached today. Refresh your recall before memory decay.`,
                timestamp: problem.lastAttemptedAt,
                timeLabel: getRelativeTimeLabel(problem.lastAttemptedAt),
                badge: 'DUE TODAY',
                actionLabel: 'Review Problem',
                actionUrl: `/problems/${problem.id}`,
                read: readSet.has(notifId),
              });
            }
          }
        });
      }

      // 2. High Topic Friction Alerts (Struggle Ratio >= 50% with at least 2 struggle attempts)
      if (topicsRes.status === 'fulfilled' && Array.isArray(topicsRes.value?.data?.topics)) {
        const topics = topicsRes.value.data.topics;
        const highestStruggleTopic = topics.find(
          (t) => t.struggleRatio >= 0.5 && t.struggledCount >= 2
        );

        if (highestStruggleTopic) {
          const notifId = `topic-friction-${highestStruggleTopic.topic.toLowerCase().replace(/\s+/g, '-')}`;
          if (!dismissedSet.has(notifId)) {
            items.push({
              id: notifId,
              category: 'weakness',
              urgency: 'medium',
              title: `Topic Friction: ${highestStruggleTopic.topic}`,
              message: `${Math.round(highestStruggleTopic.struggleRatio * 100)}% struggle rate over ${highestStruggleTopic.totalAttempts} attempts. Consider practicing foundational patterns.`,
              timestamp: new Date().toISOString(),
              timeLabel: 'Active Alert',
              badge: 'WEAKNESS',
              actionLabel: `Practice ${highestStruggleTopic.topic}`,
              actionUrl: `/problems?search=${encodeURIComponent(highestStruggleTopic.topic)}`,
              read: readSet.has(notifId),
            });
          }
        }
      }

      // 3. Daily Practice Goal & Streak Status
      if (heatmapRes.status === 'fulfilled' && Array.isArray(heatmapRes.value?.data?.heatmap)) {
        const heatmap = heatmapRes.value.data.heatmap;
        const todayAttempt = heatmap.find((item) => item.date === todayStr);

        const notifId = `daily-goal-${todayStr}`;
        if (!dismissedSet.has(notifId)) {
          if (!todayAttempt || todayAttempt.count === 0) {
            items.push({
              id: notifId,
              category: 'daily',
              urgency: 'low',
              title: 'Daily Practice Goal',
              message: 'No practice attempts logged today yet. Solve 1 problem to keep your momentum high!',
              timestamp: new Date().toISOString(),
              timeLabel: 'Today',
              badge: 'GOAL',
              actionLabel: 'Pick Problem',
              actionUrl: '/problems',
              read: readSet.has(notifId),
            });
          } else {
            items.push({
              id: notifId,
              category: 'daily',
              urgency: 'low',
              title: 'Daily Momentum Maintained',
              message: `Great consistency! You've logged ${todayAttempt.count} attempt(s) today. Your practice rhythm is active.`,
              timestamp: new Date().toISOString(),
              timeLabel: 'Today',
              badge: 'STREAK',
              actionLabel: 'View Analytics',
              actionUrl: '/analytics',
              read: readSet.has(notifId),
            });
          }
        }
      }

      // 4. Default System Welcome / Algorithmic Status (if list is sparse)
      if (items.length === 0) {
        const notifId = 'system-engine-ready';
        if (!dismissedSet.has(notifId)) {
          items.push({
            id: notifId,
            category: 'system',
            urgency: 'low',
            title: 'Spaced Repetition Engine Active',
            message: 'Your revision queue automatically schedules reviews as you log problem attempts.',
            timestamp: new Date().toISOString(),
            timeLabel: 'Active',
            badge: 'SYSTEM',
            actionLabel: 'View Queue',
            actionUrl: '/revision',
            read: readSet.has(notifId),
          });
        }
      }

      // Sort: high urgency first, unread first
      items.sort((a, b) => {
        if (a.read !== b.read) return a.read ? 1 : -1;
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        return (urgencyOrder[a.urgency] ?? 2) - (urgencyOrder[b.urgency] ?? 2);
      });

      setNotifications(items);

      // Auto-dispatch device push notification if permission is granted and there are high-urgency items
      if (webPush.getPermission() === 'granted') {
        const overdueItems = items.filter((n) => n.badge === 'OVERDUE' && !n.read);
        if (overdueItems.length > 0) {
          const lastAlertDate = localStorage.getItem(DEVICE_ALERT_DATE_KEY);
          if (lastAlertDate !== todayStr) {
            webPush.sendNotification({
              title: `⚡ DSA Tracker · ${overdueItems.length} Revision${overdueItems.length > 1 ? 's' : ''} Overdue`,
              body: `${overdueItems[0].title} is due for spaced review. Tap to refresh recall!`,
              url: '/revision',
              tag: 'dsa-overdue-alert',
            });
            localStorage.setItem(DEVICE_ALERT_DATE_KEY, todayStr);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to generate notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loadSavedState]);

  // Initial fetch and window focus refresh
  useEffect(() => {
    fetchAndGenerateNotifications();

    const handleFocus = () => {
      fetchAndGenerateNotifications();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchAndGenerateNotifications]);

  // Actions
  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      const { readIds, dismissedIds } = loadSavedState();
      const newReadIds = Array.from(new Set([...readIds, id]));
      saveState(newReadIds, dismissedIds);
      return updated;
    });
  }, [loadSavedState, saveState]);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      const { dismissedIds } = loadSavedState();
      const allIds = prev.map((n) => n.id);
      saveState(allIds, dismissedIds);
      return updated;
    });
  }, [loadSavedState, saveState]);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      const { readIds, dismissedIds } = loadSavedState();
      const newDismissedIds = Array.from(new Set([...dismissedIds, id]));
      saveState(readIds, newDismissedIds);
      return updated;
    });
  }, [loadSavedState, saveState]);

  const clearAll = useCallback(() => {
    setNotifications((prev) => {
      const allIds = prev.map((n) => n.id);
      const { readIds, dismissedIds } = loadSavedState();
      const newDismissed = Array.from(new Set([...dismissedIds, ...allIds]));
      saveState(readIds, newDismissed);
      return [];
    });
  }, [loadSavedState, saveState]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const requestDevicePermission = useCallback(async () => {
    const res = await webPush.requestPermission();
    setDevicePermission(res);
    if (res === 'granted') {
      await webPush.sendTestNotification();
    }
    return res;
  }, []);

  const sendTestDeviceNotification = useCallback(async () => {
    const res = await webPush.sendTestNotification();
    setDevicePermission(webPush.getPermission());
    return res;
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    isOpen,
    setIsOpen,
    toggleOpen,
    close,
    markAsRead,
    markAllAsRead,
    dismiss,
    clearAll,
    refreshNotifications: fetchAndGenerateNotifications,
    devicePermission,
    requestDevicePermission,
    sendTestDeviceNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
