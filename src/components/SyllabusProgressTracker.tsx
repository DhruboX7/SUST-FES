import React, { useState, useMemo } from 'react';
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
  Award, 
  Sparkles, 
  RotateCcw, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
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

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
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
      <div className="bg-gradient-to-br from-emerald-900 via-stone-900 to-stone-950 rounded-2xl border border-emerald-800/40 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <GraduationCap className="w-4 h-4" />
              <span>Official 160-Credit B.Sc. (Honours) Curriculum Tracker</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Syllabus Academic Progress · Progress Report
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed mb-4">
              Track your individual progress across all 8 semesters. Check off completed courses or check individual syllabus topics as you study for exams.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {onNavigateToSyllabus && (
                <button
                  type="button"
                  onClick={onNavigateToSyllabus}
                  className="px-3.5 py-1.5 bg-stone-800/90 hover:bg-stone-700 text-stone-200 hover:text-white border border-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Course Matrix & Syllabus</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportSummary}
                className="px-3.5 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Progress Report</span>
              </button>

              {showResetConfirm ? (
                <div className="flex items-center gap-2 bg-stone-900/90 border border-stone-700 px-3 py-1 rounded-lg">
                  <span className="text-[11px] text-amber-300">Reset all progress?</span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-bold"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2 py-0.5 bg-stone-700 text-stone-300 rounded text-[11px]"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-1.5 bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3 text-stone-400" />
                  <span>Reset Progress</span>
                </button>
              )}
            </div>
          </div>

          {/* Graduation Meter Gauge */}
          <div className="w-full lg:w-72 bg-stone-900/80 backdrop-blur-md rounded-2xl border border-stone-700/60 p-5 shrink-0 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-stone-400 font-medium">Graduation Requirement</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {stats.overallPercentage}%
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-3xl font-extrabold text-white font-mono">
                {stats.totalEarnedCredits}
              </span>
              <span className="text-stone-400 text-sm font-medium">
                / {stats.totalPossibleCredits} Credits
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-stone-800 rounded-full overflow-hidden p-0.5 mb-3 border border-stone-700/50">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(3, stats.overallPercentage)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-400 border-t border-stone-800 pt-2.5">
              <div>
                <span className="block font-semibold text-stone-300 font-mono">
                  {stats.completedCoursesCount} / {stats.totalCoursesCount}
                </span>
                <span>Courses Completed</span>
              </div>
              <div className="text-right">
                <span className="block font-semibold text-stone-300 font-mono">
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
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedYear === yr
                  ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-600/20'
                  : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  {yStat.label}
                </span>
                {isFull ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                    {yStat.percentage}%
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
                  {yStat.earnedCredits}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  / {yStat.totalCredits} Cr
                </span>
                <span className="text-[11px] text-stone-400 ml-auto">
                  {yStat.completedCourses}/{yStat.totalCourses} courses
                </span>
              </div>

              <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-700 dark:bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${yStat.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white dark:bg-stone-900 p-3 sm:p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search course code, title, or syllabus topic..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
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
            className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs shrink-0"
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
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs shrink-0"
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
            className="px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 text-xs font-medium text-stone-700 dark:text-stone-300 whitespace-nowrap shrink-0 transition-colors"
          >
            {expandedCourseIds.length > 0 ? 'Collapse All' : 'Expand Topics'}
          </button>
        </div>

      </div>

      {/* 4. Course Cards List with Topic Checklists */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
            <BookOpen className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300">
              No courses matching criteria
            </h4>
            <p className="text-xs text-stone-500 mt-1">
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
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-stone-900 shadow-xs'
                    : checkedTopics.length > 0
                    ? 'border-teal-200 dark:border-teal-900/60 bg-white dark:bg-stone-900 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900'
                }`}
              >
                {/* Course Main Card Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  {/* Left: Master completion checkbox + course details */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleCourse(course)}
                      className="mt-0.5 shrink-0 text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                      title={isCompleted ? 'Mark course as incomplete' : 'Mark course as 100% completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-700 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                      ) : checkedTopics.length > 0 ? (
                        <div className="w-6 h-6 rounded-full border-2 border-teal-600 flex items-center justify-center">
                          <div className="w-2.5 h-2.5 bg-teal-600 rounded-full" />
                        </div>
                      ) : (
                        <Circle className="w-6 h-6 text-stone-300 dark:text-stone-700" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                          {course.code}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-semibold">
                          {course.credits} Credits
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                          {course.courseType}
                        </span>
                        <span className="text-[11px] text-stone-400">
                          Year {course.year} · Sem {course.semester}
                        </span>
                      </div>

                      <Link
                        to={`/courses/${encodeURIComponent(course.code.replace(/\s+/g, '-'))}`}
                        className={`text-sm font-bold transition-colors hover:text-emerald-700 dark:hover:text-emerald-400 ${
                          isCompleted
                            ? 'text-emerald-950 dark:text-emerald-200 line-through opacity-85'
                            : 'text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        {course.title}
                      </Link>

                      {/* Topic Micro Progress Indicator */}
                      {totalTopics > 0 && (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="flex-1 max-w-xs h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isCompleted ? 'bg-emerald-600' : 'bg-teal-500'
                              }`}
                              style={{ width: `${isCompleted ? 100 : topicProgressPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
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
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-emerald-600 text-[11px] font-semibold text-stone-600 dark:text-stone-300 hover:text-emerald-700 transition-colors flex items-center gap-1"
                    >
                      <span>Course Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    {totalTopics > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleAccordion(course.id)}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Topics' : `Checklist (${totalTopics})`}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                </div>

                {/* Expandable Topic-by-Topic Checklist */}
                {isExpanded && totalTopics > 0 && (
                  <div className="border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-950/40 p-4 sm:p-5 animate-fade-in">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Official Syllabus Topics Checklist:</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMarkAllTopics(course)}
                          className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
                        >
                          Check All
                        </button>
                        <span className="text-stone-300 dark:text-stone-700">|</span>
                        <button
                          type="button"
                          onClick={() => handleClearCourseTopics(course)}
                          className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 font-medium"
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
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                              isTopicChecked
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
                                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-emerald-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isTopicChecked}
                              onChange={() => handleToggleTopic(course, idx)}
                              className="mt-0.5 rounded border-stone-300 text-emerald-700 focus:ring-emerald-500 shrink-0"
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
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 px-4 py-2 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-stone-800 dark:border-stone-200 animate-slide-up">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
};
