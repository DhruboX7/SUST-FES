import React, { useState, useEffect } from 'react';
import {
  ContributionRequest,
  ContributionStatus,
} from '../../types';
import {
  approveContributionRequest,
  deleteContributionRequest,
  getStoredContributionRequests,
  rejectContributionRequest,
} from '../../utils/storage';
import { getOptimizedImageUrl, handleImageError } from '../../utils/imageUtils';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Trash2,
  ExternalLink,
  Inbox,
} from 'lucide-react';

const ENTITY_LABELS: Record<string, string> = {
  resource: 'Study Resource / PYQ',
  species: 'Tree Species',
  gallery: 'Field Gallery Photo',
  student_photo: 'Student Field Photo',
  thesis: 'Thesis Monograph',
  notice: 'Department Notice',
  quick_link: 'Quick Link',
};

export const AdminReviewQueuePanel: React.FC = () => {
  const [requests, setRequests] = useState<ContributionRequest[]>(() =>
    getStoredContributionRequests()
  );
  const [statusFilter, setStatusFilter] = useState<'all' | ContributionStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const reloadData = () => {
    setRequests(getStoredContributionRequests());
  };

  useEffect(() => {
    const handleSync = (e: Event) => {
      const col = (e as CustomEvent<{ collection?: string }>).detail?.collection;
      if (!col || col === 'contributions' || col === 'all') {
        reloadData();
      }
    };
    window.addEventListener('sust_fes_data_updated', handleSync);
    return () => window.removeEventListener('sust_fes_data_updated', handleSync);
  }, []);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  const filteredRequests = requests.filter((req) => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      req.title.toLowerCase().includes(q) ||
      req.contributorName.toLowerCase().includes(q) ||
      req.summary.toLowerCase().includes(q)
    );
  });

  const handleApprove = async (req: ContributionRequest) => {
    setBusyId(req.id);
    setFeedback(null);
    const note = reviewNotes[req.id];
    const res = await approveContributionRequest(req.id, note);
    setBusyId(null);
    reloadData();
    if (res.ok) {
      setFeedback({ ok: true, msg: `Approved and published "${req.title}" to the live archive.` });
    } else {
      setFeedback({ ok: false, msg: res.error || 'Failed to approve request.' });
    }
  };

  const handleReject = (req: ContributionRequest) => {
    setFeedback(null);
    const note = reviewNotes[req.id];
    const res = rejectContributionRequest(req.id, note);
    reloadData();
    if (res.ok) {
      setFeedback({ ok: true, msg: `Marked "${req.title}" as Not Approved.` });
    } else {
      setFeedback({ ok: false, msg: res.error || 'Failed to reject request.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">
              Submitted Contributions &amp; Approval Queue
            </h3>
            <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
              Review resources and entries submitted through Contribute. Approving immediately publishes the item to the live public archive.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A9C74]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, contributor..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] focus:outline-hidden focus:border-[#42684D]"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {(
            [
              { id: 'pending', label: `Pending Review (${pendingCount})` },
              { id: 'approved', label: `Approved (${approvedCount})` },
              { id: 'rejected', label: `Not Approved (${rejectedCount})` },
              { id: 'all', label: `All (${requests.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] border-[#19382B] dark:border-[#42684D]'
                  : 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:border-[#42684D]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-md text-xs font-medium flex items-center gap-2 border ${
              feedback.ok
                ? 'bg-[#D1FAE5]/70 text-[#065F46] border-[#34D399]/75 dark:bg-[#064E3B]/60 dark:text-[#A7F3D0]'
                : 'bg-[#FEE2E2] text-[#991B1B] border-[#F87171]/70 dark:bg-[#7F1D1D]/60 dark:text-[#FECACA]'
            }`}
          >
            {feedback.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.msg}</span>
          </div>
        )}
      </div>

      {/* Request Cards */}
      {filteredRequests.length === 0 ? (
        <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-10 text-center space-y-2">
          <Inbox className="w-9 h-9 text-[#8A9C74] mx-auto" />
          <div className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
            No contributions in this view
          </div>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6]">
            {statusFilter === 'pending'
              ? 'All submitted contributions have been reviewed.'
              : 'Try switching status filters or clearing your search query.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const payload = req.payload || {};
            const previewImg = payload.imageUrl as string | undefined;
            const externalUrl = (payload.driveUrl || payload.url || payload.link) as string | undefined;

            return (
              <div
                key={req.id}
                className={`p-5 rounded-lg border border-l-4 bg-[#FAF9F4] dark:bg-[#19382B] border-[#BBC4A6]/75 dark:border-[#BBC4A6]/25 space-y-4 shadow-xs ${
                  req.status === 'pending'
                    ? 'border-l-[#D97706]'
                    : req.status === 'approved'
                      ? 'border-l-[#059669]'
                      : 'border-l-[#DC2626]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${
                          req.status === 'pending'
                            ? 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/70 dark:bg-[#78350F]/60 dark:text-[#FDE68A]'
                            : req.status === 'approved'
                              ? 'bg-[#D1FAE5] text-[#065F46] border-[#34D399]/75 dark:bg-[#064E3B]/65 dark:text-[#A7F3D0]'
                              : 'bg-[#FEE2E2] text-[#991B1B] border-[#F87171]/70 dark:bg-[#7F1D1D]/60 dark:text-[#FECACA]'
                        }`}
                      >
                        {req.status === 'pending' && <Clock className="w-3 h-3" />}
                        {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                        {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                        <span>{req.status}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#BBC4A6] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25">
                        {ENTITY_LABELS[req.entityType] || req.entityType}
                      </span>
                    </div>

                    <h4 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                      {req.title}
                    </h4>

                    <div className="text-xs text-[#42684D] dark:text-[#BBC4A6]">
                      Submitted by <strong className="text-[#19382B] dark:text-[#F3F1E8]">{req.contributorName}</strong>
                      {req.contributorBatch ? ` (${req.contributorBatch})` : ''}
                      {req.contributorContact ? ` · ${req.contributorContact}` : ''} ·{' '}
                      <span className="font-mono text-[11px]">{new Date(req.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {req.status !== 'pending' && (
                    <button
                      type="button"
                      onClick={() => {
                        deleteContributionRequest(req.id);
                        reloadData();
                      }}
                      title="Remove reviewed log"
                      className="p-1.5 text-[#8A9C74] hover:text-[#DC2626] rounded-md self-start cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Payload Preview */}
                <div className="p-3.5 rounded-md bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 flex flex-col sm:flex-row gap-4 text-xs">
                  {previewImg && (
                    <div className="w-full sm:w-40 aspect-[4/3] rounded-md overflow-hidden border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 bg-[#EAE7DA] shrink-0">
                      <img
                        src={getOptimizedImageUrl(previewImg, 400)}
                        alt={req.title}
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">{req.summary}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-[#42684D] dark:text-[#BBC4A6]">
                      {Object.entries(payload)
                        .filter(([k, v]) => v !== undefined && v !== '' && !['id', 'fileId', 'previewUrl', 'downloadUrl'].includes(k))
                        .slice(0, 8)
                        .map(([key, value]) => (
                          <div key={key} className="truncate">
                            <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8] capitalize">
                              {key.replace(/([A-Z])/g, ' $1')}:
                            </span>{' '}
                            <span>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                          </div>
                        ))}
                    </div>
                    {externalUrl && (
                      <a
                        href={externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#42684D] dark:text-[#FDE68A] hover:underline pt-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect Submitted URL</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Review Controls */}
                {req.status === 'pending' ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                    <input
                      type="text"
                      value={reviewNotes[req.id] || ''}
                      onChange={(e) =>
                        setReviewNotes((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      placeholder="Optional review note or rejection reason..."
                      className="flex-1 px-3 py-2 text-xs rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={busyId === req.id}
                        onClick={() => handleApprove(req)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#047857] hover:bg-[#065F46] text-[#ECFDF5] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve &amp; Publish</span>
                      </button>

                      <button
                        type="button"
                        disabled={busyId === req.id}
                        onClick={() => handleReject(req)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#FEE2E2] hover:bg-[#FECACA] text-[#991B1B] border border-[#F87171]/70 dark:bg-[#7F1D1D]/70 dark:hover:bg-[#991B1B] dark:text-[#FECACA] text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Do Not Approve</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  req.reviewNote && (
                    <div className="text-xs text-[#42684D] dark:text-[#BBC4A6] border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 pt-2">
                      <strong>Review Note:</strong> {req.reviewNote}{' '}
                      {req.reviewedAt && (
                        <span className="font-mono text-[10px] text-[#8A9C74]">
                          ({new Date(req.reviewedAt).toLocaleString()})
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
