import React, { useState, useEffect, useRef, useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { useLanguage } from '../contexts/LanguageContext';
import { SUST_FES_COURSES, SUST_FES_FACULTY } from '../data/coursesData';
import {
  COVER_DESIGNS,
  CoverDesignId,
  CoverFormData,
  CoverType,
} from '../types/cover';
import { CoverSheetPreview } from './cover/CoverSheetPreview';
import { exportCoverAsPdf, exportCoverAsPng } from '../utils/coverRenderer';
import {
  FileBadge,
  Download,
  Image as ImageIcon,
  Printer,
  RotateCcw,
  BookmarkCheck,
  BookOpen,
  UserCheck,
  GraduationCap,
  Sliders,
  Eye,
  Edit3,
  Check,
  Loader2,
  FileText,
  UserPlus,
  X,
} from 'lucide-react';

const PROFILE_STORAGE_KEY = 'sust_fes_cover_student_profile_v1';
const DRAFT_STORAGE_KEY = 'sust_fes_cover_draft_v2';

const todayIso = () => new Date().toISOString().slice(0, 10);

const SAMPLE_COVER_DATA: CoverFormData = {
  designId: 'forestry-botanical',
  coverType: 'Lab Report',
  universityName: 'Shahjalal University of Science and Technology, Sylhet',
  department: 'Forestry and Environmental Science',
  courseCode: 'FES 08211124',
  courseTitle: 'Introduction to Forestry Laboratory',
  topicTitle: 'Canopy Stratification & Campus Woody Flora Survey',
  topicDate: todayIso(),
  submissionDate: todayIso(),
  experimentNo: '01',
  experimentName: 'Identification and Taxonomic Documentation of Major Tree Species on SUST Campus',
  experimentDate: todayIso(),
  reportSubmissionDate: todayIso(),
  teacherName: 'Dr. Mohammad Redowan',
  teacherDesignation: 'Professor & Head',
  teacherDepartment: 'Forestry and Environmental Science',
  teacherUniversity: 'Shahjalal University of Science and Technology, Sylhet',
  hasSecondTeacher: false,
  teacher2Name: '',
  teacher2Designation: '',
  teacher2Department: 'Forestry and Environmental Science',
  teacher2University: 'Shahjalal University of Science and Technology, Sylhet',
  studentName: 'Tanvir Ahmed Chowdhury',
  registrationNo: '2025631001',
  batch: '',
  group: 'Group A',
  semester: '1st Year 1st Semester',
  session: '2025-26',
  studentDepartment: '',
  showLogo: true,
  monochromePrint: false,
};

const COVER_TYPES: CoverType[] = ['Lab Report', 'Assignment', 'Field Report', 'Term Paper'];

const SEMESTER_PRESETS = [
  '1st Year 1st Semester',
  '1st Year 2nd Semester',
  '2nd Year 1st Semester',
  '2nd Year 2nd Semester',
  '3rd Year 1st Semester',
  '3rd Year 2nd Semester',
  '4th Year 1st Semester',
  '4th Year 2nd Semester',
  'M.Sc. 1st Semester',
  'M.Sc. 2nd Semester',
];

export const CoverpageGeneratorView: React.FC = () => {
  const { lang } = useLanguage();
  usePageMeta({
    title: 'Print-Ready A4 Coverpage Generator',
    description:
      'Generate crisp, print-ready A4 cover pages for SUST FES lab reports, assignments, field reports, and term papers with instant PDF and PNG export.',
  });

  const [formData, setFormData] = useState<CoverFormData>(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === 'object') {
          return { ...SAMPLE_COVER_DATA, ...parsed };
        }
      }
      const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (savedProfile) {
        const prof = JSON.parse(savedProfile);
        if (prof && typeof prof === 'object') {
          return { ...SAMPLE_COVER_DATA, ...prof };
        }
      }
    } catch {
      // ignore storage errors
    }
    return SAMPLE_COVER_DATA;
  });

  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [zoomMode, setZoomMode] = useState<'fit' | '75' | '100'>('fit');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const stageWrapRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState<number>(560);

  // Auto-persist working draft
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore storage errors
    }
  }, [formData]);

  // Measure live preview stage container width cleanly across mobile/desktop resizes
  useEffect(() => {
    const el = stageWrapRef.current;
    if (!el) return;

    const measure = () => {
      const available = Math.max(260, el.clientWidth - 16);
      setStageWidth(available);
    };
    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(measure);
      observer.observe(el);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [mobileTab]);

  const previewScale = useMemo(() => {
    if (zoomMode === '100') return 1;
    if (zoomMode === '75') return 0.75;
    return Math.min(1, stageWidth / 794);
  }, [zoomMode, stageWidth]);

  const notifyStatus = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => {
      setStatusFeedback((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const updateField = <K extends keyof CoverFormData>(key: K, value: CoverFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectCoursePreset = (code: string) => {
    if (!code) return;
    const match = SUST_FES_COURSES.find((c) => c.code === code);
    if (!match) return;
    const semLabel =
      match.year === 'msc'
        ? `M.Sc. ${match.semester === 2 ? '2nd' : '1st'} Semester`
        : `${match.year === 1 ? '1st' : match.year === 2 ? '2nd' : match.year === 3 ? '3rd' : '4th'} Year ${
            match.semester === 2 ? '2nd' : '1st'
          } Semester`;

    setFormData((prev) => ({
      ...prev,
      courseCode: match.code,
      courseTitle: match.title,
      coverType:
        match.courseType === 'Sessional' || match.courseType === 'Fieldwork'
          ? 'Lab Report'
          : prev.coverType,
      semester: semLabel,
    }));
  };

  const handleSelectFacultyPreset = (facId: string) => {
    if (!facId) return;
    const match = SUST_FES_FACULTY.find((f) => f.id === facId);
    if (!match) return;
    setFormData((prev) => ({
      ...prev,
      teacherName: match.name,
      teacherDesignation: match.isHead ? `${match.designation} & Head` : match.designation,
      teacherDepartment: 'Forestry and Environmental Science',
    }));
  };

  const handleSelectSecondFacultyPreset = (facId: string) => {
    if (!facId) return;
    const match = SUST_FES_FACULTY.find((f) => f.id === facId);
    if (!match) return;
    setFormData((prev) => ({
      ...prev,
      hasSecondTeacher: true,
      teacher2Name: match.name,
      teacher2Designation: match.isHead ? `${match.designation} & Head` : match.designation,
      teacher2Department: 'Forestry and Environmental Science',
      teacher2University:
        prev.teacher2University ||
        prev.teacherUniversity ||
        'Shahjalal University of Science and Technology, Sylhet',
    }));
  };

  const handleToggleSecondTeacher = () => {
    setFormData((prev) => {
      const next = !prev.hasSecondTeacher;
      return {
        ...prev,
        hasSecondTeacher: next,
        teacher2Department:
          prev.teacher2Department || prev.teacherDepartment || 'Forestry and Environmental Science',
        teacher2University:
          prev.teacher2University ||
          prev.teacherUniversity ||
          'Shahjalal University of Science and Technology, Sylhet',
      };
    });
  };

  const handleSaveProfile = () => {
    try {
      const profile = {
        studentName: formData.studentName,
        registrationNo: formData.registrationNo,
        group: formData.group,
        semester: formData.semester,
        session: formData.session,
        universityName: formData.universityName,
        department: formData.department,
      };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      notifyStatus('Student profile saved for future covers!');
    } catch {
      notifyStatus('Could not save profile in browser storage.');
    }
  };

  const handleClearToBlank = () => {
    setFormData((prev) => ({
      ...prev,
      courseCode: '',
      courseTitle: '',
      topicTitle: '',
      experimentNo: '01',
      experimentName: '',
      teacherName: '',
      teacherDesignation: '',
      hasSecondTeacher: false,
      teacher2Name: '',
      teacher2Designation: '',
    }));
    notifyStatus('Course & topic fields cleared.');
  };

  const handleLoadSample = () => {
    setFormData(SAMPLE_COVER_DATA);
    notifyStatus('Loaded FES SUST sample cover!');
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportCoverAsPdf(formData);
      notifyStatus('A4 PDF downloaded cleanly!');
    } catch (err) {
      console.error('PDF export failed:', err);
      notifyStatus('PDF export failed. Try Print A4 instead.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportPng = async () => {
    setIsExportingPng(true);
    try {
      await exportCoverAsPng(formData);
      notifyStatus('High-resolution PNG downloaded!');
    } catch (err) {
      console.error('PNG export failed:', err);
      notifyStatus('PNG export failed.');
    } finally {
      setIsExportingPng(false);
    }
  };

  const handlePrintA4 = () => {
    window.print();
  };

  const groupedCourses = useMemo(() => {
    const groups: Record<string, typeof SUST_FES_COURSES> = {};
    SUST_FES_COURSES.forEach((course) => {
      const yrLabel = course.year === 'msc' ? 'M.Sc. Courses' : `Year ${course.year} · Sem ${course.semester}`;
      if (!groups[yrLabel]) groups[yrLabel] = [];
      groups[yrLabel].push(course);
    });
    return groups;
  }, []);

  const inputCls =
    'w-full px-3 min-h-[42px] text-xs sm:text-sm rounded-lg bg-[#F3F1E8] dark:bg-[#11261D] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] placeholder:text-[#8A9C74] focus:outline-hidden focus:ring-2 focus:ring-[#42684D] transition-colors';
  const labelCls =
    'block text-[11px] font-semibold uppercase tracking-wider text-[#42684D] dark:text-[#BBC4A6] mb-1';

  return (
    <>
      <div className="no-print space-y-5 animate-fade-in">
        {/* Studio Header Banner */}
        <section className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl sm:rounded-lg border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-4 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#987453] dark:text-[#BBC4A6]">
                <FileBadge className="w-3.5 h-3.5" />
                <span>SUST FES Student Studio · A4 (210 × 297 mm)</span>
              </div>
              <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                {lang === 'bn' ? 'এ৪ কভারপেজ জেনারেটর' : 'Academic Coverpage Generator'}
              </h1>
              <p className="text-xs sm:text-sm text-[#42684D] dark:text-[#BBC4A6] max-w-2xl">
                {lang === 'bn'
                  ? 'ল্যাব রিপোর্ট, অ্যাসাইনমেন্ট ও ফিল্ড রিপোর্টের জন্য শাবিপ্রবি ফরেস্ট্রি বিভাগের প্রিন্ট-রেডি A4 কভারপেজ তৈরি করুন এবং সরাসরি PDF বা PNG হিসেবে ডাউনলোড করুন।'
                  : 'Build print-ready A4 cover pages for SUST FES lab reports, assignments, field reports, and term papers with instant course & faculty autofill and one-click PDF export.'}
              </p>
            </div>

            {/* Primary Export Action Cluster */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] rounded-lg text-xs font-semibold bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] dark:hover:text-[#11261D] text-[#F3F1E8] border border-[#19382B] dark:border-[#BBC4A6]/35 transition-colors cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isExportingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <Download className="w-4 h-4 shrink-0" />
                )}
                <span>Download A4 PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportPng}
                disabled={isExportingPng}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] rounded-lg text-xs font-semibold bg-[#EAE7DA] dark:bg-[#142D22] hover:bg-[#BBC4A6]/40 text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6] dark:border-[#BBC4A6]/30 transition-colors cursor-pointer active:scale-95 disabled:opacity-60"
              >
                {isExportingPng ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74] shrink-0" />
                )}
                <span>PNG</span>
              </button>

              <button
                type="button"
                onClick={handlePrintA4}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] rounded-lg text-xs font-semibold bg-[#EAE7DA] dark:bg-[#142D22] hover:bg-[#BBC4A6]/40 text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6] dark:border-[#BBC4A6]/30 transition-colors cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 text-[#987453] shrink-0" />
                <span>Print A4</span>
              </button>
            </div>
          </div>

          {statusFeedback && (
            <div
              role="status"
              className="mt-3 px-3 py-2 rounded-lg bg-[#EAE7DA] dark:bg-[#142D22] border border-[#42684D]/50 text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] inline-flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
              <span>{statusFeedback}</span>
            </div>
          )}
        </section>

        {/* Mobile Mode Switcher (Edit Form vs Live A4 Sheet) */}
        <div className="lg:hidden grid grid-cols-2 gap-2 p-1.5 rounded-xl bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20">
          <button
            type="button"
            onClick={() => setMobileTab('edit')}
            className={`flex items-center justify-center gap-2 min-h-[44px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mobileTab === 'edit'
                ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] shadow-xs'
                : 'text-[#42684D] dark:text-[#BBC4A6]'
            }`}
          >
            <Edit3 className="w-4 h-4 shrink-0" />
            <span>Edit Cover Details</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex items-center justify-center gap-2 min-h-[44px] rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              mobileTab === 'preview'
                ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] shadow-xs'
                : 'text-[#42684D] dark:text-[#BBC4A6]'
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span>Live A4 Preview</span>
          </button>
        </div>

        {/* Main Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Configuration & Input Form */}
          <div
            className={`lg:col-span-5 space-y-4 ${
              mobileTab === 'edit' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* 1. Template Design Picker */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>1. Choose Cover Template ({COVER_DESIGNS.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                {COVER_DESIGNS.map((design) => {
                  const selected = formData.designId === design.id;
                  return (
                    <button
                      key={design.id}
                      type="button"
                      onClick={() => updateField('designId', design.id as CoverDesignId)}
                      className={`text-left p-2.5 rounded-lg border transition-colors cursor-pointer active:scale-[0.99] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#42684D] ${
                        selected
                          ? 'bg-[#19382B] dark:bg-[#42684D] border-[#19382B] dark:border-[#BBC4A6] text-[#F3F1E8]'
                          : 'bg-[#F3F1E8] dark:bg-[#142D22] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 text-[#19382B] dark:text-[#F3F1E8] hover:border-[#42684D]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center"
                            style={{
                              backgroundColor: design.swatchPaper,
                              borderColor: design.swatchPrimary,
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-xs"
                              style={{ backgroundColor: design.swatchPrimary }}
                            />
                          </span>
                          <span className="text-xs font-semibold truncate">{design.title}</span>
                        </div>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-xs shrink-0 ${
                            selected
                              ? 'bg-[#F3F1E8]/15 text-[#BBC4A6]'
                              : 'bg-[#EAE7DA] dark:bg-[#19382B] text-[#42684D] dark:text-[#BBC4A6]'
                          }`}
                        >
                          {design.badge}
                        </span>
                      </div>
                      <p
                        className={`text-[10px] mt-1 line-clamp-1 ${
                          selected ? 'text-[#BBC4A6]' : 'text-[#42684D] dark:text-[#BBC4A6]/80'
                        }`}
                      >
                        {design.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Quick Print Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
                <label className="flex items-center gap-2 px-3 min-h-[40px] rounded-lg bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-xs font-medium text-[#19382B] dark:text-[#F3F1E8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showLogo}
                    onChange={(e) => updateField('showLogo', e.target.checked)}
                    className="accent-[#19382B] w-4 h-4"
                  />
                  <span>SUST Crest Logo</span>
                </label>
                <label className="flex items-center gap-2 px-3 min-h-[40px] rounded-lg bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-xs font-medium text-[#19382B] dark:text-[#F3F1E8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.monochromePrint}
                    onChange={(e) => updateField('monochromePrint', e.target.checked)}
                    className="accent-[#19382B] w-4 h-4"
                  />
                  <span>B&amp;W Print Mode</span>
                </label>
              </div>
            </div>

            {/* 2. Cover Type & Course Info */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-4 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>2. Cover Type &amp; Course</span>
                </h2>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] cursor-pointer"
                    title="Fill with sample FES SUST data"
                  >
                    Sample
                  </button>
                  <button
                    type="button"
                    onClick={handleClearToBlank}
                    className="text-[11px] font-semibold px-2 py-1 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] text-[#987453] hover:text-[#19382B] cursor-pointer inline-flex items-center gap-1"
                    title="Clear course & topic fields"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>

              {/* Cover Type Tabs */}
              <div>
                <span className={labelCls}>Document Type</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {COVER_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField('coverType', type)}
                      className={`px-2 min-h-[40px] rounded-lg text-xs font-semibold border transition-colors cursor-pointer active:scale-95 ${
                        formData.coverType === type
                          ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] border-[#19382B] dark:border-[#BBC4A6]'
                          : 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:border-[#42684D]'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Pick from Official FES Syllabus */}
              <div>
                <label htmlFor="cover-course-preset" className={labelCls}>
                  Quick Fill from SUST FES Courses
                </label>
                <select
                  id="cover-course-preset"
                  defaultValue=""
                  onChange={(e) => handleSelectCoursePreset(e.target.value)}
                  className={inputCls}
                >
                  <option value="">-- Select a FES course to auto-fill --</option>
                  {Object.entries(groupedCourses).map(([groupLabel, list]) => (
                    <optgroup key={groupLabel} label={groupLabel}>
                      {list.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.shortCode}) — {c.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label htmlFor="cover-course-code" className={labelCls}>
                    Course Code
                  </label>
                  <input
                    id="cover-course-code"
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => updateField('courseCode', e.target.value)}
                    placeholder="FES 08211121"
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="cover-course-title" className={labelCls}>
                    Course Title
                  </label>
                  <input
                    id="cover-course-title"
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) => updateField('courseTitle', e.target.value)}
                    placeholder="Introduction to Forestry"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="cover-university" className={labelCls}>
                    University Name
                  </label>
                  <input
                    id="cover-university"
                    type="text"
                    value={formData.universityName}
                    onChange={(e) => updateField('universityName', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="cover-department" className={labelCls}>
                    Department Name
                  </label>
                  <input
                    id="cover-department"
                    type="text"
                    value={formData.department}
                    onChange={(e) => updateField('department', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {/* 3. Topic / Experiment Details */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                <span>
                  3. {formData.coverType === 'Lab Report' ? 'Experiment Details' : `${formData.coverType} Details`}
                </span>
              </h2>

              {formData.coverType === 'Lab Report' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label htmlFor="cover-exp-no" className={labelCls}>
                        Experiment No.
                      </label>
                      <input
                        id="cover-exp-no"
                        type="text"
                        value={formData.experimentNo}
                        onChange={(e) => updateField('experimentNo', e.target.value)}
                        placeholder="01"
                        className={inputCls}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="cover-exp-name" className={labelCls}>
                        Experiment Name
                      </label>
                      <input
                        id="cover-exp-name"
                        type="text"
                        value={formData.experimentName}
                        onChange={(e) => updateField('experimentName', e.target.value)}
                        placeholder="Study of Forest Stand Structure..."
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="cover-exp-date" className={labelCls}>
                        Experiment Date
                      </label>
                      <input
                        id="cover-exp-date"
                        type="date"
                        value={formData.experimentDate}
                        onChange={(e) => updateField('experimentDate', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="cover-report-date" className={labelCls}>
                        Submission Date
                      </label>
                      <input
                        id="cover-report-date"
                        type="date"
                        value={formData.reportSubmissionDate}
                        onChange={(e) => updateField('reportSubmissionDate', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label htmlFor="cover-topic-title" className={labelCls}>
                      {formData.coverType} Title / Topic
                    </label>
                    <input
                      id="cover-topic-title"
                      type="text"
                      value={formData.topicTitle}
                      onChange={(e) => updateField('topicTitle', e.target.value)}
                      placeholder="Mangrove Ecosystem Services & Restoration in Bangladesh"
                      className={inputCls}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="cover-topic-date" className={labelCls}>
                        Assigned Date
                      </label>
                      <input
                        id="cover-topic-date"
                        type="date"
                        value={formData.topicDate}
                        onChange={(e) => updateField('topicDate', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="cover-sub-date" className={labelCls}>
                        Submission Date
                      </label>
                      <input
                        id="cover-sub-date"
                        type="date"
                        value={formData.submissionDate}
                        onChange={(e) => updateField('submissionDate', e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 4. Submitted To (Instructor) */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>4. Submitted To (Course Teacher)</span>
                </h2>
                <button
                  type="button"
                  onClick={handleToggleSecondTeacher}
                  className={`inline-flex items-center gap-1.5 px-2.5 min-h-[34px] rounded-md text-[11px] font-semibold border transition-colors cursor-pointer ${
                    formData.hasSecondTeacher
                      ? 'bg-[#EAE7DA] dark:bg-[#142D22] text-[#987453] border-[#987453]/40 hover:bg-[#987453]/10'
                      : 'bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] border-[#BBC4A6] dark:border-[#BBC4A6]/30 hover:border-[#42684D]'
                  }`}
                >
                  {formData.hasSecondTeacher ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      <span>Remove 2nd Teacher</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                      <span>+ Add 2nd Teacher</span>
                    </>
                  )}
                </button>
              </div>

              {formData.hasSecondTeacher && (
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#987453] dark:text-[#BBC4A6]">
                  Course Teacher 1
                </div>
              )}

              <div>
                <label htmlFor="cover-faculty-preset" className={labelCls}>
                  Quick Fill SUST FES Faculty
                </label>
                <select
                  id="cover-faculty-preset"
                  defaultValue=""
                  onChange={(e) => handleSelectFacultyPreset(e.target.value)}
                  className={inputCls}
                >
                  <option value="">-- Pick faculty member --</option>
                  {SUST_FES_FACULTY.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.isHead ? `${f.designation} & Head` : f.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="cover-teacher-name" className={labelCls}>
                    Instructor Name
                  </label>
                  <input
                    id="cover-teacher-name"
                    type="text"
                    value={formData.teacherName}
                    onChange={(e) => updateField('teacherName', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="cover-teacher-desig" className={labelCls}>
                    Designation
                  </label>
                  <input
                    id="cover-teacher-desig"
                    type="text"
                    value={formData.teacherDesignation}
                    onChange={(e) => updateField('teacherDesignation', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="cover-teacher-dept" className={labelCls}>
                    Instructor Department
                  </label>
                  <input
                    id="cover-teacher-dept"
                    type="text"
                    value={formData.teacherDepartment}
                    onChange={(e) => updateField('teacherDepartment', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="cover-teacher-uni" className={labelCls}>
                    University
                  </label>
                  <input
                    id="cover-teacher-uni"
                    type="text"
                    value={formData.teacherUniversity}
                    onChange={(e) => updateField('teacherUniversity', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {formData.hasSecondTeacher && (
                <div className="pt-3 mt-1 border-t border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#987453] dark:text-[#BBC4A6]">
                    Course Teacher 2 (Optional)
                  </div>

                  <div>
                    <label htmlFor="cover-faculty2-preset" className={labelCls}>
                      Quick Fill 2nd Teacher (SUST FES Faculty)
                    </label>
                    <select
                      id="cover-faculty2-preset"
                      defaultValue=""
                      onChange={(e) => handleSelectSecondFacultyPreset(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">-- Pick 2nd faculty member --</option>
                      {SUST_FES_FACULTY.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.isHead ? `${f.designation} & Head` : f.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="cover-teacher2-name" className={labelCls}>
                        2nd Instructor Name
                      </label>
                      <input
                        id="cover-teacher2-name"
                        type="text"
                        value={formData.teacher2Name || ''}
                        onChange={(e) => updateField('teacher2Name', e.target.value)}
                        placeholder="e.g. Dr. Md. Habibur Rahman"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="cover-teacher2-desig" className={labelCls}>
                        Designation
                      </label>
                      <input
                        id="cover-teacher2-desig"
                        type="text"
                        value={formData.teacher2Designation || ''}
                        onChange={(e) => updateField('teacher2Designation', e.target.value)}
                        placeholder="e.g. Associate Professor"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label htmlFor="cover-teacher2-dept" className={labelCls}>
                        2nd Instructor Department
                      </label>
                      <input
                        id="cover-teacher2-dept"
                        type="text"
                        value={formData.teacher2Department ?? ''}
                        onChange={(e) => updateField('teacher2Department', e.target.value)}
                        placeholder="Forestry and Environmental Science"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="cover-teacher2-uni" className={labelCls}>
                        University
                      </label>
                      <input
                        id="cover-teacher2-uni"
                        type="text"
                        value={formData.teacher2University ?? ''}
                        onChange={(e) => updateField('teacher2University', e.target.value)}
                        placeholder="Shahjalal University of Science and Technology, Sylhet"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Submitted By (Student Profile) */}
            <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-xl border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>5. Submitted By (Student Info)</span>
                </h2>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="cover-student-name" className={labelCls}>
                    Student Name
                  </label>
                  <input
                    id="cover-student-name"
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => updateField('studentName', e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="cover-reg-no" className={labelCls}>
                    Registration No.
                  </label>
                  <input
                    id="cover-reg-no"
                    type="text"
                    value={formData.registrationNo}
                    onChange={(e) => updateField('registrationNo', e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="cover-group" className={labelCls}>
                    Group (Optional)
                  </label>
                  <input
                    id="cover-group"
                    type="text"
                    value={formData.group}
                    onChange={(e) => updateField('group', e.target.value)}
                    placeholder="Group A"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="cover-session" className={labelCls}>
                    Session
                  </label>
                  <input
                    id="cover-session"
                    type="text"
                    value={formData.session}
                    onChange={(e) => updateField('session', e.target.value)}
                    placeholder="2025-26"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cover-semester" className={labelCls}>
                  Year &amp; Semester
                </label>
                <input
                  id="cover-semester"
                  list="cover-semester-list"
                  value={formData.semester}
                  onChange={(e) => updateField('semester', e.target.value)}
                  className={inputCls}
                />
                <datalist id="cover-semester-list">
                  {SEMESTER_PRESETS.map((sem) => (
                    <option key={sem} value={sem} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* Mobile Sticky Quick Preview CTA at Bottom of Form */}
            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => {
                  setMobileTab('preview');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-center gap-2 min-h-[46px] rounded-xl bg-[#19382B] text-[#F3F1E8] text-xs font-semibold cursor-pointer active:scale-[0.99]"
              >
                <Eye className="w-4 h-4 text-[#BBC4A6]" />
                <span>Preview &amp; Export A4 Cover Page</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Live Responsive A4 Stage */}
          <div
            className={`lg:col-span-7 lg:sticky lg:top-20 space-y-3 ${
              mobileTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Preview Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                <Eye className="w-4 h-4 text-[#987453]" />
                <span>Live A4 Sheet Preview</span>
                <span className="text-[11px] font-mono text-[#42684D] dark:text-[#BBC4A6]">
                  ({Math.round(previewScale * 100)}%)
                </span>
              </div>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                {(['fit', '75', '100'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setZoomMode(mode)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                      zoomMode === mode
                        ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8]'
                        : 'text-[#42684D] dark:text-[#BBC4A6]'
                    }`}
                  >
                    {mode === 'fit' ? 'Fit Width' : `${mode}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Responsive A4 Paper Frame */}
            <div
              ref={stageWrapRef}
              className="rounded-xl bg-[#EAE7DA] dark:bg-[#0D1E17] border border-[#BBC4A6] dark:border-[#BBC4A6]/20 p-2 sm:p-4 overflow-x-auto flex justify-center"
            >
              <div
                style={{
                  width: `${Math.round(794 * previewScale)}px`,
                  height: `${Math.round(1123 * previewScale)}px`,
                  position: 'relative',
                  flexShrink: 0,
                  boxShadow: '0 14px 36px rgba(17, 38, 29, 0.22)',
                }}
              >
                <div
                  style={{
                    width: '794px',
                    height: '1123px',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <CoverSheetPreview data={formData} id="cover-live-sheet" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dedicated Unscaled Print-Only A4 Portal */}
      <div id="cover-print-portal" className="hidden print:block">
        <CoverSheetPreview data={formData} id="cover-print-sheet" />
      </div>
    </>
  );
};
