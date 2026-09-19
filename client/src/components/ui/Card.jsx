import React from 'react';

/**
 * Card — flat LeetCode-style surface container.
 * @param {string} className — extra classes
 * @param {bool}   hover     — adds subtle hover border transition
 * @param {string} padding   — tailwind padding class, default 'p-5'
 */
const Card = ({ className = '', hover = false, glow = false, padding = 'p-5', children, ...props }) => {
  return (
    <div
      className={`
        border border-line bg-surface rounded-xl relative
        ${hover ? 'transition-colors duration-150 hover:border-line' : ''}
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
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

/**
 * CardDivider — subtle horizontal rule
 */
Card.Divider = ({ className = '' }) => (
  <div className={`border-t border-line -mx-5 my-4 ${className}`} />
);

export default Card;
