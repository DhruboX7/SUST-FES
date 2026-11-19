import React, { useState, useEffect, useMemo } from 'react';
import { ResourceItem, AcademicYear } from '../types';
import { FileCheck, Search, Download, Eye, ArrowUpRight, Plus, CheckCircle2 } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../contexts/LanguageContext';

interface ExamBankViewProps {
  pyqResources: ResourceItem[];
  onPreview: (resource: ResourceItem) => void;
  onCopyLink: (resource: ResourceItem) => void;
}

export const ExamBankView: React.FC<ExamBankViewProps> = ({
  pyqResources,
  onPreview,
  onCopyLink,
}) => {
  const { t } = useLanguage();
  usePageMeta({
    title: 'Previous Year Questions (PYQ) Bank',
    description: 'Archive of past semester final and midterm question papers for undergraduate and master degrees in Forestry and Environmental Science, SUST.',
  });

  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<AcademicYear | 'all'>('all');
  const [selectedTerm, setSelectedTerm] = useState<'all' | 'final' | 'midterm'>('all');
  const [visibleCount, setVisibleCount] = useState<number>(24);

  useEffect(() => {
    setVisibleCount(24);
  }, [search, selectedYear, selectedTerm]);

  // Filtered PYQs
  const filtered = useMemo(() => {
    return pyqResources.filter((item) => {
      if (!item) return false;
      const s = search.toLowerCase().trim();
      const matchesSearch =
        !s ||
        (item.title && item.title.toLowerCase().includes(s)) ||
        (item.courseCode && item.courseCode.toLowerCase().includes(s)) ||
        (item.courseTitle && item.courseTitle.toLowerCase().includes(s)) ||
        (item.description && item.description.toLowerCase().includes(s)) ||
        (item.authorOrTeacher && item.authorOrTeacher.toLowerCase().includes(s)) ||
        (item.sessionYear && item.sessionYear.includes(s));

      const matchesYear = selectedYear === 'all' || item.year === selectedYear;
      const matchesTerm = selectedTerm === 'all' || item.examTerm === selectedTerm || item.examTerm === 'all';

      return matchesSearch && matchesYear && matchesTerm;
    });
  }, [pyqResources, search, selectedYear, selectedTerm]);

  return (
    <div className="space-y-6">

      {/* Banner Card */}
      <div className="bg-[#19382B] rounded-lg p-6 sm:p-8 text-[#F3F1E8] border border-[#42684D]/40 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[#BBC4A6] text-xs font-semibold uppercase tracking-wider mb-2">
            <FileCheck className="w-4 h-4 text-[#8A9C74]" />
            <span>{t('examArchiveSub')}</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[#F3F1E8]">
            {t('examBankTitle')}
          </h1>
          <p className="text-[#BBC4A6] text-sm leading-relaxed">
            {t('examBankDesc')}
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">

          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A9C74]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPyqPlaceholder')}
              className="w-full pl-9 pr-4 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] placeholder:text-[#8A9C74] text-xs focus:ring-2 focus:ring-[#42684D] focus:outline-none"
            />
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 rounded-md">
            {(['all', 1, 2, 3, 4] as (AcademicYear | 'all')[]).map((yr) => (
              <button
                key={String(yr)}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedYear === yr
                    ? 'bg-[#42684D] text-[#F3F1E8] shadow-xs'
                    : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B]'
                }`}
              >
                {yr === 'all' ? t('allYears') : yr === 1 ? t('firstYear') : yr === 2 ? t('secondYear') : yr === 3 ? t('thirdYear') : t('fourthYear')}
              </button>
            ))}
          </div>

          {/* Term selector */}
          <div className="flex items-center gap-1 bg-[#EAE7DA] dark:bg-[#142D22] p-1 border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 rounded-md shrink-0">
            <button
              onClick={() => setSelectedTerm('all')}
              className={`px-3 py-1.5 text-xs rounded-sm font-semibold transition-colors cursor-pointer ${
                selectedTerm === 'all'
                  ? 'bg-[#987453] text-[#F3F1E8] shadow-xs'
                  : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
              }`}
            >
              {t('allTerms')}
            </button>
            <button
              onClick={() => setSelectedTerm('final')}
              className={`px-3 py-1.5 text-xs rounded-sm font-semibold transition-colors cursor-pointer ${
                selectedTerm === 'final'
                  ? 'bg-[#987453] text-[#F3F1E8] shadow-xs'
                  : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
              }`}
            >
              {t('finalExam')}
            </button>
            <button
              onClick={() => setSelectedTerm('midterm')}
              className={`px-3 py-1.5 text-xs rounded-sm font-semibold transition-colors cursor-pointer ${
                selectedTerm === 'midterm'
                  ? 'bg-[#987453] text-[#F3F1E8] shadow-xs'
                  : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
              }`}
            >
              {t('midtermExam')}
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Exam Papers */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-8">
          <FileCheck className="w-10 h-10 text-[#8A9C74] mx-auto mb-2" />
          <h3 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">{t('noPyqFound')}</h3>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] max-w-sm mx-auto mt-1">
            {t('noResourcesMatchDesc')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.slice(0, visibleCount).map((item) => (
            <div
              key={item.id}
              className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-5 shadow-xs hover:border-[#42684D] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#8A9C74] mb-2">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-[#987453] dark:text-[#BBC4A6]">{item.courseCode}</span>
                    <span>·</span>
                    <span className="capitalize text-[#42684D] dark:text-[#8A9C74]">{item.examTerm || 'Final'} Exam</span>
                  </div>
                  {item.sessionYear && (
                    <span className="text-[11px] font-medium font-mono text-[#8A9C74]">{item.sessionYear}</span>
                  )}
                </div>

                <h3
                  onClick={() => onPreview(item)}
                  className="text-sm font-bold text-[#19382B] dark:text-[#F3F1E8] hover:text-[#42684D] dark:hover:text-[#BBC4A6] cursor-pointer transition-colors leading-snug mb-1"
                >
                  {item.title}
                </h3>
                <div className="text-xs text-[#42684D] dark:text-[#8A9C74] mb-2">{item.courseTitle}</div>

                {item.description && (
                  <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* REDIRECT TO DRIVE OPTION */}
                  <a
                    href={item.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-md text-xs font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] transition-colors flex items-center justify-center gap-1 shadow-xs"
                    title="Redirect to Google Drive / Source"
                  >
                    <span>{t('redirectDrive')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  {/* PREVIEW OPTION */}
                  <button
                    onClick={() => onPreview(item)}
                    className="py-1.5 px-3 rounded-md text-xs font-semibold bg-[#EAE7DA] hover:bg-[#BBC4A6]/40 dark:bg-[#142D22] dark:hover:bg-[#42684D]/30 text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('readInApp')}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#42684D] dark:text-[#8A9C74] pt-1">
                  <button
                    onClick={() => onCopyLink(item)}
                    className="hover:text-[#19382B] dark:hover:text-[#F3F1E8] transition-colors font-medium"
                  >
                    {t('copyLink')}
                  </button>
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="hover:text-[#19382B] dark:hover:text-[#F3F1E8] transition-colors flex items-center gap-1 font-medium"
                  >
                    <Download className="w-3 h-3" />
                    <span>{t('download')}</span>
                  </a>
                </div>
              </div>
            </div>
            ))}
          </div>

          {filtered.length > 24 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-xs text-[#42684D] dark:text-[#BBC4A6]">
              <span>
                Showing <strong className="text-[#19382B] dark:text-[#F3F1E8]">{Math.min(visibleCount, filtered.length)}</strong> of <strong className="text-[#19382B] dark:text-[#F3F1E8]">{filtered.length}</strong> question papers
              </span>
              {visibleCount < filtered.length ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filtered.length))}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-md font-semibold text-xs bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Load More Papers (+{Math.min(24, filtered.length - visibleCount)})</span>
                </button>
              ) : (
                <span className="text-[#42684D] dark:text-[#8A9C74] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  All {filtered.length} papers displayed
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
