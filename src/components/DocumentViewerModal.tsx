import React, { useState } from 'react';
import { ResourceItem } from '../types';
import { 
  X, 
  Download, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  AlertCircle,
  FileText
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

  if (!resource) return null;

  const handleCopy = () => {
    onCopyLink(resource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      
      {/* Modal Container */}
      <div 
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
              <span>·</span>
              <span className="truncate">{resource.courseTitle}</span>
              {resource.sessionYear && (
                <>
                  <span>·</span>
                  <span>{resource.sessionYear}</span>
                </>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-stone-100 truncate">
              {resource.title}
            </h2>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Copy Link */}
            <button
              onClick={handleCopy}
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs"
              title="Copy link"
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
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs"
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
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors flex items-center gap-1.5 text-xs"
              title="Open in Google Drive"
            >
              <ExternalLink className="w-4 h-4 text-sky-400" />
              <span className="hidden md:inline">Open in Drive</span>
            </a>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-red-950/50 hover:text-red-400 transition-colors"
              title="Close viewer"
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
              <p className="max-w-md text-sm text-stone-400 mb-6">
                This document requires authentication or has third-party cookie restrictions in your current browser. You can still download or open it directly in Google Drive!
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={resource.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in Google Drive</span>
                </a>
                <a
                  href={resource.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
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

          {/* Quick Troubleshooting Bar at Bottom */}
          <div className="px-4 py-2 bg-stone-900 border-t border-stone-800 text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
            <span>
              If preview is blocked by Google account sign-in, use the download button or open in Google Drive.
            </span>
            <div className="flex items-center gap-3 shrink-0">
              <a 
                href={resource.driveUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                Drive Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
