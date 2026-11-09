import test from 'node:test';
import assert from 'node:assert/strict';

const VALID_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function normalizeDayName(raw) {
  const clean = raw.trim().toLowerCase();
  if (clean.startsWith('sun')) return 'Sunday';
  if (clean.startsWith('mon')) return 'Monday';
  if (clean.startsWith('tue')) return 'Tuesday';
  if (clean.startsWith('wed')) return 'Wednesday';
  if (clean.startsWith('thu')) return 'Thursday';
  if (clean.startsWith('fri')) return 'Friday';
  if (clean.startsWith('sat')) return 'Saturday';
  return 'Sunday';
}

function detectYearAndSemester(text) {
  let detectedYear;
  let detectedSemester;

  const yearMatch = text.match(/\b(?:year\s*([1-4])|([1-4])(?:st|nd|rd|th)?\s*year|y([1-4])|year\s*(i{1,4}|iv))\b/i);
  if (yearMatch) {
    const val = yearMatch[1] || yearMatch[2] || yearMatch[3];
    if (val) detectedYear = parseInt(val, 10);
    else if (yearMatch[4]) {
      const roman = yearMatch[4].toLowerCase();
      if (roman === 'i') detectedYear = 1;
      else if (roman === 'ii') detectedYear = 2;
      else if (roman === 'iii') detectedYear = 3;
      else if (roman === 'iv') detectedYear = 4;
    }
  }

  const semMatch = text.match(/\b(?:semester\s*([1-2])|([1-2])(?:st|nd)?\s*sem(?:ester)?|sem\s*([1-2])|semester\s*(i{1,2}))\b/i);
  if (semMatch) {
    const val = semMatch[1] || semMatch[2] || semMatch[3];
    if (val) detectedSemester = parseInt(val, 10);
    else if (semMatch[4]) {
      const roman = semMatch[4].toLowerCase();
      if (roman === 'i') detectedSemester = 1;
      else if (roman === 'ii') detectedSemester = 2;
    }
  }

  if (!detectedYear || !detectedSemester) {
    const codeMatch = text.match(/\bFES\s*(?:0821)?([1-4])([1-2])\d{1,4}\b/i);
    if (codeMatch) {
      if (!detectedYear) detectedYear = parseInt(codeMatch[1], 10);
      if (!detectedSemester) detectedSemester = parseInt(codeMatch[2], 10);
    }
  }

  return { year: detectedYear, semester: detectedSemester };
}

function normalizeTimeFormat(raw) {
  if (!raw) return '09:00 - 10:30';
  let clean = raw.trim().replace(/\s*(?:to|–|—)\s*/i, ' - ').replace(/(\d{1,2})\.(\d{2})/g, '$1:$2');
  const rangeMatch = clean.match(/(\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?)/i);
  if (rangeMatch) {
    const formatPart = (p) => {
      let t = p.trim();
      const hasAmPm = /[AaPp][Mm]/i.test(t);
      const ampm = t.match(/[AaPp][Mm]/i)?.[0]?.toUpperCase() || '';
      t = t.replace(/[AaPp][Mm]/i, '').trim();
      if (!t.includes(':')) t = `${t}:00`;
      const [h, m] = t.split(':');
      const padH = h.padStart(2, '0');
      return hasAmPm ? `${padH}:${m} ${ampm}` : `${padH}:${m}`;
    };
    return `${formatPart(rangeMatch[1])} - ${formatPart(rangeMatch[2])}`;
  }
  return clean;
}

function extractDays(line, defaultDay = 'Sunday') {
  const detected = [];
  const tokens = line.split(/[,&/+]|\band\b/i);
  for (const token of tokens) {
    for (const d of VALID_DAYS) {
      if (new RegExp(`\\b${d.slice(0, 3)}[a-z]*\\b`, 'i').test(token)) {
        if (!detected.includes(d)) detected.push(d);
      }
    }
  }
  return detected.length > 0 ? detected : [defaultDay];
}

function matchCourseDetails(text, defaultYear = 1, defaultSemester = 1) {
  const codeRegex = /\b([A-Z]{2,4}\s*[-–]?\s*(?:0821)?\d{3,8}[A-Z]?)\b/i;
  const match = text.match(codeRegex);
  let rawCode = match ? match[1].replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase() : '';

  if (rawCode) {
    let derivedTitle = text.replace(codeRegex, '').replace(/\b(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/gi, '').trim();
    derivedTitle = derivedTitle.replace(/^[,\s;:\-|–—]+|[,\s;:\-|–—]+$/g, '').trim();
    const parts = derivedTitle.split(/\s*[,|;\t]\s*/).filter(Boolean);
    const title = parts[0] || 'Department Course';
    return { courseCode: rawCode, courseTitle: title };
  }

  return {
    courseCode: `FES 0821${defaultYear}${defaultSemester}01`,
    courseTitle: `Department Course`,
  };
}

function extractRoom(text, defaultYear = 1) {
  const roomRegex = /(?:Room|Rm|R)\s*[-#.:]?\s*([A-Za-z0-9-]+(?:\s*,\s*[A-Za-z0-9\s]+)?)|(?:Herbarium|Taxonomy|Wood Science|GIS|Remote Sensing|Chemistry|Physics|Computer)\s*(?:Lab|Hall|Room)?|(?:Gallery|Auditorium)\s*[0-9A-Za-z-]*/i;
  const match = text.match(roomRegex);
  if (match) {
    const roomStr = match[0].trim();
    if (/^R\s*[-#.]?\s*\d+/i.test(roomStr)) return roomStr.replace(/^R\s*[-#.]?\s*/i, 'Room ');
    return roomStr;
  }
  return `Room ${300 + defaultYear}`;
}

function extractTeacher(text) {
  const teacherRegex = /(?:Prof(?:essor)?\.?|Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+[A-Z][a-zA-Z\s.]+(?:[A-Z][a-zA-Z]+)/;
  const match = text.match(teacherRegex);
  if (match) return match[0].trim();
  return 'Dept. of Forestry & Env. Science';
}

function parseUniversalSchedule(rawText, defaultYear = 1, defaultSemester = 1) {
  if (!rawText.trim()) return [];
  const detected = detectYearAndSemester(rawText);
  const activeYear = detected.year || defaultYear;
  const activeSemester = detected.semester || defaultSemester;

  const slots = [];

  // Key-value block format
  if (rawText.includes('Day:') || rawText.includes('Time:') || rawText.includes('Course:')) {
    const rawBlocks = rawText.split(/\n\s*\n/).filter(Boolean);
    for (const block of rawBlocks) {
      const dayMatch = block.match(/(?:Day|Weekday):\s*([A-Za-z]+)/i);
      const timeMatch = block.match(/(?:Time|Hours|Slot):\s*([0-9:.\s\w–—-]+)/i);
      const courseMatch = block.match(/(?:Course|Code|Subject):\s*([^\n]+)/i);
      const roomMatch = block.match(/(?:Room|Venue|Lab|Classroom):\s*([^\n]+)/i);
      const teacherMatch = block.match(/(?:Teacher|Instructor|Faculty|Prof):\s*([^\n]+)/i);

      if (dayMatch || timeMatch || courseMatch) {
        const days = dayMatch ? extractDays(dayMatch[1]) : ['Sunday'];
        const time = timeMatch ? normalizeTimeFormat(timeMatch[1]) : '09:00 - 10:30';
        const courseInfo = matchCourseDetails(courseMatch?.[1] || '', activeYear, activeSemester);
        const room = roomMatch ? roomMatch[1].trim() : extractRoom(block, activeYear);
        const teacher = teacherMatch ? teacherMatch[1].trim() : extractTeacher(block);

        for (const d of days) {
          slots.push({
            day: d,
            time,
            courseCode: courseInfo.courseCode,
            courseTitle: courseInfo.courseTitle,
            room,
            teacher,
          });
        }
      }
    }
    if (slots.length > 0) return slots;
  }

  // Line-by-line / Tabular / Day header format
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let currentDay = 'Sunday';
  const timeRegex = /(?:(\d{1,2}(?::\d{2}|\.\d{2})?\s*(?:[AaPp][Mm])?)\s*(?:-|to|–|—)\s*(\d{1,2}(?::\d{2}|\.\d{2})?\s*(?:[AaPp][Mm])?)|(?:at|from)\s*(\d{1,2}(?::\d{2}|\.\d{2})?\s*(?:[AaPp][Mm])?))/i;
  const courseCodeRegex = /\b([A-Z]{2,4}\s*[-–]?\s*(?:0821)?\d{3,8}[A-Z]?)\b/i;

  for (const line of lines) {
    const lowerLine = line.toLowerCase().replace(/[:#=\-*_~]/g, '').trim();
    let isDayHeaderOnly = false;
    for (const d of VALID_DAYS) {
      if (lowerLine === d.toLowerCase() || lowerLine === d.toLowerCase().slice(0, 3)) {
        currentDay = d;
        isDayHeaderOnly = true;
        break;
      }
    }
    if (isDayHeaderOnly) continue;

    // Check delimited
    const isTabular = line.includes('\t') || (line.includes('|') && line.split('|').length >= 3);
    if (isTabular) {
      const cells = line.split(/[|\t]/).map((c) => c.trim()).filter(Boolean);
      if (cells.some((c) => /^[-:]+$/.test(c))) continue;
      if (cells.some((c) => /^(?:day|weekday|time|course\s*code|course\s*title)$/i.test(c))) continue;

      if (cells.length >= 2) {
        let rowDay = currentDay;
        let dayCellIdx = -1;
        for (let i = 0; i < cells.length; i++) {
          const matchedDays = extractDays(cells[i], '');
          if (matchedDays.length > 0 && matchedDays[0] !== '') {
            rowDay = matchedDays[0];
            dayCellIdx = i;
            currentDay = rowDay;
            break;
          }
        }

        let rowTime = '09:00 - 10:30';
        let timeCellIdx = -1;
        for (let i = 0; i < cells.length; i++) {
          if (i !== dayCellIdx && timeRegex.test(cells[i])) {
            rowTime = normalizeTimeFormat(cells[i]);
            timeCellIdx = i;
            break;
          }
        }

        const remainingCells = cells.filter((_, idx) => idx !== dayCellIdx && idx !== timeCellIdx);
        const courseText = remainingCells[0] || '';
        const roomText = remainingCells[1] || '';
        const teacherText = remainingCells[2] || '';

        const courseInfo = matchCourseDetails(courseText, activeYear, activeSemester);
        const room = roomText ? extractRoom(roomText, activeYear) : extractRoom(line, activeYear);
        const teacher = teacherText ? extractTeacher(teacherText) : extractTeacher(line);

        slots.push({
          day: rowDay,
          time: rowTime,
          courseCode: courseInfo.courseCode,
          courseTitle: courseInfo.courseTitle,
          room,
          teacher,
        });
        continue;
      }
    }

    // Line check
    const timeMatch = line.match(timeRegex);
    const codeMatch = line.match(courseCodeRegex);

    if (timeMatch || codeMatch) {
      const daysOnLine = extractDays(line, currentDay);
      const time = timeMatch ? normalizeTimeFormat(timeMatch[0]) : '09:00 - 10:30';
      const courseInfo = matchCourseDetails(line, activeYear, activeSemester);
      const room = extractRoom(line, activeYear);
      const teacher = extractTeacher(line);

      for (const day of daysOnLine) {
        slots.push({
          day,
          time,
          courseCode: courseInfo.courseCode,
          courseTitle: courseInfo.courseTitle,
          room,
          teacher,
        });
      }
    }
  }

  return slots;
}

// --------------------------------------------------------------------------
// TESTS
// --------------------------------------------------------------------------

test('Schedule parser extracts pipe-delimited slots correctly', () => {
  const sample = `Sunday:
09:00 - 10:30 | FES 08211121 Introduction to Forestry | Room 301 | Prof. Dr. Manzoor Rashid
11:00 - 12:30 | CHE 05311125 Basic Chemistry | Chemistry Hall 2 | Dept. of Chemistry`;

  const slots = parseUniversalSchedule(sample, 1, 1);
  assert.equal(slots.length, 2);
  assert.equal(slots[0].day, 'Sunday');
  assert.equal(slots[0].time, '09:00 - 10:30');
  assert.equal(slots[0].courseCode, 'FES 08211121');
  assert.equal(slots[0].room, 'Room 301');
  assert.ok(slots[0].teacher.includes('Manzoor Rashid'));
});

test('Schedule parser parses informal WhatsApp message with 3-digit course codes', () => {
  const sample = `Notice for 2nd Year 1st Semester:
Class routine starts next week:
Sunday
9:00am - 10:30am: FES 211 Silvicultural Systems in Room 302 with Dr. Romel Ahmed
11:00am - 12:30pm: FES 213 Forest Ecology in Room 301
Tuesday
09:00 - 10:30 AM: FES 215 Wood Anatomy in Wood Lab by Dr. Kibria
Thursday
10:00 - 11:30: FES 217 Forest Mensuration in Room 304 with Dr. Redowan`;

  const slots = parseUniversalSchedule(sample, 2, 1);
  assert.equal(slots.length, 4);
  assert.equal(slots[0].day, 'Sunday');
  assert.equal(slots[0].courseCode, 'FES 211');
  assert.equal(slots[1].day, 'Sunday');
  assert.equal(slots[1].courseCode, 'FES 213');
  assert.equal(slots[2].day, 'Tuesday');
  assert.equal(slots[2].courseCode, 'FES 215');
  assert.equal(slots[3].day, 'Thursday');
  assert.equal(slots[3].courseCode, 'FES 217');
});

test('Schedule parser parses tab-separated spreadsheet / table copy-pastes', () => {
  const sample = `Day\tTime\tCourse\tTitle\tRoom\tTeacher
Sunday\t09:00 - 10:30\tFES 111\tIntro to Forestry\tRoom 301\tProf. Manzoor Rashid
Monday\t09:00 - 11:00\tFES 112\tForest Botany Lab\tHerbarium Lab\tDr. Narayan Saha`;

  const slots = parseUniversalSchedule(sample, 1, 1);
  assert.equal(slots.length, 2);
  assert.equal(slots[0].day, 'Sunday');
  assert.equal(slots[0].courseCode, 'FES 111');
  assert.equal(slots[1].day, 'Monday');
  assert.equal(slots[1].courseCode, 'FES 112');
});

test('Schedule parser parses key-value block format', () => {
  const sample = `Day: Sunday
Time: 9:00 AM - 10:30 AM
Course: FES 311
Title: Forest Management
Room: Room 305
Teacher: Dr. Belal Uddin

Day: Monday
Time: 11:00 AM - 12:30 PM
Course: FES 313
Title: Agroforestry
Room: Room 305
Teacher: Dr. Swapan Sarker`;

  const slots = parseUniversalSchedule(sample, 3, 1);
  assert.equal(slots.length, 2);
  assert.equal(slots[0].day, 'Sunday');
  assert.equal(slots[0].courseCode, 'FES 311');
  assert.equal(slots[1].day, 'Monday');
  assert.equal(slots[1].courseCode, 'FES 313');
});

test('Schedule parser handles multi-day line splitting', () => {
  const sample = `Sunday & Tuesday 9:00 - 10:30 AM: FES 111 Introduction to Forestry Room 301`;
  const slots = parseUniversalSchedule(sample, 1, 1);
  assert.equal(slots.length, 2);
  assert.equal(slots[0].day, 'Sunday');
  assert.equal(slots[1].day, 'Tuesday');
  assert.equal(slots[0].courseCode, 'FES 111');
});

test('Schedule parser automatically detects Year and Semester from text', () => {
  const text1 = 'Class routine for 2nd Year 1st Semester';
  const det1 = detectYearAndSemester(text1);
  assert.equal(det1.year, 2);
  assert.equal(det1.semester, 1);

  const text2 = 'Year 3 Sem 2 Timetable';
  const det2 = detectYearAndSemester(text2);
  assert.equal(det2.year, 3);
  assert.equal(det2.semester, 2);
});

test('Schedule parser handles empty input gracefully', () => {
  const slots = parseUniversalSchedule('', 1, 1);
  assert.equal(slots.length, 0);
});
