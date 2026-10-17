import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import { formatWeeklyDate } from '../../lib/analyticsUtils.js';
import SpotlightCard from '../common/SpotlightCard.jsx';

const TIME_RANGES = [
  { id: 'all', label: 'All time' },
  { id: '90d', label: 'Last 90 days' },
  { id: '30d', label: 'Last 30 days' },
];

/**
 * Custom dark tooltip pin matching reference image callout
 */
function TrendTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-surface-elevated/95 backdrop-blur-md border border-line rounded-xl px-3 py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] text-center font-mono pointer-events-none -translate-y-2 tabular-nums">
        <div className="text-[10px] text-text-secondary">
          {formatWeeklyDate(label) || label}
        </div>
        <div className="text-text font-bold text-xs">
          {item.value} {item.value === 1 ? 'problem' : 'problems'}
        </div>
      </div>
    );
  }
  return null;
}

/**
 * TrendChart: Interactive weekly progress chart with dynamic time range filtering.
 */
export default function TrendChart({
  data = [],
  loading = false,
  error = null,
  onRetry = null,
}) {
  const [timeRange, setTimeRange] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or touch
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') setDropdownOpen(false);
    }
    if (dropdownOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen]);

  // Dynamically filter data according to the selected time range
  const filteredData = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    if (timeRange === 'all') return data;

    // Anchor to the latest point in dataset or current time
    const latestDateStr = data[data.length - 1]?.date;
    const latestTimestamp = latestDateStr ? new Date(latestDateStr).getTime() : Date.now();
    const referenceTime = Math.max(Date.now(), latestTimestamp);

    const days = timeRange === '30d' ? 30 : 90;
    const cutoff = referenceTime - days * 24 * 60 * 60 * 1000;

    const filtered = data.filter((item) => {
      const itemTime = new Date(item.date).getTime();
      return itemTime >= cutoff;
    });

    // If filtered points are sufficient (>= 2 points), display them
    if (filtered.length >= 2) return filtered;

    // Graceful fallback to the last N points so chart always renders smoothly
    const fallbackCount = timeRange === '30d' ? 5 : 13;
    return data.slice(-fallbackCount);
  }, [data, timeRange]);

  // Calculate total problems solved in the active filtered period
  const periodSolvedTotal = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + (Number(curr.count) || 0), 0);
  }, [filteredData]);

  const hasData = Array.isArray(data) && data.length > 0;
  const activeLabel = TIME_RANGES.find((r) => r.id === timeRange)?.label || 'All time';

  return (
    <SpotlightCard
      spotlightColor="rgba(237, 134, 65, 0.08)"
      borderColor="rgba(237, 134, 65, 0.28)"
      className="p-4 sm:p-5 rounded-2xl specular-card flex flex-col justify-between h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-text tracking-tight">
            Solve Trend
          </h2>
          <p className="text-[11px] sm:text-xs text-text-secondary mt-0.5">
            Problems solved over time
            {hasData && !loading && (
              <span className="font-mono text-accent/90 ml-1.5 font-medium">
                • {periodSolvedTotal} solved
              </span>
            )}
          </p>
        </div>

        {/* Dropdown Filter Pill */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 border border-line hover:border-line-hover text-xs font-medium text-text-secondary hover:text-text transition-all duration-150 active:scale-[0.98] btn-spring cursor-pointer select-none"
          >
            <span className="text-text font-medium">{activeLabel}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180 text-accent' : ''
              }`}
            />
          </button>

          {/* Interactive Dropdown Menu */}
          {dropdownOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-1.5 w-36 bg-surface-elevated/95 backdrop-blur-md border border-line rounded-xl shadow-elevated p-1 z-30 animate-in fade-in zoom-in-95 duration-100"
            >
              {TIME_RANGES.map((range) => {
                const isSelected = range.id === timeRange;
                return (
                  <button
                    key={range.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setTimeRange(range.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-accent/15 text-accent font-semibold'
                        : 'text-text-secondary hover:text-text hover:bg-surface-2'
                    }`}
                  >
                    <span>{range.label}</span>
                    {isSelected && <span className="text-accent text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 flex flex-col justify-center min-h-[220px]">
        {loading ? (
          <div className="h-56 w-full animate-pulse flex flex-col justify-end space-y-3 p-4">
            <div className="h-3.5 bg-surface-2 rounded w-1/4" />
            <div className="h-36 bg-surface-2/60 rounded-xl w-full" />
          </div>
        ) : error ? (
          <div className="h-56 border border-line rounded-xl flex flex-col items-center justify-center p-6 text-center bg-surface-2/20">
            <p className="text-xs text-text-secondary font-medium">
              Couldn't load solve trend
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 px-3 py-1 text-xs font-mono text-accent hover:underline"
              >
                Retry
              </button>
            )}
          </div>
        ) : !hasData ? (
          <div className="h-56 border border-dashed border-line rounded-xl flex flex-col items-center justify-center p-6 text-center bg-surface-2/10">
            <p className="text-xs font-medium text-text">No solved attempts yet</p>
            <p className="text-[11px] text-text-secondary mt-1">
              Your weekly progress will graph here as you solve problems.
            </p>
          </div>
        ) : (
          <div className="w-full h-56 select-none outline-none focus:outline-none focus-visible:outline-none [-webkit-tap-highlight-color:transparent]">
            <ResponsiveContainer
              width="100%"
              height="100%"
              className="outline-none focus:outline-none select-none"
            >
              <AreaChart
                data={filteredData}
                margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
                tabIndex={-1}
                accessibilityLayer={false}
                style={{
                  outline: 'none',
                  userSelect: 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <defs>
                  <linearGradient id="solveTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ed8641" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#ed8641" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--line)"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatWeeklyDate}
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--line)' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--line)' }}
                />
                <Tooltip
                  content={<TrendTooltip />}
                  wrapperStyle={{ outline: 'none', pointerEvents: 'none', zIndex: 30 }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#ed8641"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#solveTrendGradient)"
                  dot={{
                    fill: '#ed8641',
                    r: 3.5,
                    stroke: '#ffffff',
                    strokeWidth: 1.5,
                  }}
                  activeDot={{
                    fill: '#ffffff',
                    stroke: '#ed8641',
                    strokeWidth: 3,
                    r: 6,
                  }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </SpotlightCard>
  );
}
