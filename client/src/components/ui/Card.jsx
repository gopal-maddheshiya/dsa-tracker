import React from 'react';

/**
 * Card — premium elevated container.
 * @param {string} className — extra classes
 * @param {bool}   hover     — adds hover lift effect
 * @param {bool}   glow      — adds subtle orange glow on hover
 * @param {string} padding   — tailwind padding class, default 'p-5'
 */
const Card = ({ className = '', hover = false, glow = false, padding = 'p-5', children, ...props }) => {
  return (
    <div
      className={`
        border border-[#2E2A27] bg-[#1C1A18] rounded-2xl shadow-xl shadow-black/40
        ${hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3E3834] hover:shadow-2xl hover:shadow-black/60' : ''}
        ${glow ? 'hover:shadow-[0_0_0_1px_rgba(249,115,22,0.15),0_8px_32px_rgba(0,0,0,0.6)]' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * CardHeader — card title + description block
 */
Card.Header = ({ title, description, action, className = '' }) => (
  <div className={`flex items-start justify-between mb-5 ${className}`}>
    <div>
      <h3 className="text-sm font-semibold text-[#F5F5F4] tracking-wide">{title}</h3>
      {description && <p className="text-[11px] text-[#6B6560] mt-0.5 font-mono tracking-wide">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/**
 * CardDivider — subtle horizontal rule
 */
Card.Divider = ({ className = '' }) => (
  <div className={`border-t border-[#262320] -mx-5 my-4 ${className}`} />
);

export default Card;
