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
      <div className="bg-[#19382B] rounded-lg p-6 sm:p-8 text-[#F3F1E8] border border-[#42684D]/40 border-l-4 border-l-[#D97706] shadow-sm">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-[#D97706]/25 border border-[#FBBF24]/45 text-[#FDE68A] text-[11px] font-bold uppercase tracking-wider mb-3">
            <Bell className="w-3.5 h-3.5 text-[#FBBF24]" />
            <span>FES SUST Departmental Bulletin</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[#F3F1E8]">
            Notices & Class Routine
          </h1>
          <p className="text-xs sm:text-sm text-[#BBC4A6] leading-relaxed">
            Stay informed on upcoming semester exams, field tours, thesis submissions, official circular scans, and weekly class schedules.
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 pb-3">
        <button
          onClick={() => handleTabChange('notices')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'notices'
              ? 'bg-[#42684D] text-[#F3F1E8] shadow-xs'
              : 'bg-[#FAF9F4] dark:bg-[#19382B] text-[#42684D] dark:text-[#BBC4A6] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Department Notices</span>
          <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-mono font-bold ${
            activeTab === 'notices'
              ? 'bg-[#D97706] text-[#FFFBEB]'
              : 'bg-[#FEF3C7] dark:bg-[#78350F]/60 text-[#92400E] dark:text-[#FDE68A]'
          }`}>
            {notices.length}
          </span>
        </button>

        <button
          onClick={() => handleTabChange('routine')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'routine'
              ? 'bg-[#42684D] text-[#F3F1E8] shadow-xs'
              : 'bg-[#FAF9F4] dark:bg-[#19382B] text-[#42684D] dark:text-[#BBC4A6] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
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
            <div className="flex items-center gap-1.5 flex-wrap bg-[#FAF9F4] dark:bg-[#19382B] p-2.5 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74] px-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Filter:</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedTypeFilter('all')}
                className={`px-2.5 py-1 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                  selectedTypeFilter === 'all'
                    ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] shadow-xs'
                    : 'bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
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
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-bold border transition-colors cursor-pointer ${
                      isSelected
                        ? `${style.solidBadge} shadow-xs`
                        : `${style.badge} hover:brightness-95 dark:hover:brightness-110`
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-xs shrink-0 ${
                        isSelected ? 'bg-[#FFFBEB]' : style.dot
                      }`}
                    />
                    <span>{typeDef.label}</span>
                    <span className="font-mono text-[10px] opacity-85">({count})</span>
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-lg bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 space-y-3"
                >
                  <div className="h-3.5 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm w-1/3" />
                  <div className="h-5 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm w-2/3" />
                  <div className="h-12 bg-[#F3F1E8] dark:bg-[#11261D] rounded-sm" />
                </div>
              ))}
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="text-center py-12 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-8 shadow-xs">
              <AlertCircle className="w-10 h-10 text-[#8A9C74] mx-auto mb-2" />
              <h3 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                {selectedTypeFilter === 'all'
                  ? 'No active announcements'
                  : 'No notices match this tag filter'}
              </h3>
              <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-1">
                {selectedTypeFilter === 'all'
                  ? 'There are no published departmental notices at this time. Check back soon.'
                  : 'Try switching back to All to inspect every published notice.'}
              </p>
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const tags = resolveNoticeTagDefinitions(notice, noticeTypes);
              const isFocused = focusedNoticeId === notice.id;
              const primaryStyle = tags.length > 0 ? getNoticeColorStyle(tags[0].color) : null;
              const isUrgent = Boolean(notice.pinned) || tags.some((t) => t.id.toLowerCase() === 'important');

              return (
              <div
                id={`notice-card-${notice.id}`}
                key={notice.id}
                className={`p-5 sm:p-6 rounded-lg border border-l-4 transition-colors ${
                  isFocused
                    ? 'bg-[#FEF9C3]/55 dark:bg-[#1E3B2C] border-[#F59E0B] border-l-[#D97706] shadow-md ring-1 ring-[#D97706]/60'
                    : notice.pinned
                      ? 'bg-[#FFFDF5] dark:bg-[#1B3327] border-[#F59E0B]/55 dark:border-[#FBBF24]/35 border-l-[#DC2626] dark:border-l-[#F87171] shadow-xs'
                      : `bg-[#FAF9F4] dark:bg-[#19382B] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 ${
                          primaryStyle
                            ? primaryStyle.cardAccent
                            : isUrgent
                              ? 'border-l-[#DC2626] dark:border-l-[#F87171]'
                              : 'border-l-[#42684D] dark:border-l-[#8A9C74]'
                        } shadow-xs`
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {notice.pinned && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-sm text-[10px] font-bold bg-[#B91C1C] dark:bg-[#DC2626] text-[#FFF5F5] border border-[#991B1B] dark:border-[#F87171]/60 uppercase tracking-wider shadow-xs">
                        <Pin className="w-3 h-3" />
                        <span>Pinned Notice</span>
                      </span>
                    )}
                    {tags.map((tag) => {
                      const style = getNoticeColorStyle(tag.color);
                      return (
                        <span
                          key={tag.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider border ${style.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-xs shrink-0 ${style.dot}`} />
                          <span>{tag.label}</span>
                        </span>
                      );
                    })}
                    <span className="text-xs text-[#92400E] dark:text-[#FDE68A]/85 font-mono font-semibold">
                      {notice.date}
                    </span>
                  </div>

                  {/* Attachment Document Link in header if present */}
                  {(notice.attachmentUrl || notice.link) && (
                    <a
                      href={notice.attachmentUrl || notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:underline inline-flex items-center gap-1.5 font-semibold shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{notice.attachmentUrl?.endsWith('.pdf') ? 'Download PDF' : 'Attachment Link'}</span>
                    </a>
                  )}
                </div>

                {/* Title */}
                <h2 className="font-editorial text-base sm:text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-2 leading-snug">
                  {notice.title}
                </h2>

                {/* Body Text */}
                <p className="text-xs sm:text-sm text-[#42684D] dark:text-[#BBC4A6] leading-relaxed whitespace-pre-line mb-4">
                  {notice.body}
                </p>

                {/* INLINE CIRCULAR IMAGE PREVIEW */}
                {notice.imageUrl && (
                  <div className="mt-4 pt-4 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#987453] dark:text-[#8A9C74] mb-2 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                      <span>Official Notice Circular Scan / Attached Image</span>
                    </div>

                    <div
                      onClick={() => setSelectedNoticeImage({ url: notice.imageUrl!, title: notice.title })}
                      className="relative group cursor-pointer max-w-md rounded-md overflow-hidden border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] shadow-xs hover:border-[#42684D] transition-colors"
                      title="Click to expand circular in full-screen zoom view"
                    >
                      <img
                        src={getOptimizedImageUrl(notice.imageUrl, 640)}
                        alt={`Circular scan for ${notice.title}`}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                        className="w-full max-h-72 object-contain bg-[#EAE7DA]/40 dark:bg-[#11261D]"
                      />
                      <div className="absolute inset-0 bg-[#19382B]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-[#F3F1E8] text-xs font-bold">
                        <ZoomIn className="w-5 h-5" />
                        <span>Click to Enlarge / Full-Screen Zoom</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* FOOTER ACTIONS: DOCUMENT DOWNLOADS */}
                {(notice.attachmentUrl || notice.link) && (
                  <div className="mt-4 pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 flex items-center gap-3">
                    <a
                      href={notice.attachmentUrl || notice.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 hover:border-[#42684D] transition-colors"
                    >
                      <FileText className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#11261D]/92 animate-fade-in"
          onClick={() => setSelectedNoticeImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-[#142D22] border border-[#BBC4A6]/30 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#BBC4A6]/20 bg-[#19382B] text-[#F3F1E8] shrink-0">
              <div className="flex items-center gap-2 truncate pr-4">
                <ImageIcon className="w-4 h-4 text-[#8A9C74] shrink-0" />
                <span className="font-semibold text-xs sm:text-sm truncate">
                  {selectedNoticeImage.title}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedNoticeImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-[#42684D] hover:bg-[#8A9C74] text-[#F3F1E8] hover:text-[#19382B] text-xs font-medium flex items-center gap-1.5 transition-colors"
                  title="Open full resolution in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Original</span>
                </a>
                <button
                  onClick={() => setSelectedNoticeImage(null)}
                  className="p-1.5 text-[#BBC4A6] hover:text-[#F3F1E8] rounded-md hover:bg-[#42684D]/40 transition-colors"
                  aria-label="Close image viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lightbox Image Viewport */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-[#11261D]">
              <img
                src={selectedNoticeImage.url}
                alt={selectedNoticeImage.title}
                onError={handleImageError}
                decoding="async"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[78vh] object-contain rounded-md shadow-lg"
              />
            </div>

            {/* Lightbox Footer */}
            <div className="p-2.5 bg-[#19382B] border-t border-[#BBC4A6]/20 text-center text-[11px] text-[#BBC4A6] font-mono">
              Press Escape or click outside to close viewer
            </div>
          </div>
        </div>
      )}

      {/* ROUTINE TABLE */}
      {activeTab === 'routine' && (
        <div className="space-y-4">

          {/* Year, Semester & View Mode Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 shadow-xs">
            <div className="flex flex-wrap items-center gap-4">
              {/* Year Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#19382B] dark:text-[#F3F1E8]">Year:</span>
                <div className="flex gap-1 p-1 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 rounded-md">
                  {([1, 2, 3, 4] as AcademicYear[]).map((yr) => (
                    <button
                      key={yr}
                      onClick={() => setSelectedYear(yr)}
                      className={`px-3 py-1 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                        selectedYear === yr
                          ? 'bg-[#42684D] text-[#F3F1E8] shadow-xs'
                          : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                      }`}
                    >
                      Year {yr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#19382B] dark:text-[#F3F1E8]">Semester:</span>
                <div className="flex gap-1 p-1 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 rounded-md">
                  {[1, 2].map((sem) => (
                    <button
                      key={sem}
                      onClick={() => setSelectedSemester(sem as 1 | 2)}
                      className={`px-3 py-1 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                        selectedSemester === sem
                          ? 'bg-[#987453] text-[#F3F1E8] shadow-xs'
                          : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                      }`}
                    >
                      Sem {sem}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calendar vs. Timetable Grid View Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#EAE7DA] dark:bg-[#142D22] rounded-md border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setRoutineViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                  routineViewMode === 'calendar'
                    ? 'bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] shadow-xs border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/25'
                    : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Dated Calendar</span>
              </button>
              <button
                type="button"
                onClick={() => setRoutineViewMode('matrix')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                  routineViewMode === 'matrix'
                    ? 'bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] shadow-xs border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/25'
                    : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
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
                <div className="text-center py-12 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-8 shadow-xs">
                  <Calendar className="w-10 h-10 text-[#8A9C74] mx-auto mb-2" />
                  <h3 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                    Routine not published for Year {selectedYear} Semester {selectedSemester}
                  </h3>
                  <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-1">
                    Contact the batch representative or department office for tentative slots.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {currentRoutine.schedule.map((slot, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-[#42684D] dark:text-[#8A9C74] mb-1">
                          <span className="font-bold text-[#19382B] dark:text-[#F3F1E8]">{slot.day}</span>
                          <span className="font-mono flex items-center gap-1 font-semibold text-[#42684D] dark:text-[#BBC4A6]">
                            <Clock className="w-3 h-3 text-[#8A9C74]" />
                            {slot.time}
                          </span>
                        </div>
                        <div className="font-mono text-xs font-bold text-[#987453] dark:text-[#BBC4A6] mb-0.5">
                          {slot.courseCode}
                        </div>
                        <h4 className="text-sm font-bold text-[#19382B] dark:text-[#F3F1E8] leading-snug mb-2">
                          {slot.courseTitle}
                        </h4>
                      </div>

                      <div className="pt-2 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 text-xs text-[#42684D] dark:text-[#BBC4A6] space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#987453] dark:text-[#8A9C74] shrink-0" />
                          <span className="truncate">{slot.room}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74] shrink-0" />
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
