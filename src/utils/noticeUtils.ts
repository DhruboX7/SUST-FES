import { NoticeItem, NoticeTypeColor, NoticeTypeDefinition } from '../types';

export interface NoticeBadgeStyle {
  badge: string;
  solidBadge: string;
  dot: string;
  ring: string;
  swatch: string;
  cardAccent: string;
  label: string;
}

export const NOTICE_COLOR_PRESETS: Record<NoticeTypeColor, NoticeBadgeStyle> = {
  rose: {
    badge: 'bg-[#FEE2E2] text-[#991B1B] border-[#F87171]/70 dark:bg-[#7F1D1D]/60 dark:text-[#FECACA] dark:border-[#F87171]/50',
    solidBadge: 'bg-[#B91C1C] text-[#FFF5F5] border-[#991B1B] dark:bg-[#DC2626] dark:text-[#FFF5F5] dark:border-[#F87171]',
    dot: 'bg-[#DC2626] dark:bg-[#F87171]',
    ring: 'ring-[#DC2626]/30',
    swatch: 'bg-[#DC2626]',
    cardAccent: 'border-l-[#DC2626] dark:border-l-[#F87171]',
    label: 'Crimson Red (Important)',
  },
  blue: {
    badge: 'bg-[#DBEAFE] text-[#1E40AF] border-[#60A5FA]/70 dark:bg-[#1E3A8A]/60 dark:text-[#BFDBFE] dark:border-[#60A5FA]/50',
    solidBadge: 'bg-[#1D4ED8] text-[#EFF6FF] border-[#1E40AF] dark:bg-[#2563EB] dark:text-[#EFF6FF] dark:border-[#60A5FA]',
    dot: 'bg-[#2563EB] dark:bg-[#60A5FA]',
    ring: 'ring-[#2563EB]/30',
    swatch: 'bg-[#2563EB]',
    cardAccent: 'border-l-[#2563EB] dark:border-l-[#60A5FA]',
    label: 'Cerulean Blue (Latest)',
  },
  emerald: {
    badge: 'bg-[#D1FAE5] text-[#065F46] border-[#34D399]/75 dark:bg-[#064E3B]/65 dark:text-[#A7F3D0] dark:border-[#34D399]/50',
    solidBadge: 'bg-[#047857] text-[#ECFDF5] border-[#065F46] dark:bg-[#059669] dark:text-[#ECFDF5] dark:border-[#34D399]',
    dot: 'bg-[#059669] dark:bg-[#34D399]',
    ring: 'ring-[#059669]/30',
    swatch: 'bg-[#059669]',
    cardAccent: 'border-l-[#059669] dark:border-l-[#34D399]',
    label: 'Lush Emerald (New)',
  },
  amber: {
    badge: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/75 dark:bg-[#78350F]/60 dark:text-[#FDE68A] dark:border-[#FBBF24]/50',
    solidBadge: 'bg-[#D97706] text-[#FFFBEB] border-[#B45309] dark:bg-[#D97706] dark:text-[#FFFBEB] dark:border-[#FBBF24]',
    dot: 'bg-[#D97706] dark:bg-[#FBBF24]',
    ring: 'ring-[#D97706]/30',
    swatch: 'bg-[#D97706]',
    cardAccent: 'border-l-[#D97706] dark:border-l-[#FBBF24]',
    label: 'Amber Gold (Exam / Notice)',
  },
  purple: {
    badge: 'bg-[#EDE9FE] text-[#5B21B6] border-[#A78BFA]/70 dark:bg-[#4C1D95]/60 dark:text-[#DDD6FE] dark:border-[#A78BFA]/50',
    solidBadge: 'bg-[#6D28D9] text-[#F5F3FF] border-[#5B21B6] dark:bg-[#7C3AED] dark:text-[#F5F3FF] dark:border-[#A78BFA]',
    dot: 'bg-[#7C3AED] dark:bg-[#A78BFA]',
    ring: 'ring-[#7C3AED]/30',
    swatch: 'bg-[#7C3AED]',
    cardAccent: 'border-l-[#7C3AED] dark:border-l-[#A78BFA]',
    label: 'Plum Violet (Event / Tour)',
  },
  stone: {
    badge: 'bg-[#E7E5E4] text-[#292524] border-[#A8A29E]/75 dark:bg-[#292524]/85 dark:text-[#E7E5E4] dark:border-[#A8A29E]/45',
    solidBadge: 'bg-[#57534E] text-[#FAF9F4] border-[#44403C] dark:bg-[#78716C] dark:text-[#FAF9F4] dark:border-[#A8A29E]',
    dot: 'bg-[#78716C] dark:bg-[#A8A29E]',
    ring: 'ring-[#78716C]/30',
    swatch: 'bg-[#78716C]',
    cardAccent: 'border-l-[#78716C] dark:border-l-[#A8A29E]',
    label: 'Warm Slate (Neutral)',
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
