import React, { useState, useEffect, useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { 
  GraduationCap, 
  Search, 
  User, 
  Calendar, 
  FileText, 
  ExternalLink, 
  BookOpen, 
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { ThesisItem } from '../types';
import { getStoredTheses } from '../utils/storage';

export const ThesisArchiveView: React.FC = () => {
  usePageMeta({
    title: 'Undergraduate & Graduate Theses Archive',
    description: 'Repository of completed B.Sc. (Honours) research projects and M.Sc. dissertations conducted in the Department of Forestry and Environmental Science, SUST.',
  });

  const [theses, setTheses] = useState<ThesisItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDegree, setSelectedDegree] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = () => {
      getStoredTheses()
        .then((data) => {
          if (isMounted) setTheses(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error('Failed to load theses:', err))
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    };

    loadData();

    const handleUpdate = (e: Event) => {
      const collection = (e as CustomEvent<{ collection?: string }>).detail?.collection;
      if (!collection || collection === 'theses' || collection === 'all') {
        if (isMounted) loadData();
      }
    };

    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('sust_fes_data_updated', handleUpdate);
    };
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const filteredTheses = useMemo(() => {
    if (!Array.isArray(theses)) return [];
    return theses.filter((t) => {
      if (!t) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          (t.title && t.title.toLowerCase().includes(q)) ||
          (t.author && t.author.toLowerCase().includes(q)) ||
          (t.supervisor && t.supervisor.toLowerCase().includes(q)) ||
          (t.researchArea && t.researchArea.toLowerCase().includes(q)) ||
          (t.year && String(t.year).includes(q)) ||
          (t.abstract && t.abstract.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (selectedDegree !== 'all') {
        const deg = t.degree || '';
        if (selectedDegree === 'bsc' && !deg.includes('B.Sc.')) return false;
        if (selectedDegree === 'msc' && !deg.includes('M.Sc.')) return false;
      }
      return true;
    });
  }, [theses, search, selectedDegree]);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 rounded-2xl p-6 sm:p-8 text-white border border-emerald-900/40 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span>Academic Research Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Theses & Graduate Project Archive
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Archive of peer-reviewed B.Sc. capstone research dissertations and M.Sc. theses across tropical forestry, conservation biology, and environmental modeling.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by research topic, author, supervisor (e.g. Dr. Redowan), or year..."
            aria-label="Search theses"
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Degree Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedDegree}
            onChange={(e) => setSelectedDegree(e.target.value)}
            aria-label="Filter by degree program"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            <option value="all">All Degrees</option>
            <option value="bsc">B.Sc. (Honours)</option>
            <option value="msc">M.Sc.</option>
          </select>

          {Boolean(search || selectedDegree !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDegree('all');
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 transition-colors shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results List */}
      {filteredTheses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
          <GraduationCap className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">
            No Dissertations Found
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            Try searching a broader research area or clearing the degree filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTheses.map((th) => {
            const isExpanded = expandedIds.includes(th.id);

            return (
              <div
                key={th.id}
                className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs hover:border-emerald-500/50 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs text-stone-400">
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        {th.degree}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-semibold text-stone-500 dark:text-stone-400">
                        Class of {th.year}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] font-semibold text-stone-600 dark:text-stone-300">
                        {th.researchArea}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                      {th.title}
                    </h2>
                  </div>

                  {th.driveUrl && (
                    <a
                      href={th.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shrink-0 shadow-xs transition-colors self-start"
                    >
                      <span>Full Dissertation</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* Author and Supervisor Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    <span><strong className="text-stone-800 dark:text-stone-200">Author:</strong> {th.author}</span>
                  </div>
                  <span aria-hidden="true">·</span>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span><strong className="text-stone-800 dark:text-stone-200">Supervisor:</strong> {th.supervisor}</span>
                  </div>
                </div>

                {/* Expandable Abstract */}
                <div>
                  <button
                    onClick={() => toggleExpand(th.id)}
                    className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 hover:underline flex items-center gap-1 pt-1"
                  >
                    <span>{isExpanded ? 'Hide Abstract' : 'Read Abstract & Findings'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 leading-relaxed animate-fade-in">
                      <span className="font-bold text-stone-900 dark:text-stone-100 block mb-1">
                        Executive Abstract:
                      </span>
                      {th.abstract}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
