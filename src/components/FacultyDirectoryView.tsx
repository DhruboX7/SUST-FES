import React, { useState, useMemo } from 'react';
import {
  SUST_FES_FACULTY,
  FES_DEPARTMENT_OFFICE,
  OfficialFaculty,
} from '../data/coursesData';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  FacultyProfileModal,
  resolveFacultyPhotoUrl,
  getFacultyInitials,
} from './FacultyProfileModal';
import {
  Users,
  Search,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  UserCheck,
  X,
} from 'lucide-react';

interface FacultyPortraitProps {
  faculty: OfficialFaculty;
}

const FacultyPortrait: React.FC<FacultyPortraitProps> = ({ faculty }) => {
  const [failed, setFailed] = useState(false);
  const src = resolveFacultyPhotoUrl(faculty.photoUrl);
  const initials = getFacultyInitials(faculty.name);

  return (
    <div className="w-16 h-20 rounded-md overflow-hidden shrink-0 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25">
      {src && !failed ? (
        <img
          src={src}
          alt={faculty.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center font-editorial text-sm font-semibold text-[#42684D] dark:text-[#BBC4A6]">
          {initials}
        </div>
      )}
    </div>
  );
};

export const FacultyDirectoryView: React.FC = () => {
  usePageMeta({
    title: 'Department Faculty Directory',
    description:
      'Faculty members, academic leadership, portraits, contacts, research areas, and profiles in the Department of Forestry and Environmental Science at SUST, Sylhet.',
  });

  const [search, setSearch] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState<string>('all');
  const [activeFacultyId, setActiveFacultyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const designations: Array<OfficialFaculty['designation']> = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
  ];

  const designationCounts = useMemo(() => {
    const counts: Record<string, number> = { all: SUST_FES_FACULTY.length };
    for (const d of designations) {
      counts[d] = SUST_FES_FACULTY.filter((f) => f.designation === d).length;
    }
    return counts;
  }, []);

  const filteredFaculty = useMemo(() => {
    return SUST_FES_FACULTY.filter((f) => {
      if (selectedDesignation !== 'all' && f.designation !== selectedDesignation) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          f.name.toLowerCase().includes(q) ||
          f.designation.toLowerCase().includes(q) ||
          (f.email && f.email.toLowerCase().includes(q)) ||
          (f.phone && f.phone.toLowerCase().includes(q)) ||
          (f.office && f.office.toLowerCase().includes(q)) ||
          (f.researchAreas && f.researchAreas.some((r) => r.toLowerCase().includes(q))) ||
          (f.education &&
            f.education.some(
              (e) =>
                e.degree.toLowerCase().includes(q) ||
                e.institute.toLowerCase().includes(q)
            )) ||
          (f.teaching && f.teaching.some((t) => t.toLowerCase().includes(q)));
        if (!matches) return false;
      }
      return true;
    });
  }, [search, selectedDesignation]);

  const activeIndex = useMemo(() => {
    if (!activeFacultyId) return -1;
    return filteredFaculty.findIndex((f) => f.id === activeFacultyId);
  }, [activeFacultyId, filteredFaculty]);

  const activeFaculty =
    activeIndex >= 0
      ? filteredFaculty[activeIndex]
      : SUST_FES_FACULTY.find((f) => f.id === activeFacultyId) || null;

  const handleCopyEmail = async (e: React.MouseEvent, id: string, email: string) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(email);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1600);
    } catch {
      // Ignore if clipboard unavailable
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Banner + Departmental Office Utility Ribbon */}
      <div className="bg-[#19382B] rounded-lg p-6 sm:p-8 text-[#F3F1E8] border border-[#42684D]/40 shadow-sm space-y-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[#BBC4A6] text-xs font-semibold uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-[#8A9C74]" />
            <span>Academic Leadership & Faculty Directory</span>
          </div>
          <h1
            className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[#F3F1E8]"
            style={{ textWrap: 'balance' }}
          >
            Faculty of Forestry & Environmental Science
          </h1>
          <p className="text-xs sm:text-sm text-[#BBC4A6] leading-relaxed">
            Distinguished scholars and mentors conducting research across tropical forest ecology, dendrochronology, silviculture, biodiversity conservation, and remote sensing.
          </p>
        </div>

        {/* Departmental Contact Strip */}
        <div className="pt-4 border-t border-[#42684D]/40 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#BBC4A6]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#8A9C74] shrink-0" />
            <span>{FES_DEPARTMENT_OFFICE.address}</span>
          </span>
          <a
            href={`mailto:${FES_DEPARTMENT_OFFICE.email}`}
            className="inline-flex items-center gap-1.5 font-mono hover:text-[#F3F1E8] underline decoration-[#42684D]"
          >
            <Mail className="w-3.5 h-3.5 text-[#8A9C74] shrink-0" />
            <span>{FES_DEPARTMENT_OFFICE.email}</span>
          </a>
          <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
            <Phone className="w-3.5 h-3.5 text-[#8A9C74] shrink-0" />
            <span>{FES_DEPARTMENT_OFFICE.phone}</span>
          </span>
          <a
            href={FES_DEPARTMENT_OFFICE.directoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[#F3F1E8] hover:underline font-medium whitespace-nowrap shrink-0"
          >
            <span>Official SUST Directory</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8A9C74] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, research area, email, phone, or course..."
              aria-label="Search faculty directory"
              className="w-full pl-10 pr-9 py-2.5 rounded-md text-xs sm:text-sm bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] placeholder:text-[#8A9C74] focus:outline-hidden focus:ring-2 focus:ring-[#42684D]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs font-mono tabular-nums text-[#42684D] dark:text-[#BBC4A6] whitespace-nowrap shrink-0 self-end sm:self-center">
            Showing {filteredFaculty.length} of {SUST_FES_FACULTY.length}
          </div>
        </div>

        {/* Segmented Rank Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" role="group" aria-label="Filter by academic rank">
          <button
            type="button"
            onClick={() => setSelectedDesignation('all')}
            className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
              selectedDesignation === 'all'
                ? 'bg-[#19382B] text-[#F3F1E8] dark:bg-[#42684D]'
                : 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#1C3D2F]'
            }`}
          >
            All Ranks ({designationCounts.all})
          </button>
          {designations.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDesignation(d)}
              className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                selectedDesignation === d
                  ? 'bg-[#19382B] text-[#F3F1E8] dark:bg-[#42684D]'
                  : 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#1C3D2F]'
              }`}
            >
              {d}s ({designationCounts[d]})
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredFaculty.length === 0 ? (
        <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-10 text-center space-y-3">
          <p className="font-editorial text-lg text-[#19382B] dark:text-[#F3F1E8]">
            No faculty members matched your filter.
          </p>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6]">
            Try clearing your search query or switching academic rank.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedDesignation('all');
            }}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-[#19382B] text-[#F3F1E8] dark:bg-[#42684D] hover:bg-[#42684D] transition-colors whitespace-nowrap min-h-[40px]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Faculty Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFaculty.map((fac) => {
            const topAreas = fac.researchAreas?.slice(0, 3) || [];
            const extraCount = (fac.researchAreas?.length || 0) - topAreas.length;

            return (
              <article
                key={fac.id}
                className={`p-5 rounded-lg border transition-colors flex flex-col justify-between ${
                  fac.isHead
                    ? 'bg-[#EAE7DA] dark:bg-[#142D22] border-[#987453]/60 dark:border-[#987453]/50 shadow-sm'
                    : 'bg-[#FAF9F4] dark:bg-[#19382B] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 shadow-xs'
                }`}
              >
                <div>
                  {/* Portrait + Identity Header */}
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => setActiveFacultyId(fac.id)}
                      aria-label={`Open profile for ${fac.name}`}
                      className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-[#42684D]"
                    >
                      <FacultyPortrait faculty={fac} />
                    </button>

                    <div className="min-w-0 flex-1">
                      {(fac.isHead || fac.onLeave) && (
                        <div className="text-[11px] font-semibold tracking-wide mb-0.5 flex flex-wrap items-center gap-x-1.5">
                          {fac.isHead && (
                            <span className="text-[#987453] dark:text-[#D4A97E]">
                              Head of Department
                            </span>
                          )}
                          {fac.isHead && fac.onLeave && (
                            <span aria-hidden="true" className="text-[#8A9C74]">·</span>
                          )}
                          {fac.onLeave && (
                            <span className="text-[#987453] dark:text-[#D4A97E]">
                              On Study Leave
                            </span>
                          )}
                        </div>
                      )}

                      <h2 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] leading-snug">
                        <button
                          type="button"
                          onClick={() => setActiveFacultyId(fac.id)}
                          className="text-left hover:text-[#42684D] dark:hover:text-[#BBC4A6] transition-colors focus-visible:outline-2 focus-visible:outline-[#42684D] rounded-xs"
                        >
                          {fac.name}
                        </button>
                      </h2>

                      <div className="text-xs font-semibold text-[#42684D] dark:text-[#8A9C74] mt-0.5">
                        {fac.designation}
                      </div>

                      <div className="text-[11px] text-[#8A9C74] mt-1 leading-snug">
                        {fac.office || 'Academic Building E, SUST, Sylhet-3114'}
                      </div>
                    </div>
                  </div>

                  {/* Research Focus (Unboxed Typographic Line) */}
                  {topAreas.length > 0 && (
                    <div className="mt-3.5 text-xs text-[#42684D] dark:text-[#BBC4A6] leading-relaxed">
                      {topAreas.join(' · ')}
                      {extraCount > 0 && (
                        <span className="text-[#8A9C74] font-mono tabular-nums">
                          {' '}· +{extraCount} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact & Profile Actions */}
                <div className="pt-3.5 mt-4 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 space-y-2.5 text-xs">
                  <div className="space-y-1.5">
                    {fac.email && (
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-1.5 text-[#42684D] dark:text-[#BBC4A6] min-w-0">
                          <Mail className="w-3.5 h-3.5 text-[#8A9C74] shrink-0" />
                          <a
                            href={`mailto:${fac.email}`}
                            className="hover:text-[#19382B] dark:hover:text-[#F3F1E8] underline font-mono truncate"
                          >
                            {fac.email}
                          </a>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyEmail(e, fac.id, fac.email!)}
                          aria-label={`Copy email for ${fac.name}`}
                          className="p-1.5 rounded text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] transition-colors shrink-0"
                        >
                          {copiedId === fac.id ? (
                            <Check className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}

                    {fac.phone && (
                      <div className="flex items-center gap-1.5 text-[#42684D] dark:text-[#BBC4A6]">
                        <Phone className="w-3.5 h-3.5 text-[#8A9C74] shrink-0" />
                        <a
                          href={`tel:${fac.phone}`}
                          className="hover:text-[#19382B] dark:hover:text-[#F3F1E8] font-mono tabular-nums"
                        >
                          {fac.phone}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Action Row */}
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveFacultyId(fac.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-[#19382B] text-[#F3F1E8] dark:bg-[#42684D] hover:bg-[#42684D] dark:hover:bg-[#527F5F] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>View Profile</span>
                    </button>

                    {fac.profileUrl && (
                      <a
                        href={fac.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-2 rounded-md text-xs font-medium text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#EAE7DA]/70 dark:hover:bg-[#142D22] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
                      >
                        <span>SUST Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Detailed Profile Modal */}
      <FacultyProfileModal
        faculty={activeFaculty}
        isOpen={Boolean(activeFaculty)}
        onClose={() => setActiveFacultyId(null)}
        onPrev={
          activeIndex > 0
            ? () => setActiveFacultyId(filteredFaculty[activeIndex - 1].id)
            : undefined
        }
        onNext={
          activeIndex >= 0 && activeIndex < filteredFaculty.length - 1
            ? () => setActiveFacultyId(filteredFaculty[activeIndex + 1].id)
            : undefined
        }
        currentIndex={activeIndex >= 0 ? activeIndex : undefined}
        totalCount={filteredFaculty.length}
      />
    </div>
  );
};
