# Implementation Plan: Dated Interactive Calendar & AI Class Schedule Parser Automation

Integrate an interactive dated calendar into the FES SUST Class Routine view and build an AI-powered schedule extraction & management panel inside the Admin Console, allowing instant parsing of pasted timetable announcements into structured class records.

---

## 1. User Decisions & Architectural Objectives

Based on your confirmed preferences:
- **Interactive Dated Calendar**: Embed an interactive monthly and weekly calendar in `/notices` (Routine tab) with real-world dates, semester day highlights, and class cards for the selected day.
- **AI Schedule Parser**: Provide an intelligent extraction tool in `/manage` using `@google/genai` (`gemini-3.8-flash`) that accepts unstructured text (notice texts, messy syllabus fragments, informal messages, or tabular pastes) and extracts structured timetable slots.
- **Editable Verification Grid**: Render parsed classes in an editable preview table allowing admins to fine-tune room numbers, teachers, and timings before committing to the routine database.

---

## 2. Technical Design & Component Breakdown

### A. Data Layer & Storage Utilities (`src/utils/storage.ts`)
- Add `STORAGE_KEY_ROUTINES = 'sust_fes_routines_v1'` to `src/utils/storage.ts`.
- Implement `getStoredRoutines(): Promise<RoutineItem[]>`:
  - Merges official `public/data/routine.json` baseline with user-saved localStorage modifications.
- Implement `saveStoredRoutines(routines: RoutineItem[]): void`:
  - Dispatches `window.dispatchEvent(new Event('sust_fes_data_updated'))` so all views immediately reflect routine updates.
- Implement `resetStoredRoutines(): Promise<RoutineItem[]>` to restore default departmental timetable.

### B. AI Schedule Parser Engine (`src/utils/aiScheduleParser.ts`)
- Use `@google/genai` with model `gemini-3.8-flash`.
- Define strict structured JSON schema for extraction:
  - `year`: Academic year (1, 2, 3, 4)
  - `semester`: Academic semester (1 or 2)
  - `schedule`: Array of slots:
    - `day`: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
    - `time`: Formatted string (e.g. "09:00 - 10:30")
    - `courseCode`: Standardized code (e.g. "FES 08211121" or matched curriculum code)
    - `courseTitle`: Official course title
    - `room`: Academic building/room name
    - `teacher`: Instructor name or department
- Implement dual-engine reliability:
  - Primary: Gemini 3.8 Flash structured output.
  - Fallback: Deterministic regex and line-by-line parser for offline/unauthenticated execution or standard table copies.

### C. Dated Routine Calendar (`src/components/routine/DatedRoutineCalendar.tsx`)
- Month Grid & Weekly Strip:
  - Month navigation (Previous / Next / Today jump).
  - Highlights days of the week where classes exist for the selected Year & Semester.
  - Visual badges showing class count per day.
  - Click any date to view the scheduled classes for that specific weekday with room, timing, and instructor tags.
- Quick Jump to "Today's Classes":
  - Highlights classes running today with real-time "Happening Now" / "Upcoming" status indicators.

### D. Enhanced Routine Explorer (`src/components/NoticesView.tsx`)
- Add view switchers inside the Routine tab:
  - **Weekly Timetable Matrix** (traditional slot cards grouped by day).
  - **Dated Calendar Explorer** (monthly & weekly calendar with date pickers).
- Display active filters for Academic Year (1st–4th Year) and Semester (1 or 2).

### E. Admin Routine & AI Automation Panel (`src/components/admin/AdminRoutinePanel.tsx`)
- Add a new "Class Routine" tab to `AdminView.tsx`:
  - View current routine slots per year/semester with delete and edit controls.
  - **"AI Schedule Parser" Modal / Workspace**:
    - Large text area with prompt placeholder ("Paste official notice, chat message, or schedule table...").
    - Target Year and Semester selectors.
    - "Extract with Gemini AI" action button with loading states.
    - Sample test schedule snippets for quick demonstration.
    - Editable preview table where admins can inspect, edit, delete, or add slots before saving.
    - "Commit to Database" button that updates local storage and refreshes app state.

---

## 3. Implementation Steps & Verification Status

1. **Storage & Types** [COMPLETED]:
   - Unified `RoutineSlot`, `YearRoutine`, and `RoutineItem` in `src/types/index.ts`.
   - Added routine storage keys, `getStoredRoutines()`, `saveStoredRoutines()`, and `resetStoredRoutines()` in `src/utils/storage.ts`.
2. **AI Schedule Parser** [COMPLETED]:
   - Created `src/utils/aiScheduleParser.ts` with structured `@google/genai` (`gemini-3.8-flash`) extraction and deterministic fallback regex heuristics.
3. **Dated Calendar Component** [COMPLETED]:
   - Created `src/components/routine/DatedRoutineCalendar.tsx` with interactive month grid, weekly bar, day slot highlights, today jump, and real-time class status indicators ("Happening Now", "Upcoming", "Completed").
4. **Notices View Integration** [COMPLETED]:
   - Integrated `DatedRoutineCalendar` in `src/components/NoticesView.tsx` with responsive dual-mode switcher ("Dated Calendar" and "Weekly Grid").
5. **Admin Routine Panel & Automation** [COMPLETED]:
   - Created `src/components/admin/AdminRoutinePanel.tsx` with AI parser modal, editable verification table, sample presets, and single-click commit.
   - Integrated into `src/components/AdminView.tsx` under a new "Class Routine" tab featuring an "AI" badge.
6. **Universal Multi-Format Parser & Auto-Generation on Paste** [COMPLETED]:
   - Completely resolved parser failure by replacing rigid regex and unauthenticated client instantiation with the **Universal Multi-Pass Schedule Engine**.
   - Added instant auto-generation on paste (`onPaste` event) and real-time reactive debounce so entries populate immediately as soon as text is pasted into the textarea.
   - Handled ALL formats: tab-separated spreadsheet tables, WhatsApp/Messenger informal notices, pipe/comma-delimited tables, key-value blocks, multi-day phrases (`Sunday & Tuesday`), and single start times.
   - Integrated full departmental curriculum auto-enrichment (`SUST_FES_COURSES`) and faculty matching (`SUST_FES_FACULTY`).
   - Added automated Year and Semester detection (`detectYearAndSemester`).
   - Expanded unit test suite to 11/11 passing tests (`scripts/test-routine-parser.mjs`).
   - Production bundle compiled (`vite build`), lint clean (`tsc --noEmit`), and dev server responding with HTTP 200.
