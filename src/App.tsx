import React, { useState, useEffect } from 'react';
import { 
  AcademicYear, 
  AcademicSemester, 
  ResourceCategory, 
  ResourceItem, 
  ViewTab 
} from './types';
import { SUST_FES_COURSES } from './data/coursesData';
import { 
  getStoredResources, 
  saveStoredResources, 
  getStoredBookmarks, 
  toggleStoredBookmark 
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SemesterFilter } from './components/SemesterFilter';
import { ResourceCard } from './components/ResourceCard';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { AdminModal } from './components/AdminModal';
import { AdminView } from './components/AdminView';
import { ExamBankView } from './components/ExamBankView';
import { SyllabusView } from './components/SyllabusView';
import { SyllabusProgressTracker } from './components/SyllabusProgressTracker';
import { BookmarksView } from './components/BookmarksView';
import { AboutView } from './components/AboutView';
import { Footer } from './components/Footer';

import { BookOpen, AlertCircle, Sparkles, Filter, Check } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('sust_fes_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('sust_fes_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('sust_fes_theme', 'light');
    }
  }, [isDarkMode]);

  // Main Data States
  const [resources, setResources] = useState<ResourceItem[]>(() => getStoredResources());
  const [bookmarks, setBookmarks] = useState<string[]>(() => getStoredBookmarks());

  // Navigation State
  const [currentTab, setCurrentTab] = useState<ViewTab>('catalog');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<AcademicYear | 'all'>('all');
  const [selectedSemester, setSelectedSemester] = useState<AcademicSemester>('all');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>('all');
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>('all');

  // Modals & Viewer State
  const [previewResource, setPreviewResource] = useState<ResourceItem | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Bookmark Toggle
  const handleToggleBookmark = (id: string) => {
    const updated = toggleStoredBookmark(id);
    setBookmarks(updated);
  };

  // Add new resource from Admin panel
  const handleAddResource = (newRes: ResourceItem) => {
    const updated = [newRes, ...resources];
    setResources(updated);
    saveStoredResources(updated);
    showToast(`Added "${newRes.title}" to library!`);
  };

  // Update existing resource from Manage Library section
  const handleUpdateResource = (updatedRes: ResourceItem) => {
    const updated = resources.map((r) => (r.id === updatedRes.id ? updatedRes : r));
    setResources(updated);
    saveStoredResources(updated);
    showToast(`Updated "${updatedRes.title}" successfully!`);
  };

  // Delete resource
  const handleDeleteResource = (id: string) => {
    const updated = resources.filter((r) => r.id !== id);
    setResources(updated);
    saveStoredResources(updated);
    showToast('Resource removed.');
  };

  // Full Refresh / Restore from Backup
  const handleRefreshResources = (freshList: ResourceItem[]) => {
    setResources(freshList);
    saveStoredResources(freshList);
    showToast('Library archive successfully updated!');
  };

  // Copy Link to clipboard
  const handleCopyLink = (res: ResourceItem) => {
    navigator.clipboard.writeText(res.driveUrl);
    showToast('Google Drive link copied to clipboard!');
  };

  // Jump from Syllabus to Catalog for a specific course
  const handleJumpToCourse = (courseCode: string, year: AcademicYear) => {
    setSelectedYear(year);
    setSelectedCourseCode(courseCode);
    setSelectedCategory('all');
    setCurrentTab('catalog');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Filtered Courses for the dropdown
  const availableCoursesForFilter = SUST_FES_COURSES.filter((c) => {
    if (selectedYear !== 'all') {
      if (c.year !== selectedYear) return false;
    }
    if (selectedSemester !== 'all') {
      if (c.semester !== selectedSemester && c.semester !== 'both') return false;
    }
    return true;
  });

  // Filtered Resources
  const filteredResources = resources.filter((r) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const courseObj = SUST_FES_COURSES.find((c) => c.code.toLowerCase() === r.courseCode.toLowerCase());
      const shortCodeMatch = courseObj && (courseObj as any).shortCode && (courseObj as any).shortCode.toLowerCase().includes(q);
      const keywordMatch = r.keywords && r.keywords.some((k) => k.toLowerCase().includes(q));
      const pathMatch = r.path && r.path.toLowerCase().includes(q);
      const snippetMatch = r.scannedSnippet && r.scannedSnippet.toLowerCase().includes(q);
      const syllabusMatch = courseObj && (courseObj as any).contents && (courseObj as any).contents.some((c: string) => c.toLowerCase().includes(q));

      const match =
        r.title.toLowerCase().includes(q) ||
        r.courseCode.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q) ||
        shortCodeMatch ||
        keywordMatch ||
        pathMatch ||
        snippetMatch ||
        syllabusMatch ||
        (r.authorOrTeacher && r.authorOrTeacher.toLowerCase().includes(q)) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.sessionYear && r.sessionYear.includes(q));
      if (!match) return false;
    }

    // 2. Year Filter
    if (selectedYear !== 'all' && r.year !== selectedYear) {
      return false;
    }

    // 3. Semester Filter
    if (selectedSemester !== 'all' && r.semester !== selectedSemester && r.semester !== 'all') {
      return false;
    }

    // 4. Category Filter
    if (selectedCategory !== 'all' && r.category !== selectedCategory) {
      return false;
    }

    // 5. Course Code Filter
    if (selectedCourseCode !== 'all') {
      const courseObj = SUST_FES_COURSES.find((c) => c.code.toLowerCase() === selectedCourseCode.toLowerCase());
      const isDirectMatch = r.courseCode.toLowerCase() === selectedCourseCode.toLowerCase();
      const isShortMatch = courseObj && (courseObj as any).shortCode && r.courseCode.toLowerCase().includes((courseObj as any).shortCode.toLowerCase());
      if (!isDirectMatch && !isShortMatch) {
        return false;
      }
    }

    return true;
  });

  // Stats
  const totalPyqs = resources.filter((r) => r.category === 'pyq').length;
  const bookmarkedItems = resources.filter((r) => bookmarks.includes(r.id));

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      
      {/* Top Bar Contract Compliant Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        bookmarkCount={bookmarks.length}
        onOpenAdmin={() => setCurrentTab('manage')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        
        {/* TAB 1: CATALOG VIEW */}
        {currentTab === 'catalog' && (
          <div>
            {/* Department Hero Section with Search */}
            <HeroSection
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              totalResources={resources.length}
              totalCourses={SUST_FES_COURSES.length}
              totalPyqs={totalPyqs}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSwitchToExamBank={() => setCurrentTab('pyq')}
            />

            {/* Semester & Course Filter Strip */}
            <SemesterFilter
              selectedYear={selectedYear}
              onSelectYear={setSelectedYear}
              selectedSemester={selectedSemester}
              onSelectSemester={setSelectedSemester}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedCourseId={selectedCourseCode}
              onSelectCourseId={setSelectedCourseCode}
              availableCourses={availableCoursesForFilter}
              activeCount={filteredResources.length}
            />

            {/* Keyword Search & Redirect Notification Banner */}
            {searchQuery.trim() && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-950 dark:text-emerald-100 flex items-center gap-1.5 flex-wrap">
                      <span>Showing results for scanned keyword</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-200/80 dark:bg-emerald-800/80 text-emerald-900 dark:text-emerald-100 font-mono text-[11px]">
                        "{searchQuery}"
                      </span>
                      <span className="text-stone-400 font-normal">({filteredResources.length} document{filteredResources.length === 1 ? '' : 's'} found)</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                      Full directory paths and document content excerpts are shown below. Click <strong>"Redirect to Drive"</strong> on any item to open the cloud source immediately.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/50 transition-colors whitespace-nowrap self-end sm:self-auto shadow-xs"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Resources Grid or Empty State */}
            {filteredResources.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-xs">
                <AlertCircle className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">
                  No Resources Found Matching "{searchQuery}"
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mb-6 leading-relaxed">
                  No materials match this keyword or filter combination. You can reset filters, scan a different keyword, or add resources via the Manage Library section!
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedYear('all');
                      setSelectedSemester('all');
                      setSelectedCategory('all');
                      setSelectedCourseCode('all');
                    }}
                    className="px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Reset All Filters
                  </button>
                  <button
                    onClick={() => setCurrentTab('manage')}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    + Add Drive Link
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResources.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    isBookmarked={bookmarks.includes(res.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onPreview={(item) => setPreviewResource(item)}
                    onCopyLink={handleCopyLink}
                    searchQuery={searchQuery}
                    onKeywordClick={(kw) => setSearchQuery(kw)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXAM BANK (PYQs) */}
        {currentTab === 'pyq' && (
          <ExamBankView
            pyqResources={resources.filter((r) => r.category === 'pyq')}
            onPreview={(item) => setPreviewResource(item)}
            onCopyLink={handleCopyLink}
          />
        )}

        {/* TAB 3: SYLLABUS & COURSES */}
        {currentTab === 'syllabus' && (
          <SyllabusView 
            onSelectCourse={handleJumpToCourse}
            onNavigateToProgress={() => setCurrentTab('progress')}
          />
        )}

        {/* TAB: SYLLABUS PROGRESS TRACKER & DEGREE AUDIT */}
        {currentTab === 'progress' && (
          <SyllabusProgressTracker
            onJumpToCourseCatalog={(courseCode, year) => {
              setSelectedCourseCode(courseCode);
              setSelectedYear(year);
              setCurrentTab('catalog');
            }}
            onNavigateToSyllabus={() => setCurrentTab('syllabus')}
          />
        )}

        {/* TAB 4: BOOKMARKED REVISION PAPERS */}
        {currentTab === 'bookmarks' && (
          <BookmarksView
            bookmarkedResources={bookmarkedItems}
            onToggleBookmark={handleToggleBookmark}
            onPreview={(item) => setPreviewResource(item)}
            onCopyLink={handleCopyLink}
            onReturnToCatalog={() => setCurrentTab('catalog')}
          />
        )}

        {/* TAB 5: ABOUT DEPARTMENT */}
        {currentTab === 'about' && (
          <AboutView onOpenAdmin={() => setCurrentTab('manage')} />
        )}

        {/* TAB: DEDICATED ADMINISTRATION & LIBRARY MANAGEMENT */}
        {currentTab === 'manage' && (
          <AdminView
            resources={resources}
            onAddResource={handleAddResource}
            onUpdateResource={handleUpdateResource}
            onDeleteResource={handleDeleteResource}
            onRefreshResources={handleRefreshResources}
          />
        )}

      </main>

      {/* Institutional Footer */}
      <Footer
        onOpenAdmin={() => setCurrentTab('manage')}
        onSelectTab={setCurrentTab}
      />

      {/* Embedded Document Previewer Modal */}
      <DocumentViewerModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
        onCopyLink={handleCopyLink}
      />

      {/* Visual Admin / No-Code Drive Link Organizer Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        resources={resources}
        onAddResource={handleAddResource}
        onUpdateResource={handleUpdateResource}
        onDeleteResource={handleDeleteResource}
        onRefreshResources={handleRefreshResources}
      />

      {/* Feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-stone-800 dark:border-stone-200 animate-slide-up">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
