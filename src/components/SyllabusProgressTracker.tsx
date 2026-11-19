import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SUST_FES_COURSES, DetailedCourse } from '../data/coursesData';
import { AcademicYear } from '../types';
import { usePageMeta } from '../hooks/usePageMeta';
import { 
  getStoredSyllabusProgress, 
  toggleCourseCompletion, 
  toggleTopicCompletion, 
  markAllTopicsComplete, 
  clearCourseProgress, 
  resetAllSyllabusProgress, 
  calculateSyllabusStats 
} from '../utils/progressStorage';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  GraduationCap, 
  RotateCcw, 
  Search, 
  Download, 
  Layers, 
  Check, 
  Clock, 
  ExternalLink,
  Compass
} from 'lucide-react';

interface SyllabusProgressTrackerProps {
  onJumpToCourseCatalog?: (courseCode: string, year: AcademicYear) => void;
  onNavigateToSyllabus?: () => void;
}

export const SyllabusProgressTracker: React.FC<SyllabusProgressTrackerProps> = ({
  onJumpToCourseCatalog,
  onNavigateToSyllabus,
}) => {
  const [progress, setProgress] = useState(() => getStoredSyllabusProgress());
  const [selectedYear, setSelectedYear] = useState<AcademicYear | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'in_progress' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourseIds, setExpandedCourseIds] = useState<string[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMsg(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMsg(null);
      toastTimerRef.current = null;
    }, 3000);
  };

  usePageMeta({
    title: 'Syllabus Progress Tracker & Degree Audit',
    description: 'Track completed courses, monitor chapter-by-chapter OBE syllabus coverage, and audit your B.Sc. credit completion.',
  });

  // Calculate high-level stats
  const stats = useMemo(() => {
    return calculateSyllabusStats(SUST_FES_COURSES, progress);
  }, [progress]);

  // Toggle single course completion
  const handleToggleCourse = (course: DetailedCourse) => {
    const updated = toggleCourseCompletion(course.id, course);
    setProgress(updated);
    const isNowDone = updated.completedCourseIds.includes(course.id);
    showToast(isNowDone ? `Completed "${course.code}: ${course.title}"! (+${course.credits} Credits)` : `Marked "${course.code}" as in progress`);
  };

  // Toggle individual topic
  const handleToggleTopic = (course: DetailedCourse, topicIndex: number) => {
    const updated = toggleTopicCompletion(course.id, topicIndex, course);
    setProgress(updated);
  };

  // Mark all topics
  const handleMarkAllTopics = (course: DetailedCourse) => {
    const updated = markAllTopicsComplete(course);
    setProgress(updated);
    showToast(`All syllabus topics completed for ${course.code}!`);
  };

  // Clear topics
  const handleClearCourseTopics = (course: DetailedCourse) => {
    const updated = clearCourseProgress(course.id);
    setProgress(updated);
    showToast(`Cleared progress for ${course.code}`);
  };

  // Expand / Collapse Accordion
  const toggleAccordion = (courseId: string) => {
    if (expandedCourseIds.includes(courseId)) {
      setExpandedCourseIds(expandedCourseIds.filter((id) => id !== courseId));
    } else {
      setExpandedCourseIds([...expandedCourseIds, courseId]);
    }
  };

  const handleExpandAll = () => {
    setExpandedCourseIds(SUST_FES_COURSES.map((c) => c.id));
  };

  const handleCollapseAll = () => {
    setExpandedCourseIds([]);
  };

  const handleReset = () => {
    const reset = resetAllSyllabusProgress();
    setProgress(reset);
    setShowResetConfirm(false);
    showToast('All progress reset to 0');
  };

  // Export summary
  const handleExportSummary = () => {
    const lines = [
      '==================================================================',
      'SUST - Department of Forestry & Environmental Science (FES)',
      'B.Sc. (Honours) in Forestry · OBE Curriculum Progress Audit',
      `Audit Date: ${new Date().toLocaleDateString()}`,
      `Total Credits Earned: ${stats.totalEarnedCredits} / ${stats.totalPossibleCredits} Credits (${stats.overallPercentage}%)`,
      `Courses Completed: ${stats.completedCoursesCount} / ${stats.totalCoursesCount}`,
      '==================================================================\n',
      'YEAR-BY-YEAR COMPLETION:',
      ...[1, 2, 3, 4].map((yr) => {
        const yStat = stats.yearStats[yr];
        return `Year ${yr}: ${yStat.earnedCredits}/${yStat.totalCredits} Credits (${yStat.percentage}%) - ${yStat.completedCourses}/${yStat.totalCourses} courses`;
      }),
      '\nCOMPLETED COURSES:',
    ];

    SUST_FES_COURSES.filter((c) => progress.completedCourseIds.includes(c.id)).forEach((c) => {
      lines.push(` [X] ${c.code}: ${c.title} (${c.credits} Cr) - Year ${c.year}, Sem ${c.semester}`);
    });

    lines.push('\nCOURSES IN PROGRESS:');
    SUST_FES_COURSES.filter((c) => {
      const isDone = progress.completedCourseIds.includes(c.id);
      const checkedTopics = progress.completedTopicKeys[c.id]?.length || 0;
      return !isDone && checkedTopics > 0;
    }).forEach((c) => {
      const checkedTopics = progress.completedTopicKeys[c.id]?.length || 0;
      const totalTopics = c.contents?.length || 0;
      lines.push(` [-] ${c.code}: ${c.title} (${checkedTopics}/${totalTopics} topics complete)`);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SUST_FES_Syllabus_Progress_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Progress report downloaded!');
  };

  // Filter courses
  const filteredCourses = useMemo(() => {
    return SUST_FES_COURSES.filter((c) => {
      if (selectedYear !== 'all' && c.year !== selectedYear) return false;

      const isCompleted = progress.completedCourseIds.includes(c.id);
      const checkedTopicsCount = progress.completedTopicKeys[c.id]?.length || 0;

      if (selectedStatus === 'completed' && !isCompleted) return false;
      if (selectedStatus === 'in_progress' && (isCompleted || checkedTopicsCount === 0)) return false;
      if (selectedStatus === 'pending' && (isCompleted || checkedTopicsCount > 0)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const codeMatch = c.code.toLowerCase().includes(q) || (c.shortCode && c.shortCode.toLowerCase().includes(q));
        const titleMatch = c.title.toLowerCase().includes(q);
        const topicMatch = c.contents && c.contents.some((t) => t.toLowerCase().includes(q));
        if (!codeMatch && !titleMatch && !topicMatch) return false;
      }

      return true;
    });
  }, [selectedYear, selectedStatus, searchQuery, progress]);

  return (
    <div className="space-y-6">

      {/* 1. Graduation Progress Overview Header Card */}
      <div className="bg-[#19382B] rounded-lg border border-[#42684D]/40 p-6 sm:p-8 text-[#F3F1E8] shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">

          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[#BBC4A6] text-xs font-semibold uppercase tracking-wider mb-2">
              <GraduationCap className="w-4 h-4 text-[#8A9C74]" />
              <span>Official 160-Credit B.Sc. (Honours) Curriculum Tracker</span>
            </div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[#F3F1E8]">
              Syllabus Academic Progress · Progress Report
            </h1>
            <p className="text-[#BBC4A6] text-xs sm:text-sm leading-relaxed mb-4">
              Track your individual progress across all 8 semesters. Check off completed courses or check individual syllabus topics as you study for exams.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {onNavigateToSyllabus && (
                <button
                  type="button"
                  onClick={onNavigateToSyllabus}
                  className="px-3.5 py-2 bg-[#142D22] hover:bg-[#42684D] text-[#F3F1E8] border border-[#BBC4A6]/30 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Compass className="w-3.5 h-3.5 text-[#8A9C74]" />
                  <span>Course Matrix & Syllabus</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportSummary}
                className="px-3.5 py-2 bg-[#42684D] hover:bg-[#8A9C74] text-[#F3F1E8] hover:text-[#19382B] rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Progress Report</span>
              </button>

              {showResetConfirm ? (
                <div className="flex items-center gap-2 bg-[#142D22] border border-[#987453]/60 px-3 py-1.5 rounded-md">
                  <span className="text-[11px] text-[#BBC4A6]">Reset all progress?</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2 py-0.5 bg-[#987453] text-[#F3F1E8] rounded-sm text-[11px] font-bold"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-0.5 bg-[#42684D]/40 text-[#BBC4A6] rounded-sm text-[11px]"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-2 bg-[#142D22] hover:bg-[#42684D]/50 text-[#BBC4A6] hover:text-[#F3F1E8] border border-[#BBC4A6]/20 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-[#8A9C74]" />
                  <span>Reset Progress</span>
                </button>
              )}
            </div>
          </div>

          {/* Graduation Meter Gauge */}
          <div className="w-full lg:w-72 bg-[#142D22] rounded-lg border border-[#BBC4A6]/25 p-5 shrink-0 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#BBC4A6] font-medium">Graduation Requirement</span>
              <span className="text-xs font-bold text-[#8A9C74] font-mono">
                {stats.overallPercentage}%
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-3xl font-extrabold text-[#F3F1E8] font-mono">
                {stats.totalEarnedCredits}
              </span>
              <span className="text-[#BBC4A6] text-sm font-medium">
                / {stats.totalPossibleCredits} Credits
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-[#19382B] rounded-sm overflow-hidden p-0.5 mb-3 border border-[#BBC4A6]/25">
              <div
                className="h-full bg-[#8A9C74] rounded-xs transition-all duration-500 ease-out"
                style={{ width: `${Math.max(3, stats.overallPercentage)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#BBC4A6] border-t border-[#BBC4A6]/20 pt-2.5">
              <div>
                <span className="block font-semibold text-[#F3F1E8] font-mono">
                  {stats.completedCoursesCount} / {stats.totalCoursesCount}
                </span>
                <span>Courses Completed</span>
              </div>
              <div className="text-right">
                <span className="block font-semibold text-[#F3F1E8] font-mono">
                  {stats.totalPossibleCredits - stats.totalEarnedCredits} Cr
                </span>
                <span>Remaining for B.Sc.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Year-by-Year Milestone Cards (4 Years) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((yr) => {
          const yStat = stats.yearStats[yr];
          const isFull = yStat.percentage === 100;

          return (
            <div
              key={yr}
              onClick={() => setSelectedYear(selectedYear === yr ? 'all' : (yr as AcademicYear))}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                selectedYear === yr
                  ? 'border-[#42684D] bg-[#EAE7DA] dark:bg-[#142D22] ring-1 ring-[#42684D]'
                  : 'border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B] hover:border-[#42684D]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#19382B] dark:text-[#F3F1E8]">
                  {yStat.label}
                </span>
                {isFull ? (
                  <span className="flex items-center gap-1 text-[11px] text-[#42684D] dark:text-[#8A9C74] font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#42684D] dark:text-[#8A9C74] font-mono">
                    {yStat.percentage}%
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-xl font-bold font-mono text-[#19382B] dark:text-[#F3F1E8]">
                  {yStat.earnedCredits}
                </span>
                <span className="text-xs text-[#42684D] dark:text-[#BBC4A6]">
                  / {yStat.totalCredits} Cr
                </span>
                <span className="text-[11px] text-[#8A9C74] ml-auto">
                  {yStat.completedCourses}/{yStat.totalCourses} courses
                </span>
              </div>

              <div className="w-full h-1.5 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm overflow-hidden">
                <div
                  className="h-full bg-[#42684D] dark:bg-[#8A9C74] rounded-xs transition-all duration-300"
                  style={{ width: `${yStat.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] p-3 sm:p-4 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A9C74]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search course code, title, or syllabus topic..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] placeholder:text-[#8A9C74] text-xs focus:ring-2 focus:ring-[#42684D] focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {/* Year Filter */}
          <select
            value={String(selectedYear)}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedYear(val === 'all' ? 'all' : (Number(val) as AcademicYear));
            }}
            className="px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs font-medium shrink-0 focus:outline-hidden focus:ring-2 focus:ring-[#42684D]"
          >
            <option value="all">All Academic Years</option>
            <option value="1">1st Year (42 Cr)</option>
            <option value="2">2nd Year (42 Cr)</option>
            <option value="3">3rd Year (43 Cr)</option>
            <option value="4">4th Year (40 Cr)</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'completed' | 'in_progress' | 'pending')}
            className="px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs font-medium shrink-0 focus:outline-hidden focus:ring-2 focus:ring-[#42684D]"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed Only</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Not Started</option>
          </select>

          {/* Accordion Expand/Collapse All */}
          <button
            type="button"
            onClick={expandedCourseIds.length > 0 ? handleCollapseAll : handleExpandAll}
            className="px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#EAE7DA] dark:bg-[#142D22] hover:bg-[#BBC4A6]/40 text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] whitespace-nowrap shrink-0 transition-colors"
          >
            {expandedCourseIds.length > 0 ? 'Collapse All' : 'Expand Topics'}
          </button>
        </div>

      </div>

      {/* 4. Course Cards List with Topic Checklists */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20">
            <BookOpen className="w-10 h-10 text-[#8A9C74] mx-auto mb-2" />
            <h4 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
              No courses matching criteria
            </h4>
            <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-1">
              Try adjusting your year, status filter, or search query.
            </p>
          </div>
        ) : (
          filteredCourses.map((course) => {
            const isCompleted = progress.completedCourseIds.includes(course.id);
            const checkedTopics = progress.completedTopicKeys[course.id] || [];
            const totalTopics = course.contents?.length || 0;
            const isExpanded = expandedCourseIds.includes(course.id);
            const topicProgressPct = totalTopics > 0 ? Math.round((checkedTopics.length / totalTopics) * 100) : 0;

            return (
              <div
                key={course.id}
                className={`rounded-lg border transition-colors overflow-hidden ${
                  isCompleted
                    ? 'border-[#42684D] bg-[#FAF9F4] dark:bg-[#19382B] shadow-xs'
                    : checkedTopics.length > 0
                    ? 'border-[#987453]/60 bg-[#FAF9F4] dark:bg-[#19382B] shadow-xs'
                    : 'border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B]'
                }`}
              >
                {/* Course Main Card Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                  {/* Left: Master completion checkbox + course details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleCourse(course)}
                      className="mt-0.5 shrink-0 text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] transition-colors"
                      title={isCompleted ? 'Mark course as incomplete' : 'Mark course as 100% completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-[#42684D] dark:text-[#8A9C74] fill-[#EAE7DA] dark:fill-[#142D22]" />
                      ) : checkedTopics.length > 0 ? (
                        <Clock className="w-6 h-6 text-[#987453] dark:text-[#BBC4A6]" />
                      ) : (
                        <Circle className="w-6 h-6 text-[#BBC4A6] dark:text-[#42684D]" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-sm bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8]">
                          {course.code}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-sm bg-[#F3F1E8] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] font-semibold">
                          {course.credits} Credits
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-sm bg-[#F3F1E8] dark:bg-[#142D22] text-[#987453] dark:text-[#8A9C74] capitalize">
                          {course.courseType}
                        </span>
                        <span className="text-[11px] text-[#8A9C74]">
                          Year {course.year} · Sem {course.semester}
                        </span>
                      </div>

                      <Link
                        to={`/courses/${encodeURIComponent(course.code.replace(/\s+/g, '-'))}`}
                        className={`text-sm font-bold transition-colors hover:text-[#42684D] dark:hover:text-[#BBC4A6] ${
                          isCompleted
                            ? 'text-[#42684D] dark:text-[#8A9C74] line-through opacity-85'
                            : 'text-[#19382B] dark:text-[#F3F1E8]'
                        }`}
                      >
                        {course.title}
                      </Link>

                      {/* Topic Micro Progress Indicator */}
                      {totalTopics > 0 && (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 max-w-xs h-1.5 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm overflow-hidden">
                            <div
                              className={`h-full rounded-xs transition-all duration-300 ${
                                isCompleted ? 'bg-[#42684D] dark:bg-[#8A9C74]' : 'bg-[#987453]'
                              }`}
                              style={{ width: `${isCompleted ? 100 : topicProgressPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-[#42684D] dark:text-[#BBC4A6]">
                            {isCompleted ? `${totalTopics}/${totalTopics} topics (100%)` : `${checkedTopics.length}/${totalTopics} topics (${topicProgressPct}%)`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link
                      to={`/courses/${encodeURIComponent(course.code.replace(/\s+/g, '-'))}`}
                      className="px-2.5 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 hover:border-[#42684D] text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] transition-colors flex items-center gap-1"
                    >
                      <span>Course Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {totalTopics > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleAccordion(course.id)}
                        className="px-3 py-1.5 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] hover:bg-[#BBC4A6]/40 text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5 transition-colors border border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20"
                      >
                        <span>{isExpanded ? 'Hide Topics' : `Checklist (${totalTopics})`}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                </div>

                {/* Expandable Topic-by-Topic Checklist */}
                {isExpanded && totalTopics > 0 && (
                  <div className="border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 bg-[#F3F1E8] dark:bg-[#142D22] p-4 sm:p-5 animate-fade-in">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                        <span>Official Syllabus Topics Checklist:</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMarkAllTopics(course)}
                          className="text-[11px] text-[#42684D] dark:text-[#BBC4A6] hover:underline font-semibold"
                        >
                          Check All
                        </button>
                        <span className="text-[#8A9C74]">|</span>
                        <button
                          type="button"
                          onClick={() => handleClearCourseTopics(course)}
                          className="text-[11px] text-[#987453] dark:text-[#8A9C74] hover:underline font-semibold"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {course.contents!.map((topic, idx) => {
                        const isTopicChecked = isCompleted || checkedTopics.includes(idx);

                        return (
                          <label
                            key={idx}
                            className={`flex items-start gap-2.5 p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                              isTopicChecked
                                ? 'bg-[#EAE7DA] dark:bg-[#19382B] border-[#42684D]/60 text-[#19382B] dark:text-[#F3F1E8]'
                                : 'bg-[#FAF9F4] dark:bg-[#19382B]/60 border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-[#42684D] dark:text-[#BBC4A6] hover:border-[#42684D]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isTopicChecked}
                              onChange={() => handleToggleTopic(course, idx)}
                              className="mt-0.5 rounded-sm border-[#BBC4A6] text-[#42684D] focus:ring-[#42684D] shrink-0"
                            />
                            <span className={`leading-relaxed ${isTopicChecked ? 'font-medium' : ''}`}>
                              {topic}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Floating feedback toast */}
      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-[#19382B] text-[#F3F1E8] px-4 py-2.5 rounded-md shadow-xl text-xs font-semibold flex items-center gap-2 border border-[#42684D]/60 animate-slide-up">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#8A9C74]" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
};
