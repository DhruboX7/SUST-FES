import test from 'node:test';
import assert from 'node:assert/strict';

// Import or recreate grading calculation logic to test against SUST grading policy
const SUST_GRADE_SCALE = [
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

function calculateGPA(entries) {
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

test('SUST Grade Scale conforms to official 4.0 scale', () => {
  assert.equal(SUST_GRADE_SCALE[0].letter, 'A+');
  assert.equal(SUST_GRADE_SCALE[0].gradePoint, 4.00);
  assert.equal(SUST_GRADE_SCALE[1].letter, 'A');
  assert.equal(SUST_GRADE_SCALE[1].gradePoint, 3.75);
  assert.equal(SUST_GRADE_SCALE[9].letter, 'F');
  assert.equal(SUST_GRADE_SCALE[9].gradePoint, 0.00);
});

test('calculateGPA handles empty entries correctly', () => {
  const result = calculateGPA([]);
  assert.deepEqual(result, { gpa: 0, totalCredits: 0, earnedCredits: 0 });
});

test('calculateGPA computes perfect 4.0 GPA for all A+ courses', () => {
  const courses = [
    { credits: 3.0, letterGrade: 'A+' },
    { credits: 3.0, letterGrade: 'A+' },
    { credits: 1.5, letterGrade: 'A+' },
  ];
  const result = calculateGPA(courses);
  assert.equal(result.gpa, 4.00);
  assert.equal(result.totalCredits, 7.5);
  assert.equal(result.earnedCredits, 7.5);
});

test('calculateGPA calculates accurate weighted GPA for mixed grades', () => {
  // Course 1: 3 credits * 4.00 (A+) = 12.0
  // Course 2: 3 credits * 3.75 (A)  = 11.25
  // Course 3: 2 credits * 3.50 (A-) = 7.0
  // Course 4: 1 credit  * 0.00 (F)  = 0.0
  // Total points = 30.25 / 9 credits = 3.3611... -> 3.36
  const courses = [
    { credits: 3.0, letterGrade: 'A+' },
    { credits: 3.0, letterGrade: 'A' },
    { credits: 2.0, letterGrade: 'A-' },
    { credits: 1.0, letterGrade: 'F' },
  ];
  const result = calculateGPA(courses);
  assert.equal(result.gpa, 3.36);
  assert.equal(result.totalCredits, 9.0);
  assert.equal(result.earnedCredits, 8.0); // F credits are not earned
});
