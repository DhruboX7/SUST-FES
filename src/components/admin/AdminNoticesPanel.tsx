import React, { useState, useMemo } from 'react';
import { NoticeItem } from '../../types';
import { 
  Bell, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Pin, 
  X, 
  ExternalLink,
  Calendar,
  CheckSquare,
  Square,
  AlertCircle,
  Image as ImageIcon,
  FileText
} from 'lucide-react';

interface AdminNoticesPanelProps {
  notices: NoticeItem[];
  onUpdateNotices: (notices: NoticeItem[]) => void;
}

export const AdminNoticesPanel: React.FC<AdminNoticesPanelProps> = ({
  notices,
  onUpdateNotices,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NoticeItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [link, setLink] = useState('');
  const [pinned, setPinned] = useState(false);
  const [formError, setFormError] = useState('');

  const filteredNotices = useMemo(() => {
    return notices.filter((item) => {
      return (
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.body.toLowerCase().includes(search.toLowerCase()) ||
        item.date.includes(search)
      );
    });
  }, [notices, search]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setBody('');
    setImageUrl('');
    setAttachmentUrl('');
    setLink('');
    setPinned(false);
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
    setFormError('');
    setIsModalOpen(true);
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
    if (window.confirm(`Delete ${selectedIds.length} notices from the board?`)) {
      const updated = notices.filter((n) => !selectedIds.includes(n.id));
      onUpdateNotices(updated);
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Notice Board & Official Circular Management</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {notices.length} notices
            </span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Publish department circulars, pin urgent exam schedules, and announce field tour directives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBatchDelete}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post New Notice</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
        <input
          type="text"
          placeholder="Search notices by title, date, or keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
        />
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
                <th className="py-3 px-4">Notice Title & Content</th>
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
                filteredNotices.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40">
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
                    <td className="py-3 px-4">
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
                      <div className="text-[11px] text-stone-500 max-w-xl line-clamp-1 mt-0.5">
                        {item.body}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600 dark:text-stone-400 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleTogglePin(item.id)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md flex items-center gap-1 transition-colors ${
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
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
                        onError={(e) => ((e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp')}
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

