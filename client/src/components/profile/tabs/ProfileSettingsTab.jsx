import React from 'react';
import { Settings, Database, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import Reveal from '../../common/Reveal';

const ProfileSettingsTab = ({
  user,
  onOpenEditModal,
  onOpenImportModal,
  onExportData,
  isExporting,
}) => {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Account Preferences & Security */}
      <Reveal delay={40} y={15}>
        <div className="bg-surface border border-line rounded-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-text">Account & Security</h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-2 text-secondary border border-line">
                  PROFILE SETTINGS
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Manage your profile details, avatar, and password credentials.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenEditModal}
              className="btn-primary min-h-[40px] px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Profile & Password</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-line">
            <div className="p-3 rounded-lg bg-surface-2/40 border border-line">
              <span className="text-xs text-muted block">Display Name</span>
              <span className="text-xs font-semibold text-text mt-0.5 block truncate">{user?.name || 'DSA Coder'}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-2/40 border border-line">
              <span className="text-xs text-muted block">Email Address</span>
              <span className="text-xs font-semibold text-text mt-0.5 block truncate">{user?.email || '—'}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-2/40 border border-line">
              <span className="text-xs text-muted block">Account Status</span>
              <span className="text-xs font-semibold text-easy mt-0.5 block">Verified & Active</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Data Portability & Backup */}
      <Reveal delay={70} y={15}>
        <div className="bg-surface border border-line rounded-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-text">Data Portability & Backup</h2>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-2 text-secondary border border-line">
                  OFFLINE BACKUP
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Export all your cataloged problems, topics, and practice records.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenImportModal}
                className="btn-secondary min-h-[40px] px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-easy" />
                <span>Import Backup</span>
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onExportData('json')}
                className="btn-secondary min-h-[40px] px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <FileJson className="w-3.5 h-3.5 text-medium" />
                <span>Export JSON</span>
              </button>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => onExportData('csv')}
                className="btn-primary min-h-[40px] px-4 py-2 text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
          <div className="p-3.5 rounded-lg bg-surface-2/40 border border-line flex items-center gap-3 text-xs text-muted">
            <Database className="w-4 h-4 text-muted shrink-0" />
            <p className="leading-relaxed text-xs">
              Your data belongs to you. Backups include full problem descriptions, difficulty ratings, tags, attempt timestamps, and review statuses.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default ProfileSettingsTab;
