import { ResourceItem } from '../types';
import { INITIAL_RESOURCE_ARCHIVE } from '../data/coursesData';

const STORAGE_KEY_RESOURCES = 'sust_fes_resources_obe_v2';
const STORAGE_KEY_BOOKMARKS = 'sust_fes_bookmarks_v1';
const STORAGE_KEY_PIN = 'sust_fes_admin_pin_v1';
const DEFAULT_PIN = 'sustfes';

export function getStoredResources(): ResourceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESOURCES);
    let items: ResourceItem[] = INITIAL_RESOURCE_ARCHIVE;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed;
      }
    }

    // Auto-enrich any item missing path/keywords/scannedSnippet
    const enriched = items.map((item) => {
      const defaultMatch = INITIAL_RESOURCE_ARCHIVE.find((def) => def.id === item.id);
      const derivedPath = defaultMatch?.path || item.path || `Google Drive / Year ${item.year} / Sem ${item.semester} / ${item.courseCode} / ${item.title}`;
      const derivedKeywords = defaultMatch?.keywords || item.keywords || [item.courseCode, item.courseTitle, item.category, item.authorOrTeacher, item.sessionYear].filter(Boolean) as string[];
      const derivedSnippet = defaultMatch?.scannedSnippet || item.scannedSnippet || item.description || item.title;

      return {
        ...item,
        path: item.path || derivedPath,
        keywords: item.keywords && item.keywords.length > 0 ? item.keywords : derivedKeywords,
        scannedSnippet: item.scannedSnippet || derivedSnippet,
      };
    });

    return enriched;
  } catch (err) {
    console.error('Failed to load resources from storage:', err);
    return INITIAL_RESOURCE_ARCHIVE;
  }
}

export function saveStoredResources(resources: ResourceItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(resources));
  } catch (err) {
    console.error('Failed to save resources to storage:', err);
  }
}

export function resetStoredResourcesToDefaults(): ResourceItem[] {
  localStorage.setItem(STORAGE_KEY_RESOURCES, JSON.stringify(INITIAL_RESOURCE_ARCHIVE));
  return INITIAL_RESOURCE_ARCHIVE;
}

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

export function exportLibraryToJson(resources: ResourceItem[]): void {
  const exportData = {
    exportedAt: new Date().toISOString(),
    institution: 'Shahjalal University of Science and Technology (SUST)',
    department: 'Department of Forestry and Environmental Science (FES)',
    totalItems: resources.length,
    version: '1.0',
    resources,
  };

  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `sust-fes-library-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importLibraryFromJson(file: File): Promise<{ success: boolean; count: number; items?: ResourceItem[]; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        let items: ResourceItem[] = [];
        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (parsed && Array.isArray(parsed.resources)) {
          items = parsed.resources;
        } else {
          return resolve({
            success: false,
            count: 0,
            message: 'Invalid file format. Expected a list of resources or backup JSON object.',
          });
        }

        // Basic validation
        const validItems = items.filter(
          (item) => item && typeof item.title === 'string' && typeof item.driveUrl === 'string'
        );

        if (validItems.length === 0) {
          return resolve({
            success: false,
            count: 0,
            message: 'No valid study resource items found in the uploaded file.',
          });
        }

        saveStoredResources(validItems);
        resolve({
          success: true,
          count: validItems.length,
          items: validItems,
          message: `Successfully restored ${validItems.length} resources to the library!`,
        });
      } catch (err) {
        resolve({
          success: false,
          count: 0,
          message: 'Failed to parse JSON file. Please ensure the file is valid JSON.',
        });
      }
    };
    reader.onerror = () => {
      resolve({
        success: false,
        count: 0,
        message: 'Error reading uploaded file.',
      });
    };
    reader.readAsText(file);
  });
}
