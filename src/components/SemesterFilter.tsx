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
    <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 mb-6 space-y-4 transition-colors">
      
      {/* Tier 1: Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] uppercase tracking-wider">
          <Layers className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
          <span>{t('academicYearTier')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 rounded-md">
          {years.map((y) => (
            <button
              type="button"
              key={String(y.id)}
              onClick={() => {
                onSelectYear(y.id);
                onSelectCourseId('all');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedYear === y.id
                  ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] font-semibold'
                  : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B]'
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
          <span className="text-xs font-semibold text-[#987453] dark:text-[#BBC4A6] whitespace-nowrap">
            {t('semLabel')}
          </span>
          <div className="flex items-center gap-1 p-1 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 rounded-md">
            <button
              type="button"
              onClick={() => {
                onSelectSemester('all');
                onSelectCourseId('all');
              }}
              className={`px-3 py-1 text-xs rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSemester === 'all'
                  ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] font-semibold'
                  : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B] font-medium'
              }`}
            >
              {t('bothSemesters')}
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectSemester(1);
                onSelectCourseId('all');
              }}
              className={`px-3 py-1 text-xs rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSemester === 1
                  ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] font-semibold'
                  : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B] font-medium'
              }`}
            >
              {t('semesterOne')}
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectSemester(2);
                onSelectCourseId('all');
              }}
              className={`px-3 py-1 text-xs rounded-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedSemester === 2
                  ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] font-semibold'
                  : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B] font-medium'
              }`}
            >
              {t('semesterTwo')}
            </button>
          </div>
        </div>

        {/* Course Specific Filter Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-[#987453] dark:text-[#BBC4A6] whitespace-nowrap">
            {t('courseLabel')}
          </span>
          <select
            value={selectedCourseId}
            onChange={(e) => onSelectCourseId(e.target.value)}
            className="w-full md:w-72 px-3 py-1.5 text-xs rounded-md bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 focus:outline-none focus:ring-2 focus:ring-[#42684D] font-medium truncate"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-[#42684D] text-[#F3F1E8] font-semibold border-[#42684D]'
                  : 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#BBC4A6] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:border-[#42684D] font-medium'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#42684D] dark:text-[#BBC4A6] font-mono whitespace-nowrap shrink-0 self-end sm:self-auto">
          {t('showingResources')} <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8] tabular-nums">{activeCount}</span> {activeCount === 1 ? t('resourceWord') : t('resourcesWord')}
        </div>
      </div>
    </div>
  );
};
