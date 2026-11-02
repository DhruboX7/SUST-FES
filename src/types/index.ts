export type AcademicYear = 1 | 2 | 3 | 4 | 'msc' | 'general';
export type AcademicSemester = 1 | 2 | 'all';

export type ResourceCategory = 
  | 'slides'
  | 'notes'
  | 'pyq'
  | 'practical'
  | 'book'
  | 'syllabus';

export type FileType = 'pdf' | 'doc' | 'ppt' | 'sheet' | 'folder' | 'link';

export interface Course {
  id: string;
  code: string;         // e.g. "FES 111"
  title: string;        // e.g. "Forest Botany"
  year: AcademicYear;
  semester: 1 | 2 | 'both';
  credits: number;
  description: string;
  category: 'core' | 'support' | 'elective' | 'lab';
}

export interface ResourceItem {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  year: AcademicYear;
  semester: 1 | 2 | 'all';
  category: ResourceCategory;
  driveUrl: string;
  fileId: string;
  fileType: FileType;
  previewUrl: string;
  downloadUrl: string;
  sessionYear?: string;     // e.g., "2023-2024", "2022-2023", "2020"
  authorOrTeacher?: string; // e.g., "Dr. A. Rahman", "CR 28th Batch", "Dept. Archive"
  description?: string;
  fileSize?: string;        // e.g., "4.8 MB", "12 slides"
  examTerm?: 'midterm' | 'final' | 'quiz' | 'all';
  isFeatured?: boolean;
  createdAt: string;
  path?: string;            // Directory path breadcrumb e.g. "Google Drive / 2nd Year / Sem 1 / FES 211 Silviculture / Slides"
  keywords?: string[];      // Scanned keywords e.g. ["Silviculture", "Regeneration", "Thinning"]
  scannedSnippet?: string;  // Scanned text excerpt containing keywords
}

export interface DriveParseResult {
  valid: boolean;
  fileId: string;
  fileType: FileType;
  previewUrl: string;
  downloadUrl: string;
  isFolder: boolean;
  errorMessage?: string;
}

export type ViewTab = 'catalog' | 'pyq' | 'syllabus' | 'progress' | 'bookmarks' | 'about' | 'manage';

export interface SyllabusProgress {
  completedCourseIds: string[];
  completedTopicKeys: { [courseId: string]: number[] };
  lastUpdated: string;
}
