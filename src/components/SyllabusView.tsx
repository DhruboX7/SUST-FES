import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SUST_FES_COURSES, DetailedCourse } from '../data/coursesData';
import { AcademicYear } from '../types';
import { CourseDetailModal } from './CourseDetailModal';
import { SyllabusProgressTracker } from './SyllabusProgressTracker';
import { usePageMeta } from '../hooks/usePageMeta';
import { 
  Compass, 
  BookOpen, 
  Layers, 
  ArrowRight, 
  Download, 
  FileText, 
  Award, 
  CheckCircle2,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

interface SyllabusViewProps {
  onSelectCourse: (courseCode: string, year: AcademicYear) => void;
  onNavigateToProgress?: () => void;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({ 
  onSelectCourse,
  onNavigateToProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'progress' | 'grading'>('courses');
  const [activeYear, setActiveYear] = useState<AcademicYear>(1);
  const [inspectCourse, setInspectCourse] = useState<DetailedCourse | null>(null);
  usePageMeta({
    title: 'Syllabus & Degree Structure',
    description: 'Curriculum structure, OBE course outlines, learning outcomes, and credit requirements for B.Sc. and M.Sc. degrees.',
  });

  const semesterPairs: { [key: string]: { sem1: DetailedCourse[]; sem2: DetailedCourse[]; label1: string; label2: string; cred1: number; cred2: number } } = {
    '1': {
      sem1: SUST_FES_COURSES.filter((c) => c.year === 1 && c.semester === 1),
      sem2: SUST_FES_COURSES.filter((c) => c.year === 1 && c.semester === 2),
      label1: 'First Year · First Semester',
      label2: 'First Year · Second Semester',
      cred1: 20,
      cred2: 22,
    },
    '2': {
      sem1: SUST_FES_COURSES.filter((c) => c.year === 2 && c.semester === 1),
      sem2: SUST_FES_COURSES.filter((c) => c.year === 2 && c.semester === 2),
      label1: 'Second Year · First Semester',
      label2: 'Second Year · Second Semester',
      cred1: 20,
      cred2: 22,
    },
    '3': {
      sem1: SUST_FES_COURSES.filter((c) => c.year === 3 && c.semester === 1),
      sem2: SUST_FES_COURSES.filter((c) => c.year === 3 && c.semester === 2),
      label1: 'Third Year · First Semester',
      label2: 'Third Year · Second Semester',
      cred1: 20,
      cred2: 23,
    },
    '4': {
      sem1: SUST_FES_COURSES.filter((c) => c.year === 4 && c.semester === 1),
      sem2: SUST_FES_COURSES.filter((c) => c.year === 4 && c.semester === 2),
      label1: 'Fourth Year · First Semester',
      label2: 'Fourth Year · Second Semester',
      cred1: 23,
      cred2: 17,
    },
  };

  const currentPair = semesterPairs[String(activeYear)] || semesterPairs['1'];

  return (
    <div className="space-y-6">

      {/* Official Curriculum Banner */}
      <div className="bg-[#19382B] rounded-lg border border-[#42684D]/40 p-6 sm:p-8 text-[#F3F1E8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[#BBC4A6] text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-4 h-4 text-[#8A9C74]" />
            <span>Official Outcome-Based Education (OBE) Curriculum · Session 2025-26</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[#F3F1E8]">
            B.Sc. (Honours) in Forestry Curriculum Guide
          </h1>
          <p className="text-[#BBC4A6] text-xs sm:text-sm leading-relaxed">
            Approved curriculum for the Department of Forestry & Environmental Science at Shahjalal University of Science and Technology. 160 total graduating credits across 8 semesters, structured into Core, General Education (GED), Sessional Labs, and Capstone projects.
          </p>
        </div>

        {/* Direct PDF Download / View Button */}
        <div className="shrink-0 flex flex-col gap-2">
          <a
            href="/assets/aistudio/Final_BSc_Curriculum-2025-2026_9f635d9c.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download="SUST_FES_OBE_Curriculum_2025-26.pdf"
            className="px-5 py-3 bg-[#42684D] hover:bg-[#8A9C74] text-[#F3F1E8] hover:text-[#19382B] rounded-md text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Curriculum (PDF)</span>
          </a>
          <span className="text-[11px] text-[#BBC4A6]/80 text-center font-mono">
            142 Pages · Complete Syllabus Book
          </span>
        </div>
      </div>

      {/* Primary Section Switcher */}
      <div className="bg-[#EAE7DA] dark:bg-[#142D22] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-1.5 flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-[#42684D] text-[#F3F1E8] shadow-xs'
              : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B]'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Semester-wise Course Matrix</span>
        </button>
        <button
          onClick={() => {
            if (onNavigateToProgress) {
              onNavigateToProgress();
            } else {
              setActiveTab('progress');
            }
          }}
          className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'progress'
              ? 'bg-[#42684D] text-[#F3F1E8] shadow-xs'
              : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B]'
          }`}
          title="Open Syllabus Academic Progress Report (160 Credits)"
        >
          <CheckCircle2 className="w-4 h-4 text-[#987453] dark:text-[#8A9C74]" />
          <span>Syllabus Academic Progress (Progress Report)</span>
        </button>
        <button
          onClick={() => setActiveTab('grading')}
          className={`px-4 py-2 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'grading'
              ? 'bg-[#42684D] text-[#F3F1E8] shadow-xs'
              : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Grading & Evaluation Policy</span>
        </button>
      </div>

      {/* TAB 1: COURSES MATRIX */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Year Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#EAE7DA] dark:bg-[#142D22] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20">
            {([1, 2, 3, 4] as AcademicYear[]).map((yr) => (
              <button
                key={String(yr)}
                onClick={() => setActiveYear(yr)}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeYear === yr
                    ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] shadow-xs'
                    : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B]'
                }`}
              >
                {yr === 1 ? 'First Year (42 Credits)' : yr === 2 ? 'Second Year (42 Credits)' : yr === 3 ? 'Third Year (43 Credits)' : 'Fourth Year (40 Credits)'}
              </button>
            ))}
          </div>

          {/* 2-Column Split: Semester 1 and Semester 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Semester 1 Box */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 pb-3 mb-4">
                  <div>
                    <h2 className="font-editorial font-semibold text-base text-[#19382B] dark:text-[#F3F1E8]">
                      {currentPair.label1}
                    </h2>
                    <div className="text-[11px] text-[#8A9C74]">Total 14 Weeks Classes + 2 Weeks Prep + 4 Weeks Finals</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#19382B] dark:text-[#F3F1E8] bg-[#EAE7DA] dark:bg-[#142D22] px-2.5 py-1 rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25">
                    {currentPair.cred1} Credits
                  </span>
                </div>

                <div className="space-y-3">
                  {currentPair.sem1.map((course) => (
                    <div
                      key={course.id}
                      className="p-3.5 rounded-md border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22] hover:border-[#42684D] transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-[#8A9C74]">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-bold text-[#987453] dark:text-[#BBC4A6]">{course.code}</span>
                          </div>
                          <span className="text-[11px] font-medium capitalize text-[#42684D] dark:text-[#8A9C74]">
                            {course.credits} Credits ({course.courseType})
                          </span>
                        </div>

                        <h4
                          onClick={() => setInspectCourse(course)}
                          className="text-sm font-bold text-[#19382B] dark:text-[#F3F1E8] hover:text-[#42684D] dark:hover:text-[#BBC4A6] cursor-pointer transition-colors leading-snug mb-1"
                        >
                          {course.title}
                        </h4>

                        <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] line-clamp-2 leading-relaxed mb-3">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#BBC4A6]/40 dark:border-[#BBC4A6]/15 text-xs">
                        <button
                          onClick={() => setInspectCourse(course)}
                          className="text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] font-semibold hover:underline flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>View Full Syllabus & Books</span>
                        </button>
                        <button
                          onClick={() => onSelectCourse(course.code, course.year)}
                          className="text-[#987453] dark:text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] font-medium flex items-center gap-1"
                        >
                          <span>Study Files</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Semester 2 Box */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 pb-3 mb-4">
                  <div>
                    <h2 className="font-editorial font-semibold text-base text-[#19382B] dark:text-[#F3F1E8]">
                      {currentPair.label2}
                    </h2>
                    <div className="text-[11px] text-[#8A9C74]">Total 14 Weeks Classes + 2 Weeks Prep + 4 Weeks Finals</div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#19382B] dark:text-[#F3F1E8] bg-[#EAE7DA] dark:bg-[#142D22] px-2.5 py-1 rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25">
                    {currentPair.cred2} Credits
                  </span>
                </div>

                <div className="space-y-3">
                  {currentPair.sem2.map((course) => (
                    <div
                      key={course.id}
                      className="p-3.5 rounded-md border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22] hover:border-[#42684D] transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5 text-xs text-[#8A9C74]">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-bold text-[#987453] dark:text-[#BBC4A6]">{course.code}</span>
                          </div>
                          <span className="text-[11px] font-medium capitalize text-[#42684D] dark:text-[#8A9C74]">
                            {course.credits} Credits ({course.courseType})
                          </span>
                        </div>

                        <h4
                          onClick={() => setInspectCourse(course)}
                          className="text-sm font-bold text-[#19382B] dark:text-[#F3F1E8] hover:text-[#42684D] dark:hover:text-[#BBC4A6] cursor-pointer transition-colors leading-snug mb-1"
                        >
                          {course.title}
                        </h4>

                        <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] line-clamp-2 leading-relaxed mb-3">
                          {course.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#BBC4A6]/40 dark:border-[#BBC4A6]/15 text-xs">
                        <button
                          onClick={() => setInspectCourse(course)}
                          className="text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] font-semibold hover:underline flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>View Full Syllabus & Books</span>
                        </button>
                        <button
                          onClick={() => onSelectCourse(course.code, course.year)}
                          className="text-[#987453] dark:text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] font-medium flex items-center gap-1"
                        >
                          <span>Study Files</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB: ACADEMIC PROGRESS TRACKER (Course & Topic-by-Topic Checklist) */}
      {activeTab === 'progress' && (
        <SyllabusProgressTracker
          onJumpToCourseCatalog={onSelectCourse}
          onNavigateToSyllabus={() => setActiveTab('courses')}
        />
      )}

      {/* TAB 2: GRADING & EVALUATION POLICY (From Part D of OBE Curriculum) */}
      {activeTab === 'grading' && (
        <div className="space-y-6">
          <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <h2 className="font-editorial text-xl font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                Continuous Evaluation & Marks Distribution
              </h2>
              <p className="text-xs text-[#42684D] dark:text-[#BBC4A6]">
                Official assessment framework specified in Part D (Section 20) of the SUST FES OBE Curriculum.
              </p>
            </div>

            {/* Assessment Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22]">
                <div className="text-2xl font-bold font-mono text-[#42684D] dark:text-[#BBC4A6]">10%</div>
                <div className="font-semibold text-xs text-[#19382B] dark:text-[#F3F1E8] mt-1">Class Attendance</div>
                <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74] mt-1">95%+ = 10 marks, 90-94% = 9 marks, 85-89% = 8 marks, below 60% = 0 marks.</div>
              </div>

              <div className="p-4 rounded-md border border-[#987453]/40 dark:border-[#987453]/40 bg-[#F3F1E8] dark:bg-[#142D22]">
                <div className="text-2xl font-bold font-mono text-[#987453] dark:text-[#BBC4A6]">20%</div>
                <div className="font-semibold text-xs text-[#19382B] dark:text-[#F3F1E8] mt-1">Term-Test Exams</div>
                <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74] mt-1">Midterm written examinations administered during the 14-week semester.</div>
              </div>

              <div className="p-4 rounded-md border border-[#8A9C74]/50 dark:border-[#8A9C74]/30 bg-[#F3F1E8] dark:bg-[#142D22]">
                <div className="text-2xl font-bold font-mono text-[#8A9C74] dark:text-[#BBC4A6]">10%</div>
                <div className="font-semibold text-xs text-[#19382B] dark:text-[#F3F1E8] mt-1">Class Performance</div>
                <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74] mt-1">Quizzes, MCQs, viva-voce, assignments, and practical laboratory work.</div>
              </div>

              <div className="p-4 rounded-md border border-[#19382B]/40 dark:border-[#BBC4A6]/30 bg-[#EAE7DA] dark:bg-[#142D22]">
                <div className="text-2xl font-bold font-mono text-[#19382B] dark:text-[#F3F1E8]">60%</div>
                <div className="font-semibold text-xs text-[#19382B] dark:text-[#F3F1E8] mt-1">Semester Final Exam</div>
                <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74] mt-1">4-week final examination period. Pass mark is 25% for the final examination.</div>
              </div>
            </div>

            {/* Letter Grade Table */}
            <div>
              <h3 className="font-bold text-sm text-[#19382B] dark:text-[#F3F1E8] mb-3">
                Letter Grade and Grade-Point Scale (B.Sc. Honours)
              </h3>
              <div className="border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 rounded-md overflow-hidden max-w-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#EAE7DA] dark:bg-[#142D22] border-b border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 text-[#19382B] dark:text-[#BBC4A6]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Numerical Grade</th>
                      <th className="py-2.5 px-4 font-semibold">Letter Grade</th>
                      <th className="py-2.5 px-4 font-semibold">Grade Point</th>
                      <th className="py-2.5 px-4 font-semibold">Academic Standing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BBC4A6]/40 dark:divide-[#BBC4A6]/15 text-[#19382B] dark:text-[#F3F1E8]">
                    <tr><td className="py-2 px-4 font-mono">80% and above</td><td className="py-2 px-4 font-bold text-[#42684D] dark:text-[#8A9C74]">A+</td><td className="py-2 px-4 font-mono">4.00</td><td>Outstanding</td></tr>
                    <tr><td className="py-2 px-4 font-mono">75% to less than 80%</td><td className="py-2 px-4 font-bold text-[#42684D] dark:text-[#8A9C74]">A</td><td className="py-2 px-4 font-mono">3.75</td><td>Excellent</td></tr>
                    <tr><td className="py-2 px-4 font-mono">70% to less than 75%</td><td className="py-2 px-4 font-bold text-[#42684D] dark:text-[#8A9C74]">A-</td><td className="py-2 px-4 font-mono">3.50</td><td>Very Good</td></tr>
                    <tr><td className="py-2 px-4 font-mono">65% to less than 70%</td><td className="py-2 px-4 font-bold">B+</td><td className="py-2 px-4 font-mono">3.25</td><td>Good</td></tr>
                    <tr><td className="py-2 px-4 font-mono">60% to less than 65%</td><td className="py-2 px-4 font-bold">B</td><td className="py-2 px-4 font-mono">3.00</td><td>Satisfactory</td></tr>
                    <tr><td className="py-2 px-4 font-mono">55% to less than 60%</td><td className="py-2 px-4 font-bold">B-</td><td className="py-2 px-4 font-mono">2.75</td><td>Above Average</td></tr>
                    <tr><td className="py-2 px-4 font-mono">50% to less than 55%</td><td className="py-2 px-4 font-bold">C+</td><td className="py-2 px-4 font-mono">2.50</td><td>Average</td></tr>
                    <tr><td className="py-2 px-4 font-mono">45% to less than 50%</td><td className="py-2 px-4 font-bold">C</td><td className="py-2 px-4 font-mono">2.25</td><td>Below Average</td></tr>
                    <tr><td className="py-2 px-4 font-mono">40% to less than 45%</td><td className="py-2 px-4 font-bold text-[#987453]">C-</td><td className="py-2 px-4 font-mono">2.00</td><td>Passing Grade</td></tr>
                    <tr><td className="py-2 px-4 font-mono text-[#987453]">Less than 40%</td><td className="py-2 px-4 font-bold text-[#987453]">F</td><td className="py-2 px-4 font-mono text-[#987453]">0.00</td><td className="text-[#987453]">Fail (Repeat Required)</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-[#8A9C74] mt-2">
                * Distinction: Degree awarded with Distinction if overall CGPA ≥ 3.75 with no F grades or semester drops.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={inspectCourse}
        onClose={() => setInspectCourse(null)}
        onViewResources={(code) => {
          if (inspectCourse) {
            onSelectCourse(code, inspectCourse.year);
          }
        }}
      />

    </div>
  );
};
