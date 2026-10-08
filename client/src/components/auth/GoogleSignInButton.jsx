import React, { useEffect, useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * GoogleIcon: Authentic Google "G" multicolor vector logo with zero background box.
 */
function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.28-2.09 3.66-5.17 3.66-9.12z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.36 7.35 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * GoogleSignInButton
 * A bespoke, luxury Google authentication button that seamlessly matches the app's dark/light
 * design system without awkward iframe borders or white logo tiles.
 */
export default function GoogleSignInButton({ onCredentialReceived, disabled = false }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [initError, setInitError] = useState(null);
  const tokenClientRef = useRef(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let isCancelled = false;

    if (!clientId) {
      setInitError('Google Client ID is missing in .env');
      setIsInitializing(false);
      return;
    }

    const initClient = () => {
      if (isCancelled) return;
      try {
        if (!window.google?.accounts?.oauth2) {
          throw new Error('Google Identity Services SDK not loaded');
        }

        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: (tokenResponse) => {
            setIsConnecting(false);
            if (tokenResponse?.error) {
              console.warn('Google Sign-In response error:', tokenResponse.error);
              return;
            }
            if (tokenResponse?.access_token && onCredentialReceived) {
              onCredentialReceived({ accessToken: tokenResponse.access_token });
            }
          },
          error_callback: (err) => {
            setIsConnecting(false);
            console.warn('Google Sign-In prompt error:', err);
          },
        });

        setIsInitializing(false);
      } catch (err) {
        if (!isCancelled) {
          setIsInitializing(false);
        }
      }
    };

    if (window.google?.accounts?.oauth2) {
      initClient();
    } else {
      let attempts = 0;
      const interval = setInterval(() => {
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          initClient();
        } else if (attempts > 30) {
          clearInterval(interval);
          if (!isCancelled) {
            setIsInitializing(false);
          }
        }
        attempts++;
      }, 100);

      return () => {
        isCancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      isCancelled = true;
    };
  }, [clientId, onCredentialReceived]);

  const handleClick = () => {
    if (disabled || isConnecting) return;

    if (tokenClientRef.current) {
      setIsConnecting(true);
      try {
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      } catch (err) {
        console.error('Failed to trigger Google prompt:', err);
        setIsConnecting(false);
      }
    } else if (window.google?.accounts?.id) {
      // Fallback to Google ID One-Tap if OAuth2 client is initializing
      window.google.accounts.id.prompt();
    }
  };

  if (initError) {
    return (
      <div className="w-full py-2 px-3 rounded-xl border border-line bg-surface-2 text-center text-[11px] text-muted font-mono">
        {initError}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isConnecting}
      className="w-full h-10 px-4 rounded-xl bg-surface-2 hover:bg-surface-hover active:scale-[0.99] border border-line hover:border-line-hover text-text transition-all duration-150 flex items-center justify-center gap-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.15)] group focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer relative overflow-hidden"
    >
      {/* Top subtle highlight reflection */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {isConnecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-accent" />
          <span className="text-xs sm:text-sm font-medium tracking-tight">
            Connecting to Google...
          </span>
        </>
      ) : (
        <>
          <GoogleIcon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <span className="text-xs sm:text-sm font-medium tracking-tight text-text group-hover:text-text">
            Continue with Google
          </span>
        </>
      )}
    </button>
  );
}
