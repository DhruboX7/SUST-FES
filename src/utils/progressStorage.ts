import { SyllabusProgress } from '../types';
import { DetailedCourse } from '../data/coursesData';

const STORAGE_KEY_SYLLABUS_PROGRESS = 'sust_fes_syllabus_progress_v2';

const DEFAULT_PROGRESS: SyllabusProgress = {
  completedCourseIds: [],
  completedTopicKeys: {},
  lastUpdated: new Date().toISOString(),
};

export function getStoredSyllabusProgress(): SyllabusProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYLLABUS_PROGRESS);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      completedCourseIds: Array.isArray(parsed.completedCourseIds) ? parsed.completedCourseIds : [],
      completedTopicKeys: parsed.completedTopicKeys && typeof parsed.completedTopicKeys === 'object' ? parsed.completedTopicKeys : {},
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
    };
  } catch (err) {
    console.error('Failed to parse syllabus progress:', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveStoredSyllabusProgress(progress: SyllabusProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY_SYLLABUS_PROGRESS, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save syllabus progress:', err);
  }
}

export function toggleCourseCompletion(
  courseId: string,
  course: DetailedCourse
): SyllabusProgress {
  const current = getStoredSyllabusProgress();
  const isCompleted = current.completedCourseIds.includes(courseId);

  let updatedCompletedCourses: string[];
  const updatedTopics = { ...current.completedTopicKeys };

  const totalTopics = course.contents?.length || 0;

  if (isCompleted) {
    // Uncheck course
    updatedCompletedCourses = current.completedCourseIds.filter((id) => id !== courseId);
    delete updatedTopics[courseId];
  } else {
    // Mark completed -> check all topics
    updatedCompletedCourses = [...current.completedCourseIds, courseId];
    if (totalTopics > 0) {
      updatedTopics[courseId] = Array.from({ length: totalTopics }, (_, i) => i);
    }
  }

  const newProgress: SyllabusProgress = {
    completedCourseIds: updatedCompletedCourses,
    completedTopicKeys: updatedTopics,
    lastUpdated: new Date().toISOString(),
  };

  saveStoredSyllabusProgress(newProgress);
  return newProgress;
}

export function toggleTopicCompletion(
  courseId: string,
  topicIndex: number,
  course: DetailedCourse
): SyllabusProgress {
  const current = getStoredSyllabusProgress();
  const currentCourseTopics = current.completedTopicKeys[courseId] || [];

  let updatedTopicIndices: number[];
  if (currentCourseTopics.includes(topicIndex)) {
    updatedTopicIndices = currentCourseTopics.filter((i) => i !== topicIndex);
  } else {
    updatedTopicIndices = [...currentCourseTopics, topicIndex];
  }

  const updatedTopicsMap = {
    ...current.completedTopicKeys,
    [courseId]: updatedTopicIndices,
  };

  const totalTopics = course.contents?.length || 0;
  let updatedCompletedCourses = [...current.completedCourseIds];

  // If all topics are completed, automatically mark the course completed
  if (totalTopics > 0 && updatedTopicIndices.length === totalTopics) {
    if (!updatedCompletedCourses.includes(courseId)) {
      updatedCompletedCourses.push(courseId);
    }
  } else {
    // If some topics are not checked, remove from completed courses
    updatedCompletedCourses = updatedCompletedCourses.filter((id) => id !== courseId);
  }

  const newProgress: SyllabusProgress = {
    completedCourseIds: updatedCompletedCourses,
    completedTopicKeys: updatedTopicsMap,
    lastUpdated: new Date().toISOString(),
  };

  saveStoredSyllabusProgress(newProgress);
  return newProgress;
}

export function markAllTopicsComplete(course: DetailedCourse): SyllabusProgress {
  const current = getStoredSyllabusProgress();
  const totalTopics = course.contents?.length || 0;

  const updatedTopicsMap = {
    ...current.completedTopicKeys,
    [course.id]: Array.from({ length: totalTopics }, (_, i) => i),
  };

  let updatedCompleted = [...current.completedCourseIds];
  if (!updatedCompleted.includes(course.id)) {
    updatedCompleted.push(course.id);
  }

  const newProgress: SyllabusProgress = {
    completedCourseIds: updatedCompleted,
    completedTopicKeys: updatedTopicsMap,
    lastUpdated: new Date().toISOString(),
  };

  saveStoredSyllabusProgress(newProgress);
  return newProgress;
}

export function clearCourseProgress(courseId: string): SyllabusProgress {
  const current = getStoredSyllabusProgress();
  const updatedTopicsMap = { ...current.completedTopicKeys };
  delete updatedTopicsMap[courseId];

  const updatedCompleted = current.completedCourseIds.filter((id) => id !== courseId);

  const newProgress: SyllabusProgress = {
    completedCourseIds: updatedCompleted,
    completedTopicKeys: updatedTopicsMap,
    lastUpdated: new Date().toISOString(),
  };

  saveStoredSyllabusProgress(newProgress);
  return newProgress;
}

export function resetAllSyllabusProgress(): SyllabusProgress {
  saveStoredSyllabusProgress(DEFAULT_PROGRESS);
  return DEFAULT_PROGRESS;
}

export interface YearProgressStats {
  year: number;
  label: string;
  earnedCredits: number;
  totalCredits: number;
  percentage: number;
  completedCourses: number;
  totalCourses: number;
}

export interface SyllabusProgressReport {
  totalPossibleCredits: number; // Official graduation requirement = 160
  totalEarnedCredits: number;
  overallPercentage: number;
  totalCoursesCount: number;
  completedCoursesCount: number;
  yearStats: { [year: number]: YearProgressStats };
  theoryEarnedCredits: number;
  theoryTotalCredits: number;
  sessionalEarnedCredits: number;
  sessionalTotalCredits: number;
}

export function calculateSyllabusStats(
  courses: DetailedCourse[],
  progress: SyllabusProgress
): SyllabusProgressReport {
  // Official curriculum target
  const OFFICIAL_GRADUATION_CREDITS = 160;

  let totalEarnedCredits = 0;
  let theoryEarnedCredits = 0;
  let theoryTotalCredits = 0;
  let sessionalEarnedCredits = 0;
  let sessionalTotalCredits = 0;

  const yearMap: { [year: number]: { earned: number; total: number; completedCount: number; courseCount: number } } = {
    1: { earned: 0, total: 42, completedCount: 0, courseCount: 0 },
    2: { earned: 0, total: 42, completedCount: 0, courseCount: 0 },
    3: { earned: 0, total: 43, completedCount: 0, courseCount: 0 },
    4: { earned: 0, total: 40, completedCount: 0, courseCount: 0 },
  };

  courses.forEach((course) => {
    const yrNum = typeof course.year === 'number' ? course.year : 1;
    const isCompleted = progress.completedCourseIds.includes(course.id);
    const cr = course.credits || 0;

    if (yearMap[yrNum]) {
      yearMap[yrNum].courseCount += 1;
      if (isCompleted) {
        yearMap[yrNum].earned += cr;
        yearMap[yrNum].completedCount += 1;
      }
    }

    if (course.courseType === 'Theory') {
      theoryTotalCredits += cr;
      if (isCompleted) theoryEarnedCredits += cr;
    } else {
      sessionalTotalCredits += cr;
      if (isCompleted) sessionalEarnedCredits += cr;
    }

    if (isCompleted) {
      totalEarnedCredits += cr;
    }
  });

  const yearStats: { [year: number]: YearProgressStats } = {};
  const yearLabels: { [key: number]: string } = {
    1: '1st Year B.Sc.',
    2: '2nd Year B.Sc.',
    3: '3rd Year B.Sc.',
    4: '4th Year B.Sc.',
  };

  [1, 2, 3, 4].forEach((yr) => {
    const stat = yearMap[yr];
    const pct = stat.total > 0 ? Math.round((stat.earned / stat.total) * 100) : 0;
    yearStats[yr] = {
      year: yr,
      label: yearLabels[yr],
      earnedCredits: stat.earned,
      totalCredits: stat.total,
      percentage: Math.min(100, pct),
      completedCourses: stat.completedCount,
      totalCourses: stat.courseCount,
    };
  });

  const overallPercentage = Math.min(
    100,
    Math.round((totalEarnedCredits / OFFICIAL_GRADUATION_CREDITS) * 100)
  );

  return {
    totalPossibleCredits: OFFICIAL_GRADUATION_CREDITS,
    totalEarnedCredits,
    overallPercentage,
    totalCoursesCount: courses.length,
    completedCoursesCount: progress.completedCourseIds.length,
    yearStats,
    theoryEarnedCredits,
    theoryTotalCredits,
    sessionalEarnedCredits,
    sessionalTotalCredits,
  };
}
