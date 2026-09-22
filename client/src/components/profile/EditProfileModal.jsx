import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, User, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, LogOut } from 'lucide-react';
import { updateProfile, changePassword } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useDialog } from '../../hooks/useDialog';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const dialogRef = useRef(null);

  const handleSignOut = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

  // Profile tab state
  const [name, setName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useDialog({
    isOpen,
    onClose,
    dialogRef,
    closeOnEscape: !isUpdatingProfile && !isUpdatingPassword,
  });

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setProfileError('');
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }
    if (name.trim().length > 50) {
      setProfileError('Name cannot exceed 50 characters.');
      return;
    }

    setIsUpdatingProfile(true);
    setProfileError('');
    try {
      const res = await updateProfile({ name: name.trim() });
      if (res.success && res.user) {
        updateUser(res.user);
        toast.success('Profile name updated successfully!');
        onClose();
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (user?.hasPassword && !currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isUpdatingProfile && !isUpdatingPassword) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-settings-title"
        aria-describedby="account-settings-desc"
        tabIndex={-1}
        data-lenis-prevent
        className="relative w-full max-w-md max-h-[90dvh] overflow-y-auto bg-surface border border-line rounded-xl shadow-modal my-auto flex flex-col outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-line sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              {activeTab === 'profile' ? <User className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h2 id="account-settings-title" className="text-sm font-semibold text-text tracking-tight">Account Settings</h2>
              <p id="account-settings-desc" className="text-xs text-muted">Manage your profile details and credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-6 pt-3 pb-1 border-b border-line gap-2 sticky top-[65px] bg-surface z-10">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 pb-2.5 text-xs font-semibold transition-all relative cursor-pointer ${
              activeTab === 'profile'
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted hover:text-text'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 pb-2.5 text-xs font-semibold transition-all relative cursor-pointer ${
              activeTab === 'security'
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted hover:text-text'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password & Security</span>
          </button>
        </div>

        {/* Tab 1: Profile Info */}
        {activeTab === 'profile' && (
          <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
            {profileError && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/25 flex items-center gap-2 text-xs text-danger">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Email Address <span className="text-xs text-muted">(Permanent)</span>
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full h-10 px-3.5 rounded-lg bg-surface-2 border border-line text-xs text-muted cursor-not-allowed select-all"
              />
            </div>

            {/* Display Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="display-name" className="text-xs font-semibold text-text-secondary">
                  Display Name
                </label>
                <span className="text-xs text-muted">{name.length}/50</span>
              </div>
              <input
                id="display-name"
                type="text"
                required
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full h-10 px-3.5 rounded-lg bg-surface-2 border border-line hover:border-line/80 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-9 rounded-lg text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingProfile || name.trim() === user?.name}
                className="btn-primary text-xs flex items-center gap-2 disabled:opacity-40"
              >
                {isUpdatingProfile ? <span>Saving…</span> : <span>Save Changes</span>}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            {passwordError && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/25 flex items-center gap-2 text-xs text-danger">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {user?.hasPassword && (
              <div>
                <label htmlFor="current-pass" className="block text-xs font-semibold text-text-secondary mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-pass"
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-3.5 pr-10 rounded-lg bg-surface-2 border border-line hover:border-line/80 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="new-pass" className="text-xs font-semibold text-text-secondary">
                  New Password
                </label>
                <span className="text-xs text-muted">Min. 6 chars</span>
              </div>
              <div className="relative">
                <input
                  id="new-pass"
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-3.5 pr-10 rounded-lg bg-surface-2 border border-line hover:border-line/80 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-new-pass" className="block text-xs font-semibold text-text-secondary mb-1.5">
                Confirm New Password
              </label>
              <input
                id="confirm-new-pass"
                type={showNew ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3.5 rounded-lg bg-surface-2 border border-line hover:border-line/80 text-sm text-text placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 h-9 rounded-lg text-xs font-medium text-text-secondary hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingPassword ? <span>Updating…</span> : <span>Update Password</span>}
              </button>
            </div>
          </form>
        )}

        {/* Footer: Session status & Sign Out action */}
        <div className="p-4 bg-surface-2/40 border-t border-line flex items-center justify-between gap-3">
          <div className="text-left min-w-0">
            <p className="text-xs font-semibold text-text truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="px-3.5 py-1.5 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 hover:border-danger/40 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shrink-0 min-h-[34px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditProfileModal;
