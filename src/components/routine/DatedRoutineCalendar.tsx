import React, { useState, useMemo } from 'react';
import { RoutineSlot } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface DatedRoutineCalendarProps {
  schedule: RoutineSlot[];
  year: number;
  semester: number;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const WEEKDAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'] as const;
const WEEKDAYS_SHORT_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'] as const;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const DatedRoutineCalendar: React.FC<DatedRoutineCalendarProps> = ({
  schedule,
  year,
  semester,
}) => {
  const { t, lang } = useLanguage();
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  // Calendar Grid Calculation
  const calendarDays = useMemo(() => {
    const yearNum = currentDate.getFullYear();
    const monthNum = currentDate.getMonth();

    const firstDayOfMonth = new Date(yearNum, monthNum, 1);
    const lastDayOfMonth = new Date(yearNum, monthNum + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDays = lastDayOfMonth.getDate();

    // Days from previous month to fill the first row
    const prevMonthDays: { date: Date; isCurrentMonth: boolean }[] = [];
    if (startingDayOfWeek > 0) {
      const prevMonthLastDate = new Date(yearNum, monthNum, 0).getDate();
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        prevMonthDays.push({
          date: new Date(yearNum, monthNum - 1, prevMonthLastDate - i),
          isCurrentMonth: false,
        });
      }
    }

    // Days of current month
    const currentDays: { date: Date; isCurrentMonth: boolean }[] = [];
    for (let day = 1; day <= totalDays; day++) {
      currentDays.push({
        date: new Date(yearNum, monthNum, day),
        isCurrentMonth: true,
      });
    }

    // Days from next month to complete the grid (up to 35 or 42 cells)
    const combined = [...prevMonthDays, ...currentDays];
    const totalCells = Math.ceil(combined.length / 7) * 7;
    const nextMonthDays: { date: Date; isCurrentMonth: boolean }[] = [];
    const remaining = totalCells - combined.length;
    for (let day = 1; day <= remaining; day++) {
      nextMonthDays.push({
        date: new Date(yearNum, monthNum + 1, day),
        isCurrentMonth: false,
      });
    }

    return [...combined, ...nextMonthDays];
  }, [currentDate]);

  // Selected date weekday name
  const selectedDayName = WEEKDAYS[selectedDate.getDay()];

  // Format date helper: YYYY-MM-DD
  const formatDateISO = (d: Date) => {
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
  };

  // Filter slots for the selected date: prioritize exact date match, else recurring weekday slots
  const selectedDaySlots = useMemo(() => {
    const iso = formatDateISO(selectedDate);
    const dateSpecific = schedule.filter((s) => s.date && s.date === iso);
    if (dateSpecific.length > 0) return dateSpecific;

    // Recurring weekly slots for this weekday
    return schedule.filter((slot) => {
      if (slot.date) return slot.date === iso;
      return slot.day.toLowerCase() === selectedDayName.toLowerCase();
    });
  }, [schedule, selectedDate, selectedDayName]);

  // Helper to fetch slots for any calendar cell date
  const getSlotsForCellDate = useMemo(() => {
    return (d: Date) => {
      const iso = formatDateISO(d);
      const dayName = WEEKDAYS[d.getDay()].toLowerCase();

      const exact = schedule.filter((s) => s.date === iso);
      if (exact.length > 0) return exact;

      return schedule.filter((s) => {
        if (s.date) return s.date === iso;
        return s.day.toLowerCase() === dayName;
      });
    };
  }, [schedule]);

  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d: Date) => isSameDay(d, today);
  const isSelected = (d: Date) => isSameDay(d, selectedDate);

  // Parse time slot to determine real-time status (if selected date is today)
  const getSlotStatus = (timeStr: string) => {
    if (!isToday(selectedDate)) return null;

    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startPart, endPart] = timeStr.split(/\s*[-–—]\s*/);
      if (!startPart) return null;

      const parseTimeMinutes = (str: string, isEnd = false, startMins?: number) => {
        const cleaned = str.trim();
        const ampmMatch = cleaned.match(/[AaPp][Mm]/i);
        const modifier = ampmMatch ? ampmMatch[0].toLowerCase() : null;
        const timePart = cleaned.replace(/[AaPp][Mm]/i, '').trim();

        let [hours, mins] = timePart.split(':').map(Number);
        if (isNaN(hours)) return null;
        mins = isNaN(mins) ? 0 : mins;

        if (modifier === 'pm' && hours < 12) hours += 12;
        if (modifier === 'am' && hours === 12) hours = 0;

        if (!modifier) {
          // Standard university daytime inference (1-6 is PM: 13:00 to 18:00)
          if (hours >= 1 && hours <= 6) hours += 12;
          // Rollover check if end part is less than start part (e.g. 11:30 to 01:00)
          if (isEnd && startMins !== undefined && hours * 60 + mins < startMins && hours < 12) {
            hours += 12;
          }
        }
        return hours * 60 + mins;
      };

      const startMin = parseTimeMinutes(startPart);
      if (startMin === null) return null;

      const endMin = endPart ? parseTimeMinutes(endPart, true, startMin) : startMin + 90; // Default 90m if single time

      if (endMin === null) return null;

      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        return 'now';
      }
      if (currentMinutes < startMin) {
        return 'upcoming';
      }
      return 'past';
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Calendar Header Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-5 shadow-xs">
        
        {/* Month Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>{lang === 'bn' ? MONTH_NAMES_BN[currentDate.getMonth()] : MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                {lang === 'bn' ? `শিক্ষাবর্ষ ${year} · সেমিস্টার ${semester} সময়সূচী` : `Academic Year ${year} · Semester ${semester} Timetable`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-800 dark:hover:text-emerald-300 border border-stone-200 dark:border-stone-700 transition-colors cursor-pointer"
            >
              {t('today')}
            </button>
            <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-white dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-lg text-stone-600 dark:text-stone-400 hover:bg-white dark:hover:bg-stone-700 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Month Grid */}
        <div className="mt-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {WEEKDAYS.map((day, dIdx) => {
              const isWeekend = day === 'Friday' || day === 'Saturday';
              const label = lang === 'bn' ? WEEKDAYS_SHORT_BN[dIdx] : day.slice(0, 3);
              return (
                <div
                  key={day}
                  className={`py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider ${
                    isWeekend ? 'text-stone-400 dark:text-stone-500' : 'text-stone-600 dark:text-stone-300'
                  }`}
                >
                  <span>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((cell, idx) => {
              const cellWeekday = WEEKDAYS[cell.date.getDay()];
              const daySlots = getSlotsForCellDate(cell.date);
              const hasClasses = daySlots.length > 0;
              const cellIsToday = isToday(cell.date);
              const cellIsSelected = isSelected(cell.date);
              const isCurrentMonth = cell.isCurrentMonth;
              const isWeekend = cellWeekday === 'Friday' || cellWeekday === 'Saturday';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(cell.date)}
                  className={`min-h-[52px] sm:min-h-[64px] p-1.5 sm:p-2 rounded-xl flex flex-col justify-between items-center transition-all cursor-pointer border text-left relative ${
                    cellIsSelected
                      ? 'bg-emerald-800 text-white border-emerald-700 shadow-md ring-2 ring-emerald-500/40 z-10 scale-[1.02]'
                      : cellIsToday
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 border-emerald-400 dark:border-emerald-700 font-bold'
                      : !isCurrentMonth
                      ? 'bg-stone-50/40 dark:bg-stone-900/40 text-stone-300 dark:text-stone-600 border-transparent hover:border-stone-200 dark:hover:border-stone-800'
                      : isWeekend
                      ? 'bg-stone-50/80 dark:bg-stone-800/40 text-stone-500 dark:text-stone-400 border-stone-200/50 dark:border-stone-800/60 hover:border-emerald-300'
                      : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-stone-200/80 dark:border-stone-800 hover:border-emerald-400 hover:bg-emerald-50/30'
                  }`}
                >
                  {/* Date Number & Today Indicator */}
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-semibold rounded-md px-1 ${
                        cellIsSelected
                          ? 'text-white'
                          : cellIsToday
                          ? 'bg-emerald-600 text-white font-bold'
                          : isCurrentMonth
                          ? 'text-stone-800 dark:text-stone-200'
                          : 'text-stone-400'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>

                    {/* Class count pill / indicator */}
                    {hasClasses && isCurrentMonth && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-mono font-bold px-1 rounded-sm ${
                          cellIsSelected
                            ? 'bg-white/20 text-white'
                            : cellIsToday
                            ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        {daySlots.length}
                      </span>
                    )}
                  </div>

                  {/* Dot status bar on bottom */}
                  <div className="w-full flex justify-center gap-0.5 mt-1">
                    {hasClasses && isCurrentMonth ? (
                      <div className="flex gap-0.5">
                        {daySlots.slice(0, 3).map((_, i) => (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              cellIsSelected
                                ? 'bg-white'
                                : 'bg-emerald-600 dark:bg-emerald-400'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="h-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Selected Day Schedule Deck */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-5 shadow-xs space-y-4">
        
        {/* Selected Day Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                {t('selectedDaySchedule')}
              </span>
              {isToday(selectedDate) && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  {t('today')}
                </span>
              )}
            </div>
            <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {lang === 'bn' ? WEEKDAYS_BN[selectedDate.getDay()] : selectedDayName}, {lang === 'bn' ? MONTH_NAMES_BN[selectedDate.getMonth()] : MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
            </h4>
          </div>

          <div className="text-xs font-mono font-medium text-stone-500 dark:text-stone-400">
            {selectedDaySlots.length} {t('classesScheduled')}
          </div>
        </div>

        {/* Schedule Slots or Off-Day Empty State */}
        {selectedDaySlots.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-dashed border-stone-200 dark:border-stone-800">
            <CheckCircle2 className="w-9 h-9 text-emerald-600/70 mx-auto mb-2" />
            <h5 className="text-sm font-bold text-stone-800 dark:text-stone-200">
              {t('noClassesScheduled')} ({lang === 'bn' ? WEEKDAYS_BN[selectedDate.getDay()] : selectedDayName})
            </h5>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1">
              {t('noClassesScheduledDesc')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {selectedDaySlots.map((slot, idx) => {
              const status = getSlotStatus(slot.time);

              return (
                <div
                  key={slot.id || idx}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    status === 'now'
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-stone-50/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800/80 shadow-2xs'
                  }`}
                >
                  <div>
                    {/* Time & Live Status */}
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1.5">
                      <span className="font-mono font-bold flex items-center gap-1.5 text-stone-800 dark:text-stone-200">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{slot.time}</span>
                      </span>

                      {status === 'now' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                          {t('happeningNow')}
                        </span>
                      )}
                      {status === 'upcoming' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                          {t('upcomingToday')}
                        </span>
                      )}
                      {status === 'past' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300">
                          {t('completed')}
                        </span>
                      )}
                    </div>

                    {/* Course Code, Type Badge & Title */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400">
                        {slot.courseCode}
                      </span>
                      {slot.type && slot.type !== 'class' && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          slot.type === 'viva' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                          slot.type === 'quiz' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          slot.type === 'term_test' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          slot.type === 'presentation' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' :
                          slot.type === 'assignment' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300' :
                          slot.type === 'final_exam' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                          'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                        }`}>
                          {slot.typeLabel || slot.type}
                        </span>
                      )}
                      {slot.isLab && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                          Lab / Field
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug mb-2">
                      {slot.courseTitle}
                    </h5>

                    {/* Warnings (if any) */}
                    {slot.warnings && slot.warnings.length > 0 && (
                      <div className="mb-2 space-y-0.5">
                        {slot.warnings.map((w, wIdx) => (
                          <div key={wIdx} className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Room & Teacher Metadata */}
                  <div className="pt-2.5 border-t border-stone-200/80 dark:border-stone-700/80 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
                      <span className="font-medium truncate">{slot.room}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500 shrink-0" />
                      <span className="font-medium truncate">{slot.teacher}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
