import React from 'react';

const variantMap = {
  default:  'bg-[#14171B] border-white/[0.09] text-[#9CA3AF]',
  accent:   'bg-[#F97316]/12 border-[#F97316]/30 text-[#F97316]',
  easy:     'bg-emerald-500/12 border-emerald-500/30 text-emerald-400',
  medium:   'bg-amber-500/12 border-amber-500/30 text-amber-400',
  hard:     'bg-rose-500/12 border-rose-500/30 text-rose-400',
  emerald:  'bg-emerald-500/12 border-emerald-500/30 text-emerald-400',
  amber:    'bg-amber-500/12 border-amber-500/30 text-amber-400',
  red:      'bg-rose-500/12 border-rose-500/30 text-rose-400',
  sapphire: 'bg-indigo-500/12 border-indigo-500/30 text-indigo-400',
  gold:     'bg-amber-400/12 border-amber-400/30 text-amber-300',
  online:   'bg-emerald-500/12 border-emerald-500/25 text-emerald-400',
};

const sizeMap = {
  xs: 'px-1.5 py-0 text-[10px] gap-1',
  sm: 'px-2.5 py-0.5 text-[11px] gap-1',
  md: 'px-3 py-1 text-xs gap-1.5',
};

/**
 * Badge — inline semantic label component.
 * @param {string} variant — default | accent | easy | medium | hard | emerald | amber | red | sapphire | gold | online
 * @param {string} size    — xs | sm | md
 * @param {node}   dot     — if truthy, renders a pulsing dot before children
 */
const Badge = ({ variant = 'default', size = 'sm', dot = false, className = '', children, ...props }) => {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border font-mono
        ${variantMap[variant] ?? variantMap.default}
        ${sizeMap[size] ?? sizeMap.sm}
        ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'online' ? 'bg-emerald-400' : 'bg-current'
          }`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            variant === 'online' ? 'bg-emerald-400' : 'bg-current'
          }`} />
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
