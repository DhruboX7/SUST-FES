import React from 'react';
import { Link } from 'react-router-dom';
import { TreePine, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-16 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-500 dark:text-stone-400 text-xs py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Department */}
        <div className="flex items-center gap-2">
          <TreePine className="w-4 h-4 text-emerald-800 dark:text-emerald-500" />
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            {t('deptTitle')}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t('sustSylhet')}</span>
        </div>

        {/* Navigation & Admin Links */}
        <div className="flex items-center gap-4 sm:gap-5 text-stone-600 dark:text-stone-400 flex-wrap">
          <Link to="/" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            {t('catalog')}
          </Link>
          <Link to="/pyq" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            {t('pyq')}
          </Link>
          <Link to="/syllabus" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            {t('syllabus')}
          </Link>
          <Link to="/progress" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            {t('progress')}
          </Link>
          <Link to="/tools/cgpa" className="hover:text-stone-900 dark:hover:text-white transition-colors">
            {t('cgpa')}
          </Link>
          <Link 
            to="/manage" 
            className="text-emerald-800 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('adminEntry')}</span>
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-stone-400 dark:text-stone-500">
          {t('academicArchiveFooter')}
        </div>

      </div>
    </footer>
  );
};
