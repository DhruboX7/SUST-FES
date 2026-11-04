import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ResourceItem, AcademicYear, AcademicSemester, ResourceCategory } from '../types';
import { SUST_FES_COURSES } from '../data/coursesData';
import { HeroSection } from './HeroSection';
import { SemesterFilter } from './SemesterFilter';
import { ResourceCard } from './ResourceCard';
import { CONTRIBUTE_FORM_URL } from '../config';
import { usePageMeta } from '../hooks/usePageMeta';
import { 
  Sparkles, 
  AlertCircle, 
  Upload, 
  ExternalLink, 
  RefreshCw, 
  Clock 
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
        const courseObj = SUST_FES_COURSES.find((c) => c.code.toLowerCase() === r.courseCode.toLowerCase());
        const shortCodeMatch = Boolean(courseObj?.shortCode && courseObj.shortCode.toLowerCase().includes(q));
        const syllabusMatch = Boolean(courseObj?.contents && courseObj.contents.some((c) => c.toLowerCase().includes(q)));

        const match =
          r.title.toLowerCase().includes(q) ||
          r.courseCode.toLowerCase().includes(q) ||
          r.courseTitle.toLowerCase().includes(q) ||
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

  // Recently Added items (latest 6 sorted by createdAt descending)
  const recentlyAdded = useMemo(() => {
    if (resources.length === 0) return [];
    return [...resources]
      .filter((r) => r.createdAt)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [resources]);

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

      {/* Recently Added Section (Shown when no search query is active) */}
      {!searchQuery.trim() && recentlyAdded.length > 0 && (
        <section aria-labelledby="recently-added-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="recently-added-heading" className="text-sm font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Recently Added to Archive</span>
            </h2>
            <span className="text-xs text-stone-400">Latest additions</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyAdded.map((res) => (
              <ResourceCard
                key={`recent-${res.id}`}
                resource={res}
                isBookmarked={bookmarks.includes(res.id)}
                onToggleBookmark={onToggleBookmark}
                onPreview={onPreview}
                onCopyLink={onCopyLink}
              />
            ))}
          </div>
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
                <span>Search results for</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-800/80 text-emerald-900 dark:text-emerald-100 font-mono text-[11px]">
                  "{searchQuery}"
                </span>
                <span className="text-stone-400 font-normal">
                  ({filteredResources.length} document{filteredResources.length === 1 ? '' : 's'} found)
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                Showing matching course materials. Click <strong>"Redirect to Drive"</strong> to open cloud file or <strong>"Read in App"</strong> for instant preview.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 transition-colors whitespace-nowrap self-end sm:self-auto shadow-xs"
          >
            Clear Search
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
                No materials yet. Be the first to contribute!
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6 leading-relaxed">
                The SUST FES Academic Resource Archive is open for student and faculty submissions. Have course slides, lecture notes, or past questions? Share them with the department.
              </p>
              <div className="flex items-center justify-center gap-3">
                <a
                  href={CONTRIBUTE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Contribute a Resource</span>
                </a>
                <button
                  onClick={() => navigate('/manage')}
                  className="px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Manage Archive
                </button>
              </div>
            </div>
          ) : filteredResources.length === 0 ? (
            /* Filter Match Empty State */
            <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-xs">
              <AlertCircle className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">
                No Resources Found Matching Filters
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6 leading-relaxed">
                No materials match this specific filter combination. You can reset filters or submit materials for this course.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
                  className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Reset All Filters
                </button>
                <a
                  href={CONTRIBUTE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Contribute Resource</span>
                </a>
              </div>
            </div>
          ) : (
            /* Resource Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredResources.map((res) => (
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
          )}
        </>
      )}

    </div>
  );
};
