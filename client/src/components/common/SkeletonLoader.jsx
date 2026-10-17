import React from 'react';

/**
 * DonutSkeleton: Waveform shimmer skeleton for donut distribution charts.
 */
export function DonutSkeleton({ size = 150 }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-6 w-full animate-shimmer">
      {/* Circular Donut Ring Placeholder */}
      <div
        className="relative rounded-full border-[13px] border-surface-2/70 bg-transparent flex items-center justify-center shrink-0"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="w-10 h-6 bg-surface-2 rounded-md" />
          <div className="w-14 h-2.5 bg-surface-2 rounded" />
        </div>
      </div>

      {/* Legend Rows Placeholder */}
      <div className="w-full sm:w-56 space-y-3.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5 p-2 rounded-xl bg-surface-2/30 border border-line-subtle">
            <div className="flex justify-between items-center">
              <div className="w-16 h-3 bg-surface-2 rounded" />
              <div className="w-8 h-3 bg-surface-2 rounded" />
            </div>
            <div className="w-full h-1.5 bg-surface-2 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * CardSkeleton: Waveform shimmer skeleton for metric or revision cards.
 */
export function CardSkeleton({ count = 1, className = '' }) {
  return (
    <div className={`grid gap-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-xl specular-card border border-line space-y-3 animate-shimmer"
        >
          <div className="flex items-center justify-between">
            <div className="w-24 h-3.5 bg-surface-2 rounded" />
            <div className="w-12 h-3 bg-surface-2 rounded" />
          </div>
          <div className="w-16 h-7 bg-surface-2 rounded my-1" />
          <div className="w-32 h-2.5 bg-surface-2 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * TableSkeleton: Waveform shimmer skeleton for problem tables.
 */
export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="w-full space-y-2 animate-shimmer">
      {/* Header bar */}
      <div className="h-10 bg-surface-2/50 rounded-xl w-full border border-line-subtle" />
      {/* Row items */}
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="h-12 bg-surface-2/30 rounded-xl w-full border border-line-subtle flex items-center justify-between px-4 gap-4"
        >
          <div className="w-48 h-4 bg-surface-2 rounded" />
          <div className="w-16 h-4 bg-surface-2 rounded" />
          <div className="w-24 h-4 bg-surface-2 rounded hidden sm:block" />
          <div className="w-20 h-6 bg-surface-2 rounded" />
        </div>
      ))}
    </div>
  );
}

export default {
  DonutSkeleton,
  CardSkeleton,
  TableSkeleton,
};
