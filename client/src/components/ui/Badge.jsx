import React from 'react';

const variantMap = {
  default:  'bg-surface-2 border-line text-text-secondary',
  accent:   'bg-accent/12 border-accent/25 text-accent',
  easy:     'bg-easy/12 border-easy/25 text-easy',
  medium:   'bg-medium/12 border-medium/25 text-medium',
  hard:     'bg-hard/12 border-hard/25 text-hard',
  emerald:  'bg-success/12 border-success/25 text-success',
  amber:    'bg-medium/12 border-medium/25 text-medium',
  red:      'bg-danger/12 border-danger/25 text-danger',
  sapphire: 'bg-surface-2 border-line text-text',
  gold:     'bg-medium/12 border-medium/25 text-medium',
  online:   'bg-success/12 border-success/25 text-success',
};

const sizeMap = {
  xs: 'px-2 py-0.5 text-xs gap-1',
  sm: 'px-2.5 py-0.5 text-xs gap-1',
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
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap
        ${variantMap[variant] ?? variantMap.default}
        ${sizeMap[size] ?? sizeMap.sm}
        ${className}`}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === 'online' ? 'bg-success' : 'bg-current'
          }`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            variant === 'online' ? 'bg-success' : 'bg-current'
          }`} />
        </span>
      )}
      {children}
    </span>
  );
};

export default Badge;
