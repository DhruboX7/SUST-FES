import React, { useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
import { 
  HashRouter, 
  Routes, 
  Route, 
  useNavigate,
  useLocation
} from 'react-router-dom';
import { ResourceItem, AcademicYear } from './types';
import { 
  getStoredResources, 
  saveStoredResources, 
  getStoredBookmarks, 
  toggleStoredBookmark,
  fetchStaticJson 
} from './utils/storage';
import { parseGoogleDriveUrl, guessFileType } from './utils/driveParser';
import { LanguageProvider } from './contexts/LanguageContext';

import { Navbar } from './components/Navbar';
import { RecentNoticesBar } from './components/RecentNoticesBar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

import { Check } from 'lucide-react';

function lazyWithRetry<T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importer();
    } catch (firstErr) {
      await new Promise((r) => setTimeout(r, 250));
      return await importer().catch(() => {
        throw firstErr;
      });
    }
  });
}

// Code Splitting / Lazy Route Loading
const DocumentViewerModal = lazyWithRetry(() => import('./components/DocumentViewerModal').then((m) => ({ default: m.DocumentViewerModal })));
const AdminModal = lazyWithRetry(() => import('./components/AdminModal').then((m) => ({ default: m.AdminModal })));

// Code Splitting / Lazy Route Loading
const CatalogView = lazyWithRetry(() => import('./components/CatalogView').then((m) => ({ default: m.CatalogView })));
const ExamBankView = lazyWithRetry(() => import('./components/ExamBankView').then((m) => ({ default: m.ExamBankView })));
const SyllabusView = lazyWithRetry(() => import('./components/SyllabusView').then((m) => ({ default: m.SyllabusView })));
const CoursePageView = lazyWithRetry(() => import('./components/CoursePageView').then((m) => ({ default: m.CoursePageView })));
const SyllabusProgressTracker = lazyWithRetry(() => import('./components/SyllabusProgressTracker').then((m) => ({ default: m.SyllabusProgressTracker })));
const BookmarksView = lazyWithRetry(() => import('./components/BookmarksView').then((m) => ({ default: m.BookmarksView })));
const NoticesView = lazyWithRetry(() => import('./components/NoticesView').then((m) => ({ default: m.NoticesView })));
const CgpaCalculatorView = lazyWithRetry(() => import('./components/CgpaCalculatorView').then((m) => ({ default: m.CgpaCalculatorView })));
const SpeciesDatabaseView = lazyWithRetry(() => import('./components/SpeciesDatabaseView').then((m) => ({ default: m.SpeciesDatabaseView })));
const FieldGalleryView = lazyWithRetry(() => import('./components/FieldGalleryView').then((m) => ({ default: m.FieldGalleryView })));
const ThesisArchiveView = lazyWithRetry(() => import('./components/ThesisArchiveView').then((m) => ({ default: m.ThesisArchiveView })));
const FacultyDirectoryView = lazyWithRetry(() => import('./components/FacultyDirectoryView').then((m) => ({ default: m.FacultyDirectoryView })));
const AboutView = lazyWithRetry(() => import('./components/AboutView').then((m) => ({ default: m.AboutView })));
const AdminView = lazyWithRetry(() => import('./components/AdminView').then((m) => ({ default: m.AdminView })));
const NotFoundView = lazyWithRetry(() => import('./components/NotFoundView').then((m) => ({ default: m.NotFoundView })));

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
  const location = useLocation();

  // Backward compatibility: automatically migrate any old /#/path URLs to clean path URLs
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.startsWith('#/')) {
      const cleanPath = window.location.hash.substring(1);
      navigate(cleanPath, { replace: true });
    }
  }, [navigate]);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTheme = localStorage.getItem('sust_fes_theme');
        if (savedTheme) return savedTheme === 'dark';
      } catch {
        // Ignore storage errors
      }
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('sust_fes_theme', isDarkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
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
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 3000);
  };

  // Fetch Static Resources on mount, deriving URLs at load time
  const fetchResources = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      // If local storage is already initialized, use it as the source of truth so deletions persist
      let localRaw: string | null = null;
      try {
        localRaw = localStorage.getItem('sust_fes_resources_obe_v2');
      } catch {
        localRaw = null;
      }
      if (localRaw !== null) {
        const parsed = JSON.parse(localRaw);
        if (Array.isArray(parsed)) {
          setResources(parsed.filter((item): item is ResourceItem => Boolean(item && typeof item === 'object')));
          setIsLoading(false);
          return;
        }
      }

      // First time initialization from static archive
      const rawData = await fetchStaticJson<any[]>('resources.json');
      if (!rawData) {
        throw new Error('Static resources unavailable, using fallback storage');
      }
      
      const parsedItems: ResourceItem[] = Array.isArray(rawData)
        ? rawData
            .filter((item): item is Record<string, any> => Boolean(item && typeof item === 'object'))
            .map((item) => {
              const parsed = parseGoogleDriveUrl(item.driveUrl || '');
              const fileType = guessFileType(item.driveUrl || '', item.category, parsed.fileType);
              return {
                ...item,
                fileId: parsed.fileId || item.fileId || '',
                fileType,
                previewUrl: parsed.previewUrl || item.driveUrl,
                downloadUrl: parsed.downloadUrl || item.driveUrl,
              } as ResourceItem;
            })
        : [];

      setResources(parsedItems);
      saveStoredResources(parsedItems);
    } catch (err) {
      console.warn('Failed to load static resources, falling back to local storage:', err);
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
    if (!res?.driveUrl) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(res.driveUrl)
        .then(() => showToast('Google Drive link copied to clipboard!'))
        .catch(() => showToast('Copy blocked by browser permissions. Open link directly instead.'));
    } else {
      showToast('Clipboard unavailable in this browser context.');
    }
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

      {/* Recent / Latest Notices Title Bar */}
      <RecentNoticesBar />

      {/* Main Content Area with Lazy Loaded Routes */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 outline-hidden">
        <ErrorBoundary resetKey={location.pathname} compact>
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
                    pyqResources={resources.filter((r) => r && r.category === 'pyq')}
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
                    bookmarkedResources={resources.filter((r) => r && bookmarks.includes(r.id))}
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
        </ErrorBoundary>
      </main>

      {/* Institutional Footer */}
      <Footer />

      {/* Embedded Document Previewer Modal */}
      {previewResource && (
        <Suspense fallback={null}>
          <DocumentViewerModal
            resource={previewResource}
            onClose={() => setPreviewResource(null)}
            onCopyLink={handleCopyLink}
          />
        </Suspense>
      )}

      {/* Visual Admin Modal */}
      {isAdminModalOpen && (
        <Suspense fallback={null}>
          <AdminModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            resources={resources}
            onAddResource={handleAddResource}
            onUpdateResource={handleUpdateResource}
            onDeleteResource={handleDeleteResource}
            onRefreshResources={handleRefreshResources}
          />
        </Suspense>
      )}

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
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </HashRouter>
    </LanguageProvider>
  );
}
