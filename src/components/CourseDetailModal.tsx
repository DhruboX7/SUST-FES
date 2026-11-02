import React from 'react';
import { DetailedCourse } from '../data/coursesData';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  GraduationCap, 
  Layers, 
  Clock, 
  FileText, 
  ExternalLink,
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
  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 transition-colors">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
              <span>{course.code}</span>
              <span>·</span>
              <span className="capitalize">{course.courseType}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
              {course.title}
            </h2>
            <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 mt-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{course.credits} Credits ({course.hoursTheory}h Theory, {course.hoursLab}h Lab/wk)</span>
              </span>
              <span>·</span>
              <span>
                {course.year === 'msc' ? 'M.Sc.' : `${course.year}${course.year === 1 ? 'st' : course.year === 2 ? 'nd' : course.year === 3 ? 'rd' : 'th'} Year`}, Semester {course.semester}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Syllabus Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs sm:text-sm">
          
          {/* Rationale / Overview */}
          {course.description && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Course Description & Rationale
              </h3>
              <p className="text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800">
                {course.description}
              </p>
            </div>
          )}

          {/* Objectives */}
          {course.objectives && course.objectives.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Course Objectives
              </h3>
              <ul className="space-y-1.5 list-disc list-inside text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800">
                {course.objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Detailed Course Content / Chapters */}
          {course.contents && course.contents.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                OBE Course Syllabus Content
              </h3>
              <div className="space-y-2 bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800">
                {course.contents.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-stone-700 dark:text-stone-300 leading-relaxed">
                    <span className="font-mono text-emerald-700 font-bold shrink-0 mt-0.5">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended References */}
          {course.recommendedBooks && course.recommendedBooks.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Recommended Textbooks & References
              </h3>
              <div className="space-y-2 bg-stone-50 dark:bg-stone-800/40 p-4 rounded-xl border border-stone-100 dark:border-stone-800">
                {course.recommendedBooks.map((ref, idx) => (
                  <div key={idx} className="text-xs text-stone-600 dark:text-stone-400 italic font-serif">
                    {idx + 1}. {ref}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assessment & Marks Distribution */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Official SUST FES Marks Distribution
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="font-bold text-base font-mono text-emerald-700 dark:text-emerald-400">10%</div>
                <div className="text-stone-500 text-[11px]">Class Attendance</div>
              </div>
              <div className="p-3 rounded-lg bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                <div className="font-bold text-base font-mono text-amber-600 dark:text-amber-400">20%</div>
                <div className="text-stone-500 text-[11px]">Term-Test Exams</div>
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
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex items-center justify-between gap-3">
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
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Study Resources for this Course</span>
          </button>
        </div>

      </div>
    </div>
  );
};
