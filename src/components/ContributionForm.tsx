import React, { useState, useEffect } from 'react';
import {
  AcademicYear,
  ContributionEntityType,
  ContributionRequest,
  ResourceCategory,
  TreeSpecies,
} from '../types';
import { SUST_FES_COURSES } from '../data/coursesData';
import { parseGoogleDriveUrl, guessFileType } from '../utils/driveParser';
import {
  getStoredSpecies,
  submitContributionRequest,
} from '../utils/storage';
import {
  FileText,
  Trees,
  Image as ImageIcon,
  Camera,
  BookMarked,
  Bell,
  Link2,
  AlertCircle,
  Send,
} from 'lucide-react';

export interface ContributionSubmissionResult {
  request: ContributionRequest;
}

interface ContributionFormProps {
  onSubmitted: (result: ContributionSubmissionResult) => void;
}

const ENTITY_OPTIONS: Array<{
  id: ContributionEntityType;
  label: string;
  shortDesc: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { id: 'resource', label: 'Study Resource / PYQ', shortDesc: 'Slides, notes, question papers, manuals', icon: FileText },
  { id: 'species', label: 'Tree Species', shortDesc: 'Botanical entry & silvicultural profile', icon: Trees },
  { id: 'gallery', label: 'Field Gallery Photo', shortDesc: 'Excursion, lab or campus album photo', icon: ImageIcon },
  { id: 'student_photo', label: 'Student Field Photo', shortDesc: 'Student lens capture linked to flora', icon: Camera },
  { id: 'thesis', label: 'Thesis Monograph', shortDesc: 'B.Sc. / M.Sc. dissertation entry', icon: BookMarked },
  { id: 'notice', label: 'Department Notice', shortDesc: 'Circular, announcement or event', icon: Bell },
  { id: 'quick_link', label: 'Quick Portal Link', shortDesc: 'Department Drive, form or external link', icon: Link2 },
];

export const ContributionForm: React.FC<ContributionFormProps> = ({
  onSubmitted,
}) => {
  const [entityType, setEntityType] = useState<ContributionEntityType>('resource');

  // Contributor identity
  const [contributorName, setContributorName] = useState('');
  const [contributorBatch, setContributorBatch] = useState('');
  const [contributorContact, setContributorContact] = useState('');

  // Shared / Resource fields
  const [resTitle, setResTitle] = useState('');
  const [resDriveUrl, setResDriveUrl] = useState('');
  const [resYear, setResYear] = useState<AcademicYear>(1);
  const [resSemester, setResSemester] = useState<1 | 2 | 'all'>(1);
  const [resCourseCode, setResCourseCode] = useState('FES 08211121');
  const [resCategory, setResCategory] = useState<ResourceCategory>('slides');
  const [resExamTerm, setResExamTerm] = useState<'midterm' | 'final' | 'quiz' | 'all'>('final');
  const [resSessionYear, setResSessionYear] = useState('2024-2025');
  const [resDescription, setResDescription] = useState('');

  // Species fields
  const [spScientific, setSpScientific] = useState('');
  const [spCommon, setSpCommon] = useState('');
  const [spBangla, setSpBangla] = useState('');
  const [spFamily, setSpFamily] = useState('');
  const [spEcosystem, setSpEcosystem] = useState('Hill Semi-Evergreen');
  const [spConservation, setSpConservation] = useState('Least Concern (LC)');
  const [spHabitat, setSpHabitat] = useState('');
  const [spDistribution, setSpDistribution] = useState('Sylhet, Chattogram Hill Tracts');
  const [spUses, setSpUses] = useState('');
  const [spNotes, setSpNotes] = useState('');
  const [spImageUrl, setSpImageUrl] = useState('');

  // Gallery / Student Photo fields
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoLocation, setPhotoLocation] = useState('SUST Campus, Sylhet');
  const [photoYear, setPhotoYear] = useState(String(new Date().getFullYear()));
  const [photoDate, setPhotoDate] = useState(new Date().toISOString().split('T')[0]);
  const [photoCategory, setPhotoCategory] = useState('field-tour');
  const [photoImageUrl, setPhotoImageUrl] = useState('');
  const [photoSpeciesId, setPhotoSpeciesId] = useState('');
  const [speciesList, setSpeciesList] = useState<TreeSpecies[]>([]);

  // Thesis fields
  const [thTitle, setThTitle] = useState('');
  const [thAuthor, setThAuthor] = useState('');
  const [thSupervisor, setThSupervisor] = useState('');
  const [thDegree, setThDegree] = useState('B.Sc. (Honours)');
  const [thYear, setThYear] = useState(String(new Date().getFullYear()));
  const [thArea, setThArea] = useState('');
  const [thAbstract, setThAbstract] = useState('');
  const [thDriveUrl, setThDriveUrl] = useState('');

  // Notice fields
  const [notTitle, setNotTitle] = useState('');
  const [notDate, setNotDate] = useState(new Date().toISOString().split('T')[0]);
  const [notBody, setNotBody] = useState('');
  const [notTag, setNotTag] = useState('new');
  const [notLink, setNotLink] = useState('');
  const [notImageUrl, setNotImageUrl] = useState('');

  // Quick Link fields
  const [qlTitle, setQlTitle] = useState('');
  const [qlUrl, setQlUrl] = useState('');
  const [qlCategory, setQlCategory] = useState<'portal' | 'drive' | 'syllabus' | 'form' | 'general'>('general');
  const [qlDescription, setQlDescription] = useState('');

  const [formError, setFormError] = useState('');

  useEffect(() => {
    getStoredSpecies()
      .then((list) => setSpeciesList(Array.isArray(list) ? list : []))
      .catch(() => {});
  }, []);

  const matchingCourses = SUST_FES_COURSES.filter((c) => c.year === resYear);
  const parsedDrive = parseGoogleDriveUrl(resDriveUrl);

  const handleResourceYearChange = (yr: AcademicYear) => {
    setResYear(yr);
    const list = SUST_FES_COURSES.filter((c) => c.year === yr);
    if (list.length > 0) {
      setResCourseCode(list[0].code);
    }
  };

  const resetSubmissionFields = () => {
    setResTitle('');
    setResDriveUrl('');
    setResDescription('');
    setSpScientific('');
    setSpCommon('');
    setSpBangla('');
    setSpFamily('');
    setSpHabitat('');
    setSpUses('');
    setSpNotes('');
    setSpImageUrl('');
    setPhotoTitle('');
    setPhotoCaption('');
    setPhotoImageUrl('');
    setPhotoSpeciesId('');
    setThTitle('');
    setThAuthor('');
    setThSupervisor('');
    setThArea('');
    setThAbstract('');
    setThDriveUrl('');
    setNotTitle('');
    setNotBody('');
    setNotLink('');
    setNotImageUrl('');
    setQlTitle('');
    setQlUrl('');
    setQlDescription('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!contributorName.trim()) {
      setFormError('Please enter your name or batch role (e.g. Student Name or CR).');
      return;
    }

    let requestTitle = '';
    let requestSummary = '';
    let payload: Record<string, any> = {};

    if (entityType === 'resource') {
      if (!resTitle.trim() || !resDriveUrl.trim()) {
        setFormError('Resource title and Google Drive / URL link are required.');
        return;
      }
      const courseObj = SUST_FES_COURSES.find((c) => c.code === resCourseCode);
      const parsed = parseGoogleDriveUrl(resDriveUrl.trim());
      const fileType = guessFileType(resDriveUrl.trim(), resCategory, parsed.fileType);
      requestTitle = resTitle.trim();
      requestSummary = `${resCategory.toUpperCase()} · ${resCourseCode}${resSessionYear ? ` · ${resSessionYear}` : ''}`;
      payload = {
        title: resTitle.trim(),
        courseCode: resCourseCode,
        courseTitle: courseObj?.title || 'Departmental Course',
        year: resYear,
        semester: resSemester,
        category: resCategory,
        driveUrl: resDriveUrl.trim(),
        fileId: parsed.valid ? parsed.fileId : '',
        fileType,
        previewUrl: parsed.previewUrl || resDriveUrl.trim(),
        downloadUrl: parsed.downloadUrl || resDriveUrl.trim(),
        sessionYear: resSessionYear.trim() || undefined,
        authorOrTeacher: contributorName.trim(),
        description: resDescription.trim() || undefined,
        examTerm: resCategory === 'pyq' ? resExamTerm : undefined,
      };
    } else if (entityType === 'species') {
      if (!spScientific.trim() || !spCommon.trim()) {
        setFormError('Scientific name and Common name are required for a tree species entry.');
        return;
      }
      requestTitle = `${spCommon.trim()} (${spScientific.trim()})`;
      requestSummary = `Family: ${spFamily.trim() || 'Pending classification'} · ${spEcosystem}`;
      payload = {
        scientificName: spScientific.trim(),
        commonName: spCommon.trim(),
        banglaName: spBangla.trim(),
        family: spFamily.trim() || 'Unclassified',
        forestEcosystem: spEcosystem,
        conservationStatus: spConservation,
        habitat: spHabitat.trim(),
        distribution: spDistribution.trim(),
        uses: spUses
          .split(',')
          .map((u) => u.trim())
          .filter(Boolean),
        silviculturalNotes: spNotes.trim(),
        imageUrl: spImageUrl.trim() || undefined,
        photoCredit: contributorName.trim(),
      };
    } else if (entityType === 'gallery') {
      if (!photoTitle.trim() || !photoImageUrl.trim()) {
        setFormError('Photo title and image URL are required.');
        return;
      }
      requestTitle = photoTitle.trim();
      requestSummary = `${photoCategory} · ${photoLocation.trim()} (${photoYear.trim()})`;
      payload = {
        title: photoTitle.trim(),
        caption: photoCaption.trim(),
        location: photoLocation.trim() || 'SUST Campus, Sylhet',
        year: photoYear.trim() || String(new Date().getFullYear()),
        category: photoCategory,
        imageUrl: photoImageUrl.trim(),
        photographer: contributorName.trim(),
      };
    } else if (entityType === 'student_photo') {
      if (!photoTitle.trim() || !photoImageUrl.trim()) {
        setFormError('Photo title and image URL are required.');
        return;
      }
      const matchedSpecies = speciesList.find((s) => s.id === photoSpeciesId);
      requestTitle = photoTitle.trim();
      requestSummary = matchedSpecies
        ? `Student Capture · ${matchedSpecies.scientificName}`
        : `Student Capture · ${photoLocation.trim()}`;
      payload = {
        studentName: contributorName.trim(),
        studentBatch: contributorBatch.trim() || undefined,
        title: photoTitle.trim(),
        caption: photoCaption.trim(),
        location: photoLocation.trim() || 'SUST Campus, Sylhet',
        date: photoDate,
        imageUrl: photoImageUrl.trim(),
        treeSpeciesId: matchedSpecies?.id,
        speciesScientificName: matchedSpecies?.scientificName,
      };
    } else if (entityType === 'thesis') {
      if (!thTitle.trim() || !thAuthor.trim()) {
        setFormError('Thesis title and author name are required.');
        return;
      }
      requestTitle = thTitle.trim();
      requestSummary = `${thDegree} (${thYear}) · Author: ${thAuthor.trim()}`;
      payload = {
        title: thTitle.trim(),
        author: thAuthor.trim(),
        supervisor: thSupervisor.trim() || 'Department Faculty',
        degree: thDegree,
        year: thYear.trim() || String(new Date().getFullYear()),
        researchArea: thArea.trim() || 'Forestry & Environmental Science',
        abstract: thAbstract.trim(),
        driveUrl: thDriveUrl.trim() || undefined,
      };
    } else if (entityType === 'notice') {
      if (!notTitle.trim() || !notBody.trim()) {
        setFormError('Notice title and message body are required.');
        return;
      }
      requestTitle = notTitle.trim();
      requestSummary = `Notice · ${notDate} · Tag: ${notTag}`;
      payload = {
        title: notTitle.trim(),
        date: notDate,
        body: notBody.trim(),
        tags: [notTag],
        link: notLink.trim() || undefined,
        imageUrl: notImageUrl.trim() || undefined,
        pinned: notTag === 'important',
      };
    } else if (entityType === 'quick_link') {
      if (!qlTitle.trim() || !qlUrl.trim()) {
        setFormError('Link title and destination URL are required.');
        return;
      }
      requestTitle = qlTitle.trim();
      requestSummary = `Quick Link (${qlCategory}) · ${qlUrl.trim()}`;
      payload = {
        title: qlTitle.trim(),
        url: qlUrl.trim(),
        category: qlCategory,
        description: qlDescription.trim() || undefined,
      };
    }

    const result = submitContributionRequest({
      entityType,
      title: requestTitle,
      contributorName: contributorName.trim(),
      contributorBatch: contributorBatch.trim() || undefined,
      contributorContact: contributorContact.trim() || undefined,
      summary: requestSummary,
      payload,
    });

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    resetSubmissionFields();
    onSubmitted({ request: result.request });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Choose What to Add */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold uppercase tracking-wider text-[#19382B] dark:text-[#F3F1E8]">
          Select What You Want to Submit for Review
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {ENTITY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = entityType === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setEntityType(opt.id);
                  setFormError('');
                }}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer flex items-start gap-2.5 ${
                  selected
                    ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] border-[#19382B] dark:border-[#BBC4A6]/60 shadow-xs'
                    : 'bg-[#FAF9F4] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:border-[#42684D]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 mt-0.5 ${
                    selected ? 'text-[#BBC4A6]' : 'text-[#42684D] dark:text-[#8A9C74]'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold leading-snug">{opt.label}</div>
                  <div
                    className={`text-[10px] mt-0.5 leading-snug ${
                      selected ? 'text-[#BBC4A6]' : 'text-[#42684D] dark:text-[#8A9C74]'
                    }`}
                  >
                    {opt.shortDesc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Contributor Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 text-xs">
        <div>
          <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
            Your Name / Role *
          </label>
          <input
            type="text"
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            placeholder="e.g. Nusrat Jahan (CR 29th)"
            className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
            Batch / Session (Optional)
          </label>
          <input
            type="text"
            value={contributorBatch}
            onChange={(e) => setContributorBatch(e.target.value)}
            placeholder="e.g. 2021-22 / 29th Batch"
            className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
            Email / Contact (Optional)
          </label>
          <input
            type="text"
            value={contributorContact}
            onChange={(e) => setContributorContact(e.target.value)}
            placeholder="e.g. student@sust.edu"
            className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
          />
        </div>
      </div>

      {/* 4. Dynamic Entity Form */}
      <div className="p-4 sm:p-5 rounded-lg bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 space-y-4 text-xs">
        {entityType === 'resource' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Resource Title *
                </label>
                <input
                  type="text"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Silviculture Midterm Question 2023"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Resource Category *
                </label>
                <select
                  value={resCategory}
                  onChange={(e) => setResCategory(e.target.value as ResourceCategory)}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                >
                  <option value="slides">Lecture Slides</option>
                  <option value="notes">Class Notes</option>
                  <option value="pyq">Exam Paper (PYQ)</option>
                  <option value="practical">Lab & Field Manual</option>
                  <option value="book">Reference Book</option>
                  <option value="syllabus">Syllabus / Outline</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                Google Drive or Resource URL *
              </label>
              <input
                type="url"
                value={resDriveUrl}
                onChange={(e) => setResDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... or direct PDF link"
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                required
              />
              {resDriveUrl.trim() && (
                <div className="mt-1 text-[11px] text-[#42684D] dark:text-[#BBC4A6]">
                  {parsedDrive.valid
                    ? `Detected Google Drive ID (${parsedDrive.isFolder ? 'Folder' : parsedDrive.fileType.toUpperCase()})`
                    : 'Direct external document URL'}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Academic Year
                </label>
                <select
                  value={String(resYear)}
                  onChange={(e) => {
                    const v = e.target.value;
                    handleResourceYearChange(v === 'msc' || v === 'general' ? v : (Number(v) as AcademicYear));
                  }}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                  <option value="msc">M.Sc.</option>
                  <option value="general">General Archive</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Semester
                </label>
                <select
                  value={String(resSemester)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setResSemester(v === 'all' ? 'all' : (Number(v) as 1 | 2));
                  }}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                >
                  <option value="1">Semester I</option>
                  <option value="2">Semester II</option>
                  <option value="all">Both / All</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Course
                </label>
                <select
                  value={resCourseCode}
                  onChange={(e) => setResCourseCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                >
                  {matchingCourses.length > 0 ? (
                    matchingCourses.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} · {c.title}
                      </option>
                    ))
                  ) : (
                    <option value="FES-GENERAL">FES-GENERAL · Departmental Archive</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Session / Year
                </label>
                <input
                  type="text"
                  value={resSessionYear}
                  onChange={(e) => setResSessionYear(e.target.value)}
                  placeholder="e.g. 2024-2025"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
              {resCategory === 'pyq' && (
                <div>
                  <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                    Exam Term
                  </label>
                  <select
                    value={resExamTerm}
                    onChange={(e) => setResExamTerm(e.target.value as 'midterm' | 'final' | 'quiz' | 'all')}
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  >
                    <option value="final">Semester Final</option>
                    <option value="midterm">Midterm</option>
                    <option value="quiz">Class Test / Quiz</option>
                    <option value="all">Combined</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                Description / Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={resDescription}
                onChange={(e) => setResDescription(e.target.value)}
                placeholder="Topic coverage, instructor name, or exam year details..."
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
              />
            </div>
          </div>
        )}

        {entityType === 'species' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Scientific Name *
                </label>
                <input
                  type="text"
                  value={spScientific}
                  onChange={(e) => setSpScientific(e.target.value)}
                  placeholder="e.g. Dipterocarpus turbinatus"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-scientific italic"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Common Name *
                </label>
                <input
                  type="text"
                  value={spCommon}
                  onChange={(e) => setSpCommon(e.target.value)}
                  placeholder="e.g. Garjan"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Bangla Name
                </label>
                <input
                  type="text"
                  value={spBangla}
                  onChange={(e) => setSpBangla(e.target.value)}
                  placeholder="e.g. তেলিয়া গর্জন"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Botanical Family
                </label>
                <input
                  type="text"
                  value={spFamily}
                  onChange={(e) => setSpFamily(e.target.value)}
                  placeholder="e.g. Dipterocarpaceae"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Forest Ecosystem
                </label>
                <select
                  value={spEcosystem}
                  onChange={(e) => setSpEcosystem(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                >
                  <option value="Hill Semi-Evergreen">Hill Semi-Evergreen</option>
                  <option value="Sal / Deciduous">Sal / Deciduous</option>
                  <option value="Mangroves">Mangroves</option>
                  <option value="Plains & Homestead">Plains & Homestead</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Conservation Status
                </label>
                <input
                  type="text"
                  value={spConservation}
                  onChange={(e) => setSpConservation(e.target.value)}
                  placeholder="Least Concern (LC)"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Habitat & Ecology
                </label>
                <input
                  type="text"
                  value={spHabitat}
                  onChange={(e) => setSpHabitat(e.target.value)}
                  placeholder="Moist semi-evergreen hill slopes..."
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Uses (Comma-separated)
                </label>
                <input
                  type="text"
                  value={spUses}
                  onChange={(e) => setSpUses(e.target.value)}
                  placeholder="Timber, Resin, Carbon Sequestration"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                Silvicultural Notes
              </label>
              <textarea
                rows={2}
                value={spNotes}
                onChange={(e) => setSpNotes(e.target.value)}
                placeholder="Phenology, regeneration characteristics, germination notes..."
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                Specimen Image URL (Optional)
              </label>
              <input
                type="url"
                value={spImageUrl}
                onChange={(e) => setSpImageUrl(e.target.value)}
                placeholder="https://... (Wikimedia / Herbarium photo URL)"
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
              />
            </div>
          </div>
        )}

        {(entityType === 'gallery' || entityType === 'student_photo') && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Photo Title *
                </label>
                <input
                  type="text"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="e.g. Lawachara Canopy Transect Survey"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={photoImageUrl}
                  onChange={(e) => setPhotoImageUrl(e.target.value)}
                  placeholder="https://... or Google Drive image link"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Location
                </label>
                <input
                  type="text"
                  value={photoLocation}
                  onChange={(e) => setPhotoLocation(e.target.value)}
                  placeholder="e.g. Lawachara National Park"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>

              {entityType === 'gallery' ? (
                <>
                  <div>
                    <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                      Album Category
                    </label>
                    <select
                      value={photoCategory}
                      onChange={(e) => setPhotoCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                    >
                      <option value="field-tour">Field Tour</option>
                      <option value="lab">Laboratory</option>
                      <option value="research">Field Research</option>
                      <option value="campus">Campus / Arboretum</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                      Year
                    </label>
                    <input
                      type="text"
                      value={photoYear}
                      onChange={(e) => setPhotoYear(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                      Capture Date
                    </label>
                    <input
                      type="date"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                      Linked Tree Species (Optional)
                    </label>
                    <select
                      value={photoSpeciesId}
                      onChange={(e) => setPhotoSpeciesId(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                    >
                      <option value="">General Field Observation</option>
                      {speciesList.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.commonName} ({sp.scientificName})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                Caption / Observation Context
              </label>
              <textarea
                rows={2}
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Describe ecological setting, species features, or fieldwork details..."
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
              />
            </div>
          </div>
        )}

        {entityType === 'thesis' && (
          <div className="space-y-3">
            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                Thesis / Monograph Title *
              </label>
              <input
                type="text"
                value={thTitle}
                onChange={(e) => setThTitle(e.target.value)}
                placeholder="e.g. Above-Ground Biomass Estimation in Sylhet Hill Forests"
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Author *
                </label>
                <input
                  type="text"
                  value={thAuthor}
                  onChange={(e) => setThAuthor(e.target.value)}
                  placeholder="Student author"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Supervisor
                </label>
                <input
                  type="text"
                  value={thSupervisor}
                  onChange={(e) => setThSupervisor(e.target.value)}
                  placeholder="Faculty supervisor"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Degree
                </label>
                <select
                  value={thDegree}
                  onChange={(e) => setThDegree(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                >
                  <option value="B.Sc. (Honours)">B.Sc. (Honours)</option>
                  <option value="M.Sc.">M.Sc.</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Year
                </label>
                <input
                  type="text"
                  value={thYear}
                  onChange={(e) => setThYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Research Area
                </label>
                <input
                  type="text"
                  value={thArea}
                  onChange={(e) => setThArea(e.target.value)}
                  placeholder="e.g. Forest Carbon & GIS"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Google Drive PDF URL (Optional)
                </label>
                <input
                  type="url"
                  value={thDriveUrl}
                  onChange={(e) => setThDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                Abstract
              </label>
              <textarea
                rows={3}
                value={thAbstract}
                onChange={(e) => setThAbstract(e.target.value)}
                placeholder="Brief summary of methodology and key ecological findings..."
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
              />
            </div>
          </div>
        )}

        {entityType === 'notice' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Notice Title *
                </label>
                <input
                  type="text"
                  value={notTitle}
                  onChange={(e) => setNotTitle(e.target.value)}
                  placeholder="e.g. Lab Assessment Reschedule — FES 211"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Notice Tag
                </label>
                <select
                  value={notTag}
                  onChange={(e) => setNotTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                >
                  <option value="new">New</option>
                  <option value="latest">Latest</option>
                  <option value="important">Important</option>
                  <option value="exam">Exam</option>
                  <option value="field-tour">Field Tour</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Date
                </label>
                <input
                  type="date"
                  value={notDate}
                  onChange={(e) => setNotDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Attachment Link (Optional)
                </label>
                <input
                  type="url"
                  value={notLink}
                  onChange={(e) => setNotLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Circular Scan Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={notImageUrl}
                  onChange={(e) => setNotImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                Notice Details *
              </label>
              <textarea
                rows={3}
                value={notBody}
                onChange={(e) => setNotBody(e.target.value)}
                placeholder="Full announcement details, venue, schedule..."
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                required
              />
            </div>
          </div>
        )}

        {entityType === 'quick_link' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Portal / Resource Title *
                </label>
                <input
                  type="text"
                  value={qlTitle}
                  onChange={(e) => setQlTitle(e.target.value)}
                  placeholder="e.g. 29th Batch Google Drive Repository"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Link Category
                </label>
                <select
                  value={qlCategory}
                  onChange={(e) =>
                    setQlCategory(e.target.value as 'portal' | 'drive' | 'syllabus' | 'form' | 'general')
                  }
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                >
                  <option value="drive">Google Drive</option>
                  <option value="portal">University Portal</option>
                  <option value="syllabus">Syllabus</option>
                  <option value="form">Submission Form</option>
                  <option value="general">General Research Link</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                Destination URL *
              </label>
              <input
                type="url"
                value={qlUrl}
                onChange={(e) => setQlUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                Description (Optional)
              </label>
              <input
                type="text"
                value={qlDescription}
                onChange={(e) => setQlDescription(e.target.value)}
                placeholder="Short summary of what this portal provides..."
                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/80 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
              />
            </div>
          </div>
        )}
      </div>

      {formError && (
        <div className="p-3.5 rounded-md bg-[#FEE2E2] dark:bg-[#7F1D1D]/55 border border-[#F87171]/70 text-[#991B1B] dark:text-[#FECACA] text-xs font-medium flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <span className="text-[11px] text-[#42684D] dark:text-[#BBC4A6]">
          Submitted items stay pending and are published only when approved in <strong>Manage</strong> by an administrator.
        </span>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] text-xs font-semibold transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submit for Admin Approval</span>
        </button>
      </div>
    </form>
  );
};
