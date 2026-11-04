import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { AcademicYear, NoticeItem } from '../types';
import { getStoredNotices } from '../utils/storage';

interface RoutineSlot {
  day: string;
  time: string;
  courseCode: string;
  courseTitle: string;
  room: string;
  teacher: string;
}

interface YearRoutine {
  year: number;
  semester: number;
  schedule: RoutineSlot[];
}

export const NoticesView: React.FC = () => {
  usePageMeta({
    title: 'Notices & Class Routine',
    description: 'Official departmental notices, exam announcements, and semester class routines for Forestry and Environmental Science, SUST.',
  });

  const [activeTab, setActiveTab] = useState<'notices' | 'routine'>('notices');
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [routines, setRoutines] = useState<YearRoutine[]>([]);
  const [selectedYear, setSelectedYear] = useState<AcademicYear>(1);
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [nData, rRes] = await Promise.all([
        getStoredNotices().catch(() => []),
        fetch('/data/routine.json').catch(() => null),
      ]);
      setNotices(nData);
      if (rRes && rRes.ok) {
        const rData = await rRes.json();
        setRoutines(rData);
      }
    } catch (err) {
      console.error('Failed to load notices or routines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      getStoredNotices().then((data) => setNotices(data)).catch(() => {});
    };

    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => window.removeEventListener('sust_fes_data_updated', handleUpdate);
  }, []);

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

  // Sort notices: pinned first, then by date descending
  const sortedNotices = [...notices].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

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
          onClick={() => setActiveTab('notices')}
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
          onClick={() => setActiveTab('routine')}
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
          {sortedNotices.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8 shadow-xs">
              <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                No active announcements
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                There are no published departmental notices at this time. Check back soon.
              </p>
            </div>
          ) : (
            sortedNotices.map((notice) => (
              <div
                key={notice.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  notice.pinned
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
                        src={notice.imageUrl}
                        alt={`Circular scan for ${notice.title}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                        }}
                        className="w-full max-h-72 object-contain bg-stone-900/5 dark:bg-black/40 group-hover:scale-102 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-2xs">
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
            ))
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
          
          {/* Year & Semester Filter */}
          <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Academic Year:</span>
              <div className="flex gap-1">
                {([1, 2, 3, 4] as AcademicYear[]).map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      selectedYear === yr
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    Year {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Semester:</span>
              <div className="flex gap-1">
                {[1, 2].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => setSelectedSemester(sem as 1 | 2)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      selectedSemester === sem
                        ? 'bg-emerald-800 text-white'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    Semester {sem}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Slots */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentRoutine.schedule.map((slot, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400">{slot.day}</span>
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-stone-400" />
                        {slot.time}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-semibold text-stone-500 dark:text-stone-400 mb-0.5">
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
  );
};
