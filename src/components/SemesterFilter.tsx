import React from 'react';
import { AcademicYear, AcademicSemester, ResourceCategory, Course } from '../types';
import { Filter, Layers, BookMarked, FileText, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SemesterFilterProps {
  selectedYear: AcademicYear | 'all';
  onSelectYear: (year: AcademicYear | 'all') => void;
  selectedSemester: AcademicSemester;
  onSelectSemester: (sem: AcademicSemester) => void;
  selectedCategory: ResourceCategory | 'all';
  onSelectCategory: (cat: ResourceCategory | 'all') => void;
  selectedCourseId: string;
  onSelectCourseId: (courseId: string) => void;
  availableCourses: Course[];
  activeCount: number;
}

export const SemesterFilter: React.FC<SemesterFilterProps> = ({
  selectedYear,
  onSelectYear,
  selectedSemester,
  onSelectSemester,
  selectedCategory,
  onSelectCategory,
  selectedCourseId,
  onSelectCourseId,
  availableCourses,
  activeCount,
}) => {
  const { t } = useLanguage();

  const years: { id: AcademicYear | 'all'; label: string }[] = [
    { id: 'all', label: t('allYears') },
    { id: 1, label: t('firstYear') },
    { id: 2, label: t('secondYear') },
    { id: 3, label: t('thirdYear') },
    { id: 4, label: t('fourthYear') },
    { id: 'msc', label: t('mscYear') },
  ];

  const categories: { id: ResourceCategory | 'all'; label: string }[] = [
    { id: 'all', label: t('allTypes') },
    { id: 'slides', label: t('lectureSlides') },
    { id: 'notes', label: t('classNotes') },
    { id: 'pyq', label: t('examBankPyqs') },
    { id: 'practical', label: t('labFieldManuals') },
    { id: 'book', label: t('refBooks') },
    { id: 'syllabus', label: t('syllabusGuides') },
  ];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 mb-6 shadow-xs space-y-4 transition-colors">
      
      {/* Tier 1: Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
          <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-500" />
          <span>{t('academicYearTier')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-100/90 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700/60 rounded-xl shadow-inner">
          {years.map((y) => (
            <button
              key={String(y.id)}
              onClick={() => {
                onSelectYear(y.id);
                onSelectCourseId('all');
              }}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedYear === y.id
                  ? 'bg-linear-to-r from-emerald-800 to-emerald-700 dark:from-emerald-700 dark:to-emerald-600 text-white font-bold shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/40 scale-[1.02]'
                  : 'text-stone-700 dark:text-stone-300 hover:text-emerald-800 dark:hover:text-white hover:bg-white dark:hover:bg-stone-700/80'
              }`}
            >
              {y.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tier 2: Semester & Course Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Semester Segmented Switch */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
            {t('semLabel')}
          </span>
          <div className="flex items-center gap-1 p-1 bg-stone-100/90 dark:bg-stone-800/90 border border-stone-200 dark:border-stone-700/70 rounded-xl shadow-inner">
            <button
              onClick={() => {
                onSelectSemester('all');
                onSelectCourseId('all');
              }}
              className={`px-3 py-1 text-xs rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSemester === 'all'
                  ? 'bg-linear-to-r from-emerald-800 to-emerald-700 dark:from-emerald-700 dark:to-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-500/30'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-700/60 font-medium'
              }`}
            >
              {t('bothSemesters')}
            </button>
            <button
              onClick={() => {
                onSelectSemester(1);
                onSelectCourseId('all');
              }}
              className={`px-3 py-1 text-xs rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSemester === 1
                  ? 'bg-linear-to-r from-emerald-800 to-emerald-700 dark:from-emerald-700 dark:to-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-500/30'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-700/60 font-medium'
              }`}
            >
              {t('semesterOne')}
            </button>
            <button
              onClick={() => {
                onSelectSemester(2);
                onSelectCourseId('all');
              }}
              className={`px-3 py-1 text-xs rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSemester === 2
                  ? 'bg-linear-to-r from-emerald-800 to-emerald-700 dark:from-emerald-700 dark:to-emerald-600 text-white font-bold shadow-xs ring-1 ring-emerald-500/30'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-700/60 font-medium'
              }`}
            >
              {t('semesterTwo')}
            </button>
          </div>
        </div>

        {/* Course Specific Filter Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 whitespace-nowrap">
            {t('courseLabel')}
          </span>
          <select
            value={selectedCourseId}
            onChange={(e) => onSelectCourseId(e.target.value)}
            className="w-full md:w-72 px-3 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium truncate shadow-2xs"
          >
            <option value="all">{t('allCoursesInSelection')}</option>
            {availableCourses.map((c) => (
              <option key={c.id} value={c.code}>
                {c.code} · {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tier 3: Category Filter Buttons & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 text-xs rounded-xl transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-linear-to-r from-emerald-800 to-emerald-700 dark:from-emerald-700 dark:to-emerald-600 text-white font-bold shadow-md shadow-emerald-950/20 border-emerald-600 ring-1 ring-emerald-400/40 scale-[1.02]'
                  : 'bg-stone-100 dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700/80 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-stone-700 font-medium shadow-2xs'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-500 dark:text-stone-400 font-mono whitespace-nowrap shrink-0 self-end sm:self-auto">
          {t('showingResources')} <span className="font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">{activeCount}</span> {activeCount === 1 ? t('resourceWord') : t('resourcesWord')}
        </div>
      </div>
    </div>
  );
};
