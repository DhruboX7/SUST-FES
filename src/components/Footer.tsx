import React from 'react';
import { TreePine, Heart, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onSelectTab: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onSelectTab }) => {
  return (
    <footer className="mt-16 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-500 dark:text-stone-400 text-xs py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Department */}
        <div className="flex items-center gap-2">
          <TreePine className="w-4 h-4 text-emerald-800 dark:text-emerald-500" />
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            Department of Forestry and Environmental Science
          </span>
          <span aria-hidden="true">·</span>
          <span>SUST, Sylhet</span>
        </div>

        {/* Navigation & Admin */}
        <div className="flex items-center gap-5 text-stone-600 dark:text-stone-400">
          <button 
            onClick={() => onSelectTab('catalog')} 
            className="hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            Study Catalog
          </button>
          <button 
            onClick={() => onSelectTab('pyq')} 
            className="hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            Exam Bank
          </button>
          <button 
            onClick={() => onSelectTab('syllabus')} 
            className="hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            Syllabus
          </button>
          <button 
            onClick={() => onSelectTab('progress')} 
            className="hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            Syllabus Progress Report
          </button>
          <button 
            onClick={onOpenAdmin} 
            className="text-emerald-800 dark:text-emerald-400 font-medium hover:underline flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Entry</span>
          </button>
        </div>

        {/* Copyright */}
        <div className="text-stone-400 dark:text-stone-500">
          Academic Knowledge Archive · Non-Commercial Educational Directory
        </div>

      </div>
    </footer>
  );
};
