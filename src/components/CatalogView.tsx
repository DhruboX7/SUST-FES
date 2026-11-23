import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ResourceItem, AcademicYear, AcademicSemester, ResourceCategory, YearRoutine } from '../types';
import { SUST_FES_COURSES } from '../data/coursesData';
import { getStoredRoutines } from '../utils/storage';
import { HeroSection } from './HeroSection';
import { QuickNavHub } from './QuickNavHub';
import { SemesterFilter } from './SemesterFilter';
import { ResourceCard } from './ResourceCard';
import { DatedRoutineCalendar } from './routine/DatedRoutineCalendar';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Search, 
  AlertCircle, 
  Upload, 
  ExternalLink, 
  RefreshCw, 
  Calendar,
  ArrowRight,
  CheckCircle2,
  Plus
} from 'lucide-react';

interface CatalogViewProps {
  resources: ResourceItem[];
  bookmarks: string[];
  isLoading: boolean;
  loadError: string | null;
  onRefresh: () => void;
  onToggleBookmark: (id: string) => void;
  onPreview: (resource: ResourceItem) => void;
  onCopyLink: (resource: ResourceItem) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  resources,
  bookmarks,
  isLoading,
  loadError,
  onRefresh,
  onToggleBookmark,
  onPreview,
  onCopyLink,
}) => {
  const { t } = useLanguage();
  usePageMeta({
    title: 'Academic Study Catalog & Lecture Archive',
    description: 'Browse, filter, and access digital lecture slides, handouts, and past papers for SUST Forestry and Environmental Science courses.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract filter parameters from URL query string
  const searchQuery = searchParams.get('q') || '';
  const rawYear = searchParams.get('year') || 'all';
  const selectedYear: AcademicYear | 'all' = 
    rawYear === '1' ? 1 : rawYear === '2' ? 2 : rawYear === '3' ? 3 : rawYear === '4' ? 4 : rawYear === 'msc' ? 'msc' : 'all';

  const rawSemester = searchParams.get('semester') || 'all';
  const selectedSemester: AcademicSemester = 
    rawSemester === '1' ? 1 : rawSemester === '2' ? 2 : 'all';

  const rawCategory = searchParams.get('category') || 'all';
  const selectedCategory: ResourceCategory | 'all' = 
    (['slides', 'notes', 'pyq', 'book', 'practical'] as const).includes(rawCategory as any)
      ? (rawCategory as ResourceCategory)
      : 'all';

  const selectedCourseCode = searchParams.get('course') || 'all';

  // Helper to update query string
  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, val] of Object.entries(updates)) {
      if (val === null || val === 'all' || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    }
    setSearchParams(next, { replace: true });
  };

  const handleSearchChange = (q: string) => updateQuery({ q });
  const handleSelectYear = (yr: AcademicYear | 'all') => updateQuery({ year: String(yr), course: null });
  const handleSelectSemester = (sem: AcademicSemester) => updateQuery({ semester: String(sem), course: null });
  const handleSelectCategory = (cat: ResourceCategory | 'all') => updateQuery({ category: cat });
  const handleSelectCourse = (code: string) => updateQuery({ course: code });

  // Filtered Courses for Dropdown
  const availableCoursesForFilter = useMemo(() => {
    return SUST_FES_COURSES.filter((c) => {
      if (selectedYear !== 'all') {
        if (c.year !== selectedYear) return false;
      }
      if (selectedSemester !== 'all') {
        if (c.semester !== selectedSemester && c.semester !== 'both') return false;
      }
      return true;
    });
  }, [selectedYear, selectedSemester]);

  // Filtered Resources
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const rCourseCode = (r.courseCode || '').toLowerCase();
        const courseObj = SUST_FES_COURSES.find((c) => c.code.toLowerCase() === rCourseCode);
        const shortCodeMatch = Boolean(courseObj?.shortCode && courseObj.shortCode.toLowerCase().includes(q));
        const syllabusMatch = Boolean(courseObj?.contents && courseObj.contents.some((c) => c.toLowerCase().includes(q)));

        const match =
          (r.title && r.title.toLowerCase().includes(q)) ||
          rCourseCode.includes(q) ||
          (r.courseTitle && r.courseTitle.toLowerCase().includes(q)) ||
          shortCodeMatch ||
          syllabusMatch ||
          (r.authorOrTeacher && r.authorOrTeacher.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q)) ||
          (r.sessionYear && r.sessionYear.includes(q));
        if (!match) return false;
      }

      // 2. Year Filter
      if (selectedYear !== 'all' && r.year !== selectedYear) return false;

      // 3. Semester Filter
      if (selectedSemester !== 'all' && r.semester !== selectedSemester && r.semester !== 'all') return false;

      // 4. Category Filter
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;

      // 5. Course Code Filter
      if (selectedCourseCode !== 'all') {
        const courseObj = SUST_FES_COURSES.find((c) => c.code.toLowerCase() === selectedCourseCode.toLowerCase());
        const isDirectMatch = r.courseCode.toLowerCase() === selectedCourseCode.toLowerCase();
        const isShortMatch = Boolean(courseObj?.shortCode && r.courseCode.toLowerCase().includes(courseObj.shortCode.toLowerCase()));
        if (!isDirectMatch && !isShortMatch) return false;
      }

      return true;
    });
  }, [resources, searchQuery, selectedYear, selectedSemester, selectedCategory, selectedCourseCode]);

  // Progressive catalog pagination
  const [visibleCount, setVisibleCount] = useState<number>(24);

  useEffect(() => {
    setVisibleCount(24);
  }, [searchQuery, selectedYear, selectedSemester, selectedCategory, selectedCourseCode]);

  // Routines data and active calendar Year/Semester state
  const [routines, setRoutines] = useState<YearRoutine[]>([]);
  const [calendarYear, setCalendarYear] = useState<AcademicYear>(() => {
    return typeof selectedYear === 'number' ? selectedYear : 1;
  });
  const [calendarSemester, setCalendarSemester] = useState<1 | 2>(() => {
    return typeof selectedSemester === 'number' ? (selectedSemester as 1 | 2) : 1;
  });

  // Keep calendar selection in sync when catalog semester filter changes
  useEffect(() => {
    if (typeof selectedYear === 'number') {
      setCalendarYear(selectedYear);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (typeof selectedSemester === 'number') {
      setCalendarSemester(selectedSemester as 1 | 2);
    }
  }, [selectedSemester]);

  // Load routines data
  useEffect(() => {
    let isMounted = true;
    getStoredRoutines()
      .then((data) => {
        if (isMounted) setRoutines(data);
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const collection = (e as CustomEvent<{ collection?: string }>).detail?.collection;
      if (!collection || collection === 'routines' || collection === 'all') {
        getStoredRoutines()
          .then((data) => {
            if (isMounted) setRoutines(data);
          })
          .catch(() => {});
      }
    };

    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('sust_fes_data_updated', handleUpdate);
    };
  }, []);

  const currentRoutine = useMemo(() => {
    return routines.find(
      (r) => Number(r.year) === Number(calendarYear) && Number(r.semester) === Number(calendarSemester)
    );
  }, [routines, calendarYear, calendarSemester]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedYear !== 'all' ||
    selectedSemester !== 'all' ||
    selectedCategory !== 'all' ||
    selectedCourseCode !== 'all'
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Department Hero Section with Search */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        totalResources={resources.length}
        totalCourses={SUST_FES_COURSES.length}
        totalPyqs={resources.filter((r) => r.category === 'pyq').length}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onSwitchToExamBank={() => navigate('/pyq')}
      />

      {/* Quick One-Tap Navigation Hub (2-col mobile app grid / 6-col desktop strip) */}
      <QuickNavHub />

      {/* Interactive Class Routine Calendar Section (Shown when no search query is active) */}
      {!searchQuery.trim() && (
        <section aria-labelledby="catalog-routine-calendar-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20">
            <div>
              <h2
                id="catalog-routine-calendar-heading"
                className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2.5"
              >
                <span className="w-7 h-7 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#8A9C74] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </span>
                <span>{t('routineCalendarHeading')}</span>
              </h2>
              <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
                {t('routineCalendarSubtitle')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Year Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#987453] dark:text-[#BBC4A6] uppercase tracking-wider">{t('yearLabel')}</span>
                <div className="flex gap-1 p-0.5 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 rounded-md">
                  {([1, 2, 3, 4] as AcademicYear[]).map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setCalendarYear(yr)}
                      className={`px-2.5 py-1 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                        calendarYear === yr
                          ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8]'
                          : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                      }`}
                    >
                      Y{yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-[#987453] dark:text-[#BBC4A6] uppercase tracking-wider">{t('semLabel')}</span>
                <div className="flex gap-1 p-0.5 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 rounded-md">
                  {[1, 2].map((sem) => (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => setCalendarSemester(sem as 1 | 2)}
                      className={`px-2.5 py-1 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                        calendarSemester === sem
                          ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8]'
                          : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                      }`}
                    >
                      S{sem}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link to Full Notices & Routine */}
              <button
                type="button"
                onClick={() => navigate('/notices?tab=routine')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] bg-[#EAE7DA] dark:bg-[#42684D] border border-[#BBC4A6] dark:border-[#8A9C74]/40 hover:bg-[#BBC4A6]/40 dark:hover:bg-[#42684D]/80 transition-colors cursor-pointer"
                title="Open full routine view with timetable matrix"
              >
                <span>{t('fullTimetable')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <DatedRoutineCalendar
            schedule={currentRoutine?.schedule || []}
            year={Number(calendarYear)}
            semester={calendarSemester}
          />
        </section>
      )}

      {/* Faceted Filter Toolbar */}
      <SemesterFilter
        selectedYear={selectedYear}
        onSelectYear={handleSelectYear}
        selectedSemester={selectedSemester}
        onSelectSemester={handleSelectSemester}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        selectedCourseId={selectedCourseCode}
        onSelectCourseId={handleSelectCourse}
        availableCourses={availableCoursesForFilter}
        activeCount={filteredResources.length}
      />

      {/* Search Notification Banner */}
      {searchQuery.trim() && (
        <div className="p-4 rounded-lg bg-[#FAF9F4] dark:bg-[#19382B] border border-[#42684D]/50 dark:border-[#BBC4A6]/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#8A9C74] flex items-center justify-center shrink-0">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5 flex-wrap">
                <span>{t('searchResultsFor')}</span>
                <span className="px-1.5 py-0.5 rounded-sm bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6]/60 font-mono text-[11px]">
                  &ldquo;{searchQuery}&rdquo;
                </span>
                <span className="text-[#987453] dark:text-[#BBC4A6] font-normal">
                  ({filteredResources.length} {filteredResources.length === 1 ? t('resourceWord') : t('resourcesWord')})
                </span>
              </div>
              <p className="text-[11px] text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
                Showing matching course materials. Click <strong>&ldquo;{t('redirectDrive')}&rdquo;</strong> to open cloud file or <strong>&ldquo;{t('readInApp')}&rdquo;</strong> for instant preview.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            className="px-3 py-1.5 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] hover:bg-[#BBC4A6]/40 transition-colors whitespace-nowrap self-end sm:self-auto cursor-pointer"
          >
            {t('clearSearch')}
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 p-5 space-y-3">
              <div className="h-4 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm w-1/3" />
              <div className="h-6 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm w-3/4" />
              <div className="h-4 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm w-1/2" />
              <div className="h-16 bg-[#F3F1E8] dark:bg-[#11261D] rounded-sm" />
              <div className="h-9 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && loadError && (
        <div className="text-center py-12 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#987453]/50 p-8">
          <AlertCircle className="w-10 h-10 text-[#987453] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
            Error Loading Archive
          </h3>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] max-w-md mx-auto mb-6">
            {loadError}
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )}

      {/* Empty States or Results Grid */}
      {!isLoading && !loadError && (
        <>
          {resources.length === 0 ? (
            /* Archive Empty State */
            <div className="text-center py-16 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-8">
              <Upload className="w-10 h-10 text-[#42684D] dark:text-[#8A9C74] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-2">
                {t('noMaterialsYet')}
              </h3>
              <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] max-w-md mx-auto mb-6 leading-relaxed">
                {t('noMaterialsDesc')}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/contribute')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('contributeResource')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/manage')}
                  className="px-4 py-2.5 bg-[#EAE7DA] dark:bg-[#142D22] hover:bg-[#BBC4A6]/40 text-[#19382B] dark:text-[#F3F1E8] rounded-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('manageArchive')}
                </button>
              </div>
            </div>
          ) : filteredResources.length === 0 ? (
            /* Filter Match Empty State */
            <div className="text-center py-16 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-8">
              <AlertCircle className="w-10 h-10 text-[#987453] mx-auto mb-3" />
              <h3 className="text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                {t('noResourcesMatch')}
              </h3>
              <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] max-w-md mx-auto mb-6 leading-relaxed">
                {t('noResourcesMatchDesc')}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
                  className="px-4 py-2 bg-[#EAE7DA] dark:bg-[#142D22] hover:bg-[#BBC4A6]/40 text-[#19382B] dark:text-[#F3F1E8] rounded-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  {t('resetAllFilters')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/contribute')}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('contributeResource')}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Resource Cards Grid */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResources.slice(0, visibleCount).map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    isBookmarked={bookmarks.includes(res.id)}
                    onToggleBookmark={onToggleBookmark}
                    onPreview={onPreview}
                    onCopyLink={onCopyLink}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>

              {filteredResources.length > 24 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 text-xs text-[#42684D] dark:text-[#BBC4A6]">
                  <span>
                    Showing <strong className="text-[#19382B] dark:text-[#F3F1E8]">{Math.min(visibleCount, filteredResources.length)}</strong> of <strong className="text-[#19382B] dark:text-[#F3F1E8]">{filteredResources.length}</strong> materials
                  </span>
                  {visibleCount < filteredResources.length ? (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filteredResources.length))}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-md font-semibold text-xs bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Load More Materials (+{Math.min(24, filteredResources.length - visibleCount)})</span>
                    </button>
                  ) : (
                    <span className="text-[#42684D] dark:text-[#8A9C74] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      All {filteredResources.length} materials displayed
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}

    </div>
  );
};
