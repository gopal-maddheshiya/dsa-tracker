import React from 'react';

const variantMap = {
  default:  'bg-[#211F1D] border-[#2E2A27] text-[#A8A29E]',
  accent:   'bg-[#F97316]/10 border-[#F97316]/25 text-[#F97316]',
  emerald:  'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
  amber:    'bg-amber-500/10 border-amber-500/25 text-amber-400',
  red:      'bg-red-500/10 border-red-500/25 text-red-400',
  sapphire: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400',
  gold:     'bg-yellow-500/10 border-yellow-500/25 text-yellow-400',
  online:   'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
};

const sizeMap = {
  xs: 'px-1.5 py-0 text-[10px] gap-1',
  sm: 'px-2.5 py-0.5 text-[11px] gap-1',
  md: 'px-3 py-1 text-xs gap-1.5',
};

/**
 * Badge — inline semantic label component.
 * @param {string} variant — default | accent | emerald | amber | red | sapphire | gold | online
 * @param {string} size    — xs | sm | md
 * @param {node}   dot     — if truthy, renders a pulsing dot before children
 */
const Badge = ({ variant = 'default', size = 'sm', dot = false, className = '', children, ...props }) => {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-lg border font-mono
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
