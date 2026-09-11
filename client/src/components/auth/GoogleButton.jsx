import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const GoogleButton = ({ onSuccess, onError, text = 'Continue with Google', disabled = false, className = '' }) => {
  const [loading, setLoading] = useState(false);

  const loginTrigger = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        await onSuccess({ accessToken: tokenResponse.access_token });
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      setLoading(false);
      if (onError) onError(err);
    },
  });

  return (
    <button
      type="button"
      onClick={() => {
        loginTrigger();
      }}
      disabled={disabled || loading}
      className={
        className ||
        'w-full flex items-center justify-center gap-3 px-4 h-11 rounded-xl font-medium text-[13.5px] text-slate-200 bg-[#151821] hover:bg-[#1D212D] active:scale-[0.99] border border-white/[0.09] hover:border-white/[0.18] transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group'
      }
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/20 border-t-[#F97316] rounded-full animate-spin shrink-0" />
          <span className="text-[#9CA3AF]">Connecting to Google…</span>
        </>
      ) : (
        <>
          <GoogleIcon />
          <span>{text}</span>
        </>
      )}
    </button>
  );
};

export default GoogleButton;
