export type CoverType = 'Lab Report' | 'Assignment' | 'Field Report' | 'Term Paper';

export type CoverColorMode = 'default' | 'signature' | 'monochrome';

export type CoverDesignId =
  | 'white-sust-signature'
  | 'classic-academic'
  | 'forestry-botanical'
  | 'emerald-banner'
  | 'swiss-minimal'
  | 'royal-herbarium'
  | 'botanical-ribbon'
  | 'navy-gold-formal'
  | 'minimal-studio';

export interface CoverDesignOption {
  id: CoverDesignId;
  title: string;
  subtitle: string;
  badge: string;
  swatchPrimary: string;
  swatchAccent: string;
  swatchPaper: string;
}

export const COVER_DESIGNS: CoverDesignOption[] = [
  {
    id: 'white-sust-signature',
    title: 'White Page · SUST Logo',
    subtitle: 'Pure crisp white A4 sheet with SUST crest & our FES signature forest palette',
    badge: 'White + Logo',
    swatchPrimary: '#19382B',
    swatchAccent: '#987453',
    swatchPaper: '#FFFFFF',
  },
  {
    id: 'classic-academic',
    title: 'Classic SUST Academic',
    subtitle: 'Pure white formal A4 sheet with bordered course box & serif typography',
    badge: 'Standard',
    swatchPrimary: '#0F172A',
    swatchAccent: '#42684D',
    swatchPaper: '#FFFFFF',
  },
  {
    id: 'forestry-botanical',
    title: 'FES Botanical Frame',
    subtitle: 'Signature Forest Ink corner frames with subtle botanical leaf accents',
    badge: 'FES Signature',
    swatchPrimary: '#19382B',
    swatchAccent: '#987453',
    swatchPaper: '#FCFBF7',
  },
  {
    id: 'emerald-banner',
    title: 'Canopy Masthead Banner',
    subtitle: 'Full-width deep forest masthead with warm earth trim & crest medallion',
    badge: 'Editorial',
    swatchPrimary: '#19382B',
    swatchAccent: '#BBC4A6',
    swatchPaper: '#FFFFFF',
  },
  {
    id: 'swiss-minimal',
    title: 'Swiss Double-Frame Grid',
    subtitle: 'Crisp architectural monochrome double frame tuned for laser printing',
    badge: 'B&W Print',
    swatchPrimary: '#111827',
    swatchAccent: '#6B7280',
    swatchPaper: '#FFFFFF',
  },
  {
    id: 'royal-herbarium',
    title: 'Heritage Crest & Plaque',
    subtitle: 'Warm ivory paper with corner brackets, seal header & framed plaque',
    badge: 'Formal',
    swatchPrimary: '#5C1E26',
    swatchAccent: '#987453',
    swatchPaper: '#FAF8F2',
  },
  {
    id: 'botanical-ribbon',
    title: 'Editorial Margin Ribbon',
    subtitle: 'Vertical canopy-moss spine stripe with clean modern left-aligned blocks',
    badge: 'Modern',
    swatchPrimary: '#19382B',
    swatchAccent: '#8A9C74',
    swatchPaper: '#FFFFFF',
  },
  {
    id: 'navy-gold-formal',
    title: 'Royal Navy & Gold',
    subtitle: 'Traditional university navy and muted gold double plaque presentation',
    badge: 'Classic',
    swatchPrimary: '#0F2942',
    swatchAccent: '#A67C37',
    swatchPaper: '#FFFFFF',
  },
  {
    id: 'minimal-studio',
    title: 'Minimalist Monograph',
    subtitle: 'Airy thesis-inspired layout with hairline dividers and generous whitespace',
    badge: 'Clean',
    swatchPrimary: '#19382B',
    swatchAccent: '#42684D',
    swatchPaper: '#FFFFFF',
  },
];

export interface CoverFormData {
  designId: CoverDesignId;
  coverType: CoverType;
  universityName: string;
  department: string;
  courseCode: string;
  courseTitle: string;
  // Assignment / Field Report / Term Paper fields
  topicTitle: string;
  topicDate: string;
  submissionDate: string;
  // Lab Report fields
  experimentNo: string;
  experimentName: string;
  experimentDate: string;
  reportSubmissionDate: string;
  // Submitted To
  teacherName: string;
  teacherDesignation: string;
  teacherDepartment: string;
  teacherUniversity: string;
  // Optional 2nd Course Teacher
  hasSecondTeacher?: boolean;
  teacher2Name?: string;
  teacher2Designation?: string;
  teacher2Department?: string;
  teacher2University?: string;
  // Submitted By
  studentName: string;
  registrationNo: string;
  batch?: string;
  group: string;
  semester: string;
  session: string;
  studentDepartment?: string;
  // Presentation & PDF Options
  showLogo: boolean;
  monochromePrint: boolean;
  whitePage?: boolean;
  colorMode?: CoverColorMode;
}
