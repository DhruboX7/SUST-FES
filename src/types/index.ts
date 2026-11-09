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
  code: string;         // e.g. "FES 08211121"
  shortCode?: string;   // e.g. "FES 111"
  title: string;        // e.g. "Forest Botany"
  year: AcademicYear;
  semester: 1 | 2 | 'both';
  credits: number;
  description: string;
  category: 'core' | 'support' | 'elective' | 'lab';
  contents?: string[];
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

export interface TreePhoto {
  url: string;
  caption?: string;
  tag?: 'habit' | 'leaf' | 'bark' | 'flower' | 'fruit' | 'seed' | 'general';
  credit?: string;
  sourceUrl?: string;
}

export interface TreeSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  banglaName: string;
  family: string;
  uses: string[];
  habitat: string;
  conservationStatus: string;
  distribution: string;
  silviculturalNotes: string;
  imageUrl?: string;
  photoCredit?: string;
  floraUrl?: string;
  sourceUrl?: string;
  forestEcosystem?: string;
  morePhotos?: TreePhoto[];
  verifiedAt?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption: string;
  location: string;
  year: string;
  category: 'field-tour' | 'lab' | 'research' | 'campus' | string;
  imageUrl: string;
  photographer?: string;
}

export interface ThesisItem {
  id: string;
  title: string;
  author: string;
  supervisor: string;
  degree: 'B.Sc. (Honours)' | 'M.Sc.' | string;
  year: string;
  researchArea: string;
  abstract: string;
  driveUrl?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  body: string;
  imageUrl?: string;
  attachmentUrl?: string;
  link?: string;
  pinned?: boolean;
}

export interface QuickLinkItem {
  id: string;
  title: string;
  url: string;
  category: 'drive' | 'syllabus' | 'portal' | 'form' | 'general';
  description?: string;
}

export interface StudentPhotoItem {
  id: string;
  studentName: string;
  studentBatch?: string;
  studentRegNo?: string;
  title: string;
  caption: string;
  location: string;
  date: string;
  imageUrl: string;
  treeSpeciesId?: string;
  speciesScientificName?: string;
  status: 'pending' | 'approved' | 'featured';
  submittedAt: string;
}

export interface MasterLibraryBackup {
  exportedAt: string;
  institution: string;
  department: string;
  version: string;
  resources: ResourceItem[];
  species: TreeSpecies[];
  gallery: GalleryItem[];
  theses: ThesisItem[];
  notices: NoticeItem[];
  quickLinks: QuickLinkItem[];
  studentPhotos?: StudentPhotoItem[];
}

export interface BotanyAiResult {
  scientificName: string;
  commonName: string;
  banglaName: string;
  family: string;
  uses: string[];
  habitat: string;
  conservationStatus: string;
  distribution: string;
  silviculturalNotes: string;
  confidence: number;
  taxonomyNotes?: string;
  isNomenclatureValid: boolean;
}

export interface RoutineSlot {
  id?: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | string;
  time: string;
  courseCode: string;
  courseTitle: string;
  room: string;
  teacher: string;
  batch?: string;
  notes?: string;
}

export interface YearRoutine {
  year: number;
  semester: number;
  schedule: RoutineSlot[];
}

export type RoutineItem = YearRoutine;
