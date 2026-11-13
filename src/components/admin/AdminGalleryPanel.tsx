import React, { useState, useMemo } from 'react';
import { GalleryItem } from '../../types';
import { getOptimizedImageUrl, handleImageError } from '../../utils/imageUtils';
import { 
  Image as ImageIcon, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  ExternalLink,
  MapPin,
  Calendar,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';

interface AdminGalleryPanelProps {
  gallery: GalleryItem[];
  onUpdateGallery: (items: GalleryItem[]) => void;
}

export const AdminGalleryPanel: React.FC<AdminGalleryPanelProps> = ({
  gallery,
  onUpdateGallery,
}) => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState('2024');
  const [category, setCategory] = useState<GalleryItem['category']>('field-tour');
  const [imageUrl, setImageUrl] = useState('');
  const [formError, setFormError] = useState('');

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return gallery.filter((item) => {
      const matchSearch =
        (item.title || '').toLowerCase().includes(q) ||
        (item.location || '').toLowerCase().includes(q) ||
        (item.caption || '').toLowerCase().includes(q) ||
        (item.year || '').includes(search);
      const matchCat = filterCategory === 'all' || item.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [gallery, search, filterCategory]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setCaption('');
    setLocation('Lawachara National Park, Sylhet');
    setYear('2024');
    setCategory('field-tour');
    setImageUrl('/assets/hero_forestry_sust.webp');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCaption(item.caption);
    setLocation(item.location);
    setYear(item.year);
    setCategory(item.category);
    setImageUrl(item.imageUrl);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      setFormError('Please enter a photo title and image URL.');
      return;
    }

    if (editingItem) {
      const updated: GalleryItem = {
        ...editingItem,
        title: title.trim(),
        caption: caption.trim(),
        location: location.trim(),
        year: year.trim(),
        category,
        imageUrl: imageUrl.trim(),
      };
      const newAll = gallery.map((g) => (g.id === editingItem.id ? updated : g));
      onUpdateGallery(newAll);
    } else {
      const newItem: GalleryItem = {
        id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        caption: caption.trim(),
        location: location.trim(),
        year: year.trim(),
        category,
        imageUrl: imageUrl.trim(),
      };
      onUpdateGallery([newItem, ...gallery]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const updated = gallery.filter((g) => g.id !== id);
    onUpdateGallery(updated);
    setDeleteConfirmId(null);
  };

  const handleBatchDelete = () => {
    const updated = gallery.filter((g) => !selectedIds.includes(g.id));
    onUpdateGallery(updated);
    setSelectedIds([]);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Field & Practical Gallery Management</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {gallery.length} photos
            </span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Administer field tour albums, silvicultural practical photos, and forestry research expeditions.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Photo</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search by title, location, or tour caption..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          >
            <option value="all">All Photo Categories</option>
            <option value="field-tour">Field Tours & Excursions</option>
            <option value="lab">Laboratory Practical</option>
            <option value="campus">Campus Arboretum</option>
            <option value="research">Faculty Research</option>
          </select>
        </div>
      </div>

      {/* Gallery Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white dark:bg-stone-900 rounded-xl border overflow-hidden flex flex-col justify-between transition-colors shadow-xs ${
              selectedIds.includes(item.id)
                ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                : 'border-stone-200 dark:border-stone-800'
            }`}
          >
            <div className="relative aspect-video bg-stone-100 dark:bg-stone-800 overflow-hidden">
              <img
                src={getOptimizedImageUrl(item.imageUrl, 480)}
                alt={item.title}
                loading="lazy"
                decoding="async"
                onError={handleImageError}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() =>
                  setSelectedIds((prev) =>
                    prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]
                  )
                }
                className="absolute top-2 left-2 p-1 bg-black/60 rounded text-white"
              >
                {selectedIds.includes(item.id) ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/70 text-white">
                {item.category}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 leading-snug mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mb-3">
                  {item.caption}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <span className="flex items-center gap-1 truncate max-w-[150px]">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </span>
                  <span className="font-mono">{item.year}</span>
                </div>

                <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-stone-400 hover:text-blue-600 rounded"
                    title="Edit Photo Details"
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
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {editingItem ? 'Edit Gallery Photo' : 'Add New Field Photo'}
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
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">Photo Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Silviculture Field Tour - Lawachara"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  >
                    <option value="field-tour">Field Tour</option>
                    <option value="lab">Laboratory Practical</option>
                    <option value="campus">Campus Arboretum</option>
                    <option value="research">Research Excursion</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">Year / Batch</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2024"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Sreemangal, Moulvibazar"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">Image URL *</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... or /assets/..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">Caption / Tour Summary</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Students conducting tree height mensuration using Haga altimeters..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
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
                  {editingItem ? 'Save Changes' : 'Upload to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
