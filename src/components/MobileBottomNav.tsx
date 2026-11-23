import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Library,
  FileText,
  Bell,
  PlusCircle,
  LayoutGrid,
} from 'lucide-react';

interface MobileBottomNavProps {
  isMobileDrawerOpen: boolean;
  onToggleMobileDrawer: () => void;
  bookmarkCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isMobileDrawerOpen,
  onToggleMobileDrawer,
  bookmarkCount,
}) => {
  const { t } = useLanguage();
  const location = useLocation();

  const isCatalog = location.pathname === '/' || location.pathname.startsWith('/courses');
  const isExams = location.pathname.startsWith('/pyq');
  const isNotices = location.pathname.startsWith('/notices');
  const isContribute = location.pathname.startsWith('/contribute');

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F4]/95 dark:bg-[#142D22]/95 border-t border-[#BBC4A6] dark:border-[#BBC4A6]/25 shadow-[0_-4px_16px_rgba(25,56,43,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 items-stretch h-[58px] max-w-xl mx-auto px-1">
        {/* 1. Study Catalog */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 rounded-md transition-colors active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] ${
            isCatalog && !isMobileDrawerOpen
              ? 'text-[#19382B] dark:text-[#F3F1E8] font-bold bg-[#EAE7DA]/75 dark:bg-[#19382B]'
              : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
          }`}
        >
          <Library className="w-[19px] h-[19px] shrink-0" />
          <span className="text-[11px] leading-none whitespace-nowrap">{t('mobileNavHome')}</span>
        </Link>

        {/* 2. Exam Bank */}
        <Link
          to="/pyq"
          className={`flex flex-col items-center justify-center gap-0.5 rounded-md transition-colors active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] ${
            isExams && !isMobileDrawerOpen
              ? 'text-[#19382B] dark:text-[#F3F1E8] font-bold bg-[#EAE7DA]/75 dark:bg-[#19382B]'
              : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
          }`}
        >
          <FileText className="w-[19px] h-[19px] shrink-0" />
          <span className="text-[11px] leading-none whitespace-nowrap">{t('mobileNavExams')}</span>
        </Link>

        {/* 3. Contribute (Prominent Center Action) */}
        <Link
          to="/contribute"
          className={`flex flex-col items-center justify-center gap-0.5 mx-1 my-1 rounded-lg transition-colors active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] ${
            isContribute
              ? 'bg-[#19382B] text-[#F3F1E8] font-bold shadow-xs'
              : 'bg-[#42684D] text-[#F3F1E8] font-semibold hover:bg-[#19382B]'
          }`}
        >
          <PlusCircle className="w-[19px] h-[19px] shrink-0" />
          <span className="text-[11px] leading-none whitespace-nowrap">{t('mobileNavAdd')}</span>
        </Link>

        {/* 4. Notices & Routine */}
        <Link
          to="/notices"
          className={`flex flex-col items-center justify-center gap-0.5 rounded-md transition-colors active:scale-95 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] ${
            isNotices && !isMobileDrawerOpen
              ? 'text-[#19382B] dark:text-[#F3F1E8] font-bold bg-[#EAE7DA]/75 dark:bg-[#19382B]'
              : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
          }`}
        >
          <Bell className="w-[19px] h-[19px] shrink-0" />
          <span className="text-[11px] leading-none whitespace-nowrap">{t('mobileNavNotices')}</span>
        </Link>

        {/* 5. Full Menu Drawer Toggle */}
        <button
          type="button"
          onClick={onToggleMobileDrawer}
          aria-expanded={isMobileDrawerOpen}
          className={`relative flex flex-col items-center justify-center gap-0.5 rounded-md transition-colors active:scale-95 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] ${
            isMobileDrawerOpen
              ? 'text-[#19382B] dark:text-[#F3F1E8] font-bold bg-[#EAE7DA] dark:bg-[#19382B]'
              : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
          }`}
        >
          <LayoutGrid className="w-[19px] h-[19px] shrink-0" />
          <span className="text-[11px] leading-none whitespace-nowrap">{t('mobileNavMenu')}</span>
          {bookmarkCount > 0 && !isMobileDrawerOpen && (
            <span className="absolute top-1 right-2.5 px-1 min-w-[16px] h-[15px] flex items-center justify-center text-[9px] font-mono tabular-nums font-bold rounded-sm bg-[#987453] text-[#FAF9F4]">
              {bookmarkCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
