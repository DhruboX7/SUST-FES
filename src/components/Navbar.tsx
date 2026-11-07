import React, { useState, useEffect, useRef, useMemo } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { CONTRIBUTE_FORM_URL } from '../config';
import { useLanguage } from '../contexts/LanguageContext';
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
  Menu,
  X,
  ExternalLink,
  Wrench
} from 'lucide-react';

interface NavbarProps {
  bookmarkCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
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

export const Navbar: React.FC<NavbarProps> = ({
  bookmarkCount,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const location = useLocation();

  const [openDropdown, setOpenDropdown] = useState<NavGroupId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Group definitions
  const navGroups: NavGroup[] = useMemo(() => [
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
          id: 'contribute',
          href: CONTRIBUTE_FORM_URL,
          labelKey: 'contribute',
          fallbackLabel: 'Contribute Material',
          descEn: 'Submit lecture notes, slides, or PYQ',
          descBn: 'লেকচার নোট বা প্রশ্ন আপলোড করুন',
          icon: PlusCircle,
          isExternal: true,
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
  ], [bookmarkCount]);

  // Determine which group is active based on current path
  const activeGroupId = useMemo<NavGroupId>(() => {
    const current = location.pathname;
    if (current === '/' || current.startsWith('/courses') || current.startsWith('/pyq') || current.startsWith('/syllabus') || current.startsWith('/progress')) {
      return 'academics';
    }
    if (current.startsWith('/tools') || current.startsWith('/notices') || current.startsWith('/bookmarks')) {
      return 'tools';
    }
    if (current.startsWith('/species') || current.startsWith('/gallery') || current.startsWith('/theses')) {
      return 'forestry';
    }
    if (current.startsWith('/faculty') || current.startsWith('/about') || current.startsWith('/manage')) {
      return 'department';
    }
    return 'academics';
  }, [location.pathname]);

  // Mobile selected tab (defaults to active group)
  const [mobileSelectedGroup, setMobileSelectedGroup] = useState<NavGroupId>(activeGroupId);

  // Sync mobile selected tab when route changes
  useEffect(() => {
    setMobileSelectedGroup(activeGroupId);
  }, [activeGroupId]);

  // Close dropdown and mobile menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (
        mobileMenuRef.current && 
        !mobileMenuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-mobile-menu-toggle]')
      ) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isGroupActive = (group: NavGroup) => {
    if (group.id === 'academics' && location.pathname === '/') return true;
    return group.matchPaths.some((path) => location.pathname.startsWith(path));
  };

  const getGroupLabel = (group: NavGroup) => {
    const translated = t(group.labelKey);
    return translated !== group.labelKey ? translated : group.fallbackLabel;
  };

  const getItemLabel = (item: NavItem) => {
    const translated = t(item.labelKey);
    return translated !== item.labelKey ? translated : item.fallbackLabel;
  };

  const currentMobileGroupObj = navGroups.find(g => g.id === mobileSelectedGroup) || navGroups[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between gap-3 h-16" ref={dropdownRef}>
          
          {/* Brand Zone */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs transition-transform group-hover:scale-105">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                FES SUST Library
              </span>
            </div>
          </Link>

          {/* Desktop Navigation: Categorized Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm" aria-label="Main Navigation">
            {navGroups.map((group) => {
              const active = isGroupActive(group);
              const isOpen = openDropdown === group.id;
              const GroupIcon = group.icon;

              return (
                <div key={group.id} className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown((prev) => (prev === group.id ? null : group.id))}
                    aria-expanded={isOpen}
                    aria-haspopup="menu"
                    className={`flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors py-2 px-3 text-sm font-medium rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                      active || isOpen
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold'
                        : 'text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    <GroupIcon className={`w-4 h-4 ${active ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'}`} />
                    <span>{getGroupLabel(group)}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-700 dark:text-emerald-400' : 'text-stone-400'
                      }`}
                    />
                  </button>

                  {/* Dropdown Panel */}
                  {isOpen && (
                    <div
                      role="menu"
                      aria-label={getGroupLabel(group)}
                      className="absolute left-0 mt-1.5 w-72 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 border-b border-stone-100 dark:border-stone-800/60 mb-1">
                        {getGroupLabel(group)}
                      </div>

                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isCurrent = item.to ? (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)) : false;

                        if (item.isExternal && item.href) {
                          return (
                            <a
                              key={item.id}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              role="menuitem"
                              className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0 group-hover:scale-105 transition-transform">
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium flex items-center gap-1.5">
                                  <span>{getItemLabel(item)}</span>
                                  <ExternalLink className="w-3 h-3 text-stone-400" />
                                </div>
                                <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                                  {lang === 'bn' ? item.descBn : item.descEn}
                                </div>
                              </div>
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={item.id}
                            to={item.to || '/'}
                            role="menuitem"
                            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm transition-colors group ${
                              isCurrent
                                ? 'bg-emerald-50/80 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-semibold'
                                : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                              isCurrent 
                                ? 'bg-emerald-600 text-white dark:bg-emerald-500' 
                                : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            }`}>
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium flex items-center justify-between gap-2">
                                <span>{getItemLabel(item)}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                  <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 rounded-md">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                                {lang === 'bn' ? item.descBn : item.descEn}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Quick 1-Click Saved Link with Badge */}
            <NavLink
              to="/bookmarks"
              className={({ isActive }) =>
                `whitespace-nowrap shrink-0 transition-colors py-2 px-2.5 text-sm font-medium rounded-lg flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
                }`
              }
              title="Quick access to saved study bookmarks"
            >
              <Bookmark className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t('bookmarks')}</span>
              {bookmarkCount > 0 && (
                <span className="px-1.5 py-0.2 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 rounded-md">
                  {bookmarkCount}
                </span>
              )}
            </NavLink>
          </nav>

          {/* Action Zone: Language, Theme, Contribute & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Bilingual Toggle */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={`Switch to ${lang === 'en' ? 'Bangla' : 'English'}`}
              className="px-2.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-600 transition-colors flex items-center gap-1 cursor-pointer"
              title="Toggle language / ভাষা পরিবর্তন"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'en' ? 'বাং' : 'EN'}</span>
            </button>

            {/* Contribute CTA (Desktop & Tablet) */}
            <a
              href={CONTRIBUTE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white transition-colors shadow-xs"
              title="Contribute course slides, notes, or PYQ"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('contribute')}</span>
            </a>

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* In-Browser Admin Link (Desktop) */}
            <NavLink
              to="/manage"
              aria-label="Manage Library"
              className={({ isActive }) =>
                `hidden xl:flex p-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-950 text-emerald-400 ring-2 ring-emerald-500'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`
              }
              title="Manage Library Archive"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t('manage')}</span>
            </NavLink>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              data-mobile-menu-toggle="true"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              className="lg:hidden p-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-emerald-700 dark:text-emerald-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Full Categorized Drawer / Dropdown Sheet */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden border-t border-stone-200 dark:border-stone-800 bg-white/98 dark:bg-stone-900/98 backdrop-blur-xl py-4 animate-in slide-in-from-top-2 duration-200 shadow-2xl max-h-[calc(100vh-4.5rem)] overflow-y-auto"
          >
            <div className="space-y-4">
              {navGroups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.id} className="bg-stone-50/80 dark:bg-stone-800/40 rounded-xl p-3 border border-stone-200/60 dark:border-stone-800/60">
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-2 px-1 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      <GroupIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                      <span>{getGroupLabel(group)}</span>
                    </div>

                    {/* Group Items Grid */}
                    <div className="grid grid-cols-1 gap-1">
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const isCurrent = item.to ? (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)) : false;

                        if (item.isExternal && item.href) {
                          return (
                            <a
                              key={item.id}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-3 p-2.5 rounded-lg text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-800 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-100/70 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0">
                                <ItemIcon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold flex items-center gap-1.5">
                                  <span>{getItemLabel(item)}</span>
                                  <ExternalLink className="w-3 h-3 text-stone-400" />
                                </div>
                                <div className="text-xs text-stone-500 dark:text-stone-400 truncate">
                                  {lang === 'bn' ? item.descBn : item.descEn}
                                </div>
                              </div>
                            </a>
                          );
                        }

                        return (
                          <Link
                            key={item.id}
                            to={item.to || '/'}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                              isCurrent
                                ? 'bg-emerald-800 text-white font-semibold shadow-xs'
                                : 'text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-stone-800'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? 'bg-white/20 text-white'
                                : 'bg-emerald-100/70 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                            }`}>
                              <ItemIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold flex items-center justify-between gap-2">
                                <span>{getItemLabel(item)}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                  <span className={`px-1.5 py-0.2 text-[10px] font-mono font-bold rounded-md ${
                                    isCurrent
                                      ? 'bg-white text-emerald-900'
                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                  }`}>
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              <div className={`text-xs truncate ${isCurrent ? 'text-emerald-100' : 'text-stone-500 dark:text-stone-400'}`}>
                                {lang === 'bn' ? item.descBn : item.descEn}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Quick Categorized Tabs (Single-Tap Segmented Bar) */}
        <div className="lg:hidden border-t border-stone-100 dark:border-stone-800/80 py-2">
          {/* Level 1: Category Segment Selector */}
          <div className="flex items-center justify-between gap-1 bg-stone-100 dark:bg-stone-800/70 p-1 rounded-xl">
            {navGroups.map((group) => {
              const isSelected = mobileSelectedGroup === group.id;
              const hasActiveChild = isGroupActive(group);
              const GroupIcon = group.icon;

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setMobileSelectedGroup(group.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-stone-900 text-emerald-800 dark:text-emerald-300 shadow-xs'
                      : hasActiveChild
                      ? 'text-emerald-700 dark:text-emerald-400 hover:text-stone-900 dark:hover:text-stone-100'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  aria-pressed={isSelected}
                >
                  <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{getGroupLabel(group)}</span>
                </button>
              );
            })}
          </div>

          {/* Level 2: Sub-items for the Selected Category */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar">
            {currentMobileGroupObj.items.map((item) => {
              const ItemIcon = item.icon;
              const isCurrent = item.to ? (item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)) : false;

              if (item.isExternal && item.href) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700/60 transition-colors"
                  >
                    <ItemIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{getItemLabel(item)}</span>
                    <ExternalLink className="w-2.5 h-2.5 text-stone-400" />
                  </a>
                );
              }

              return (
                <NavLink
                  key={item.id}
                  to={item.to || '/'}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors border ${
                    isCurrent
                      ? 'bg-emerald-800 text-white border-emerald-800 font-semibold'
                      : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <ItemIcon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                  <span>{getItemLabel(item)}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1 py-0.1 text-[9px] font-mono font-bold rounded ${
                      isCurrent ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

      </div>
    </header>
  );
};
