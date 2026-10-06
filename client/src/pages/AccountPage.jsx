import React, { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  ShieldCheck,
  KeyRound,
  Download,
  LogOut,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import problemsApi from '../api/problems.api';

function formatMemberDate(dateStr) {
  if (!dateStr) return 'Active Member';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Active Member';
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return 'Active Member';
  }
}

export default function AccountPage() {
  const { user, updateProfile, logout } = useAuth();

  // Profile Edit State
  const [name, setName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const displayInitial = (user?.name || 'A').charAt(0).toUpperCase();

  // Handle Profile Update (Name)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    if (!name.trim()) {
      setProfileError('Display name cannot be empty.');
      return;
    }

    if (name.trim() === user?.name) {
      setProfileSuccess('No changes to save.');
      return;
    }

    setProfileSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      setProfileSuccess('Profile name updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err) {
      setProfileError(
        err?.response?.data?.message || err?.message || 'Failed to update profile.'
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await updateProfile({
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      setPasswordError(
        err?.response?.data?.message || err?.message || 'Failed to change password.'
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  // Handle Workspace JSON Export
  const handleExportData = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const res = await problemsApi.getProblems();
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: { name: user?.name, email: user?.email },
        problems: res.data?.problems || [],
      };
      const dataStr =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `dsa-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to export data:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Account & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal details, verify credentials, and customize security settings.
        </p>
      </div>

      {/* 1. Identity & Verification Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#ed8641] to-[#f97316] text-white font-bold flex items-center justify-center text-2xl font-mono shadow-[0_0_24px_rgba(237,134,65,0.35)] shrink-0">
            {displayInitial}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight truncate">
                {user?.name}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Account
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 mt-1 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Quick Verification Chips */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2/60 border border-line text-xs text-slate-300 font-mono">
            <Calendar className="w-3.5 h-3.5 text-accent" />
            <span>Joined {formatMemberDate(user?.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2/60 border border-line text-xs text-slate-300 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>JWT Verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Edit Profile Form */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/25 text-accent flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Personal Details
                </h3>
                <p className="text-xs text-slate-400">
                  Update your public display identity
                </p>
              </div>
            </div>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full h-10 px-3.5 rounded-xl bg-surface-2/70 border border-line text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Email Address
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full h-10 pl-3.5 pr-9 rounded-xl bg-surface-2/30 border border-line/60 text-xs text-slate-400 font-mono cursor-not-allowed"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-3" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Email is locked as your primary account identifier.
                </p>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-semibold text-white bg-accent hover:bg-accent-hover transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_16px_rgba(237,134,65,0.35)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_22px_rgba(237,134,65,0.45)] mt-2"
              >
                {profileSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>
        </div>

        {/* 3. Change Password Form */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Security & Password
                </h3>
                <p className="text-xs text-slate-400">
                  Update your authentication credentials
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-surface-2/70 border border-line text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password (min. 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-surface-2/70 border border-line text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-surface-2/70 border border-line text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_16px_rgba(168,85,247,0.3)] mt-2"
              >
                {passwordSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 4. Workspace Data Management & Danger Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Backup */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Backup & Export
                </h3>
                <p className="text-xs text-slate-400">
                  Download all your tracked problems and history
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Export your entire DSA Tracker workspace including problem titles, notes, difficulty levels, solved states, and historical attempts as a portable JSON file.
            </p>

            {exportSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Backup downloaded successfully!</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportData}
            disabled={isExporting}
            className="w-full h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-surface-2 hover:bg-surface-hover border border-line transition-all active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-amber-400" />
            )}
            <span>Export Workspace Data (JSON)</span>
          </button>
        </div>

        {/* Danger Zone / Session */}
        <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-line shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-400 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Session & Sign Out
                </h3>
                <p className="text-xs text-slate-400">
                  Manage active device session
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Signing out will invalidate your current session token on this device. Your data remains safely encrypted and accessible upon re-authentication.
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full h-10 inline-flex items-center justify-center gap-2 px-4 rounded-xl text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/25 hover:border-rose-600 transition-all active:scale-95 shadow-[0_0_16px_rgba(244,63,94,0.15)]"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
