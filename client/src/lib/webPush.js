/**
 * webPush.js: Device Push & System Notifications Helper
 * Provides permission requesting, Service Worker notification dispatching,
 * and test alerts for phone lock screens, Android status bars, and desktop notification centers.
 */

export const webPush = {
  /**
   * Check if the browser supports notifications and service worker
   */
  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  /**
   * Get current permission state: 'granted' | 'denied' | 'default' | 'unsupported'
   */
  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return window.Notification?.permission || 'unsupported';
  },

  /**
   * Request system notification permission from the user
   */
  async requestPermission() {
    if (!this.isSupported() || !window.Notification?.requestPermission) return 'unsupported';

    try {
      const result = await window.Notification.requestPermission();
      if (result === 'granted') {
        localStorage.setItem('dsa_push_notifications_enabled', 'true');
      }
      return result;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return this.getPermission();
    }
  },

  /**
   * Dispatch a system notification to the phone / desktop
   * Prefers ServiceWorkerRegistration.showNotification() for lock-screen support.
   */
  async sendNotification({
    title = 'DSA Tracker',
    body = 'You have spaced revision problems due for practice.',
    url = '/revision',
    tag = 'dsa-reminder',
    vibrate = [100, 50, 100],
  } = {}) {
    if (this.getPermission() !== 'granted') return false;

    const options = {
      body,
      icon: '/icon-192.svg',
      badge: '/favicon.svg',
      data: { url },
      tag,
      vibrate,
      renotify: true,
    };

    // 1. Try Service Worker showNotification (Works in background / lock screen)
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, options);
          return true;
        }
      } catch (swErr) {
        console.warn('Service Worker showNotification failed, trying fallback:', swErr);
      }
    }

    // 2. Fallback to standard Window Notification constructor
    try {
      if (typeof window !== 'undefined' && window.Notification) {
        const notif = new window.Notification(title, options);
        notif.onclick = () => {
          window.focus();
          if (url) window.location.href = url;
        };
        return true;
      }
      return false;
    } catch (err) {
      console.warn('Window Notification failed:', err);
      return false;
    }
  },

  /**
   * Send an immediate test notification to demonstrate phone push alerts
   */
  async sendTestNotification() {
    const granted = this.getPermission() === 'granted' || (await this.requestPermission()) === 'granted';
    if (!granted) return false;

    return this.sendNotification({
      title: '⚡ DSA Tracker · Phone Alerts Active!',
      body: 'Your spaced repetition reminders will now appear directly on your phone lock screen and notification bar.',
      url: '/revision',
      tag: 'dsa-test-alert',
    });
  },
};

export default webPush;
