import React from 'react';

/**
 * PageHeader — consistent page title + subtitle + optional actions row.
 * @param {string} title       — page heading
 * @param {string} subtitle    — optional secondary info
 * @param {node}   actions     — right-side slot (buttons, badges, etc.)
 * @param {string} className   — extra classes
 */
const PageHeader = ({ title, subtitle, actions, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7 ${className}`}>
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#F5F5F4]">{title}</h1>
        {subtitle && (
          <p className="text-xs text-[#6B6560] mt-1 font-mono">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
