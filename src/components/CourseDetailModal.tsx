import React, { useEffect, useRef } from 'react';
import { DetailedCourse } from '../data/coursesData';
import { 
  X, 
  BookOpen, 
  GraduationCap, 
  Layers, 
  Clock, 
  FileText, 
  Search
} from 'lucide-react';

interface CourseDetailModalProps {
  course: DetailedCourse | null;
  onClose: () => void;
  onViewResources: (courseCode: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onViewResources,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!course) return;
    previousActiveElement.current = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [course, onClose]);

  if (!course) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-detail-title"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 transition-colors"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
              <span>{course.code}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{course.courseType}</span>
            </div>
            <h2 id="course-detail-title" className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              {course.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{course.credits} Credits ({course.hoursTheory}h Theory, {course.hoursLab}h Lab/wk)</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {course.year === 'msc' ? 'M.Sc.' : `${course.year}${course.year === 1 ? 'st' : course.year === 2 ? 'nd' : course.year === 3 ? 'rd' : 'th'} Year`}, Semester {course.semester}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close course details"
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:bg-stone-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Objectives & Outcomes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Course Rationale & Objectives</span>
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-950 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
              {course.rationale}
            </p>
          </div>

          {/* Intended Learning Outcomes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Intended Learning Outcomes (CLOs)</span>
            </h3>
            <div className="space-y-2">
              {(course.learningOutcomes || course.objectives || []).map((clo, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-300">
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5">
                    CLO {i + 1}:
                  </span>
                  <span>{clo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Syllabus Chapters / Content */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Official Syllabus Chapters & Topic Modules</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(course.contents || []).map((topic, i) => (
                <div 
                  key={i} 
                  className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 flex items-center justify-center font-mono text-[10px] shrink-0">
                    {i + 1}
                  </span>
                  <span className="truncate">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Scheme */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              Assessment Scheme (OBE Standard)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="font-bold text-base font-mono text-emerald-700 dark:text-emerald-400">10%</div>
                <div className="text-stone-500 text-[11px]">Class Attendance</div>
              </div>
              <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="font-bold text-base font-mono text-emerald-700 dark:text-emerald-400">20%</div>
                <div className="text-stone-500 text-[11px]">Midterm / Term Test</div>
              </div>
              <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="font-bold text-base font-mono text-teal-600 dark:text-teal-400">10%</div>
                <div className="text-stone-500 text-[11px]">Quizzes / Performance</div>
              </div>
              <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="font-bold text-base font-mono text-stone-800 dark:text-stone-200">60%</div>
                <div className="text-stone-500 text-[11px]">Semester Final Exam</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="/assets/aistudio/Final_BSc_Curriculum-2025-2026_9f635d9c.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-800 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Open Complete OBE Curriculum PDF</span>
          </a>

          <button
            onClick={() => {
              onClose();
              onViewResources(course.code);
            }}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Study Resources for this Course</span>
          </button>
        </div>

      </div>
    </div>
  );
};
