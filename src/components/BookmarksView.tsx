import React from 'react';
import { Link } from 'react-router-dom';
import { ResourceItem } from '../types';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { ResourceCard } from './ResourceCard';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../contexts/LanguageContext';

interface BookmarksViewProps {
  bookmarkedResources: ResourceItem[];
  onToggleBookmark: (id: string) => void;
  onPreview: (resource: ResourceItem) => void;
  onCopyLink: (resource: ResourceItem) => void;
  onReturnToCatalog?: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarkedResources,
  onToggleBookmark,
  onPreview,
  onCopyLink,
}) => {
  const { t } = useLanguage();
  usePageMeta({
    title: 'Saved Resources & Bookmarks',
    description: 'Personal study materials, lecture slides, and examination papers saved in your browser for quick revision.',
  });

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#987453] dark:text-[#8A9C74] text-xs font-semibold uppercase tracking-wider mb-2">
            <Bookmark className="w-4 h-4 fill-[#987453] dark:fill-[#8A9C74]" />
            <span>{t('savedVault')}</span>
          </div>
          <h1 className="font-editorial text-2xl font-semibold text-[#19382B] dark:text-[#F3F1E8] tracking-tight">
            {t('savedTitle')}
          </h1>
          <p className="text-[#42684D] dark:text-[#BBC4A6] text-xs sm:text-sm mt-1">
            {t('savedDesc')} ({bookmarkedResources.length} {bookmarkedResources.length === 1 ? t('resourceWord') : t('resourcesWord')}).
          </p>
        </div>

        <Link
          to="/"
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-[#19382B] dark:text-[#F3F1E8] hover:bg-[#BBC4A6]/40 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('backToCatalog')}</span>
        </Link>
      </div>

      {/* Grid or Empty State */}
      {bookmarkedResources.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-8">
          <Bookmark className="w-12 h-12 text-[#8A9C74] mx-auto mb-3" />
          <h2 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
            {t('noBookmarksYet')}
          </h2>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] max-w-sm mx-auto mb-6">
            {t('noBookmarksDesc')}
          </p>
          <Link
            to="/"
            className="inline-flex px-4 py-2 bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] text-xs font-semibold rounded-md transition-colors"
          >
            {t('exploreCatalog')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bookmarkedResources.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              isBookmarked={true}
              onToggleBookmark={onToggleBookmark}
              onPreview={onPreview}
              onCopyLink={onCopyLink}
            />
          ))}
        </div>
      )}

    </div>
  );
};
