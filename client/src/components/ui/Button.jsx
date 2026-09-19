import React from 'react';

const variants = {
  primary: 'bg-primary text-primary-foreground font-bold hover:opacity-90 active:scale-[0.98] shadow-sm border border-[#E07A38]/30 transition-all cursor-pointer',
  ghost:   'bg-[#14171B] hover:bg-[#1B1F25] border border-white/[0.09] hover:border-white/[0.18] text-[#9CA3AF] hover:text-[#F3F4F6] transition-all cursor-pointer',
  danger:  'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 transition-all cursor-pointer',
  outline: 'bg-transparent border border-white/[0.1] hover:border-primary/50 text-[#9CA3AF] hover:text-primary transition-all cursor-pointer',
  success: 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 transition-all cursor-pointer',
};

const sizes = {
  xs:  'px-2.5 py-1 text-[11px] gap-1 rounded-lg',
  sm:  'px-3 py-1.5 text-xs gap-1.5 rounded-xl',
  md:  'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg:  'px-5 py-3 text-sm gap-2 rounded-xl',
};

/**
 * Button — unified interactive button component.
 * @param {string} variant — primary | ghost | danger | outline | success
 * @param {string} size    — xs | sm | md | lg
 * @param {bool}   loading — shows spinner
 * @param {bool}   fullWidth — w-full
 */
const Button = ({
  variant = 'primary',
  size = 'sm',
  loading = false,
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-semibold font-sans
        transition-all duration-150 active:scale-[0.97] select-none
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant] ?? variants.primary}
        ${sizes[size] ?? sizes.sm}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;
