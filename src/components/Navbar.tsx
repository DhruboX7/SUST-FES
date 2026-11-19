import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { SustLogo } from './SustLogo';
import {
  Menu,
  X,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';

interface NavbarProps {
  bookmarkCount: number;
  isDesktopSidebarOpen: boolean;
  onToggleDesktopSidebar: () => void;
  isMobileDrawerOpen: boolean;
  onToggleMobileDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  bookmarkCount,
  isDesktopSidebarOpen,
  onToggleDesktopSidebar,
  isMobileDrawerOpen,
  onToggleMobileDrawer,
}) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#19382B] text-[#F3F1E8] border-b border-[#42684D]/50 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Left Zone: Sidebar Toggle + Brand */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Desktop Collapsible Left Taskbar Toggle */}
            <button
              type="button"
              onClick={onToggleDesktopSidebar}
              aria-expanded={isDesktopSidebarOpen}
              aria-label={isDesktopSidebarOpen ? t('hideTaskbar') : t('showTaskbar')}
              className={`hidden lg:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#BBC4A6] ${
                isDesktopSidebarOpen
                  ? 'border-[#8A9C74]/40 bg-[#142D22] text-[#F3F1E8] hover:border-[#BBC4A6]'
                  : 'border-[#8A9C74]/50 bg-[#42684D] hover:bg-[#42684D]/90 text-[#F3F1E8]'
              }`}
            >
              {isDesktopSidebarOpen ? (
                <>
                  <PanelLeftClose className="w-4 h-4 shrink-0 text-[#BBC4A6]" />
                  <span>{t('hideTaskbar')}</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-4 h-4 shrink-0 text-[#BBC4A6]" />
                  <span>{t('showTaskbar')}</span>
                  {bookmarkCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono tabular-nums font-semibold bg-[#F3F1E8]/15 text-[#F3F1E8] rounded-sm">
                      {bookmarkCount}
                    </span>
                  )}
                </>
              )}
            </button>

            {/* Mobile & Tablet Slide-In Left Drawer Toggle */}
            <button
              type="button"
              onClick={onToggleMobileDrawer}
              aria-expanded={isMobileDrawerOpen}
              aria-label={isMobileDrawerOpen ? t('closeMenu') : t('navMenu')}
              className="lg:hidden inline-flex items-center gap-2 px-3 min-h-[40px] text-xs font-medium rounded-md border border-[#8A9C74]/40 bg-[#142D22] text-[#F3F1E8] hover:border-[#BBC4A6] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#BBC4A6]"
            >
              {isMobileDrawerOpen ? (
                <X className="w-4 h-4 text-[#BBC4A6] shrink-0" />
              ) : (
                <Menu className="w-4 h-4 text-[#BBC4A6] shrink-0" />
              )}
              <span>{t('navMenu')}</span>
              {bookmarkCount > 0 && !isMobileDrawerOpen && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono tabular-nums font-semibold bg-[#42684D] text-[#F3F1E8] rounded-sm">
                  {bookmarkCount}
                </span>
              )}
            </button>

            {/* Brand Wordmark */}
            <Link
              to="/"
              className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#BBC4A6] rounded-md p-1"
            >
              <SustLogo size="md" className="border-[#BBC4A6]/40" />
              <div className="flex flex-col leading-tight">
                <span className="font-editorial text-base font-semibold tracking-tight text-[#F3F1E8] group-hover:text-[#BBC4A6] transition-colors whitespace-nowrap">
                  FES SUST Library
                </span>
                <span className="hidden sm:inline font-scientific text-xs text-[#BBC4A6] tracking-wide">
                  {t('editorialMotto')}
                </span>
              </div>
            </Link>
          </div>

          {/* Right Editorial Location Tag */}
          <div className="hidden md:flex items-center gap-2 text-xs text-[#BBC4A6] font-medium shrink-0">
            <span className="text-[#987453] dark:text-[#BBC4A6]">·</span>
            <span>{t('sustSylhet')}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
