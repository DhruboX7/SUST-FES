import React, { useState, useEffect } from 'react';
import { YearRoutine, RoutineSlot, AcademicYear } from '../../types';
import { getStoredRoutines, saveStoredRoutines, resetStoredRoutines } from '../../utils/storage';
import { parseScheduleWithAI, ParseScheduleResult } from '../../utils/aiScheduleParser';
import { 
  Calendar, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  RotateCcw, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Copy,
  Loader2,
  Table
} from 'lucide-react';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SAMPLE_SCHEDULE_TEXT = `SUST Dept of Forestry and Environmental Science
Weekly Class Schedule (Session 2024-2025)
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

  // Feedback message
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getStoredRoutines();
      setRoutines(data);
    } catch (err) {
      console.error('Failed to load routines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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

  // Reset to factory defaults
  const handleResetToDefaults = async () => {
    if (window.confirm('Reset all class routines to the official departmental defaults? Any custom added routines will be reset.')) {
      const def = await resetStoredRoutines();
      setRoutines(def);
      showStatus('Reset class routines to official defaults.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Status Feedback Toast */}
      {statusMessage && (
        <div
          role="status"
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-sm animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 text-red-900 border-red-300 dark:bg-red-950/80 dark:text-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Hero Action Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 rounded-2xl p-5 sm:p-6 text-white border border-emerald-900/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Class Routine & Timetable Manager</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Weekly Schedule & AI Automation
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            Manage semester timetable slots, paste announcements for automated AI extraction, or review classes by year and semester.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Schedule Parser Trigger Button */}
          <button
            type="button"
            onClick={() => {
              setAiTargetYear(selectedYear);
              setAiTargetSemester(selectedSemester);
              setIsAiModalOpen(true);
            }}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-md shadow-emerald-950/30 flex items-center gap-2 transition-all cursor-pointer scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>AI Schedule Parser</span>
          </button>

          <button
            type="button"
            onClick={() => setShowManualForm((prev) => !prev)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showManualForm ? 'Close Form' : 'Add Slot'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefaults}
            title="Reset to factory routine"
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manual Slot Form */}
      {showManualForm && (
        <form onSubmit={handleAddManualSlot} className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Add Single Class Slot (Year {selectedYear}, Sem {selectedSemester})</span>
            </h4>
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Weekday</label>
              <select
                value={manualSlot.day}
                onChange={(e) => setManualSlot({ ...manualSlot, day: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-semibold"
              >
                {WEEKDAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Time Slot</label>
              <input
                type="text"
                value={manualSlot.time}
                onChange={(e) => setManualSlot({ ...manualSlot, time: e.target.value })}
                placeholder="e.g. 09:00 - 10:30"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Course Code</label>
              <input
                type="text"
                value={manualSlot.courseCode}
                onChange={(e) => setManualSlot({ ...manualSlot, courseCode: e.target.value })}
                placeholder="e.g. FES 08211121"
                required
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-mono font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Course Title</label>
              <input
                type="text"
                value={manualSlot.courseTitle}
                onChange={(e) => setManualSlot({ ...manualSlot, courseTitle: e.target.value })}
                placeholder="e.g. Introduction to Forestry"
                required
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Room / Venue</label>
              <input
                type="text"
                value={manualSlot.room}
                onChange={(e) => setManualSlot({ ...manualSlot, room: e.target.value })}
                placeholder="e.g. Room 301, Academic Building E"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">Assigned Teacher / Instructor</label>
              <input
                type="text"
                value={manualSlot.teacher}
                onChange={(e) => setManualSlot({ ...manualSlot, teacher: e.target.value })}
                placeholder="e.g. Prof. Dr. A. Z. M. Manzoor Rashid"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-800 dark:text-stone-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowManualForm(false)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-700 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Class Slot</span>
            </button>
          </div>
        </form>
      )}

      {/* Routine Viewer Table */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
        
        {/* Year and Semester Segmented Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Year:</span>
              <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl">
                {[1, 2, 3, 4].map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setSelectedYear(y)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedYear === y
                        ? 'bg-linear-to-r from-emerald-800 to-emerald-700 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    Year {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Semester Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-600 dark:text-stone-400">Semester:</span>
              <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-xl">
                {[1, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSemester(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedSemester === s
                        ? 'bg-linear-to-r from-emerald-800 to-emerald-700 text-white shadow-xs'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    Sem {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400">
            {currentSlots.length} {currentSlots.length === 1 ? 'class slot' : 'class slots'} configured
          </div>
        </div>

        {/* Slots Table */}
        {currentSlots.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-800">
            <Calendar className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              No Routine Entries Configured
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mt-1 mb-3">
              Year {selectedYear} Semester {selectedSemester} has no timetable entries. Click "AI Schedule Parser" to paste a schedule or add slots manually.
            </p>
            <button
              type="button"
              onClick={() => {
                setAiTargetYear(selectedYear);
                setAiTargetSemester(selectedSemester);
                setIsAiModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-700 shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch AI Schedule Parser</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 font-bold uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Course</th>
                  <th className="py-2.5 px-3">Room</th>
                  <th className="py-2.5 px-3">Teacher</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {currentSlots.map((slot, idx) => (
                  <tr key={slot.id || idx} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-emerald-800 dark:text-emerald-400 whitespace-nowrap">
                      {slot.day}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-stone-700 dark:text-stone-300 whitespace-nowrap">
                      {slot.time}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-mono font-bold text-stone-900 dark:text-stone-100">{slot.courseCode}</div>
                      <div className="text-stone-500 dark:text-stone-400 font-medium truncate max-w-xs">{slot.courseTitle}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-stone-700 dark:text-stone-300 whitespace-nowrap">
                      {slot.room}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 dark:text-stone-400 truncate max-w-xs">
                      {slot.teacher}
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(idx)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
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

      {/* AI SCHEDULE PARSER MODAL */}
      {isAiModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                    AI Schedule Parser & Automation
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
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
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              
              {/* Target Academic Year & Semester */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Target Year:</span>
                  <select
                    value={aiTargetYear}
                    onChange={(e) => setAiTargetYear(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs font-bold"
                  >
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>

                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Semester:</span>
                  <select
                    value={aiTargetSemester}
                    onChange={(e) => setAiTargetSemester(Number(e.target.value))}
                    className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-xs font-bold"
                  >
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </select>
                </div>

                {/* Multiple Format Sample Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">Quick Test Samples:</span>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_SCHEDULE_TEXT)}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Official Notice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_WHATSAPP_NOTICE)}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>WhatsApp / Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_EXCEL_TABLE)}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Excel / Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(SAMPLE_KEYVALUE_BLOCKS)}
                    className="px-2 py-1 rounded-lg text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>Key-Value Block</span>
                  </button>
                </div>
              </div>

              {/* Raw Text Input with onPaste Auto-Generation */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                    Paste Schedule Text (Any Format)
                  </label>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-generates immediately when pasted!</span>
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
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Run Parser Action Bar */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-stone-500 dark:text-stone-400">
                  Universal Multi-Pass Parser • Automatically normalizes days, times, courses, and venues.
                </span>
                <button
                  type="button"
                  onClick={handleRunAiParser}
                  disabled={isParsing || !rawInputText.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white disabled:opacity-50 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {isParsing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Auto-Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>Re-Parse / Generate Entries</span>
                    </>
                  )}
                </button>
              </div>

              {/* Editable Verification Grid */}
              {editableSlots.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                        Extracted Classes ({editableSlots.length}) — Review & Edit
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {parseResult?.source === 'gemini' ? 'Gemini 3.8 Flash' : 'Pattern Heuristics'}
                      </span>
                    </div>

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
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Extra Row</span>
                    </button>
                  </div>

                  {/* Inline Editable Table */}
                  <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-stone-700 max-h-72">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold uppercase sticky top-0 z-10 border-b border-stone-200 dark:border-stone-700">
                        <tr>
                          <th className="py-2 px-2.5">Day</th>
                          <th className="py-2 px-2.5">Time</th>
                          <th className="py-2 px-2.5">Code</th>
                          <th className="py-2 px-2.5">Title</th>
                          <th className="py-2 px-2.5">Room</th>
                          <th className="py-2 px-2.5">Teacher</th>
                          <th className="py-2 px-2 text-center">Del</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {editableSlots.map((slot, sIdx) => (
                          <tr key={slot.id || sIdx} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                            <td className="p-1.5">
                              <select
                                value={slot.day}
                                onChange={(e) => {
                                  const updated = [...editableSlots];
                                  updated[sIdx].day = e.target.value;
                                  setEditableSlots(updated);
                                }}
                                className="w-24 px-1.5 py-1 text-xs rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-bold text-emerald-800 dark:text-emerald-400"
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
                                className="w-28 px-1.5 py-1 text-xs rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono font-medium"
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
                                className="w-28 px-1.5 py-1 text-xs rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono font-bold"
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
                                className="w-44 px-1.5 py-1 text-xs rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 font-medium"
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
                                className="w-28 px-1.5 py-1 text-xs rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
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
                                className="w-36 px-1.5 py-1 text-xs rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900"
                              />
                            </td>
                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditableSlots(editableSlots.filter((_, i) => i !== sIdx));
                                }}
                                className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Commit Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                    <span className="text-xs text-stone-500">
                      Target: <strong>Year {aiTargetYear}, Semester {aiTargetSemester}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCommitParsedSlots('append')}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 cursor-pointer"
                      >
                        Append to Existing
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCommitParsedSlots('replace')}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Save & Replace Routine</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-stone-100 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsAiModalOpen(false);
                  setParseResult(null);
                  setEditableSlots([]);
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
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
