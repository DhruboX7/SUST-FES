import { NoticeItem, NoticeTypeColor, NoticeTypeDefinition } from '../types';

export interface NoticeBadgeStyle {
  badge: string;
  solidBadge: string;
  dot: string;
  ring: string;
  swatch: string;
  label: string;
}

export const NOTICE_COLOR_PRESETS: Record<NoticeTypeColor, NoticeBadgeStyle> = {
  rose: {
    badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800',
    solidBadge: 'bg-rose-600 text-white border-rose-700',
    dot: 'bg-rose-500',
    ring: 'ring-rose-500/30',
    swatch: 'bg-rose-500',
    label: 'Rose (Urgent)',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800',
    solidBadge: 'bg-blue-600 text-white border-blue-700',
    dot: 'bg-blue-500',
    ring: 'ring-blue-500/30',
    swatch: 'bg-blue-500',
    label: 'Blue (Latest)',
  },
  emerald: {
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800',
    solidBadge: 'bg-emerald-700 text-white border-emerald-800',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
    swatch: 'bg-emerald-500',
    label: 'Emerald (New)',
  },
  amber: {
    badge: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800',
    solidBadge: 'bg-amber-500 text-stone-950 border-amber-600',
    dot: 'bg-amber-500',
    ring: 'ring-amber-500/30',
    swatch: 'bg-amber-500',
    label: 'Amber (Notice)',
  },
  purple: {
    badge: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-200 dark:border-purple-800',
    solidBadge: 'bg-purple-600 text-white border-purple-700',
    dot: 'bg-purple-500',
    ring: 'ring-purple-500/30',
    swatch: 'bg-purple-500',
    label: 'Purple (Event)',
  },
  stone: {
    badge: 'bg-stone-200 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700',
    solidBadge: 'bg-stone-700 text-white border-stone-800',
    dot: 'bg-stone-500',
    ring: 'ring-stone-500/30',
    swatch: 'bg-stone-500',
    label: 'Neutral',
  },
};

export function getNoticeColorStyle(color?: NoticeTypeColor): NoticeBadgeStyle {
  if (color && color in NOTICE_COLOR_PRESETS) {
    return NOTICE_COLOR_PRESETS[color];
  }
  return NOTICE_COLOR_PRESETS.stone;
}

export function slugifyNoticeTypeId(label: string): string {
  return (label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `type-${Date.now()}`;
}

export function resolveNoticeTagDefinitions(
  notice: NoticeItem,
  noticeTypes: NoticeTypeDefinition[]
): NoticeTypeDefinition[] {
  const tags = Array.isArray(notice?.tags) ? notice.tags : [];
  if (tags.length === 0) return [];

  const typeMap = new Map<string, NoticeTypeDefinition>(
    (Array.isArray(noticeTypes) ? noticeTypes : [])
      .filter((t): t is NoticeTypeDefinition => Boolean(t && t.id))
      .map((t) => [t.id.toLowerCase(), t])
  );

  const resolved: NoticeTypeDefinition[] = [];
  const seen = new Set<string>();

  for (const rawTag of tags) {
    if (typeof rawTag !== 'string' || !rawTag.trim()) continue;
    const key = rawTag.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const matched = typeMap.get(key);
    if (matched) {
      resolved.push(matched);
    } else {
      // Graceful fallback if a notice carries a legacy or removed tag string
      resolved.push({
        id: key,
        label: rawTag.trim(),
        color: 'stone',
        showInBar: true,
      });
    }
  }

  return resolved;
}

export function sortNoticesByPriority(notices: NoticeItem[]): NoticeItem[] {
  return [...(Array.isArray(notices) ? notices : [])]
    .filter((n): n is NoticeItem => Boolean(n && typeof n === 'object' && n.id))
    .sort((a, b) => {
      const aImportant = Boolean(a.pinned) || (Array.isArray(a.tags) && a.tags.includes('important'));
      const bImportant = Boolean(b.pinned) || (Array.isArray(b.tags) && b.tags.includes('important'));

      if (Boolean(a.pinned) !== Boolean(b.pinned)) {
        return a.pinned ? -1 : 1;
      }
      if (aImportant !== bImportant) {
        return aImportant ? -1 : 1;
      }

      const timeA = Date.parse(a.date || '') || 0;
      const timeB = Date.parse(b.date || '') || 0;
      return timeB - timeA;
    });
}

export function getBarEligibleNotices(
  notices: NoticeItem[],
  noticeTypes: NoticeTypeDefinition[],
  maxItems = 6
): NoticeItem[] {
  const sorted = sortNoticesByPriority(notices);
  const typeMap = new Map<string, NoticeTypeDefinition>(
    (Array.isArray(noticeTypes) ? noticeTypes : [])
      .filter((t): t is NoticeTypeDefinition => Boolean(t && t.id))
      .map((t) => [t.id.toLowerCase(), t])
  );

  const eligible = sorted.filter((notice) => {
    const tags = Array.isArray(notice.tags)
      ? notice.tags.map((t) => (typeof t === 'string' ? t.trim().toLowerCase() : '')).filter(Boolean)
      : [];

    if (tags.length > 0) {
      // Notice appears in the title bar if at least one of its tags is enabled for the bar
      // (or if it is an unknown custom tag string, default to true)
      return tags.some((tagId) => {
        const def = typeMap.get(tagId);
        return def ? def.showInBar !== false : true;
      });
    }

    // Untagged notices still surface in the bar if pinned
    return Boolean(notice.pinned);
  });

  // If no tagged or pinned notices match, fall back gracefully to the latest notices unless
  // all existing types were explicitly disabled from the bar
  const anyBarTypeEnabled = noticeTypes.some((t) => t.showInBar !== false);
  const result =
    eligible.length > 0
      ? eligible
      : anyBarTypeEnabled
        ? sorted.filter((n) => !Array.isArray(n.tags) || n.tags.length === 0)
        : [];

  return result.slice(0, Math.max(1, maxItems));
}
