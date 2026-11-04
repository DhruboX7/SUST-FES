// Standard SUST Grading Scale (4.00 Scale, A+ at 80%+)
export interface GradeScaleEntry {
  letter: string;
  gradePoint: number;
  marksRange: string;
}

export const SUST_GRADE_SCALE: GradeScaleEntry[] = [
  { letter: 'A+', gradePoint: 4.00, marksRange: '80% and above' },
  { letter: 'A',  gradePoint: 3.75, marksRange: '75% to <80%' },
  { letter: 'A-', gradePoint: 3.50, marksRange: '70% to <75%' },
  { letter: 'B+', gradePoint: 3.25, marksRange: '65% to <70%' },
  { letter: 'B',  gradePoint: 3.00, marksRange: '60% to <65%' },
  { letter: 'B-', gradePoint: 2.75, marksRange: '55% to <60%' },
  { letter: 'C+', gradePoint: 2.50, marksRange: '50% to <55%' },
  { letter: 'C',  gradePoint: 2.25, marksRange: '45% to <50%' },
  { letter: 'D',  gradePoint: 2.00, marksRange: '40% to <45%' },
  { letter: 'F',  gradePoint: 0.00, marksRange: 'Less than 40%' },
];

export interface CourseGradeEntry {
  id: string;
  courseCode: string;
  courseTitle: string;
  credits: number;
  letterGrade: string;
}

export function calculateGPA(entries: CourseGradeEntry[]): { gpa: number; totalCredits: number; earnedCredits: number } {
  let totalPoints = 0;
  let totalCredits = 0;
  let earnedCredits = 0;

  for (const entry of entries) {
    const scale = SUST_GRADE_SCALE.find((s) => s.letter === entry.letterGrade);
    const point = scale ? scale.gradePoint : 0;
    const credits = entry.credits || 0;

    totalCredits += credits;
    if (point > 0) {
      earnedCredits += credits;
    }
    totalPoints += point * credits;
  }

  const gpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
  return { gpa, totalCredits, earnedCredits };
}
