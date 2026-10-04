import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Code2, HelpCircle } from 'lucide-react';

/**
 * AlgorithmExplainer: Transparent technical disclosure detailing the Leitner
 * spaced-repetition prioritization formula and interval schedule.
 */
export default function AlgorithmExplainer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg bg-surface border border-line shadow-subtle overflow-hidden">
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-surface-hover/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-text">
            How the revision queue works
          </span>
          <span className="text-[10px] font-mono text-muted bg-surface-2 px-1.5 py-0.5 rounded border border-line hidden sm:inline-block">
            Deterministic Formula
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <span>{isOpen ? 'Hide details' : 'View formula'}</span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-line-subtle space-y-4 text-xs">
          <p className="text-text-secondary leading-relaxed">
            The revision queue uses an interval-based spaced repetition model. Rather than relying on black-box heuristics or opaque predictions, priority scores are derived mathematically from your recorded attempt recency and latest practice outcome.
          </p>

          {/* Mathematical Formula Monospace Block */}
          <div className="p-3.5 rounded-md bg-surface-2 border border-line font-mono text-[11px] text-text space-y-1">
            <div className="text-accent font-semibold">
              priorityScore = (daysSinceLastAttempt / intervalDays) + struggleWeight
            </div>
            <div className="text-muted text-[10px] pt-1">
              Higher score = higher queue position · Sorted descending
            </div>
          </div>

          {/* Schedule Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-2 pr-4 font-medium">Outcome Status</th>
                  <th className="py-2 pr-4 font-medium">Target Interval</th>
                  <th className="py-2 pr-4 font-medium">Struggle Weight</th>
                  <th className="py-2 font-medium">Retention Goal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle text-text-secondary">
                <tr>
                  <td className="py-2 pr-4 text-rose-400 font-medium">Struggled</td>
                  <td className="py-2 pr-4 text-text">2 days</td>
                  <td className="py-2 pr-4 text-text">+2.0</td>
                  <td className="py-2 text-muted">Rapid reinforcement</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-amber-400 font-medium">Revisit needed</td>
                  <td className="py-2 pr-4 text-text">5 days</td>
                  <td className="py-2 pr-4 text-text">+1.0</td>
                  <td className="py-2 text-muted">Intermediate rehearsal</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-emerald-400 font-medium">Solved</td>
                  <td className="py-2 pr-4 text-text">14 days</td>
                  <td className="py-2 pr-4 text-text">+0.0</td>
                  <td className="py-2 text-muted">Long-term maintenance</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-muted italic">
            Note: Solved problems return to the queue after 14 days to mitigate forgetting curve decay. Revision indicates it is time for another pass, not a negative assessment.
          </p>
        </div>
      )}
    </div>
  );
}
