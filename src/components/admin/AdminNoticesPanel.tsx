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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2 flex-wrap">
            <Bell className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Notice Board & Official Circular Management</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {notices.length} notices
            </span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Publish department circulars, control Recent Notice Title Bar visibility, and manage notice types & tags.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowTypeManager((prev) => !prev)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 transition-colors cursor-pointer ${
              showTypeManager
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700'
                : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Manage Types & Title Bar</span>
          </button>

          {selectedIds.length > 0 && (
            deleteConfirmId === 'batch' ? (
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 animate-in fade-in">
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="px-3 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors shadow-xs"
                >
                  Confirm Delete ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-1 text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirmId('batch')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )
          )}

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Notice</span>
          </button>
        </div>
      </div>

      {/* MANAGEABLE NOTICE TYPES & TITLE BAR PANEL */}
      {showTypeManager && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/70 p-4 sm:p-5 shadow-xs space-y-5 animate-fade-in">
          {/* Section 1: Recent Notices Title Bar Controls */}
          <div className="space-y-3 pb-4 border-b border-stone-200 dark:border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Recent Notices Title Bar Controls
                </h4>
              </div>
              <button
                type="button"
                onClick={() => updateBarSettings({ enabled: !barSettings.enabled })}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer self-start sm:self-auto ${
                  barSettings.enabled
                    ? 'bg-emerald-800 text-white border-emerald-700'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700'
                }`}
              >
                {barSettings.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{barSettings.enabled ? 'Title Bar Active' : 'Title Bar Hidden'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Title Bar Label
                </label>
                <input
                  type="text"
                  value={barSettings.title}
                  onChange={(e) => updateBarSettings({ title: e.target.value })}
                  placeholder="Latest Notices"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Max Recent Notices Cycled
                </label>
                <select
                  value={barSettings.maxItems}
                  onChange={(e) => updateBarSettings({ maxItems: Number(e.target.value) || 6 })}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                >
                  {[3, 5, 6, 8, 10, 15].map((num) => (
                    <option key={num} value={num}>
                      Up to {num} notices
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Transition Interval
                </label>
                <select
                  value={barSettings.rotationIntervalSeconds || 5}
                  onChange={(e) =>
                    updateBarSettings({ rotationIntervalSeconds: Number(e.target.value) || 5 })
                  }
                  disabled={!barSettings.autoRotate}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 disabled:opacity-50"
                >
                  {[3, 5, 7, 10, 15, 20].map((sec) => (
                    <option key={sec} value={sec}>
                      Every {sec} seconds
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 w-full">
                  <input
                    type="checkbox"
                    checked={barSettings.autoRotate}
                    onChange={(e) => updateBarSettings({ autoRotate: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
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
                <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Manage Notice Types & Tags</span>
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Add, rename, recolor, or control which notice types appear in the top Recent Notices Title Bar.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetDefaultTypes}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {typeManagerError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
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
                    className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-950/70"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-[140px]">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${style.swatch}`} />
                      <input
                        type="text"
                        value={typeDef.label}
                        onChange={(e) => handleUpdateNoticeType(typeDef.id, { label: e.target.value })}
                        aria-label={`Rename notice type ${typeDef.label}`}
                        className="w-full px-2 py-1 text-xs font-bold rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={typeDef.color}
                        onChange={(e) =>
                          handleUpdateNoticeType(typeDef.id, { color: e.target.value as NoticeTypeColor })
                        }
                        aria-label={`Color for ${typeDef.label}`}
                        className="px-2 py-1 text-[11px] font-semibold rounded-md border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200"
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
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                          typeDef.showInBar
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-stone-100 text-stone-500 border-stone-300 dark:bg-stone-800 dark:text-stone-400 dark:border-stone-700'
                        }`}
                      >
                        {typeDef.showInBar ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>Bar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteNoticeType(typeDef.id)}
                        title={`Delete notice type "${typeDef.label}"`}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
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
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-dashed border-stone-300 dark:border-stone-700 text-xs"
            >
              <input
                type="text"
                value={newTypeLabel}
                onChange={(e) => setNewTypeLabel(e.target.value)}
                placeholder="New type name (e.g., Urgent, Scholarship, Result)..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
              <select
                value={newTypeColor}
                onChange={(e) => setNewTypeColor(e.target.value as NoticeTypeColor)}
                className="px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-semibold"
              >
                {COLOR_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {NOTICE_COLOR_PRESETS[c].label}
                  </option>
                ))}
              </select>
              <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newTypeShowInBar}
                  onChange={(e) => setNewTypeShowInBar(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-emerald-600"
                />
                <span className="font-semibold text-stone-700 dark:text-stone-300">Show in Bar</span>
              </label>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
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
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search notices by title, date, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-emerald-800 text-white'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300'
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
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  active ? style.solidBadge : style.badge
                }`}
              >
                <span>{typeDef.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notices Data Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-medium uppercase tracking-wider">
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
                    className="text-stone-500"
                  >
                    {selectedIds.length === filteredNotices.length && filteredNotices.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
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
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-400">
                    No notices match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredNotices.map((item) => {
                  const resolvedTags = resolveNoticeTagDefinitions(item, noticeTypes);
                  const activeTagSet = new Set(resolvedTags.map((t) => t.id.toLowerCase()));

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 align-top">
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            setSelectedIds((prev) =>
                              prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]
                            )
                          }
                          className="text-stone-400 hover:text-emerald-600"
                        >
                          {selectedIds.includes(item.id) ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 space-y-1.5">
                        <div className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2 flex-wrap">
                          {item.pinned && (
                            <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                          <span>{item.title}</span>
                          {item.imageUrl && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              <ImageIcon className="w-3 h-3" /> Image Scan
                            </span>
                          )}
                          {(item.attachmentUrl || item.link) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                              <FileText className="w-3 h-3" /> Document
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-stone-500 max-w-xl line-clamp-1">
                          {item.body}
                        </div>

                        {/* Quick Inline Tag Toggles */}
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          <span className="text-[10px] font-semibold text-stone-400 uppercase mr-0.5">
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
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                                  isAssigned
                                    ? style.badge
                                    : 'bg-stone-50 dark:bg-stone-950 text-stone-400 border-stone-200 dark:border-stone-800 hover:text-stone-700 dark:hover:text-stone-200'
                                }`}
                              >
                                {isAssigned && <Check className="w-2.5 h-2.5" />}
                                <span>{typeDef.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleTogglePin(item.id)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                            item.pinned
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-700'
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
                              className="p-1.5 text-stone-400 hover:text-emerald-600 rounded"
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
                              className="p-1.5 text-stone-400 hover:text-blue-600 rounded"
                              title="Open Document Attachment"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-stone-400 hover:text-blue-600 rounded"
                            title="Edit Notice"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-2 py-1 text-[10px] font-bold bg-rose-600 text-white rounded"
                              >
                                Confirm
                              </button>
                              <button onClick={() => setDeleteConfirmId(null)} className="p-1 text-stone-400">
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 text-stone-400 hover:text-rose-600 rounded"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {editingItem ? 'Edit Department Notice' : 'Post Official Notice'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Notice Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Semester Final Examination Routine - Autumn 2024"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                      <Pin className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pin to Top (Urgent Notice)</span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Notice Types / Tags Selection */}
              <div>
                <label className="block font-semibold mb-1.5 text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>Notice Types & Tags (Shown in Title Bar)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/60">
                  {noticeTypes.length === 0 ? (
                    <span className="text-[11px] text-stone-400">
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
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            active
                              ? style.solidBadge
                              : `${style.badge} opacity-65 hover:opacity-100`
                          }`}
                        >
                          {active && <Check className="w-3 h-3" />}
                          <span>{typeDef.label}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Notice Body */}
              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Notice Body & Directives *
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Full circular announcement text, room instructions, deadlines..."
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              {/* ATTACHMENT / IMAGE OPTION INSIDE NOTICE */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/60 space-y-3">
                <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Circular Image & Document Attachments</span>
                </div>

                {/* Circular Image Field */}
                <div>
                  <label className="block font-medium mb-1 text-stone-600 dark:text-stone-400">
                    Circular Image URL (Scan / Photo / Banner)
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or /assets/..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono"
                  />
                  {imageUrl && (
                    <div className="mt-2 p-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-900 flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt="Circular preview"
                        decoding="async"
                        onError={handleImageError}
                        className="w-16 h-12 object-cover rounded border border-stone-300 dark:border-stone-700 shrink-0"
                      />
                      <div className="text-[11px] text-stone-500">
                        Image preview active. Will display inline with full-screen zoom modal on notice board.
                      </div>
                    </div>
                  )}
                </div>

                {/* Document Attachment Field */}
                <div>
                  <label className="block font-medium mb-1 text-stone-600 dark:text-stone-400">
                    Document Attachment URL (PDF Routine / Form / Drive link)
                  </label>
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://... (e.g. Google Drive link or PDF download)"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
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
