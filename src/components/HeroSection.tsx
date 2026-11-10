import React from 'react';
import { Search, X, BookOpen, FileCheck, Layers, TreePine, Sparkles, PlusCircle } from 'lucide-react';
import { ResourceCategory } from '../types';
import { CONTRIBUTE_FORM_URL } from '../config';
import heroImg from '../assets/images/hero_forestry_sust.webp';
import { useLanguage } from '../contexts/LanguageContext';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResources: number;
  totalCourses: number;
  totalPyqs: number;
  selectedCategory: ResourceCategory | 'all';
  onSelectCategory: (cat: ResourceCategory | 'all') => void;
  onSwitchToExamBank: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  totalResources,
  totalCourses,
  totalPyqs,
  selectedCategory,
  onSelectCategory,
  onSwitchToExamBank,
}) => {
  const { t } = useLanguage();

  return (
    <div className="relative mb-8 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-sm bg-stone-900 text-white">
      {/* Background Image Asset with measured contrast scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Lush campus forest canopy at the Department of Forestry and Environmental Science, SUST"
          width={1600}
          height={893}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
        />
        {/* Measured scrim to ensure 4.5:1 WCAG AA text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-stone-950/85 to-stone-950/65" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 md:py-14 text-center md:text-left">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-2">
              <TreePine className="w-4 h-4 text-emerald-400" />
              <span>{t('uniTitle')}</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight mb-3">
              {t('deptTitle')}
            </h1>
            
            <p className="text-stone-300 text-sm md:text-base leading-relaxed mb-6 font-normal">
              {t('heroSubtitle')}
            </p>

            {/* Instant Search Bar */}
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/95 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 text-sm border border-stone-200 dark:border-stone-700 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  aria-label={t('clearSearch')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Keyword Search Quick Cloud */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 mt-2.5 text-[11px]">
              <span className="text-emerald-400/80 font-medium text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {t('scanKeywords')}
              </span>
              {[
                'Silviculture',
                'Remote Sensing',
                'PYQ 2023',
                'Mensuration',
                'Forest Soils',
                'Dendrology',
                'EIA',
                'Wildlife',
                'Forest Act',
                'Belal Uddin',
              ].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => onSearchChange(kw)}
                  className={`px-2 py-0.5 rounded-md font-mono text-[10px] transition-all cursor-pointer ${
                    searchQuery.toLowerCase().includes(kw.toLowerCase())
                      ? 'bg-emerald-500 text-stone-950 font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-stone-200'
                  }`}
                >
                  #{kw}
                </button>
              ))}
            </div>

            {/* Fast Quick Filter Buttons */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4 text-xs">
              <span className="text-stone-400 font-medium mr-1">{t('filterLabel')}</span>

              <button
                onClick={onSwitchToExamBank}
                className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <FileCheck className="w-3 h-3 text-amber-400" />
                <span>{t('examBankPyqs')}</span>
              </button>
              <button
                onClick={() => onSelectCategory('slides')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedCategory === 'slides'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200'
                }`}
              >
                {t('lectureSlides')}
              </button>
              <button
                onClick={() => onSelectCategory('notes')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedCategory === 'notes'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200'
                }`}
              >
                {t('classNotes')}
              </button>
              <button
                onClick={() => onSelectCategory('practical')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedCategory === 'practical'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200'
                }`}
              >
                {t('labFieldManuals')}
              </button>
            </div>
          </div>

          {/* Quick Quantitative Proof Stats (adjacent to claim) */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:w-56 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-white/10 md:pl-6 text-left">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xl md:text-2xl font-bold font-mono text-emerald-300 tabular-nums">
                {totalResources}
              </div>
              <div className="text-xs text-stone-300 font-medium">{t('archivedResources')}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="text-xl md:text-2xl font-bold font-mono text-amber-300 tabular-nums">
                {totalPyqs}
              </div>
              <div className="text-xs text-stone-300 font-medium">{t('examQuestionPapers')}</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 hidden md:block">
              <div className="text-xl md:text-2xl font-bold font-mono text-stone-200 tabular-nums">
                {totalCourses}
              </div>
              <div className="text-xs text-stone-300 font-medium">{t('bscMscCourses')}</div>
            </div>

            <a
              href={CONTRIBUTE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 md:col-span-1 p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500/50 flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t('contributeResource')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
