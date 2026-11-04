import React, { useState } from 'react';
import { ResourceItem, AcademicYear } from '../types';
import { FileCheck, Search, Download, Eye, ExternalLink, Calendar, BookOpen, Layers, ArrowUpRight } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

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
  usePageMeta({
    title: 'Previous Year Questions (PYQ) Bank',
    description: 'Archive of past semester final and midterm question papers for undergraduate and master degrees in Forestry and Environmental Science, SUST.',
  });

  const [search, setSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState<AcademicYear | 'all'>('all');
  const [selectedTerm, setSelectedTerm] = useState<'all' | 'final' | 'midterm'>('all');

  // Filtered PYQs
  const filtered = pyqResources.filter((item) => {
    const s = search.toLowerCase().trim();
    const matchesSearch =
      !s ||
      item.title.toLowerCase().includes(s) ||
      item.courseCode.toLowerCase().includes(s) ||
      item.courseTitle.toLowerCase().includes(s) ||
      (item.description && item.description.toLowerCase().includes(s)) ||
      (item.authorOrTeacher && item.authorOrTeacher.toLowerCase().includes(s)) ||
      (item.sessionYear && item.sessionYear.includes(s));

    const matchesYear = selectedYear === 'all' || item.year === selectedYear;
    const matchesTerm = selectedTerm === 'all' || item.examTerm === selectedTerm || item.examTerm === 'all';

    return matchesSearch && matchesYear && matchesTerm;
  });

  return (
    <div className="space-y-6">
      
      {/* Banner Card */}
      <div className="bg-gradient-to-r from-amber-900/90 to-stone-900 rounded-2xl p-6 sm:p-8 text-white border border-amber-800/40 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <FileCheck className="w-4 h-4" />
            <span>FES SUST Examination Archive</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Previous Year Questions (PYQs) & Papers
          </h2>
          <p className="text-stone-300 text-sm leading-relaxed">
            Essential question papers from past semesters (Midterms & Semester Finals) to help students prepare for upcoming departmental exams.
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search past exam questions (e.g. Dendrology 2023, FES 08211121, Silviculture)..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['all', 1, 2, 3, 4] as (AcademicYear | 'all')[]).map((yr) => (
              <button
                key={String(yr)}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors ${
                  selectedYear === yr
                    ? 'bg-amber-800 text-white font-semibold'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {yr === 'all' ? 'All Years' : `${yr}${yr === 1 ? 'st' : yr === 2 ? 'nd' : yr === 3 ? 'rd' : 'th'} Year`}
              </button>
            ))}
          </div>

          {/* Term selector */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setSelectedTerm('all')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                selectedTerm === 'all' ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-white' : 'text-stone-500'
              }`}
            >
              All Terms
            </button>
            <button
              onClick={() => setSelectedTerm('final')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                selectedTerm === 'final' ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-white' : 'text-stone-500'
              }`}
            >
              Finals
            </button>
            <button
              onClick={() => setSelectedTerm('midterm')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                selectedTerm === 'midterm' ? 'bg-white dark:bg-stone-700 shadow-xs text-stone-900 dark:text-white' : 'text-stone-500'
              }`}
            >
              Midterms
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Exam Papers */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-8">
          <FileCheck className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">No Exam Papers Found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Try adjusting your search terms or year filter, or add question papers via the Manage Library panel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs hover:border-amber-600/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-amber-700 dark:text-amber-400">{item.courseCode}</span>
                    <span>·</span>
                    <span className="capitalize">{item.examTerm || 'Final'} Exam</span>
                  </div>
                  {item.sessionYear && (
                    <span className="text-[11px] font-medium text-stone-400">{item.sessionYear}</span>
                  )}
                </div>

                <h3
                  onClick={() => onPreview(item)}
                  className="text-sm font-bold text-stone-900 dark:text-stone-100 hover:text-amber-600 cursor-pointer transition-colors leading-snug mb-1"
                >
                  {item.title}
                </h3>
                <div className="text-xs text-stone-500 dark:text-stone-400 mb-2">{item.courseTitle}</div>

                {item.description && (
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* REDIRECT TO DRIVE OPTION */}
                  <a
                    href={item.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-amber-800 hover:bg-amber-900 text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
                    title="Redirect to Google Drive / Source"
                  >
                    <span>Redirect to Drive</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  {/* PREVIEW OPTION */}
                  <button
                    onClick={() => onPreview(item)}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                  <button
                    onClick={() => onCopyLink(item)}
                    className="hover:text-amber-700 transition-colors"
                  >
                    Copy Link
                  </button>
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="hover:text-amber-700 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
