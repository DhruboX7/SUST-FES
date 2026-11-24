import React, { useState, useEffect, useRef } from 'react';
import { YearRoutine, RoutineSlot, AcademicYear } from '../../types';
import { getStoredRoutines, saveStoredRoutines, resetStoredRoutines } from '../../utils/storage';
import { parseScheduleWithAI, ParseScheduleResult } from '../../utils/aiScheduleParser';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Copy,
  Loader2,
  Table,
  X
} from 'lucide-react';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SAMPLE_SCHEDULE_TEXT = `SUST Dept of Forestry and Environmental Science
Weekly Class Schedule (Session 2025-26)
Year 1, Semester 1 Routine:

Sunday:
09:00 - 10:30 | FES 08211121 Introduction to Forestry | Room 301, Academic Building E | Prof. Dr. A. Z. M. Manzoor Rashid
11:00 - 12:30 | CHE 05311125 Basic Chemistry for Forestry | Chemistry Hall 2 | Dept. of Chemistry

Monday:
09:00 - 11:00 | FES 08211122 Forest Botany & Dendrology Lab | Herbarium Lab | Prof. Dr. Narayan Saha

Tuesday:
10:00 - 11:30 | ENG 02321123 English Language Skills | Room 302 | Dept. of English

Wednesday:
11:30 - 01:00 | FES 08211121 Introduction to Forestry | Room 301 | Prof. Dr. A. Z. M. Manzoor Rashid`;

const SAMPLE_WHATSAPP_NOTICE = `Notice for 2nd Year 1st Semester:
Class routine starts next week:
Sunday
9:00am - 10:30am: FES 211 Silvicultural Systems in Room 302 with Dr. Romel Ahmed
11:00am - 12:30pm: FES 213 Forest Ecology in Room 301
Tuesday
09:00 - 10:30 AM: FES 215 Wood Anatomy in Wood Lab by Dr. Kibria
Thursday
10:00 - 11:30: FES 217 Forest Mensuration in Room 304 with Dr. Redowan`;

const SAMPLE_EXCEL_TABLE = `Day	Time	Course	Title	Room	Teacher
Sunday	09:00 - 10:30	FES 111	Introduction to Forestry	Room 301	Prof. Manzoor Rashid
Sunday	11:00 - 12:30	CHE 101	Basic Chemistry	Hall 2	Dept. of Chemistry
Monday	09:00 - 11:00	FES 112	Forest Botany Lab	Herbarium Lab	Dr. Narayan Saha
Tuesday	10:00 - 11:30	ENG 101	English Language Skills	Room 302	Dept. of English
Wednesday	11:30 - 01:00	FES 111	Introduction to Forestry	Room 301	Prof. Manzoor Rashid`;

const SAMPLE_KEYVALUE_BLOCKS = `Day: Sunday
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
Teacher: Dr. Swapan Sarker

Day: Wednesday
Time: 9:00 AM - 10:30 AM
Course: FES 315
Title: Tree Improvement
Room: Genetics Lab
Teacher: Dr. Farzana Raihan`;

export const AdminRoutinePanel: React.FC = () => {
  const [routines, setRoutines] = useState<YearRoutine[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  // AI Parser Modal / Drawer State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [modalViewTab, setModalViewTab] = useState<'boxes' | 'json'>('boxes');
  const [jsonCopied, setJsonCopied] = useState(false);
  const [rawInputText, setRawInputText] = useState('');
  const [aiTargetYear, setAiTargetYear] = useState<number>(1);
  const [aiTargetSemester, setAiTargetSemester] = useState<number>(1);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseScheduleResult | null>(null);
  const [editableSlots, setEditableSlots] = useState<RoutineSlot[]>([]);

  // Manual slot creation state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualSlot, setManualSlot] = useState<RoutineSlot>({
    day: 'Sunday',
    time: '09:00 - 10:30',
    courseCode: '',
    courseTitle: '',
    room: 'Room 301',
    teacher: '',
  });

  // Feedback message & inline reset confirm
  const [confirmReset, setConfirmReset] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    const id = window.setTimeout(() => setStatusMessage(null), 4000);
    timersRef.current.push(id);
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await getStoredRoutines();
        if (isMounted) setRoutines(data);
      } catch (err) {
        console.error('Failed to load routines:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Current selected schedule
  const currentRoutine = routines.find(
    (r) => r.year === selectedYear && r.semester === selectedSemester
  );
  const currentSlots = currentRoutine?.schedule || [];

  // Update schedule for specific year/semester
  const handleUpdateCurrentSchedule = (newSlots: RoutineSlot[]) => {
    const updated = [...routines];
    const index = updated.findIndex((r) => r.year === selectedYear && r.semester === selectedSemester);

    if (index >= 0) {
      updated[index] = { ...updated[index], schedule: newSlots };
    } else {
      updated.push({ year: selectedYear, semester: selectedSemester, schedule: newSlots });
    }

    setRoutines(updated);
    saveStoredRoutines(updated);
    showStatus(`Saved ${newSlots.length} schedule slots for Year ${selectedYear} Sem ${selectedSemester}!`);
  };

  // Delete a slot
  const handleDeleteSlot = (index: number) => {
    const newSlots = currentSlots.filter((_, i) => i !== index);
    handleUpdateCurrentSchedule(newSlots);
  };

  // Add manual slot
  const handleAddManualSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSlot.courseCode || !manualSlot.courseTitle) {
      showStatus('Course code and title are required.', 'error');
      return;
    }

    const newSlots = [
      ...currentSlots,
      { ...manualSlot, id: `slot-${Date.now()}` },
    ];
    handleUpdateCurrentSchedule(newSlots);
    setShowManualForm(false);
    setManualSlot({
      day: 'Sunday',
      time: '09:00 - 10:30',
      courseCode: '',
      courseTitle: '',
      room: 'Room 301',
      teacher: '',
    });
  };

  // Centralized parsing execution function
  const executeParsing = async (textToParse: string, yearOverride?: number, semOverride?: number) => {
    if (!textToParse.trim()) {
      setParseResult(null);
      setEditableSlots([]);
      return;
    }

    setIsParsing(true);
    try {
      const yr = yearOverride || aiTargetYear;
      const sem = semOverride || aiTargetSemester;
      const result = await parseScheduleWithAI(textToParse, yr, sem);

      // Auto-update target year and semester if detected from text
      if (result.year && result.year !== aiTargetYear) {
        setAiTargetYear(result.year);
      }
      if (result.semester && result.semester !== aiTargetSemester) {
        setAiTargetSemester(result.semester);
      }

      setParseResult(result);
      setEditableSlots(result.slots);

      if (result.slots.length > 0) {
        const sourceLabel = result.source === 'gemini' 
          ? 'Gemini 3.8 Flash' 
          : 'Universal Schedule Engine';
        showStatus(`Extracted ${result.slots.length} classes via ${sourceLabel}!`);
      } else {
        showStatus('No class slots recognized. Please verify or paste alternative format.', 'error');
      }
    } catch (err) {
      console.warn('Schedule parse error:', err);
      showStatus('Failed to parse schedule text.', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  // Trigger manual AI Parsing
  const handleRunAiParser = () => {
    executeParsing(rawInputText);
  };

  // Auto-generate entries immediately on paste
  const handlePasteSchedule = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted && pasted.trim()) {
      e.preventDefault();
      setRawInputText(pasted);
      executeParsing(pasted);
    }
  };

  // Quick load sample text with auto-generation
  const handleLoadSample = (sampleText: string) => {
    setRawInputText(sampleText);
    executeParsing(sampleText);
  };

  // Commit parsed slots to database
  const handleCommitParsedSlots = (mode: 'replace' | 'append') => {
    if (editableSlots.length === 0) {
      showStatus('No slots to commit.', 'error');
      return;
    }

    const updated = [...routines];
    const index = updated.findIndex((r) => r.year === aiTargetYear && r.semester === aiTargetSemester);

    let finalSchedule: RoutineSlot[] = [];
    if (index >= 0) {
      if (mode === 'append') {
        finalSchedule = [...updated[index].schedule, ...editableSlots];
      } else {
        finalSchedule = editableSlots;
      }
      updated[index] = { ...updated[index], schedule: finalSchedule };
    } else {
      finalSchedule = editableSlots;
      updated.push({ year: aiTargetYear, semester: aiTargetSemester, schedule: finalSchedule });
    }

    setRoutines(updated);
    saveStoredRoutines(updated);
    setSelectedYear(aiTargetYear);
    setSelectedSemester(aiTargetSemester);
    setIsAiModalOpen(false);
    setParseResult(null);
    setEditableSlots([]);
    setRawInputText('');
    showStatus(`Successfully ${mode === 'replace' ? 'replaced' : 'appended'} ${finalSchedule.length} slots for Year ${aiTargetYear} Sem ${aiTargetSemester}!`);
  };

  // Reset to factory defaults (inline confirm, no window.confirm)
  const handleResetToDefaults = async () => {
    const def = await resetStoredRoutines();
    setRoutines(def);
    setConfirmReset(false);
    showStatus('Reset class routines to official defaults.');
  };

  return (
    <div className="space-y-6">
      
      {/* Status Feedback Toast */}
      {statusMessage && (
        <div
          role="status"
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between border animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-[#FAF9F4] text-[#19382B] border-[#42684D] dark:bg-[#19382B] dark:text-[#F3F1E8] dark:border-[#8A9C74]'
              : 'bg-[#EAE7DA] text-[#987453] border-[#987453] dark:bg-[#142D22] dark:text-[#F3F1E8] dark:border-[#987453]'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#987453]" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Hero Action Header */}
      <div className="bg-[#19382B] rounded-lg p-5 sm:p-6 text-[#F3F1E8] border border-[#42684D]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#8A9C74] text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Class Routine & Timetable Manager</span>
          </div>
          <h2 className="font-editorial text-xl sm:text-2xl font-semibold tracking-tight text-[#F3F1E8]">
            Weekly Schedule & Routine Manager
          </h2>
          <p className="text-xs text-[#BBC4A6] mt-1 max-w-xl">
            Manage semester timetable slots, paste announcements for structured extraction, or review classes by year and semester.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Schedule Parser Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setAiTargetYear(selectedYear);
              setAiTargetSemester(selectedSemester);
              setIsAiModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-[#42684D] hover:bg-[#8A9C74] text-[#FAF9F4] hover:text-[#19382B] border border-[#BBC4A6]/30 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Schedule Parser</span>
          </button>

          <button
            type="button"
            onClick={() => setShowManualForm((prev) => !prev)}
            className="px-3.5 py-2 text-xs font-semibold rounded-md bg-[#142D22] hover:bg-[#42684D] text-[#F3F1E8] border border-[#BBC4A6]/25 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showManualForm ? 'Close Form' : 'Add Slot'}</span>
          </button>

          {confirmReset ? (
            <div className="flex items-center gap-1.5 p-1 rounded-md bg-[#142D22] border border-[#987453]/70">
              <button
                type="button"
                onClick={handleResetToDefaults}
                className="px-2.5 py-1 text-[11px] font-semibold bg-[#987453] hover:bg-[#42684D] text-[#FAF9F4] rounded-sm transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="p-1 text-[#BBC4A6] hover:text-[#F3F1E8] cursor-pointer"
                title="Cancel reset"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              title="Reset to factory routine"
              className="p-2 rounded-md text-[#BBC4A6] hover:text-[#F3F1E8] hover:bg-[#142D22] border border-transparent hover:border-[#BBC4A6]/25 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Manual Slot Form */}
      {showManualForm && (
        <form onSubmit={handleAddManualSlot} className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 pb-2">
            <h4 className="font-editorial text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
              <span>Add Single Class Slot (Year {selectedYear}, Sem {selectedSemester})</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="text-xs text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">Weekday</label>
              <select
                value={manualSlot.day}
                onChange={(e) => setManualSlot({ ...manualSlot, day: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-semibold focus:outline-none focus:border-[#42684D]"
              >
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">Time Slot</label>
              <input
                type="text"
                value={manualSlot.time}
                onChange={(e) => setManualSlot({ ...manualSlot, time: e.target.value })}
                placeholder="e.g. 09:00 - 10:30"
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono focus:outline-none focus:border-[#42684D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">Course Code</label>
              <input
                type="text"
                value={manualSlot.courseCode}
                onChange={(e) => setManualSlot({ ...manualSlot, courseCode: e.target.value })}
                placeholder="e.g. FES 08211121"
                required
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono font-semibold focus:outline-none focus:border-[#42684D]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">Course Title</label>
              <input
                type="text"
                value={manualSlot.courseTitle}
                onChange={(e) => setManualSlot({ ...manualSlot, courseTitle: e.target.value })}
                placeholder="e.g. Introduction to Forestry"
                required
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-medium focus:outline-none focus:border-[#42684D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">Room / Venue</label>
              <input
                type="text"
                value={manualSlot.room}
                onChange={(e) => setManualSlot({ ...manualSlot, room: e.target.value })}
                placeholder="e.g. Room 301, Academic Building E"
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] focus:outline-none focus:border-[#42684D]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">Assigned Teacher / Instructor</label>
              <input
                type="text"
                value={manualSlot.teacher}
                onChange={(e) => setManualSlot({ ...manualSlot, teacher: e.target.value })}
                placeholder="e.g. Prof. Dr. A. Z. M. Manzoor Rashid"
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] focus:outline-none focus:border-[#42684D]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md text-xs font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Class Slot</span>
            </button>
          </div>
        </form>
      )}

      {/* Routine Viewer Table */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-5 space-y-4">
        
        {/* Year and Semester Segmented Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#42684D] dark:text-[#BBC4A6]">Year:</span>
              <div className="flex gap-1 p-1 bg-[#EAE7DA] dark:bg-[#142D22] rounded-md border border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
                {[1, 2, 3, 4].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setSelectedYear(y)}
                    className={`px-3 py-1 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                      selectedYear === y
                        ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8]'
                        : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                    }`}
                  >
                    Year {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Semester Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#42684D] dark:text-[#BBC4A6]">Semester:</span>
              <div className="flex gap-1 p-1 bg-[#EAE7DA] dark:bg-[#142D22] rounded-md border border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
                {[1, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSemester(s)}
                    className={`px-3 py-1 rounded-sm text-xs font-semibold transition-colors cursor-pointer ${
                      selectedSemester === s
                        ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8]'
                        : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                    }`}
                  >
                    Sem {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs font-mono font-medium text-[#8A9C74]">
            {currentSlots.length} {currentSlots.length === 1 ? 'class slot' : 'class slots'} configured
          </div>
        </div>

        {/* Slots Table */}
        {currentSlots.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-lg bg-[#F3F1E8] dark:bg-[#142D22] border border-dashed border-[#BBC4A6] dark:border-[#BBC4A6]/25">
            <Calendar className="w-10 h-10 text-[#8A9C74] mx-auto mb-2" />
            <h4 className="font-editorial text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8]">
              No Routine Entries Configured
            </h4>
            <p className="text-xs text-[#42684D] dark:text-[#BBC4A6]/80 max-w-sm mx-auto mt-1 mb-3">
              Year {selectedYear} Semester {selectedSemester} has no timetable entries. Click "Schedule Parser" to paste a schedule or add slots manually.
            </p>
            <button
              type="button"
              onClick={() => {
                setAiTargetYear(selectedYear);
                setAiTargetSemester(selectedSemester);
                setIsAiModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#42684D] text-[#FAF9F4] hover:bg-[#19382B] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Launch Schedule Parser</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] font-semibold uppercase tracking-wider border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                <tr>
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Course</th>
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BBC4A6]/40 dark:divide-[#BBC4A6]/15">
                {currentSlots.map((slot, idx) => (
                  <tr key={slot.id || idx} className="hover:bg-[#EAE7DA]/50 dark:hover:bg-[#142D22]/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#42684D] dark:text-[#8A9C74] whitespace-nowrap">
                      {slot.day}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-[#987453] dark:text-[#BBC4A6] whitespace-nowrap">
                      {slot.time}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-semibold text-[#19382B] dark:text-[#F3F1E8]">{slot.courseCode}</div>
                      <div className="text-[#42684D] dark:text-[#BBC4A6]/80 font-medium truncate max-w-xs">{slot.courseTitle}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#19382B] dark:text-[#F3F1E8] whitespace-nowrap">
                      {slot.room}
                    </td>
                    <td className="py-2.5 px-3 text-[#42684D] dark:text-[#BBC4A6] truncate max-w-xs">
                      {slot.teacher}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(idx)}
                        className="p-1.5 rounded-sm text-[#8A9C74] hover:text-[#987453] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] transition-colors cursor-pointer"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SCHEDULE PARSER MODAL */}
      {isAiModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#19382B]/80 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 flex items-center justify-between bg-[#EAE7DA] dark:bg-[#142D22]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#42684D] text-[#FAF9F4] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                    Schedule Parser & Automation
                  </h3>
                  <p className="text-xs text-[#42684D] dark:text-[#BBC4A6]/80">
                    Paste raw timetable text, notice announcements, or syllabus lines to extract classes automatically.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAiModalOpen(false);
                  setParseResult(null);
                  setEditableSlots([]);
                }}
                className="p-1.5 rounded-md text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B] transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              
              {/* Target Academic Year & Semester */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#EAE7DA]/70 dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8]">Target Year:</span>
                  <select
                    value={aiTargetYear}
                    onChange={(e) => setAiTargetYear(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] text-xs font-semibold focus:outline-none focus:border-[#42684D]"
                  >
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>

                  <span className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8]">Semester:</span>
                  <select
                    value={aiTargetSemester}
                    onChange={(e) => setAiTargetSemester(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] text-xs font-semibold focus:outline-none focus:border-[#42684D]"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>

                {/* Multiple Format Sample Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#8A9C74]">Quick Test Samples:</span>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_SCHEDULE_TEXT)}
                    className="px-2 py-1 rounded-sm text-[11px] font-semibold text-[#19382B] dark:text-[#F3F1E8] bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 hover:border-[#42684D] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Official Notice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_WHATSAPP_NOTICE)}
                    className="px-2 py-1 rounded-sm text-[11px] font-semibold text-[#19382B] dark:text-[#F3F1E8] bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 hover:border-[#42684D] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>WhatsApp / Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_EXCEL_TABLE)}
                    className="px-2 py-1 rounded-sm text-[11px] font-semibold text-[#19382B] dark:text-[#F3F1E8] bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 hover:border-[#42684D] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Excel / Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_KEYVALUE_BLOCKS)}
                    className="px-2 py-1 rounded-sm text-[11px] font-semibold text-[#19382B] dark:text-[#F3F1E8] bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 hover:border-[#42684D] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Key-Value Block</span>
                  </button>
                </div>
              </div>

              {/* Raw Text Input with onPaste Auto-Generation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                    Paste Schedule Text (Any Format)
                  </label>
                  <span className="text-[11px] text-[#42684D] dark:text-[#8A9C74] font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>Auto-generates immediately when pasted</span>
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={rawInputText}
                  onChange={(e) => {
                    const text = e.target.value;
                    setRawInputText(text);
                    if (text.trim()) {
                      executeParsing(text);
                    } else {
                      setParseResult(null);
                      setEditableSlots([]);
                    }
                  }}
                  onPaste={handlePasteSchedule}
                  placeholder="Paste ANY class schedule here (WhatsApp notices, circulars, spreadsheet rows, syllabus listings, or key-value format). Classes are automatically parsed and generated instantly upon paste."
                  className="w-full p-3 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs font-mono focus:outline-none focus:border-[#42684D] transition-all"
                />
              </div>

              {/* Run Parser Action Bar */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#8A9C74]">
                  Universal Multi-Pass Parser • Automatically normalizes days, times, courses, and venues.
                </span>
                <button
                  type="button"
                  onClick={handleRunAiParser}
                  disabled={isParsing || !rawInputText.trim()}
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] disabled:opacity-50 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Auto-Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Re-Parse / Generate Entries</span>
                    </>
                  )}
                </button>
              </div>

              {/* Editable Verification Grid & JSON Viewer */}
              {editableSlots.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                      <h4 className="font-editorial text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                        Extracted Classes ({editableSlots.length})
                      </h4>
                      <div className="flex items-center gap-1 bg-[#EAE7DA] dark:bg-[#142D22] p-0.5 rounded-md border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                        <button
                          type="button"
                          onClick={() => setModalViewTab('boxes')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
                            modalViewTab === 'boxes'
                              ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8]'
                              : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                          }`}
                        >
                          Routine Boxes
                        </button>
                        <button
                          type="button"
                          onClick={() => setModalViewTab('json')}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-sm transition-colors cursor-pointer ${
                            modalViewTab === 'json'
                              ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8]'
                              : 'text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                          }`}
                        >
                          Structured JSON
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {modalViewTab === 'boxes' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setEditableSlots([
                              ...editableSlots,
                              {
                                id: `custom-slot-${Date.now()}`,
                                day: 'Sunday',
                                time: '09:00 - 10:30',
                                courseCode: `FES 0821${aiTargetYear}${aiTargetSemester}01`,
                                courseTitle: 'New Course',
                                room: 'Room 301',
                                teacher: 'Faculty Member',
                              },
                            ]);
                          }}
                          className="text-xs font-semibold text-[#42684D] dark:text-[#8A9C74] hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Extra Row</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (parseResult?.rawJsonString && navigator.clipboard?.writeText) {
                              navigator.clipboard.writeText(parseResult.rawJsonString)
                                .then(() => {
                                  setJsonCopied(true);
                                  const id = window.setTimeout(() => setJsonCopied(false), 2500);
                                  timersRef.current.push(id);
                                })
                                .catch(() => {});
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-sm bg-[#EAE7DA] text-[#19382B] dark:bg-[#142D22] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/25 hover:border-[#42684D] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{jsonCopied ? 'Copied JSON!' : 'Copy JSON'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tab 1: Routine Boxes / Table View */}
                  {modalViewTab === 'boxes' ? (
                    <div className="overflow-x-auto rounded-md border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 max-h-72">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] font-semibold uppercase sticky top-0 z-10 border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                          <tr>
                            <th className="py-2 px-2.5">Type & Flags</th>
                            <th className="py-2 px-2.5">Day</th>
                            <th className="py-2 px-2.5">Time</th>
                            <th className="py-2 px-2.5">Code</th>
                            <th className="py-2 px-2.5">Title</th>
                            <th className="py-2 px-2.5">Room</th>
                            <th className="py-2 px-2.5">Teacher</th>
                            <th className="py-2 px-2 text-center">Del</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#BBC4A6]/40 dark:divide-[#BBC4A6]/15">
                          {editableSlots.map((slot, sIdx) => (
                            <tr key={slot.id || sIdx} className="hover:bg-[#EAE7DA]/50 dark:hover:bg-[#142D22]/60">
                              <td className="p-1.5 whitespace-nowrap">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider border ${
                                    slot.type === 'viva' ? 'bg-[#19382B] text-[#F3F1E8] border-[#19382B]' :
                                    slot.type === 'quiz' ? 'bg-[#EAE7DA] dark:bg-[#142D22] text-[#987453] dark:text-[#BBC4A6] border-[#987453]/60' :
                                    slot.type === 'term_test' ? 'bg-[#987453] text-[#FAF9F4] border-[#987453]' :
                                    slot.type === 'presentation' ? 'bg-[#42684D] text-[#FAF9F4] border-[#42684D]' :
                                    slot.isLab ? 'bg-[#8A9C74]/20 text-[#19382B] dark:text-[#BBC4A6] border-[#8A9C74]/50' :
                                    'bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25'
                                  }`}>
                                    {slot.typeLabel || slot.type || 'Class'}
                                  </span>
                                  {slot.weekdayConflict && (
                                    <span className="text-[9px] font-semibold text-[#987453] flex items-center gap-0.5" title="Weekday mismatch flagged">
                                      <AlertCircle className="w-2.5 h-2.5" />
                                      <span>Date conflict</span>
                                    </span>
                                  )}
                                </div>
                              </td>
                            <td className="p-1.5">
                              <select
                                value={slot.day}
                                onChange={(e) => {
                                  const updated = [...editableSlots];
                                  updated[sIdx].day = e.target.value;
                                  setEditableSlots(updated);
                                }}
                                className="w-24 px-1.5 py-1 text-xs rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] font-semibold text-[#42684D] dark:text-[#8A9C74]"
                              >
                                {WEEKDAYS.map((d) => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={slot.time}
                                onChange={(e) => {
                                  const updated = [...editableSlots];
                                  updated[sIdx].time = e.target.value;
                                  setEditableSlots(updated);
                                }}
                                className="w-28 px-1.5 py-1 text-xs rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono font-medium"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={slot.courseCode}
                                onChange={(e) => {
                                  const updated = [...editableSlots];
                                  updated[sIdx].courseCode = e.target.value;
                                  setEditableSlots(updated);
                                }}
                                className="w-28 px-1.5 py-1 text-xs rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono font-semibold"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={slot.courseTitle}
                                onChange={(e) => {
                                  const updated = [...editableSlots];
                                  updated[sIdx].courseTitle = e.target.value;
                                  setEditableSlots(updated);
                                }}
                                className="w-44 px-1.5 py-1 text-xs rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-medium"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={slot.room}
                                onChange={(e) => {
                                  const updated = [...editableSlots];
                                  updated[sIdx].room = e.target.value;
                                  setEditableSlots(updated);
                                }}
                                className="w-28 px-1.5 py-1 text-xs rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                              />
                            </td>
                            <td className="p-1.5">
                              <input
                                type="text"
                                value={slot.teacher}
                                onChange={(e) => {
                                  const updated = [...editableSlots];
                                  updated[sIdx].teacher = e.target.value;
                                  setEditableSlots(updated);
                                }}
                                className="w-36 px-1.5 py-1 text-xs rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditableSlots(editableSlots.filter((_, i) => i !== sIdx));
                                }}
                                className="p-1 rounded-sm text-[#8A9C74] hover:text-[#987453] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  ) : (
                    /* Tab 2: Structured JSON Viewer */
                    <div className="space-y-2">
                      <div className="p-3 bg-[#142D22] text-[#F3F1E8] rounded-lg overflow-x-auto max-h-72 font-mono text-[11px] leading-relaxed border border-[#BBC4A6]/25">
                        <pre>{parseResult?.rawJsonString || 'No JSON generated'}</pre>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#8A9C74]">
                        <span>Schema compliant: <code>academic_context</code>, <code>timezone</code>, <code>events</code> array</span>
                        <span>{editableSlots.length} events parsed</span>
                      </div>
                    </div>
                  )}

                  {/* Commit Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                    <span className="text-xs text-[#42684D] dark:text-[#BBC4A6]">
                      Target: <strong>Year {aiTargetYear}, Semester {aiTargetSemester}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCommitParsedSlots('append')}
                        className="px-3.5 py-2 rounded-md text-xs font-semibold bg-[#EAE7DA] hover:bg-[#BBC4A6]/40 dark:bg-[#142D22] dark:hover:bg-[#42684D]/40 text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 cursor-pointer transition-colors"
                      >
                        Append to Existing
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCommitParsedSlots('replace')}
                        className="px-4 py-2 rounded-md text-xs font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Save & Replace Routine</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#EAE7DA] dark:bg-[#142D22] border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAiModalOpen(false);
                  setParseResult(null);
                  setEditableSlots([]);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-md bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] hover:border-[#42684D] cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
