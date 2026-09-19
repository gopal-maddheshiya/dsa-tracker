import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('dsa_pwa_dismissed');
    if (dismissed) {
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('dsa_pwa_dismissed', 'true');
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-40px)] animate-fade-up">
      <div className="p-4 rounded-xl bg-surface border border-line shadow-dropdown flex items-start gap-3.5 relative overflow-hidden">
        <div className="w-9 h-9 rounded-lg bg-surface-2 border border-line flex items-center justify-center text-accent shrink-0">
          <Download className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-xs font-semibold text-text tracking-tight">Install DSATracker App</h4>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            Install to your desktop or home screen for faster practice and offline access.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleInstallClick}
              className="btn-primary text-xs px-3 py-1.5"
            >
              Install App
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="btn-secondary text-xs px-2.5 py-1.5"
            >
              Later
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted hover:text-text transition-colors p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default InstallAppBanner;
