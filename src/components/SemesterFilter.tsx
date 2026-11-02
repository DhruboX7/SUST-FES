import React from 'react';
import { AcademicYear, AcademicSemester, ResourceCategory, Course } from '../types';
import { Filter, Layers, BookMarked, FileText, CheckCircle2 } from 'lucide-react';

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
  const years: { id: AcademicYear | 'all'; label: string }[] = [
    { id: 'all', label: 'All Years' },
    { id: 1, label: '1st Year' },
    { id: 2, label: '2nd Year' },
    { id: 3, label: '3rd Year' },
    { id: 4, label: '4th Year' },
    { id: 'msc', label: 'M.Sc. / Thesis' },
  ];

  const categories: { id: ResourceCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All Types' },
    { id: 'slides', label: 'Lecture Slides' },
    { id: 'notes', label: 'Class Notes' },
    { id: 'pyq', label: 'Previous Questions (PYQs)' },
    { id: 'practical', label: 'Lab & Field Manuals' },
    { id: 'book', label: 'Reference Books' },
    { id: 'syllabus', label: 'Syllabus & Guides' },
  ];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 p-4 mb-6 shadow-xs space-y-4 transition-colors">
      
      {/* Tier 1: Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
          <span>Academic Year:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-lg">
          {years.map((y) => (
            <button
              key={String(y.id)}
              onClick={() => {
                onSelectYear(y.id);
                onSelectCourseId('all');
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedYear === y.id
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
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
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
            Semester:
          </span>
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg">
            <button
              onClick={() => {
                onSelectSemester('all');
                onSelectCourseId('all');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedSemester === 'all'
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Both Semesters
            </button>
            <button
              onClick={() => {
                onSelectSemester(1);
                onSelectCourseId('all');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedSemester === 1
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Semester I
            </button>
            <button
              onClick={() => {
                onSelectSemester(2);
                onSelectCourseId('all');
              }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedSemester === 2
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              Semester II
            </button>
          </div>
        </div>

        {/* Course Specific Filter Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 whitespace-nowrap">
            Course:
          </span>
          <select
            value={selectedCourseId}
            onChange={(e) => onSelectCourseId(e.target.value)}
            className="w-full md:w-72 px-3 py-1.5 text-xs rounded-lg bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-600 truncate"
          >
            <option value="all">All Courses in this Selection</option>
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
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-stone-500 dark:text-stone-400 font-mono whitespace-nowrap shrink-0 self-end sm:self-auto">
          Showing <span className="font-semibold text-stone-900 dark:text-stone-100 tabular-nums">{activeCount}</span> resource{activeCount === 1 ? '' : 's'}
        </div>
      </div>
    </div>
  );
};
