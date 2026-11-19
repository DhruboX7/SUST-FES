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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#11261D]/85 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-detail-title"
    >
      <div
        ref={modalRef}
        className="bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[#19382B] dark:text-[#F3F1E8] transition-colors"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 bg-[#EAE7DA] dark:bg-[#142D22] shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#987453] dark:text-[#8A9C74] mb-1">
              <span>{course.code}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{course.courseType}</span>
            </div>
            <h2 id="course-detail-title" className="font-editorial text-xl sm:text-2xl font-semibold text-[#19382B] dark:text-[#F3F1E8] tracking-tight">
              {course.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-[#42684D] dark:text-[#BBC4A6] mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#8A9C74]" />
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
            className="p-2 rounded-md text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B] transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#42684D]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Objectives & Outcomes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74] mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
              <span>Course Rationale & Objectives</span>
            </h3>
            <p className="text-sm text-[#19382B] dark:text-[#F3F1E8] leading-relaxed bg-[#F3F1E8] dark:bg-[#142D22] p-4 rounded-md border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
              {course.rationale}
            </p>
          </div>

          {/* Intended Learning Outcomes */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74] mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-[#987453] dark:text-[#8A9C74]" />
              <span>Intended Learning Outcomes (CLOs)</span>
            </h3>
            <div className="space-y-2">
              {(course.learningOutcomes || course.objectives || []).map((clo, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#42684D] dark:text-[#BBC4A6]">
                  <span className="font-mono font-bold text-[#987453] dark:text-[#8A9C74] shrink-0 mt-0.5">
                    CLO {i + 1}:
                  </span>
                  <span>{clo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Syllabus Chapters / Content */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74] mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
              <span>Official Syllabus Chapters & Topic Modules</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(course.contents || []).map((topic, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-md bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-xs font-medium text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2"
                >
                  <span className="w-5 h-5 rounded-sm bg-[#EAE7DA] dark:bg-[#19382B] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/25 text-[#42684D] dark:text-[#BBC4A6] flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="truncate">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assessment Scheme */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74] mb-2">
              Assessment Scheme (OBE Standard)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-md bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                <div className="font-bold text-base font-mono text-[#42684D] dark:text-[#8A9C74]">10%</div>
                <div className="text-[#42684D] dark:text-[#BBC4A6] text-[11px]">Class Attendance</div>
              </div>
              <div className="p-3 rounded-md bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                <div className="font-bold text-base font-mono text-[#987453] dark:text-[#BBC4A6]">20%</div>
                <div className="text-[#42684D] dark:text-[#BBC4A6] text-[11px]">Midterm / Term Test</div>
              </div>
              <div className="p-3 rounded-md bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                <div className="font-bold text-base font-mono text-[#8A9C74] dark:text-[#BBC4A6]">10%</div>
                <div className="text-[#42684D] dark:text-[#BBC4A6] text-[11px]">Quizzes / Performance</div>
              </div>
              <div className="p-3 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25">
                <div className="font-bold text-base font-mono text-[#19382B] dark:text-[#F3F1E8]">60%</div>
                <div className="text-[#42684D] dark:text-[#BBC4A6] text-[11px]">Semester Final Exam</div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 bg-[#EAE7DA] dark:bg-[#142D22] flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href="/assets/aistudio/Final_BSc_Curriculum-2025-2026_9f635d9c.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] font-semibold hover:underline flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>Open Complete OBE Curriculum PDF</span>
          </a>

          <button
            onClick={() => {
              onClose();
              onViewResources(course.code);
            }}
            className="px-5 py-2 bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#42684D]"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Study Resources for this Course</span>
          </button>
        </div>

      </div>
    </div>
  );
};
