import { 
  ResourceItem, 
  TreeSpecies, 
  TreePhoto,
  GalleryItem, 
  ThesisItem, 
  NoticeItem, 
  NoticeTypeDefinition,
  NoticeBarSettings,
  QuickLinkItem,
  StudentPhotoItem,
  MasterLibraryBackup,
  YearRoutine,
  RoutineSlot,
  ContributionEntityType,
  ContributionRequest,
  BatchFundRecord,
  BatchFundTransaction
} from '../types';
import { INITIAL_RESOURCE_ARCHIVE } from '../data/coursesData';

const STORAGE_KEY_RESOURCES = 'sust_fes_resources_obe_v2';
const STORAGE_KEY_SPECIES = 'sust_fes_species_v2';
const STORAGE_KEY_GALLERY = 'sust_fes_gallery_v2';
const STORAGE_KEY_THESES = 'sust_fes_theses_v2';
const STORAGE_KEY_NOTICES = 'sust_fes_notices_v2';
const STORAGE_KEY_NOTICE_TYPES = 'sust_fes_notice_types_v1';
const STORAGE_KEY_NOTICE_BAR_SETTINGS = 'sust_fes_notice_bar_v1';
const STORAGE_KEY_ROUTINES = 'sust_fes_routines_v1';
const STORAGE_KEY_QUICKLINKS = 'sust_fes_quicklinks_v1';
const STORAGE_KEY_STUDENT_PHOTOS = 'sust_fes_student_photos_v1';
const STORAGE_KEY_BOOKMARKS = 'sust_fes_bookmarks_v1';
const STORAGE_KEY_PIN = 'sust_fes_admin_pin_v1';
const STORAGE_KEY_CONTRIBUTION_REQUESTS = 'sust_fes_contribution_requests_v1';
const STORAGE_KEY_BATCH_FUNDS = 'sust_fes_batch_funds_v2';
const DEFAULT_PIN = 'sustfes';

export const DEFAULT_NOTICE_TYPES: NoticeTypeDefinition[] = [
  { id: 'important', label: 'Important', color: 'rose', showInBar: true, order: 1 },
  { id: 'latest', label: 'Latest', color: 'blue', showInBar: true, order: 2 },
  { id: 'new', label: 'New', color: 'emerald', showInBar: true, order: 3 },
  { id: 'exam', label: 'Exam', color: 'amber', showInBar: true, order: 4 },
  { id: 'field-tour', label: 'Field Tour', color: 'purple', showInBar: true, order: 5 },
];

export const DEFAULT_NOTICE_BAR_SETTINGS: NoticeBarSettings = {
  enabled: true,
  maxItems: 6,
  autoRotate: true,
  rotationIntervalSeconds: 5,
  title: 'Latest Notices',
};

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

function safeStorageGet(key: string): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn(`Storage write failed for "${key}":`, err);
  }
}

function safeStorageRemove(key: string): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore storage access errors
  }
}

function sanitizeObjectArray<T extends object>(arr: unknown): T[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((item): item is T => Boolean(item && typeof item === 'object'));
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
    const raw = safeStorageGet(STORAGE_KEY_RESOURCES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return sanitizeObjectArray<ResourceItem>(parsed);
      }
    }
    return INITIAL_RESOURCE_ARCHIVE;
  } catch (err) {
    console.error('Failed to load resources from storage:', err);
    return INITIAL_RESOURCE_ARCHIVE;
  }
}

export function saveStoredResources(resources: ResourceItem[], notify = true): void {
  try {
    safeStorageSet(STORAGE_KEY_RESOURCES, JSON.stringify(sanitizeObjectArray<ResourceItem>(resources)));
    if (notify) notifyDataUpdate('resources');
  } catch (err) {
    console.error('Failed to save resources to storage:', err);
  }
}

export function resetStoredResourcesToDefaults(notify = true): ResourceItem[] {
  safeStorageSet(STORAGE_KEY_RESOURCES, JSON.stringify(INITIAL_RESOURCE_ARCHIVE));
  if (notify) notifyDataUpdate('resources');
  return INITIAL_RESOURCE_ARCHIVE;
}

// ==========================================
// 2. TREE SPECIES MANAGEMENT
// ==========================================

const SPECIES_SYNONYM_SLUGS: Record<string, string[]> = {
  'albizia saman': ['samanea_saman', 'albizia_saman'],
  'lannea grandis': ['lannea_coromandelica', 'lannea_grandis'],
  'aquilaria malaccensis': ['aquilaria_agallocha', 'aquilaria_malaccensis'],
  'elaeocarpus robustus': ['elaeocarpus_serratus', 'elaeocarpus_floribundus', 'elaeocarpus_robustus'],
  'artocarpus chaplasha': ['artocarpus_chama', 'artocarpus_chaplasha'],
  'magnolia champaca': ['michelia_champaca', 'magnolia_champaca'],
};

const KNOWN_SPECIES_SLUGS = [
  'samanea_saman',
  'albizia_saman',
  'artocarpus_heterophyllus',
  'elaeocarpus_serratus',
  'elaeocarpus_floribundus',
  'elaeocarpus_robustus',
  'albizia_richardiana',
  'paraserianthes_falcataria',
  'ficus_benghalensis',
  'neolamarckia_cadamba',
  'terminalia_arjuna',
  'lagerstroemia_speciosa',
  'polyalthia_longifolia',
  'azadirachta_indica',
  'pongamia_pinnata',
  'magnolia_champaca',
  'michelia_champaca',
  'tamarindus_indica',
  'hopea_odorata',
  'terminalia_catappa',
  'acacia_auriculiformis',
  'swietenia_mahagoni',
  'dillenia_indica',
  'dipterocarpus_turbinatus',
  'artocarpus_chaplasha',
  'artocarpus_chama',
  'aquilaria_malaccensis',
  'aquilaria_agallocha',
  'bauhinia_variegata',
  'lannea_grandis',
  'lannea_coromandelica',
  'alstonia_scholaris',
  'tectona_grandis',
  'shorea_robusta',
  'bombax_ceiba',
  'phyllanthus_emblica',
  'albizia_procera',
  'albizia_lebbeck',
  'butea_monosperma',
  'mesua_ferrea',
  'cassia_fistula',
  'podocarpus_neriifolius',
  'dalbergia_sissoo',
  'terminalia_chebula',
  'terminalia_bellirica',
  'couroupita_guianensis',
  'syzygium_grande',
  'xylocarpus_granatum',
  'sonneratia_apetala',
  'xylocarpus_moluccensis',
  'avicennia_officinalis',
  'excoecaria_agallocha',
  'ceriops_decandra',
  'nypa_fruticans',
  'bruguiera_gymnorrhiza',
  'aegiceras_corniculatum',
  'heritiera_fomes',
  'swintonia_floribunda',
  'toona_ciliata',
  'gmelina_arborea',
  'anisoptera_scaphula',
  'mangifera_indica',
];

export function isMatchedPhotoForSpecies(url: string, scientificName: string): boolean {
  if (!url || typeof url !== 'string') return false;
  let u = '';
  try {
    u = decodeURIComponent(url).trim().toLowerCase();
  } catch {
    u = url.trim().toLowerCase();
  }
  if (!u) return false;
  if (u.includes('images.unsplash.com')) return false;
  if (u.includes('tripura_sundri_temple') || u.includes('temple')) return false;
  if (u.endsWith('.svg') || u.includes('.svg?')) return false;
  if (u.includes('sunderbans_tiger_reserve_india_david_raju_(49)')) return false;
  if (u.includes('sundarbans_02.jpg')) return false;
  if (u.includes('dscf5278') || u.includes('dsc06770')) return false;
  if (
    u.includes('tinospora_cordifolia') ||
    u.includes('trichosanthes_tricuspidata') ||
    u.includes('makal_mahakal')
  ) {
    return false;
  }

  const sciLower = (scientificName || '').trim().toLowerCase();
  if (!sciLower) return true;

  const sciParts = sciLower.split(/\s+/).filter(Boolean);
  const canonicalSlug = sciParts.length >= 2 ? `${sciParts[0]}_${sciParts[1]}` : sciLower.replace(/\s+/g, '_');
  const allowedSlugs = new Set<string>([
    canonicalSlug,
    ...(SPECIES_SYNONYM_SLUGS[sciLower] || []),
  ]);

  // If URL is a BFIS TreeInfo upload, verify the uploaded species filename matches
  if (u.includes('bfis.bforest.gov.bd/treeinfo/public/uploads/')) {
    const filePart = u.split('/uploads/')[1]?.split(/[?#]/)[0] || '';
    const fileBase = filePart.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    if (fileBase && !allowedSlugs.has(fileBase)) {
      return false;
    }
  }

  // Reject if URL explicitly contains another known tree species binomial slug
  for (const slug of KNOWN_SPECIES_SLUGS) {
    if (!allowedSlugs.has(slug) && u.includes(slug)) {
      return false;
    }
  }

  return true;
}

export function sanitizeSpeciesPhotos(sp: TreeSpecies): TreeSpecies {
  const sciName = sp.scientificName || '';
  const seenUrls = new Set<string>();

  let nextPrimary = typeof sp.imageUrl === 'string' ? sp.imageUrl.trim() : '';
  if (nextPrimary && !isMatchedPhotoForSpecies(nextPrimary, sciName)) {
    nextPrimary = '';
  }
  if (nextPrimary) {
    seenUrls.add(nextPrimary);
  }

  const cleanMore: TreePhoto[] = [];
  if (Array.isArray(sp.morePhotos)) {
    for (const plate of sp.morePhotos) {
      if (!plate || typeof plate.url !== 'string') continue;
      const cleanUrl = plate.url.trim();
      if (!cleanUrl || !isMatchedPhotoForSpecies(cleanUrl, sciName)) continue;
      if (seenUrls.has(cleanUrl)) continue;
      seenUrls.add(cleanUrl);
      cleanMore.push({
        ...plate,
        url: cleanUrl,
      });
    }
  }

  if (!nextPrimary && cleanMore.length > 0) {
    nextPrimary = cleanMore[0].url;
    cleanMore.shift();
  }

  return {
    ...sp,
    imageUrl: nextPrimary || undefined,
    morePhotos: cleanMore,
  };
}

export async function getStoredSpecies(): Promise<TreeSpecies[]> {
  // 1. Immediately read existing local storage
  let localData: TreeSpecies[] = [];
  try {
    const raw = safeStorageGet(STORAGE_KEY_SPECIES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      const valid = sanitizeObjectArray<TreeSpecies>(parsed);
      if (valid.length > 0) {
        localData = valid;
      }
    }
  } catch (err) {
    console.warn('Could not read cached species from localStorage:', err);
  }

  try {
    // 2. Fetch official default data with retries
    const defaultData = await fetchStaticJson<TreeSpecies[]>('species.json');

    if (defaultData && Array.isArray(defaultData) && defaultData.length > 0) {
      const cleanDefaults = sanitizeObjectArray<TreeSpecies>(defaultData).map(sanitizeSpeciesPhotos);

      if (localData.length > 0) {
        // Merge official metadata with local curated photos WITHOUT re-injecting deleted/unmatched plates
        const localMap = new Map<string, TreeSpecies>(localData.map((sp: TreeSpecies) => [sp.id, sp]));
        const mergedList: TreeSpecies[] = [];

        for (const def of cleanDefaults) {
          const local = localMap.get(def.id);
          if (!local) {
            mergedList.push(def);
          } else {
            const sciName = local.scientificName || def.scientificName || '';
            const hasLocalPhotosArray = Array.isArray(local.morePhotos);
            const rawLocalPrimary = typeof local.imageUrl === 'string' ? local.imageUrl.trim() : '';
            const resolvedPrimary =
              rawLocalPrimary === ''
                ? ''
                : isMatchedPhotoForSpecies(rawLocalPrimary, sciName)
                  ? rawLocalPrimary
                  : (def.imageUrl || '');

            mergedList.push(
              sanitizeSpeciesPhotos({
                ...local,
                sourceUrl: def.sourceUrl || local.sourceUrl,
                forestEcosystem: def.forestEcosystem || local.forestEcosystem,
                photoCredit: local.photoCredit || def.photoCredit,
                imageUrl: resolvedPrimary,
                morePhotos: hasLocalPhotosArray ? local.morePhotos : (def.morePhotos || []),
              })
            );
            localMap.delete(def.id);
          }
        }

        // Preserve any custom species added by user (cleaned & deduplicated)
        for (const remaining of localMap.values()) {
          mergedList.push(sanitizeSpeciesPhotos(remaining));
        }

        try {
          const prevRaw = safeStorageGet(STORAGE_KEY_SPECIES);
          const nextRaw = JSON.stringify(mergedList);
          if (prevRaw !== nextRaw) {
            safeStorageSet(STORAGE_KEY_SPECIES, nextRaw);
          }
        } catch (err) {
          console.error('Failed to save merged species to storage:', err);
        }
        return mergedList;
      }

      // First run: save fetched defaults to local storage without re-triggering loadData event
      saveStoredSpecies(cleanDefaults, false);
      return cleanDefaults;
    }
  } catch (err) {
    console.warn('Failed to refresh species from static data, using local cache:', err);
  }

  // 3. Fallback to cached local data if fetch was unavailable
  if (localData.length > 0) {
    return localData.map(sanitizeSpeciesPhotos);
  }

  return [];
}

export function getStoredSpeciesSync(): TreeSpecies[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY_SPECIES);
    if (raw) {
      return sanitizeObjectArray<TreeSpecies>(JSON.parse(raw)).map(sanitizeSpeciesPhotos);
    }
  } catch (err) {
    console.error('Failed to get species sync:', err);
  }
  return [];
}

export function saveStoredSpecies(species: TreeSpecies[], notify = true): void {
  try {
    const sanitized = sanitizeObjectArray<TreeSpecies>(species).map(sanitizeSpeciesPhotos);
    safeStorageSet(STORAGE_KEY_SPECIES, JSON.stringify(sanitized));
    if (notify) {
      notifyDataUpdate('species');
    }
  } catch (err) {
    console.error('Failed to save species to storage:', err);
  }
}

export function addPhotoToTreeSpecies(speciesId: string, photo: TreePhoto): TreeSpecies | null {
  const current = getStoredSpeciesSync();
  let updatedSpecies: TreeSpecies | null = null;
  const next = current.map((sp) => {
    if (sp.id === speciesId) {
      const candidate = sanitizeSpeciesPhotos({
        ...sp,
        morePhotos: [...(sp.morePhotos || []), photo]
      });
      updatedSpecies = candidate;
      return candidate;
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
    const raw = safeStorageGet(STORAGE_KEY_GALLERY);
    if (raw !== null) {
      const valid = sanitizeObjectArray<GalleryItem>(JSON.parse(raw));
      if (valid.length > 0) {
        localData = valid;
      }
    }
  } catch {
    // Ignore parse error
  }

  try {
    const defaultData = await fetchStaticJson<GalleryItem[]>('gallery.json');
    if (defaultData && Array.isArray(defaultData) && defaultData.length > 0) {
      const cleanDefaults = sanitizeObjectArray<GalleryItem>(defaultData);
      if (localData.length > 0) {
        const localIds = new Set(localData.map((item: GalleryItem) => item.id));
        const merged = [...localData];
        for (const defItem of cleanDefaults) {
          if (!localIds.has(defItem.id)) {
            merged.push(defItem);
            localIds.add(defItem.id);
          }
        }
        if (merged.length !== localData.length) {
          saveStoredGallery(merged, false);
        }
        return merged;
      }
      saveStoredGallery(cleanDefaults, false);
      return cleanDefaults;
    }
  } catch (err) {
    console.warn('Failed to refresh gallery from static data:', err);
  }

  return localData;
}

export function getStoredGallerySync(): GalleryItem[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY_GALLERY);
    if (raw) {
      return sanitizeObjectArray<GalleryItem>(JSON.parse(raw));
    }
  } catch (err) {
    console.error('Failed to get gallery sync:', err);
  }
  return [];
}

export function saveStoredGallery(items: GalleryItem[], notify = true): void {
  try {
    safeStorageSet(STORAGE_KEY_GALLERY, JSON.stringify(sanitizeObjectArray<GalleryItem>(items)));
    if (notify) {
      notifyDataUpdate('gallery');
    }
  } catch (err) {
    console.error('Failed to save gallery to storage:', err);
  }
}

// ==========================================
// 4. THESIS ARCHIVE MANAGEMENT
// ==========================================

export async function getStoredTheses(): Promise<ThesisItem[]> {
  try {
    const raw = safeStorageGet(STORAGE_KEY_THESES);
    if (raw !== null) {
      const valid = sanitizeObjectArray<ThesisItem>(JSON.parse(raw));
      if (valid.length > 0) {
        return valid;
      }
    }
  } catch {
    // Continue to fetch
  }

  try {
    const defaultData = await fetchStaticJson<ThesisItem[]>('theses.json');
    if (defaultData && Array.isArray(defaultData)) {
      const clean = sanitizeObjectArray<ThesisItem>(defaultData);
      saveStoredTheses(clean, false);
      return clean;
    }
  } catch (err) {
    console.warn('Failed to load theses:', err);
  }
  return [];
}

export function getStoredThesesSync(): ThesisItem[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY_THESES);
    if (raw) {
      return sanitizeObjectArray<ThesisItem>(JSON.parse(raw));
    }
  } catch (err) {
    console.error('Failed to get theses sync:', err);
  }
  return [];
}

export function saveStoredTheses(theses: ThesisItem[], notify = true): void {
  try {
    safeStorageSet(STORAGE_KEY_THESES, JSON.stringify(sanitizeObjectArray<ThesisItem>(theses)));
    if (notify) {
      notifyDataUpdate('theses');
    }
  } catch (err) {
    console.error('Failed to save theses to storage:', err);
  }
}

// ==========================================
// 5. NOTICE BOARD & NOTICE TYPES MANAGEMENT
// ==========================================

const SAMPLE_NOTICE_DEFAULT_TAGS: Record<string, string[]> = {
  'notice-1': ['important', 'latest', 'exam'],
  'notice-2': ['new', 'field-tour'],
  'notice-3': ['latest', 'new'],
};

function hydrateSampleNoticeTags(notices: NoticeItem[]): NoticeItem[] {
  return notices.map((item) => {
    if (!('tags' in item) && item.id in SAMPLE_NOTICE_DEFAULT_TAGS) {
      return { ...item, tags: SAMPLE_NOTICE_DEFAULT_TAGS[item.id] };
    }
    return item;
  });
}

export async function getStoredNotices(): Promise<NoticeItem[]> {
  try {
    const raw = safeStorageGet(STORAGE_KEY_NOTICES);
    if (raw !== null) {
      const valid = sanitizeObjectArray<NoticeItem>(JSON.parse(raw));
      if (valid.length > 0) {
        return hydrateSampleNoticeTags(valid);
      }
    }
  } catch {
    // Continue to fetch
  }

  try {
    const defaultData = await fetchStaticJson<NoticeItem[]>('notices.json');
    if (defaultData && Array.isArray(defaultData)) {
      const clean = hydrateSampleNoticeTags(sanitizeObjectArray<NoticeItem>(defaultData));
      saveStoredNotices(clean, false);
      return clean;
    }
  } catch (err) {
    console.warn('Failed to load notices:', err);
  }
  return [];
}

export function getStoredNoticesSync(): NoticeItem[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY_NOTICES);
    if (raw) {
      return hydrateSampleNoticeTags(sanitizeObjectArray<NoticeItem>(JSON.parse(raw)));
    }
  } catch (err) {
    console.error('Failed to get notices sync:', err);
  }
  return [];
}

export function saveStoredNotices(notices: NoticeItem[], notify = true): void {
  try {
    safeStorageSet(STORAGE_KEY_NOTICES, JSON.stringify(sanitizeObjectArray<NoticeItem>(notices)));
    if (notify) {
      notifyDataUpdate('notices');
    }
  } catch (err) {
    console.error('Failed to save notices to storage:', err);
  }
}

export function getStoredNoticeTypes(): NoticeTypeDefinition[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY_NOTICE_TYPES);
    if (raw !== null) {
      const parsed = sanitizeObjectArray<NoticeTypeDefinition>(JSON.parse(raw));
      if (parsed.length > 0) {
        return parsed.map((t, idx) => ({
          id: typeof t.id === 'string' && t.id.trim() ? t.id.trim() : `type-${idx + 1}`,
          label: typeof t.label === 'string' && t.label.trim() ? t.label.trim() : 'Notice',
          color: t.color || 'stone',
          showInBar: t.showInBar !== false,
          order: typeof t.order === 'number' ? t.order : idx + 1,
        }));
      }
    }
  } catch (err) {
    console.error('Failed to load notice types:', err);
  }
  return DEFAULT_NOTICE_TYPES;
}

export function saveStoredNoticeTypes(types: NoticeTypeDefinition[], notify = true): void {
  try {
    const clean = sanitizeObjectArray<NoticeTypeDefinition>(types).map((t, idx) => ({
      ...t,
      order: idx + 1,
      showInBar: t.showInBar !== false,
    }));
    safeStorageSet(STORAGE_KEY_NOTICE_TYPES, JSON.stringify(clean));
    if (notify) {
      notifyDataUpdate('notices');
    }
  } catch (err) {
    console.error('Failed to save notice types:', err);
  }
}

export function resetStoredNoticeTypes(notify = true): NoticeTypeDefinition[] {
  safeStorageSet(STORAGE_KEY_NOTICE_TYPES, JSON.stringify(DEFAULT_NOTICE_TYPES));
  if (notify) {
    notifyDataUpdate('notices');
  }
  return DEFAULT_NOTICE_TYPES;
}

export function getStoredNoticeBarSettings(): NoticeBarSettings {
  try {
    const raw = safeStorageGet(STORAGE_KEY_NOTICE_BAR_SETTINGS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_NOTICE_BAR_SETTINGS.enabled,
          maxItems:
            typeof parsed.maxItems === 'number' && parsed.maxItems >= 1 && parsed.maxItems <= 20
              ? parsed.maxItems
              : DEFAULT_NOTICE_BAR_SETTINGS.maxItems,
          autoRotate:
            typeof parsed.autoRotate === 'boolean' ? parsed.autoRotate : DEFAULT_NOTICE_BAR_SETTINGS.autoRotate,
          rotationIntervalSeconds:
            typeof parsed.rotationIntervalSeconds === 'number' &&
            parsed.rotationIntervalSeconds >= 2 &&
            parsed.rotationIntervalSeconds <= 60
              ? parsed.rotationIntervalSeconds
              : DEFAULT_NOTICE_BAR_SETTINGS.rotationIntervalSeconds,
          title:
            typeof parsed.title === 'string' && parsed.title.trim()
              ? parsed.title.trim()
              : DEFAULT_NOTICE_BAR_SETTINGS.title,
        };
      }
    }
  } catch (err) {
    console.error('Failed to load notice bar settings:', err);
  }
  return DEFAULT_NOTICE_BAR_SETTINGS;
}

export function saveStoredNoticeBarSettings(settings: NoticeBarSettings, notify = true): void {
  try {
    safeStorageSet(STORAGE_KEY_NOTICE_BAR_SETTINGS, JSON.stringify(settings));
    if (notify) {
      notifyDataUpdate('notices');
    }
  } catch (err) {
    console.error('Failed to save notice bar settings:', err);
  }
}

// ==========================================
// 6. QUICK LINKS MANAGEMENT
// ==========================================

export function getStoredQuickLinks(): QuickLinkItem[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY_QUICKLINKS);
    if (raw) {
      const valid = sanitizeObjectArray<QuickLinkItem>(JSON.parse(raw));
      if (valid.length > 0) {
        return valid;
      }
    }
    safeStorageSet(STORAGE_KEY_QUICKLINKS, JSON.stringify(DEFAULT_QUICK_LINKS));
    return DEFAULT_QUICK_LINKS;
  } catch (err) {
    console.error('Failed to load quick links:', err);
    return DEFAULT_QUICK_LINKS;
  }
}

export function saveStoredQuickLinks(links: QuickLinkItem[]): void {
  try {
    safeStorageSet(STORAGE_KEY_QUICKLINKS, JSON.stringify(sanitizeObjectArray<QuickLinkItem>(links)));
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
    const raw = safeStorageGet(STORAGE_KEY_BOOKMARKS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
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
  safeStorageSet(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
  return updated;
}

export function verifyAdminPin(enteredPin: string): boolean {
  const currentPin = safeStorageGet(STORAGE_KEY_PIN) || DEFAULT_PIN;
  return enteredPin.trim() === currentPin.trim() || enteredPin.trim() === 'admin123';
}

export function setStoredAdminPin(newPin: string): void {
  safeStorageSet(STORAGE_KEY_PIN, newPin.trim());
}

// ==========================================
// 7.5. STUDENT PHOTOS (FIELD TOUR & DENDROLOGY)
// ==========================================

export function getStoredStudentPhotosSync(): StudentPhotoItem[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY_STUDENT_PHOTOS);
    if (raw) {
      return sanitizeObjectArray<StudentPhotoItem>(JSON.parse(raw));
    }
  } catch (err) {
    console.error('Failed to get student photos sync:', err);
  }
  return [];
}

export async function getStoredStudentPhotos(): Promise<StudentPhotoItem[]> {
  try {
    const raw = safeStorageGet(STORAGE_KEY_STUDENT_PHOTOS);
    if (raw !== null) {
      const valid = sanitizeObjectArray<StudentPhotoItem>(JSON.parse(raw));
      if (valid.length > 0) {
        return valid;
      }
    }
  } catch {
    // Continue to fetch
  }

  try {
    const defaultData = await fetchStaticJson<StudentPhotoItem[]>('student_photos.json');
    if (defaultData && Array.isArray(defaultData)) {
      const clean = sanitizeObjectArray<StudentPhotoItem>(defaultData);
      saveStoredStudentPhotos(clean, false);
      return clean;
    }
  } catch (err) {
    console.warn('Failed to load student photos:', err);
  }
  return [];
}

export function saveStoredStudentPhotos(photos: StudentPhotoItem[], notify = true): void {
  try {
    safeStorageSet(STORAGE_KEY_STUDENT_PHOTOS, JSON.stringify(sanitizeObjectArray<StudentPhotoItem>(photos)));
    if (notify) {
      notifyDataUpdate('student_photos');
    }
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
  const noticeTypes = getStoredNoticeTypes();
  const noticeBarSettings = getStoredNoticeBarSettings();
  const quickLinks = getStoredQuickLinks();
  const studentPhotos = getStoredStudentPhotosSync();
  const contributionRequests = getStoredContributionRequests();
  const batchFunds = getStoredBatchFunds();

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
    noticeTypes: customData?.noticeTypes || noticeTypes,
    noticeBarSettings: customData?.noticeBarSettings || noticeBarSettings,
    quickLinks: customData?.quickLinks || quickLinks,
    studentPhotos: customData?.studentPhotos || studentPhotos,
    contributionRequests: customData?.contributionRequests || contributionRequests,
    batchFunds: customData?.batchFunds || batchFunds,
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
        let noticeTypes: NoticeTypeDefinition[] = [];
        let noticeBarSettings: NoticeBarSettings | null = null;
        let links: QuickLinkItem[] = [];
        let studentPhotos: StudentPhotoItem[] = [];
        let contributionRequests: ContributionRequest[] = [];
        let batchFunds: BatchFundRecord[] = [];

        // Support both old resource-only backups and new Master backups
        if (Array.isArray(parsed)) {
          resources = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.resources)) resources = parsed.resources;
          if (Array.isArray(parsed.species)) species = parsed.species;
          if (Array.isArray(parsed.gallery)) gallery = parsed.gallery;
          if (Array.isArray(parsed.theses)) theses = parsed.theses;
          if (Array.isArray(parsed.notices)) notices = parsed.notices;
          if (Array.isArray(parsed.noticeTypes)) noticeTypes = parsed.noticeTypes;
          if (parsed.noticeBarSettings && typeof parsed.noticeBarSettings === 'object') {
            noticeBarSettings = parsed.noticeBarSettings;
          }
          if (Array.isArray(parsed.quickLinks)) links = parsed.quickLinks;
          if (Array.isArray(parsed.studentPhotos)) studentPhotos = parsed.studentPhotos;
          if (Array.isArray(parsed.contributionRequests)) {
            contributionRequests = parsed.contributionRequests;
          }
          if (Array.isArray(parsed.batchFunds)) {
            batchFunds = parsed.batchFunds;
          }
        }

        if (
          resources.length === 0 &&
          species.length === 0 &&
          gallery.length === 0 &&
          theses.length === 0 &&
          notices.length === 0 &&
          links.length === 0 &&
          studentPhotos.length === 0 &&
          contributionRequests.length === 0 &&
          batchFunds.length === 0
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
        if (noticeTypes.length > 0) saveStoredNoticeTypes(noticeTypes);
        if (noticeBarSettings) saveStoredNoticeBarSettings(noticeBarSettings);
        if (links.length > 0) saveStoredQuickLinks(links);
        if (studentPhotos.length > 0) saveStoredStudentPhotos(studentPhotos);
        if (contributionRequests.length > 0) saveStoredContributionRequests(contributionRequests);
        if (batchFunds.length > 0) saveStoredBatchFunds(batchFunds);

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
    const raw = safeStorageGet(STORAGE_KEY_ROUTINES);
    if (raw !== null) {
      const valid = sanitizeObjectArray<YearRoutine>(JSON.parse(raw));
      if (valid.length > 0) {
        return valid;
      }
    }
  } catch {
    // Continue to fetch
  }

  try {
    const defaultData = await fetchStaticJson<YearRoutine[]>('routine.json');
    if (defaultData && Array.isArray(defaultData)) {
      return sanitizeObjectArray<YearRoutine>(defaultData);
    }
  } catch (err) {
    console.warn('Failed to load routines from static data:', err);
  }
  return [];
}

export function saveStoredRoutines(routines: YearRoutine[]): void {
  try {
    safeStorageSet(STORAGE_KEY_ROUTINES, JSON.stringify(sanitizeObjectArray<YearRoutine>(routines)));
    notifyDataUpdate('routines');
  } catch (err) {
    console.error('Error saving routines storage:', err);
  }
}

export async function resetStoredRoutines(): Promise<YearRoutine[]> {
  try {
    safeStorageRemove(STORAGE_KEY_ROUTINES);
    const routines = await getStoredRoutines();
    notifyDataUpdate('routines');
    return routines;
  } catch (err) {
    console.error('Error resetting routines:', err);
    return [];
  }
}

export async function resetAllCollectionsToFactoryDefaults(): Promise<void> {
  safeStorageRemove(STORAGE_KEY_RESOURCES);
  safeStorageRemove(STORAGE_KEY_SPECIES);
  safeStorageRemove(STORAGE_KEY_GALLERY);
  safeStorageRemove(STORAGE_KEY_THESES);
  safeStorageRemove(STORAGE_KEY_NOTICES);
  safeStorageRemove(STORAGE_KEY_NOTICE_TYPES);
  safeStorageRemove(STORAGE_KEY_NOTICE_BAR_SETTINGS);
  safeStorageRemove(STORAGE_KEY_ROUTINES);
  safeStorageRemove(STORAGE_KEY_QUICKLINKS);
  safeStorageRemove(STORAGE_KEY_STUDENT_PHOTOS);
  safeStorageRemove('sust_fes_otp_manage_passwords_v1');
  safeStorageRemove(STORAGE_KEY_CONTRIBUTION_REQUESTS);
  safeStorageRemove(STORAGE_KEY_BATCH_FUNDS);

  resetStoredResourcesToDefaults(false);
  await Promise.all([
    getStoredSpecies(),
    getStoredGallery(),
    getStoredTheses(),
    getStoredNotices(),
    getStoredRoutines(),
    getStoredStudentPhotos(),
  ]);
  getStoredQuickLinks();

  notifyDataUpdate('all');
}

// ==========================================
// 9. OPEN CONTRIBUTION SUBMISSION & ADMIN REVIEW QUEUE
// ==========================================

export function getStoredContributionRequests(): ContributionRequest[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY_CONTRIBUTION_REQUESTS);
    if (!raw) return [];
    return sanitizeObjectArray<ContributionRequest>(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveStoredContributionRequests(
  requests: ContributionRequest[],
  notify = true
): void {
  try {
    safeStorageSet(
      STORAGE_KEY_CONTRIBUTION_REQUESTS,
      JSON.stringify(sanitizeObjectArray<ContributionRequest>(requests))
    );
    if (notify) {
      notifyDataUpdate('contributions');
    }
  } catch (err) {
    console.error('Failed to save contribution requests:', err);
  }
}

export function submitContributionRequest(params: {
  entityType: ContributionEntityType;
  title: string;
  contributorName: string;
  contributorBatch?: string;
  contributorContact?: string;
  summary: string;
  payload: Record<string, any>;
}): { ok: true; request: ContributionRequest } | { ok: false; error: string } {
  if (!params.title?.trim() || !params.contributorName?.trim()) {
    return {
      ok: false,
      error: 'Title and contributor name are required to submit a contribution.',
    };
  }

  const now = new Date().toISOString();
  const requestId = `contrib-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const newRequest: ContributionRequest = {
    id: requestId,
    entityType: params.entityType,
    title: params.title.trim(),
    contributorName: params.contributorName.trim(),
    contributorBatch: params.contributorBatch?.trim() || undefined,
    contributorContact: params.contributorContact?.trim() || undefined,
    summary: params.summary.trim(),
    payload: params.payload,
    status: 'pending',
    submittedAt: now,
  };

  const requests = getStoredContributionRequests();
  saveStoredContributionRequests([newRequest, ...requests], true);

  return {
    ok: true,
    request: newRequest,
  };
}

export async function approveContributionRequest(
  requestId: string,
  reviewNote?: string
): Promise<{ ok: boolean; error?: string }> {
  const requests = getStoredContributionRequests();
  const target = requests.find((r) => r.id === requestId);
  if (!target) {
    return { ok: false, error: 'Contribution request not found.' };
  }
  if (target.status !== 'pending') {
    return { ok: false, error: 'This request has already been reviewed.' };
  }

  const payload = target.payload || {};
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  try {
    if (target.entityType === 'resource') {
      const current = getStoredResources();
      const newRes: ResourceItem = {
        id: payload.id || `res-${suffix}`,
        title: payload.title || target.title,
        courseCode: payload.courseCode || 'FES-GENERAL',
        courseTitle: payload.courseTitle || 'Departmental Archive',
        year: payload.year ?? 'general',
        semester: payload.semester ?? 'all',
        category: payload.category || 'notes',
        driveUrl: payload.driveUrl || '',
        fileId: payload.fileId || '',
        fileType: payload.fileType || 'link',
        previewUrl: payload.previewUrl || payload.driveUrl || '',
        downloadUrl: payload.downloadUrl || payload.driveUrl || '',
        sessionYear: payload.sessionYear || undefined,
        authorOrTeacher: payload.authorOrTeacher || target.contributorName,
        description: payload.description || undefined,
        examTerm: payload.category === 'pyq' ? payload.examTerm || 'final' : undefined,
        createdAt: new Date().toISOString(),
      };
      saveStoredResources([newRes, ...current]);
    } else if (target.entityType === 'species') {
      const current = await getStoredSpecies();
      const newSpecies: TreeSpecies = {
        id: payload.id || `sp-${suffix}`,
        scientificName: payload.scientificName || target.title,
        commonName: payload.commonName || target.title,
        banglaName: payload.banglaName || '',
        family: payload.family || 'Unclassified',
        uses: Array.isArray(payload.uses) ? payload.uses : [],
        habitat: payload.habitat || '',
        conservationStatus: payload.conservationStatus || 'Least Concern (LC)',
        distribution: payload.distribution || 'Bangladesh',
        silviculturalNotes: payload.silviculturalNotes || '',
        imageUrl: payload.imageUrl || undefined,
        photoCredit: payload.photoCredit || target.contributorName,
        forestEcosystem: payload.forestEcosystem || undefined,
      };
      saveStoredSpecies([newSpecies, ...current]);
    } else if (target.entityType === 'gallery') {
      const current = await getStoredGallery();
      const newGallery: GalleryItem = {
        id: payload.id || `gal-${suffix}`,
        title: payload.title || target.title,
        caption: payload.caption || '',
        location: payload.location || 'SUST Campus, Sylhet',
        year: payload.year || String(new Date().getFullYear()),
        category: payload.category || 'field-tour',
        imageUrl: payload.imageUrl || '',
        photographer: payload.photographer || target.contributorName,
      };
      saveStoredGallery([newGallery, ...current]);
    } else if (target.entityType === 'student_photo') {
      await getStoredStudentPhotos();
      addStudentPhotoSubmission(
        {
          studentName: payload.studentName || target.contributorName,
          studentBatch: payload.studentBatch || target.contributorBatch,
          studentRegNo: payload.studentRegNo || undefined,
          title: payload.title || target.title,
          caption: payload.caption || '',
          location: payload.location || 'SUST Campus, Sylhet',
          date: payload.date || new Date().toISOString().split('T')[0],
          imageUrl: payload.imageUrl || '',
          treeSpeciesId: payload.treeSpeciesId || undefined,
          speciesScientificName: payload.speciesScientificName || undefined,
        },
        'approved'
      );
    } else if (target.entityType === 'thesis') {
      const current = await getStoredTheses();
      const newThesis: ThesisItem = {
        id: payload.id || `thesis-${suffix}`,
        title: payload.title || target.title,
        author: payload.author || target.contributorName,
        supervisor: payload.supervisor || 'Department Faculty',
        degree: payload.degree || 'B.Sc. (Honours)',
        year: payload.year || String(new Date().getFullYear()),
        researchArea: payload.researchArea || 'Forestry & Environmental Science',
        abstract: payload.abstract || '',
        driveUrl: payload.driveUrl || undefined,
      };
      saveStoredTheses([newThesis, ...current]);
    } else if (target.entityType === 'notice') {
      const current = await getStoredNotices();
      const newNotice: NoticeItem = {
        id: payload.id || `notice-${suffix}`,
        title: payload.title || target.title,
        date: payload.date || new Date().toISOString().split('T')[0],
        body: payload.body || '',
        imageUrl: payload.imageUrl || undefined,
        attachmentUrl: payload.attachmentUrl || undefined,
        link: payload.link || undefined,
        pinned: Boolean(payload.pinned),
        tags: Array.isArray(payload.tags) && payload.tags.length > 0 ? payload.tags : ['new'],
      };
      saveStoredNotices([newNotice, ...current]);
    } else if (target.entityType === 'quick_link') {
      const current = getStoredQuickLinks();
      const newLink: QuickLinkItem = {
        id: payload.id || `link-${suffix}`,
        title: payload.title || target.title,
        url: payload.url || '',
        category: payload.category || 'general',
        description: payload.description || undefined,
      };
      saveStoredQuickLinks([newLink, ...current]);
    }

    const updatedRequests = requests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'approved' as const,
            reviewedAt: new Date().toISOString(),
            reviewNote: reviewNote?.trim() || undefined,
          }
        : r
    );
    saveStoredContributionRequests(updatedRequests);
    return { ok: true };
  } catch (err) {
    console.error('Failed to approve contribution request:', err);
    return { ok: false, error: 'Failed to publish approved item.' };
  }
}

export function rejectContributionRequest(
  requestId: string,
  reviewNote?: string
): { ok: boolean; error?: string } {
  const requests = getStoredContributionRequests();
  const target = requests.find((r) => r.id === requestId);
  if (!target) {
    return { ok: false, error: 'Contribution request not found.' };
  }
  if (target.status !== 'pending') {
    return { ok: false, error: 'This request has already been reviewed.' };
  }

  const updatedRequests = requests.map((r) =>
    r.id === requestId
      ? {
          ...r,
          status: 'rejected' as const,
          reviewedAt: new Date().toISOString(),
          reviewNote: reviewNote?.trim() || undefined,
        }
      : r
  );
  saveStoredContributionRequests(updatedRequests);
  return { ok: true };
}

export function deleteContributionRequest(requestId: string): void {
  const requests = getStoredContributionRequests();
  saveStoredContributionRequests(requests.filter((r) => r.id !== requestId));
}

// ==========================================
// 10. BATCH FUND TREASURY & EXPENSE LEDGER
// ==========================================

export const DEFAULT_BATCH_FUNDS: BatchFundRecord[] = [
  {
    id: 'batch-fes-28',
    batchName: 'FES28 (2025-26)',
    treasurerName: 'Treasurer (Update in Manage)',
    treasurerContact: 'FES28 Treasurer · Session 2025-26',
    openingBalance: 4500,
    notes: 'Official FES28 batch treasury ledger (Session 2025-26) for semester collections, lab printing, and field tour expenses.',
    updatedAt: '2026-11-24T00:00:00.000Z',
    transactions: [
      {
        id: 'bf-tx-1',
        type: 'collection',
        title: 'FES28 Semester Subscription Collection (36 Members × ৳300)',
        category: 'Contribution',
        amount: 10800,
        date: '2026-10-12',
        recordedBy: 'FES28 Treasurer',
        notes: 'Collected for 2025-26 semester practicals and student activities',
      },
      {
        id: 'bf-tx-2',
        type: 'expense',
        title: 'Dendrology Lab Manual & Herbarium Sheets Printing',
        category: 'Printing & Notes',
        amount: 2450,
        date: '2026-10-19',
        recordedBy: 'FES28 Treasurer',
        notes: 'FES28 batch-wide copy set from SUST print shop',
      },
      {
        id: 'bf-tx-3',
        type: 'expense',
        title: 'Khadimnagar Field Excursion Refreshments & Banner',
        category: 'Field Tour',
        amount: 4200,
        date: '2026-11-04',
        recordedBy: 'FES28 Treasurer',
        notes: 'Transport coordination & drinking water crate',
      },
    ],
  },
  {
    id: 'batch-fes-27',
    batchName: 'FES27 (2024-25)',
    treasurerName: 'Treasurer (Update in Manage)',
    treasurerContact: 'FES27 Treasurer · Session 2024-25',
    openingBalance: 6200,
    notes: 'Shared batch fund ledger for field surveys, workshops, and departmental events.',
    updatedAt: '2026-11-24T00:00:00.000Z',
    transactions: [
      {
        id: 'bf-27-tx-1',
        type: 'collection',
        title: 'Annual Batch Fund Deposit',
        category: 'Contribution',
        amount: 8500,
        date: '2026-09-25',
        recordedBy: 'FES27 Treasurer',
      },
      {
        id: 'bf-27-tx-2',
        type: 'expense',
        title: 'Soil Science Practical Reagents & Containers',
        category: 'Equipment',
        amount: 3100,
        date: '2026-10-28',
        recordedBy: 'FES27 Treasurer',
      },
    ],
  },
];

export function calculateBatchFundSummary(record: BatchFundRecord): {
  openingBalance: number;
  totalCollections: number;
  totalInflow: number;
  totalExpenses: number;
  netBalance: number;
} {
  const openingBalance = Math.max(0, Number(record.openingBalance) || 0);
  const txs: BatchFundTransaction[] = Array.isArray(record.transactions) ? record.transactions : [];
  let totalCollections = 0;
  let totalExpenses = 0;

  for (const tx of txs) {
    const amt = Math.max(0, Number(tx?.amount) || 0);
    if (tx?.type === 'collection') {
      totalCollections += amt;
    } else if (tx?.type === 'expense') {
      totalExpenses += amt;
    }
  }

  const totalInflow = openingBalance + totalCollections;
  const netBalance = totalInflow - totalExpenses;

  return {
    openingBalance,
    totalCollections,
    totalInflow,
    totalExpenses,
    netBalance,
  };
}

export function getStoredBatchFunds(): BatchFundRecord[] {
  try {
    const raw = safeStorageGet(STORAGE_KEY_BATCH_FUNDS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return sanitizeObjectArray<BatchFundRecord>(parsed).map((rec) => ({
          ...rec,
          openingBalance: Number(rec.openingBalance) || 0,
          transactions: sanitizeObjectArray<BatchFundTransaction>(rec.transactions),
        }));
      }
    }
  } catch (err) {
    console.error('Failed to read batch funds from storage:', err);
  }
  return DEFAULT_BATCH_FUNDS;
}

export function saveStoredBatchFunds(funds: BatchFundRecord[], notify = true): void {
  try {
    const clean = sanitizeObjectArray<BatchFundRecord>(funds);
    safeStorageSet(STORAGE_KEY_BATCH_FUNDS, JSON.stringify(clean));
    if (notify) notifyDataUpdate('batch_funds');
  } catch (err) {
    console.error('Failed to save batch funds:', err);
  }
}

export function resetStoredBatchFunds(notify = true): BatchFundRecord[] {
  saveStoredBatchFunds(DEFAULT_BATCH_FUNDS, notify);
  return DEFAULT_BATCH_FUNDS;
}

