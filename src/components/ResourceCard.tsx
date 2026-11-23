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
        className="bg-[#987453]/25 dark:bg-[#987453]/40 text-[#19382B] dark:text-[#F3F1E8] px-0.5 rounded-xs font-semibold"
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
        return <Presentation className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />;
      case 'notes':
        return <FileText className="w-3.5 h-3.5 text-[#19382B] dark:text-[#BBC4A6]" />;
      case 'pyq':
        return <FileCheck className="w-3.5 h-3.5 text-[#987453]" />;
      case 'book':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-[#987453]" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#8A9C74]" />;
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
    <div className="group relative bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl sm:rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 sm:p-5 hover:border-[#42684D] dark:hover:border-[#8A9C74] transition-colors flex flex-col justify-between">
      
      {/* Top Header Zone: Metadata with · separator */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1.5 text-xs text-[#42684D] dark:text-[#BBC4A6]">
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="font-mono font-semibold text-[#19382B] dark:text-[#F3F1E8]">
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
              <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-semibold bg-[#EAE7DA] dark:bg-[#42684D] text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6] dark:border-[#8A9C74]/40 uppercase tracking-wider">
                {t('newBadge')}
              </span>
            )}
          </div>

          {/* Bookmark Button (>=44px touch target) */}
          <button
            type="button"
            onClick={() => onToggleBookmark(resource.id)}
            aria-label={isBookmarked ? `Remove bookmark for ${resource.title}` : `Bookmark ${resource.title}`}
            className={`min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-lg transition-colors cursor-pointer active:scale-95 focus:outline-hidden focus:ring-2 focus:ring-[#42684D] ${
              isBookmarked
                ? 'text-[#987453] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                : 'text-[#BBC4A6] dark:text-[#8A9C74]/65 hover:text-[#42684D] dark:hover:text-[#BBC4A6]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#987453]' : ''}`} />
          </button>
        </div>

        {/* Primary Title with Highlight */}
        <h3 
          onClick={() => onPreview(resource)}
          className="text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] hover:text-[#42684D] dark:hover:text-[#BBC4A6] cursor-pointer transition-colors leading-snug mb-1.5 line-clamp-2"
          style={{ textWrap: 'balance' }}
        >
          {renderHighlightedText(resource.title, searchQuery)}
        </h3>

        {/* Course Title kicker */}
        <div className="text-xs text-[#987453] dark:text-[#BBC4A6] font-medium mb-3">
          {renderHighlightedText(resource.courseTitle, searchQuery)}
        </div>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-[#42684D] dark:text-[#F3F1E8]/80 leading-relaxed mb-3 line-clamp-3">
            {renderHighlightedText(resource.description, searchQuery)}
          </p>
        )}
      </div>

      {/* Card Footer: Metadata info + Action Controls */}
      <div className="pt-3 border-t border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15 space-y-3">
        <div className="flex items-center justify-between text-xs text-[#8A9C74] dark:text-[#BBC4A6]/80">
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
              className="min-h-[44px] py-2 px-3 rounded-lg sm:rounded-md text-xs font-semibold bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] dark:hover:text-[#11261D] text-[#F3F1E8] transition-colors flex items-center justify-center gap-1.5 active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-[#42684D]"
              title="Redirect and open document in Google Drive / Cloud"
            >
              <span>{t('redirectDrive')}</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </a>

            {/* In-App Preview Button */}
            <button
              type="button"
              onClick={() => onPreview(resource)}
              aria-label={`Read ${resource.title} in app`}
              className="min-h-[44px] py-2 px-3 rounded-lg sm:rounded-md text-xs font-semibold bg-[#EAE7DA] hover:bg-[#BBC4A6]/45 dark:bg-[#142D22] dark:hover:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] focus:outline-hidden focus:ring-2 focus:ring-[#42684D]"
              title="Read document embedded in app"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>{t('readInApp')}</span>
            </button>
          </div>

          {/* Secondary Actions: Download, Copy Drive Link & Report */}
          <div className="grid grid-cols-3 gap-1 text-[11px] pt-1 text-[#42684D] dark:text-[#BBC4A6] border-t border-[#BBC4A6]/40 dark:border-[#BBC4A6]/15">
            <button
              type="button"
              onClick={() => onCopyLink(resource)}
              aria-label={`Copy shareable link for ${resource.title}`}
              className="min-h-[40px] px-2 rounded-md hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] hover:text-[#19382B] dark:hover:text-[#F3F1E8] transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium active:scale-95"
              title="Copy shareable link"
            >
              <Copy className="w-3.5 h-3.5 shrink-0" />
              <span>{t('copyLink')}</span>
            </button>

            <a
              href={resource.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              aria-label={`Direct download ${resource.title}`}
              className="min-h-[40px] px-2 rounded-md hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] hover:text-[#19382B] dark:hover:text-[#F3F1E8] transition-colors flex items-center justify-center gap-1.5 font-medium active:scale-95"
              title="Download file directly"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>{t('download')}</span>
            </a>

            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Report broken link for ${resource.title}`}
              className="min-h-[40px] px-2 rounded-md hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] hover:text-[#987453] dark:hover:text-[#BBC4A6] transition-colors flex items-center justify-center gap-1.5 font-medium active:scale-95"
              title="Report broken or inaccessible link"
            >
              <Flag className="w-3.5 h-3.5 shrink-0" />
              <span>{t('report')}</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
