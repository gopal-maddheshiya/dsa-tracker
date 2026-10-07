import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code2, Info } from 'lucide-react';

/**
 * AlgorithmExplainer: Transparent technical disclosure detailing the Leitner
 * spaced-repetition prioritization formula and interval schedule.
 */
export default function AlgorithmExplainer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl bg-surface border border-line shadow-xs overflow-hidden transition-colors">
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="algorithm-explainer-content"
        className="w-full px-4 sm:px-5 py-3.5 flex items-center justify-between text-left hover:bg-surface-hover/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-accent shrink-0" />
          <span className="text-xs sm:text-sm font-semibold text-text">
            How priority works
          </span>
          <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-line hidden sm:inline-block">
            Deterministic Leitner Model
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <span>{isOpen ? 'Hide formula' : 'View formula'}</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Expanded Technical Content */}
      {isOpen && (
        <div
          id="algorithm-explainer-content"
          className="px-4 sm:px-5 pb-5 pt-2 border-t border-line-subtle space-y-4 text-xs"
        >
          <p className="text-text-secondary leading-relaxed">
            The revision queue uses an interval-based spaced repetition model. Rather than relying on opaque predictions, priority scores are derived mathematically from your recorded attempt recency and latest practice outcome.
          </p>

          {/* Mathematical Formula Monospace Block */}
          <div className="p-3.5 rounded-md bg-surface-2/80 border border-line font-mono text-xs text-text space-y-1.5 overflow-x-auto">
            <div className="text-accent font-semibold whitespace-nowrap">
              priorityScore = (daysSinceLastAttempt / intervalDays) + struggleWeight
            </div>
            <div className="text-muted text-[10px]">
              Higher score = higher queue position · Sorted strictly descending
            </div>
          </div>

          {/* Schedule Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse min-w-[480px]">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase text-muted tracking-wider">
                  <th className="py-2.5 pr-4 font-medium">Outcome Status</th>
                  <th className="py-2.5 pr-4 font-medium">Target Interval</th>
                  <th className="py-2.5 pr-4 font-medium">Struggle Weight</th>
                  <th className="py-2.5 font-medium">Retention Goal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle text-text-secondary">
                <tr>
                  <td className="py-2.5 pr-4">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20">
                      Struggled
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-text font-medium">2 days</td>
                  <td className="py-2.5 pr-4 text-text">+2.0</td>
                  <td className="py-2.5 text-muted">Rapid recovery & reinforcement</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20">
                      Revisit needed
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-text font-medium">5 days</td>
                  <td className="py-2.5 pr-4 text-text">+1.0</td>
                  <td className="py-2.5 text-muted">Intermediate rehearsal</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      Solved
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-text font-medium">14 days</td>
                  <td className="py-2.5 pr-4 text-text">+0.0</td>
                  <td className="py-2.5 text-muted">Long-term maintenance</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2 pt-1 text-[11px] text-muted leading-relaxed">
            <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <p>
              Solved problems return to the queue after 14 days to mitigate forgetting curve decay. Surfacing a problem is an invitation for retention practice, not a negative indicator.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
