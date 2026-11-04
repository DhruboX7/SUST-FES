import React, { useState, useEffect, useRef } from 'react';
import { ResourceItem } from '../types';
import { REPORT_FORM_URL } from '../config';
import { 
  X, 
  Download, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  AlertCircle,
  Flag
} from 'lucide-react';

interface DocumentViewerModalProps {
  resource: ResourceItem | null;
  onClose: () => void;
  onCopyLink: (resource: ResourceItem) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  resource,
  onClose,
  onCopyLink,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!resource) return;
    previousActiveElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [resource, onClose]);

  if (!resource) return null;

  const handleCopy = () => {
    onCopyLink(resource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reportUrl = `${REPORT_FORM_URL}?usp=pp_url&entry_resource_id=${encodeURIComponent(resource.id)}&entry_resource_title=${encodeURIComponent(resource.title)}`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="doc-viewer-title"
    >
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className={`bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-5xl h-[88vh]'
        }`}
      >
        {/* Top Control Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-950 border-b border-stone-800 text-white shrink-0 gap-3">
          
          {/* Document Title & Course */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-0.5 truncate">
              <span className="font-mono text-emerald-400 font-semibold">{resource.courseCode}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{resource.courseTitle}</span>
              {resource.sessionYear && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{resource.sessionYear}</span>
                </>
              )}
            </div>
            <h2 id="doc-viewer-title" className="text-sm sm:text-base font-bold text-stone-100 truncate">
              {resource.title}
            </h2>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Copy Link */}
            <button
              onClick={handleCopy}
              aria-label="Copy shareable link"
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              title="Copy shareable link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Share'}</span>
            </button>

            {/* Direct Download */}
            <a
              href={resource.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              aria-label="Direct download file"
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              title="Download file directly"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* External Drive Tab */}
            <a
              href={resource.driveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open document in Google Drive"
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              title="Open in Google Drive"
            >
              <ExternalLink className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Open in Drive</span>
            </a>

            {/* Report broken link */}
            <a
              href={reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Report broken link or issue"
              className="p-2 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800 transition-colors flex items-center gap-1 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              title="Report broken link"
            >
              <Flag className="w-4 h-4" />
              <span className="hidden lg:inline">Report</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close document viewer"
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-red-950/50 hover:text-red-400 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              title="Close viewer (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Document Frame */}
        <div className="relative flex-1 bg-stone-950 w-full h-full overflow-hidden flex flex-col">
          {iframeError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-300">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Google Drive Preview Restriction</h3>
              <p className="max-w-md text-sm text-stone-400 mb-6 leading-relaxed">
                This document requires authentication or has third-party cookie restrictions in your current browser. You can still download or open it directly in Google Drive!
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={resource.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Drive</span>
                </a>
                <a
                  href={resource.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Direct Download</span>
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={resource.previewUrl}
              title={resource.title}
              className="w-full h-full border-0 bg-stone-900"
              allow="autoplay"
              onError={() => setIframeError(true)}
            />
          )}

          {/* Quick Action & Troubleshooting Bar at Bottom */}
          <div className="px-4 py-2.5 bg-stone-900 border-t border-stone-800 text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
            <span>
              If preview is restricted by Google Drive cookies, use direct download or open in Google Drive.
            </span>
            <div className="flex items-center gap-4 shrink-0 font-medium">
              <a 
                href={resource.driveUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                Drive Link <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a 
                href={resource.downloadUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                download
                className="text-emerald-400 hover:underline flex items-center gap-1"
              >
                Download <Download className="w-3.5 h-3.5" />
              </a>
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                Report Issue <Flag className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
