import React, { useState, useRef, useEffect } from 'react';
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
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    };
  }, []);

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
    if (resetTimerRef.current) window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => setResetMessage(''), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="bg-[#19382B] rounded-lg border border-[#BBC4A6]/25 p-6 text-[#F3F1E8]">
        <div className="flex items-center gap-2 text-[#BBC4A6] text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-[#8A9C74]" />
          <span>Utmost Admin Power · Master Department Archive Control</span>
        </div>
        <h3 className="font-editorial text-xl sm:text-2xl font-bold tracking-tight mb-2 text-[#F3F1E8]">
          Department Portal Database & System Settings
        </h3>
        <p className="text-xs sm:text-sm text-[#BBC4A6] max-w-2xl leading-relaxed">
          Centralized management for persistent storage, one-click master JSON backups, data restoration, and departmental credentials.
        </p>

        {/* Collection Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          <div className="bg-[#142D22] p-3 rounded-md border border-[#BBC4A6]/20">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-[#8A9C74]">Exam PYQs</div>
            <div className="text-xl font-bold font-mono text-[#F3F1E8] mt-0.5">{stats.pyqs}</div>
          </div>
          <div className="bg-[#142D22] p-3 rounded-md border border-[#BBC4A6]/20">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-[#8A9C74]">Resources</div>
            <div className="text-xl font-bold font-mono text-[#F3F1E8] mt-0.5">{stats.resources}</div>
          </div>
          <div className="bg-[#142D22] p-3 rounded-md border border-[#BBC4A6]/20">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-[#8A9C74]">Tree Species</div>
            <div className="text-xl font-bold font-mono text-[#F3F1E8] mt-0.5">{stats.species}</div>
          </div>
          <div className="bg-[#142D22] p-3 rounded-md border border-[#BBC4A6]/20">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-[#8A9C74]">Gallery Photos</div>
            <div className="text-xl font-bold font-mono text-[#F3F1E8] mt-0.5">{stats.gallery}</div>
          </div>
          <div className="bg-[#142D22] p-3 rounded-md border border-[#BBC4A6]/20">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-[#8A9C74]">Theses</div>
            <div className="text-xl font-bold font-mono text-[#F3F1E8] mt-0.5">{stats.theses}</div>
          </div>
          <div className="bg-[#142D22] p-3 rounded-md border border-[#BBC4A6]/20">
            <div className="text-[10px] uppercase font-semibold tracking-wider text-[#8A9C74]">Notices & Links</div>
            <div className="text-xl font-bold font-mono text-[#F3F1E8] mt-0.5">{stats.notices + stats.links}</div>
          </div>
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-lg bg-[#EAE7DA] dark:bg-[#19382B] border border-[#42684D] text-[#19382B] dark:text-[#F3F1E8] font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#42684D] dark:text-[#BBC4A6] shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. MASTER BACKUP & RESTORE */}
        <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#19382B] dark:text-[#F3F1E8] font-editorial font-bold text-lg mb-1">
              <Database className="w-5 h-5 text-[#42684D] dark:text-[#BBC4A6]" />
              <span>Full Master JSON Backup & Data Portability</span>
            </div>
            <p className="text-xs text-[#42684D] dark:text-[#8A9C74] mb-6 leading-relaxed">
              Download the entire library in a single JSON backup file (including Exam Questions, Resources, Tree Species, Gallery, Theses, Notices, and Links), or restore from an existing backup file.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-[#EAE7DA]/70 dark:bg-[#142D22] rounded-md border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-xs text-[#19382B] dark:text-[#F3F1E8]">Export Master Backup</div>
                  <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74]">Download all 6 database collections into a timestamped JSON file.</div>
                </div>
                <button
                  type="button"
                  onClick={() => exportMasterBackupToJson()}
                  className="px-4 py-2 bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md text-xs font-semibold flex items-center gap-2 transition-colors shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup</span>
                </button>
              </div>

              <div className="p-4 bg-[#EAE7DA]/70 dark:bg-[#142D22] rounded-md border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 space-y-2">
                <div className="font-semibold text-xs text-[#19382B] dark:text-[#F3F1E8]">Restore from Master Backup</div>
                <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74]">Select a previously exported JSON backup file to overwrite/update the portal database.</div>
                
                <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#19382B] dark:bg-[#42684D] hover:bg-[#42684D] dark:hover:bg-[#19382B] text-[#F3F1E8] rounded-md text-xs font-semibold cursor-pointer transition-colors">
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
                    className={`mt-2 p-3 rounded-md text-xs flex items-center gap-2 border ${
                      importStatus.success
                        ? 'bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] border-[#42684D]'
                        : 'bg-[#F3F1E8] dark:bg-[#19382B] text-[#987453] dark:text-[#F3F1E8] border-[#987453]'
                    }`}
                  >
                    {importStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#42684D] dark:text-[#BBC4A6]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#987453]" />
                    )}
                    <span>{importStatus.message}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Factory Reset */}
          <div className="pt-6 mt-6 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-xs text-[#987453]">Factory Reset</div>
                <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74]">Restore all collections to official SUST FES default data.</div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-[#987453]/70 text-[#987453] hover:bg-[#987453] hover:text-[#F3F1E8] transition-colors"
              >
                Reset Database
              </button>
            </div>
          </div>
        </div>

        {/* 2. ADMIN ACCESS PIN CONFIGURATION */}
        <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#19382B] dark:text-[#F3F1E8] font-editorial font-bold text-lg mb-1">
              <Key className="w-5 h-5 text-[#42684D] dark:text-[#BBC4A6]" />
              <span>Admin Security & PIN Access Credentials</span>
            </div>
            <p className="text-xs text-[#42684D] dark:text-[#8A9C74] mb-6 leading-relaxed">
              Update the master passcode required to unlock the Admin Management Suite. Default PIN is{' '}
              <code className="font-mono bg-[#EAE7DA] dark:bg-[#142D22] px-1.5 py-0.5 rounded-sm text-[#19382B] dark:text-[#BBC4A6] border border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
                sustfes
              </code>.
            </p>

            {pinSuccess && (
              <div className="mb-4 p-3 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#42684D] rounded-md text-[#19382B] dark:text-[#F3F1E8] text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-[#42684D] dark:text-[#BBC4A6]" />
                <span>{pinSuccess}</span>
              </div>
            )}

            {pinError && (
              <div className="mb-4 p-3 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453] rounded-md text-[#987453] dark:text-[#F3F1E8] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#987453]" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handlePinChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                  Current Admin PIN
                </label>
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="Enter current PIN (e.g. sustfes)"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                  New Admin PIN (Min 4 chars)
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Enter new secure PIN"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="Re-enter new PIN"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md transition-colors"
                >
                  Update Admin Passcode
                </button>
              </div>
            </form>
          </div>

          <div className="text-[11px] text-[#8A9C74] mt-6 pt-4 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
            Note: Admin session remains active in your browser until the tab is closed or you click lock session.
          </div>
        </div>
      </div>

      {/* FACTORY RESET CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11261D]/80 animate-fade-in">
          <div className="bg-[#FAF9F4] dark:bg-[#19382B] border border-[#987453] rounded-lg p-6 max-w-md w-full shadow-xl space-y-4 text-xs">
            <div className="flex items-center gap-2 text-[#987453] font-editorial font-bold text-lg">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Confirm Database Factory Reset</span>
            </div>

            <p className="text-[#42684D] dark:text-[#BBC4A6] leading-relaxed">
              This action will reset <strong className="text-[#19382B] dark:text-[#F3F1E8]">all collections</strong> (Resources, PYQs, Tree Species, Gallery photos, Theses, Notices, and Links) back to the official departmental dataset. All custom entries added in this browser will be wiped.
            </p>

            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                To confirm, type <span className="font-mono text-[#987453]">RESET SUST FES</span> below:
              </label>
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder="RESET SUST FES"
                className="w-full px-3 py-2 rounded-md border border-[#987453]/70 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono font-bold"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
              <button
                type="button"
                onClick={() => {
                  setIsResetConfirmOpen(false);
                  setResetInput('');
                }}
                className="px-4 py-2 font-medium text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetFactory}
                disabled={resetInput.trim() !== 'RESET SUST FES'}
                className="px-4 py-2 font-semibold bg-[#987453] hover:bg-[#826143] text-[#F3F1E8] rounded-md disabled:opacity-50 transition-colors"
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
