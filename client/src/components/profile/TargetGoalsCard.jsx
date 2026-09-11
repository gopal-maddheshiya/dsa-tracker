import React, { useState, useEffect } from 'react';
import { Target, Calendar, Building2, Flame, CheckCircle2, Edit3, X, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { fetchGoals, updateGoals } from '../../api/auth';
import { useToast } from '../../context/ToastContext';

const PRESET_COMPANIES = [
  'Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Netflix',
  'Uber', 'Atlassian', 'Stripe', 'Salesforce', 'Adobe', 'Bloomberg'
];

const TargetGoalsCard = () => {
  const { showToast } = useToast();
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
        showToast('Practice goals updated successfully!', 'success');
        setIsEditing(false);
        loadGoals();
      } else {
        showToast(res?.message || 'Failed to update goals', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error updating practice goals', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCompany = (company) => {
    const trimmed = company.trim();
    if (!trimmed) return;
    if (targetCompanies.includes(trimmed)) return;
    if (targetCompanies.length >= 8) {
      showToast('Maximum 8 target companies allowed', 'info');
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-sm">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Target Goals & Readiness
              {progress.todayTargetMet && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Configure Goals
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 mb-5">
        {/* Today's Target Card */}
        <div className="bg-[#181D29]/70 border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Today's Target
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              progress.todayTargetMet
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-orange-500/10 text-orange-400'
            }`}>
              {progress.todayProgressPct}%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-black text-white">
              {progress.todaySolved}
            </span>
            <span className="text-xs text-gray-400">
              / {progress.dailyTarget} problems solved
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${
                progress.todayTargetMet
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-orange-500 to-amber-400'
              }`}
              style={{ width: `${Math.min(100, progress.todayProgressPct)}%` }}
            />
          </div>
        </div>

        {/* Weekly Target Card */}
        <div className="bg-[#181D29]/70 border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/20 transition-all">
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
        <div className="bg-[#181D29]/70 border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/20 transition-all sm:col-span-2 lg:col-span-1">
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
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141824] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleUp">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                <h3 className="text-base font-bold text-white">Configure Practice Goals</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Daily & Weekly Target */}
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full bg-[#0D1017] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
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
                    className="w-full bg-[#0D1017] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
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
                  className="w-full bg-[#0D1017] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
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
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-orange-500/10 text-orange-300 border border-orange-500/20"
                    >
                      {c}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompany(c)}
                        className="hover:text-white"
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
                    className="flex-1 bg-[#0D1017] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCompany(newCompanyInput)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-xs text-white font-medium rounded-lg transition-colors inline-flex items-center gap-1"
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
                      className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 border border-white/5 transition-colors"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : 'Save Goals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetGoalsCard;
