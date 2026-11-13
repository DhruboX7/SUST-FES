import React from 'react';

/**
 * Resolves the base-path-aware fallback image asset URL so it works both at root (/)
 * and under subpath deployments (e.g. GitHub Pages ./ or /subpath/).
 */
export function getFallbackImageUrl(): string {
  const base =
    (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}assets/hero_forestry_sust.webp`;
}

/**
 * Rewrites high-resolution external botanical image URLs into sized thumbnail URLs
 * for card grids and thumbnail strips, dramatically cutting GPU bitmap memory while
 * leaving original URLs intact for fullscreen lightboxes.
 */
export function getOptimizedImageUrl(url?: string | null, width = 600): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return getFallbackImageUrl();
  }

  const trimmed = url.trim();

  // Keep relative/local assets untouched (normalize root-relative if needed)
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('data:')) {
    return trimmed;
  }

  try {
    // 1. Wikimedia Commons full-res originals -> /thumb/.../<width>px-<filename>
    if (
      trimmed.includes('upload.wikimedia.org/wikipedia/') &&
      !trimmed.includes('/thumb/')
    ) {
      const cleanNoQuery = trimmed.split('?')[0];
      const match = cleanNoQuery.match(
        /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/([0-9a-f]\/[0-9a-f]{2})\/([^/]+)$/i
      );
      if (match) {
        const [, baseHost, hashPath, fileName] = match;
        const lowerFile = fileName.toLowerCase();
        // Skip vector SVGs
        if (!lowerFile.endsWith('.svg')) {
          const thumbFile =
            lowerFile.endsWith('.tif') || lowerFile.endsWith('.tiff')
              ? `${width}px-${fileName}.jpg`
              : `${width}px-${fileName}`;
          return `${baseHost}/thumb/${hashPath}/${fileName}/${thumbFile}`;
        }
      }
    }

    // 2. Blogger / Googleusercontent hosted photos (/s1600/, /s2048/, etc.) -> /w<width>/
    if (trimmed.includes('blogger.googleusercontent.com/')) {
      return trimmed.replace(/\/s\d+(?:-c)?\//, `/w${width}/`);
    }

    // 3. Google Drive thumbnail proxy (?id=...&sz=w1200) -> &sz=w<width>
    if (trimmed.includes('drive.google.com/thumbnail') && /[?&]sz=w\d+/i.test(trimmed)) {
      return trimmed.replace(/([?&]sz=)w\d+/i, `$1w${width}`);
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

/**
 * Loop-safe React image error handler: clears `onerror` before setting the fallback URL
 * so missing assets or offline states can never cause infinite retry loops.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  img.onerror = null;
  const fallback = getFallbackImageUrl();
  if (!img.src.endsWith('/assets/hero_forestry_sust.webp')) {
    img.src = fallback;
  }
}
