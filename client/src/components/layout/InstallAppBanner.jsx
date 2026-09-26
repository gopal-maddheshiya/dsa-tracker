import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallAppBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const [hasScrolledPastHero, setHasScrolledPastHero] = useState(false);

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

    // On desktop, display unobtrusively; on mobile, wait until scroll to not obstruct primary CTA
    if (window.innerWidth >= 1024) {
      setHasScrolledPastHero(true);
    } else {
      const handleScroll = () => {
        if (window.scrollY > 160) {
          setHasScrolledPastHero(true);
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('scroll', handleScroll);
      };
    }

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

  if (!showBanner || isInstalled || !hasScrolledPastHero) return null;

  return (
    <div className="fixed bottom-16 lg:bottom-5 right-3 left-auto z-30 max-w-[280px] sm:max-w-sm animate-fade-up select-none pointer-events-auto">
      <div className="p-2 sm:p-2.5 rounded-xl bg-surface/95 backdrop-blur-md border border-line shadow-lg flex items-center justify-between gap-3 relative">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-surface-2 border border-line-subtle flex items-center justify-center text-accent shrink-0">
            <Download className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text leading-tight truncate">Install App</p>
            <p className="text-[10px] text-muted leading-tight truncate hidden xs:block">Offline practice</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="btn-primary text-[11px] font-semibold py-1 px-2 rounded-md leading-none whitespace-nowrap cursor-pointer"
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="text-muted hover:text-text p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallAppBanner;
