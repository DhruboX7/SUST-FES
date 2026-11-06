import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Star, 
  AlertCircle, 
  ExternalLink, 
  TreePine, 
  MapPin, 
  Calendar, 
  User, 
  Hash, 
  X, 
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { StudentPhotoItem, TreeSpecies } from '../../types';
import { 
  getStoredStudentPhotos, 
  saveStoredStudentPhotos, 
  updateStudentPhotoStatus, 
  deleteStudentPhoto, 
  updateStudentPhoto,
  addStudentPhotoSubmission,
  getStoredSpecies
} from '../../utils/storage';

export const AdminStudentPhotosPanel: React.FC = () => {
  const [photos, setPhotos] = useState<StudentPhotoItem[]>([]);
  const [speciesList, setSpeciesList] = useState<TreeSpecies[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentPhotoItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [studentName, setStudentName] = useState('');
  const [studentBatch, setStudentBatch] = useState('');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('SUST Campus, Sylhet');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState('');
  const [status, setStatus] = useState<'pending' | 'approved' | 'featured'>('approved');

  // Preview Lightbox
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [photoData, spData] = await Promise.all([
        getStoredStudentPhotos(),
        getStoredSpecies()
      ]);
      setPhotos(photoData);
      setSpeciesList(spData);
    } catch (err) {
      console.error('Failed to load student photos for admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      getStoredStudentPhotos().then((data) => setPhotos(data)).catch(() => {});
    };
    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => window.removeEventListener('sust_fes_data_updated', handleUpdate);
  }, []);

  const pendingCount = photos.filter((p) => p.status === 'pending').length;
  const approvedCount = photos.filter((p) => p.status === 'approved').length;
  const featuredCount = photos.filter((p) => p.status === 'featured').length;

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setStudentName('');
    setStudentBatch('2021-22');
    setStudentRegNo('');
    setTitle('');
    setCaption('');
    setLocation('SUST Campus, Sylhet');
    setDate(new Date().toISOString().split('T')[0]);
    setImageUrl('');
    setSelectedSpeciesId('');
    setStatus('approved');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: StudentPhotoItem) => {
    setEditingItem(item);
    setStudentName(item.studentName);
    setStudentBatch(item.studentBatch || '');
    setStudentRegNo(item.studentRegNo || '');
    setTitle(item.title);
    setCaption(item.caption);
    setLocation(item.location);
    setDate(item.date);
    setImageUrl(item.imageUrl);
    setSelectedSpeciesId(item.treeSpeciesId || '');
    setStatus(item.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteStudentPhoto(id);
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveStoredStudentPhotos(updated);
      return updated;
    });
    setDeleteConfirmId(null);
    if (editingItem?.id === id) {
      setIsModalOpen(false);
      setEditingItem(null);
    }
  };

  const handleApprove = (id: string) => {
    updateStudentPhotoStatus(id, 'approved');
  };

  const handleToggleFeature = (item: StudentPhotoItem) => {
    const nextStatus = item.status === 'featured' ? 'approved' : 'featured';
    updateStudentPhotoStatus(item.id, nextStatus);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const matchedSpecies = speciesList.find((s) => s.id === selectedSpeciesId);

    // Transform Google Drive links if provided
    let processedUrl = imageUrl.trim();
    if (processedUrl.includes('drive.google.com/file/d/')) {
      const match = processedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        processedUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
      }
    }

    if (editingItem) {
      const updated: StudentPhotoItem = {
        ...editingItem,
        studentName: studentName.trim(),
        studentBatch: studentBatch.trim() || undefined,
        studentRegNo: studentRegNo.trim() || undefined,
        title: title.trim(),
        caption: caption.trim(),
        location: location.trim(),
        date,
        imageUrl: processedUrl,
        treeSpeciesId: matchedSpecies?.id,
        speciesScientificName: matchedSpecies ? matchedSpecies.scientificName : undefined,
        status,
      };
      updateStudentPhoto(updated);
    } else {
      addStudentPhotoSubmission(
        {
          studentName: studentName.trim(),
          studentBatch: studentBatch.trim() || undefined,
          studentRegNo: studentRegNo.trim() || undefined,
          title: title.trim(),
          caption: caption.trim() || 'Dendrology and field observation capture by student.',
          location: location.trim(),
          date,
          imageUrl: processedUrl,
          treeSpeciesId: matchedSpecies?.id,
          speciesScientificName: matchedSpecies ? matchedSpecies.scientificName : undefined,
        },
        status
      );
    }

    setIsModalOpen(false);
  };

  // Filter photos
  const filteredPhotos = photos.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.studentName.toLowerCase().includes(q) ||
      (item.studentRegNo && item.studentRegNo.toLowerCase().includes(q)) ||
      item.location.toLowerCase().includes(q) ||
      (item.speciesScientificName && item.speciesScientificName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-stone-900 text-white shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>Field Tour & Dendrology Observation Curation</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">Student Photos Management</h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            Review student field submissions, verify morphological accuracy, approve photos for the public gallery, and associate captures with Bangladesh tree species.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student Photo</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
          <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Total Photos</div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-0.5">{photos.length}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'pending'
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 ring-1 ring-amber-500'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-amber-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>Pending Review</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{pendingCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('approved')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'approved'
              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-emerald-500'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Approved</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{approvedCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('featured')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'featured'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 ring-1 ring-purple-500'
              : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-purple-300'
          }`}
        >
          <div className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center justify-between">
            <span>Featured</span>
            <Star className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-0.5">{featuredCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, reg no, title, location, or tree species..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'approved', 'featured'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {st}
              {st === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-stone-950 font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Cards Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 text-stone-500 space-y-2">
          <Camera className="w-8 h-8 mx-auto text-stone-400 opacity-60" />
          <p className="text-sm font-semibold">No student photos matching current filter.</p>
          <p className="text-xs text-stone-400">Try adjusting your search criteria or add a new entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map((photo) => {
            const isPending = photo.status === 'pending';
            const isFeatured = photo.status === 'featured';

            return (
              <div
                key={photo.id}
                className={`flex flex-col rounded-xl border overflow-hidden transition-all bg-white dark:bg-stone-900 shadow-xs ${
                  isPending
                    ? 'border-amber-300 dark:border-amber-800 ring-1 ring-amber-300/60'
                    : 'border-stone-200 dark:border-stone-800 hover:border-emerald-500'
                }`}
              >
                {/* Photo Thumbnail */}
                <div 
                  className="relative h-44 bg-stone-950 overflow-hidden cursor-pointer group"
                  onClick={() => setPreviewImage({ url: photo.imageUrl, title: photo.title })}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    {isPending && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 flex items-center gap-1 shadow-xs">
                        <Clock className="w-3 h-3" />
                        <span>Pending Review</span>
                      </span>
                    )}
                    {isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-600 text-white flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-current" />
                        <span>Featured</span>
                      </span>
                    )}
                    {!isPending && !isFeatured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-white shadow-xs">
                        Approved
                      </span>
                    )}
                  </div>

                  {/* Species Tag if linked */}
                  {photo.speciesScientificName && (
                    <div className="absolute bottom-2 left-2 right-2 truncate">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-stone-900/90 text-emerald-300 backdrop-blur-xs">
                        <TreePine className="w-3 h-3 shrink-0" />
                        <span className="truncate">{photo.speciesScientificName}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug line-clamp-1">
                      {photo.title}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                      {photo.caption}
                    </p>

                    {/* Metadata Strip */}
                    <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 space-y-1 text-[11px] text-stone-500 dark:text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="font-semibold text-stone-700 dark:text-stone-300">{photo.studentName}</span>
                        {photo.studentBatch && <span>({photo.studentBatch})</span>}
                        {photo.studentRegNo && <span className="font-mono text-stone-400">#{photo.studentRegNo}</span>}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 truncate max-w-[65%]">
                          <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{photo.location}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Calendar className="w-3 h-3 text-stone-400 shrink-0" />
                          <span>{photo.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 gap-1.5">
                    {/* Primary Status Toggle */}
                    <div className="flex items-center gap-1">
                      {isPending ? (
                        <button
                          onClick={() => handleApprove(photo.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1 shadow-xs"
                          title="Approve for public gallery"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleFeature(photo)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${
                            isFeatured
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-purple-600'
                          }`}
                          title={isFeatured ? 'Remove featured status' : 'Feature in gallery highlight'}
                        >
                          <Star className={`w-3 h-3 ${isFeatured ? 'fill-current' : ''}`} />
                          <span>{isFeatured ? 'Featured' : 'Feature'}</span>
                        </button>
                      )}
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(photo)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        title="Edit photo details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {deleteConfirmId === photo.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(photo.id);
                            }}
                            className="px-2 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors shadow-2xs"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(photo.id);
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Delete photo permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative max-w-xl w-full max-h-[92vh] flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
              <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>{editingItem ? 'Edit Student Photo' : 'Add New Student Photo'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {/* Student Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Batch / Session
                  </label>
                  <input
                    type="text"
                    value={studentBatch}
                    onChange={(e) => setStudentBatch(e.target.value)}
                    placeholder="2021-22"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Reg. Number
                  </label>
                  <input
                    type="text"
                    value={studentRegNo}
                    onChange={(e) => setStudentRegNo(e.target.value)}
                    placeholder="2021134018"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              {/* Title & Tree Species */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lawachara Dipterocarpus Canopy"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Linked Tree Species
                  </label>
                  <select
                    value={selectedSpeciesId}
                    onChange={(e) => setSelectedSpeciesId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  >
                    <option value="">General Forest / Campus Observation</option>
                    {speciesList.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.scientificName} ({sp.banglaName} / {sp.commonName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Lawachara National Park / SUST Campus"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Image URL & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or Google Drive link"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-semibold"
                  >
                    <option value="approved">Approved</option>
                    <option value="featured">Featured</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
              </div>

              {imageUrl && (
                <div className="p-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-stone-50 dark:bg-stone-950 flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                    }}
                    className="w-16 h-14 object-cover rounded-md border border-stone-300 dark:border-stone-700 shrink-0"
                  />
                  <div className="text-[11px] text-stone-500 dark:text-stone-400">
                    Image preview loaded. Will display with student credits and linked tree profile.
                  </div>
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Morphological / Field Notes
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Notes on stand composition, phenological stage, or canopy position..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <div>
                  {editingItem && (
                    deleteConfirmId === editingItem.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(editingItem.id)}
                          className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shadow-xs"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(editingItem.id)}
                        className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Photo</span>
                      </button>
                    )
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setDeleteConfirmId(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                  >
                    {editingItem ? 'Save Changes' : 'Create Photo Record'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-stone-900 border border-stone-700 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 bg-stone-950 border-b border-stone-800 text-white">
              <span className="font-bold text-xs sm:text-sm truncate pr-4">{previewImage.title}</span>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black/60">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-w-full max-h-[78vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
