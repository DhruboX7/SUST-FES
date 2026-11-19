import React from 'react';
import { Search, X, FileCheck, PlusCircle, Camera } from 'lucide-react';
import { ResourceCategory } from '../types';
import { CONTRIBUTE_FORM_URL } from '../config';
import heroImg from '../assets/images/hero_forestry_sust.webp';
import { useLanguage } from '../contexts/LanguageContext';
import { SustLogo } from './SustLogo';

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
    <section
      aria-label="Departmental Digital Forest Library Overview"
      className="relative mb-8 rounded-lg overflow-hidden border border-[#BBC4A6] dark:border-[#BBC4A6]/25 bg-[#19382B] text-[#F3F1E8]"
    >
      {/* Authentic Campus Forest Backdrop with Subtle Editorial Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Sylhet forest canopy and lush woodland research landscape surrounding Shahjalal University of Science and Technology"
          width={1600}
          height={900}
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#19382B]/78" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 md:py-14">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-2xl text-left">
            <div className="flex flex-wrap items-center gap-2.5 text-[#BBC4A6] text-xs font-medium tracking-wider uppercase mb-3">
              <SustLogo size="sm" className="border-[#BBC4A6]/40" />
              <span>{t('uniTitle')}</span>
              <span aria-hidden="true" className="text-[#987453]">·</span>
              <span className="font-scientific text-sm normal-case tracking-wide text-[#F3F1E8]">
                {t('editorialMotto')}
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl md:text-[2.65rem] font-semibold tracking-tight text-[#F3F1E8] leading-[1.15] mb-3.5">
              {t('deptTitle')}
            </h1>

            <p className="text-[#F3F1E8]/85 text-sm md:text-base leading-relaxed mb-6 max-w-xl">
              {t('heroSubtitle')}
            </p>

            {/* Instant Search Bar */}
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#42684D]">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-10 pr-10 py-3 rounded-md bg-[#FAF9F4] text-[#19382B] placeholder:text-[#42684D]/75 text-sm border border-[#BBC4A6] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#BBC4A6] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label={t('clearSearch')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#42684D] hover:text-[#19382B] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Keyword Search Quick Cloud */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px]">
              <span className="text-[#BBC4A6] font-medium text-[10px] uppercase tracking-wider mr-0.5">
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
              ].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => onSearchChange(kw)}
                  className={`px-2 py-0.5 rounded-sm font-mono text-[10px] transition-colors cursor-pointer border ${
                    searchQuery.toLowerCase().includes(kw.toLowerCase())
                      ? 'bg-[#F3F1E8] text-[#19382B] border-[#F3F1E8] font-semibold'
                      : 'bg-[#142D22]/80 hover:bg-[#42684D] border-[#8A9C74]/40 text-[#F3F1E8]'
                  }`}
                >
                  {kw}
                </button>
              ))}
            </div>

            {/* Category Quick Controls */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
              <span className="text-[#BBC4A6] font-medium mr-1">{t('filterLabel')}</span>

              <button
                type="button"
                onClick={onSwitchToExamBank}
                className="px-3 py-1.5 rounded-md bg-[#987453] hover:bg-[#987453]/90 text-[#FAF9F4] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>{t('examBankPyqs')}</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory('slides')}
                className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                  selectedCategory === 'slides'
                    ? 'bg-[#F3F1E8] text-[#19382B] border-[#F3F1E8] font-semibold'
                    : 'bg-[#142D22]/75 hover:bg-[#42684D] border-[#8A9C74]/40 text-[#F3F1E8]'
                }`}
              >
                {t('lectureSlides')}
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory('notes')}
                className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                  selectedCategory === 'notes'
                    ? 'bg-[#F3F1E8] text-[#19382B] border-[#F3F1E8] font-semibold'
                    : 'bg-[#142D22]/75 hover:bg-[#42684D] border-[#8A9C74]/40 text-[#F3F1E8]'
                }`}
              >
                {t('classNotes')}
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory('practical')}
                className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
                  selectedCategory === 'practical'
                    ? 'bg-[#F3F1E8] text-[#19382B] border-[#F3F1E8] font-semibold'
                    : 'bg-[#142D22]/75 hover:bg-[#42684D] border-[#8A9C74]/40 text-[#F3F1E8]'
                }`}
              >
                {t('labFieldManuals')}
              </button>
            </div>
          </div>

          {/* Editorial Stat Ledger & Photo Credit */}
          <div className="flex flex-col gap-3 lg:w-60 shrink-0 pt-5 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#BBC4A6]/25 lg:pl-6 text-left">
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5">
              <div className="p-3 rounded-md bg-[#142D22]/85 border border-[#8A9C74]/35">
                <div className="font-editorial text-xl md:text-2xl font-semibold text-[#F3F1E8] tabular-nums">
                  {totalResources}
                </div>
                <div className="text-[11px] text-[#BBC4A6] font-normal">{t('archivedResources')}</div>
              </div>
              <div className="p-3 rounded-md bg-[#42684D]/85 border border-[#BBC4A6]/35">
                <div className="font-editorial text-xl md:text-2xl font-semibold text-[#F3F1E8] tabular-nums">
                  {totalPyqs}
                </div>
                <div className="text-[11px] text-[#F3F1E8]/85 font-normal">{t('examQuestionPapers')}</div>
              </div>
              <div className="p-3 rounded-md bg-[#987453]/85 border border-[#F3F1E8]/20">
                <div className="font-editorial text-xl md:text-2xl font-semibold text-[#FAF9F4] tabular-nums">
                  {totalCourses}
                </div>
                <div className="text-[11px] text-[#FAF9F4]/90 font-normal">{t('bscMscCourses')}</div>
              </div>
            </div>

            <a
              href={CONTRIBUTE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-md bg-[#F3F1E8] hover:bg-[#FAF9F4] text-[#19382B] flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#42684D]" />
              <span>{t('contributeResource')}</span>
            </a>

            <div className="flex items-center gap-1.5 text-[10px] text-[#BBC4A6]/90 pt-0.5">
              <Camera className="w-3 h-3 shrink-0 text-[#8A9C74]" />
              <span className="truncate">Photograph · SUST Arboretum &amp; Campus Forest</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
