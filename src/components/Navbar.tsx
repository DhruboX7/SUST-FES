import React, { useState, useEffect, useRef } from 'react';
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
  Library
} from 'lucide-react';

interface NavbarProps {
  bookmarkCount: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarkCount,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const location = useLocation();

  const [openDropdown, setOpenDropdown] = useState<'academics' | 'explore' | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

  const isAcademicsActive = ['/syllabus', '/progress', '/notices', '/tools/cgpa'].some((path) =>
    location.pathname.startsWith(path)
  );

  const isExploreActive = ['/species', '/gallery', '/theses', '/faculty', '/about'].some((path) =>
    location.pathname.startsWith(path)
  );

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 transition-colors py-2 px-3 text-sm font-medium rounded-lg ${
      isActive
        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold'
        : 'text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
    }`;

  const dropdownTriggerClass = (isActive: boolean, isOpen: boolean) =>
    `flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors py-2 px-3 text-sm font-medium rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
      isActive || isOpen
        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold'
        : 'text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-stone-100 dark:hover:bg-stone-800/60'
    }`;

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
      isActive
        ? 'bg-emerald-800 text-white font-semibold'
        : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between gap-4 h-16" ref={dropdownRef}>
          
          {/* Brand Zone */}
          <Link
            to="/"
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                FES SUST Library
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Organized into Primary + Dropdowns) */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-sm" aria-label="Main Navigation">
            {/* Primary Link: Catalog */}
            <NavLink to="/" end className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Library className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{t('catalog')}</span>
              </span>
            </NavLink>

            {/* Primary Link: Exam Bank */}
            <NavLink to="/pyq" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{t('pyq')}</span>
              </span>
            </NavLink>

            {/* Dropdown 1: Academics */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown((prev) => (prev === 'academics' ? null : 'academics'))}
                aria-expanded={openDropdown === 'academics'}
                aria-haspopup="menu"
                className={dropdownTriggerClass(isAcademicsActive, openDropdown === 'academics')}
              >
                <span>{t('academics')}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openDropdown === 'academics' ? 'rotate-180 text-emerald-700 dark:text-emerald-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'academics' && (
                <div
                  role="menu"
                  className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <Link
                    to="/syllabus"
                    role="menuitem"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{t('syllabus')}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Curriculum & chapters</div>
                    </div>
                  </Link>

                  <Link
                    to="/progress"
                    role="menuitem"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{t('progress')}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Course checklists</div>
                    </div>
                  </Link>

                  <Link
                    to="/notices"
                    role="menuitem"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{t('notices')}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Notices & class routine</div>
                    </div>
                  </Link>

                  <div className="my-1 border-t border-stone-100 dark:border-stone-800" />

                  <Link
                    to="/tools/cgpa"
                    role="menuitem"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{t('cgpa')}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">SUST 4.0 GPA calculator</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Dropdown 2: Explore */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown((prev) => (prev === 'explore' ? null : 'explore'))}
                aria-expanded={openDropdown === 'explore'}
                aria-haspopup="menu"
                className={dropdownTriggerClass(isExploreActive, openDropdown === 'explore')}
              >
                <span>{t('explore')}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openDropdown === 'explore' ? 'rotate-180 text-emerald-700 dark:text-emerald-400' : ''
                  }`}
                />
              </button>

              {openDropdown === 'explore' && (
                <div
                  role="menu"
                  className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <Link
                    to="/species"
                    role="menuitem"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                      <Trees className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{t('species')}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Campus flora & botanical info</div>
                    </div>
                  </Link>

                  <Link
                    to="/gallery"
                    role="menuitem"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{t('gallery')}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Field tours & practicals</div>
                    </div>
                  </Link>

                  <Link
                    to="/theses"
                    role="menuitem"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                      <BookMarked className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{t('theses')}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">B.Sc & M.Sc research</div>
                    </div>
                  </Link>

                  <div className="my-1 border-t border-stone-100 dark:border-stone-800" />

                  <Link
                    to="/faculty"
                    role="menuitem"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{t('faculty')}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Department faculty profiles</div>
                    </div>
                  </Link>

                  <Link
                    to="/about"
                    role="menuitem"
                    className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium">{t('about')}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">About FES & SUST library</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Primary Link: Bookmarks */}
            <NavLink to="/bookmarks" className={navLinkClass}>
              <span className="flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>{t('bookmarks')}</span>
                {bookmarkCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 rounded-md">
                    {bookmarkCount}
                  </span>
                )}
              </span>
            </NavLink>
          </nav>

          {/* Action Zone: Language, Theme Toggle & Contribute Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Bilingual Toggle */}
            <button
              type="button"
              onClick={toggleLang}
              aria-label={`Switch to ${lang === 'en' ? 'Bangla' : 'English'}`}
              className="px-2.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-600 transition-colors flex items-center gap-1"
              title="Toggle language / ভাষা পরিবর্তন"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{lang === 'en' ? 'বাং' : 'EN'}</span>
            </button>

            {/* Contribute CTA */}
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
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            {/* In-Browser Admin Link */}
            <NavLink
              to="/manage"
              aria-label="Manage Library"
              className={({ isActive }) =>
                `p-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-950 text-emerald-400 ring-2 ring-emerald-500'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`
              }
              title="Manage Library Archive"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden xl:inline">{t('manage')}</span>
            </NavLink>
          </div>
        </div>

        {/* Mobile secondary tab strip for smooth phone navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-2 border-t border-stone-100 dark:border-stone-800 no-scrollbar">
          <NavLink to="/" end className={mobileLinkClass}>
            {t('catalog')}
          </NavLink>
          <NavLink to="/pyq" className={mobileLinkClass}>
            {t('pyq')}
          </NavLink>
          <NavLink to="/syllabus" className={mobileLinkClass}>
            {t('syllabus')}
          </NavLink>
          <NavLink to="/progress" className={mobileLinkClass}>
            {t('progress')}
          </NavLink>
          <NavLink to="/notices" className={mobileLinkClass}>
            {t('notices')}
          </NavLink>
          <NavLink to="/tools/cgpa" className={mobileLinkClass}>
            {t('cgpa')}
          </NavLink>
          <NavLink to="/bookmarks" className={mobileLinkClass}>
            {t('bookmarks')} {bookmarkCount > 0 && `(${bookmarkCount})`}
          </NavLink>
          <NavLink to="/species" className={mobileLinkClass}>
            {t('species')}
          </NavLink>
          <NavLink to="/gallery" className={mobileLinkClass}>
            {t('gallery')}
          </NavLink>
          <NavLink to="/theses" className={mobileLinkClass}>
            {t('theses')}
          </NavLink>
          <NavLink to="/faculty" className={mobileLinkClass}>
            {t('faculty')}
          </NavLink>
          <NavLink to="/about" className={mobileLinkClass}>
            {t('about')}
          </NavLink>
          <NavLink to="/manage" className={mobileLinkClass}>
            {t('manage')}
          </NavLink>
        </div>

      </div>
    </header>
  );
};
