import React from 'react';
import { Link } from 'react-router-dom';
import { TreePine, Home, ArrowLeft } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';

export const NotFoundView: React.FC = () => {
  usePageMeta({
    title: 'Page Not Found (404)',
    description: 'The requested page could not be found in the SUST FES Academic Resource Library.',
  });

  return (
    <div className="py-20 text-center max-w-lg mx-auto px-4 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
        <TreePine className="w-8 h-8" />
      </div>
      <span className="font-mono text-emerald-800 dark:text-emerald-400 text-sm font-bold">404 ERROR</span>
      <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1 mb-3">
        Off the Beaten Trail
      </h1>
      <p className="text-sm text-stone-600 dark:text-stone-400 mb-8 leading-relaxed">
        The page or academic document you are looking for does not exist in the SUST FES Library archive or has been moved.
      </p>
      <div className="flex items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
        <Link
          to="/syllabus"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore Syllabus</span>
        </Link>
      </div>
    </div>
  );
};
