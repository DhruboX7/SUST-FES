import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Megaphone,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Pin,
} from 'lucide-react';
import {
  NoticeItem,
  NoticeTypeDefinition,
  NoticeBarSettings,
} from '../types';
import {
  getStoredNotices,
  getStoredNoticeTypes,
  getStoredNoticeBarSettings,
  DEFAULT_NOTICE_TYPES,
  DEFAULT_NOTICE_BAR_SETTINGS,
} from '../utils/storage';
import {
  getBarEligibleNotices,
  getNoticeColorStyle,
  resolveNoticeTagDefinitions,
} from '../utils/noticeUtils';

export const RecentNoticesBar: React.FC = () => {
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [noticeTypes, setNoticeTypes] = useState<NoticeTypeDefinition[]>(() => {
    try {
      return getStoredNoticeTypes();
    } catch {
      return DEFAULT_NOTICE_TYPES;
    }
  });
  const [settings, setSettings] = useState<NoticeBarSettings>(() => {
    try {
      return getStoredNoticeBarSettings();
    } catch {
      return DEFAULT_NOTICE_BAR_SETTINGS;
    }
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [exitingNotice, setExitingNotice] = useState<NoticeItem | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [transitionTick, setTransitionTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const refreshAll = () => {
      if (!isMounted) return;
      try {
        setNoticeTypes(getStoredNoticeTypes());
        setSettings(getStoredNoticeBarSettings());
      } catch {
        // Ignore storage read fallback
      }
      getStoredNotices()
        .then((data) => {
          if (isMounted && Array.isArray(data)) {
            setNotices(data);
          }
        })
        .catch(() => {});
    };

    refreshAll();

    const handleUpdate = (e: Event) => {
      const collection = (e as CustomEvent<{ collection?: string }>).detail?.collection;
      if (!collection || collection === 'notices' || collection === 'all') {
        refreshAll();
      }
    };

    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('sust_fes_data_updated', handleUpdate);
    };
  }, []);

  const eligibleNotices = useMemo(
    () => getBarEligibleNotices(notices, noticeTypes, settings.maxItems),
    [notices, noticeTypes, settings.maxItems]
  );

  useEffect(() => {
    if (activeIndex >= eligibleNotices.length) {
      setActiveIndex(0);
      setExitingNotice(null);
    }
  }, [activeIndex, eligibleNotices.length]);

  const transitionToIndex = useCallback(
    (nextIdx: number, dir: 'next' | 'prev') => {
      if (eligibleNotices.length <= 1) return;
      const current = eligibleNotices[activeIndex % eligibleNotices.length] || null;

      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }

      setDirection(dir);
      setExitingNotice(current);
      setActiveIndex(nextIdx);
      setTransitionTick((t) => t + 1);

      exitTimerRef.current = setTimeout(() => {
        setExitingNotice(null);
        exitTimerRef.current = null;
      }, 380);
    },
    [eligibleNotices, activeIndex]
  );

  const intervalMs = Math.max(2000, (settings.rotationIntervalSeconds || 5) * 1000);

  useEffect(() => {
    if (!settings.enabled || !settings.autoRotate || isPaused || eligibleNotices.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      const nextIdx = (activeIndex + 1) % eligibleNotices.length;
      transitionToIndex(nextIdx, 'next');
    }, intervalMs);
    return () => clearInterval(timer);
  }, [
    settings.enabled,
    settings.autoRotate,
    isPaused,
    eligibleNotices.length,
    activeIndex,
    intervalMs,
    transitionToIndex,
  ]);

  if (!settings.enabled || eligibleNotices.length === 0) {
    return null;
  }

  const safeIndex = activeIndex % eligibleNotices.length;
  const activeNotice = eligibleNotices[safeIndex];
  if (!activeNotice) return null;

  const handlePrev = () => {
    const prevIdx = (safeIndex - 1 + eligibleNotices.length) % eligibleNotices.length;
    transitionToIndex(prevIdx, 'prev');
  };

  const handleNext = () => {
    const nextIdx = (safeIndex + 1) % eligibleNotices.length;
    transitionToIndex(nextIdx, 'next');
  };

  const renderNoticeRow = (notice: NoticeItem) => {
    const tags = resolveNoticeTagDefinitions(notice, noticeTypes);
    return (
      <>
        <div className="flex items-center gap-1.5 shrink-0">
          {tags.slice(0, 2).map((tag) => {
            const style = getNoticeColorStyle(tag.color);
            return (
              <span
                key={tag.id}
                className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider border ${style.badge}`}
              >
                <span>{tag.label}</span>
              </span>
            );
          })}

          {tags.length === 0 && notice.pinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider bg-[#987453]/12 text-[#987453] border border-[#987453]/35 dark:bg-[#987453]/20 dark:text-[#F3F1E8] dark:border-[#987453]/45">
              <Pin className="w-2.5 h-2.5" />
              <span>Pinned</span>
            </span>
          )}
        </div>

        <span className="text-xs sm:text-[13px] font-medium text-[#19382B] dark:text-[#F3F1E8] group-hover:text-[#42684D] dark:group-hover:text-[#BBC4A6] transition-colors truncate min-w-0">
          {notice.title}
        </span>

        {notice.date && (
          <span className="hidden md:inline-block text-[11px] font-mono text-[#987453] dark:text-[#8A9C74] shrink-0">
            · {notice.date}
          </span>
        )}
      </>
    );
  };

  const enterClass =
    transitionTick > 0
      ? direction === 'prev'
        ? 'animate-notice-in-prev'
        : 'animate-notice-in-next'
      : '';

  const exitClass =
    direction === 'prev' ? 'animate-notice-out-prev' : 'animate-notice-out-next';

  return (
    <div
      role="region"
      aria-label={settings.title || 'Latest Notices'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="relative w-full bg-[#EAE7DA] dark:bg-[#152E23] border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-2 sm:gap-3 min-h-[28px]">
          {/* Left Title Badge */}
          <Link
            to="/notices"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] text-[11px] font-semibold tracking-wide uppercase shrink-0 hover:bg-[#42684D] dark:hover:bg-[#8A9C74] dark:hover:text-[#11261D] transition-colors"
          >
            <Megaphone className="w-3.5 h-3.5 text-[#BBC4A6] shrink-0" />
            <span className="hidden xs:inline sm:inline">{settings.title || 'Latest Notices'}</span>
            <span className="xs:hidden sm:hidden">Notices</span>
          </Link>

          {/* Animated Crossfade + Slide Notice Viewport */}
          <div className="relative flex-1 min-w-0 h-7 overflow-hidden flex items-center">
            {exitingNotice && (
              <div
                key={`exit-${exitingNotice.id}-${transitionTick}`}
                aria-hidden="true"
                className={`absolute inset-0 flex items-center gap-2 py-0.5 pointer-events-none ${exitClass}`}
              >
                {renderNoticeRow(exitingNotice)}
              </div>
            )}

            <Link
              key={`active-${activeNotice.id}-${transitionTick}`}
              to={`/notices?tab=notices&notice=${encodeURIComponent(activeNotice.id)}`}
              className={`w-full min-w-0 flex items-center gap-2 group py-0.5 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] ${enterClass}`}
              title={activeNotice.title}
            >
              {renderNoticeRow(activeNotice)}
            </Link>
          </div>

          {/* Right Controls: Stepper + All Notices Link */}
          <div className="flex items-center gap-1.5 shrink-0">
            {eligibleNotices.length > 1 && (
              <div className="flex items-center gap-0.5 bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 rounded-md p-0.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 text-[#42684D] hover:text-[#19382B] dark:text-[#BBC4A6] dark:hover:text-[#F3F1E8] rounded-sm transition-colors cursor-pointer"
                  aria-label="Previous notice"
                  title="Previous notice"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="hidden sm:inline px-1 text-[10px] font-mono font-semibold text-[#987453] dark:text-[#BBC4A6] select-none">
                  {safeIndex + 1}/{eligibleNotices.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 text-[#42684D] hover:text-[#19382B] dark:text-[#BBC4A6] dark:hover:text-[#F3F1E8] rounded-sm transition-colors cursor-pointer"
                  aria-label="Next notice"
                  title="Next notice"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <Link
              to="/notices"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B] hover:text-[#19382B] dark:hover:text-[#F3F1E8] transition-colors whitespace-nowrap"
            >
              <span>All Notices</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Synchronized Auto-Rotation Progress Hairline */}
      {settings.autoRotate && eligibleNotices.length > 1 && !isPaused && (
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#BBC4A6]/40 dark:bg-[#19382B] overflow-hidden pointer-events-none"
        >
          <div
            key={`progress-${safeIndex}-${intervalMs}`}
            className="h-full w-full bg-[#42684D] dark:bg-[#8A9C74] origin-left"
            style={{
              animation: `noticeProgressFill ${intervalMs}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
};
