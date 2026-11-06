import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { 
  HashRouter, 
  Routes, 
  Route, 
  useNavigate 
} from 'react-router-dom';
import { ResourceItem, AcademicYear } from './types';
import { 
  getStoredResources, 
  saveStoredResources, 
  getStoredBookmarks, 
  toggleStoredBookmark 
} from './utils/storage';
import { parseGoogleDriveUrl, guessFileType } from './utils/driveParser';
import { LanguageProvider } from './contexts/LanguageContext';

import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { AdminModal } from './components/AdminModal';

import { Check, Loader2 } from 'lucide-react';

/* 
 * ROUTING NOTE:
 * We use HashRouter below to ensure flawless routing on GitHub Pages and static hosting 
 * without requiring server-side fallback rewrite rules.
 * To switch to clean path URLs on hosts that support SPA history fallback (e.g. Vercel, Netlify, Cloudflare),
 * simply replace `HashRouter` with `BrowserRouter` from 'react-router-dom'.
 */

// Code Splitting / Lazy Route Loading
const CatalogView = lazy(() => import('./components/CatalogView').then((m) => ({ default: m.CatalogView })));
const ExamBankView = lazy(() => import('./components/ExamBankView').then((m) => ({ default: m.ExamBankView })));
const SyllabusView = lazy(() => import('./components/SyllabusView').then((m) => ({ default: m.SyllabusView })));
const CoursePageView = lazy(() => import('./components/CoursePageView').then((m) => ({ default: m.CoursePageView })));
const SyllabusProgressTracker = lazy(() => import('./components/SyllabusProgressTracker').then((m) => ({ default: m.SyllabusProgressTracker })));
const BookmarksView = lazy(() => import('./components/BookmarksView').then((m) => ({ default: m.BookmarksView })));
const NoticesView = lazy(() => import('./components/NoticesView').then((m) => ({ default: m.NoticesView })));
const CgpaCalculatorView = lazy(() => import('./components/CgpaCalculatorView').then((m) => ({ default: m.CgpaCalculatorView })));
const SpeciesDatabaseView = lazy(() => import('./components/SpeciesDatabaseView').then((m) => ({ default: m.SpeciesDatabaseView })));
const FieldGalleryView = lazy(() => import('./components/FieldGalleryView').then((m) => ({ default: m.FieldGalleryView })));
const ThesisArchiveView = lazy(() => import('./components/ThesisArchiveView').then((m) => ({ default: m.ThesisArchiveView })));
const FacultyDirectoryView = lazy(() => import('./components/FacultyDirectoryView').then((m) => ({ default: m.FacultyDirectoryView })));
const AboutView = lazy(() => import('./components/AboutView').then((m) => ({ default: m.AboutView })));
const AdminView = lazy(() => import('./components/AdminView').then((m) => ({ default: m.AdminView })));
const NotFoundView = lazy(() => import('./components/NotFoundView').then((m) => ({ default: m.NotFoundView })));

function RouteLoadingFallback() {
  return (
    <div className="py-24 flex flex-col items-center justify-center space-y-3">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent animate-spin" />
      <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Loading module...</span>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();

  // Dark Mode State
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

  // Data States
  const [resources, setResources] = useState<ResourceItem[]>(() => getStoredResources());
  const [bookmarks, setBookmarks] = useState<string[]>(() => getStoredBookmarks());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modals & Viewer
  const [previewResource, setPreviewResource] = useState<ResourceItem | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch Static Resources on mount, deriving URLs at load time
  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // If local storage is already initialized, use it as the source of truth so deletions persist
      const localRaw = localStorage.getItem('sust_fes_resources_obe_v2');
      if (localRaw !== null) {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed)) {
          setResources(parsed);
          setIsLoading(false);
          return;
        }
      }

      // First time initialization from static archive
      const res = await fetch('/data/resources.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rawData = await res.json();
      
      const parsedItems: ResourceItem[] = Array.isArray(rawData) ? rawData.map((item: any) => {
        const parsed = parseGoogleDriveUrl(item.driveUrl || '');
        const fileType = guessFileType(item.driveUrl || '', item.category, parsed.fileType);
        return {
          ...item,
          fileId: parsed.fileId || item.fileId || '',
          fileType,
          previewUrl: parsed.previewUrl || item.driveUrl,
          downloadUrl: parsed.downloadUrl || item.driveUrl,
        };
      }) : [];

      setResources(parsedItems);
      saveStoredResources(parsedItems);
    } catch (err) {
      console.error('Failed to load static resources, falling back to local storage:', err);
      const fallback = getStoredResources();
      setResources(fallback);
      if (fallback.length === 0) {
        setLoadError('Unable to load materials from the archive. Please check your network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Bookmark Toggle
  const handleToggleBookmark = (id: string) => {
    const updated = toggleStoredBookmark(id);
    setBookmarks(updated);
  };

  // Admin Data Handlers
  const handleAddResource = (newRes: ResourceItem) => {
    const updated = [newRes, ...resources];
    setResources(updated);
    saveStoredResources(updated);
    showToast(`Added "${newRes.title}" to library!`);
  };

  const handleUpdateResource = (updatedRes: ResourceItem) => {
    const updated = resources.map((r) => (r.id === updatedRes.id ? updatedRes : r));
    setResources(updated);
    saveStoredResources(updated);
    showToast(`Updated "${updatedRes.title}" successfully!`);
  };

  const handleDeleteResource = (id: string) => {
    const updated = resources.filter((r) => r.id !== id);
    setResources(updated);
    saveStoredResources(updated);
    showToast('Resource removed.');
  };

  const handleRefreshResources = (freshList: ResourceItem[]) => {
    setResources(freshList);
    saveStoredResources(freshList);
    showToast('Library archive successfully updated!');
  };

  const handleCopyLink = (res: ResourceItem) => {
    navigator.clipboard.writeText(res.driveUrl);
    showToast('Google Drive link copied to clipboard!');
  };

  // Jump from Syllabus to Course Page
  const handleSelectCourse = (courseCode: string, _year: AcademicYear) => {
    navigate(`/courses/${encodeURIComponent(courseCode.replace(/\s+/g, '-'))}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors">
      
      {/* Accessible Skip-to-Content Link for Screen Readers & Keyboard Navigation */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-800 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-white text-xs font-bold"
      >
        Skip to main content
      </a>

      {/* Primary Top Header */}
      <Navbar
        bookmarkCount={bookmarks.length}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Content Area with Lazy Loaded Routes */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 outline-hidden">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* 1. Main Catalog Route */}
            <Route 
              path="/" 
              element={
                <CatalogView
                  resources={resources}
                  bookmarks={bookmarks}
                  isLoading={isLoading}
                  loadError={loadError}
                  onRefresh={fetchResources}
                  onToggleBookmark={handleToggleBookmark}
                  onPreview={(item) => setPreviewResource(item)}
                  onCopyLink={handleCopyLink}
                />
              } 
            />

            {/* 2. Exam Bank (PYQs) */}
            <Route 
              path="/pyq" 
              element={
                <ExamBankView
                  pyqResources={resources.filter((r) => r.category === 'pyq')}
                  onPreview={(item) => setPreviewResource(item)}
                  onCopyLink={handleCopyLink}
                />
              } 
            />

            {/* 3. Syllabus & Course Outlines */}
            <Route 
              path="/syllabus" 
              element={
                <SyllabusView
                  onSelectCourse={handleSelectCourse}
                  onNavigateToProgress={() => navigate('/progress')}
                />
              } 
            />

            {/* 4. Dedicated Per-Course Page */}
            <Route 
              path="/courses/:code" 
              element={
                <CoursePageView
                  resources={resources}
                  bookmarks={bookmarks}
                  onToggleBookmark={handleToggleBookmark}
                  onPreview={(item) => setPreviewResource(item)}
                  onCopyLink={handleCopyLink}
                />
              } 
            />

            {/* 5. Syllabus Progress Tracker */}
            <Route 
              path="/progress" 
              element={
                <SyllabusProgressTracker
                  onJumpToCourseCatalog={(courseCode) => {
                    navigate(`/courses/${encodeURIComponent(courseCode.replace(/\s+/g, '-'))}`);
                  }}
                  onNavigateToSyllabus={() => navigate('/syllabus')}
                />
              } 
            />

            {/* 6. Bookmarked Saved Papers */}
            <Route 
              path="/bookmarks" 
              element={
                <BookmarksView
                  bookmarkedResources={resources.filter((r) => bookmarks.includes(r.id))}
                  onToggleBookmark={handleToggleBookmark}
                  onPreview={(item) => setPreviewResource(item)}
                  onCopyLink={handleCopyLink}
                  onReturnToCatalog={() => navigate('/')}
                />
              } 
            />

            {/* 7. Notices & Class Routine */}
            <Route path="/notices" element={<NoticesView />} />

            {/* 8. CGPA & Academic Tools */}
            <Route path="/tools/cgpa" element={<CgpaCalculatorView />} />

            {/* 9. Tree Species Database */}
            <Route path="/species" element={<SpeciesDatabaseView />} />

            {/* 10. Field Excursion & Research Gallery */}
            <Route path="/gallery" element={<FieldGalleryView />} />

            {/* 11. Theses & Graduate Dissertations */}
            <Route path="/theses" element={<ThesisArchiveView />} />

            {/* 12. Faculty Directory */}
            <Route path="/faculty" element={<FacultyDirectoryView />} />

            {/* 13. About FES Department */}
            <Route path="/about" element={<AboutView />} />

            {/* 14. In-Browser Administration */}
            <Route 
              path="/manage" 
              element={
                <AdminView
                  resources={resources}
                  onAddResource={handleAddResource}
                  onUpdateResource={handleUpdateResource}
                  onDeleteResource={handleDeleteResource}
                  onRefreshResources={handleRefreshResources}
                />
              } 
            />

            {/* 15. Friendly 404 Route */}
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </Suspense>
      </main>

      {/* Institutional Footer */}
      <Footer />

      {/* Embedded Document Previewer Modal */}
      <DocumentViewerModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
        onCopyLink={handleCopyLink}
      />

      {/* Visual Admin Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        resources={resources}
        onAddResource={handleAddResource}
        onUpdateResource={handleUpdateResource}
        onDeleteResource={handleDeleteResource}
        onRefreshResources={handleRefreshResources}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-stone-800 dark:border-stone-200 animate-slide-up"
        >
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </LanguageProvider>
  );
}
