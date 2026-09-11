import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

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
      <div className="p-4 rounded-2xl bg-[#12151D] border border-orange-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(249,115,22,0.15)] flex items-start gap-3.5 relative overflow-hidden">
        {/* Glow */}
        <div
          className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-orange-500/15 pointer-events-none"
          style={{ filter: 'blur(30px)' }}
        />

        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0">
          <Download className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <h4 className="text-xs font-bold text-white tracking-tight">Install DSATracker App</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Install to your desktop or home screen for faster practice and offline access.
          </p>

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              Install App
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition-colors"
            >
              Later
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 transition-colors p-1"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default InstallAppBanner;
