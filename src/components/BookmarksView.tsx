import React from 'react';
import { ResourceItem } from '../types';
import { Bookmark, Eye, Download, ExternalLink, Trash2, ArrowLeft } from 'lucide-react';
import { ResourceCard } from './ResourceCard';

interface BookmarksViewProps {
  bookmarkedResources: ResourceItem[];
  onToggleBookmark: (id: string) => void;
  onPreview: (resource: ResourceItem) => void;
  onCopyLink: (resource: ResourceItem) => void;
  onReturnToCatalog: () => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarkedResources,
  onToggleBookmark,
  onPreview,
  onCopyLink,
  onReturnToCatalog,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Bookmark className="w-4 h-4 fill-emerald-800 dark:fill-emerald-400" />
            <span>Personal Revision Vault</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            Saved Resources & Revision List
          </h2>
          <p className="text-stone-600 dark:text-stone-400 text-xs sm:text-sm mt-1">
            Study materials you have pinned for quick revision in your browser ({bookmarkedResources.length} items saved).
          </p>
        </div>

        <button
          onClick={onReturnToCatalog}
          className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </button>
      </div>

      {/* Grid or Empty State */}
      {bookmarkedResources.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
          <Bookmark className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">
            No Bookmarked Resources Yet
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-6">
            Click the star or bookmark icon on any lecture slide, past exam paper, or note to save it here for fast revision during exam season.
          </p>
          <button
            onClick={onReturnToCatalog}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Explore Department Catalog
          </button>
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
