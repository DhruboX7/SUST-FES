export type FontPresetId = 'editorial-forest' | 'botanical-monograph' | 'scholarly-manrope';

export interface FontPreset {
  id: FontPresetId;
  name: string;
  tagline: string;
  headingLabel: string;
  bodyLabel: string;
  headingFont: string;
  bodyFont: string;
  scientificFont: string;
  monoFont: string;
  googleFontsUrl: string;
}

export const DEFAULT_FONT_PRESET_ID: FontPresetId = 'editorial-forest';
const STORAGE_KEY_FONT_PRESET = 'sust_fes_editorial_font_v2';

const CORE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,500;1,600;1,700&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=IBM+Plex+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Serif+Bengali:wght@500;600;700&display=swap';

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'editorial-forest',
    name: 'Forestry Editorial',
    tagline: 'Editorial Fraunces titles paired with Manrope UI and Cormorant Garamond botanical italics',
    headingLabel: 'Fraunces',
    bodyLabel: 'Manrope + Noto Bengali',
    headingFont: "'Fraunces', 'Noto Serif Bengali', Georgia, serif",
    bodyFont: "'Manrope', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif",
    scientificFont: "'Cormorant Garamond', 'Noto Serif Bengali', Georgia, serif",
    monoFont: "'IBM Plex Mono', ui-monospace, monospace",
    googleFontsUrl: CORE_FONTS_URL,
  },
  {
    id: 'botanical-monograph',
    name: 'Herbarium Monograph',
    tagline: 'Classical Cormorant Garamond specimen headers with crisp Manrope body reading',
    headingLabel: 'Cormorant Garamond',
    bodyLabel: 'Manrope + Noto Bengali',
    headingFont: "'Cormorant Garamond', 'Noto Serif Bengali', Georgia, serif",
    bodyFont: "'Manrope', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif",
    scientificFont: "'Cormorant Garamond', 'Noto Serif Bengali', Georgia, serif",
    monoFont: "'IBM Plex Mono', ui-monospace, monospace",
    googleFontsUrl: CORE_FONTS_URL,
  },
  {
    id: 'scholarly-manrope',
    name: 'Field Research Compact',
    tagline: 'Clean Manrope structural titles with Fraunces display accents for dense study tables',
    headingLabel: 'Manrope',
    bodyLabel: 'Manrope + Noto Bengali',
    headingFont: "'Manrope', 'Noto Serif Bengali', system-ui, sans-serif",
    bodyFont: "'Manrope', 'Noto Sans Bengali', system-ui, -apple-system, sans-serif",
    scientificFont: "'Cormorant Garamond', 'Noto Serif Bengali', Georgia, serif",
    monoFont: "'IBM Plex Mono', ui-monospace, monospace",
    googleFontsUrl: CORE_FONTS_URL,
  },
];

export function getStoredFontPresetId(): FontPresetId {
  try {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(STORAGE_KEY_FONT_PRESET);
      if (saved && FONT_PRESETS.some((p) => p.id === saved)) {
        return saved as FontPresetId;
      }
    }
  } catch {
    // Ignore storage access errors
  }
  return DEFAULT_FONT_PRESET_ID;
}

export function applyFontPreset(presetId: FontPresetId, persist = true): FontPreset {
  const preset = FONT_PRESETS.find((p) => p.id === presetId) || FONT_PRESETS[0];

  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--font-heading', preset.headingFont);
    root.style.setProperty('--font-body', preset.bodyFont);
    root.style.setProperty('--font-sans', preset.bodyFont);
    root.style.setProperty('--font-scientific', preset.scientificFont);
    root.style.setProperty('--font-mono', preset.monoFont);
  }

  if (persist) {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY_FONT_PRESET, preset.id);
      }
    } catch {
      // Ignore storage access errors
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sust_fes_font_changed', { detail: preset.id }));
  }

  return preset;
}
