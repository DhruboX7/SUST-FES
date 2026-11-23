import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SUST_FES_COURSES } from '../data/coursesData';
import { ResourceItem, ResourceCategory } from '../types';
import { ResourceCard } from './ResourceCard';
import { usePageMeta } from '../hooks/usePageMeta';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  BookOpen, 
  Clock, 
  Layers, 
  GraduationCap, 
  Presentation, 
  FileText, 
  FileCheck, 
  ExternalLink,
  Plus
} from 'lucide-react';

interface CoursePageViewProps {
  resources: ResourceItem[];
  bookmarks: string[];
  onToggleBookmark: (id: string) => void;
  onPreview: (resource: ResourceItem) => void;
  onCopyLink: (resource: ResourceItem) => void;
}

export const CoursePageView: React.FC<CoursePageViewProps> = ({
  resources,
  bookmarks,
  onToggleBookmark,
  onPreview,
  onCopyLink,
}) => {
  const { code } = useParams<{ code: string }>();
  const [copiedLink, setCopiedLink] = useState(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  // Normalize code lookup (replace spaces or hyphens)
  const normalizedCode = (code || '').replace(/-/g, ' ').toUpperCase();
  const course = SUST_FES_COURSES.find(
    (c) => c.code.toUpperCase() === normalizedCode || c.code.replace(/\s+/g, '').toUpperCase() === (code || '').replace(/[\s-]+/g, '').toUpperCase()
  );

  usePageMeta({
    title: course ? `${course.code} - ${course.title}` : 'Course Not Found',
    description: course
      ? `${course.code}: ${course.title}. Credits: ${course.credits}. Department of Forestry and Environmental Science, SUST.`
      : 'Course not found in the SUST FES syllabus archive.',
  });

  if (!course) {
    return (
      <div className="py-16 text-center bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-8 shadow-xs">
        <BookOpen className="w-12 h-12 text-[#8A9C74] mx-auto mb-3" />
        <h2 className="font-editorial text-xl font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-2">
          Course Not Found
        </h2>
        <p className="text-sm text-[#42684D] dark:text-[#BBC4A6] max-w-md mx-auto mb-6">
          Could not find course with code "{code}". Please check the course code or browse our complete syllabus.
        </p>
        <Link
          to="/syllabus"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Browse All Courses in Syllabus</span>
        </Link>
      </div>
    );
  }

  // Filter resources for this course
  const targetNormalized = course.code.toLowerCase().replace(/\s+/g, '');
  const courseResources = (Array.isArray(resources) ? resources : []).filter(
    (r) => r && (r.courseCode || '').toLowerCase().replace(/\s+/g, '') === targetNormalized
  );

  const handleCopyCourseLink = () => {
    if (!navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopiedLink(true);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => {
          setCopiedLink(false);
          copyTimerRef.current = null;
        }, 2000);
      })
      .catch(() => {});
  };

  const categories: { key: ResourceCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'slides', label: 'Lecture Slides & Presentations', icon: <Presentation className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" /> },
    { key: 'notes', label: 'Lecture Notes & Study Guides', icon: <FileText className="w-4 h-4 text-[#19382B] dark:text-[#BBC4A6]" /> },
    { key: 'pyq', label: 'Previous Year Questions (PYQs)', icon: <FileCheck className="w-4 h-4 text-[#987453] dark:text-[#BBC4A6]" /> },
    { key: 'book', label: 'Reference Books & Literature', icon: <BookOpen className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" /> },
    { key: 'practical', label: 'Lab Manuals & Practical Guides', icon: <Layers className="w-4 h-4 text-[#8A9C74]" /> },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/syllabus"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Syllabus</span>
        </Link>

        <button
          onClick={handleCopyCourseLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] text-xs font-semibold hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] transition-colors shadow-xs"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-[#42684D]" /> : <Copy className="w-3.5 h-3.5 text-[#8A9C74]" />}
          <span>{copiedLink ? 'Link Copied!' : 'Copy Course Link'}</span>
        </button>
      </div>

      {/* Course Hero Banner */}
      <div className="bg-[#19382B] rounded-lg p-6 sm:p-8 text-[#F3F1E8] border border-[#42684D]/40 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 font-mono text-[#8A9C74] text-xs font-semibold tracking-wider uppercase mb-2">
            <span>{course.code}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{course.courseType} Course</span>
            <span aria-hidden="true">·</span>
            <span>
              {course.year === 'msc' ? 'M.Sc.' : `${course.year}${course.year === 1 ? 'st' : course.year === 2 ? 'nd' : course.year === 3 ? 'rd' : 'th'} Year`}
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-[#F3F1E8]">
            {course.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#BBC4A6] mb-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#8A9C74]" />
              <span>{course.credits} Credits ({course.hoursTheory}h Theory, {course.hoursLab}h Lab/wk)</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Semester {course.semester}</span>
            <span aria-hidden="true">·</span>
            <span>{courseResources.length} Archive Resource{courseResources.length === 1 ? '' : 's'}</span>
          </div>
          {course.rationale && (
            <p className="text-xs sm:text-sm text-[#BBC4A6] leading-relaxed border-t border-[#42684D]/40 pt-3">
              {course.rationale}
            </p>
          )}
        </div>
      </div>

      {/* Syllabus Modules & Learning Outcomes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Syllabus Contents (2 Cols) */}
        <div className="lg:col-span-2 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-6 shadow-xs">
          <h2 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
            <span>Syllabus Chapters & Core Modules</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(course.contents || []).map((topic, i) => (
              <div
                key={i}
                className="p-3 rounded-md bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-xs text-[#19382B] dark:text-[#F3F1E8] flex items-start gap-2.5"
              >
                <span className="w-5 h-5 rounded-sm bg-[#EAE7DA] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-[#42684D] dark:text-[#BBC4A6] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-snug">{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Intended Learning Outcomes (1 Col) */}
        <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#987453] dark:text-[#8A9C74]" />
              <span>Learning Outcomes</span>
            </h2>
            <div className="space-y-3">
              {(course.learningOutcomes || course.objectives || []).map((clo, i) => (
                <div key={i} className="text-xs text-[#42684D] dark:text-[#BBC4A6] leading-relaxed">
                  <span className="font-mono font-bold text-[#987453] dark:text-[#8A9C74] mr-1.5">
                    CLO {i + 1}:
                  </span>
                  <span>{clo}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
            <a
              href="/assets/aistudio/Final_BSc_Curriculum-2025-2026_9f635d9c.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:underline flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Full OBE Curriculum PDF</span>
            </a>
          </div>
        </div>

      </div>

      {/* Categorized Course Materials */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 pb-3">
          <div>
            <h2 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">
              Study Materials & Resources
            </h2>
            <p className="text-xs text-[#42684D] dark:text-[#BBC4A6]">
              All documents hosted in Google Drive for {course.code}
            </p>
          </div>
          <Link
            to="/contribute"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Contribute Material</span>
          </Link>
        </div>

        {categories.map((cat) => {
          const categoryItems = courseResources.filter((r) => r.category === cat.key);
          return (
            <div key={cat.key} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#19382B] dark:text-[#F3F1E8]">
                {cat.icon}
                <span>{cat.label}</span>
                <span className="text-xs font-normal text-[#8A9C74] font-mono">
                  ({categoryItems.length})
                </span>
              </div>

              {categoryItems.length === 0 ? (
                <div className="p-4 rounded-md bg-[#EAE7DA]/70 dark:bg-[#142D22] border border-dashed border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-xs text-[#42684D] dark:text-[#BBC4A6] flex items-center justify-between">
                  <span>No materials uploaded under this category yet.</span>
                  <Link
                    to="/contribute"
                    className="text-[#987453] dark:text-[#BBC4A6] hover:underline font-semibold"
                  >
                    + Submit {cat.label}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryItems.map((res) => (
                    <ResourceCard
                      key={res.id}
                      resource={res}
                      isBookmarked={bookmarks.includes(res.id)}
                      onToggleBookmark={onToggleBookmark}
                      onPreview={onPreview}
                      onCopyLink={onCopyLink}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
