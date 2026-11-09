import { RoutineSlot } from '../types';
import { SUST_FES_COURSES, SUST_FES_FACULTY } from '../data/coursesData';

export interface ParseScheduleResult {
  slots: RoutineSlot[];
  year?: number;
  semester?: number;
  source: 'gemini' | 'heuristic' | 'universal';
  rawSummary?: string;
  detectedCount: number;
}

export const VALID_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/**
 * Normalizes day name to standard English capitalized full weekday
 */
export function normalizeDayName(raw: string): string {
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

/**
 * Automatically detects Academic Year (1-4) and Semester (1-2) from any schedule text
 */
export function detectYearAndSemester(text: string): { year?: number; semester?: number } {
  let detectedYear: number | undefined;
  let detectedSemester: number | undefined;

  // Match Year
  const yearMatch = text.match(/\b(?:year\s*([1-4])|([1-4])(?:st|nd|rd|th)?\s*year|y([1-4])|year\s*(i{1,4}|iv))\b/i);
  if (yearMatch) {
    const val = yearMatch[1] || yearMatch[2] || yearMatch[3];
    if (val) {
      detectedYear = parseInt(val, 10);
    } else if (yearMatch[4]) {
      const roman = yearMatch[4].toLowerCase();
      if (roman === 'i') detectedYear = 1;
      else if (roman === 'ii') detectedYear = 2;
      else if (roman === 'iii') detectedYear = 3;
      else if (roman === 'iv') detectedYear = 4;
    }
  }

  // Match Semester
  const semMatch = text.match(/\b(?:semester\s*([1-2])|([1-2])(?:st|nd)?\s*sem(?:ester)?|sem\s*([1-2])|semester\s*(i{1,2}))\b/i);
  if (semMatch) {
    const val = semMatch[1] || semMatch[2] || semMatch[3];
    if (val) {
      detectedSemester = parseInt(val, 10);
    } else if (semMatch[4]) {
      const roman = semMatch[4].toLowerCase();
      if (roman === 'i') detectedSemester = 1;
      else if (roman === 'ii') detectedSemester = 2;
    }
  }

  // Infer from course codes if not explicitly found in headers (e.g. FES 211 -> year 2, sem 1; FES 08212121 -> year 2, sem 1)
  if (!detectedYear || !detectedSemester) {
    const codeMatch = text.match(/\bFES\s*(?:0821)?([1-4])([1-2])\d{1,4}\b/i);
    if (codeMatch) {
      if (!detectedYear) detectedYear = parseInt(codeMatch[1], 10);
      if (!detectedSemester) detectedSemester = parseInt(codeMatch[2], 10);
    }
  }

  return { year: detectedYear, semester: detectedSemester };
}

/**
 * Normalizes any time representation into standard "HH:MM - HH:MM"
 * Supports:
 * - "09:00 - 10:30"
 * - "9:00am - 10:30am"
 * - "9am to 10:30am"
 * - "9-10:30"
 * - "09.00 - 10.30"
 * - "at 9:00 AM" (generates standard 1.5-hour class: "09:00 - 10:30 AM")
 */
export function normalizeTimeFormat(raw: string): string {
  if (!raw) return '09:00 - 10:30';

  let clean = raw.trim();
  // Standardize separator
  clean = clean.replace(/\s*(?:to|–|—)\s*/i, ' - ');
  // Convert period in time (9.00 -> 9:00)
  clean = clean.replace(/(\d{1,2})\.(\d{2})/g, '$1:$2');

  const rangeMatch = clean.match(/(\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?)/i);
  if (rangeMatch) {
    const formatPart = (p: string) => {
      let t = p.trim();
      const hasAmPm = /[AaPp][Mm]/i.test(t);
      const ampm = t.match(/[AaPp][Mm]/i)?.[0]?.toUpperCase() || '';
      t = t.replace(/[AaPp][Mm]/i, '').trim();
      if (!t.includes(':')) {
        t = `${t}:00`;
      }
      const [h, m] = t.split(':');
      const padH = h.padStart(2, '0');
      return hasAmPm ? `${padH}:${m} ${ampm}` : `${padH}:${m}`;
    };

    return `${formatPart(rangeMatch[1])} - ${formatPart(rangeMatch[2])}`;
  }

  // Single time (e.g. "at 9:00 AM" or "9:00") -> standard 1.5h duration
  const singleMatch = clean.match(/(?:at|from)?\s*(\d{1,2})(?::(\d{2}))?\s*([AaPp][Mm])?/i);
  if (singleMatch) {
    const h = parseInt(singleMatch[1], 10);
    const m = singleMatch[2] ? parseInt(singleMatch[2], 10) : 0;
    const ampm = singleMatch[3]?.toUpperCase();

    const startH = String(h).padStart(2, '0');
    const startM = String(m).padStart(2, '0');

    // Add 1.5 hours (90 mins)
    let endTotalM = h * 60 + m + 90;
    let endH = Math.floor(endTotalM / 60);
    if (endH > 12 && ampm) endH = endH % 12 || 12;
    const endM = endTotalM % 60;
    const endHStr = String(endH).padStart(2, '0');
    const endMStr = String(endM).padStart(2, '0');

    if (ampm) {
      return `${startH}:${startM} ${ampm} - ${endHStr}:${endMStr} ${ampm}`;
    }
    return `${startH}:${startM} - ${endHStr}:${endMStr}`;
  }

  return clean;
}

/**
 * Matches course codes and titles against curriculum database or extracts from text
 */
export function matchCourseDetails(
  text: string,
  defaultYear = 1,
  defaultSemester = 1
): { courseCode: string; courseTitle: string } {
  // 1. Check for standard course code regex
  const codeRegex = /\b([A-Z]{2,4}\s*[-–]?\s*(?:0821)?\d{3,8}[A-Z]?)\b/i;
  const match = text.match(codeRegex);

  let rawCode = match ? match[1].replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase() : '';

  // 2. Search curriculum database for an exact code, short code, or title match
  if (rawCode) {
    const compactCode = rawCode.replace(/\s+/g, '');
    const matchedCurriculum = SUST_FES_COURSES.find((c) => {
      const cCompact = c.code.replace(/\s+/g, '');
      const sCompact = c.shortCode.replace(/\s+/g, '');
      return (
        cCompact.toLowerCase() === compactCode.toLowerCase() ||
        sCompact.toLowerCase() === compactCode.toLowerCase() ||
        compactCode.includes(sCompact.toLowerCase())
      );
    });

    if (matchedCurriculum) {
      return {
        courseCode: matchedCurriculum.code,
        courseTitle: matchedCurriculum.title,
      };
    }
  }

  // 3. Search curriculum by course title keywords (e.g. "Silviculture", "Dendrology", "Chemistry", "Botany")
  const lowerText = text.toLowerCase();
  for (const c of SUST_FES_COURSES) {
    const lowerTitle = c.title.toLowerCase();
    if (lowerText.includes(lowerTitle)) {
      return {
        courseCode: c.code,
        courseTitle: c.title,
      };
    }
    // Check specific notable subjects
    if (lowerTitle.includes('forest botany') && lowerText.includes('botany')) {
      return { courseCode: c.code, courseTitle: c.title };
    }
    if (lowerTitle.includes('silvicultural') && lowerText.includes('silviculture')) {
      return { courseCode: c.code, courseTitle: c.title };
    }
  }

  // 4. Fallback extraction from remainder text
  if (rawCode) {
    // If rawCode was found but title wasn't in curriculum, derive title from line
    let derivedTitle = text.replace(codeRegex, '').replace(/\b(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/gi, '').trim();
    derivedTitle = derivedTitle.replace(/^[,\s;:\-|–—]+|[,\s;:\-|–—]+$/g, '').trim();
    const parts = derivedTitle.split(/\s*[,|;\t]\s*/).filter(Boolean);
    const title = parts[0] || 'Department Academic Course';
    return {
      courseCode: rawCode.startsWith('FES') ? rawCode : rawCode,
      courseTitle: title.length > 50 ? title.slice(0, 50) + '...' : title,
    };
  }

  // 5. Default departmental slot
  return {
    courseCode: `FES 0821${defaultYear}${defaultSemester}01`,
    courseTitle: `Department Course ${defaultYear}.${defaultSemester}`,
  };
}

/**
 * Extracts classroom or lab venue from line
 */
export function extractRoom(text: string, defaultYear = 1): string {
  // Check for specific room patterns
  const roomRegex = /(?:Room|Rm|R)\s*[-#.:]?\s*([A-Za-z0-9-]+(?:\s*,\s*[A-Za-z0-9\s]+)?)|(?:Herbarium|Taxonomy|Wood Science|GIS|Remote Sensing|Chemistry|Physics|Computer)\s*(?:Lab|Hall|Room)?|(?:Gallery|Auditorium)\s*[0-9A-Za-z-]*/i;
  const match = text.match(roomRegex);
  if (match) {
    const roomStr = match[0].trim();
    // Normalize "R 301" to "Room 301"
    if (/^R\s*[-#.]?\s*\d+/i.test(roomStr)) {
      return roomStr.replace(/^R\s*[-#.]?\s*/i, 'Room ');
    }
    return roomStr;
  }

  return `Room ${300 + defaultYear}`;
}

/**
 * Extracts instructor name from text or matches against official departmental faculty
 */
export function extractTeacher(text: string): string {
  // Check against official faculty directory
  const lowerText = text.toLowerCase();
  for (const fac of SUST_FES_FACULTY) {
    const parts = fac.name.toLowerCase().split(/\s+/).filter((p) => p.length > 2 && p !== 'dr.' && p !== 'mr.' && p !== 'ms.');
    for (const p of parts) {
      if (lowerText.includes(p)) {
        return fac.name;
      }
    }
  }

  // Check generic professor/doctor patterns
  const teacherRegex = /(?:Prof(?:essor)?\.?|Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+[A-Z][a-zA-Z\s.]+(?:[A-Z][a-zA-Z]+)/;
  const match = text.match(teacherRegex);
  if (match) {
    return match[0].trim();
  }

  // Check Department mentions
  if (/Dept\.?\s+of\s+[A-Za-z\s]+/i.test(text)) {
    const dMatch = text.match(/Dept\.?\s+of\s+[A-Za-z\s&]+/i);
    if (dMatch) return dMatch[0].trim();
  }

  return 'Dept. of Forestry & Env. Science';
}

/**
 * Extracts all day names referenced in a phrase or line (supports multi-day e.g. "Sunday & Tuesday")
 */
export function extractDays(line: string, defaultDay = 'Sunday'): string[] {
  const detected: string[] = [];
  const tokens = line.split(/[,&/+]|\band\b/i);
  for (const token of tokens) {
    for (const d of VALID_DAYS) {
      if (new RegExp(`\\b${d.slice(0, 3)}[a-z]*\\b`, 'i').test(token)) {
        if (!detected.includes(d)) {
          detected.push(d);
        }
      }
    }
  }

  return detected.length > 0 ? detected : [defaultDay];
}

/**
 * Universal schedule parser capable of extracting classes from ANY input format:
 * - Table / spreadsheet pastes (TSV, CSV, Markdown, pipe-separated)
 * - Structured key-value blocks (Day: ... Time: ... Course: ...)
 * - Day headers followed by course entries
 * - Natural language notices and chat circulars
 * - Compact lists (Sun 9-10:30 FES 111, Mon 11-12:30 FES 112)
 */
export function parseAnyScheduleFormat(
  rawText: string,
  targetYear = 1,
  targetSemester = 1
): ParseScheduleResult {
  if (!rawText.trim()) {
    return {
      slots: [],
      year: targetYear,
      semester: targetSemester,
      source: 'universal',
      rawSummary: 'Empty schedule input provided.',
      detectedCount: 0,
    };
  }

  // Auto-detect Year and Semester if present in the text
  const detected = detectYearAndSemester(rawText);
  const activeYear = detected.year || targetYear;
  const activeSemester = detected.semester || targetSemester;

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const slots: RoutineSlot[] = [];

  // ========================================================
  // STRATEGY 1: KEY-VALUE BLOCK PARSER (e.g. Day: Sunday \n Time: ...)
  // ========================================================
  const isBlockFormat = rawText.includes('Day:') || rawText.includes('Time:') || rawText.includes('Course:');
  if (isBlockFormat) {
    const rawBlocks = rawText.split(/\n\s*\n/).filter(Boolean);
    for (const block of rawBlocks) {
      const dayMatch = block.match(/(?:Day|Weekday):\s*([A-Za-z]+)/i);
      const timeMatch = block.match(/(?:Time|Hours|Slot):\s*([0-9:.\s\w–—-]+)/i);
      const courseMatch = block.match(/(?:Course|Code|Subject):\s*([^\n]+)/i);
      const titleMatch = block.match(/(?:Title|Course Title|Name):\s*([^\n]+)/i);
      const roomMatch = block.match(/(?:Room|Venue|Lab|Classroom):\s*([^\n]+)/i);
      const teacherMatch = block.match(/(?:Teacher|Instructor|Faculty|Prof):\s*([^\n]+)/i);

      if (dayMatch || timeMatch || courseMatch) {
        const days = dayMatch ? extractDays(dayMatch[1]) : ['Sunday'];
        const time = timeMatch ? normalizeTimeFormat(timeMatch[1]) : '09:00 - 10:30';
        const courseInfo = matchCourseDetails((courseMatch?.[1] || '') + ' ' + (titleMatch?.[1] || ''), activeYear, activeSemester);
        const room = roomMatch ? roomMatch[1].trim() : extractRoom(block, activeYear);
        const teacher = teacherMatch ? teacherMatch[1].trim() : extractTeacher(block);

        for (const d of days) {
          slots.push({
            id: `slot-block-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            day: d,
            time,
            courseCode: courseInfo.courseCode,
            courseTitle: titleMatch ? titleMatch[1].trim() : courseInfo.courseTitle,
            room,
            teacher,
          });
        }
      }
    }

    if (slots.length > 0) {
      return {
        slots,
        year: activeYear,
        semester: activeSemester,
        source: 'universal',
        rawSummary: `Extracted ${slots.length} class slots from key-value blocks.`,
        detectedCount: slots.length,
      };
    }
  }

  // ========================================================
  // STRATEGY 2: LINE-BY-LINE, DELIMITED, OR DAY-SECTION PARSER
  // ========================================================
  let currentDay = 'Sunday';
  const timeRegex = /(?:(\d{1,2}(?::\d{2}|\.\d{2})?\s*(?:[AaPp][Mm])?)\s*(?:-|to|–|—)\s*(\d{1,2}(?::\d{2}|\.\d{2})?\s*(?:[AaPp][Mm])?)|(?:at|from)\s*(\d{1,2}(?::\d{2}|\.\d{2})?\s*(?:[AaPp][Mm])?))/i;
  const courseCodeRegex = /\b([A-Z]{2,4}\s*[-–]?\s*(?:0821)?\d{3,8}[A-Z]?)\b/i;

  for (const line of lines) {
    // 1. Check if line is purely a Day Header (e.g. "Sunday:", "Monday", "=== Tuesday ===")
    const lowerLine = line.toLowerCase().replace(/[:#=\-*_~]/g, '').trim();
    let isDayHeaderOnly = false;
    for (const d of VALID_DAYS) {
      if (lowerLine === d.toLowerCase() || lowerLine === d.toLowerCase().slice(0, 3)) {
        currentDay = d;
        isDayHeaderOnly = true;
        break;
      }
    }
    if (isDayHeaderOnly) {
      continue;
    }

    // 2. Check for Table / Delimited Rows (Tab, Pipe, or Semicolon)
    const isTabular = line.includes('\t') || (line.includes('|') && line.split('|').length >= 3);
    if (isTabular) {
      const cells = line.split(/[|\t]/).map((c) => c.trim()).filter(Boolean);
      // Skip markdown table header separators like |---|---|
      if (cells.some((c) => /^[-:]+$/.test(c))) continue;
      // Skip header rows like "Day", "Time", "Course"
      if (cells.some((c) => /^(?:day|weekday|time|course\s*code|course\s*title)$/i.test(c))) continue;

      if (cells.length >= 2) {
        // Find day in cells
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

        // Find time in cells
        let rowTime = '09:00 - 10:30';
        let timeCellIdx = -1;
        for (let i = 0; i < cells.length; i++) {
          if (i !== dayCellIdx && timeRegex.test(cells[i])) {
            rowTime = normalizeTimeFormat(cells[i]);
            timeCellIdx = i;
            break;
          }
        }

        // Find remaining cells for Course, Room, Teacher
        const remainingCells = cells.filter((_, idx) => idx !== dayCellIdx && idx !== timeCellIdx);
        const courseText = remainingCells[0] || '';
        const roomText = remainingCells[1] || '';
        const teacherText = remainingCells[2] || '';

        const courseInfo = matchCourseDetails(courseText + ' ' + (remainingCells[1] || ''), activeYear, activeSemester);
        const room = roomText ? extractRoom(roomText, activeYear) : extractRoom(line, activeYear);
        const teacher = teacherText ? extractTeacher(teacherText) : extractTeacher(line);

        slots.push({
          id: `slot-table-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

    // 3. Free-Form or Notice Line Check (Looking for time and/or course code or known course names)
    const timeMatch = line.match(timeRegex);
    const codeMatch = line.match(courseCodeRegex);
    const hasKnownSubject = SUST_FES_COURSES.some((c) => line.toLowerCase().includes(c.title.toLowerCase().split(' ')[0]));

    if (timeMatch || codeMatch || hasKnownSubject) {
      // Extract days from line (supports multi-day like "Sunday & Tuesday 9:00 - 10:30")
      const daysOnLine = extractDays(line, currentDay);
      const time = timeMatch ? normalizeTimeFormat(timeMatch[0]) : '09:00 - 10:30';
      const courseInfo = matchCourseDetails(line, activeYear, activeSemester);
      const room = extractRoom(line, activeYear);
      const teacher = extractTeacher(line);

      for (const day of daysOnLine) {
        slots.push({
          id: `slot-line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

  // ========================================================
  // STRATEGY 3: FALLBACK TO SENTENCE / COMMA SPLIT IF NEEDED
  // ========================================================
  if (slots.length === 0) {
    // Attempt sentence splitting (e.g. paragraphs of notices)
    const sentences = rawText.split(/[.;\n]+/).map((s) => s.trim()).filter(Boolean);
    for (const sentence of sentences) {
      const timeMatch = sentence.match(timeRegex);
      const codeMatch = sentence.match(courseCodeRegex);
      if (timeMatch || codeMatch) {
        const days = extractDays(sentence, 'Sunday');
        const time = timeMatch ? normalizeTimeFormat(timeMatch[0]) : '09:00 - 10:30';
        const courseInfo = matchCourseDetails(sentence, activeYear, activeSemester);
        const room = extractRoom(sentence, activeYear);
        const teacher = extractTeacher(sentence);

        for (const day of days) {
          slots.push({
            id: `slot-sent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
  }

  return {
    slots,
    year: activeYear,
    semester: activeSemester,
    source: 'universal',
    rawSummary: slots.length > 0 
      ? `Successfully extracted ${slots.length} schedule entries across ${Array.from(new Set(slots.map((s) => s.day))).length} days.`
      : 'No class entries could be recognized. Please verify the schedule text.',
    detectedCount: slots.length,
  };
}

/**
 * Primary asynchronous entry point for Schedule Automation:
 * 1. Checks if server-side Gemini API (/api/parse-schedule) is available.
 * 2. Uses the Universal Intelligent Parser with curriculum auto-enrichment.
 */
export async function parseScheduleWithAI(
  rawText: string,
  targetYear = 1,
  targetSemester = 1
): Promise<ParseScheduleResult> {
  if (!rawText.trim()) {
    return {
      slots: [],
      year: targetYear,
      semester: targetSemester,
      source: 'universal',
      detectedCount: 0,
      rawSummary: 'Empty schedule input provided.',
    };
  }

  // 1. Try server-side Gemini endpoint if present
  try {
    const res = await fetch('/api/parse-schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: rawText,
        year: targetYear,
        semester: targetSemester,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.slots) && data.slots.length > 0) {
        return {
          slots: data.slots.map((s: any, idx: number) => ({
            id: s.id || `ai-slot-${Date.now()}-${idx}`,
            day: normalizeDayName(s.day || 'Sunday'),
            time: normalizeTimeFormat(s.time || '09:00 - 10:30'),
            courseCode: String(s.courseCode || `FES 0821${targetYear}${targetSemester}01`).trim(),
            courseTitle: String(s.courseTitle || 'Course Title').trim(),
            room: String(s.room || `Room ${300 + targetYear}`).trim(),
            teacher: String(s.teacher || 'Dept. of Forestry & Env. Science').trim(),
            notes: s.notes ? String(s.notes).trim() : undefined,
          })),
          year: data.year || targetYear,
          semester: data.semester || targetSemester,
          source: 'gemini',
          rawSummary: data.summary || `Extracted ${data.slots.length} entries via Gemini 3.8 Flash.`,
          detectedCount: data.slots.length,
        };
      }
    }
  } catch {
    // Server endpoint not active or network drop, seamlessly fall through to universal parser
  }

  // 2. Execute Universal Intelligent Parser (100% resilient and instant)
  return parseAnyScheduleFormat(rawText, targetYear, targetSemester);
}
