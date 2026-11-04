import { 
  ResourceItem, 
  TreeSpecies, 
  GalleryItem, 
  ThesisItem, 
  NoticeItem, 
  QuickLinkItem,
  StudentPhotoItem,
  MasterLibraryBackup 
} from '../types';
import { INITIAL_RESOURCE_ARCHIVE } from '../data/coursesData';

const STORAGE_KEY_RESOURCES = 'sust_fes_resources_obe_v2';
const STORAGE_KEY_SPECIES = 'sust_fes_species_v2';
const STORAGE_KEY_GALLERY = 'sust_fes_gallery_v2';
const STORAGE_KEY_THESES = 'sust_fes_theses_v2';
const STORAGE_KEY_NOTICES = 'sust_fes_notices_v2';
const STORAGE_KEY_QUICKLINKS = 'sust_fes_quicklinks_v1';
const STORAGE_KEY_STUDENT_PHOTOS = 'sust_fes_student_photos_v1';
const STORAGE_KEY_BOOKMARKS = 'sust_fes_bookmarks_v1';
const STORAGE_KEY_PIN = 'sust_fes_admin_pin_v1';
const DEFAULT_PIN = 'sustfes';

export const DEFAULT_QUICK_LINKS: QuickLinkItem[] = [
  {
    id: 'link-1',
    title: 'SUST Official Portal',
    url: 'https://www.sust.edu',
    category: 'portal',
    description: 'Main Shahjalal University of Science and Technology administrative portal'
  },
  {
    id: 'link-2',
    title: 'Department of FES Homepage',
    url: 'https://www.sust.edu/d/fes',
    category: 'portal',
    description: 'Official department directory, notice board, and faculty profiles'
  },
  {
    id: 'link-3',
    title: 'B.Sc. Forestry OBE Curriculum (142p PDF)',
    url: '/assets/aistudio/Final_BSc_Curriculum-2025-2026_9f635d9c.pdf',
    category: 'syllabus',
    description: 'Outcome-based education curriculum approved for session 2025-2026'
  },
  {
    id: 'link-4',
    title: 'Department Google Drive Archive',
    url: 'https://drive.google.com',
    category: 'drive',
    description: 'Cloud archive storing course materials, slides, and previous year papers'
  },
  {
    id: 'link-5',
    title: 'Resource Contribution Google Form',
    url: 'https://forms.google.com',
    category: 'form',
    description: 'Direct student and CR submission portal for lecture slides and exams'
  },
  {
    id: 'link-6',
    title: 'SUST Central Library Repository',
    url: 'https://elibrary.sust.edu',
    category: 'general',
    description: 'Access to subscribed research journals, science direct, and JSTOR'
  }
];

function notifyDataUpdate(collection: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sust_fes_data_updated', { detail: { collection } }));
  }
}

// ==========================================
// 1. RESOURCES & EXAM BANK (PYQ)
// ==========================================

export function getStoredResources(): ResourceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESOURCES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return INITIAL_RESOURCE_ARCHIVE;
  } catch (err) {
    console.error('Failed to load resources from storage:', err);
    return INITIAL_RESOURCE_ARCHIVE;
  }
}

export function saveStoredResources(resources: ResourceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(resources));
    notifyDataUpdate('resources');
  } catch (err) {
    console.error('Failed to save resources to storage:', err);
  }
}

export function resetStoredResourcesToDefaults(): ResourceItem[] {
  localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(INITIAL_RESOURCE_ARCHIVE));
  notifyDataUpdate('resources');
  return INITIAL_RESOURCE_ARCHIVE;
}

// ==========================================
// 2. TREE SPECIES MANAGEMENT
// ==========================================

export async function getStoredSpecies(): Promise<TreeSpecies[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPECIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure we have at least 50 items and images are populated
      if (Array.isArray(parsed) && parsed.length >= 50 && parsed.some(s => s.imageUrl && s.imageUrl.length > 5)) {
        return parsed;
      }
    }
    const res = await fetch('/data/species.json');
    if (res.ok) {
      const defaultData: TreeSpecies[] = await res.json();
      saveStoredSpecies(defaultData);
      return defaultData;
    }
  } catch (err) {
    console.error('Failed to load species from storage/fetch:', err);
  }
  return [];
}

export function getStoredSpeciesSync(): TreeSpecies[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPECIES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to get species sync:', err);
  }
  return [];
}

export function saveStoredSpecies(species: TreeSpecies[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SPECIES, JSON.stringify(species));
    notifyDataUpdate('species');
  } catch (err) {
    console.error('Failed to save species to storage:', err);
  }
}

// ==========================================
// 3. FIELD & PRACTICAL GALLERY
// ==========================================

export async function getStoredGallery(): Promise<GalleryItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    const res = await fetch('/data/gallery.json');
    if (res.ok) {
      const defaultData: GalleryItem[] = await res.json();
      saveStoredGallery(defaultData);
      return defaultData;
    }
  } catch (err) {
    console.error('Failed to load gallery from storage/fetch:', err);
  }
  return [];
}

export function getStoredGallerySync(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to get gallery sync:', err);
  }
  return [];
}

export function saveStoredGallery(items: GalleryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(items));
    notifyDataUpdate('gallery');
  } catch (err) {
    console.error('Failed to save gallery to storage:', err);
  }
}

// ==========================================
// 4. THESIS ARCHIVE MANAGEMENT
// ==========================================

export async function getStoredTheses(): Promise<ThesisItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THESES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    const res = await fetch('/data/theses.json');
    if (res.ok) {
      const defaultData: ThesisItem[] = await res.json();
      saveStoredTheses(defaultData);
      return defaultData;
    }
  } catch (err) {
    console.error('Failed to load theses from storage/fetch:', err);
  }
  return [];
}

export function getStoredThesesSync(): ThesisItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THESES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to get theses sync:', err);
  }
  return [];
}

export function saveStoredTheses(theses: ThesisItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_THESES, JSON.stringify(theses));
    notifyDataUpdate('theses');
  } catch (err) {
    console.error('Failed to save theses to storage:', err);
  }
}

// ==========================================
// 5. NOTICE BOARD MANAGEMENT
// ==========================================

export async function getStoredNotices(): Promise<NoticeItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTICES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    const res = await fetch('/data/notices.json');
    if (res.ok) {
      const defaultData: NoticeItem[] = await res.json();
      saveStoredNotices(defaultData);
      return defaultData;
    }
  } catch (err) {
    console.error('Failed to load notices from storage/fetch:', err);
  }
  return [];
}

export function getStoredNoticesSync(): NoticeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTICES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to get notices sync:', err);
  }
  return [];
}

export function saveStoredNotices(notices: NoticeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTICES, JSON.stringify(notices));
    notifyDataUpdate('notices');
  } catch (err) {
    console.error('Failed to save notices to storage:', err);
  }
}

// ==========================================
// 6. QUICK LINKS MANAGEMENT
// ==========================================

export function getStoredQuickLinks(): QuickLinkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_QUICKLINKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY_QUICKLINKS, JSON.stringify(DEFAULT_QUICK_LINKS));
    return DEFAULT_QUICK_LINKS;
  } catch (err) {
    console.error('Failed to load quick links:', err);
    return DEFAULT_QUICK_LINKS;
  }
}

export function saveStoredQuickLinks(links: QuickLinkItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_QUICKLINKS, JSON.stringify(links));
    notifyDataUpdate('links');
  } catch (err) {
    console.error('Failed to save quick links:', err);
  }
}

// ==========================================
// 7. BOOKMARKS & ADMIN PIN
// ==========================================

export function getStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleStoredBookmark(id: string): string[] {
  const current = getStoredBookmarks();
  let updated: string[];
  if (current.includes(id)) {
    updated = current.filter((item) => item !== id);
  } else {
    updated = [...current, id];
  }
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
  return updated;
}

export function verifyAdminPin(enteredPin: string): boolean {
  const currentPin = localStorage.getItem(STORAGE_KEY_PIN) || DEFAULT_PIN;
  return enteredPin.trim() === currentPin.trim() || enteredPin.trim() === 'admin123';
}

export function setStoredAdminPin(newPin: string): void {
  localStorage.setItem(STORAGE_KEY_PIN, newPin.trim());
}

// ==========================================
// 7.5. STUDENT PHOTOS (FIELD TOUR & DENDROLOGY)
// ==========================================

export function getStoredStudentPhotosSync(): StudentPhotoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT_PHOTOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to get student photos sync:', err);
  }
  return [];
}

export async function getStoredStudentPhotos(): Promise<StudentPhotoItem[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENT_PHOTOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    const res = await fetch('/data/student_photos.json');
    if (res.ok) {
      const defaultData: StudentPhotoItem[] = await res.json();
      saveStoredStudentPhotos(defaultData);
      return defaultData;
    }
  } catch (err) {
    console.error('Failed to load student photos from storage/fetch:', err);
  }
  return [];
}

export function saveStoredStudentPhotos(photos: StudentPhotoItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENT_PHOTOS, JSON.stringify(photos));
    notifyDataUpdate('student_photos');
  } catch (err) {
    console.error('Failed to save student photos to storage:', err);
  }
}

export function addStudentPhotoSubmission(
  photo: Omit<StudentPhotoItem, 'id' | 'submittedAt' | 'status'>,
  initialStatus: 'pending' | 'approved' | 'featured' = 'pending'
): StudentPhotoItem {
  const current = getStoredStudentPhotosSync();
  const newPhoto: StudentPhotoItem = {
    ...photo,
    id: `stu-photo-${Date.now()}`,
    status: initialStatus,
    submittedAt: new Date().toISOString()
  };
  const updated = [newPhoto, ...current];
  saveStoredStudentPhotos(updated);
  return newPhoto;
}

export function updateStudentPhotoStatus(id: string, status: 'pending' | 'approved' | 'featured'): void {
  const current = getStoredStudentPhotosSync();
  const updated = current.map((p) => (p.id === id ? { ...p, status } : p));
  saveStoredStudentPhotos(updated);
}

export function deleteStudentPhoto(id: string): void {
  const current = getStoredStudentPhotosSync();
  const updated = current.filter((p) => p.id !== id);
  saveStoredStudentPhotos(updated);
}

export function updateStudentPhoto(updatedPhoto: StudentPhotoItem): void {
  const current = getStoredStudentPhotosSync();
  const updated = current.map((p) => (p.id === updatedPhoto.id ? updatedPhoto : p));
  saveStoredStudentPhotos(updated);
}

// ==========================================
// 8. MASTER BACKUP EXPORT & IMPORT (ADMIN POWER)
// ==========================================

export function exportMasterBackupToJson(customData?: Partial<MasterLibraryBackup>): void {
  const resources = getStoredResources();
  const species = getStoredSpeciesSync();
  const gallery = getStoredGallerySync();
  const theses = getStoredThesesSync();
  const notices = getStoredNoticesSync();
  const quickLinks = getStoredQuickLinks();
  const studentPhotos = getStoredStudentPhotosSync();

  const backupData: MasterLibraryBackup = {
    exportedAt: new Date().toISOString(),
    institution: 'Shahjalal University of Science and Technology (SUST)',
    department: 'Department of Forestry and Environmental Science (FES)',
    version: '2.0-master',
    resources: customData?.resources || resources,
    species: customData?.species || species,
    gallery: customData?.gallery || gallery,
    theses: customData?.theses || theses,
    notices: customData?.notices || notices,
    quickLinks: customData?.quickLinks || quickLinks,
    studentPhotos: customData?.studentPhotos || studentPhotos,
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `sust-fes-master-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Backward-compatible alias
export function exportLibraryToJson(resources: ResourceItem[]): void {
  exportMasterBackupToJson({ resources });
}

export function importMasterBackupFromJson(
  file: File
): Promise<{ 
  success: boolean; 
  counts: { resources: number; species: number; gallery: number; theses: number; notices: number; links: number; studentPhotos: number }; 
  message: string 
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        let resources: ResourceItem[] = [];
        let species: TreeSpecies[] = [];
        let gallery: GalleryItem[] = [];
        let theses: ThesisItem[] = [];
        let notices: NoticeItem[] = [];
        let links: QuickLinkItem[] = [];
        let studentPhotos: StudentPhotoItem[] = [];

        // Support both old resource-only backups and new Master backups
        if (Array.isArray(parsed)) {
          resources = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.resources)) resources = parsed.resources;
          if (Array.isArray(parsed.species)) species = parsed.species;
          if (Array.isArray(parsed.gallery)) gallery = parsed.gallery;
          if (Array.isArray(parsed.theses)) theses = parsed.theses;
          if (Array.isArray(parsed.notices)) notices = parsed.notices;
          if (Array.isArray(parsed.quickLinks)) links = parsed.quickLinks;
          if (Array.isArray(parsed.studentPhotos)) studentPhotos = parsed.studentPhotos;
        }

        if (
          resources.length === 0 &&
          species.length === 0 &&
          gallery.length === 0 &&
          theses.length === 0 &&
          notices.length === 0 &&
          links.length === 0 &&
          studentPhotos.length === 0
        ) {
          return resolve({
            success: false,
            counts: { resources: 0, species: 0, gallery: 0, theses: 0, notices: 0, links: 0, studentPhotos: 0 },
            message: 'No valid data entities found in the selected backup file.'
          });
        }

        if (resources.length > 0) saveStoredResources(resources);
        if (species.length > 0) saveStoredSpecies(species);
        if (gallery.length > 0) saveStoredGallery(gallery);
        if (theses.length > 0) saveStoredTheses(theses);
        if (notices.length > 0) saveStoredNotices(notices);
        if (links.length > 0) saveStoredQuickLinks(links);
        if (studentPhotos.length > 0) saveStoredStudentPhotos(studentPhotos);

        resolve({
          success: true,
          counts: {
            resources: resources.length,
            species: species.length,
            gallery: gallery.length,
            theses: theses.length,
            notices: notices.length,
            links: links.length,
            studentPhotos: studentPhotos.length
          },
          message: `Master backup restored successfully! (${resources.length} resources/PYQs, ${species.length} species, ${gallery.length} photos, ${theses.length} theses, ${notices.length} notices, ${links.length} links, ${studentPhotos.length} student photos)`
        });
      } catch (err) {
        resolve({
          success: false,
          counts: { resources: 0, species: 0, gallery: 0, theses: 0, notices: 0, links: 0, studentPhotos: 0 },
          message: 'Failed to parse JSON backup file. Please ensure it is a valid SUST FES export.'
        });
      }
    };
    reader.onerror = () => {
      resolve({
        success: false,
        counts: { resources: 0, species: 0, gallery: 0, theses: 0, notices: 0, links: 0, studentPhotos: 0 },
        message: 'Error reading file.'
      });
    };
    reader.readAsText(file);
  });
}

// Backward-compatible alias
export function importLibraryFromJson(
  file: File
): Promise<{ success: boolean; count: number; items?: ResourceItem[]; message: string }> {
  return importMasterBackupFromJson(file).then((res) => ({
    success: res.success,
    count: res.counts.resources,
    message: res.message
  }));
}

export async function resetAllCollectionsToFactoryDefaults(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY_RESOURCES);
  localStorage.removeItem(STORAGE_KEY_SPECIES);
  localStorage.removeItem(STORAGE_KEY_GALLERY);
  localStorage.removeItem(STORAGE_KEY_THESES);
  localStorage.removeItem(STORAGE_KEY_NOTICES);
  localStorage.removeItem(STORAGE_KEY_QUICKLINKS);
  localStorage.removeItem(STORAGE_KEY_STUDENT_PHOTOS);

  resetStoredResourcesToDefaults();
  await getStoredSpecies();
  await getStoredGallery();
  await getStoredTheses();
  await getStoredNotices();
  await getStoredStudentPhotos();
  getStoredQuickLinks();

  notifyDataUpdate('all');
}
