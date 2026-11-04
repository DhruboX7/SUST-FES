import React, { useState, useMemo } from 'react';
import { SUST_FES_FACULTY, OfficialFaculty } from '../data/coursesData';
import { usePageMeta } from '../hooks/usePageMeta';
import { 
  Users, 
  Search, 
  Mail, 
  Award, 
  BookOpen, 
  GraduationCap, 
  Sparkles 
} from 'lucide-react';

export const FacultyDirectoryView: React.FC = () => {
  usePageMeta({
    title: 'Department Faculty Directory',
    description: 'Distinguished faculty members, academic chairs, and research advisors in the Department of Forestry and Environmental Science at SUST, Sylhet.',
  });

  const [search, setSearch] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');

  const filteredFaculty = useMemo(() => {
    return SUST_FES_FACULTY.filter((f) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          f.name.toLowerCase().includes(q) ||
          f.designation.toLowerCase().includes(q) ||
          (f.email && f.email.toLowerCase().includes(q)) ||
          (f.researchAreas && f.researchAreas.some((r) => r.toLowerCase().includes(q)));
        if (!matches) return false;
      }
      if (selectedDesignation !== 'all' && f.designation !== selectedDesignation) {
        return false;
      }
      return true;
    });
  }, [search, selectedDesignation]);

  const designations = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 rounded-2xl p-6 sm:p-8 text-white border border-emerald-900/40 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Academic Leadership & Faculty Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Faculty of Forestry & Environmental Science
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Distinguished scholars and mentors conducting research across tropical forest ecology, silviculture, biodiversity conservation, and environmental impact assessment.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name (e.g. Dr. Redowan, Dr. Belal Uddin)..."
            aria-label="Search faculty directory"
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            aria-label="Filter by faculty designation"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            <option value="all">All Academic Ranks ({SUST_FES_FACULTY.length})</option>
            {designations.map((d) => (
              <option key={d} value={d}>{d}s</option>
            ))}
          </select>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFaculty.map((fac) => (
          <div
            key={fac.id}
            className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
              fac.isHead
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 shadow-sm'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 font-bold flex items-center justify-center font-mono text-xs">
                  {fac.name.split(' ').slice(-1)[0]?.slice(0, 2).toUpperCase() || 'FE'}
                </div>
                {fac.isHead && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-800 text-white shadow-xs">
                    Head of Department
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                {fac.name}
              </h2>
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-2">
                {fac.designation}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                Department of Forestry and Environmental Science
              </div>
            </div>

            {/* Email and Research Areas */}
            <div className="pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 space-y-2 text-xs">
              {fac.email ? (
                <div className="flex items-center gap-1.5 text-stone-600 dark:text-stone-400 truncate">
                  <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <a href={`mailto:${fac.email}`} className="hover:text-emerald-700 dark:hover:text-emerald-400 underline font-mono">
                    {fac.email}
                  </a>
                </div>
              ) : (
                <div className="text-[11px] text-stone-400 font-mono">
                  Academic Building E, SUST, Sylhet 3114
                </div>
              )}

              {fac.researchAreas && fac.researchAreas.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {fac.researchAreas.map((area, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
