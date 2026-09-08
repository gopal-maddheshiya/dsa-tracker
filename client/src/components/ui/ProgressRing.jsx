import React from 'react';

/**
 * ProgressRing — SVG circular progress indicator.
 * @param {number} value   — 0–100 percentage
 * @param {number} size    — diameter in px (default 64)
 * @param {number} stroke  — stroke width (default 5)
 * @param {string} color   — stroke hex color
 * @param {node}   label   — center label override
 */
const ProgressRing = ({
  value = 0,
  size = 64,
  stroke = 5,
  color = '#F97316',
  label,
  className = '',
}) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ - (Math.min(Math.max(value, 0), 100) / 100) * circ;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke="#262320"
          strokeWidth={stroke}
        />
        {/* Fill */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={filled}
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)',
            filter: `drop-shadow(0 0 4px ${color}88)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label ?? (
          <span className="text-xs font-bold font-mono text-[#F5F5F4]">{value}%</span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
