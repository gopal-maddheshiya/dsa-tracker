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
        border border-white/[0.08] bg-[#131519] rounded-2xl shadow-xl shadow-black/50
        relative overflow-hidden
        ${hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.16] hover:shadow-2xl hover:shadow-black/70' : ''}
        ${glow ? 'hover:shadow-[0_0_0_1px_rgba(249,115,22,0.25),0_12px_32px_rgba(0,0,0,0.7)]' : ''}
        ${padding}
        ${className}
      `}
      style={{
        boxShadow: '0 10px 28px -4px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      }}
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
      <h3 className="text-sm font-semibold text-[#F3F4F6] tracking-wide">{title}</h3>
      {description && <p className="text-[11px] text-[#9CA3AF] mt-0.5 font-mono tracking-wide">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/**
 * CardDivider — subtle horizontal rule
 */
Card.Divider = ({ className = '' }) => (
  <div className={`border-t border-white/[0.08] -mx-5 my-4 ${className}`} />
);

export default Card;
