import React, { useEffect, useState } from 'react';
import {
  X,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  FileText,
  GraduationCap,
  BookOpen,
  Award,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { OfficialFaculty } from '../data/coursesData';

interface FacultyProfileModalProps {
  faculty: OfficialFaculty | null;
  isOpen: boolean;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export function resolveFacultyPhotoUrl(photoUrl?: string): string | null {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('data:')) {
    return photoUrl;
  }
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl;
  return `${normalizedBase}${cleanPath}`;
}

export function getFacultyInitials(name: string): string {
  const cleaned = name
    .replace(/^(Professor|Dr\.?|Mr\.?|Ms\.?|Mrs\.?)\s+/gi, '')
    .replace(/^(Dr\.?)\s+/gi, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'FE';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const FacultyProfileModal: React.FC<FacultyProfileModalProps> = ({
  faculty,
  isOpen,
  onClose,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
}) => {
  const [imgError, setImgError] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'phone' | null>(null);

  useEffect(() => {
    setImgError(false);
    setCopiedField(null);
  }, [faculty?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !faculty) return null;

  const resolvedPhoto = resolveFacultyPhotoUrl(faculty.photoUrl);
  const initials = getFacultyInitials(faculty.name);

  const handleCopy = async (text: string, field: 'email' | 'phone') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
    } catch {
      // Clipboard blocked in non-HTTPS contexts; ignore silently
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#11261D]/75 backdrop-blur-xs"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="faculty-profile-title"
    >
      <div
        className="w-full sm:max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] rounded-t-xl sm:rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 bg-[#F3F1E8] dark:bg-[#142D22] shrink-0">
          <div className="text-xs font-medium text-[#42684D] dark:text-[#BBC4A6] truncate">
            Faculty Profile · Department of Forestry & Environmental Science
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close faculty profile"
            className="p-2 rounded-md text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] transition-colors shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#42684D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-6">
          {/* Identity Hero Strip */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-28 h-34 sm:w-32 sm:h-40 rounded-md overflow-hidden shrink-0 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25">
              {resolvedPhoto && !imgError ? (
                <img
                  src={resolvedPhoto}
                  alt={`Portrait of ${faculty.name}`}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-editorial text-2xl font-semibold text-[#42684D] dark:text-[#BBC4A6]">
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2.5">
              {/* Quiet metadata kicker (zero-pill discipline) */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
                <span className="text-[#42684D] dark:text-[#8A9C74] font-semibold">
                  {faculty.designation}
                </span>
                {faculty.isHead && (
                  <>
                    <span aria-hidden="true" className="text-[#8A9C74]">·</span>
                    <span className="text-[#987453] dark:text-[#D4A97E] font-semibold">
                      Head of Department
                    </span>
                  </>
                )}
                <span aria-hidden="true" className="text-[#8A9C74]">·</span>
                <span className={faculty.onLeave ? 'text-[#987453] dark:text-[#D4A97E]' : 'text-[#42684D] dark:text-[#BBC4A6]'}>
                  {faculty.onLeave ? 'On Study Leave' : faculty.availabilityLabel || 'On Duty'}
                </span>
              </div>

              <h2
                id="faculty-profile-title"
                className="font-editorial text-2xl sm:text-3xl font-semibold text-[#19382B] dark:text-[#F3F1E8] leading-tight"
                style={{ textWrap: 'balance' }}
              >
                {faculty.name}
              </h2>

              <p className="text-xs sm:text-sm text-[#42684D] dark:text-[#BBC4A6]">
                Department of Forestry and Environmental Science · Shahjalal University of Science and Technology
              </p>

              {/* Contact Grid */}
              <div className="pt-2 space-y-2 text-xs sm:text-sm">
                {faculty.email && (
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-[#8A9C74] shrink-0" />
                    <a
                      href={`mailto:${faculty.email}`}
                      className="font-mono text-[#19382B] dark:text-[#F3F1E8] underline decoration-[#BBC4A6] hover:text-[#42684D] dark:hover:text-[#BBC4A6] truncate"
                    >
                      {faculty.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(faculty.email!, 'email')}
                      aria-label="Copy email address"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] transition-colors shrink-0 whitespace-nowrap"
                    >
                      {copiedField === 'email' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {faculty.phone && (
                  <div className="flex items-center gap-2 min-w-0">
                    <Phone className="w-4 h-4 text-[#8A9C74] shrink-0" />
                    <a
                      href={`tel:${faculty.phone}`}
                      className="font-mono tabular-nums text-[#19382B] dark:text-[#F3F1E8] hover:underline"
                    >
                      {faculty.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopy(faculty.phone!, 'phone')}
                      aria-label="Copy phone number"
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] transition-colors shrink-0 whitespace-nowrap"
                    >
                      {copiedField === 'phone' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {faculty.office && (
                  <div className="flex items-start gap-2 text-xs text-[#42684D] dark:text-[#BBC4A6]">
                    <MapPin className="w-4 h-4 text-[#8A9C74] shrink-0 mt-0.5" />
                    <span>{faculty.office}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Official Action Links */}
          {(faculty.profileUrl || faculty.cvUrl || (faculty.links && faculty.links.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[#BBC4A6]/40 dark:border-[#BBC4A6]/15">
              {faculty.profileUrl && (
                <a
                  href={faculty.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-[#19382B] text-[#F3F1E8] dark:bg-[#42684D] hover:bg-[#42684D] dark:hover:bg-[#527F5F] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Official SUST Profile</span>
                </a>
              )}
              {faculty.cvUrl && (
                <a
                  href={faculty.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] hover:bg-[#EAE7DA] dark:hover:bg-[#1C3D2F] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Official CV (PDF)</span>
                </a>
              )}
              {faculty.links?.map((lnk, idx) => (
                <a
                  key={idx}
                  href={lnk.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#EAE7DA] dark:hover:bg-[#1C3D2F] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{lnk.label}</span>
                </a>
              ))}
            </div>
          )}

          {/* Biography & Research Summary */}
          {(faculty.bio || faculty.researchSummary) && (
            <section className="pt-5 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74]">
                Biography & Academic Focus
              </h3>
              {faculty.bio && (
                <div className="max-w-prose space-y-2.5 text-sm text-[#19382B] dark:text-[#F3F1E8]/90 leading-relaxed">
                  {faculty.bio.split(/\n\n+/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
              {faculty.researchSummary && (
                <p className="max-w-prose text-sm text-[#42684D] dark:text-[#BBC4A6] leading-relaxed">
                  {faculty.researchSummary}
                </p>
              )}
            </section>
          )}

          {/* Research Areas (Clean Unboxed Typographic List) */}
          {faculty.researchAreas && faculty.researchAreas.length > 0 && (
            <section className="pt-5 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 space-y-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74]">
                Research Interests
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-[#19382B] dark:text-[#F3F1E8]">
                {faculty.researchAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span aria-hidden="true" className="text-[#8A9C74] mt-0.5">·</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Education */}
          {faculty.education && faculty.education.length > 0 && (
            <section className="pt-5 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#8A9C74]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74]">
                  Education & Qualifications
                </h3>
              </div>
              <dl className="divide-y divide-[#BBC4A6]/35 dark:divide-[#BBC4A6]/10">
                {faculty.education.map((edu, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div>
                      <dt className="text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                        {edu.degree}
                      </dt>
                      {edu.institute && (
                        <dd className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
                          {edu.institute}
                        </dd>
                      )}
                    </div>
                    {edu.duration && (
                      <span className="text-xs font-mono tabular-nums text-[#8A9C74] shrink-0">
                        {edu.duration}
                      </span>
                    )}
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Courses Taught */}
          {faculty.teaching && faculty.teaching.length > 0 && (
            <section className="pt-5 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 space-y-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#8A9C74]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74]">
                  Teaching & Courses
                </h3>
              </div>
              <ul className="space-y-1.5 text-sm text-[#19382B] dark:text-[#F3F1E8]">
                {faculty.teaching.map((course, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span aria-hidden="true" className="text-[#8A9C74]">·</span>
                    <span>{course}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Selected Recent Publications */}
          {faculty.selectedPublications && faculty.selectedPublications.length > 0 && (
            <section className="pt-5 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74]">
                  Selected Recent Publications
                </h3>
                {typeof faculty.publicationsCount === 'number' && faculty.publicationsCount > 0 && (
                  <span className="text-xs font-mono tabular-nums text-[#8A9C74]">
                    {faculty.publicationsCount} total indexed
                  </span>
                )}
              </div>
              <ol className="space-y-2.5 divide-y divide-[#BBC4A6]/30 dark:divide-[#BBC4A6]/10">
                {faculty.selectedPublications.map((pub, idx) => (
                  <li key={idx} className="pt-2.5 first:pt-0 text-xs sm:text-sm text-[#19382B] dark:text-[#F3F1E8]/90 leading-relaxed">
                    <div className="flex items-start justify-between gap-3">
                      <span>{pub.title}</span>
                      {pub.year && (
                        <span className="font-mono tabular-nums text-xs text-[#8A9C74] shrink-0">
                          {pub.year}
                        </span>
                      )}
                    </div>
                    {pub.url && (
                      <a
                        href={pub.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-[#42684D] dark:text-[#BBC4A6] hover:underline"
                      >
                        <span>View Publication</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Awards & Fellowships */}
          {faculty.awards && faculty.awards.length > 0 && (
            <section className="pt-5 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 space-y-2.5">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#8A9C74]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#42684D] dark:text-[#8A9C74]">
                  Honors & Fellowships
                </h3>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-[#19382B] dark:text-[#F3F1E8]">
                {faculty.awards.map((aw, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-3">
                    <span className="flex items-start gap-2">
                      <span aria-hidden="true" className="text-[#8A9C74]">·</span>
                      <span>{aw.title}</span>
                    </span>
                    {aw.year && (
                      <span className="font-mono tabular-nums text-xs text-[#8A9C74] shrink-0">
                        {aw.year}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Footer with Prev / Next Navigation */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 bg-[#F3F1E8] dark:bg-[#142D22] shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={!onPrev}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-xs font-semibold bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] hover:bg-[#EAE7DA] dark:hover:bg-[#1C3D2F] disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!onNext}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-xs font-semibold bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] hover:bg-[#EAE7DA] dark:hover:bg-[#1C3D2F] disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {typeof currentIndex === 'number' && typeof totalCount === 'number' && (
            <span className="text-xs font-mono tabular-nums text-[#42684D] dark:text-[#BBC4A6]">
              {currentIndex + 1} / {totalCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
