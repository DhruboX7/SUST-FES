import React, { useState } from 'react';
import { 
  exportMasterBackupToJson, 
  importMasterBackupFromJson, 
  resetAllCollectionsToFactoryDefaults, 
  setStoredAdminPin, 
  verifyAdminPin 
} from '../../utils/storage';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  RefreshCw, 
  Key, 
  Check, 
  AlertCircle, 
  Database,
  Lock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface AdminMasterBackupPanelProps {
  stats: {
    resources: number;
    pyqs: number;
    species: number;
    gallery: number;
    studentPhotos?: number;
    theses: number;
    notices: number;
    links: number;
  };
  onRefreshAll: () => void;
}

export const AdminMasterBackupPanel: React.FC<AdminMasterBackupPanelProps> = ({
  stats,
  onRefreshAll,
}) => {
  // PIN change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  // Backup Import State
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Reset Modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handlePinChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (!verifyAdminPin(currentPin)) {
      setPinError('Current admin PIN is incorrect.');
      return;
    }

    if (newPin.length < 4) {
      setPinError('New PIN must be at least 4 characters long.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('New PIN and confirmation do not match.');
      return;
    }

    setStoredAdminPin(newPin);
    setPinSuccess('Admin PIN changed successfully! Please keep it secure.');
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);

    const res = await importMasterBackupFromJson(file);
    setIsImporting(false);
    setImportStatus(res);

    if (res.success) {
      onRefreshAll();
    }
  };

  const handleResetFactory = async () => {
    if (resetInput.trim() !== 'RESET SUST FES') {
      return;
    }

    await resetAllCollectionsToFactoryDefaults();
    setIsResetConfirmOpen(false);
    setResetInput('');
    onRefreshAll();
    setResetMessage('All portal databases have been successfully reset to official SUST FES default data.');
    setTimeout(() => setResetMessage(''), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-emerald-950 rounded-2xl border border-emerald-900/40 p-6 text-white shadow-sm">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Utmost Admin Power · Master Department Archive Control</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
          Department Portal Database & System Settings
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
          Centralized management for persistent storage, one-click master JSON backups, data restoration, and departmental credentials.
        </p>

        {/* Collection Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-stone-800/80 backdrop-blur-xs p-3 rounded-xl border border-stone-700/60">
            <div className="text-[10px] uppercase font-bold text-stone-400">Exam PYQs</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{stats.pyqs}</div>
          </div>
          <div className="bg-stone-800/80 backdrop-blur-xs p-3 rounded-xl border border-stone-700/60">
            <div className="text-[10px] uppercase font-bold text-stone-400">Resources</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{stats.resources}</div>
          </div>
          <div className="bg-stone-800/80 backdrop-blur-xs p-3 rounded-xl border border-stone-700/60">
            <div className="text-[10px] uppercase font-bold text-stone-400">Tree Species</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{stats.species}</div>
          </div>
          <div className="bg-stone-800/80 backdrop-blur-xs p-3 rounded-xl border border-stone-700/60">
            <div className="text-[10px] uppercase font-bold text-stone-400">Gallery Photos</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{stats.gallery}</div>
          </div>
          <div className="bg-stone-800/80 backdrop-blur-xs p-3 rounded-xl border border-stone-700/60">
            <div className="text-[10px] uppercase font-bold text-stone-400">Theses</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{stats.theses}</div>
          </div>
          <div className="bg-stone-800/80 backdrop-blur-xs p-3 rounded-xl border border-stone-700/60">
            <div className="text-[10px] uppercase font-bold text-stone-400">Notices & Links</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{stats.notices + stats.links}</div>
          </div>
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. MASTER BACKUP & RESTORE */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base mb-1">
              <Database className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>Full Master JSON Backup & Data Portability</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Download the entire library in a single JSON backup file (including Exam Questions, Resources, Tree Species, Gallery, Theses, Notices, and Links), or restore from an existing backup file.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100">Export Master Backup</div>
                  <div className="text-[11px] text-stone-500">Download all 6 database collections into a timestamped JSON file.</div>
                </div>
                <button
                  type="button"
                  onClick={() => exportMasterBackupToJson()}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup</span>
                </button>
              </div>

              <div className="p-4 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="font-bold text-xs text-stone-900 dark:text-stone-100">Restore from Master Backup</div>
                <div className="text-[11px] text-stone-500">Select a previously exported JSON backup file to overwrite/update the portal database.</div>
                
                <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>{isImporting ? 'Restoring Database...' : 'Select Backup JSON File'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isImporting}
                  />
                </label>

                {importStatus && (
                  <div
                    className={`mt-2 p-3 rounded-lg text-xs flex items-center gap-2 ${
                      importStatus.success
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    {importStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{importStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Factory Reset */}
          <div className="pt-6 mt-6 border-t border-stone-100 dark:border-stone-800">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-xs text-rose-700 dark:text-rose-400">Factory Reset</div>
                <div className="text-[11px] text-stone-500">Restore all collections to official SUST FES default data.</div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>

        {/* 2. ADMIN ACCESS PIN CONFIGURATION */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base mb-1">
              <Key className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <span>Admin Security & PIN Access Credentials</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mb-6">
              Update the master passcode required to unlock the Admin Management Suite. Default PIN is <code className="font-mono bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-emerald-700 dark:text-emerald-400">sustfes</code>.
            </p>

            {pinSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{pinSuccess}</span>
              </div>
            )}

            {pinError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handlePinChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Current Admin PIN
                </label>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Enter current PIN (e.g. sustfes)"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  New Admin PIN (Min 4 chars)
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new secure PIN"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Re-enter new PIN"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                >
                  Update Admin Passcode
                </button>
              </div>
            </form>
          </div>

          <div className="text-[11px] text-stone-400 mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
            Note: Admin session remains active in your browser until the tab is closed or you click lock session.
          </div>
        </div>
      </div>

      {/* FACTORY RESET CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-stone-900 border border-rose-300 dark:border-rose-900 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Database Factory Reset</span>
            </div>

            <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
              This action will reset <strong>all collections</strong> (Resources, PYQs, Tree Species, Gallery photos, Theses, Notices, and Links) back to the official departmental dataset. All custom entries added in this browser will be wiped.
            </p>

            <div>
              <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                To confirm, type <span className="font-mono text-rose-600">RESET SUST FES</span> below:
              </label>
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="RESET SUST FES"
                className="w-full px-3 py-2 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  setResetInput('');
                }}
                className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetFactory}
                disabled={resetInput.trim() !== 'RESET SUST FES'}
                className="px-4 py-2 font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs disabled:opacity-50 transition-colors"
              >
                Wipe & Factory Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
