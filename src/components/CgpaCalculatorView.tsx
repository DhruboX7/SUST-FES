import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { SUST_FES_COURSES } from '../data/coursesData';
import { SUST_GRADE_SCALE, CourseGradeEntry, calculateGPA } from '../utils/grading';
import { AcademicYear } from '../types';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Award, 
  BookOpen, 
  ChevronRight, 
  TrendingUp, 
  HelpCircle 
} from 'lucide-react';

const STORAGE_KEY_CGPA = 'sust_fes_cgpa_data_v1';

export const CgpaCalculatorView: React.FC = () => {
  usePageMeta({
    title: 'SUST CGPA & GPA Calculator',
    description: 'Calculate semester GPA, cumulative CGPA, and estimate future credit requirements using the official SUST 4.0 grading scale.',
  });

  const [courses, setCourses] = useState<CourseGradeEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CGPA);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (c): c is CourseGradeEntry =>
              Boolean(c && typeof c === 'object' && typeof c.id === 'string' && typeof c.credits === 'number')
          );
          if (valid.length > 0 || parsed.length === 0) {
            return valid;
          }
        }
      }
    } catch {
      // fallback
    }
    // Default to Year 1 Sem 1 courses
    return SUST_FES_COURSES.filter((c) => c.year === 1 && c.semester === 1).map((c) => ({
      id: `cgpa-${c.code}`,
      courseCode: c.code,
      courseTitle: c.title,
      credits: c.credits,
      letterGrade: 'A',
    }));
  });

  // Target Calculator state
  const [currentCgpa, setCurrentCgpa] = useState<string>('3.40');
  const [completedCredits, setCompletedCredits] = useState<string>('75');
  const [upcomingCredits, setUpcomingCredits] = useState<string>('18.5');
  const [targetCgpa, setTargetCgpa] = useState<string>('3.50');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CGPA, JSON.stringify(courses));
    } catch (err) {
      console.error('Failed to save CGPA calculator data:', err);
    }
  }, [courses]);

  const { gpa, totalCredits, earnedCredits } = calculateGPA(courses);

  const handleGradeChange = (id: string, grade: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, letterGrade: grade } : c))
    );
  };

  const handleCreditsChange = (id: string, credits: number) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, credits: Math.max(0, credits) } : c))
    );
  };

  const handleRemoveCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddCustomCourse = () => {
    const newCourse: CourseGradeEntry = {
      id: `custom-${Date.now()}`,
      courseCode: 'FES 0821xxxx',
      courseTitle: 'Custom Course / Elective',
      credits: 3.0,
      letterGrade: 'A',
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  const handleLoadCurriculumSemester = (year: AcademicYear, semester: 1 | 2) => {
    const syllabusMatches = SUST_FES_COURSES.filter(
      (c) => c.year === year && c.semester === semester
    );
    const mapped: CourseGradeEntry[] = syllabusMatches.map((c) => ({
      id: `cgpa-${c.code}-${Date.now()}`,
      courseCode: c.code,
      courseTitle: c.title,
      credits: c.credits,
      letterGrade: 'A',
    }));
    setCourses(mapped);
  };

  const handleReset = () => {
    setCourses([]);
  };

  // Predict required GPA
  const reqGpa = (() => {
    const cur = parseFloat(currentCgpa);
    const comp = parseFloat(completedCredits);
    const up = parseFloat(upcomingCredits);
    const target = parseFloat(targetCgpa);

    if (isNaN(cur) || isNaN(comp) || isNaN(up) || isNaN(target) || up <= 0) {
      return null;
    }

    const currentPoints = cur * comp;
    const totalTargetPoints = target * (comp + up);
    const neededUpcomingPoints = totalTargetPoints - currentPoints;
    const requiredGpa = neededUpcomingPoints / up;

    return Number(requiredGpa.toFixed(2));
  })();

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 rounded-2xl p-6 sm:p-8 text-white border border-emerald-900/40 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Calculator className="w-4 h-4" />
            <span>Academic Performance Tools</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            SUST CGPA & Semester GPA Calculator
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Calibrated to the official SUST 4.00 grading scale (A+ at 80% and above). Automatically pre-populate courses from the FES department OBE curriculum or enter custom scores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Course Grades Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Semester Course Scores
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Select letter grades to calculate weighted Grade Point Average.
                </p>
              </div>

              {/* Pre-fill Quick Select Dropdown */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-stone-500 font-semibold">Load Semester:</span>
                <select
                  aria-label="Load semester courses"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) return;
                    const [y, s] = val.split('-');
                    handleLoadCurriculumSemester(Number(y) as AcademicYear, Number(s) as 1 | 2);
                  }}
                  defaultValue=""
                  className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-medium text-stone-800 dark:text-stone-200"
                >
                  <option value="" disabled>Select Semester...</option>
                  <option value="1-1">1st Year, Sem 1</option>
                  <option value="1-2">1st Year, Sem 2</option>
                  <option value="2-1">2nd Year, Sem 1</option>
                  <option value="2-2">2nd Year, Sem 2</option>
                  <option value="3-1">3rd Year, Sem 1</option>
                  <option value="3-2">3rd Year, Sem 2</option>
                  <option value="4-1">4th Year, Sem 1</option>
                  <option value="4-2">4th Year, Sem 2</option>
                </select>
              </div>
            </div>

            {/* Courses List */}
            {courses.length === 0 ? (
              <div className="py-12 text-center text-stone-400">
                <p className="text-xs mb-3">No courses added to the calculator.</p>
                <button
                  onClick={handleAddCustomCourse}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Course</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 sm:p-4 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-400">
                        <span>{c.courseCode}</span>
                        <span aria-hidden="true">·</span>
                        <span>{c.credits} Credits</span>
                      </div>
                      <div className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate mt-0.5">
                        {c.courseTitle}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {/* Credit Input */}
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-stone-400">Cr:</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          value={c.credits}
                          onChange={(e) => handleCreditsChange(c.id, parseFloat(e.target.value) || 0)}
                          aria-label={`Credits for ${c.courseCode}`}
                          className="w-14 px-2 py-1 text-xs font-mono font-semibold text-center rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900"
                        />
                      </div>

                      {/* Grade Selector */}
                      <div>
                        <select
                          value={c.letterGrade}
                          onChange={(e) => handleGradeChange(c.id, e.target.value)}
                          aria-label={`Grade for ${c.courseCode}`}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-bold text-emerald-800 dark:text-emerald-400"
                        >
                          {SUST_GRADE_SCALE.map((s) => (
                            <option key={s.letter} value={s.letter}>
                              {s.letter} ({s.gradePoint.toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleRemoveCourse(c.id)}
                        aria-label={`Remove ${c.courseCode}`}
                        className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={handleAddCustomCourse}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Course</span>
              </button>

              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 hover:text-red-500 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          {/* Grading Scale Reference Table */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>Official SUST 4.00 Grading Scale (A+ at 80%+)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              {SUST_GRADE_SCALE.map((s) => (
                <div key={s.letter} className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                  <div className="font-extrabold text-sm text-emerald-800 dark:text-emerald-400">{s.letter}</div>
                  <div className="font-mono text-xs font-semibold text-stone-800 dark:text-stone-200">{s.gradePoint.toFixed(2)}</div>
                  <div className="text-[10px] text-stone-500 dark:text-stone-400">{s.marksRange}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Results Card & Target Predictor (1 Col) */}
        <div className="space-y-6">
          
          {/* Main GPA Score Card */}
          <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-2xl p-6 text-white border border-emerald-800 shadow-lg text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Semester GPA
            </span>
            <div className="text-5xl font-black tracking-tight my-2 font-mono">
              {gpa.toFixed(2)}
            </div>
            <div className="text-xs text-emerald-200">
              Based on {totalCredits} credit hours ({earnedCredits} earned)
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-800/80 grid grid-cols-2 gap-3 text-left">
              <div>
                <div className="text-[11px] text-emerald-300">Total Credits</div>
                <div className="text-base font-bold font-mono">{totalCredits}</div>
              </div>
              <div>
                <div className="text-[11px] text-emerald-300">Honors Standing</div>
                <div className="text-xs font-semibold">
                  {gpa >= 3.75 ? 'First Class Distinction' : gpa >= 3.00 ? 'Second Class Upper' : gpa >= 2.50 ? 'Second Class Lower' : 'Passing Grade'}
                </div>
              </div>
            </div>
          </div>

          {/* Target CGPA Predictor */}
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Target CGPA Predictor
              </h3>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
              Find out what GPA you must score in upcoming semesters to achieve your goal.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  Current Cumulative CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={currentCgpa}
                  onChange={(e) => setCurrentCgpa(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    Credits Completed
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={completedCredits}
                    onChange={(e) => setCompletedCredits(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                    Upcoming Credits
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={upcomingCredits}
                    onChange={(e) => setUpcomingCredits(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-600 dark:text-stone-400 mb-1 font-medium">
                  Desired Target CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={targetCgpa}
                  onChange={(e) => setTargetCgpa(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-mono font-semibold"
                />
              </div>
            </div>

            {/* Target Output */}
            {reqGpa !== null && (
              <div className={`p-4 rounded-xl border text-center ${
                reqGpa > 4.00 
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200' 
                  : reqGpa < 2.00 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200' 
                  : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100'
              }`}>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-1">
                  Required Upcoming GPA
                </div>
                <div className="text-3xl font-black font-mono">
                  {reqGpa.toFixed(2)}
                </div>
                <div className="text-[11px] mt-1">
                  {reqGpa > 4.00
                    ? 'Mathematically unattainable within this credit load. Increase upcoming credits or adjust target.'
                    : reqGpa <= 2.00
                    ? 'Target easily achievable by meeting minimum passing requirements.'
                    : `Aim for a ${reqGpa.toFixed(2)} average across your next ${upcomingCredits} credits.`}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
