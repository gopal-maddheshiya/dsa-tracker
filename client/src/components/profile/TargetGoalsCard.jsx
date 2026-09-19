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
      <div className="bg-[#12161F] border border-white/5 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-white/10 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-white/5 rounded-xl"></div>
          <div className="h-24 bg-white/5 rounded-xl"></div>
          <div className="h-24 bg-white/5 rounded-xl"></div>
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
    <div className="bg-gradient-to-b from-[#141824] to-[#0F131D] border border-white/[0.08] rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E07A38]/10 border border-[#E07A38]/20 flex items-center justify-center text-[#E07A38] shadow-sm shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex flex-wrap items-center gap-2">
              Target Goals & Readiness
              {progress.todayTargetMet && (
                <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Today's Goal Met
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400">
              Personalized pacing and countdown for target tech interviews
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-gray-200 hover:text-white border border-white/10 hover:border-[#E07A38]/30 transition-all cursor-pointer min-h-[38px] w-full sm:w-auto active:scale-95 shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#E07A38]" />
          <span>Configure Goals</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 relative z-10 mb-5">
        {/* Today's Target Card */}
        <div className="bg-[#181D29]/75 border border-white/[0.07] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#E07A38]/30 transition-all stat-block-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#E07A38]" /> Today's Target
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              progress.todayTargetMet
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-[#E07A38]/10 text-[#E07A38]'
            }`}>
              {progress.todayProgressPct}%
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-white">
                {progress.todaySolved}
              </span>
              <span className="text-xs font-mono text-gray-400">
                / {progress.dailyTarget} problems
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                progress.todayTargetMet
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-[#E07A38] to-[#E88B4B]'
              }`}
              style={{ width: `${Math.min(100, progress.todayProgressPct)}%` }}
            />
          </div>
        </div>

        {/* Weekly Target Card */}
        <div className="bg-[#181D29]/75 border border-white/[0.07] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/30 transition-all stat-block-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> 7-Day Velocity
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              progress.weeklyTargetMet
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-blue-500/10 text-blue-400'
            }`}>
              {progress.weeklyProgressPct}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-black text-white">
              {progress.weekSolved}
            </span>
            <span className="text-xs text-gray-400">
              / {progress.weeklyTarget} target weekly
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                progress.weeklyTargetMet
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${Math.min(100, progress.weeklyProgressPct)}%` }}
            />
          </div>
        </div>

        {/* Target Interview Countdown Card */}
        <div className="bg-[#181D29]/75 border border-white/[0.07] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/30 transition-all stat-block-hover sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Target Date
            </span>
            {progress.interviewUrgency && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                progress.interviewUrgency === 'crunch_time'
                  ? 'bg-rose-500/20 text-rose-300'
                  : progress.interviewUrgency === 'accelerated'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {progress.interviewUrgency === 'crunch_time' ? 'Crunch Time' : progress.interviewUrgency === 'accelerated' ? 'Sprint' : 'On Track'}
              </span>
            )}
          </div>

          {progress.daysUntilInterview !== null ? (
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-2xl font-black ${
                  progress.daysUntilInterview <= 14 ? 'text-rose-400' : 'text-purple-300'
                }`}>
                  {progress.daysUntilInterview <= 0 ? 'Due Today' : `${progress.daysUntilInterview}d`}
                </span>
                <span className="text-xs text-gray-400">
                  remaining until interview
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate">
                {new Date(goals.targetInterviewDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-start justify-center h-full py-1">
              <p className="text-xs text-gray-400 mb-2">No target date set</p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-medium underline underline-offset-2"
              >
                Set interview date &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Target Companies Tag Cloud */}
      <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 relative z-10">
        <span className="text-xs font-medium text-gray-400 flex items-center gap-1 mr-1">
          <Building2 className="w-3.5 h-3.5 text-gray-500" /> Target Companies:
        </span>
        {goals.targetCompanies && goals.targetCompanies.length > 0 ? (
          goals.targetCompanies.map((company, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 text-gray-200 border border-white/10 hover:border-orange-500/30 transition-colors"
            >
              {company}
            </span>
          ))
        ) : (
          <span className="text-xs text-gray-500 italic">
            None specified. Add target companies to focus your interview prep.
          </span>
        )}
      </div>

      {/* Edit Goals Modal */}
      {isEditing && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsEditing(false)}
        >
          <div
            className="bg-[#141824] border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 sticky top-0 bg-[#141824]/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E07A38]/10 border border-[#E07A38]/20 flex items-center justify-center text-[#E07A38]">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">Configure Practice Goals</h3>
                  <p className="text-[11px] text-slate-400">Personalized pacing for tech interviews</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                type="button"
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4">
              {/* Daily & Weekly Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Daily Problem Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={dailyTarget}
                    onChange={(e) => setDailyTarget(e.target.value)}
                    required
                    className="w-full h-10 bg-[#0D1017] border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-[#E07A38]"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">Recommended: 2 - 4 / day</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Weekly Problem Target
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={weeklyTarget}
                    onChange={(e) => setWeeklyTarget(e.target.value)}
                    required
                    className="w-full h-10 bg-[#0D1017] border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-[#E07A38]"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">Recommended: 10 - 25 / wk</span>
                </div>
              </div>

              {/* Target Interview Date */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Target Interview Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetInterviewDate}
                  onChange={(e) => setTargetInterviewDate(e.target.value)}
                  className="w-full h-10 bg-[#0D1017] border border-white/10 rounded-xl px-3 text-sm text-white focus:outline-none focus:border-[#E07A38]"
                />
              </div>

              {/* Target Companies */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Target Companies (Up to 8)
                </label>
                
                {/* Active company chips */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {targetCompanies.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#E07A38]/10 text-[#E07A38] border border-[#E07A38]/20"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompany(c)}
                        className="hover:text-white cursor-pointer ml-0.5"
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
                    className="flex-1 h-10 bg-[#0D1017] border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#E07A38]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCompany(newCompanyInput)}
                    className="px-3.5 h-10 bg-white/10 hover:bg-white/15 text-xs text-white font-medium rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {/* Preset quick-picks */}
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] text-gray-500 self-center mr-1">Quick pick:</span>
                  {PRESET_COMPANIES.filter((p) => !targetCompanies.includes(p)).slice(0, 6).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleAddCompany(preset)}
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/5 transition-colors cursor-pointer"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3.5 pb-4 px-5 sm:px-6 border-t border-white/10 sticky bottom-0 -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 bg-[#141824]/95 backdrop-blur-sm mt-6 z-10">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs px-5 py-2 min-h-[40px] disabled:opacity-50"
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
