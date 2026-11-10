import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  parseScheduleStrict, 
  parseScheduleWithAI, 
  normalizeBanglaText, 
  classifyEventType, 
  parseDateSpecification, 
  parseTimeSpecification,
  extractBracketMetadata,
  extractAcademicContext
} from '../src/utils/aiScheduleParser.ts';

test('1. Normalizes Bangla digits and Bangla weekdays/months', () => {
  const raw = 'রবিবার ০৭/১০/২০২৬ - ০৯:০০ পরিবেশ বিজ্ঞান';
  const normalized = normalizeBanglaText(raw);
  assert.ok(normalized.includes('Sunday'));
  assert.ok(normalized.includes('07/10/2026'));
  assert.ok(normalized.includes('09:00'));
});

test('2. Weekday verification conflict: Saturday date written as Sunday', () => {
  // 26 September 2026 is actually a Saturday
  const res = parseDateSpecification('Sunday [ 26 September, 2026]');
  assert.equal(res.date, '2026-09-26');
  assert.equal(res.weekday_as_written, 'Sunday');
  assert.equal(res.weekday_computed, 'Saturday');
  assert.equal(res.weekday_conflict, true);
  assert.ok(res.warnings.some(w => w.includes('Written weekday (Sunday) does not match date (Saturday)')));
});

test('3. Date parsing defaults to DD/MM and switches to MM/DD when day > 12 in 2nd position', () => {
  // DD/MM default
  const d1 = parseDateSpecification('7/10/2026, Wednesday');
  assert.equal(d1.date, '2026-10-07');
  assert.equal(d1.weekday_computed, 'Wednesday');
  assert.equal(d1.weekday_conflict, false);

  // MM/DD switch with warning
  const d2 = parseDateSpecification('10/25/2026');
  assert.equal(d2.date, '2026-10-25');
  assert.ok(d2.warnings.some(w => w.includes('Switched to MM/DD format')));
});

test('4. Time rules: range parsing logic and single time without duration', () => {
  // 12.20-1.10 pm -> 12:20 to 13:10
  const t1 = parseTimeSpecification('12.20-1.10 pm');
  assert.equal(t1.start_time, '12:20');
  assert.equal(t1.end_time, '13:10');

  // 11-1 pm -> 11:00 to 13:00 (11 AM to 1 PM)
  const t2 = parseTimeSpecification('11-1 pm');
  assert.equal(t2.start_time, '11:00');
  assert.equal(t2.end_time, '13:00');

  // 2- 4 pm -> 14:00 to 16:00
  const t3 = parseTimeSpecification('2- 4 pm');
  assert.equal(t3.start_time, '14:00');
  assert.equal(t3.end_time, '16:00');

  // 9:00am - 10:30am -> 09:00 to 10:30 (AM on both sides)
  const t4 = parseTimeSpecification('9:00am - 10:30am');
  assert.equal(t4.start_time, '09:00');
  assert.equal(t4.end_time, '10:30');

  // 11:30 - 01:00 -> 11:30 to 13:00 (noon rollover)
  const t5 = parseTimeSpecification('11:30 - 01:00');
  assert.equal(t5.start_time, '11:30');
  assert.equal(t5.end_time, '13:00');

  // From 10:00 AM to 11:30 AM -> 10:00 to 11:30
  const t6 = parseTimeSpecification('From 10:00 AM to 11:30 AM');
  assert.equal(t6.start_time, '10:00');
  assert.equal(t6.end_time, '11:30');

  // Single time: 9 AM -> start 09:00, end_time null
  const t7 = parseTimeSpecification('9 AM');
  assert.equal(t7.start_time, '09:00');
  assert.equal(t7.end_time, null);
  assert.ok(t7.warnings.some(w => w.includes('Single time specified without end time')));
});

test('5. Event Type Classification priority: viva > presentation > term_test > final_exam > quiz > assignment > lab > class', () => {
  // Priority: viva > lab
  const viva = classifyEventType('Botany Lab Viva');
  assert.equal(viva.type, 'viva');
  assert.equal(viva.isLab, true);

  // Priority: quiz > lab
  const quiz = classifyEventType('Environment Lab Quiz');
  assert.equal(quiz.type, 'quiz');
  assert.equal(quiz.isLab, true);

  // Term test with sequence number extraction (TT-2 -> 2)
  const tt = classifyEventType('TT-2 Forest Mensuration');
  assert.equal(tt.type, 'term_test');
  assert.equal(tt.sequenceNumber, 2);

  // Class Test with sequence number extraction (CT 3 -> 3)
  const ct = classifyEventType('Silviculture CT 3');
  assert.equal(ct.type, 'quiz');
  assert.equal(ct.sequenceNumber, 3);
});

test('6. Bracket metadata isolation: brackets never treated as subject', () => {
  const line = 'FES 211 Silviculture [Room 301, Prof. Manzoor Rashid]';
  const meta = extractBracketMetadata(line);
  assert.ok(meta.cleanedText.includes('FES 211 Silviculture'));
  assert.ok(!meta.cleanedText.includes('Room 301'));
  assert.ok(!meta.cleanedText.includes('Prof. Manzoor Rashid'));
  assert.ok(meta.room?.includes('Room 301'));
});

test('7. Strict parser returns JSON schema with academic context and sorted events', async () => {
  const input = `
🟩 1st year, 1st semester Routine
Sunday:
09:00 - 10:30 | FES 08211121 Introduction to Forestry [Room 301] (Prof. Dr. Manzoor Rashid)
11:00 - 12:30 | CHE 05311125 Basic Chemistry [Hall 2]
Monday:
09:00 - 11:00 | FES 08211122 Forest Botany & Dendrology Lab [Herbarium Lab]
`;

  const parsed = parseScheduleStrict(input);
  assert.equal(parsed.academic_context.year, 1);
  assert.equal(parsed.academic_context.semester, 1);
  assert.equal(parsed.timezone, 'Asia/Dhaka');
  assert.ok(parsed.events.length >= 3);

  // Verify full AI entry point integration
  const res = await parseScheduleWithAI(input);
  assert.equal(res.year, 1);
  assert.equal(res.semester, 1);
  assert.ok(res.slots.length >= 3);
  assert.ok(res.structuredJson !== undefined);
  assert.ok(typeof res.rawJsonString === 'string');
});
