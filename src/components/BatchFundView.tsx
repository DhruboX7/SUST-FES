import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BatchFundCategory, BatchFundRecord } from '../types';
import {
  getStoredBatchFunds,
  calculateBatchFundSummary,
} from '../utils/storage';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Wallet,
  UserCheck,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Calculator,
  Search,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Receipt,
} from 'lucide-react';

function formatBdt(amount: number): string {
  const rounded = Math.round((Number(amount) || 0) * 100) / 100;
  return `৳${rounded.toLocaleString('en-US')}`;
}

export const BatchFundView: React.FC = () => {
  const { lang } = useLanguage();
  usePageMeta({
    title: 'Batch Fund Balance & Expense Ledger',
    description:
      'Transparent batch treasury balance, itemized collections and expenses, treasurer contact, and per-student contribution estimator.',
  });

  const [batches, setBatches] = useState<BatchFundRecord[]>(() => getStoredBatchFunds());
  const [selectedBatchId, setSelectedBatchId] = useState<string>(() => {
    const initial = getStoredBatchFunds();
    return initial[0]?.id || '';
  });

  const [txFilter, setTxFilter] = useState<'all' | 'collection' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Interactive Batch Fund Planner / Estimator state (client-only scratchpad)
  const [memberCount, setMemberCount] = useState<string>('36');
  const [perStudentContribution, setPerStudentContribution] = useState<string>('200');
  const [plannedExpense, setPlannedExpense] = useState<string>('3500');

  useEffect(() => {
    const handleSync = (e: Event) => {
      const col = (e as CustomEvent<{ collection?: string }>).detail?.collection;
      if (!col || col === 'batch_funds' || col === 'all') {
        const fresh = getStoredBatchFunds();
        setBatches(fresh);
        if (fresh.length > 0 && !fresh.some((b) => b.id === selectedBatchId)) {
          setSelectedBatchId(fresh[0].id);
        }
      }
    };
    window.addEventListener('sust_fes_data_updated', handleSync);
    return () => window.removeEventListener('sust_fes_data_updated', handleSync);
  }, [selectedBatchId]);

  const activeBatch = useMemo(() => {
    return batches.find((b) => b.id === selectedBatchId) || batches[0] || null;
  }, [batches, selectedBatchId]);

  const summary = useMemo(() => {
    if (!activeBatch) {
      return {
        openingBalance: 0,
        totalCollections: 0,
        totalInflow: 0,
        totalExpenses: 0,
        netBalance: 0,
      };
    }
    return calculateBatchFundSummary(activeBatch);
  }, [activeBatch]);

  // Chronological running balance map
  const transactionsWithBalance = useMemo(() => {
    if (!activeBatch) return [];
    const sortedAsc = [...activeBatch.transactions].sort((a, b) =>
      (a.date || '').localeCompare(b.date || '')
    );
    let running = Number(activeBatch.openingBalance) || 0;
    const mapped = sortedAsc.map((tx) => {
      const amt = Math.max(0, Number(tx.amount) || 0);
      running = tx.type === 'collection' ? running + amt : running - amt;
      return { ...tx, runningBalance: running };
    });
    // Return newest first for ledger display
    return mapped.reverse();
  }, [activeBatch]);

  const filteredTransactions = useMemo(() => {
    return transactionsWithBalance.filter((tx) => {
      if (txFilter !== 'all' && tx.type !== txFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const hit =
          tx.title.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q) ||
          (tx.notes && tx.notes.toLowerCase().includes(q)) ||
          (tx.recordedBy && tx.recordedBy.toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [transactionsWithBalance, txFilter, searchQuery]);

  // Expense category breakdown
  const expenseBreakdown = useMemo(() => {
    if (!activeBatch || summary.totalExpenses <= 0) return [];
    const byCat: Partial<Record<BatchFundCategory, number>> = {};
    for (const tx of activeBatch.transactions) {
      if (tx.type === 'expense') {
        byCat[tx.category] = (byCat[tx.category] || 0) + (Number(tx.amount) || 0);
      }
    }
    return Object.entries(byCat)
      .map(([category, amount]) => ({
        category,
        amount: amount || 0,
        percent: Math.round(((amount || 0) / summary.totalExpenses) * 100),
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [activeBatch, summary.totalExpenses]);

  // Quick estimator math
  const estimatorMembers = Math.max(0, parseInt(memberCount || '0', 10) || 0);
  const estimatorPerHead = Math.max(0, parseFloat(perStudentContribution || '0') || 0);
  const estimatorExtraCollection = estimatorMembers * estimatorPerHead;
  const estimatorPlannedExpense = Math.max(0, parseFloat(plannedExpense || '0') || 0);
  const projectedBalance =
    summary.netBalance + estimatorExtraCollection - estimatorPlannedExpense;
  const shortfallPerMember =
    estimatorMembers > 0 && projectedBalance < 0
      ? Math.ceil(Math.abs(projectedBalance) / estimatorMembers)
      : 0;

  const handleCopySummary = () => {
    if (!activeBatch) return;
    const lines = [
      `[${activeBatch.batchName} — Batch Fund Report]`,
      `Treasurer: ${activeBatch.treasurerName}${activeBatch.treasurerContact ? ` (${activeBatch.treasurerContact})` : ''}`,
      `Opening Balance: ${formatBdt(summary.openingBalance)}`,
      `Total Collected: ${formatBdt(summary.totalCollections)}`,
      `Total Expenses: ${formatBdt(summary.totalExpenses)}`,
      `Current Balance: ${formatBdt(summary.netBalance)}`,
      ``,
      `Recent Entries:`,
      ...transactionsWithBalance.slice(0, 6).map(
        (tx) =>
          `• ${tx.date} | ${tx.type === 'collection' ? '+' : '-'}${formatBdt(tx.amount)} | ${tx.title}`
      ),
    ];
    navigator.clipboard?.writeText(lines.join('\n')).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2200);
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <section className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl sm:rounded-lg border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#987453] dark:text-[#BBC4A6]">
              <Wallet className="w-3.5 h-3.5" />
              <span>FES SUST Treasury &amp; Student Ledger</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#19382B] dark:text-[#F3F1E8]">
              {lang === 'bn' ? 'ব্যাচ ফান্ড হিসাব ও কোষাধ্যক্ষ' : 'Batch Fund & Expense Tracker'}
            </h1>
            <p className="text-xs sm:text-sm text-[#42684D] dark:text-[#BBC4A6] max-w-2xl">
              {lang === 'bn'
                ? 'আপনার ব্যাচের মোট তহবিল, আয়-ব্যয়ের হিসাব এবং দায়িত্বপ্রাপ্ত কোষাধ্যক্ষের তথ্য দেখুন। ম্যানেজ অপশন থেকে হিসাব সম্পাদনা করা যাবে।'
                : 'View current batch fund balance, collected deposits, itemized expenses, and batch treasurer details. All entries and treasurer info can be updated inside Manage.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopySummary}
              disabled={!activeBatch}
              className="inline-flex items-center gap-1.5 px-3.5 min-h-[42px] rounded-lg text-xs font-semibold bg-[#EAE7DA] dark:bg-[#142D22] hover:bg-[#BBC4A6]/40 text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 transition-colors cursor-pointer active:scale-95"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#42684D]" />
                  <span>Summary Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>Copy Report</span>
                </>
              )}
            </button>

            <Link
              to="/manage?tab=batchFund"
              className="inline-flex items-center gap-1.5 px-4 min-h-[42px] rounded-lg text-xs font-semibold bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] dark:hover:text-[#11261D] text-[#F3F1E8] border border-[#19382B] dark:border-[#BBC4A6]/35 transition-colors active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Edit in Manage</span>
            </Link>
          </div>
        </div>

        {/* Batch Switcher */}
        {batches.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#987453] dark:text-[#BBC4A6] mr-1">
              Select Batch:
            </span>
            {batches.map((b) => {
              const isSelected = activeBatch?.id === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBatchId(b.id)}
                  className={`px-3.5 min-h-[38px] rounded-lg text-xs font-semibold border transition-colors cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] border-[#19382B] dark:border-[#BBC4A6]'
                      : 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:border-[#42684D]'
                  }`}
                >
                  {b.batchName}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {!activeBatch ? (
        <div className="p-10 text-center bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 space-y-3">
          <Wallet className="w-10 h-10 text-[#987453] mx-auto" />
          <h2 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">
            No Batch Fund Ledgers Yet
          </h2>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] max-w-md mx-auto">
            Create your batch treasury ledger, set the Treasurer Name, and log fund collections or expenses from Manage.
          </p>
          <Link
            to="/manage?tab=batchFund"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#42684D] text-[#F3F1E8] text-xs font-semibold"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Batch Fund in Manage</span>
          </Link>
        </div>
      ) : (
        <>
          {/* 4 Summary Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
            {/* 1. Net Current Balance */}
            <div className="bg-[#19382B] text-[#F3F1E8] rounded-xl p-4 sm:p-5 border border-[#42684D] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#BBC4A6] font-medium">
                <span>Current Batch Fund Balance</span>
                <Wallet className="w-4 h-4 text-[#BBC4A6]" />
              </div>
              <div
                className={`font-editorial text-2xl sm:text-3xl font-semibold mt-2 tabular-nums ${
                  summary.netBalance < 0 ? 'text-[#FCA5A5]' : 'text-[#F3F1E8]'
                }`}
              >
                {formatBdt(summary.netBalance)}
              </div>
              <div className="text-[11px] text-[#BBC4A6] mt-2">
                Opening {formatBdt(summary.openingBalance)} + Collections − Expenses
              </div>
            </div>

            {/* 2. Total Collections */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl p-4 sm:p-5 border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#42684D] dark:text-[#BBC4A6] font-medium">
                <span>Total Fund Inflow</span>
                <TrendingUp className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
              </div>
              <div className="font-editorial text-2xl sm:text-3xl font-semibold text-[#19382B] dark:text-[#F3F1E8] mt-2 tabular-nums">
                {formatBdt(summary.totalInflow)}
              </div>
              <div className="text-[11px] text-[#42684D] dark:text-[#BBC4A6] mt-2">
                Collected: <strong className="text-[#19382B] dark:text-[#F3F1E8]">{formatBdt(summary.totalCollections)}</strong> · Opening: {formatBdt(summary.openingBalance)}
              </div>
            </div>

            {/* 3. Total Expenses */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl p-4 sm:p-5 border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#987453] dark:text-[#FDE68A] font-medium">
                <span>Total Expenses</span>
                <TrendingDown className="w-4 h-4 text-[#987453]" />
              </div>
              <div className="font-editorial text-2xl sm:text-3xl font-semibold text-[#987453] dark:text-[#FDE68A] mt-2 tabular-nums">
                {formatBdt(summary.totalExpenses)}
              </div>
              <div className="text-[11px] text-[#42684D] dark:text-[#BBC4A6] mt-2">
                {activeBatch.transactions.filter((t) => t.type === 'expense').length} recorded expense entries
              </div>
            </div>

            {/* 4. Batch Treasurer Card */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl p-4 sm:p-5 border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-[#42684D] dark:text-[#BBC4A6] font-medium">
                <span>Batch Treasurer</span>
                <UserCheck className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
              </div>
              <div className="font-editorial text-lg sm:text-xl font-semibold text-[#19382B] dark:text-[#F3F1E8] mt-2 leading-snug">
                {activeBatch.treasurerName || 'Not Assigned'}
              </div>
              <div className="text-[11px] text-[#42684D] dark:text-[#BBC4A6] mt-2 flex items-center justify-between gap-2">
                <span className="truncate">
                  {activeBatch.treasurerContact || 'Update details in Manage'}
                </span>
                <Link
                  to="/manage?tab=batchFund"
                  className="text-[10px] font-semibold underline shrink-0 text-[#19382B] dark:text-[#F3F1E8]"
                >
                  Edit
                </Link>
              </div>
            </div>
          </div>

          {/* Two-Column Middle Row: Interactive Fund Planner + Expense Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Interactive Balance & Per-Student Split Calculator */}
            <section className="lg:col-span-6 bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-4 sm:p-5 space-y-4">
              <div>
                <h2 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>Quick Fund Balance &amp; Per-Head Calculator</span>
                </h2>
                <p className="text-[11px] text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
                  Estimate remaining balance after an upcoming collection or event expense without altering official records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label htmlFor="bf-calc-members" className="block text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] mb-1">
                    <Users className="w-3 h-3 inline mr-1" />
                    Students / Members
                  </label>
                  <input
                    id="bf-calc-members"
                    type="number"
                    min={0}
                    value={memberCount}
                    onChange={(e) => setMemberCount(e.target.value)}
                    className="w-full px-3 min-h-[42px] text-sm rounded-lg bg-[#F3F1E8] dark:bg-[#11261D] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="bf-calc-per-head" className="block text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] mb-1">
                    Per-Student Deposit (৳)
                  </label>
                  <input
                    id="bf-calc-per-head"
                    type="number"
                    min={0}
                    value={perStudentContribution}
                    onChange={(e) => setPerStudentContribution(e.target.value)}
                    className="w-full px-3 min-h-[42px] text-sm rounded-lg bg-[#F3F1E8] dark:bg-[#11261D] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="bf-calc-expense" className="block text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] mb-1">
                    Planned Expense (৳)
                  </label>
                  <input
                    id="bf-calc-expense"
                    type="number"
                    min={0}
                    value={plannedExpense}
                    onChange={(e) => setPlannedExpense(e.target.value)}
                    className="w-full px-3 min-h-[42px] text-sm rounded-lg bg-[#F3F1E8] dark:bg-[#11261D] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-[#42684D] dark:text-[#BBC4A6] space-y-0.5">
                  <div>
                    Current: <strong className="text-[#19382B] dark:text-[#F3F1E8]">{formatBdt(summary.netBalance)}</strong> + New Collection:{' '}
                    <strong className="text-[#42684D] dark:text-[#8A9C74]">+{formatBdt(estimatorExtraCollection)}</strong> − Planned:{' '}
                    <strong className="text-[#987453]">-{formatBdt(estimatorPlannedExpense)}</strong>
                  </div>
                  {shortfallPerMember > 0 && (
                    <div className="text-[#991B1B] dark:text-[#FCA5A5] font-medium">
                      Shortfall detected: Collect ~{formatBdt(shortfallPerMember)} more per member to cover this expense.
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-[#42684D] dark:text-[#BBC4A6]">
                    Projected Balance
                  </div>
                  <div
                    className={`font-editorial text-xl font-bold tabular-nums ${
                      projectedBalance < 0
                        ? 'text-[#991B1B] dark:text-[#FCA5A5]'
                        : 'text-[#19382B] dark:text-[#F3F1E8]'
                    }`}
                  >
                    {formatBdt(projectedBalance)}
                  </div>
                </div>
              </div>
            </section>

            {/* Right: Expense Breakdown */}
            <section className="lg:col-span-6 bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#987453]" />
                  <span>Expense Allocation by Category</span>
                </h2>
                <span className="text-xs font-mono font-semibold text-[#987453] dark:text-[#FDE68A]">
                  {formatBdt(summary.totalExpenses)}
                </span>
              </div>

              {expenseBreakdown.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#42684D] dark:text-[#BBC4A6]">
                  No expenses logged yet for this batch.
                </div>
              ) : (
                <div className="space-y-3">
                  {expenseBreakdown.map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                          {item.category}
                        </span>
                        <span className="font-mono text-[#42684D] dark:text-[#BBC4A6]">
                          {formatBdt(item.amount)} ({item.percent}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#EAE7DA] dark:bg-[#142D22] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#42684D] dark:bg-[#8A9C74]"
                          style={{ width: `${Math.max(4, item.percent)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeBatch.notes && (
                <p className="text-[11px] text-[#42684D] dark:text-[#BBC4A6] pt-2 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
                  {activeBatch.notes}
                </p>
              )}
            </section>
          </div>

          {/* Transaction Ledger Table / Cards */}
          <section className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-editorial text-base sm:text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                  Itemized Collections &amp; Expenses Ledger
                </h2>
                <p className="text-[11px] text-[#42684D] dark:text-[#BBC4A6]">
                  {filteredTransactions.length} entries shown · Managed in Admin Console
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#8A9C74] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter ledger..."
                    className="pl-8 pr-3 min-h-[40px] w-full sm:w-48 text-xs rounded-lg bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 rounded-lg bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                  {(['all', 'collection', 'expense'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setTxFilter(tab)}
                      className={`px-3 min-h-[32px] rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer ${
                        txFilter === tab
                          ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8]'
                          : 'text-[#42684D] dark:text-[#BBC4A6]'
                      }`}
                    >
                      {tab === 'all' ? 'All' : tab === 'collection' ? 'Collections' : 'Expenses'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="py-10 text-center text-xs text-[#42684D] dark:text-[#BBC4A6]">
                No matching transactions in this batch ledger.
              </div>
            ) : (
              <>
                {/* Mobile Card List */}
                <div className="md:hidden space-y-2.5">
                  {filteredTransactions.map((tx) => {
                    const isDeposit = tx.type === 'collection';
                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-xl bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                              {tx.title}
                            </div>
                            <div className="text-[11px] text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
                              {tx.date} · {tx.category}
                            </div>
                          </div>
                          <div
                            className={`text-sm font-mono font-bold shrink-0 tabular-nums ${
                              isDeposit
                                ? 'text-[#065F46] dark:text-[#6EE7B7]'
                                : 'text-[#987453] dark:text-[#FDE68A]'
                            }`}
                          >
                            {isDeposit ? '+' : '-'}
                            {formatBdt(tx.amount)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#42684D] dark:text-[#BBC4A6] pt-1 border-t border-[#BBC4A6]/40 dark:border-[#BBC4A6]/15">
                          <span className="truncate">{tx.notes || tx.recordedBy || 'Verified entry'}</span>
                          <span className="font-mono shrink-0">
                            Bal: <strong className="text-[#19382B] dark:text-[#F3F1E8]">{formatBdt(tx.runningBalance)}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 text-[11px] uppercase tracking-wider text-[#987453] dark:text-[#BBC4A6]">
                        <th className="py-2.5 px-3 font-semibold">Date</th>
                        <th className="py-2.5 px-3 font-semibold">Description</th>
                        <th className="py-2.5 px-3 font-semibold">Category</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#BBC4A6]/40 dark:divide-[#BBC4A6]/15">
                      {filteredTransactions.map((tx) => {
                        const isDeposit = tx.type === 'collection';
                        return (
                          <tr
                            key={tx.id}
                            className="hover:bg-[#EAE7DA]/50 dark:hover:bg-[#142D22]/60 transition-colors"
                          >
                            <td className="py-3 px-3 font-mono text-[#42684D] dark:text-[#BBC4A6] whitespace-nowrap">
                              {tx.date}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5">
                                {isDeposit ? (
                                  <ArrowDownLeft className="w-3.5 h-3.5 text-[#065F46] dark:text-[#6EE7B7] shrink-0" />
                                ) : (
                                  <ArrowUpRight className="w-3.5 h-3.5 text-[#987453] dark:text-[#FDE68A] shrink-0" />
                                )}
                                <span>{tx.title}</span>
                              </div>
                              {tx.notes && (
                                <div className="text-[11px] text-[#42684D] dark:text-[#BBC4A6] mt-0.5 pl-5">
                                  {tx.notes}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-[#42684D] dark:text-[#BBC4A6]">
                              {tx.category}
                            </td>
                            <td
                              className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap tabular-nums ${
                                isDeposit
                                  ? 'text-[#065F46] dark:text-[#6EE7B7]'
                                  : 'text-[#987453] dark:text-[#FDE68A]'
                              }`}
                            >
                              {isDeposit ? '+' : '-'}
                              {formatBdt(tx.amount)}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-semibold text-[#19382B] dark:text-[#F3F1E8] whitespace-nowrap tabular-nums">
                              {formatBdt(tx.runningBalance)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
};
