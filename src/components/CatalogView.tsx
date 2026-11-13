import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ResourceItem, AcademicYear, AcademicSemester, ResourceCategory, YearRoutine } from '../types';
import { SUST_FES_COURSES } from '../data/coursesData';
import { getStoredRoutines } from '../utils/storage';
import { HeroSection } from './HeroSection';
import { SemesterFilter } from './SemesterFilter';
import { ResourceCard } from './ResourceCard';
import { DatedRoutineCalendar } from './routine/DatedRoutineCalendar';
import { CONTRIBUTE_FORM_URL } from '../config';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Sparkles, 
  AlertCircle, 
  Upload, 
  ExternalLink, 
  RefreshCw, 
  Calendar,
  ArrowRight,
  CheckCircle2
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

      {/* Interactive Class Routine Calendar Section (Shown when no search query is active) */}
      {!searchQuery.trim() && (
        <section aria-labelledby="catalog-routine-calendar-heading" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div>
              <h2
                id="catalog-routine-calendar-heading"
                className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>{t('routineCalendarHeading')}</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {t('routineCalendarSubtitle')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Year Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('yearLabel')}</span>
                <div className="flex gap-1 p-0.5 bg-stone-100 dark:bg-stone-800/80 rounded-xl">
                  {([1, 2, 3, 4] as AcademicYear[]).map((yr) => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setCalendarYear(yr)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        calendarYear === yr
                          ? 'bg-linear-to-r from-emerald-800 to-emerald-700 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                      }`}
                    >
                      Y{yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('semLabel')}</span>
                <div className="flex gap-1 p-0.5 bg-stone-100 dark:bg-stone-800/80 rounded-xl">
                  {[1, 2].map((sem) => (
                    <button
                      key={sem}
                      type="button"
                      onClick={() => setCalendarSemester(sem as 1 | 2)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        calendarSemester === sem
                          ? 'bg-linear-to-r from-emerald-800 to-emerald-700 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
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
        <div className="p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5 flex-wrap">
                <span>{t('searchResultsFor')}</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-800/80 text-emerald-900 dark:text-emerald-100 font-mono text-[11px]">
                  "{searchQuery}"
                </span>
                <span className="text-stone-400 font-normal">
                  ({filteredResources.length} {filteredResources.length === 1 ? t('resourceWord') : t('resourcesWord')})
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                Showing matching course materials. Click <strong>"{t('redirectDrive')}"</strong> to open cloud file or <strong>"{t('readInApp')}"</strong> for instant preview.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 transition-colors whitespace-nowrap self-end sm:self-auto shadow-xs"
          >
            {t('clearSearch')}
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 space-y-3">
              <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/3" />
              <div className="h-6 bg-stone-200 dark:bg-stone-800 rounded w-3/4" />
              <div className="h-4 bg-stone-200 dark:bg-stone-800 rounded w-1/2" />
              <div className="h-16 bg-stone-100 dark:bg-stone-800/50 rounded" />
              <div className="h-9 bg-stone-200 dark:bg-stone-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && loadError && (
        <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-red-200 dark:border-red-900/40 p-8 shadow-xs">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">
            Error Loading Archive
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6">
            {loadError}
          </p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
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
            <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-xs">
              <Upload className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-200 mb-2">
                {t('noMaterialsYet')}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6 leading-relaxed">
                {t('noMaterialsDesc')}
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={CONTRIBUTE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('contributeResource')}</span>
                </a>
                <button
                  onClick={() => navigate('/manage')}
                  className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  {t('manageArchive')}
                </button>
              </div>
            </div>
          ) : filteredResources.length === 0 ? (
            /* Filter Match Empty State */
            <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-xs">
              <AlertCircle className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">
                {t('noResourcesMatch')}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6 leading-relaxed">
                {t('noResourcesMatchDesc')}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  {t('resetAllFilters')}
                </button>
                <a
                  href={CONTRIBUTE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t('contributeResource')}</span>
                </a>
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
                  <span>
                    Showing <strong className="text-stone-800 dark:text-stone-200">{Math.min(visibleCount, filteredResources.length)}</strong> of <strong className="text-stone-800 dark:text-stone-200">{filteredResources.length}</strong> materials
                  </span>
                  {visibleCount < filteredResources.length ? (
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => Math.min(prev + 24, filteredResources.length))}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Load More Materials (+{Math.min(24, filteredResources.length - visibleCount)})</span>
                    </button>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
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
