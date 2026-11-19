import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
import { SustLogo } from './SustLogo';

export const NotFoundView: React.FC = () => {
  usePageMeta({
    title: 'Page Not Found (404)',
    description: 'The requested page could not be found in the SUST FES Academic Resource Library.',
  });

  return (
    <div className="py-20 text-center max-w-lg mx-auto px-4 animate-fade-in">
      <SustLogo size="xl" className="mx-auto mb-4" />
      <span className="font-mono text-[#987453] dark:text-[#BBC4A6] text-xs font-semibold uppercase tracking-widest">
        404 · Trail Not Found
      </span>
      <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#19382B] dark:text-[#F3F1E8] mt-1.5 mb-3 tracking-tight">
        Off the Beaten Trail
      </h1>
      <p className="text-sm text-[#42684D] dark:text-[#BBC4A6] mb-8 leading-relaxed">
        The page or academic document you are looking for does not exist in the SUST FES Library archive or has been moved.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] text-[#F3F1E8] rounded-md text-xs font-semibold shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
        <Link
          to="/syllabus"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EAE7DA] dark:bg-[#19382B] hover:bg-[#BBC4A6]/40 dark:hover:bg-[#42684D]/40 border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] rounded-md text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Syllabus</span>
        </Link>
      </div>
    </div>
  );
};
