import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { SustLogo } from './SustLogo';
import {
  Menu,
  X,
  PanelLeftOpen,
  PanelLeftClose,
  PlusCircle,
  SunMedium,
  ArrowUpRight,
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
  const location = useLocation();

  const quickTopLinks = [
    { to: '/', label: t('catalog'), active: location.pathname === '/' || location.pathname.startsWith('/courses') },
    { to: '/pyq', label: t('pyq'), active: location.pathname.startsWith('/pyq') },
    { to: '/notices', label: t('notices'), active: location.pathname.startsWith('/notices') },
    { to: '/species', label: t('species'), active: location.pathname.startsWith('/species') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#19382B] text-[#F3F1E8] border-b border-[#42684D]/50 transition-colors">
      <div className="w-full px-2 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-3 lg:gap-6 xl:gap-8 h-14 lg:h-16">
          {/* Left Zone: Sidebar Toggle + Brand Wordmark */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1 lg:flex-initial overflow-hidden">
            {/* Desktop Collapsible Left Taskbar Toggle */}
            <button
              type="button"
              onClick={onToggleDesktopSidebar}
              aria-expanded={isDesktopSidebarOpen}
              aria-label={isDesktopSidebarOpen ? t('hideTaskbar') : t('showTaskbar')}
              className={`hidden lg:inline-flex items-center gap-2 px-3 min-h-[40px] text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#BBC4A6] ${
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
              className="lg:hidden inline-flex items-center justify-center gap-1.5 px-2 sm:px-3 min-h-[44px] min-w-[44px] text-xs font-semibold rounded-lg border border-[#8A9C74]/45 bg-[#142D22] text-[#F3F1E8] hover:border-[#BBC4A6] transition-colors cursor-pointer whitespace-nowrap shrink-0 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#BBC4A6]"
            >
              {isMobileDrawerOpen ? (
                <X className="w-4 h-4 text-[#BBC4A6] shrink-0" />
              ) : (
                <Menu className="w-4 h-4 text-[#BBC4A6] shrink-0" />
              )}
              <span className="hidden sm:inline">{t('navMenu')}</span>
            </button>

            {/* Brand Wordmark */}
            <Link
              to="/"
              className="flex items-center gap-1.5 sm:gap-2 text-left group min-w-0 shrink overflow-hidden focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#BBC4A6] rounded-md px-0.5 sm:px-1 py-1 min-h-[44px]"
            >
              <SustLogo size="md" className="border-[#BBC4A6]/40 shrink-0" />
              <span className="font-editorial text-xs min-[380px]:text-sm sm:text-base font-semibold tracking-tight text-[#F3F1E8] group-hover:text-[#BBC4A6] transition-colors truncate">
                FES SUST<span className="hidden sm:inline"> Library</span>
              </span>
            </Link>
          </div>

          {/* Center Zone: Clean Single-Line Navigation Links (Desktop) */}
          <nav
            aria-label="Primary Top Navigation"
            className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs lg:text-sm font-medium shrink-0"
          >
            {quickTopLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap shrink-0 py-1.5 border-b-2 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#BBC4A6] rounded-xs ${
                  link.active
                    ? 'border-[#BBC4A6] text-[#F3F1E8] font-semibold'
                    : 'border-transparent text-[#BBC4A6] hover:text-[#F3F1E8] hover:border-[#8A9C74]/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Zone: External Positivity Portal + Primary Contribute Action */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <a
              href="https://naturematter.org/"
              target="_blank"
              rel="noopener noreferrer"
              title="See Something Good Today! — Share and explore positive stories at naturematter.org"
              aria-label="See Something Good Today! Opens naturematter.org in a new tab"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 min-h-[40px] text-[11px] sm:text-xs font-semibold rounded-lg sm:rounded-md bg-[#F3F1E8] hover:bg-[#BBC4A6] text-[#19382B] border border-[#BBC4A6] transition-colors whitespace-nowrap shrink-0 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#BBC4A6]"
            >
              <SunMedium className="w-3.5 h-3.5 text-[#987453] shrink-0" />
              <span className="md:hidden lg:inline xl:hidden">Good Today</span>
              <span className="hidden md:inline lg:hidden xl:inline">See Something Good Today!</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#42684D] shrink-0" />
            </a>

            <Link
              to="/contribute"
              aria-label={t('contribute')}
              title={t('contribute')}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-4 min-h-[40px] min-w-[40px] text-[11px] sm:text-xs font-semibold rounded-lg sm:rounded-md bg-[#42684D] hover:bg-[#8A9C74] hover:text-[#11261D] text-[#F3F1E8] border border-[#BBC4A6]/35 transition-colors whitespace-nowrap shrink-0 active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#BBC4A6]"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden min-[460px]:inline">{t('contribute')}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
