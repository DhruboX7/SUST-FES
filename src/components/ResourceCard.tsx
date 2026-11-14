import React from 'react';
import { ResourceItem } from '../types';
import { REPORT_FORM_URL } from '../config';
import { 
  FileText, 
  Presentation, 
  FileCheck, 
  Download, 
  Eye, 
  Bookmark, 
  FileSpreadsheet,
  ArrowUpRight,
  Copy,
  Flag,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ResourceCardProps {
  resource: ResourceItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onPreview: (resource: ResourceItem) => void;
  onCopyLink: (resource: ResourceItem) => void;
  searchQuery?: string;
}

// Highlight matching search keywords inside text
function renderHighlightedText(text: string | undefined, query?: string): React.ReactNode {
  const safeText = text || '';
  if (!safeText || !query || !query.trim()) return safeText;
  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = safeText.split(new RegExp(`(${escaped})`, 'gi'));
  
  return parts.map((part, i) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark
        key={i}
        className="bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 px-0.5 rounded font-semibold"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isBookmarked,
  onToggleBookmark,
  onPreview,
  onCopyLink,
  searchQuery = '',
}) => {
  const { t } = useLanguage();

  // Determine file icon
  const getCategoryIcon = () => {
    switch (resource.category) {
      case 'slides':
        return <Presentation className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />;
      case 'notes':
        return <FileText className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />;
      case 'pyq':
        return <FileCheck className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />;
      case 'book':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  const getCategoryLabel = () => {
    switch (resource.category) {
      case 'slides': return 'Lecture Slides';
      case 'notes': return 'Lecture Notes';
      case 'pyq': return resource.examTerm === 'midterm' ? 'Midterm PYQ' : 'Semester Final PYQ';
      case 'book': return 'Textbook';
      case 'practical': return 'Lab Manual';
      default: return 'Study Material';
    }
  };

  const formatSemester = () => {
    if (resource.year === 'msc') return 'M.Sc.';
    if (resource.year === 'general') return 'General';
    const yrStr = `${resource.year}${resource.year === 1 ? 'st' : resource.year === 2 ? 'nd' : resource.year === 3 ? 'rd' : 'th'} Year`;
    const semStr = resource.semester === 'all' ? 'Full Session' : `Sem ${resource.semester}`;
    return `${yrStr} · ${semStr}`;
  };

  // Check if added within last 14 days
  const isRecent = (() => {
    if (!resource.createdAt) return false;
    try {
      const createdTime = new Date(resource.createdAt).getTime();
      const diffDays = (Date.now() - createdTime) / (1000 * 60 * 60 * 24);
      return diffDays <= 14;
    } catch {
      return false;
    }
  })();

  const reportUrl = `${REPORT_FORM_URL}?usp=pp_url&entry_resource_id=${encodeURIComponent(resource.id || '')}&entry_resource_title=${encodeURIComponent(resource.title || '')}`;

  return (
    <div className="group relative bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all flex flex-col justify-between">
      
      {/* Top Header Zone: Metadata with · separator */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono font-semibold text-emerald-800 dark:text-emerald-400">
              {resource.courseCode}
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-medium">
              {getCategoryIcon()}
              <span>{getCategoryLabel()}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatSemester()}</span>
            {isRecent && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase tracking-wider">
                {t('newBadge')}
              </span>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(resource.id)}
            aria-label={isBookmarked ? `Remove bookmark for ${resource.title}` : `Bookmark ${resource.title}`}
            className={`p-1 rounded-md transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
              isBookmarked
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-stone-300 dark:text-stone-600 hover:text-stone-500 dark:hover:text-stone-400'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Primary Title with Highlight */}
        <h3 
          onClick={() => onPreview(resource)}
          className="text-base font-bold text-stone-900 dark:text-stone-100 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer transition-colors leading-snug mb-1.5 line-clamp-2"
          style={{ textWrap: 'balance' }}
        >
          {renderHighlightedText(resource.title, searchQuery)}
        </h3>

        {/* Course Title kicker */}
        <div className="text-xs text-stone-500 dark:text-stone-400 font-medium mb-3">
          {renderHighlightedText(resource.courseTitle, searchQuery)}
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-3 line-clamp-3">
            {renderHighlightedText(resource.description, searchQuery)}
          </p>
        )}
      </div>

      {/* Card Footer: Metadata info + Action Controls */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-400 dark:text-stone-500">
          <div className="flex items-center gap-1.5 truncate">
            {resource.sessionYear && <span>{resource.sessionYear} Session</span>}
            {resource.authorOrTeacher && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{resource.authorOrTeacher}</span>
              </>
            )}
          </div>
          {resource.fileSize && (
            <span className="font-mono text-[11px] shrink-0">{resource.fileSize}</span>
          )}
        </div>

        {/* Access Controls */}
        <div className="space-y-2">
          {/* Top Row: Primary Redirect to Drive & In-App Reader */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* Direct Google Drive Redirect */}
            <a
              href={resource.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${resource.title} in Google Drive`}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-1.5 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              title="Redirect and open document in Google Drive / Cloud"
            >
              <span>{t('redirectDrive')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* In-App Preview Button */}
            <button
              onClick={() => onPreview(resource)}
              aria-label={`Read ${resource.title} in app`}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              title="Read document embedded in app"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('readInApp')}</span>
            </button>
          </div>

          {/* Secondary Actions: Download, Copy Drive Link & Report */}
          <div className="flex items-center justify-between text-[11px] pt-1 text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => onCopyLink(resource)}
              aria-label={`Copy shareable link for ${resource.title}`}
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 py-1"
              title="Copy shareable link"
            >
              <Copy className="w-3 h-3" />
              <span>{t('copyLink')}</span>
            </button>

            <a
              href={resource.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              aria-label={`Direct download ${resource.title}`}
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 py-1"
              title="Download file directly"
            >
              <Download className="w-3 h-3" />
              <span>{t('download')}</span>
            </a>

            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Report broken link for ${resource.title}`}
              className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1 py-1"
              title="Report broken or inaccessible link"
            >
              <Flag className="w-3 h-3" />
              <span>{t('report')}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
