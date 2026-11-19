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
    badge: 'bg-[#987453]/15 text-[#6D4E32] border-[#987453]/40 dark:bg-[#987453]/25 dark:text-[#E9D8C7] dark:border-[#987453]/45',
    solidBadge: 'bg-[#987453] text-[#F3F1E8] border-[#7E5D40]',
    dot: 'bg-[#987453]',
    ring: 'ring-[#987453]/30',
    swatch: 'bg-[#987453]',
    label: 'Earth Brown (Urgent)',
  },
  blue: {
    badge: 'bg-[#BBC4A6]/40 text-[#19382B] border-[#8A9C74]/50 dark:bg-[#42684D]/35 dark:text-[#F3F1E8] dark:border-[#8A9C74]/40',
    solidBadge: 'bg-[#42684D] text-[#F3F1E8] border-[#19382B]',
    dot: 'bg-[#42684D]',
    ring: 'ring-[#42684D]/30',
    swatch: 'bg-[#42684D]',
    label: 'Canopy (Latest)',
  },
  emerald: {
    badge: 'bg-[#42684D]/15 text-[#19382B] border-[#42684D]/35 dark:bg-[#42684D]/40 dark:text-[#F3F1E8] dark:border-[#8A9C74]/45',
    solidBadge: 'bg-[#19382B] text-[#F3F1E8] border-[#19382B]',
    dot: 'bg-[#19382B]',
    ring: 'ring-[#42684D]/30',
    swatch: 'bg-[#19382B]',
    label: 'Forest Ink (New)',
  },
  amber: {
    badge: 'bg-[#987453]/15 text-[#6D4E32] border-[#987453]/40 dark:bg-[#987453]/20 dark:text-[#E9D8C7] dark:border-[#987453]/40',
    solidBadge: 'bg-[#987453] text-[#F3F1E8] border-[#7E5D40]',
    dot: 'bg-[#987453]',
    ring: 'ring-[#987453]/30',
    swatch: 'bg-[#987453]',
    label: 'Earth (Notice)',
  },
  purple: {
    badge: 'bg-[#8A9C74]/20 text-[#19382B] border-[#8A9C74]/45 dark:bg-[#8A9C74]/25 dark:text-[#F3F1E8] dark:border-[#8A9C74]/40',
    solidBadge: 'bg-[#8A9C74] text-[#19382B] border-[#42684D]',
    dot: 'bg-[#8A9C74]',
    ring: 'ring-[#8A9C74]/30',
    swatch: 'bg-[#8A9C74]',
    label: 'Fern (Event)',
  },
  stone: {
    badge: 'bg-[#EAE7DA] text-[#19382B] border-[#BBC4A6] dark:bg-[#19382B] dark:text-[#BBC4A6] dark:border-[#BBC4A6]/25',
    solidBadge: 'bg-[#42684D] text-[#F3F1E8] border-[#19382B]',
    dot: 'bg-[#8A9C74]',
    ring: 'ring-[#BBC4A6]/40',
    swatch: 'bg-[#BBC4A6]',
    label: 'Moss (Neutral)',
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
