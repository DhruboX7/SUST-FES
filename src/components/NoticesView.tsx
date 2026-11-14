import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { 
  Bell, 
  Calendar, 
  Pin, 
  ExternalLink, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Layers,
  AlertCircle,
  Image as ImageIcon,
  ZoomIn,
  FileText,
  X,
  Tag
} from 'lucide-react';
import { AcademicYear, NoticeItem, NoticeTypeDefinition, YearRoutine, RoutineSlot } from '../types';
import { getStoredNotices, getStoredNoticeTypes, getStoredRoutines, DEFAULT_NOTICE_TYPES } from '../utils/storage';
import { getNoticeColorStyle, resolveNoticeTagDefinitions, sortNoticesByPriority } from '../utils/noticeUtils';
import { getOptimizedImageUrl, handleImageError } from '../utils/imageUtils';
import { DatedRoutineCalendar } from './routine/DatedRoutineCalendar';

export const NoticesView: React.FC = () => {
  usePageMeta({
    title: 'Notices & Class Routine',
    description: 'Official departmental notices, exam announcements, and semester class routines for Forestry and Environmental Science, SUST.',
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'notices' | 'routine'>(() => {
    return tabParam === 'routine' ? 'routine' : 'notices';
  });

  useEffect(() => {
    if (tabParam === 'routine' || tabParam === 'notices') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'notices' | 'routine') => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    }, { replace: true });
  };
  const [routineViewMode, setRoutineViewMode] = useState<'calendar' | 'matrix'>('calendar');
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [noticeTypes, setNoticeTypes] = useState<NoticeTypeDefinition[]>(() => {
    try {
      return getStoredNoticeTypes();
    } catch {
      return DEFAULT_NOTICE_TYPES;
    }
  });
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [routines, setRoutines] = useState<YearRoutine[]>([]);
  const [selectedYear, setSelectedYear] = useState<AcademicYear>(1);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(true);

  const focusedNoticeId = searchParams.get('notice');

  const loadData = async (isMountedCheck?: () => boolean) => {
    setIsLoading(true);
    try {
      const [nData, rData] = await Promise.all([
        getStoredNotices().catch(() => []),
        getStoredRoutines().catch(() => []),
      ]);
      if (isMountedCheck && !isMountedCheck()) return;
      setNotices(nData);
      setRoutines(rData);
      setNoticeTypes(getStoredNoticeTypes());
    } catch (err) {
      console.error('Failed to load notices or routines:', err);
    } finally {
      if (!isMountedCheck || isMountedCheck()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadData(() => isMounted);

    const handleUpdate = (e: Event) => {
      const collection = (e as CustomEvent<{ collection?: string }>).detail?.collection;
      if (!isMounted) return;
      if (!collection || collection === 'notices' || collection === 'all') {
        setNoticeTypes(getStoredNoticeTypes());
        getStoredNotices().then((data) => isMounted && setNotices(data)).catch(() => {});
      }
      if (!collection || collection === 'routines' || collection === 'all') {
        getStoredRoutines().then((data) => isMounted && setRoutines(data)).catch(() => {});
      }
    };

    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('sust_fes_data_updated', handleUpdate);
    };
  }, []);

  // Scroll smoothly to focused notice when navigated from the RecentNoticesBar
  useEffect(() => {
    if (!focusedNoticeId || isLoading) return;
    setActiveTab('notices');
    setSelectedTypeFilter('all');
    const timer = setTimeout(() => {
      const el = document.getElementById(`notice-card-${focusedNoticeId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [focusedNoticeId, isLoading]);

  // Lightbox State for Notice Circular Images
  const [selectedNoticeImage, setSelectedNoticeImage] = useState<{ url: string; title: string } | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedNoticeImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sort notices: pinned & important first, then by date descending
  const sortedNotices = sortNoticesByPriority(notices);

  const filteredNotices = selectedTypeFilter === 'all'
    ? sortedNotices
    : sortedNotices.filter((n) =>
        Array.isArray(n.tags) &&
        n.tags.some((t) => typeof t === 'string' && t.toLowerCase() === selectedTypeFilter.toLowerCase())
      );

  const currentRoutine = routines.find(
    (r) => r.year === Number(selectedYear) && r.semester === selectedSemester
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-stone-900 rounded-2xl p-6 sm:p-8 text-white border border-emerald-800/40 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Bell className="w-4 h-4" />
            <span>FES SUST Departmental Bulletin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Notices & Class Routine
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Stay informed on upcoming semester exams, field tours, thesis submissions, official circular scans, and weekly class schedules.
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-3">
        <button
          onClick={() => handleTabChange('notices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'notices'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:text-stone-900'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Department Notices</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-700/60 text-white">
            {notices.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('routine')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'routine'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:text-stone-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Weekly Class Routine</span>
        </button>
      </div>

      {/* NOTICES LIST */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          {/* Type Filter Strip */}
          {noticeTypes.length > 0 && sortedNotices.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 px-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Filter:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedTypeFilter === 'all'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
              >
                All ({sortedNotices.length})
              </button>
              {noticeTypes.map((typeDef) => {
                const count = sortedNotices.filter(
                  (n) => Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase() === typeDef.id.toLowerCase())
                ).length;
                const isSelected = selectedTypeFilter.toLowerCase() === typeDef.id.toLowerCase();
                const style = getNoticeColorStyle(typeDef.color);
                return (
                  <button
                    key={typeDef.id}
                    type="button"
                    onClick={() => setSelectedTypeFilter(isSelected ? 'all' : typeDef.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? `${style.solidBadge} shadow-xs`
                        : `${style.badge} opacity-85 hover:opacity-100`
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : style.dot}`} />
                    <span>{typeDef.label}</span>
                    <span className="font-mono text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {filteredNotices.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-xs">
              <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                {selectedTypeFilter === 'all'
                  ? 'No active announcements'
                  : 'No notices match this tag filter'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                {selectedTypeFilter === 'all'
                  ? 'There are no published departmental notices at this time. Check back soon.'
                  : 'Try switching back to All to inspect every published notice.'}
              </p>
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const tags = resolveNoticeTagDefinitions(notice, noticeTypes);
              const isFocused = focusedNoticeId === notice.id;

              return (
              <div
                id={`notice-card-${notice.id}`}
                key={notice.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  isFocused
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/25'
                    : notice.pinned
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-xs ring-1 ring-emerald-500/10'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 shadow-xs'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.pinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-800 text-white uppercase tracking-wider shadow-xs">
                        <Pin className="w-3 h-3" />
                        <span>Pinned Notice</span>
                      </span>
                    )}
                    {tags.map((tag) => {
                      const style = getNoticeColorStyle(tag.color);
                      return (
                        <span
                          key={tag.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${style.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          <span>{tag.label}</span>
                        </span>
                      );
                    })}
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                      {notice.date}
                    </span>
                  </div>

                  {/* Attachment Document Link in header if present */}
                  {(notice.attachmentUrl || notice.link) && (
                    <a
                      href={notice.attachmentUrl || notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5 font-semibold shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{notice.attachmentUrl?.endsWith('.pdf') ? 'Download PDF' : 'Attachment Link'}</span>
                    </a>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 mb-2 leading-snug">
                  {notice.title}
                </h3>

                {/* Body Text */}
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line mb-4">
                  {notice.body}
                </p>

                {/* INLINE CIRCULAR IMAGE PREVIEW */}
                {notice.imageUrl && (
                  <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>Official Notice Circular Scan / Attached Image</span>
                    </div>

                    <div 
                      onClick={() => setSelectedNoticeImage({ url: notice.imageUrl!, title: notice.title })}
                      className="relative group cursor-pointer max-w-md rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-950 shadow-xs hover:border-emerald-500 transition-all"
                      title="Click to expand circular in full-screen zoom view"
                    >
                      <img
                        src={getOptimizedImageUrl(notice.imageUrl, 640)}
                        alt={`Circular scan for ${notice.title}`}
                        loading="lazy"
                        decoding="async"
                        onError={handleImageError}
                        className="w-full max-h-72 object-contain bg-stone-900/5 dark:bg-black/40 group-hover:scale-102 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold">
                        <ZoomIn className="w-5 h-5" />
                        <span>Click to Enlarge / Full-Screen Zoom</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* FOOTER ACTIONS: DOCUMENT DOWNLOADS */}
                {(notice.attachmentUrl || notice.link) && (
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center gap-3">
                    <a
                      href={notice.attachmentUrl || notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>
                        {notice.attachmentUrl?.includes('.pdf')
                          ? 'Download Official Circular Document (PDF)'
                          : 'View Official Circular Attachment'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  </div>
                )}
              </div>
            );
            })
          )}
        </div>
      )}

      {/* FULL-SCREEN IMAGE LIGHTBOX MODAL */}
      {selectedNoticeImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedNoticeImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950 text-white shrink-0">
              <div className="flex items-center gap-2 truncate pr-4">
                <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-xs sm:text-sm truncate">
                  {selectedNoticeImage.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedNoticeImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Open full resolution in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Original</span>
                </a>
                <button
                  onClick={() => setSelectedNoticeImage(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                  aria-label="Close image viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Viewport */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black/60">
              <img
                src={selectedNoticeImage.url}
                alt={selectedNoticeImage.title}
                onError={handleImageError}
                decoding="async"
                className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Lightbox Footer */}
            <div className="p-2.5 bg-stone-950 border-t border-stone-800 text-center text-[11px] text-stone-400 font-mono">
              Press Escape or click outside to close viewer
            </div>
          </div>
        </div>
      )}

      {/* ROUTINE TABLE */}
      {activeTab === 'routine' && (
        <div className="space-y-4">
          
          {/* Year, Semester & View Mode Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Year Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Year:</span>
                <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl">
                  {([1, 2, 3, 4] as AcademicYear[]).map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedYear === yr
                          ? 'bg-linear-to-r from-emerald-800 to-emerald-700 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                      }`}
                    >
                      Year {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Semester:</span>
                <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl">
                  {[1, 2].map((sem) => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem as 1 | 2)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        selectedSemester === sem
                          ? 'bg-linear-to-r from-emerald-800 to-emerald-700 text-white shadow-xs'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                      }`}
                    >
                      Sem {sem}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar vs. Timetable Grid View Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl border border-stone-200 dark:border-stone-700/60 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setRoutineViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  routineViewMode === 'calendar'
                    ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/30'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Dated Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setRoutineViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  routineViewMode === 'matrix'
                    ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs ring-1 ring-emerald-500/30'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Weekly Grid</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: DATED CALENDAR */}
          {routineViewMode === 'calendar' && (
            <DatedRoutineCalendar
              schedule={currentRoutine?.schedule || []}
              year={Number(selectedYear)}
              semester={selectedSemester}
            />
          )}

          {/* VIEW MODE 2: WEEKLY MATRIX */}
          {routineViewMode === 'matrix' && (
            <div>
              {!currentRoutine || currentRoutine.schedule.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-xs">
                  <Calendar className="w-10 h-10 text-stone-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    Routine not published for Year {selectedYear} Semester {selectedSemester}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Contact the batch representative or department office for tentative slots.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentRoutine.schedule.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                          <span className="font-bold text-emerald-800 dark:text-emerald-400">{slot.day}</span>
                          <span className="font-mono flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                            <Clock className="w-3 h-3 text-stone-400" />
                            {slot.time}
                          </span>
                        </div>
                        <div className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-0.5">
                          {slot.courseCode}
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug mb-2">
                          {slot.courseTitle}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
                          <span className="truncate">{slot.room}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500 shrink-0" />
                          <span className="truncate">{slot.teacher}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
