import React, { useState, useMemo, useEffect } from 'react';
import {
  NoticeItem,
  NoticeTypeColor,
  NoticeTypeDefinition,
  NoticeBarSettings,
} from '../../types';
import {
  getStoredNoticeTypes,
  saveStoredNoticeTypes,
  resetStoredNoticeTypes,
  getStoredNoticeBarSettings,
  saveStoredNoticeBarSettings,
  DEFAULT_NOTICE_TYPES,
  DEFAULT_NOTICE_BAR_SETTINGS,
} from '../../utils/storage';
import {
  NOTICE_COLOR_PRESETS,
  getNoticeColorStyle,
  resolveNoticeTagDefinitions,
  slugifyNoticeTypeId,
} from '../../utils/noticeUtils';
import { handleImageError } from '../../utils/imageUtils';
import {
  Bell,
  Plus,
  Search,
  Edit3,
  Trash2,
  Pin,
  X,
  ExternalLink,
  CheckSquare,
  Square,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Tag,
  Megaphone,
  RotateCcw,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Check,
} from 'lucide-react';

interface AdminNoticesPanelProps {
  notices: NoticeItem[];
  onUpdateNotices: (notices: NoticeItem[]) => void;
}

const COLOR_OPTIONS: NoticeTypeColor[] = ['rose', 'blue', 'emerald', 'amber', 'purple', 'stone'];

export const AdminNoticesPanel: React.FC<AdminNoticesPanelProps> = ({
  notices,
  onUpdateNotices,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Managed Notice Types & Title Bar Settings
  const [noticeTypes, setNoticeTypes] = useState<NoticeTypeDefinition[]>(() => {
    try {
      return getStoredNoticeTypes();
    } catch {
      return DEFAULT_NOTICE_TYPES;
    }
  });
  const [barSettings, setBarSettings] = useState<NoticeBarSettings>(() => {
    try {
      return getStoredNoticeBarSettings();
    } catch {
      return DEFAULT_NOTICE_BAR_SETTINGS;
    }
  });
  const [showTypeManager, setShowTypeManager] = useState(false);

  // New Notice Type Form State
  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeColor, setNewTypeColor] = useState<NoticeTypeColor>('emerald');
  const [newTypeShowInBar, setNewTypeShowInBar] = useState(true);
  const [typeManagerError, setTypeManagerError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NoticeItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Notice Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [link, setLink] = useState('');
  const [pinned, setPinned] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Sync if Master Backup resets/imports data
  useEffect(() => {
    const handleSync = (e: Event) => {
      const collection = (e as CustomEvent<{ collection?: string }>).detail?.collection;
      if (!collection || collection === 'notices' || collection === 'all') {
        try {
          setNoticeTypes(getStoredNoticeTypes());
          setBarSettings(getStoredNoticeBarSettings());
        } catch {
          // Ignore fallback
        }
      }
    };
    window.addEventListener('sust_fes_data_updated', handleSync);
    return () => window.removeEventListener('sust_fes_data_updated', handleSync);
  }, []);

  const filteredNotices = useMemo(() => {
    const q = search.toLowerCase();
    return notices.filter((item) => {
      const matchesSearch =
        (item.title || '').toLowerCase().includes(q) ||
        (item.body || '').toLowerCase().includes(q) ||
        (item.date || '').includes(search);

      const matchesType =
        typeFilter === 'all' ||
        (Array.isArray(item.tags) &&
          item.tags.some((t) => typeof t === 'string' && t.toLowerCase() === typeFilter.toLowerCase()));

      return matchesSearch && matchesType;
    });
  }, [notices, search, typeFilter]);

  // =====================================
  // NOTICE TYPE & TITLE BAR HANDLERS
  // =====================================

  const updateBarSettings = (patch: Partial<NoticeBarSettings>) => {
    const next = { ...barSettings, ...patch };
    setBarSettings(next);
    saveStoredNoticeBarSettings(next);
  };

  const handleAddNoticeType = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLabel = newTypeLabel.trim();
    if (!cleanLabel) {
      setTypeManagerError('Enter a type label (e.g., Urgent, Result, Seminar).');
      return;
    }

    const baseSlug = slugifyNoticeTypeId(cleanLabel);
    let candidateId = baseSlug;
    let suffix = 2;
    const existingIds = new Set(noticeTypes.map((t) => t.id.toLowerCase()));
    while (existingIds.has(candidateId.toLowerCase())) {
      candidateId = `${baseSlug}-${suffix++}`;
    }

    const created: NoticeTypeDefinition = {
      id: candidateId,
      label: cleanLabel,
      color: newTypeColor,
      showInBar: newTypeShowInBar,
      order: noticeTypes.length + 1,
    };

    const next = [...noticeTypes, created];
    setNoticeTypes(next);
    saveStoredNoticeTypes(next);
    setNewTypeLabel('');
    setNewTypeColor('emerald');
    setNewTypeShowInBar(true);
    setTypeManagerError('');
  };

  const handleUpdateNoticeType = (id: string, patch: Partial<NoticeTypeDefinition>) => {
    const next = noticeTypes.map((t) => (t.id === id ? { ...t, ...patch } : t));
    setNoticeTypes(next);
    saveStoredNoticeTypes(next);
  };

  const handleDeleteNoticeType = (id: string) => {
    const next = noticeTypes.filter((t) => t.id !== id);
    setNoticeTypes(next);
    saveStoredNoticeTypes(next);
    if (typeFilter === id) {
      setTypeFilter('all');
    }
  };

  const handleResetDefaultTypes = () => {
    const defaults = resetStoredNoticeTypes();
    setNoticeTypes(defaults);
    setBarSettings(DEFAULT_NOTICE_BAR_SETTINGS);
    saveStoredNoticeBarSettings(DEFAULT_NOTICE_BAR_SETTINGS);
    setTypeManagerError('');
  };

  // =====================================
  // NOTICE CRUD & INLINE TAG HANDLERS
  // =====================================

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setBody('');
    setImageUrl('');
    setAttachmentUrl('');
    setLink('');
    setPinned(false);
    // Default new notices to 'new' and 'latest' if present in managed types
    const defaultNewTags = ['latest', 'new'].filter((id) =>
      noticeTypes.some((t) => t.id === id)
    );
    setSelectedTags(defaultNewTags);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: NoticeItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDate(item.date);
    setBody(item.body);
    setImageUrl(item.imageUrl || '');
    setAttachmentUrl(item.attachmentUrl || '');
    setLink(item.link || '');
    setPinned(item.pinned || false);
    setSelectedTags(Array.isArray(item.tags) ? [...item.tags] : []);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleToggleFormTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleInlineToggleTag = (noticeId: string, tagId: string) => {
    const updated = notices.map((n) => {
      if (n.id !== noticeId) return n;
      const current = Array.isArray(n.tags) ? n.tags : [];
      const hasTag = current.some((t) => t.toLowerCase() === tagId.toLowerCase());
      const nextTags = hasTag
        ? current.filter((t) => t.toLowerCase() !== tagId.toLowerCase())
        : [...current, tagId];
      return { ...n, tags: nextTags };
    });
    onUpdateNotices(updated);
  };

  const handleTogglePin = (id: string) => {
    const updated = notices.map((n) =>
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    onUpdateNotices(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setFormError('Please enter a notice title and announcement body.');
      return;
    }

    if (editingItem) {
      const updated: NoticeItem = {
        ...editingItem,
        title: title.trim(),
        date: date.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        attachmentUrl: attachmentUrl.trim() || undefined,
        link: link.trim() || undefined,
        pinned,
        tags: selectedTags,
      };
      const newAll = notices.map((n) => (n.id === editingItem.id ? updated : n));
      onUpdateNotices(newAll);
    } else {
      const newItem: NoticeItem = {
        id: `notice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        date: date.trim(),
        body: body.trim(),
        imageUrl: imageUrl.trim() || undefined,
        attachmentUrl: attachmentUrl.trim() || undefined,
        link: link.trim() || undefined,
        pinned,
        tags: selectedTags,
      };
      onUpdateNotices([newItem, ...notices]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const updated = notices.filter((n) => n.id !== id);
    onUpdateNotices(updated);
    setDeleteConfirmId(null);
  };

  const handleBatchDelete = () => {
    const updated = notices.filter((n) => !selectedIds.includes(n.id));
    onUpdateNotices(updated);
    setSelectedIds([]);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF9F4] dark:bg-[#19382B] p-4 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20">
        <div>
          <h3 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2 flex-wrap">
            <Bell className="w-5 h-5 text-[#42684D] dark:text-[#8A9C74]" />
            <span>Notice Board & Official Circular Management</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
              {notices.length} notices
            </span>
          </h3>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6]/80 mt-0.5">
            Publish department circulars, control Recent Notice Title Bar visibility, and manage notice types & tags.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowTypeManager((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showTypeManager
                ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] border-[#19382B] dark:border-[#42684D]'
                : 'bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 hover:border-[#42684D]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Types & Title Bar</span>
          </button>

          {selectedIds.length > 0 && (
            deleteConfirmId === 'batch' ? (
              <div className="flex items-center gap-1.5 p-1 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453]/60 animate-fade-in">
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="px-3 py-1 text-xs font-semibold bg-[#987453] hover:bg-[#19382B] text-[#FAF9F4] rounded-sm transition-colors cursor-pointer"
                >
                  Confirm Delete ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-1 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirmId('batch')}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#987453] hover:bg-[#19382B] text-[#FAF9F4] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )
          )}

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Notice</span>
          </button>
        </div>
      </div>

      {/* MANAGEABLE NOTICE TYPES & TITLE BAR PANEL */}
      {showTypeManager && (
        <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#42684D]/50 dark:border-[#BBC4A6]/25 p-4 sm:p-5 space-y-5 animate-fade-in">
          {/* Section 1: Recent Notices Title Bar Controls */}
          <div className="space-y-3 pb-4 border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                <h4 className="font-editorial text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                  Recent Notices Title Bar Controls
                </h4>
              </div>
              <button
                type="button"
                onClick={() => updateBarSettings({ enabled: !barSettings.enabled })}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-colors cursor-pointer self-start sm:self-auto ${
                  barSettings.enabled
                    ? 'bg-[#42684D] text-[#FAF9F4] border-[#42684D]'
                    : 'bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25'
                }`}
              >
                {barSettings.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{barSettings.enabled ? 'Title Bar Active' : 'Title Bar Hidden'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Title Bar Label
                </label>
                <input
                  type="text"
                  value={barSettings.title}
                  onChange={(e) => updateBarSettings({ title: e.target.value })}
                  placeholder="Latest Notices"
                  className="w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] focus:outline-none focus:border-[#42684D]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Max Recent Notices Cycled
                </label>
                <select
                  value={barSettings.maxItems}
                  onChange={(e) => updateBarSettings({ maxItems: Number(e.target.value) || 6 })}
                  className="w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] focus:outline-none focus:border-[#42684D]"
                >
                  {[3, 5, 6, 8, 10, 15].map((num) => (
                    <option key={num} value={num}>
                      Up to {num} notices
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Transition Interval
                </label>
                <select
                  value={barSettings.rotationIntervalSeconds || 5}
                  onChange={(e) =>
                    updateBarSettings({ rotationIntervalSeconds: Number(e.target.value) || 5 })
                  }
                  disabled={!barSettings.autoRotate}
                  className="w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] disabled:opacity-50 focus:outline-none focus:border-[#42684D]"
                >
                  {[3, 5, 7, 10, 15, 20].map((sec) => (
                    <option key={sec} value={sec}>
                      Every {sec} seconds
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] w-full">
                  <input
                    type="checkbox"
                    checked={barSettings.autoRotate}
                    onChange={(e) => updateBarSettings({ autoRotate: e.target.checked })}
                    className="w-4 h-4 rounded-sm accent-[#42684D]"
                  />
                  <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                    Auto-cycle recent notices
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 2: Notice Types / Tags Directory */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-editorial text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>Manage Notice Types & Tags</span>
                </h4>
                <p className="text-[11px] text-[#42684D] dark:text-[#BBC4A6]/80">
                  Add, rename, recolor, or control which notice types appear in the top Recent Notices Title Bar.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetDefaultTypes}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {typeManagerError && (
              <div className="p-2.5 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453]/60 rounded-md text-[#987453] dark:text-[#F3F1E8] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#987453]" />
                <span>{typeManagerError}</span>
              </div>
            )}

            {/* Existing Types List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {noticeTypes.map((typeDef) => {
                const style = getNoticeColorStyle(typeDef.color);
                return (
                  <div
                    key={typeDef.id}
                    className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22]"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                      <span className={`w-2.5 h-2.5 rounded-sm shrink-0 ${style.swatch}`} />
                      <input
                        type="text"
                        value={typeDef.label}
                        onChange={(e) => handleUpdateNoticeType(typeDef.id, { label: e.target.value })}
                        aria-label={`Rename notice type ${typeDef.label}`}
                        className="w-full px-2 py-1 text-xs font-semibold rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] focus:outline-none focus:border-[#42684D]"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={typeDef.color}
                        onChange={(e) =>
                          handleUpdateNoticeType(typeDef.id, { color: e.target.value as NoticeTypeColor })
                        }
                        aria-label={`Color for ${typeDef.label}`}
                        className="px-2 py-1 text-[11px] font-semibold rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] focus:outline-none focus:border-[#42684D]"
                      >
                        {COLOR_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {NOTICE_COLOR_PRESETS[c].label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateNoticeType(typeDef.id, { showInBar: !typeDef.showInBar })
                        }
                        title={typeDef.showInBar ? 'Shown in Title Bar (click to hide)' : 'Hidden from Title Bar (click to show)'}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-[11px] font-semibold border transition-colors cursor-pointer ${
                          typeDef.showInBar
                            ? 'bg-[#42684D] text-[#FAF9F4] border-[#42684D]'
                            : 'bg-[#EAE7DA] dark:bg-[#19382B] text-[#8A9C74] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20'
                        }`}
                      >
                        {typeDef.showInBar ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>Bar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteNoticeType(typeDef.id)}
                        title={`Delete notice type "${typeDef.label}"`}
                        className="p-1 text-[#8A9C74] hover:text-[#987453] rounded-sm transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Notice Type Form */}
            <form
              onSubmit={handleAddNoticeType}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-lg bg-[#EAE7DA]/70 dark:bg-[#142D22] border border-dashed border-[#BBC4A6] dark:border-[#BBC4A6]/30 text-xs"
            >
              <input
                type="text"
                value={newTypeLabel}
                onChange={(e) => setNewTypeLabel(e.target.value)}
                placeholder="New type name (e.g., Urgent, Scholarship, Result)..."
                className="flex-1 px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] focus:outline-none focus:border-[#42684D]"
              />
              <select
                value={newTypeColor}
                onChange={(e) => setNewTypeColor(e.target.value as NoticeTypeColor)}
                className="px-2.5 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] font-semibold focus:outline-none focus:border-[#42684D]"
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {NOTICE_COLOR_PRESETS[c].label}
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newTypeShowInBar}
                  onChange={(e) => setNewTypeShowInBar(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-sm accent-[#42684D]"
                />
                <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">Show in Bar</span>
              </label>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-md bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Type</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search & Quick Type Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A9C74]" />
          <input
            type="text"
            placeholder="Search notices by title, date, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] placeholder:text-[#8A9C74] focus:outline-none focus:border-[#42684D]"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] border-[#19382B] dark:border-[#42684D]'
                : 'bg-[#FAF9F4] dark:bg-[#19382B] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-[#42684D] dark:text-[#BBC4A6] hover:border-[#42684D]'
            }`}
          >
            All ({notices.length})
          </button>
          {noticeTypes.map((typeDef) => {
            const style = getNoticeColorStyle(typeDef.color);
            const active = typeFilter.toLowerCase() === typeDef.id.toLowerCase();
            return (
              <button
                key={typeDef.id}
                type="button"
                onClick={() => setTypeFilter(active ? 'all' : typeDef.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                  active ? style.solidBadge : style.badge
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-xs shrink-0 ${active ? 'bg-[#FFFBEB]' : style.dot}`} />
                <span>{typeDef.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notices Data Table */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EAE7DA] dark:bg-[#142D22] border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-[#42684D] dark:text-[#BBC4A6] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button
                    onClick={() => {
                      if (selectedIds.length === filteredNotices.length) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(filteredNotices.map((n) => n.id));
                      }
                    }}
                    className="text-[#42684D] dark:text-[#BBC4A6] cursor-pointer"
                  >
                    {selectedIds.length === filteredNotices.length && filteredNotices.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Notice Title & Tags</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Priority Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BBC4A6]/40 dark:divide-[#BBC4A6]/15">
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#8A9C74]">
                    No notices match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredNotices.map((item) => {
                  const resolvedTags = resolveNoticeTagDefinitions(item, noticeTypes);
                  const activeTagSet = new Set(resolvedTags.map((t) => t.id.toLowerCase()));

                  return (
                    <tr key={item.id} className="hover:bg-[#EAE7DA]/50 dark:hover:bg-[#142D22]/60 align-top transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            setSelectedIds((prev) =>
                              prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]
                            )
                          }
                          className="text-[#8A9C74] hover:text-[#42684D] cursor-pointer"
                        >
                          {selectedIds.includes(item.id) ? (
                            <CheckSquare className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 space-y-1.5">
                        <div className="font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2 flex-wrap">
                          {item.pinned && (
                            <Pin className="w-3.5 h-3.5 text-[#987453] shrink-0" />
                          )}
                          <span>{item.title}</span>
                          {item.imageUrl && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                              <ImageIcon className="w-3 h-3" /> Image Scan
                            </span>
                          )}
                          {(item.attachmentUrl || item.link) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#EAE7DA] dark:bg-[#142D22] text-[#987453] dark:text-[#BBC4A6] border border-[#987453]/40">
                              <FileText className="w-3 h-3" /> Document
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-[#42684D] dark:text-[#BBC4A6]/80 max-w-xl line-clamp-1">
                          {item.body}
                        </div>

                        {/* Quick Inline Tag Toggles */}
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          <span className="text-[10px] font-semibold text-[#8A9C74] uppercase mr-0.5">
                            Types:
                          </span>
                          {noticeTypes.map((typeDef) => {
                            const isAssigned = activeTagSet.has(typeDef.id.toLowerCase());
                            const style = getNoticeColorStyle(typeDef.color);
                            return (
                              <button
                                key={typeDef.id}
                                type="button"
                                onClick={() => handleInlineToggleTag(item.id, typeDef.id)}
                                title={
                                  isAssigned
                                    ? `Click to remove "${typeDef.label}" tag`
                                    : `Click to add "${typeDef.label}" tag`
                                }
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-semibold border transition-all cursor-pointer ${
                                  isAssigned
                                    ? style.badge
                                    : 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#8A9C74] border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                                }`}
                              >
                                {isAssigned ? (
                                  <Check className="w-2.5 h-2.5" />
                                ) : (
                                  <span className={`w-1.5 h-1.5 rounded-xs shrink-0 opacity-65 ${style.dot}`} />
                                )}
                                <span>{typeDef.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#987453] dark:text-[#BBC4A6] whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePin(item.id)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-sm flex items-center gap-1 border transition-colors cursor-pointer ${
                            item.pinned
                              ? 'bg-[#FEE2E2] text-[#991B1B] border-[#F87171]/70 dark:bg-[#7F1D1D]/60 dark:text-[#FECACA] dark:border-[#F87171]/50'
                              : 'bg-[#EAE7DA]/60 dark:bg-[#142D22] text-[#8A9C74] border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                          }`}
                        >
                          <Pin className="w-3 h-3" />
                          <span>{item.pinned ? 'Pinned / Urgent' : 'Standard'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.imageUrl && (
                            <a
                              href={item.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] rounded-sm"
                              title="View Circular Image"
                            >
                              <ImageIcon className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {(item.attachmentUrl || item.link) && (
                            <a
                              href={item.attachmentUrl || item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] rounded-sm"
                              title="Open Document Attachment"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] rounded-sm cursor-pointer"
                            title="Edit Notice"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-2 py-1 text-[10px] font-semibold bg-[#987453] hover:bg-[#19382B] text-[#FAF9F4] rounded-sm cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button onClick={() => setDeleteConfirmId(null)} className="p-1 text-[#8A9C74] cursor-pointer">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 text-[#8A9C74] hover:text-[#987453] rounded-sm cursor-pointer"
                              title="Delete Notice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#19382B]/75 animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-lg p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 pb-3">
              <h3 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                {editingItem ? 'Edit Department Notice' : 'Post Official Notice'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453]/60 rounded-md text-[#987453] dark:text-[#F3F1E8] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#987453]" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Notice Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Semester Final Examination Routine - Autumn 2024"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] focus:outline-none focus:border-[#42684D]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] focus:outline-none focus:border-[#42684D]"
                    required
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                      className="w-4 h-4 rounded-sm accent-[#987453]"
                    />
                    <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5 text-[#987453]" />
                      <span>Pin to Top (Urgent Notice)</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Notice Types / Tags Selection */}
              <div>
                <label className="block font-semibold mb-1.5 text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>Notice Types & Tags (Shown in Title Bar)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22]">
                  {noticeTypes.length === 0 ? (
                    <span className="text-[11px] text-[#8A9C74]">
                      No notice types defined. Open Manage Types & Title Bar to add types.
                    </span>
                  ) : (
                    noticeTypes.map((typeDef) => {
                      const active = selectedTags.includes(typeDef.id);
                      const style = getNoticeColorStyle(typeDef.color);
                      return (
                        <button
                          key={typeDef.id}
                          type="button"
                          onClick={() => handleToggleFormTag(typeDef.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-semibold border transition-all cursor-pointer ${
                            active
                              ? style.solidBadge
                              : `${style.badge} opacity-85 hover:opacity-100`
                          }`}
                        >
                          {active ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <span className={`w-1.5 h-1.5 rounded-xs shrink-0 ${style.dot}`} />
                          )}
                          <span>{typeDef.label}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Notice Body */}
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  Notice Body & Directives *
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Full circular announcement text, room instructions, deadlines..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] focus:outline-none focus:border-[#42684D]"
                  required
                />
              </div>

              {/* ATTACHMENT / IMAGE OPTION INSIDE NOTICE */}
              <div className="p-3.5 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22] space-y-3">
                <div className="font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>Circular Image & Document Attachments</span>
                </div>

                {/* Circular Image Field */}
                <div>
                  <label className="block font-medium mb-1 text-[#42684D] dark:text-[#BBC4A6]">
                    Circular Image URL (Scan / Photo / Banner)
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or /assets/..."
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] font-mono focus:outline-none focus:border-[#42684D]"
                  />
                  {imageUrl && (
                    <div className="mt-2 p-2 border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 rounded-md bg-[#FAF9F4] dark:bg-[#19382B] flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt="Circular preview"
                        decoding="async"
                        onError={handleImageError}
                        className="w-16 h-12 object-cover rounded-sm border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/25 shrink-0"
                      />
                      <div className="text-[11px] text-[#42684D] dark:text-[#BBC4A6]">
                        Image preview active. Will display inline with full-screen zoom modal on notice board.
                      </div>
                    </div>
                  )}
                </div>

                {/* Document Attachment Field */}
                <div>
                  <label className="block font-medium mb-1 text-[#42684D] dark:text-[#BBC4A6]">
                    Document Attachment URL (PDF Routine / Form / Drive link)
                  </label>
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://... (e.g. Google Drive link or PDF download)"
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] font-mono focus:outline-none focus:border-[#42684D]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#BBC4A6]/40 dark:border-[#BBC4A6]/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] rounded-md cursor-pointer transition-colors"
                >
                  {editingItem ? 'Save Notice' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
