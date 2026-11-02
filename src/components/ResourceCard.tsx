import React from 'react';
import { ResourceItem } from '../types';
import { 
  FileText, 
  Presentation, 
  FileCheck, 
  Download, 
  Eye, 
  ExternalLink, 
  Bookmark, 
  Folder, 
  FileSpreadsheet,
  Share2,
  Sparkles,
  ArrowUpRight,
  Copy
} from 'lucide-react';

interface ResourceCardProps {
  resource: ResourceItem;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onPreview: (resource: ResourceItem) => void;
  onCopyLink: (resource: ResourceItem) => void;
  searchQuery?: string;
  onKeywordClick?: (keyword: string) => void;
}

// Highlight matching search keywords inside text
function renderHighlightedText(text: string, query?: string): React.ReactNode {
  if (!query || !query.trim()) return text;
  const trimmed = query.trim();
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  
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
  onKeywordClick,
}) => {
  // Determine file icon
  const getCategoryIcon = () => {
    switch (resource.category) {
      case 'slides':
        return <Presentation className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />;
      case 'pyq':
        return <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'practical':
        return <FileSpreadsheet className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'book':
        return <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <FileText className="w-4 h-4 text-stone-600 dark:text-stone-400" />;
    }
  };

  const getCategoryLabel = () => {
    switch (resource.category) {
      case 'slides':
        return 'Lecture Slides';
      case 'pyq':
        return resource.examTerm ? `${resource.examTerm.toUpperCase()} Exam Question` : 'Exam Question (PYQ)';
      case 'notes':
        return 'Class Notes';
      case 'practical':
        return 'Lab / Field Manual';
      case 'book':
        return 'Reference Book';
      case 'syllabus':
        return 'Syllabus / Guide';
      default:
        return 'Resource';
    }
  };

  const formatSemester = () => {
    if (resource.year === 'msc') return 'M.Sc.';
    if (resource.year === 'general') return 'General';
    const yrStr = `${resource.year}${resource.year === 1 ? 'st' : resource.year === 2 ? 'nd' : resource.year === 3 ? 'rd' : 'th'} Year`;
    const semStr = resource.semester === 'all' ? 'Full Session' : `Sem ${resource.semester}`;
    return `${yrStr} · ${semStr}`;
  };

  const hasKeywordMatchInSnippet = Boolean(
    searchQuery.trim() &&
    resource.scannedSnippet &&
    resource.scannedSnippet.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const displayPath = resource.path || `Google Drive / Year ${resource.year} / Sem ${resource.semester} / ${resource.courseCode} / ${resource.title}`;

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
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(resource.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark resource'}
            className={`p-1 rounded-md transition-colors ${
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

        {/* 1. DOCUMENT DIRECTORY PATH BREADCRUMB */}
        <div className="mb-3 p-2 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-400 font-mono flex items-start gap-1.5">
          <Folder className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="truncate flex-1" title={displayPath}>
            <span className="text-stone-400 font-sans mr-1">Path:</span>
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {renderHighlightedText(displayPath, searchQuery)}
            </span>
          </div>
        </div>

        {/* 2. SCANNED DOCUMENT CONTENT EXCERPT (when keyword matched or available) */}
        {(hasKeywordMatchInSnippet || (searchQuery.trim() && resource.scannedSnippet)) && (
          <div className="mb-3 p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-1 font-semibold text-emerald-800 dark:text-emerald-400 mb-1 text-[10px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Scanned Content Excerpt · Keyword Match</span>
            </div>
            <p className="line-clamp-2 leading-relaxed">
              {renderHighlightedText(resource.scannedSnippet || resource.description || '', searchQuery)}
            </p>
          </div>
        )}

        {/* Regular description when not showing scanned snippet */}
        {!hasKeywordMatchInSnippet && !searchQuery.trim() && resource.description && (
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed mb-3 line-clamp-2">
            {resource.description}
          </p>
        )}

        {/* 3. KEYWORDS & TOPIC TAGS */}
        {resource.keywords && resource.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.keywords.slice(0, 4).map((kw, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onKeywordClick?.(kw)}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-950 dark:hover:text-emerald-300 transition-colors"
                title={`Filter by keyword: ${kw}`}
              >
                #{kw}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata info + Action & Redirect Controls */}
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

        {/* 4. REDIRECT & ACCESS CONTROLS */}
        <div className="space-y-2">
          {/* Top Row: Primary Redirect to Drive & In-App Reader */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* REDIRECT OPTION (Direct to Google Drive / Cloud File) */}
            <a
              href={resource.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-1.5 shadow-xs"
              title="Redirect and open document in Google Drive / Cloud"
            >
              <span>Redirect to Drive</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            {/* In-App Preview Button */}
            <button
              onClick={() => onPreview(resource)}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              title="Read document embedded in app"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Read in App</span>
            </button>
          </div>

          {/* Secondary Actions: Download & Copy Drive Link */}
          <div className="flex items-center justify-between text-[11px] pt-1 text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
            <button
              onClick={() => onCopyLink(resource)}
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 py-1"
              title="Copy Google Drive shareable link"
            >
              <Copy className="w-3 h-3" />
              <span>Copy Link</span>
            </button>

            <a
              href={resource.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1 py-1"
              title="Download file directly"
            >
              <Download className="w-3 h-3" />
              <span>Direct Download</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
