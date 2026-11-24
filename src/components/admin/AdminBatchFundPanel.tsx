import React, { useState, useMemo } from 'react';
import {
  BatchFundCategory,
  BatchFundRecord,
  BatchFundTransaction,
  BatchFundTransactionType,
} from '../../types';
import {
  getStoredBatchFunds,
  saveStoredBatchFunds,
  resetStoredBatchFunds,
  calculateBatchFundSummary,
} from '../../utils/storage';
import {
  Wallet,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Check,
  X,
} from 'lucide-react';

const TX_CATEGORIES: BatchFundCategory[] = [
  'Contribution',
  'Field Tour',
  'Printing & Notes',
  'Event & Cultural',
  'Sports',
  'Equipment',
  'Other',
];

function formatBdt(amount: number): string {
  const rounded = Math.round((Number(amount) || 0) * 100) / 100;
  return `৳${rounded.toLocaleString('en-US')}`;
}

export const AdminBatchFundPanel: React.FC = () => {
  const [batches, setBatches] = useState<BatchFundRecord[]>(() => getStoredBatchFunds());
  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => {
    const initial = getStoredBatchFunds();
    return initial[0]?.id || '';
  });

  // Feedback banner
  const [feedback, setFeedback] = useState<string | null>(null);

  // Add New Batch inline state
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [newTreasurerName, setNewTreasurerName] = useState('');
  const [newTreasurerContact, setNewTreasurerContact] = useState('');
  const [newOpeningBalance, setNewOpeningBalance] = useState('0');
  const [confirmDeleteBatchId, setConfirmDeleteBatchId] = useState<string | null>(null);

  // Batch Treasurer & Opening Balance Editor state
  const activeBatch = useMemo(
    () => batches.find((b) => b.id === selectedBatchId) || batches[0] || null,
    [batches, selectedBatchId]
  );

  const [editBatchName, setEditBatchName] = useState(activeBatch?.batchName || '');
  const [editTreasurerName, setEditTreasurerName] = useState(activeBatch?.treasurerName || '');
  const [editTreasurerContact, setEditTreasurerContact] = useState(
    activeBatch?.treasurerContact || ''
  );
  const [editOpeningBalance, setEditOpeningBalance] = useState(
    String(activeBatch?.openingBalance ?? 0)
  );
  const [editNotes, setEditNotes] = useState(activeBatch?.notes || '');

  // Keep metadata editor inputs synced when switching batch tabs
  const syncEditorToBatch = (batch: BatchFundRecord | null) => {
    setEditBatchName(batch?.batchName || '');
    setEditTreasurerName(batch?.treasurerName || '');
    setEditTreasurerContact(batch?.treasurerContact || '');
    setEditOpeningBalance(String(batch?.openingBalance ?? 0));
    setEditNotes(batch?.notes || '');
  };

  // Add / Edit Transaction state
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [txType, setTxType] = useState<BatchFundTransactionType>('expense');
  const [txTitle, setTxTitle] = useState('');
  const [txCategory, setTxCategory] = useState<BatchFundCategory>('Printing & Notes');
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [txNotes, setTxNotes] = useState('');

  const notify = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => {
      setFeedback((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const commitBatches = (updated: BatchFundRecord[], msg?: string) => {
    setBatches(updated);
    saveStoredBatchFunds(updated);
    if (msg) notify(msg);
  };

  const handleSelectBatch = (batch: BatchFundRecord) => {
    setSelectedBatchId(batch.id);
    syncEditorToBatch(batch);
    setEditingTxId(null);
    setConfirmDeleteBatchId(null);
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchName.trim() || !newTreasurerName.trim()) return;

    const created: BatchFundRecord = {
      id: `batch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      batchName: newBatchName.trim(),
      treasurerName: newTreasurerName.trim(),
      treasurerContact: newTreasurerContact.trim() || undefined,
      openingBalance: Math.max(0, parseFloat(newOpeningBalance || '0') || 0),
      transactions: [],
      updatedAt: new Date().toISOString(),
    };

    const updated = [created, ...batches];
    commitBatches(updated, `Created batch ledger "${created.batchName}".`);
    setSelectedBatchId(created.id);
    syncEditorToBatch(created);
    setNewBatchName('');
    setNewTreasurerName('');
    setNewTreasurerContact('');
    setNewOpeningBalance('0');
    setIsAddingBatch(false);
  };

  const handleSaveBatchSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;

    const updated = batches.map((b) =>
      b.id === activeBatch.id
        ? {
            ...b,
            batchName: editBatchName.trim() || b.batchName,
            treasurerName: editTreasurerName.trim() || 'Treasurer Not Assigned',
            treasurerContact: editTreasurerContact.trim() || undefined,
            openingBalance: Math.max(0, parseFloat(editOpeningBalance || '0') || 0),
            notes: editNotes.trim() || undefined,
            updatedAt: new Date().toISOString(),
          }
        : b
    );
    commitBatches(updated, 'Updated Treasurer & batch opening balance.');
  };

  const handleDeleteBatch = (id: string) => {
    const remaining = batches.filter((b) => b.id !== id);
    commitBatches(remaining, 'Batch ledger deleted.');
    setConfirmDeleteBatchId(null);
    const nextBatch = remaining[0] || null;
    setSelectedBatchId(nextBatch?.id || '');
    syncEditorToBatch(nextBatch);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch || !txTitle.trim()) return;
    const numericAmount = Math.max(0, parseFloat(txAmount || '0') || 0);
    if (numericAmount <= 0) {
      notify('Please enter an amount greater than 0.');
      return;
    }

    const txRecord: BatchFundTransaction = {
      id: editingTxId || `bf-tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: txType,
      title: txTitle.trim(),
      category: txCategory,
      amount: numericAmount,
      date: txDate || new Date().toISOString().split('T')[0],
      recordedBy: activeBatch.treasurerName,
      notes: txNotes.trim() || undefined,
    };

    const updated = batches.map((b) => {
      if (b.id !== activeBatch.id) return b;
      const nextTxs = editingTxId
        ? b.transactions.map((t) => (t.id === editingTxId ? txRecord : t))
        : [txRecord, ...b.transactions];
      return {
        ...b,
        transactions: nextTxs,
        updatedAt: new Date().toISOString(),
      };
    });

    commitBatches(
      updated,
      editingTxId ? 'Transaction updated.' : `Logged ${txType}: ${txRecord.title}`
    );
    setEditingTxId(null);
    setTxTitle('');
    setTxAmount('');
    setTxNotes('');
  };

  const handleStartEditTx = (tx: BatchFundTransaction) => {
    setEditingTxId(tx.id);
    setTxType(tx.type);
    setTxTitle(tx.title);
    setTxCategory(tx.category);
    setTxAmount(String(tx.amount));
    setTxDate(tx.date);
    setTxNotes(tx.notes || '');
  };

  const handleDeleteTx = (txId: string) => {
    if (!activeBatch) return;
    const updated = batches.map((b) =>
      b.id === activeBatch.id
        ? {
            ...b,
            transactions: b.transactions.filter((t) => t.id !== txId),
            updatedAt: new Date().toISOString(),
          }
        : b
    );
    commitBatches(updated, 'Transaction removed.');
    if (editingTxId === txId) {
      setEditingTxId(null);
      setTxTitle('');
      setTxAmount('');
      setTxNotes('');
    }
  };

  const handleResetDefaults = () => {
    const fresh = resetStoredBatchFunds();
    setBatches(fresh);
    setSelectedBatchId(fresh[0]?.id || '');
    syncEditorToBatch(fresh[0] || null);
    notify('Restored default sample Batch Fund ledgers.');
  };

  const summary = useMemo(
    () =>
      activeBatch
        ? calculateBatchFundSummary(activeBatch)
        : {
            openingBalance: 0,
            totalCollections: 0,
            totalInflow: 0,
            totalExpenses: 0,
            netBalance: 0,
          },
    [activeBatch]
  );

  const inputCls =
    'w-full px-3 min-h-[40px] text-xs rounded-lg bg-[#F3F1E8] dark:bg-[#11261D] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] focus:outline-hidden focus:ring-2 focus:ring-[#42684D]';

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
            <Wallet className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
            <span>Batch Fund, Expenses &amp; Treasurer Management</span>
          </h3>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
            Edit batch treasurer details, opening funds, collections, and itemized expenses. All changes immediately reflect in Student Tools → Batch Fund.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddingBatch((prev) => !prev)}
            className="inline-flex items-center gap-1.5 px-3 min-h-[38px] rounded-md bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Batch Ledger</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 min-h-[38px] rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/70 text-[#987453] text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Sample</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="px-4 py-2.5 rounded-lg bg-[#EAE7DA] dark:bg-[#142D22] border border-[#42684D] text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2"
        >
          <Check className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* New Batch Form */}
      {isAddingBatch && (
        <form
          onSubmit={handleCreateBatch}
          className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#42684D] p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#19382B] dark:text-[#F3F1E8]">
              Create New Batch Fund Ledger
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingBatch(false)}
              className="text-xs text-[#987453] hover:underline cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <input
              type="text"
              required
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              placeholder="Batch Name (e.g. FES 32nd Batch)"
              className={inputCls}
            />
            <input
              type="text"
              required
              value={newTreasurerName}
              onChange={(e) => setNewTreasurerName(e.target.value)}
              placeholder="Treasurer Name"
              className={inputCls}
            />
            <input
              type="text"
              value={newTreasurerContact}
              onChange={(e) => setNewTreasurerContact(e.target.value)}
              placeholder="Phone / Role (optional)"
              className={inputCls}
            />
            <input
              type="number"
              min={0}
              value={newOpeningBalance}
              onChange={(e) => setNewOpeningBalance(e.target.value)}
              placeholder="Opening Balance (৳)"
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            className="px-4 min-h-[38px] rounded-md bg-[#19382B] text-[#F3F1E8] text-xs font-semibold cursor-pointer"
          >
            Create Batch Ledger
          </button>
        </form>
      )}

      {/* Batch Tabs */}
      {batches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {batches.map((b) => {
            const selected = activeBatch?.id === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectBatch(b)}
                className={`px-3.5 min-h-[38px] rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selected
                    ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] border-[#19382B] dark:border-[#BBC4A6]'
                    : 'bg-[#FAF9F4] dark:bg-[#19382B] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20'
                }`}
              >
                {b.batchName}
              </button>
            );
          })}
        </div>
      )}

      {activeBatch && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left: Treasurer & Batch Metadata + Balance KPI */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live KPI Strip */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-lg bg-[#19382B] text-[#F3F1E8]">
                <div className="text-[10px] uppercase text-[#BBC4A6]">Balance</div>
                <div className="font-mono text-sm sm:text-base font-bold mt-0.5">
                  {formatBdt(summary.netBalance)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20">
                <div className="text-[10px] uppercase text-[#42684D] dark:text-[#BBC4A6]">
                  Inflow
                </div>
                <div className="font-mono text-sm sm:text-base font-bold text-[#065F46] dark:text-[#6EE7B7] mt-0.5">
                  {formatBdt(summary.totalInflow)}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20">
                <div className="text-[10px] uppercase text-[#987453]">Expenses</div>
                <div className="font-mono text-sm sm:text-base font-bold text-[#987453] dark:text-[#FDE68A] mt-0.5">
                  {formatBdt(summary.totalExpenses)}
                </div>
              </div>
            </div>

            {/* Edit Treasurer & Opening Balance */}
            <form
              onSubmit={handleSaveBatchSettings}
              className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>Edit Treasurer &amp; Opening Balance</span>
                </h4>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] mb-1">
                  Batch Title
                </label>
                <input
                  type="text"
                  value={editBatchName}
                  onChange={(e) => setEditBatchName(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] mb-1">
                  Treasurer Name
                </label>
                <input
                  type="text"
                  value={editTreasurerName}
                  onChange={(e) => setEditTreasurerName(e.target.value)}
                  placeholder="e.g. Md. Rakibul Hasan"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] mb-1">
                    Treasurer Contact / Note
                  </label>
                  <input
                    type="text"
                    value={editTreasurerContact}
                    onChange={(e) => setEditTreasurerContact(e.target.value)}
                    placeholder="Phone or CR Role"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] mb-1">
                    Opening Balance (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editOpeningBalance}
                    onChange={(e) => setEditOpeningBalance(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] mb-1">
                  Ledger Note
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Optional transparency note..."
                  className={inputCls}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 min-h-[40px] rounded-lg bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] text-[#F3F1E8] text-xs font-semibold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Treasurer Info</span>
                </button>

                {confirmDeleteBatchId === activeBatch.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDeleteBatch(activeBatch.id)}
                      className="px-2.5 py-1.5 rounded-md bg-[#991B1B] text-[#FFFFFF] text-[11px] font-semibold cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteBatchId(null)}
                      className="px-2 py-1.5 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  batches.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteBatchId(activeBatch.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[#991B1B] dark:text-[#FCA5A5] hover:bg-[#FEE2E2]/40 text-xs font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Batch</span>
                    </button>
                  )
                )}
              </div>
            </form>
          </div>

          {/* Right: Add / Edit Transactions + Ledger List */}
          <div className="lg:col-span-7 space-y-4">
            <form
              onSubmit={handleSaveTransaction}
              className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#19382B] dark:text-[#F3F1E8]">
                  {editingTxId ? 'Edit Transaction Entry' : 'Add Collection or Expense'}
                </h4>
                {editingTxId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTxId(null);
                      setTxTitle('');
                      setTxAmount('');
                      setTxNotes('');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-[#987453] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Edit</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('collection')}
                  className={`flex items-center justify-center gap-1.5 min-h-[40px] rounded-lg text-xs font-semibold border cursor-pointer ${
                    txType === 'collection'
                      ? 'bg-[#065F46] text-[#FFFFFF] border-[#065F46]'
                      : 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/60'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Collection / Deposit (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex items-center justify-center gap-1.5 min-h-[40px] rounded-lg text-xs font-semibold border cursor-pointer ${
                    txType === 'expense'
                      ? 'bg-[#987453] text-[#FFFFFF] border-[#987453]'
                      : 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/60'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>Expense (-)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={txTitle}
                    onChange={(e) => setTxTitle(e.target.value)}
                    placeholder="Entry Title (e.g. Lab Manual Printing, Field Tour Snack...)"
                    className={inputCls}
                  />
                </div>
                <div>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value as BatchFundCategory)}
                    className={inputCls}
                  >
                    {TX_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    required
                    min={1}
                    step="any"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Amount (৳)"
                    className={inputCls}
                  />
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    placeholder="Optional receipt ref / note"
                    className={inputCls}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 min-h-[40px] rounded-lg bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{editingTxId ? 'Update Entry' : 'Add to Batch Ledger'}</span>
              </button>
            </form>

            {/* Existing Transactions */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#19382B] dark:text-[#F3F1E8]">
                Recorded Transactions ({activeBatch.transactions.length})
              </h4>

              {activeBatch.transactions.length === 0 ? (
                <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] py-6 text-center">
                  No collections or expenses recorded yet for this batch.
                </p>
              ) : (
                <div className="space-y-2">
                  {activeBatch.transactions.map((tx) => {
                    const isDeposit = tx.type === 'collection';
                    return (
                      <div
                        key={tx.id}
                        className="p-3 rounded-lg bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                            {tx.title}
                          </div>
                          <div className="text-[11px] text-[#42684D] dark:text-[#BBC4A6]">
                            {tx.date} · {tx.category}
                            {tx.notes ? ` · ${tx.notes}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isDeposit
                                ? 'text-[#065F46] dark:text-[#6EE7B7]'
                                : 'text-[#987453] dark:text-[#FDE68A]'
                            }`}
                          >
                            {isDeposit ? '+' : '-'}
                            {formatBdt(tx.amount)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditTx(tx)}
                              className="p-1.5 rounded-md hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] text-[#42684D] dark:text-[#BBC4A6] cursor-pointer"
                              title="Edit entry"
                              aria-label="Edit entry"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTx(tx.id)}
                              className="p-1.5 rounded-md hover:bg-[#FEE2E2]/50 text-[#991B1B] dark:text-[#FCA5A5] cursor-pointer"
                              title="Delete entry"
                              aria-label="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
