import React, { useState, useMemo } from 'react';
import { SUST_FES_FACULTY, OfficialFaculty } from '../data/coursesData';
import { usePageMeta } from '../hooks/usePageMeta';
import { 
  Users, 
  Search, 
  Mail
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
      <div className="bg-[#19382B] rounded-lg p-6 sm:p-8 text-[#F3F1E8] border border-[#42684D]/40 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[#BBC4A6] text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-[#8A9C74]" />
            <span>Academic Leadership & Faculty Directory</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[#F3F1E8]">
            Faculty of Forestry & Environmental Science
          </h1>
          <p className="text-xs sm:text-sm text-[#BBC4A6] leading-relaxed">
            Distinguished scholars and mentors conducting research across tropical forest ecology, silviculture, biodiversity conservation, and environmental impact assessment.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8A9C74] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name (e.g. Dr. Redowan, Dr. Belal Uddin)..."
            aria-label="Search faculty directory"
            className="w-full pl-10 pr-4 py-2 rounded-md text-xs sm:text-sm bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] placeholder:text-[#8A9C74] focus:outline-hidden focus:ring-2 focus:ring-[#42684D]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            aria-label="Filter by faculty designation"
            className="px-3 py-2 rounded-md text-xs font-semibold bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] focus:outline-hidden focus:ring-2 focus:ring-[#42684D]"
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
            className={`p-6 rounded-lg border transition-colors flex flex-col justify-between ${
              fac.isHead
                ? 'bg-[#EAE7DA] dark:bg-[#142D22] border-[#987453]/60 dark:border-[#987453]/50 shadow-sm'
                : 'bg-[#FAF9F4] dark:bg-[#19382B] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 shadow-xs'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-md bg-[#EAE7DA] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-[#42684D] dark:text-[#BBC4A6] font-bold flex items-center justify-center font-mono text-xs">
                  {fac.name.split(' ').slice(-1)[0]?.slice(0, 2).toUpperCase() || 'FE'}
                </div>
                {fac.isHead && (
                  <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-[#987453] text-[#F3F1E8] shadow-xs">
                    Head of Department
                  </span>
                )}
              </div>

              <h2 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] leading-snug">
                {fac.name}
              </h2>
              <div className="text-xs font-semibold text-[#42684D] dark:text-[#8A9C74] mb-2">
                {fac.designation}
              </div>
              <div className="text-xs text-[#8A9C74]">
                Department of Forestry and Environmental Science
              </div>
            </div>

            {/* Email and Research Areas */}
            <div className="pt-4 mt-4 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 space-y-2 text-xs">
              {fac.email ? (
                <div className="flex items-center gap-1.5 text-[#42684D] dark:text-[#BBC4A6] truncate">
                  <Mail className="w-3.5 h-3.5 text-[#8A9C74] shrink-0" />
                  <a href={`mailto:${fac.email}`} className="hover:text-[#19382B] dark:hover:text-[#F3F1E8] underline font-mono">
                    {fac.email}
                  </a>
                </div>
              ) : (
                <div className="text-[11px] text-[#8A9C74] font-mono">
                  Academic Building E, SUST, Sylhet 3114
                </div>
              )}

              {fac.researchAreas && fac.researchAreas.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {fac.researchAreas.map((area, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-sm text-[10px] font-medium bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-[#42684D] dark:text-[#BBC4A6]"
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
