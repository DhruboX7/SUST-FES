import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { ContributionRequest } from '../types';
import { getStoredContributionRequests } from '../utils/storage';
import { ContributionForm, ContributionSubmissionResult } from './ContributionForm';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FilePlus2,
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

export const ContributionView: React.FC = () => {
  usePageMeta({
    title: 'Contribute Resources · Review Queue',
    description:
      'Submit study resources, exam papers, tree species, field photos, theses, notices, or portal links for admin approval in Manage.',
  });

  const [requests, setRequests] = useState<ContributionRequest[]>(() =>
    getStoredContributionRequests()
  );
  const [lastSubmission, setLastSubmission] = useState<ContributionSubmissionResult | null>(null);

  useEffect(() => {
    const syncData = () => {
      setRequests(getStoredContributionRequests());
    };

    window.addEventListener('sust_fes_data_updated', syncData);
    return () => window.removeEventListener('sust_fes_data_updated', syncData);
  }, []);

  const handleSubmitted = (result: ContributionSubmissionResult) => {
    setLastSubmission(result);
    setRequests(getStoredContributionRequests());
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Banner */}
      <div className="bg-[#19382B] rounded-lg p-6 sm:p-8 text-[#F3F1E8] border border-[#42684D]/40 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-[#BBC4A6] text-xs font-semibold uppercase tracking-wider mb-2">
            <FilePlus2 className="w-4 h-4 text-[#8A9C74]" />
            <span>Open Community Contribution · Admin-Approved Publishing</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[#F3F1E8]">
            Contribute to the SUST FES Digital Library
          </h1>
          <p className="text-xs sm:text-sm text-[#BBC4A6] leading-relaxed">
            Anyone can submit study resources, exam papers, tree species profiles, field photos, theses, notices, or portal links below without any password. All submissions are held in the review queue and published to the live library once approved by an administrator from <strong className="text-[#F3F1E8]">Manage</strong>.
          </p>
        </div>
      </div>

      {/* Submission Confirmation */}
      {lastSubmission && (
        <div
          role="status"
          className="p-5 rounded-lg bg-[#D1FAE5]/70 dark:bg-[#064E3B]/45 border border-[#34D399]/80 text-[#065F46] dark:text-[#A7F3D0] space-y-1.5 shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#059669] dark:text-[#34D399]" />
            <div className="space-y-1 text-xs">
              <div className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                Submitted for Admin Approval
              </div>
              <p className="leading-relaxed">
                <strong>{lastSubmission.request.title}</strong> ({ENTITY_LABELS[lastSubmission.request.entityType] || lastSubmission.request.entityType}) has been queued for review (<code className="font-mono font-bold">{lastSubmission.request.id}</code>). It will be published once an administrator approves it in the Manage Review Queue.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contribution Form */}
      <section className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/75 dark:border-[#BBC4A6]/25 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 pb-3">
          <h2 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">
            Submit Resource or Archive Entry
          </h2>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
            No password required. Choose what you would like to add — your submission will be published once approved by an admin in Manage.
          </p>
        </div>

        <ContributionForm onSubmitted={handleSubmitted} />
      </section>

      {/* Submitted Contributions Status Ledger */}
      <section className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/75 dark:border-[#BBC4A6]/25 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 pb-3">
          <div>
            <h2 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">
              Submitted Contributions ({requests.length})
            </h2>
            <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
              Track whether submitted additions are pending review, approved and published, or declined by an administrator.
            </p>
          </div>
          <Link
            to="/manage"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Review Queue (Manage)</span>
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#42684D] dark:text-[#BBC4A6]">
            No contributions submitted from this browser yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {requests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-md bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0">
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
                      <span>
                        {req.status === 'pending'
                          ? 'Pending Review'
                          : req.status === 'approved'
                            ? 'Approved & Published'
                            : 'Not Approved'}
                      </span>
                    </span>
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-[#EAE7DA] dark:bg-[#19382B] text-[#19382B] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                      {ENTITY_LABELS[req.entityType] || req.entityType}
                    </span>
                  </div>
                  <div className="font-semibold text-[#19382B] dark:text-[#F3F1E8] truncate">
                    {req.title}
                  </div>
                  <div className="text-[11px] text-[#42684D] dark:text-[#BBC4A6]">
                    By {req.contributorName} · {req.summary}
                  </div>
                  {req.reviewNote && (
                    <div className="text-[11px] text-[#92400E] dark:text-[#FDE68A] pt-0.5">
                      Review Note: {req.reviewNote}
                    </div>
                  )}
                </div>

                <div className="font-mono text-[10px] text-[#8A9C74] shrink-0">
                  {new Date(req.submittedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
