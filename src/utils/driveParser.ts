import { DriveParseResult, FileType } from '../types';

/**
 * Parses any Google Drive, Google Docs/Slides/Sheets, or OneDrive link
 * and extracts the file/folder ID, generating responsive preview and direct download URLs.
 */
export function parseGoogleDriveUrl(rawUrl: string): DriveParseResult {
  const url = rawUrl.trim();

  if (!url) {
    return {
      valid: false,
      fileId: '',
      fileType: 'link',
      previewUrl: '',
      downloadUrl: '',
      isFolder: false,
      errorMessage: 'Please enter a valid Google Drive or document link.',
    };
  }

  // Check for Google Drive folder
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    const folderId = folderMatch[1];
    return {
      valid: true,
      fileId: folderId,
      fileType: 'folder',
      previewUrl: `https://drive.google.com/embeddedfolderview?id=${folderId}#list`,
      downloadUrl: url,
      isFolder: true,
    };
  }

  // Google Drive standard file link: /file/d/{id}/...
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    const fileId = fileDMatch[1];
    return {
      valid: true,
      fileId,
      fileType: 'pdf',
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      isFolder: false,
    };
  }

  // Google Drive open?id={id} or uc?id={id}
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    const fileId = idParamMatch[1];
    return {
      valid: true,
      fileId,
      fileType: 'pdf',
      previewUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      isFolder: false,
    };
  }

  // Google Docs: /document/d/{id}/...
  const docMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch && docMatch[1]) {
    const fileId = docMatch[1];
    return {
      valid: true,
      fileId,
      fileType: 'doc',
      previewUrl: `https://docs.google.com/document/d/${fileId}/preview`,
      downloadUrl: `https://docs.google.com/document/d/${fileId}/export?format=pdf`,
      isFolder: false,
    };
  }

  // Google Slides: /presentation/d/{id}/...
  const presentationMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (presentationMatch && presentationMatch[1]) {
    const fileId = presentationMatch[1];
    return {
      valid: true,
      fileId,
      fileType: 'ppt',
      previewUrl: `https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false`,
      downloadUrl: `https://docs.google.com/presentation/d/${fileId}/export/pdf`,
      isFolder: false,
    };
  }

  // Google Sheets: /spreadsheets/d/{id}/...
  const sheetMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch && sheetMatch[1]) {
    const fileId = sheetMatch[1];
    return {
      valid: true,
      fileId,
      fileType: 'sheet',
      previewUrl: `https://docs.google.com/spreadsheets/d/${fileId}/preview`,
      downloadUrl: `https://docs.google.com/spreadsheets/d/${fileId}/export?format=xlsx`,
      isFolder: false,
    };
  }

  // Fallback: If it's a generic web URL or cloud document
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return {
        valid: true,
        fileId: btoa(url).slice(0, 16),
        fileType: 'link',
        previewUrl: url,
        downloadUrl: url,
        isFolder: false,
      };
    }
  } catch {
    // invalid URL format
  }

  return {
    valid: false,
    fileId: '',
    fileType: 'link',
    previewUrl: '',
    downloadUrl: '',
    isFolder: false,
    errorMessage: 'Invalid URL. Please enter a valid Google Drive or web share link.',
  };
}

export function guessFileType(url: string, category: string, explicitType?: FileType): FileType {
  if (explicitType && explicitType !== 'link') return explicitType;
  const lower = url.toLowerCase();
  if (lower.includes('/folders/')) return 'folder';
  if (lower.includes('presentation') || lower.includes('.ppt') || category === 'slides') return 'ppt';
  if (lower.includes('spreadsheets') || lower.includes('.xls')) return 'sheet';
  if (lower.includes('document') || lower.includes('.doc')) return 'doc';
  if (category === 'pyq' || category === 'book' || category === 'practical' || lower.includes('.pdf')) return 'pdf';
  return 'pdf';
}
