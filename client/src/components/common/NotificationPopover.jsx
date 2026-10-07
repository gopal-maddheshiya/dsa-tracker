import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  CheckCheck,
  RotateCw,
  X,
  AlertCircle,
  AlertTriangle,
  Flame,
  Sparkles,
  Calendar,
  ChevronRight,
  Inbox,
  ExternalLink,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

/**
 * NotificationPopover: Premium glassmorphic notifications center.
 * Features category filtering, one-click read/dismiss actions,
 * interactive deep-links to problem review and topic practice.
 */
export default function NotificationPopover({ align = 'right' }) {
  const {
    notifications,
    unreadCount,
    loading,
    isOpen,
    close,
    markAsRead,
    markAllAsRead,
    dismiss,
    clearAll,
    refreshNotifications,
    devicePermission,
    requestDevicePermission,
    sendTestDeviceNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'revisions' | 'weakness' | 'daily'
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [permissionNotice, setPermissionNotice] = useState(null);
  const popoverRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // 1. If clicking any notification trigger button, let toggleOpen handle it
      if (e.target.closest && e.target.closest('[data-notification-trigger="true"]')) {
        return;
      }
      // 2. If clicking anywhere inside ANY notification popover dialog, DO NOT close!
      if (e.target.closest && e.target.closest('[role="dialog"][aria-label="Notifications"]')) {
        return;
      }
      // 3. If clicking the mobile backdrop overlay, close is handled by backdrop
      if (e.target.closest && e.target.closest('[data-notification-backdrop="true"]')) {
        close();
        return;
      }
      // 4. If this instance is hidden in CSS (e.g. desktop instance while on mobile viewport), do nothing!
      if (popoverRef.current) {
        const isSelfVisible =
          typeof popoverRef.current.checkVisibility === 'function'
            ? popoverRef.current.checkVisibility()
            : popoverRef.current.offsetWidth > 0 || popoverRef.current.offsetHeight > 0;
        if (!isSelfVisible) {
          return;
        }
      }
      // 5. Normal outside click
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        close();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      revisions: notifications.filter((n) => n.category === 'revisions').length,
      weakness: notifications.filter((n) => n.category === 'weakness').length,
      daily: notifications.filter((n) => n.category === 'daily').length,
    };
  }, [notifications]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    return notifications.filter((n) => n.category === activeTab);
  }, [notifications, activeTab]);

  if (!isOpen) return null;

  const handleActionClick = (notification) => {
    markAsRead(notification.id);
    close();
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleEnablePermission = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRequestingPermission(true);
    setPermissionNotice(null);
    try {
      const res = await requestDevicePermission();
      if (res === 'denied') {
        setPermissionNotice('Alerts blocked in browser. Allow notifications in site settings (lock icon).');
      } else if (res === 'unsupported') {
        setPermissionNotice('Device notifications require HTTPS or a supported mobile browser.');
      }
    } catch (err) {
      console.warn('Failed to enable notifications:', err);
      setPermissionNotice('Could not request permission. Please check browser settings.');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const getNotificationIcon = (category, urgency) => {
    if (category === 'revisions') {
      if (urgency === 'high') {
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      }
      return <RotateCw className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    if (category === 'weakness') {
      return <AlertTriangle className="w-4 h-4 text-accent shrink-0" />;
    }
    if (category === 'daily') {
      return <Flame className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
    return <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />;
  };

  const getIconContainerStyle = (category, urgency) => {
    if (category === 'revisions') {
      if (urgency === 'high') return 'bg-rose-500/10 border-rose-500/20';
      return 'bg-amber-500/10 border-amber-500/20';
    }
    if (category === 'weakness') return 'bg-accent/10 border-accent/20';
    if (category === 'daily') return 'bg-emerald-500/10 border-emerald-500/20';
    return 'bg-cyan-500/10 border-cyan-500/20';
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (dims and blurs screen behind popover) */}
      <div
        data-notification-backdrop="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-200"
        onClick={close}
        aria-hidden="true"
      />

      <div
        ref={popoverRef}
        role="dialog"
        aria-label="Notifications"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className={`fixed inset-x-3.5 top-[68px] z-50 max-h-[calc(100vh-140px)] flex flex-col max-w-md mx-auto sm:mx-0 sm:absolute sm:top-full sm:bottom-auto sm:mt-2.5 sm:w-[420px] sm:max-w-[calc(100vw-24px)] sm:max-h-[580px] ${
          align === 'right' ? 'sm:right-0 sm:left-auto' : 'sm:left-0 sm:right-auto'
        } bg-surface/95 backdrop-blur-2xl border border-line rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 select-none`}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="pt-2 pb-0.5 flex justify-center sm:hidden bg-surface-2/40">
          <div className="w-8 h-1 rounded-full bg-line" />
        </div>
      {/* 1. Popover Header */}
      <div className="p-3.5 sm:p-4 border-b border-line flex items-center justify-between gap-3 bg-surface-2/40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-accent/15 text-accent">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-text">
                Notifications
              </h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-accent/15 text-accent border border-accent/25">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                  All caught up
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted font-mono mt-0.5">
              Spaced repetition & practice alerts
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1">
          {/* Refresh data button */}
          <button
            type="button"
            onClick={() => refreshNotifications()}
            title="Refresh notifications"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-accent' : ''}`} />
          </button>

          {/* Mark All Read */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              title="Mark all as read"
              className="p-1.5 rounded-lg text-text-secondary hover:text-accent hover:bg-surface-hover transition-colors flex items-center gap-1 text-[11px]"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close Popover */}
          <button
            type="button"
            onClick={close}
            title="Close"
            className="p-1.5 rounded-lg text-text-secondary hover:text-text hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Device Push Notification Banner */}
      {devicePermission === 'granted' ? (
        <div className="px-3.5 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-500 font-medium truncate">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Phone & lock screen alerts active</span>
          </div>
          <button
            type="button"
            onClick={sendTestDeviceNotification}
            className="text-[10px] font-mono text-emerald-500 hover:text-emerald-400 underline underline-offset-2 shrink-0 transition-colors"
            title="Send sample notification to phone"
          >
            Test alert
          </button>
        </div>
      ) : devicePermission === 'denied' || permissionNotice ? (
        <div className="px-3.5 py-2.5 bg-rose-500/10 border-b border-rose-500/20 flex items-start gap-2.5 text-[11px]">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-rose-400 block text-[11px]">
              {permissionNotice || 'Notifications Blocked in Browser'}
            </span>
            <span className="text-[10px] text-muted block mt-0.5 leading-snug">
              To enable lock-screen alerts, tap the lock/info icon in your browser address bar and set Notifications to "Allow".
            </span>
          </div>
        </div>
      ) : devicePermission === 'default' ? (
        <div className="p-3 bg-gradient-to-r from-accent/15 via-accent/10 to-transparent border-b border-line flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-accent/20 text-accent shrink-0">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-text truncate">
                Enable Phone Lock Screen Alerts
              </div>
              <div className="text-[10px] text-muted truncate">
                Get notified on your phone when revisions are due.
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={isRequestingPermission}
            onClick={handleEnablePermission}
            onMouseDown={(e) => e.stopPropagation()}
            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-accent text-white hover:bg-accent-hover active:scale-95 transition-all shadow-xs shrink-0 flex items-center gap-1.5 disabled:opacity-60"
          >
            {isRequestingPermission ? (
              <>
                <RotateCw className="w-3 h-3 animate-spin" />
                <span>Enabling...</span>
              </>
            ) : (
              <span>Enable</span>
            )}
          </button>
        </div>
      ) : null}

      {/* 3. Category Filter Pills */}
      <div className="px-3.5 py-2 border-b border-line/60 bg-surface/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
            activeTab === 'all'
              ? 'bg-accent text-white shadow-xs'
              : 'text-text-secondary hover:text-text hover:bg-surface-2'
          }`}
        >
          All ({counts.all})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('revisions')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
            activeTab === 'revisions'
              ? 'bg-accent text-white shadow-xs'
              : 'text-text-secondary hover:text-text hover:bg-surface-2'
          }`}
        >
          Revisions ({counts.revisions})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('weakness')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
            activeTab === 'weakness'
              ? 'bg-accent text-white shadow-xs'
              : 'text-text-secondary hover:text-text hover:bg-surface-2'
          }`}
        >
          Friction ({counts.weakness})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 ${
            activeTab === 'daily'
              ? 'bg-accent text-white shadow-xs'
              : 'text-text-secondary hover:text-text hover:bg-surface-2'
          }`}
        >
          Daily Goal ({counts.daily})
        </button>
      </div>

      {/* 3. Notifications List */}
      <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-line/40 scrollbar-thin sm:max-h-[400px] overscroll-contain">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-surface-2 border border-line flex items-center justify-center text-muted mb-3">
              <Inbox className="w-6 h-6 stroke-1 text-muted" />
            </div>
            <h4 className="text-xs font-semibold text-text">No active alerts</h4>
            <p className="text-[11px] text-muted max-w-[240px] mt-1 leading-relaxed">
              {activeTab === 'revisions'
                ? 'Your Leitner revision queue is clear! Problems will appear as their recall intervals mature.'
                : activeTab === 'weakness'
                ? 'No high-friction topics detected. Keep solving to build your accuracy profile.'
                : 'All caught up! Practice consistently to keep your spaced repetition sharp.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 sm:p-4 flex gap-3 relative transition-all group ${
                notif.read
                  ? 'hover:bg-surface-hover/70 opacity-80 hover:opacity-100'
                  : 'bg-accent/[0.03] hover:bg-accent/[0.07] border-l-2 border-l-accent'
              }`}
            >
              {/* Category Icon */}
              <div
                className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getIconContainerStyle(
                  notif.category,
                  notif.urgency
                )}`}
              >
                {getNotificationIcon(notif.category, notif.urgency)}
              </div>

              {/* Notification Content */}
              <div className="flex-1 min-w-0 pr-7 sm:pr-6">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[9px] font-mono font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${
                      notif.urgency === 'high'
                        ? 'bg-rose-500/15 text-rose-400'
                        : notif.category === 'weakness'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-surface-2 text-muted'
                    }`}
                  >
                    {notif.badge}
                  </span>
                  <span className="text-[10px] text-muted font-mono">{notif.timeLabel}</span>
                  {!notif.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </div>

                <h4
                  className={`text-xs leading-snug tracking-tight transition-colors ${
                    notif.read ? 'text-text/90 font-medium' : 'text-text font-semibold'
                  }`}
                >
                  {notif.title}
                </h4>

                <p className="text-[11px] text-text-secondary mt-1 leading-relaxed line-clamp-2">
                  {notif.message}
                </p>

                {/* Action Link Button */}
                {notif.actionLabel && (
                  <button
                    type="button"
                    onClick={() => handleActionClick(notif)}
                    className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-accent hover:text-accent-hover active:scale-95 transition-all group/btn"
                  >
                    <span>{notif.actionLabel}</span>
                    <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>

              {/* Item Dismiss Button */}
              <button
                type="button"
                onClick={() => dismiss(notif.id)}
                title="Dismiss"
                className="absolute top-3 right-3 p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 touch-manipulation"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 4. Popover Footer */}
      <div className="p-3 border-t border-line bg-surface-2/40 flex items-center justify-between text-[11px]">
        <button
          type="button"
          onClick={() => {
            close();
            navigate('/revision');
          }}
          className="text-text-secondary hover:text-accent font-medium transition-colors flex items-center gap-1.5"
        >
          <span>Open Revision Queue</span>
          <ExternalLink className="w-3 h-3" />
        </button>

        {notifications.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-muted hover:text-rose-400 font-mono transition-colors"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
    </>
  );
}
