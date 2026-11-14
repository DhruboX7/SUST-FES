import React, { useState, useEffect, Suspense, lazy } from 'react';
import { 
  ResourceItem, 
  TreeSpecies, 
  GalleryItem, 
  ThesisItem, 
  NoticeItem, 
  QuickLinkItem,
  StudentPhotoItem 
} from '../types';
import { 
  verifyAdminPin, 
  getStoredSpecies, 
  saveStoredSpecies, 
  getStoredGallery, 
  saveStoredGallery, 
  getStoredTheses, 
  saveStoredTheses, 
  getStoredNotices, 
  saveStoredNotices, 
  getStoredQuickLinks, 
  saveStoredQuickLinks,
  getStoredResources,
  getStoredStudentPhotos
} from '../utils/storage';
import { usePageMeta } from '../hooks/usePageMeta';
import { ErrorBoundary } from './ErrorBoundary';

// Lazy Sub-panels to avoid loading all 9 admin modules & datasets upfront
const AdminExamBankPanel = lazy(() => import('./admin/AdminExamBankPanel').then((m) => ({ default: m.AdminExamBankPanel })));
const AdminLinksPanel = lazy(() => import('./admin/AdminLinksPanel').then((m) => ({ default: m.AdminLinksPanel })));
const AdminSpeciesPanel = lazy(() => import('./admin/AdminSpeciesPanel').then((m) => ({ default: m.AdminSpeciesPanel })));
const AdminGalleryPanel = lazy(() => import('./admin/AdminGalleryPanel').then((m) => ({ default: m.AdminGalleryPanel })));
const AdminStudentPhotosPanel = lazy(() => import('./admin/AdminStudentPhotosPanel').then((m) => ({ default: m.AdminStudentPhotosPanel })));
const AdminThesesPanel = lazy(() => import('./admin/AdminThesesPanel').then((m) => ({ default: m.AdminThesesPanel })));
const AdminNoticesPanel = lazy(() => import('./admin/AdminNoticesPanel').then((m) => ({ default: m.AdminNoticesPanel })));
const AdminRoutinePanel = lazy(() => import('./admin/AdminRoutinePanel').then((m) => ({ default: m.AdminRoutinePanel })));
const AdminMasterBackupPanel = lazy(() => import('./admin/AdminMasterBackupPanel').then((m) => ({ default: m.AdminMasterBackupPanel })));

import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileText, 
  Link2, 
  Trees, 
  Image as ImageIcon, 
  Camera,
  BookMarked, 
  Bell, 
  Database,
  Calendar,
  Sparkles,
  ArrowRight,
  LogOut,
  AlertCircle
} from 'lucide-react';

interface AdminViewProps {
  resources: ResourceItem[];
  onAddResource: (resource: ResourceItem) => void;
  onUpdateResource: (resource: ResourceItem) => void;
  onDeleteResource: (id: string) => void;
  onRefreshResources: (resources: ResourceItem[]) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  resources,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  onRefreshResources,
}) => {
  usePageMeta({
    title: 'Department Admin Console · FES SUST Library',
    description: 'Master administrative suite for academic materials, exam questions, botanical flora, field galleries, monographs, and notice circulars.',
  });

  // Authentication State (guarded against restricted iframe sessionStorage)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.sessionStorage?.getItem('sust_fes_admin_session_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Active Management Tab
  const [activeTab, setActiveTab] = useState<
    'pyq' | 'links' | 'species' | 'gallery' | 'studentPhotos' | 'theses' | 'notices' | 'routine' | 'backup'
  >('pyq');

  // Multi-collection data stores
  const [species, setSpecies] = useState<TreeSpecies[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [studentPhotos, setStudentPhotos] = useState<StudentPhotoItem[]>([]);
  const [theses, setTheses] = useState<ThesisItem[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [quickLinks, setQuickLinks] = useState<QuickLinkItem[]>([]);

  // Load all collection stores (deferred until authenticated to save memory & bandwidth)
  const loadAllCollections = async (isMountedCheck?: () => boolean) => {
    try {
      const [spData, galData, stuData, thData, notData] = await Promise.all([
        getStoredSpecies(),
        getStoredGallery(),
        getStoredStudentPhotos(),
        getStoredTheses(),
        getStoredNotices(),
      ]);
      if (isMountedCheck && !isMountedCheck()) return;
      setSpecies(Array.isArray(spData) ? spData.filter(Boolean) : []);
      setGallery(Array.isArray(galData) ? galData.filter(Boolean) : []);
      setStudentPhotos(Array.isArray(stuData) ? stuData.filter(Boolean) : []);
      setTheses(Array.isArray(thData) ? thData.filter(Boolean) : []);
      setNotices(Array.isArray(notData) ? notData.filter(Boolean) : []);
      const linksData = getStoredQuickLinks();
      setQuickLinks(Array.isArray(linksData) ? linksData.filter(Boolean) : []);
    } catch (err) {
      console.error('Failed to load collections in AdminView:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    const check = () => isMounted;
    loadAllCollections(check);

    const handleUpdate = (e: Event) => {
      const collection = (e as CustomEvent<{ collection?: string }>).detail?.collection;
      if (!isMounted) return;

      if (!collection || collection === 'all') {
        loadAllCollections(check);
      } else if (collection === 'species') {
        getStoredSpecies().then((d) => isMounted && setSpecies(Array.isArray(d) ? d.filter(Boolean) : [])).catch(() => {});
      } else if (collection === 'gallery') {
        getStoredGallery().then((d) => isMounted && setGallery(Array.isArray(d) ? d.filter(Boolean) : [])).catch(() => {});
      } else if (collection === 'student_photos') {
        getStoredStudentPhotos().then((d) => isMounted && setStudentPhotos(Array.isArray(d) ? d.filter(Boolean) : [])).catch(() => {});
      } else if (collection === 'theses') {
        getStoredTheses().then((d) => isMounted && setTheses(Array.isArray(d) ? d.filter(Boolean) : [])).catch(() => {});
      } else if (collection === 'notices') {
        getStoredNotices().then((d) => isMounted && setNotices(Array.isArray(d) ? d.filter(Boolean) : [])).catch(() => {});
      } else if (collection === 'links') {
        const linksData = getStoredQuickLinks();
        setQuickLinks(Array.isArray(linksData) ? linksData.filter(Boolean) : []);
      }
    };

    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('sust_fes_data_updated', handleUpdate);
    };
  }, [isAuthenticated]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      try {
        window.sessionStorage?.setItem('sust_fes_admin_session_unlocked', 'true');
      } catch {
        // Ignore restricted sessionStorage errors
      }
      setIsAuthenticated(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Incorrect Admin Passcode. Default passcode is sustfes.');
    }
  };

  const handleLockSession = () => {
    try {
      window.sessionStorage?.removeItem('sust_fes_admin_session_unlocked');
    } catch {
      // Ignore restricted sessionStorage errors
    }
    setIsAuthenticated(false);
  };

  // Safe derived counts
  const safeResources = Array.isArray(resources) ? resources.filter((r): r is ResourceItem => Boolean(r && typeof r === 'object')) : [];
  const pyqCount = safeResources.filter((r) => r.category === 'pyq').length;
  const pendingPhotoCount = studentPhotos.filter((p) => p && p.status === 'pending').length;
  const totalTreePhotos = species.reduce(
    (acc, s) => acc + (s?.imageUrl ? 1 : 0) + (Array.isArray(s?.morePhotos) ? s.morePhotos.length : 0),
    0
  );

  // 1. PIN UNLOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="py-12 sm:py-20 flex items-center justify-center animate-fade-in">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              FES Master Admin Suite
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 leading-relaxed">
              Enter the administrative passcode to manage study resources, past exam questions, tree species, gallery albums, theses, and notices.
            </p>
          </div>

          {pinError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Enter Admin PIN..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono text-center tracking-widest text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 text-sm"
            >
              <span>Unlock Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-[11px] text-stone-400">
            Default passcode: <code className="font-mono text-emerald-700 dark:text-emerald-400 bg-stone-100 dark:bg-stone-800 px-1 py-0.5 rounded">sustfes</code>
          </div>
        </div>
      </div>
    );
  }

  // 2. UNLOCKED ADMIN MASTER CONSOLE
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Console Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
                Department Administrative Suite
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Unlocked
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Department of Forestry and Environmental Science · Shahjalal University of Science and Technology
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLockSession}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center gap-1.5 transition-colors"
            title="Lock current session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Session</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs with Live Badges */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-1.5 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
        {/* 1. Exam Questions (PYQ) */}
        <button
          onClick={() => setActiveTab('pyq')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'pyq'
              ? 'bg-emerald-800 text-white font-bold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Exam Bank (PYQs)</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 dark:bg-white/20">
            {pyqCount}
          </span>
        </button>

        {/* 2. Links & Resources */}
        <button
          onClick={() => setActiveTab('links')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'links'
              ? 'bg-emerald-800 text-white font-bold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Link Management</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 dark:bg-white/20">
            {quickLinks.length}
          </span>
        </button>

        {/* 3. Tree Species & Photo Management */}
        <button
          onClick={() => setActiveTab('species')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'species'
              ? 'bg-emerald-800 text-white font-bold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Trees className="w-3.5 h-3.5" />
          <span>Tree Species & Photos</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 dark:bg-white/20">
            {species.length} ({totalTreePhotos} photos)
          </span>
        </button>

        {/* 4. Gallery */}
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'gallery'
              ? 'bg-emerald-800 text-white font-bold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Field Gallery</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 dark:bg-white/20">
            {gallery.length}
          </span>
        </button>

        {/* 4.5 Student Photos Option */}
        <button
          onClick={() => setActiveTab('studentPhotos')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'studentPhotos'
              ? 'bg-emerald-800 text-white font-bold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Student Photos</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 dark:bg-white/20">
            {studentPhotos.length}
          </span>
          {pendingPhotoCount > 0 && (
            <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-amber-500 text-stone-950 animate-pulse">
              {pendingPhotoCount} new
            </span>
          )}
        </button>

        {/* 5. Theses */}
        <button
          onClick={() => setActiveTab('theses')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'theses'
              ? 'bg-emerald-800 text-white font-bold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>Thesis Archive</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 dark:bg-white/20">
            {theses.length}
          </span>
        </button>

        {/* 6. Notice Board */}
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'notices'
              ? 'bg-emerald-800 text-white font-bold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notice Board</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 dark:bg-white/20">
            {notices.length}
          </span>
        </button>

        {/* 6.5. Class Routine (AI Automation) */}
        <button
          onClick={() => setActiveTab('routine')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'routine'
              ? 'bg-emerald-800 text-white font-bold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Class Routine</span>
          <span className="flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI</span>
          </span>
        </button>

        {/* 7. Master Backup & System */}
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ml-auto ${
            activeTab === 'backup'
              ? 'bg-stone-800 text-white font-bold shadow-xs'
              : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Master Backup & Power Tools</span>
        </button>
      </div>

      {/* Render Active Sub-Panel inside Tab-Scoped ErrorBoundary & Suspense */}
      <ErrorBoundary resetKey={activeTab} compact>
        <Suspense
          fallback={
            <div className="py-16 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <div className="w-7 h-7 rounded-full border-2 border-emerald-600 dark:border-emerald-400 border-t-transparent animate-spin" />
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                Loading management panel...
              </span>
            </div>
          }
        >
          {activeTab === 'pyq' && (
            <AdminExamBankPanel
              resources={safeResources}
              onAddResource={onAddResource}
              onUpdateResource={onUpdateResource}
              onDeleteResource={onDeleteResource}
            />
          )}

          {activeTab === 'links' && (
            <AdminLinksPanel
              resources={safeResources}
              quickLinks={quickLinks}
              onUpdateResource={onUpdateResource}
              onUpdateQuickLinks={(links) => {
                setQuickLinks(links);
                saveStoredQuickLinks(links);
              }}
            />
          )}

          {activeTab === 'species' && (
            <AdminSpeciesPanel
              species={species}
              onUpdateSpecies={(newSpecies) => {
                setSpecies(newSpecies);
                saveStoredSpecies(newSpecies);
              }}
            />
          )}

          {activeTab === 'gallery' && (
            <AdminGalleryPanel
              gallery={gallery}
              onUpdateGallery={(newGallery) => {
                setGallery(newGallery);
                saveStoredGallery(newGallery);
              }}
            />
          )}

          {activeTab === 'studentPhotos' && (
            <AdminStudentPhotosPanel />
          )}

          {activeTab === 'theses' && (
            <AdminThesesPanel
              theses={theses}
              onUpdateTheses={(newTheses) => {
                setTheses(newTheses);
                saveStoredTheses(newTheses);
              }}
            />
          )}

          {activeTab === 'notices' && (
            <AdminNoticesPanel
              notices={notices}
              onUpdateNotices={(newNotices) => {
                setNotices(newNotices);
                saveStoredNotices(newNotices);
              }}
            />
          )}

          {activeTab === 'routine' && (
            <AdminRoutinePanel />
          )}

          {activeTab === 'backup' && (
            <AdminMasterBackupPanel
              stats={{
                resources: safeResources.length,
                pyqs: pyqCount,
                species: species.length,
                gallery: gallery.length,
                studentPhotos: studentPhotos.length,
                theses: theses.length,
                notices: notices.length,
                links: quickLinks.length,
              }}
              onRefreshAll={() => {
                loadAllCollections();
                const freshRes = getStoredResources();
                onRefreshResources(freshRes);
              }}
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};
