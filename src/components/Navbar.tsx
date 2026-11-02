import React from 'react';
import { ViewTab } from '../types';
import { Bookmark, ShieldCheck, Sun, Moon, GraduationCap, FileText, Compass, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  bookmarkCount: number;
  onOpenAdmin: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  bookmarkCount,
  onOpenAdmin,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strictly conforming to Top Bar Contract: 3 zones separated by gap-8 */}
        <div className="flex items-center justify-between gap-8 h-16">
          
          {/* Zone 1: Brand Zone - Single wordmark in display face */}
          <button
            onClick={() => onSelectTab('catalog')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-800 dark:bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                FES SUST Library
              </span>
              <span className="hidden sm:inline text-xs text-stone-500 dark:text-stone-400 ml-2 font-mono">
                Sylhet
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links - 4-5 single-line clean text links with subtle hover underlines */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-300">
            <button
              onClick={() => onSelectTab('catalog')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                currentTab === 'catalog'
                  ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300 font-semibold'
                  : 'border-transparent hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              Study Catalog
            </button>

            <button
              onClick={() => onSelectTab('pyq')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'pyq'
                  ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300 font-semibold'
                  : 'border-transparent hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Exam Bank (PYQs)
            </button>
            <button
              onClick={() => onSelectTab('syllabus')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'syllabus'
                  ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300 font-semibold'
                  : 'border-transparent hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Syllabus & Courses
            </button>
            <button
              onClick={() => onSelectTab('progress')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'progress'
                  ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300 font-semibold'
                  : 'border-transparent hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Syllabus Progress Report</span>
            </button>
            <button
              onClick={() => onSelectTab('bookmarks')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'bookmarks'
                  ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300 font-semibold'
                  : 'border-transparent hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Saved Papers
              {bookmarkCount > 0 && (
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 ml-0.5">
                  ({bookmarkCount})
                </span>
              )}
            </button>
            <button
              onClick={() => onSelectTab('about')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
                currentTab === 'about'
                  ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300 font-semibold'
                  : 'border-transparent hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              About FES
            </button>
            <button
              onClick={() => onSelectTab('manage')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
                currentTab === 'manage'
                  ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300 font-semibold'
                  : 'border-transparent hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manage Library</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + theme toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onToggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>

            <button
              onClick={() => onSelectTab('manage')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs ${
                currentTab === 'manage'
                  ? 'bg-emerald-950 text-white ring-2 ring-emerald-500'
                  : 'text-white bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manage Library</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip for smooth phone navigation */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-stone-100 dark:border-stone-800 no-scrollbar">
          <button
            onClick={() => onSelectTab('catalog')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'catalog'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
            }`}
          >
            Catalog
          </button>
          <button
            onClick={() => onSelectTab('pyq')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'pyq'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
            }`}
          >
            PYQs
          </button>
          <button
            onClick={() => onSelectTab('syllabus')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'syllabus'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
            }`}
          >
            Syllabus
          </button>
          <button
            onClick={() => onSelectTab('progress')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
              currentTab === 'progress'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Progress</span>
          </button>
          <button
            onClick={() => onSelectTab('bookmarks')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'bookmarks'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
            }`}
          >
            Saved ({bookmarkCount})
          </button>
          <button
            onClick={() => onSelectTab('about')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              currentTab === 'about'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
            }`}
          >
            About
          </button>
          <button
            onClick={() => onSelectTab('manage')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors flex items-center gap-1 ${
              currentTab === 'manage'
                ? 'bg-emerald-800 text-white'
                : 'text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Manage</span>
          </button>
        </div>
      </div>
    </header>
  );
};
