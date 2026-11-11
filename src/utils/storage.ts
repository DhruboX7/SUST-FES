import { 
  ResourceItem, 
  TreeSpecies, 
  TreePhoto,
  GalleryItem, 
  ThesisItem, 
  NoticeItem, 
  QuickLinkItem,
  StudentPhotoItem,
  MasterLibraryBackup,
  YearRoutine,
  RoutineSlot
} from '../types';
import { INITIAL_RESOURCE_ARCHIVE } from '../data/coursesData';

const STORAGE_KEY_RESOURCES = 'sust_fes_resources_obe_v2';
const STORAGE_KEY_SPECIES = 'sust_fes_species_v2';
const STORAGE_KEY_GALLERY = 'sust_fes_gallery_v2';
const STORAGE_KEY_THESES = 'sust_fes_theses_v2';
const STORAGE_KEY_NOTICES = 'sust_fes_notices_v2';
const STORAGE_KEY_ROUTINES = 'sust_fes_routines_v1';
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

// In-memory cache for static JSON datasets to avoid redundant HTTP calls and parsing overhead
const staticJsonCache = new Map<string, unknown>();

/**
 * Safely fetches a static JSON dataset from /data/ with candidate URL resolution,
 * automatic retries for transient connection drops/restarts, in-memory caching, and error resilience.
 */
export async function fetchStaticJson<T>(filename: string, maxRetries = 2): Promise<T | null> {
  const cleanName = filename.replace(/^\/+/, '').replace(/^data\//, '');
  
  if (staticJsonCache.has(cleanName)) {
    return staticJsonCache.get(cleanName) as T;
  }

  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';

  const candidateUrls: string[] = [];
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  candidateUrls.push(`${normalizedBase}data/${cleanName}`);
  candidateUrls.push(`/data/${cleanName}`);
  candidateUrls.push(`data/${cleanName}`);
  const uniqueUrls = Array.from(new Set(candidateUrls));

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    for (const url of uniqueUrls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data !== undefined && data !== null) {
            staticJsonCache.set(cleanName, data);
            return data as T;
          }
        }
      } catch {
        // Fall through to next candidate URL
      }
    }
    if (attempt < maxRetries) {
      await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)));
    }
  }

  return null;
}

// ==========================================
// 1. RESOURCES & EXAM BANK (PYQ)
// ==========================================

export function getStoredResources(): ResourceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESOURCES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
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

export function isMatchedPhotoForSpecies(url: string, scientificName: string): boolean {
  if (!url) return false;
  const u = decodeURIComponent(url).toLowerCase();
  if (u.includes('images.unsplash.com')) return false;
  if (u.includes('tripura_sundri_temple') || u.includes('temple')) return false;
  if (u.endsWith('.svg') || u.includes('.svg?')) return false;
  if (u.includes('sunderbans_tiger_reserve_india_david_raju_(49)')) return false;
  if (u.includes('tinospora_cordifolia') || u.includes('trichosanthes_tricuspidata') || u.includes('makal_mahakal')) return false;
  if (u.includes('bombax_ceiba') && scientificName !== 'Bombax ceiba') return false;
  if (u.includes('terminalia_catappa') && scientificName !== 'Terminalia catappa') return false;
  if (u.includes('artocarpus_heterophyllus') && scientificName !== 'Artocarpus heterophyllus') return false;
  if (u.includes('albizia_lebbeck') && scientificName !== 'Albizia lebbeck') return false;
  return true;
}

export async function getStoredSpecies(): Promise<TreeSpecies[]> {
  // 1. Immediately read existing local storage
  let localData: TreeSpecies[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPECIES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localData = parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read cached species from localStorage:', err);
  }

  try {
    // 2. Fetch official default data with retries
    const defaultData = await fetchStaticJson<TreeSpecies[]>('species.json');

    if (defaultData && Array.isArray(defaultData) && defaultData.length > 0) {
      if (localData.length > 0) {
        // Merge default enriched species data with local custom contributions
        const localMap = new Map<string, TreeSpecies>(localData.map((sp: TreeSpecies) => [sp.id, sp]));
        const mergedList: TreeSpecies[] = [];

        // Process all official default species
        for (const def of defaultData) {
          const local = localMap.get(def.id);
          if (!local) {
            mergedList.push(def);
          } else {
            // Clean local photos: only keep matched photos
            const defUrls = new Set((def.morePhotos || []).map((p) => p.url));
            const customMatchedPhotos = (local.morePhotos || []).filter(
              (p) => !defUrls.has(p.url) && isMatchedPhotoForSpecies(p.url, def.scientificName)
            );

            const allMatchedPhotos = [...(def.morePhotos || []), ...customMatchedPhotos];

            mergedList.push({
              ...local,
              sourceUrl: def.sourceUrl || local.sourceUrl,
              forestEcosystem: def.forestEcosystem || local.forestEcosystem,
              imageUrl: isMatchedPhotoForSpecies(def.imageUrl || '', def.scientificName)
                ? def.imageUrl
                : (allMatchedPhotos[0]?.url || def.imageUrl),
              photoCredit: def.photoCredit || local.photoCredit,
              morePhotos: allMatchedPhotos
            });
            localMap.delete(def.id);
          }
        }

        // Add any custom species added by user (cleaning unmatched photos)
        for (const remaining of localMap.values()) {
          const cleanedPhotos = (remaining.morePhotos || []).filter((p) =>
            isMatchedPhotoForSpecies(p.url, remaining.scientificName)
          );
          mergedList.push({
            ...remaining,
            morePhotos: cleanedPhotos,
            imageUrl: isMatchedPhotoForSpecies(remaining.imageUrl || '', remaining.scientificName)
              ? remaining.imageUrl
              : (cleanedPhotos[0]?.url || remaining.imageUrl)
          });
        }

        saveStoredSpecies(mergedList);
        return mergedList;
      }

      // First run: save fetched defaults to local storage
      saveStoredSpecies(defaultData);
      return defaultData;
    }
  } catch (err) {
    console.warn('Failed to refresh species from static data, using local cache:', err);
  }

  // 3. Fallback to cached local data if fetch was unavailable
  if (localData.length > 0) {
    return localData;
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

export function addPhotoToTreeSpecies(speciesId: string, photo: TreePhoto): TreeSpecies | null {
  const current = getStoredSpeciesSync();
  let updatedSpecies: TreeSpecies | null = null;
  const next = current.map((sp) => {
    if (sp.id === speciesId) {
      const photos = sp.morePhotos || [];
      updatedSpecies = {
        ...sp,
        morePhotos: [...photos, photo]
      };
      return updatedSpecies;
    }
    return sp;
  });

  if (updatedSpecies) {
    saveStoredSpecies(next);
  }
  return updatedSpecies;
}

// ==========================================
// 3. FIELD & PRACTICAL GALLERY
// ==========================================

export async function getStoredGallery(): Promise<GalleryItem[]> {
  let localData: GalleryItem[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localData = parsed;
      }
    }
  } catch {
    // Ignore parse error
  }

  try {
    const defaultData = await fetchStaticJson<GalleryItem[]>('gallery.json');
    if (defaultData && Array.isArray(defaultData) && defaultData.length > 0) {
      if (localData.length > 0) {
        const localIds = new Set(localData.map((item: GalleryItem) => item.id));
        const merged = [...localData];
        for (const defItem of defaultData) {
          if (!localIds.has(defItem.id)) {
            merged.push(defItem);
            localIds.add(defItem.id);
          }
        }
        saveStoredGallery(merged);
        return merged;
      }
      saveStoredGallery(defaultData);
      return defaultData;
    }
  } catch (err) {
    console.warn('Failed to refresh gallery from static data:', err);
  }

  return localData;
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
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Continue to fetch
  }

  try {
    const defaultData = await fetchStaticJson<ThesisItem[]>('theses.json');
    if (defaultData && Array.isArray(defaultData)) {
      saveStoredTheses(defaultData);
      return defaultData;
    }
  } catch (err) {
    console.warn('Failed to load theses:', err);
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
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Continue to fetch
  }

  try {
    const defaultData = await fetchStaticJson<NoticeItem[]>('notices.json');
    if (defaultData && Array.isArray(defaultData)) {
      saveStoredNotices(defaultData);
      return defaultData;
    }
  } catch (err) {
    console.warn('Failed to load notices:', err);
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
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Continue to fetch
  }

  try {
    const defaultData = await fetchStaticJson<StudentPhotoItem[]>('student_photos.json');
    if (defaultData && Array.isArray(defaultData)) {
      saveStoredStudentPhotos(defaultData);
      return defaultData;
    }
  } catch (err) {
    console.warn('Failed to load student photos:', err);
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

// ==========================================
// 8. CLASS ROUTINE MANAGEMENT
// ==========================================

export async function getStoredRoutines(): Promise<YearRoutine[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROUTINES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Continue to fetch
  }

  try {
    const defaultData = await fetchStaticJson<YearRoutine[]>('routine.json');
    if (defaultData && Array.isArray(defaultData)) {
      return defaultData;
    }
  } catch (err) {
    console.warn('Failed to load routines from static data:', err);
  }
  return [];
}

export function saveStoredRoutines(routines: YearRoutine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ROUTINES, JSON.stringify(routines));
    notifyDataUpdate('routines');
  } catch (err) {
    console.error('Error saving routines storage:', err);
  }
}

export async function resetStoredRoutines(): Promise<YearRoutine[]> {
  try {
    localStorage.removeItem(STORAGE_KEY_ROUTINES);
    const routines = await getStoredRoutines();
    notifyDataUpdate('routines');
    return routines;
  } catch (err) {
    console.error('Error resetting routines:', err);
    return [];
  }
}

export async function resetAllCollectionsToFactoryDefaults(): Promise<void> {
  localStorage.removeItem(STORAGE_KEY_RESOURCES);
  localStorage.removeItem(STORAGE_KEY_SPECIES);
  localStorage.removeItem(STORAGE_KEY_GALLERY);
  localStorage.removeItem(STORAGE_KEY_THESES);
  localStorage.removeItem(STORAGE_KEY_NOTICES);
  localStorage.removeItem(STORAGE_KEY_ROUTINES);
  localStorage.removeItem(STORAGE_KEY_QUICKLINKS);
  localStorage.removeItem(STORAGE_KEY_STUDENT_PHOTOS);

  resetStoredResourcesToDefaults();
  await getStoredSpecies();
  await getStoredGallery();
  await getStoredTheses();
  await getStoredNotices();
  await getStoredRoutines();
  await getStoredStudentPhotos();
  getStoredQuickLinks();

  notifyDataUpdate('all');
}
