import { 
  RoutineSlot, 
  RoutineEventType, 
  ParsedRoutineEvent, 
  StructuredRoutineOutput 
} from '../types';
import { SUST_FES_COURSES, SUST_FES_FACULTY } from '../data/coursesData';

export interface ParseScheduleResult {
  slots: RoutineSlot[];
  year?: number;
  semester?: number;
  source: 'gemini' | 'heuristic' | 'universal';
  rawSummary?: string;
  detectedCount: number;
  structuredJson?: StructuredRoutineOutput;
  rawJsonString?: string;
}

export const VALID_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const BANGLA_WEEKDAY_MAP: Record<string, string> = {
  'রবিবার': 'Sunday',
  'রবি': 'Sunday',
  'সোমবার': 'Monday',
  'সোম': 'Monday',
  'মঙ্গলবার': 'Tuesday',
  'মঙ্গল': 'Tuesday',
  'বুধবার': 'Wednesday',
  'বুধ': 'Wednesday',
  'বৃহস্পতিবার': 'Thursday',
  'বৃহস্পতি': 'Thursday',
  'শুক্রবার': 'Friday',
  'শুক্র': 'Friday',
  'শনিবার': 'Saturday',
  'শনি': 'Saturday',
};

export const BANGLA_MONTH_MAP: Record<string, number> = {
  'জানুয়ারী': 1,
  'জানুয়ারি': 1,
  'ফেব্রুয়ারী': 2,
  'ফেব্রুয়ারি': 2,
  'মার্চ': 3,
  'এপ্রিল': 4,
  'মে': 5,
  'জুন': 6,
  'জুলাই': 7,
  'আগস্ট': 8,
  'অগাস্ট': 8,
  'সেপ্টেম্বর': 9,
  'অক্টোবর': 10,
  'নভেম্বর': 11,
  'ডিসেম্বর': 12,
};

export const ENGLISH_MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Converts Bangla digits (০-৯) to English digits (0-9)
 * and normalizes Bangla weekday and month names.
 */
export function normalizeBanglaText(text: string): string {
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let res = text;
  banglaDigits.forEach((b, i) => {
    res = res.replaceAll(b, String(i));
  });

  // Convert Bangla weekdays - sort by length descending to match 'বৃহস্পতিবার' before 'বৃহস্পতি'
  const sortedBnDays = Object.entries(BANGLA_WEEKDAY_MAP).sort((a, b) => b[0].length - a[0].length);
  for (const [bnDay, enDay] of sortedBnDays) {
    res = res.replaceAll(bnDay, enDay);
  }

  return res;
}

/**
 * Normalizes day name to standard English capitalized weekday
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
 * Extracts Academic Context (Year, Semester, Level, Term, Batch)
 */
export function extractAcademicContext(text: string): StructuredRoutineOutput['academic_context'] {
  let year: number | null = null;
  let semester: number | null = null;
  let level: string | null = null;
  let term: string | null = null;
  let batch: string | null = null;

  // 1/1, 2/1, 3/2, 4/1 format
  const slashMatch = text.match(/\b([1-4])\s*\/\s*([1-2])\b/);
  if (slashMatch) {
    year = parseInt(slashMatch[1], 10);
    semester = parseInt(slashMatch[2], 10);
  }

  // Level & Term (e.g. "Level 2 Term 1" or "L-2 T-1")
  const levelTermMatch = text.match(/\b(?:level|l)[-.\s]*([1-4])\s*(?:term|t)[-.\s]*([1-2])\b/i);
  if (levelTermMatch) {
    level = `Level ${levelTermMatch[1]}`;
    term = `Term ${levelTermMatch[2]}`;
    if (!year) year = parseInt(levelTermMatch[1], 10);
    if (!semester) semester = parseInt(levelTermMatch[2], 10);
  }

  // Year regex
  if (!year) {
    const yearMatch = text.match(/\b(?:year\s*([1-4])|([1-4])(?:st|nd|rd|th)?\s*year|y([1-4])|year\s*(i{1,4}|iv))\b/i);
    if (yearMatch) {
      const val = yearMatch[1] || yearMatch[2] || yearMatch[3];
      if (val) year = parseInt(val, 10);
      else if (yearMatch[4]) {
        const roman = yearMatch[4].toLowerCase();
        if (roman === 'i') year = 1;
        else if (roman === 'ii') year = 2;
        else if (roman === 'iii') year = 3;
        else if (roman === 'iv') year = 4;
      }
    }
  }

  // Semester regex
  if (!semester) {
    const semMatch = text.match(/\b(?:semester\s*([1-2])|([1-2])(?:st|nd)?\s*sem(?:ester)?|sem\s*([1-2])|semester\s*(i{1,2}))\b/i);
    if (semMatch) {
      const val = semMatch[1] || semMatch[2] || semMatch[3];
      if (val) semester = parseInt(val, 10);
      else if (semMatch[4]) {
        const roman = semMatch[4].toLowerCase();
        if (roman === 'i') semester = 1;
        else if (roman === 'ii') semester = 2;
      }
    }
  }

  // Batch regex (e.g. "Batch 5", "Batch-2022", "28th Batch")
  const batchMatch = text.match(/\b(?:batch\s*[-#]?\s*(\d+[A-Za-z0-9-]*)|(\d+)(?:st|nd|rd|th)\s*batch)\b/i);
  if (batchMatch) {
    batch = batchMatch[1] || `${batchMatch[2]}th Batch`;
  }

  // Course code inference fallback
  if (!year || !semester) {
    const codeMatch = text.match(/\bFES\s*(?:0821)?([1-4])([1-2])\d{1,4}\b/i);
    if (codeMatch) {
      if (!year) year = parseInt(codeMatch[1], 10);
      if (!semester) semester = parseInt(codeMatch[2], 10);
    }
  }

  return { year, semester, level, term, batch };
}

/**
 * Event Type Classification with strict priority:
 * viva > presentation > term_test > final_exam > quiz > assignment > lab > class
 */
export function classifyEventType(text: string): {
  type: RoutineEventType;
  typeLabel: string | null;
  isLab: boolean;
  sequenceNumber: number | null;
} {
  const isLab = /\b(lab|practical|sessional|field\s*work|herbarium\s*lab|taxonomy\s*lab)\b/i.test(text);
  let type: RoutineEventType = 'class';
  let typeLabel: string | null = null;
  let sequenceNumber: number | null = null;

  // Extract sequence number (e.g. TT-2, CT 3, Quiz-1)
  const seqMatch = text.match(/\b(?:tt|t\.t\.|ct|c\.t\.|quiz|mid)[-\s#]*(\d+)\b/i);
  if (seqMatch) {
    sequenceNumber = parseInt(seqMatch[1], 10);
  }

  // Priority check
  if (/\b(viva|viva\s*voce|oral|vyva|মৌখিক)\b/i.test(text)) {
    type = 'viva';
    typeLabel = 'Viva Voce';
  } else if (/\b(presentation|seminar\s*presentation|slide\s*show|poster\s*presentation|প্রেজেন্টেশন)\b/i.test(text)) {
    type = 'presentation';
    typeLabel = 'Presentation';
  } else if (/\b(term\s*test|tt|t\.t\.|mid|midterm|mid-term|incourse|ইনকোর্স|টার্ম\s*টেস্ট)\b/i.test(text)) {
    type = 'term_test';
    typeLabel = sequenceNumber ? `Term Test ${sequenceNumber}` : 'Term Test';
  } else if (/\b(final\s*exam|semester\s*final|final)\b/i.test(text) && !/\bfinal\s*(date|submission|report)\b/i.test(text)) {
    type = 'final_exam';
    typeLabel = 'Semester Final Exam';
  } else if (/\b(quiz|class\s*test|ct|c\.t\.|pop\s*quiz|কুইজ)\b/i.test(text)) {
    type = 'quiz';
    typeLabel = sequenceNumber ? `Class Test ${sequenceNumber}` : 'Quiz';
  } else if (/\b(assignment|submission|report\s*submission|deadline|tutorial\s*submission|অ্যাসাইনমেন্ট|জমা)\b/i.test(text)) {
    type = 'assignment';
    typeLabel = 'Assignment Deadline';
  } else if (isLab) {
    type = 'lab';
    typeLabel = 'Practical Sessional';
  }

  return { type, typeLabel, isLab, sequenceNumber };
}

/**
 * Extracts content inside brackets [ ] or ( )
 * Bracket content usually holds room/venue/person/mode, not subject.
 */
export function extractBracketMetadata(text: string): {
  cleanedText: string;
  room: string | null;
  teacher: string | null;
} {
  let room: string | null = null;
  let teacher: string | null = null;

  // Find all [ ... ] or ( ... )
  const bracketMatches = text.match(/(\[[^\]]+\]|\([^)]+\))/g);
  let cleanedText = text;

  if (bracketMatches) {
    for (const b of bracketMatches) {
      const inner = b.slice(1, -1).trim();

      // Check if bracket contains venue/room
      const roomMatch = inner.match(/(?:Room|Rm|R)\s*[-#.:]?\s*([A-Za-z0-9-]+(?:\s*,\s*[A-Za-z0-9\s]+)?)|(?:Herbarium|Taxonomy|Wood Science|GIS|Remote Sensing|Chemistry|Physics|Computer)\s*(?:Lab|Hall|Room)?|(?:Gallery|Auditorium)\s*[0-9A-Za-z-]*/i);
      if (roomMatch && !room) {
        room = roomMatch[0].trim();
      }

      // Check if bracket contains teacher (non-backtracking bounded token sequence)
      const teacherMatch = inner.match(/(?:Prof(?:essor)?\.?|Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+[A-Z][a-zA-Z.]*(?:\s+[A-Z][a-zA-Z.]*){0,4}/);
      if (teacherMatch && !teacher) {
        teacher = teacherMatch[0].trim();
      }

      // Also check if teacher matches departmental faculty name
      if (!teacher) {
        for (const fac of SUST_FES_FACULTY) {
          const parts = fac.name.toLowerCase().split(/\s+/).filter((p) => p.length > 2 && p !== 'dr.' && p !== 'mr.' && p !== 'ms.');
          for (const p of parts) {
            if (inner.toLowerCase().includes(p)) {
              teacher = fac.name;
              break;
            }
          }
          if (teacher) break;
        }
      }

      cleanedText = cleanedText.replace(b, ' ');
    }
  }

  cleanedText = cleanedText.replace(/\s+/g, ' ').trim();
  return { cleanedText, room, teacher };
}

/**
 * Parses and verifies Date and Weekday according to strict date rules:
 * - Default format: DD/MM/YYYY. Switch to MM/DD only if day > 12 in 2nd position with warning.
 * - Weekday verification against real calendar date with conflict detection.
 */
export function parseDateSpecification(
  text: string,
  contextToday: string = '2026-11-10'
): {
  date: string | null;
  weekday_as_written: string | null;
  weekday_computed: string | null;
  weekday_conflict: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  let date: string | null = null;
  let weekday_as_written: string | null = null;
  let weekday_computed: string | null = null;
  let weekday_conflict = false;

  // Detect written weekday
  for (const d of VALID_DAYS) {
    if (new RegExp(`\\b${d.slice(0, 3)}[a-z]*\\b`, 'i').test(text)) {
      weekday_as_written = d;
      break;
    }
  }

  // 1. Try DD/MM/YYYY or DD-MM-YYYY
  const slashMatch = text.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/);
  if (slashMatch) {
    let p1 = parseInt(slashMatch[1], 10);
    let p2 = parseInt(slashMatch[2], 10);
    let yr = parseInt(slashMatch[3], 10);
    if (yr < 100) yr = 2000 + yr;

    let day: number;
    let month: number;

    if (p1 > 12) {
      day = p1;
      month = p2;
    } else if (p2 > 12) {
      // MM/DD switch
      month = p1;
      day = p2;
      warnings.push(`Switched to MM/DD format because day value (${p2}) was in second position.`);
    } else {
      // Default DD/MM
      day = p1;
      month = p2;
    }

    date = `${yr}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // 2. Try word month format (e.g. "26 September, 2026", "4 Oct 2026", "4th October")
  if (!date) {
    const wordDateMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:,?\s+(\d{4}))?\b/i);
    if (wordDateMatch) {
      const d = parseInt(wordDateMatch[1], 10);
      const mStr = wordDateMatch[2].toLowerCase();
      const yr = wordDateMatch[3] ? parseInt(wordDateMatch[3], 10) : parseInt(contextToday.slice(0, 4), 10);

      const m = ENGLISH_MONTH_MAP[mStr] || BANGLA_MONTH_MAP[mStr];
      if (m && d >= 1 && d <= 31) {
        date = `${yr}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (!wordDateMatch[3]) {
          warnings.push(`Year was missing; inferred as ${yr} from context.`);
        }
      }
    }
  }

  // Weekday verification and conflict detection
  if (date) {
    const [y, m, d] = date.split('-').map(Number);
    const dObj = new Date(y, m - 1, d);
    weekday_computed = VALID_DAYS[dObj.getDay()];

    if (weekday_as_written && weekday_as_written.toLowerCase() !== weekday_computed.toLowerCase()) {
      weekday_conflict = true;
      warnings.push(`Written weekday (${weekday_as_written}) does not match date (${weekday_computed}). Please verify.`);
    }
  }

  return { date, weekday_as_written, weekday_computed, weekday_conflict, warnings };
}

/**
 * Parses Time according to strict time rules:
 * - 24-hour HH:MM
 * - Range logic: "12.20-1.10 pm" -> 12:20 to 13:10, "11-1 pm" -> 11:00 to 13:00, "2-4 pm" -> 14:00 to 16:00
 * - Single time: start_time set, end_time null (never invent duration)
 * - Suspicious time detection: outside 07:00-21:00 with typo flip
 * - All day event handling
 */
export function parseTimeSpecification(
  rawTimeText: string,
  surroundingIsAfterNoon = false
): {
  start_time: string | null;
  end_time: string | null;
  time_as_written: string | null;
  all_day: boolean;
  warnings: string[];
  confidence: 'high' | 'medium' | 'low';
} {
  const warnings: string[] = [];
  let confidence: 'high' | 'medium' | 'low' = 'high';
  let start_time: string | null = null;
  let end_time: string | null = null;
  let all_day = false;

  // Clean separator and dot representation using callback to prevent negative replacement index bugs
  let clean = rawTimeText.replace(/(\d{1,2})\.(\d{2})/g, (match, p1, p2) => `${p1}:${p2}`).trim();

  // Range match (e.g. "9:00am - 10:30am", "12:20-1:10 pm", "11-1 pm", "2- 4 pm", "11:30 - 01:00", "09:00 - 10:30", "from 10:00 to 11:30")
  const rangeMatch = clean.match(/(?:from\s+)?(\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?)\s*(?:-|to|–|—)\s*(\d{1,2}(?::\d{2})?\s*(?:[AaPp][Mm])?)/i);
  if (rangeMatch) {
    const rawP1 = rangeMatch[1].trim();
    const rawP2 = rangeMatch[2].trim();

    const p1AmPm = rawP1.match(/[AaPp][Mm]/i)?.[0]?.toUpperCase();
    const p2AmPm = rawP2.match(/[AaPp][Mm]/i)?.[0]?.toUpperCase();

    const parseHM = (s: string) => {
      const pure = s.replace(/[AaPp][Mm]/i, '').trim();
      const [h, m] = pure.split(':');
      return { hr: parseInt(h, 10), mn: m ? parseInt(m, 10) : 0 };
    };

    let t1 = parseHM(rawP1);
    let t2 = parseHM(rawP2);

    // Apply explicit AM/PM to t1
    if (p1AmPm === 'PM' && t1.hr < 12) t1.hr += 12;
    if (p1AmPm === 'AM' && t1.hr === 12) t1.hr = 0;

    // Apply explicit AM/PM to t2
    if (p2AmPm === 'PM' && t2.hr < 12) t2.hr += 12;
    if (p2AmPm === 'AM' && t2.hr === 12) t2.hr = 0;

    // Range logic when only p2 has PM: e.g. "11-1 pm" -> 11:00 to 13:00, "2-4 pm" -> 14:00 to 16:00
    if (!p1AmPm && p2AmPm === 'PM') {
      const t2Nominal = (t2.hr % 12) || 12;
      if (t1.hr <= t2Nominal) {
        if (t1.hr < 12 && t1.hr !== 0) t1.hr += 12;
      }
    }

    // Default daytime inference when neither has AM/PM: e.g. "09:00 - 10:30", "11:30 - 01:00"
    if (!p1AmPm && !p2AmPm) {
      if (t1.hr >= 1 && t1.hr <= 6) t1.hr += 12;
      if (t2.hr >= 1 && t2.hr <= 6) t2.hr += 12;
      // Rollover check: e.g. start at 11:00 or 12:00, end at 1:00 or 2:00
      if (t2.hr < t1.hr && t2.hr < 12) {
        t2.hr += 12;
      }
    }

    start_time = `${String(t1.hr).padStart(2, '0')}:${String(t1.mn).padStart(2, '0')}`;
    end_time = `${String(t2.hr).padStart(2, '0')}:${String(t2.mn).padStart(2, '0')}`;
  } else {
    // Single time match (e.g. "9 AM", "9:00", "at 14:00", "from 10:30")
    const singleMatch = clean.match(/(?:at|from)?\s*(\d{1,2}(?::\d{2})?)\s*([AaPp][Mm])?/i);
    if (singleMatch && singleMatch[1]) {
      const pure = singleMatch[1].trim();
      const [h, m] = pure.split(':');
      let hr = parseInt(h, 10);
      let mn = m ? parseInt(m, 10) : 0;
      const ampm = singleMatch[2]?.toUpperCase();

      if (ampm === 'PM' && hr < 12) hr += 12;
      if (ampm === 'AM' && hr === 12) hr = 0;
      if (!ampm && hr >= 1 && hr <= 6) hr += 12;

      start_time = `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}`;
      end_time = null;
      warnings.push("Single time specified without end time. No duration invented.");
    } else {
      all_day = true;
      warnings.push("No specific time found; marked as all-day event.");
    }
  }

  // Suspicious time detection: outside 07:00–21:00
  if (start_time) {
    const hr = parseInt(start_time.slice(0, 2), 10);
    if (hr < 7 || hr > 21) {
      // Check if flipping AM/PM fits daytime routine
      if (hr >= 22) {
        // e.g. 22:00 (10 PM) -> flip to 10:00 AM
        const flippedHr = hr - 12;
        start_time = `${String(flippedHr).padStart(2, '0')}:${start_time.slice(3)}`;
        confidence = 'low';
        warnings.push(`Written time looks like a typo for ${flippedHr}:00 AM based on daytime schedule.`);
      }
    }
  }

  return {
    start_time,
    end_time,
    time_as_written: rawTimeText.trim() || null,
    all_day,
    warnings,
    confidence,
  };
}

/**
 * Strict Class Routine Parser Engine adhering to product specification:
 * - Returns ONE strictly compliant StructuredRoutineOutput JSON object
 * - Extracts every single event
 * - Computes dates, weekday conflicts, event types, times, confidence, and warnings
 */
export function parseScheduleStrict(
  rawText: string,
  context: { today?: string; timezone?: string } = {}
): StructuredRoutineOutput {
  const normalizedText = normalizeBanglaText(rawText);
  const contextToday = context.today || '2026-11-10';
  const timezone = context.timezone || 'Asia/Dhaka';

  const academicContext = extractAcademicContext(normalizedText);
  const events: ParsedRoutineEvent[] = [];

  const lines = normalizedText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let currentDateInfo: ReturnType<typeof parseDateSpecification> | null = null;
  let currentWeekday = 'Sunday';
  let eventIndex = 1;

  for (const line of lines) {
    // Check if line contains a standalone date or day header
    const dateCheck = parseDateSpecification(line, contextToday);
    if (dateCheck.date) {
      currentDateInfo = dateCheck;
      if (dateCheck.weekday_computed) {
        currentWeekday = dateCheck.weekday_computed;
      }
    } else if (dateCheck.weekday_as_written) {
      currentWeekday = dateCheck.weekday_as_written;
    }

    // Ignore pure headers or section divider decorations
    if (/^[🟩⚫📌✅=\-*_~#|]+$/.test(line)) continue;
    if (/^(?:class\s*schedule|weekly\s*routine|notices|routine|examination\s*schedule)$/i.test(line)) continue;

    // Check if line is only a day header
    const lowerLine = line.toLowerCase().replace(/[:#=\-*_~]/g, '').trim();
    let isPureDayHeader = false;
    for (const d of VALID_DAYS) {
      if (lowerLine === d.toLowerCase() || lowerLine === d.toLowerCase().slice(0, 3)) {
        currentWeekday = d;
        isPureDayHeader = true;
        break;
      }
    }
    if (isPureDayHeader) continue;

    // Extract bracket metadata (rooms, teachers)
    const { cleanedText, room: bracketRoom, teacher: bracketTeacher } = extractBracketMetadata(line);

    // Parse time - priority for range, then single time
    const timeRegex = /(?:(?:from\s+)?(\d{1,2}(?::\d{2}|\.\d{2})?\s*(?:[AaPp][Mm])?)\s*(?:-|to|–|—)\s*(\d{1,2}(?::\d{2}|\.\d{2})?\s*(?:[AaPp][Mm])?)|(?:at|from)\s*(\d{1,2}(?::\d{2}|\.\d{2})?\s*(?:[AaPp][Mm])?)|(\d{1,2}(?::\d{2}|\.\d{2})?\s*(?:[AaPp][Mm]))|(\d{1,2}:\d{2}))/i;
    const timeMatch = line.match(timeRegex);
    const timeInfo = parseTimeSpecification(timeMatch ? timeMatch[0] : '');

    // Event Classification
    const classification = classifyEventType(line);

    // Subject Code and Name Extraction
    const codeRegex = /\b([A-Z]{2,4}\s*[-–]?\s*(?:0821)?\d{3,8}[A-Z]?)\b/i;
    const codeMatch = cleanedText.match(codeRegex);
    let subject_code: string | null = codeMatch 
      ? codeMatch[1].replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase() 
      : null;

    let subject_name = cleanedText;
    if (timeMatch) subject_name = subject_name.replace(timeRegex, '');
    if (codeMatch) subject_name = subject_name.replace(codeRegex, '');
    subject_name = subject_name.replace(/\b(?:Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday)\b/gi, '');
    subject_name = subject_name.replace(/^[,\s;:\-|–—]+|[,\s;:\-|–—]+$/g, '').trim();

    // Match with curriculum database if possible
    if (subject_code) {
      const compact = subject_code.replace(/\s+/g, '');
      const cur = SUST_FES_COURSES.find(
        (c) => c.code.replace(/\s+/g, '').toLowerCase() === compact.toLowerCase() ||
               c.shortCode.replace(/\s+/g, '').toLowerCase() === compact.toLowerCase()
      );
      if (cur) {
        subject_code = cur.code;
        if (!subject_name || subject_name.length < 3) subject_name = cur.title;
      }
    }

    if (!subject_name) {
      subject_name = subject_code || 'Department Class';
    }

    // Room and Teacher (single-pass match)
    const roomLineMatch = !bracketRoom ? line.match(/Room\s*\d+/i) : null;
    const room = bracketRoom || (roomLineMatch ? roomLineMatch[0] : null);
    const teacherLineMatch = !bracketTeacher
      ? line.match(/(?:Prof|Dr)\.?\s+[A-Za-z.]+(?:\s+[A-Za-z.]+){0,4}/i)
      : null;
    const teacher = bracketTeacher || (teacherLineMatch ? teacherLineMatch[0].trim() : null);

    // Date & Recurrence
    const date = currentDateInfo?.date || null;
    const recurrence = date ? 'none' : 'weekly';
    const weekday_as_written = currentDateInfo?.weekday_as_written || currentWeekday;
    const weekday_computed = currentDateInfo?.weekday_computed || currentWeekday;
    const weekday_conflict = currentDateInfo?.weekday_conflict || false;

    // Aggregate warnings
    const warnings: string[] = [
      ...(currentDateInfo?.warnings || []),
      ...timeInfo.warnings,
    ];

    if (!date) {
      warnings.push(`No calendar date given; marked as recurring weekly on ${currentWeekday}.`);
    }

    // Is line valid event? Must have subject or time or course code
    if (codeMatch || timeMatch || classification.type !== 'class' || subject_name.length > 2) {
      events.push({
        id: `event-${eventIndex++}`,
        date,
        weekday_as_written,
        weekday_computed,
        weekday_conflict,
        recurrence,
        start_time: timeInfo.start_time,
        end_time: timeInfo.end_time,
        time_as_written: timeInfo.time_as_written,
        all_day: timeInfo.all_day,
        subject_code,
        subject_name,
        type: classification.type,
        type_label: classification.typeLabel,
        is_lab: classification.isLab,
        sequence_number: classification.sequenceNumber,
        room,
        teacher,
        confidence: timeInfo.confidence,
        warnings,
      });
    }
  }

  // Sort events by date, then start time
  events.sort((a, b) => {
    if (a.date && b.date) {
      const dCmp = a.date.localeCompare(b.date);
      if (dCmp !== 0) return dCmp;
    } else if (a.date) return -1;
    else if (b.date) return 1;

    if (a.start_time && b.start_time) {
      return a.start_time.localeCompare(b.start_time);
    }
    return 0;
  });

  return {
    academic_context: academicContext,
    timezone,
    events,
  };
}

/**
 * Universal entry point returning ParseScheduleResult:
 * Fully integrates parseScheduleStrict, maps events into RoutineSlot array,
 * and provides both format rendering modes (Calendar and Routine Boxes).
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

  // Run Strict Specification Parser
  const structured = parseScheduleStrict(rawText);
  const rawJsonString = JSON.stringify(structured, null, 2);

  const activeYear = structured.academic_context.year || targetYear;
  const activeSemester = structured.academic_context.semester || targetSemester;

  // Map into RoutineSlot array for full rendering integration
  const slots: RoutineSlot[] = structured.events.map((ev) => {
    const timeDisplay = ev.start_time && ev.end_time 
      ? `${ev.start_time} - ${ev.end_time}` 
      : ev.start_time 
        ? ev.start_time 
        : ev.time_as_written || '09:00 - 10:30';

    return {
      id: ev.id,
      day: ev.weekday_computed || ev.weekday_as_written || 'Sunday',
      time: timeDisplay,
      courseCode: ev.subject_code || `FES 0821${activeYear}${activeSemester}01`,
      courseTitle: ev.subject_name,
      room: ev.room || `Room ${300 + activeYear}`,
      teacher: ev.teacher || 'Dept. of Forestry & Env. Science',
      date: ev.date,
      type: ev.type,
      typeLabel: ev.type_label,
      isLab: ev.is_lab,
      sequenceNumber: ev.sequence_number,
      startTime: ev.start_time,
      endTime: ev.end_time,
      allDay: ev.all_day,
      recurrence: ev.recurrence,
      weekdayConflict: ev.weekday_conflict,
      weekdayAsWritten: ev.weekday_as_written,
      weekdayComputed: ev.weekday_computed,
      timeAsWritten: ev.time_as_written,
      confidence: ev.confidence,
      warnings: ev.warnings,
    };
  });

  return {
    slots,
    year: activeYear,
    semester: activeSemester,
    source: 'universal',
    rawSummary: `Parsed ${slots.length} events (${structured.events.filter((e) => e.type !== 'class').length} assessments/labs, ${structured.events.filter((e) => e.type === 'class').length} lectures).`,
    detectedCount: slots.length,
    structuredJson: structured,
    rawJsonString,
  };
}
