import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Target, Calendar, Building2, Flame, CheckCircle2, Edit3, X, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { fetchGoals, updateGoals } from '../../api/auth';
import { useToast } from '../../context/ToastContext';

const PRESET_COMPANIES = [
  'Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Netflix',
  'Uber', 'Atlassian', 'Stripe', 'Salesforce', 'Adobe', 'Bloomberg'
];

const TargetGoalsCard = () => {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form edit states
  const [dailyTarget, setDailyTarget] = useState(2);
  const [weeklyTarget, setWeeklyTarget] = useState(10);
  const [targetInterviewDate, setTargetInterviewDate] = useState('');
  const [targetCompanies, setTargetCompanies] = useState([]);
  const [newCompanyInput, setNewCompanyInput] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isEditing]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await fetchGoals();
      if (res?.success && res.data) {
        setData(res.data);
        const g = res.data.goals || {};
        setDailyTarget(g.dailyTarget || 2);
        setWeeklyTarget(g.weeklyTarget || 10);
        setTargetInterviewDate(g.targetInterviewDate ? new Date(g.targetInterviewDate).toISOString().split('T')[0] : '');
        setTargetCompanies(g.targetCompanies || []);
      }
    } catch (err) {
      console.error('Failed to load goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const res = await updateGoals({
        dailyTarget: Number(dailyTarget),
        weeklyTarget: Number(weeklyTarget),
        targetInterviewDate: targetInterviewDate || null,
        targetCompanies,
      });
      if (res?.success) {
        toast.success('Practice goals updated successfully!');
        setIsEditing(false);
        loadGoals();
      } else {
        toast.error(res?.message || 'Failed to update goals');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating practice goals');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCompany = (company) => {
    const trimmed = company.trim();
    if (!trimmed) return;
    if (targetCompanies.includes(trimmed)) return;
    if (targetCompanies.length >= 8) {
      toast.info('Maximum 8 target companies allowed');
      return;
    }
    setTargetCompanies([...targetCompanies, trimmed]);
    setNewCompanyInput('');
  };

  const handleRemoveCompany = (companyToRemove) => {
    setTargetCompanies(targetCompanies.filter((c) => c !== companyToRemove));
  };

  if (loading) {
    return (
      <div className="bg-surface border border-line rounded-xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-surface-2 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-surface-2 rounded-lg"></div>
          <div className="h-24 bg-surface-2 rounded-lg"></div>
          <div className="h-24 bg-surface-2 rounded-lg"></div>
        </div>
      </div>
    );
  }

  const goals = data?.goals || {};
  const progress = data?.progress || {
    todaySolved: 0,
    dailyTarget: 2,
    todayTargetMet: false,
    todayProgressPct: 0,
    weekSolved: 0,
    weeklyTarget: 10,
    weeklyTargetMet: false,
    weeklyProgressPct: 0,
    daysUntilInterview: null,
    interviewUrgency: null,
  };

  return (
    <div className="bg-surface border border-line rounded-xl p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-text tracking-tight flex flex-wrap items-center gap-2">
              Target Goals & Readiness
              {progress.todayTargetMet && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/30 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Today's Goal Met
                </span>
              )}
            </h2>
            <p className="text-xs text-muted">
              Personalized pacing and countdown for target tech interviews
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="btn-secondary inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer min-h-[36px] w-full sm:w-auto"
        >
          <Edit3 className="w-3.5 h-3.5 text-accent" />
          <span>Configure Goals</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 relative z-10 mb-5">
        {/* Today's Target Card */}
        <div className="bg-surface-2/50 border border-line rounded-lg p-4 flex flex-col justify-between relative overflow-hidden hover:border-line/80 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-accent" /> Today's Target
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              progress.todayTargetMet
                ? 'bg-success/15 text-success'
                : 'bg-accent/10 text-accent'
            }`}>
              {progress.todayProgressPct}%
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-text tabular-nums">
                {progress.todaySolved}
              </span>
              <span className="text-xs text-muted">
                / {progress.dailyTarget} problems
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-line/60 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progress.todayTargetMet ? 'bg-success' : 'bg-accent'
              }`}
              style={{ width: `${Math.min(100, progress.todayProgressPct)}%` }}
            />
          </div>
        </div>

        {/* Weekly Target Card */}
        <div className="bg-surface-2/50 border border-line rounded-lg p-4 flex flex-col justify-between relative overflow-hidden hover:border-line/80 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> 7-Day Velocity
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              progress.weeklyTargetMet
                ? 'bg-success/15 text-success'
                : 'bg-accent/10 text-accent'
            }`}>
              {progress.weeklyProgressPct}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-text tabular-nums">
              {progress.weekSolved}
            </span>
            <span className="text-xs text-muted">
              / {progress.weeklyTarget} target weekly
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-line/60 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progress.weeklyTargetMet ? 'bg-success' : 'bg-accent'
              }`}
              style={{ width: `${Math.min(100, progress.weeklyProgressPct)}%` }}
            />
          </div>
        </div>

        {/* Target Interview Countdown Card */}
        <div className="bg-surface-2/50 border border-line rounded-lg p-4 flex flex-col justify-between relative overflow-hidden hover:border-line/80 transition-all sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-text-secondary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted" /> Target Date
            </span>
            {progress.interviewUrgency && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                progress.interviewUrgency === 'crunch_time'
                  ? 'bg-danger/15 text-danger'
                  : progress.interviewUrgency === 'accelerated'
                  ? 'bg-accent/15 text-accent'
                  : 'bg-success/15 text-success'
              }`}>
                {progress.interviewUrgency === 'crunch_time' ? 'Crunch Time' : progress.interviewUrgency === 'accelerated' ? 'Sprint' : 'On Track'}
              </span>
            )}
          </div>

          {progress.daysUntilInterview !== null ? (
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-2xl font-bold tabular-nums ${
                  progress.daysUntilInterview <= 14 ? 'text-danger' : 'text-text'
                }`}>
                  {progress.daysUntilInterview <= 0 ? 'Due Today' : `${progress.daysUntilInterview}d`}
                </span>
                <span className="text-xs text-muted">
                  remaining until interview
                </span>
              </div>
              <p className="text-xs text-muted truncate">
                {new Date(goals.targetInterviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-start justify-center h-full py-1">
              <p className="text-xs text-muted mb-2">No target date set</p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-accent hover:underline font-medium"
              >
                Set interview date &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Target Companies Tag Cloud */}
      <div className="pt-3 border-t border-line flex flex-wrap items-center gap-2 relative z-10">
        <span className="text-xs font-medium text-muted flex items-center gap-1 mr-1">
          <Building2 className="w-3.5 h-3.5 text-muted" /> Target Companies:
        </span>
        {goals.targetCompanies && goals.targetCompanies.length > 0 ? (
          goals.targetCompanies.map((company, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-2 text-text-secondary border border-line"
            >
              {company}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted italic">
            None specified. Add target companies to focus your interview prep.
          </span>
        )}
      </div>

      {/* Edit Goals Modal */}
      {isEditing && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fadeIn"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="bg-surface border border-line rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-modal relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line sticky top-0 bg-surface z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text tracking-tight">Configure Practice Goals</h3>
                  <p className="text-xs text-muted">Personalized pacing for tech interviews</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                type="button"
                className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
              {/* Daily & Weekly Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Daily Problem Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={dailyTarget}
                    onChange={(e) => setDailyTarget(e.target.value)}
                    required
                    className="w-full h-10 bg-surface-2 border border-line rounded-lg px-3 text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <span className="text-xs text-muted mt-1 block">Recommended: 2 - 4 / day</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">
                    Weekly Problem Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={weeklyTarget}
                    onChange={(e) => setWeeklyTarget(e.target.value)}
                    required
                    className="w-full h-10 bg-surface-2 border border-line rounded-lg px-3 text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <span className="text-xs text-muted mt-1 block">Recommended: 10 - 25 / wk</span>
                </div>
              </div>

              {/* Target Interview Date */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Target Interview Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetInterviewDate}
                  onChange={(e) => setTargetInterviewDate(e.target.value)}
                  className="w-full h-10 bg-surface-2 border border-line rounded-lg px-3 text-sm text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>

              {/* Target Companies */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Target Companies (Up to 8)
                </label>
                
                {/* Active company chips */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {targetCompanies.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-accent/10 text-accent border border-accent/20"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompany(c)}
                        className="hover:text-text cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Input to add custom company */}
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCompanyInput}
                    onChange={(e) => setNewCompanyInput(e.target.value)}
                    placeholder="e.g. Uber, Stripe, Atlassian"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCompany(newCompanyInput);
                      }
                    }}
                    className="flex-1 h-10 bg-surface-2 border border-line rounded-lg px-3 text-xs text-text placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCompany(newCompanyInput)}
                    className="btn-secondary px-3.5 h-10 text-xs font-medium rounded-lg inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {/* Preset quick-picks */}
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted self-center mr-1">Quick pick:</span>
                  {PRESET_COMPANIES.filter((p) => !targetCompanies.includes(p)).slice(0, 6).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddCompany(preset)}
                      className="text-xs px-2 py-0.5 rounded-lg bg-surface-2 hover:bg-surface-2/80 text-muted hover:text-text border border-line transition-colors cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3.5 pb-4 px-5 sm:px-6 border-t border-line sticky bottom-0 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 bg-surface mt-6 z-10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium cursor-pointer min-h-[36px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs px-5 py-2 min-h-[36px] rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Goals'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TargetGoalsCard;
