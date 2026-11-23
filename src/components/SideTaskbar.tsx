import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { FontTrialSelector } from './FontTrialSelector';
import {
  Bookmark,
  ShieldCheck,
  Sun,
  Moon,
  GraduationCap,
  FileText,
  Compass,
  CheckCircle2,
  Bell,
  Calculator,
  PlusCircle,
  Languages,
  ChevronDown,
  Trees,
  Camera,
  BookMarked,
  Users,
  Info,
  Library,
  X,
  ExternalLink,
  Wrench,
  PanelLeftClose,
} from 'lucide-react';

interface SideTaskbarProps {
  bookmarkCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isDesktopOpen: boolean;
  onToggleDesktop: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

type NavGroupId = 'academics' | 'tools' | 'forestry' | 'department';

interface NavItem {
  id: string;
  to?: string;
  href?: string;
  labelKey: string;
  fallbackLabel: string;
  descEn: string;
  descBn: string;
  icon: React.ComponentType<{ className?: string }>;
  isExternal?: boolean;
  badge?: number;
}

interface NavGroup {
  id: NavGroupId;
  labelKey: string;
  fallbackLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPaths: string[];
  items: NavItem[];
}

export const SideTaskbar: React.FC<SideTaskbarProps> = ({
  bookmarkCount,
  isDarkMode,
  onToggleDarkMode,
  isDesktopOpen,
  onToggleDesktop,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const location = useLocation();

  const navGroups: NavGroup[] = useMemo(
    () => [
      {
        id: 'academics',
        labelKey: 'navGroupAcademics',
        fallbackLabel: 'Academics',
        icon: GraduationCap,
        matchPaths: ['/courses', '/pyq', '/syllabus', '/progress'],
        items: [
          {
            id: 'catalog',
            to: '/',
            labelKey: 'catalog',
            fallbackLabel: 'Study Catalog',
            descEn: 'Lecture slides, notes & reference books',
            descBn: 'লেকচার স্লাইড, হ্যান্ডআউট ও সহায়ক বই',
            icon: Library,
          },
          {
            id: 'pyq',
            to: '/pyq',
            labelKey: 'pyq',
            fallbackLabel: 'Exam Bank',
            descEn: 'Past midterm & final exam papers',
            descBn: 'বিগত মিডটার্ম ও ফাইনাল প্রশ্নব্যাংক',
            icon: FileText,
          },
          {
            id: 'syllabus',
            to: '/syllabus',
            labelKey: 'syllabus',
            fallbackLabel: 'Curriculum & Syllabus',
            descEn: 'Course credits, units & syllabus breakdown',
            descBn: 'সিলেবাস ও ৪ বছরের কোর্স ক্রেডিট',
            icon: Compass,
          },
          {
            id: 'progress',
            to: '/progress',
            labelKey: 'progress',
            fallbackLabel: 'Progress Tracker',
            descEn: 'Interactive chapter checklist per semester',
            descBn: 'কোর্স ও অধ্যায় পড়ার অগ্রগতি ট্র্যাকার',
            icon: CheckCircle2,
          },
        ],
      },
      {
        id: 'tools',
        labelKey: 'navGroupTools',
        fallbackLabel: 'Student Tools',
        icon: Wrench,
        matchPaths: ['/tools/cgpa', '/notices', '/bookmarks'],
        items: [
          {
            id: 'cgpa',
            to: '/tools/cgpa',
            labelKey: 'cgpa',
            fallbackLabel: 'CGPA Calculator',
            descEn: 'Official SUST 4.0 GPA & target planner',
            descBn: 'SUST ৪.০ স্কেলে জিপিএ ও লক্ষ্য নির্ধারণ',
            icon: Calculator,
          },
          {
            id: 'notices',
            to: '/notices',
            labelKey: 'notices',
            fallbackLabel: 'Notices & Routine',
            descEn: 'Department announcements & class routine',
            descBn: 'জরুরি নোটিশ ও সাপ্তাহিক রুটিন',
            icon: Bell,
          },
          {
            id: 'bookmarks',
            to: '/bookmarks',
            labelKey: 'bookmarks',
            fallbackLabel: 'Saved Resources',
            descEn: 'Offline-ready saved study materials',
            descBn: 'সংরক্ষিত পড়ালেখা উপকরণ',
            icon: Bookmark,
            badge: bookmarkCount,
          },
        ],
      },
      {
        id: 'forestry',
        labelKey: 'navGroupForestry',
        fallbackLabel: 'Forestry & Research',
        icon: Trees,
        matchPaths: ['/species', '/gallery', '/theses'],
        items: [
          {
            id: 'species',
            to: '/species',
            labelKey: 'species',
            fallbackLabel: 'Tree Species Database',
            descEn: '55+ campus & indigenous botanical profiles',
            descBn: '৫৫+ ক্যাম্পাস ও স্থানীয় উদ্ভিদের পরিচয়',
            icon: Trees,
          },
          {
            id: 'gallery',
            to: '/gallery',
            labelKey: 'gallery',
            fallbackLabel: 'Field Practical Gallery',
            descEn: 'Field tours, practicals & student photography',
            descBn: 'ফিল্ড ট্যুর, ব্যবহারিক ও স্থিরচিত্র',
            icon: Camera,
          },
          {
            id: 'theses',
            to: '/theses',
            labelKey: 'theses',
            fallbackLabel: 'Research Theses Archive',
            descEn: 'B.Sc monographs & M.Sc research archive',
            descBn: 'স্নাতক ও স্নাতকোত্তর গবেষণা থিসিস',
            icon: BookMarked,
          },
        ],
      },
      {
        id: 'department',
        labelKey: 'navGroupDepartment',
        fallbackLabel: 'Department',
        icon: Info,
        matchPaths: ['/faculty', '/about', '/manage'],
        items: [
          {
            id: 'faculty',
            to: '/faculty',
            labelKey: 'faculty',
            fallbackLabel: 'Faculty Directory',
            descEn: 'Department professors & lecturer profiles',
            descBn: 'শিক্ষকমণ্ডলীর তালিকা ও পরিচিতি',
            icon: Users,
          },
          {
            id: 'about',
            to: '/about',
            labelKey: 'about',
            fallbackLabel: 'About FES & Library',
            descEn: 'Department overview & library mission',
            descBn: 'বিভাগ পরিচিতি ও ডিজিটাল লাইব্রেরি',
            icon: Info,
          },
          {
            id: 'manage',
            to: '/manage',
            labelKey: 'manage',
            fallbackLabel: 'Portal Management',
            descEn: 'Library catalog management & audits',
            descBn: 'রিসোর্স ডাটাবেজ ব্যবস্থাপনা',
            icon: ShieldCheck,
          },
        ],
      },
    ],
    [bookmarkCount]
  );

  const activeGroupId = useMemo<NavGroupId>(() => {
    const current = location.pathname;
    if (
      current === '/' ||
      current.startsWith('/courses') ||
      current.startsWith('/pyq') ||
      current.startsWith('/syllabus') ||
      current.startsWith('/progress')
    ) {
      return 'academics';
    }
    if (
      current.startsWith('/tools') ||
      current.startsWith('/notices') ||
      current.startsWith('/bookmarks')
    ) {
      return 'tools';
    }
    if (
      current.startsWith('/species') ||
      current.startsWith('/gallery') ||
      current.startsWith('/theses')
    ) {
      return 'forestry';
    }
    if (
      current.startsWith('/faculty') ||
      current.startsWith('/about') ||
      current.startsWith('/manage')
    ) {
      return 'department';
    }
    return 'academics';
  }, [location.pathname]);

  // All category menus opened by default
  const [expandedGroups, setExpandedGroups] = useState<Record<NavGroupId, boolean>>({
    academics: true,
    tools: true,
    forestry: true,
    department: true,
  });

  // Ensure active route's category stays open and close mobile drawer on navigation
  useEffect(() => {
    setExpandedGroups((prev) => ({
      ...prev,
      [activeGroupId]: true,
    }));
    onCloseMobile();
  }, [activeGroupId, location.pathname, onCloseMobile]);

  // Escape key closes mobile drawer
  useEffect(() => {
    if (!isMobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  // Lock page scroll while mobile drawer is open
  useEffect(() => {
    if (!isMobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileOpen]);

  const toggleGroup = (id: NavGroupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getGroupLabel = (group: NavGroup) => {
    const translated = t(group.labelKey);
    return translated !== group.labelKey ? translated : group.fallbackLabel;
  };

  const getItemLabel = (item: NavItem) => {
    const translated = t(item.labelKey);
    return translated !== item.labelKey ? translated : item.fallbackLabel;
  };

  const renderPanelContent = (mode: 'desktop' | 'mobile') => (
    <div className="flex flex-col h-full min-h-0">
      {/* Taskbar Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 shrink-0">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#987453] dark:text-[#BBC4A6] whitespace-nowrap truncate">
          {t('taskbarTitle')}
        </span>
        {mode === 'desktop' ? (
          <button
            type="button"
            onClick={onToggleDesktop}
            className="p-1.5 rounded-md text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] hover:text-[#19382B] dark:hover:text-[#F3F1E8] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] cursor-pointer"
            title={t('hideTaskbar')}
            aria-label={t('hideTaskbar')}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onCloseMobile}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-md text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] cursor-pointer"
            aria-label={t('closeMenu')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Navigation Groups */}
      <nav
        aria-label="Taskbar Navigation"
        className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5"
      >
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups[group.id];
          const isGroupActive =
            (group.id === 'academics' && location.pathname === '/') ||
            group.matchPaths.some((p) => location.pathname.startsWith(p));

          return (
            <div
              key={group.id}
              className="rounded-lg border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 bg-[#FAF9F4] dark:bg-[#19382B] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={isExpanded}
                className={`w-full flex items-center justify-between gap-2 px-3 min-h-[38px] text-left transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] ${
                  isGroupActive
                    ? 'text-[#19382B] dark:text-[#F3F1E8] font-semibold bg-[#EAE7DA] dark:bg-[#142D22]'
                    : 'text-[#42684D] dark:text-[#BBC4A6] font-medium hover:bg-[#F3F1E8] dark:hover:bg-[#142D22]/60'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <GroupIcon
                    className={`w-4 h-4 shrink-0 ${
                      isGroupActive
                        ? 'text-[#19382B] dark:text-[#F3F1E8]'
                        : 'text-[#8A9C74] dark:text-[#8A9C74]'
                    }`}
                  />
                  <span className="text-xs tracking-wide whitespace-nowrap truncate">
                    {getGroupLabel(group)}
                  </span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 text-[#8A9C74] transition-transform duration-150 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="p-1.5 space-y-0.5 border-t border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15 bg-[#FAF9F4] dark:bg-[#19382B]">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isCurrent = item.to
                      ? item.to === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.to)
                      : false;

                    if (item.isExternal && item.href) {
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={mode === 'mobile' ? onCloseMobile : undefined}
                          title={lang === 'bn' ? item.descBn : item.descEn}
                          className="flex items-center justify-between gap-2 px-2.5 min-h-[36px] rounded-md text-[13px] font-medium text-[#19382B] dark:text-[#F3F1E8] hover:bg-[#F3F1E8] dark:hover:bg-[#142D22] transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D]"
                        >
                          <span className="flex items-center gap-2.5 min-w-0">
                            <ItemIcon className="w-4 h-4 shrink-0 text-[#42684D] dark:text-[#8A9C74]" />
                            <span className="whitespace-nowrap truncate">{getItemLabel(item)}</span>
                          </span>
                          <ExternalLink className="w-3 h-3 shrink-0 text-[#987453]" />
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.id}
                        to={item.to || '/'}
                        onClick={mode === 'mobile' ? onCloseMobile : undefined}
                        title={lang === 'bn' ? item.descBn : item.descEn}
                        className={`group flex items-center justify-between gap-2.5 px-3 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] active:scale-[0.99] ${
                          mode === 'mobile' ? 'min-h-[50px] py-2' : 'min-h-[38px] py-1.5'
                        } ${
                          isCurrent
                            ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] font-semibold'
                            : 'text-[#19382B]/90 dark:text-[#F3F1E8]/90 font-medium hover:bg-[#F3F1E8] dark:hover:bg-[#142D22] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <ItemIcon
                            className={`w-4 h-4 shrink-0 ${
                              isCurrent
                                ? 'text-[#BBC4A6]'
                                : 'text-[#42684D] dark:text-[#8A9C74]'
                            }`}
                          />
                          <span className="min-w-0">
                            <span className="block text-[13px] whitespace-nowrap truncate leading-snug">
                              {getItemLabel(item)}
                            </span>
                            {mode === 'mobile' && (
                              <span
                                className={`block text-[10px] truncate leading-tight mt-0.5 ${
                                  isCurrent
                                    ? 'text-[#BBC4A6]'
                                    : 'text-[#42684D] dark:text-[#BBC4A6]/80'
                                }`}
                              >
                                {lang === 'bn' ? item.descBn : item.descEn}
                              </span>
                            )}
                          </span>
                        </span>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span
                            className={`px-1.5 py-0.5 text-[11px] font-mono tabular-nums font-semibold rounded-sm shrink-0 ${
                              isCurrent
                                ? 'bg-[#42684D] dark:bg-[#19382B] text-[#F3F1E8]'
                                : 'bg-[#EAE7DA] dark:bg-[#11261D] text-[#19382B] dark:text-[#BBC4A6]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Pinned Quick Options Dock */}
      <div className="p-3.5 border-t border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 bg-[#EAE7DA] dark:bg-[#142D22] space-y-2.5 shrink-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#987453] dark:text-[#BBC4A6]">
          {t('quickOptions')}
        </div>

        {/* Language & Theme Controls */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={`Switch to ${lang === 'en' ? 'Bangla' : 'English'}`}
            className="flex items-center justify-center gap-1.5 px-2.5 min-h-[42px] text-xs font-medium rounded-lg border border-[#BBC4A6] dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] hover:border-[#42684D] dark:hover:border-[#BBC4A6]/50 transition-colors cursor-pointer whitespace-nowrap active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D]"
          >
            <Languages className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74] shrink-0" />
            <span>{t('switchLangLabel')}</span>
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="flex items-center justify-center gap-1.5 px-2.5 min-h-[42px] text-xs font-medium rounded-lg border border-[#BBC4A6] dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] hover:border-[#42684D] dark:hover:border-[#BBC4A6]/50 transition-colors cursor-pointer whitespace-nowrap active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D]"
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#987453] dark:text-[#BBC4A6] shrink-0" />
                <span>{t('lightMode')}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#42684D] shrink-0" />
                <span>{t('darkMode')}</span>
              </>
            )}
          </button>
        </div>

        {/* Live Font Trial Trigger */}
        <FontTrialSelector fullWidth popoverAlign="left" />

        {/* Contribute Material Primary Action */}
        <Link
          to="/contribute"
          onClick={mode === 'mobile' ? onCloseMobile : undefined}
          className="w-full flex items-center justify-center gap-2 px-4 min-h-[44px] text-xs font-semibold rounded-lg bg-[#42684D] hover:bg-[#19382B] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] dark:hover:text-[#11261D] text-[#F3F1E8] transition-colors whitespace-nowrap active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D]"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>{t('contributeResource')}</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Collapsible Left Sidebar */}
      {isDesktopOpen && (
        <aside
          aria-label="Desktop Left Taskbar and Options"
          className="hidden lg:flex flex-col sticky top-16 h-[calc(100vh-4rem)] w-[272px] shrink-0 bg-[#EAE7DA]/75 dark:bg-[#142D22] border-r border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 z-30"
        >
          {renderPanelContent('desktop')}
        </aside>
      )}

      {/* Mobile & Tablet Slide-In Left Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#11261D]/75"
          onClick={onCloseMobile}
        />

        {/* Slide-In Left Drawer Panel */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation and Options Drawer"
          className={`absolute top-0 left-0 bottom-0 w-[312px] max-w-[88vw] rounded-r-2xl overflow-hidden bg-[#F3F1E8] dark:bg-[#142D22] border-r border-[#BBC4A6] dark:border-[#BBC4A6]/20 shadow-xl flex flex-col transition-transform duration-200 ease-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {renderPanelContent('mobile')}
        </aside>
      </div>
    </>
  );
};
