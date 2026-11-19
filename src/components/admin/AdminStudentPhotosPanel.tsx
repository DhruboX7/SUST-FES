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
  CheckCircle2
} from 'lucide-react';
import { StudentPhotoItem, TreeSpecies } from '../../types';
import { 
  getStoredStudentPhotos, 
  updateStudentPhotoStatus, 
  deleteStudentPhoto, 
  updateStudentPhoto,
  addStudentPhotoSubmission,
  getStoredSpecies
} from '../../utils/storage';
import { getOptimizedImageUrl, handleImageError } from '../../utils/imageUtils';

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

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [photoData, spData] = await Promise.all([
          getStoredStudentPhotos(),
          getStoredSpecies()
        ]);
        if (!isMounted) return;
        setPhotos(photoData);
        setSpeciesList(spData);
      } catch (err) {
        console.error('Failed to load student photos for admin:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    const handleUpdate = (e: Event) => {
      const col = (e as CustomEvent)?.detail?.collection;
      if (!col || col === 'student_photos' || col === 'all') {
        getStoredStudentPhotos().then((data) => {
          if (isMounted) setPhotos(data);
        }).catch(() => {});
      }
    };
    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('sust_fes_data_updated', handleUpdate);
    };
  }, []);

  const pendingCount = photos.filter((p) => p && p.status === 'pending').length;
  const approvedCount = photos.filter((p) => p && p.status === 'approved').length;
  const featuredCount = photos.filter((p) => p && p.status === 'featured').length;

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
    setPhotos((prev) => prev.filter((p) => p.id !== id));
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
      (item.title || '').toLowerCase().includes(q) ||
      (item.studentName || '').toLowerCase().includes(q) ||
      (item.studentRegNo && item.studentRegNo.toLowerCase().includes(q)) ||
      (item.location || '').toLowerCase().includes(q) ||
      (item.speciesScientificName && item.speciesScientificName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-lg bg-[#19382B] border border-[#BBC4A6]/25 text-[#F3F1E8]">
        <div>
          <div className="flex items-center gap-2 text-[#BBC4A6] text-xs font-semibold uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4 text-[#8A9C74]" />
            <span>Field Tour & Dendrology Observation Curation</span>
          </div>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#F3F1E8]">Student Photos Management</h2>
          <p className="text-xs text-[#BBC4A6] mt-1 max-w-xl leading-relaxed">
            Review student field submissions, verify morphological accuracy, approve photos for the public gallery, and associate captures with Bangladesh tree species.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold bg-[#42684D] hover:bg-[#8A9C74] text-[#F3F1E8] transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student Photo</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === 'all'
              ? 'border-[#19382B] dark:border-[#BBC4A6] bg-[#EAE7DA] dark:bg-[#142D22] ring-1 ring-[#42684D]'
              : 'border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B]'
          }`}
        >
          <div className="text-[11px] font-semibold text-[#8A9C74] uppercase tracking-wider">Total Photos</div>
          <div className="font-editorial text-2xl font-bold text-[#19382B] dark:text-[#F3F1E8] mt-0.5">{photos.length}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === 'pending'
              ? 'border-[#987453] bg-[#EAE7DA] dark:bg-[#142D22] ring-1 ring-[#987453]'
              : 'border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B] hover:border-[#987453]'
          }`}
        >
          <div className="text-[11px] font-semibold text-[#987453] uppercase tracking-wider flex items-center justify-between">
            <span>Pending Review</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="font-editorial text-2xl font-bold text-[#987453] mt-0.5">{pendingCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('approved')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === 'approved'
              ? 'border-[#42684D] bg-[#EAE7DA] dark:bg-[#142D22] ring-1 ring-[#42684D]'
              : 'border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B] hover:border-[#42684D]'
          }`}
        >
          <div className="text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] uppercase tracking-wider flex items-center justify-between">
            <span>Approved</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="font-editorial text-2xl font-bold text-[#42684D] dark:text-[#F3F1E8] mt-0.5">{approvedCount}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('featured')}
          className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
            statusFilter === 'featured'
              ? 'border-[#19382B] dark:border-[#BBC4A6] bg-[#EAE7DA] dark:bg-[#142D22] ring-1 ring-[#19382B] dark:ring-[#BBC4A6]'
              : 'border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B] hover:border-[#42684D]'
          }`}
        >
          <div className="text-[11px] font-semibold text-[#19382B] dark:text-[#BBC4A6] uppercase tracking-wider flex items-center justify-between">
            <span>Featured</span>
            <Star className="w-3.5 h-3.5 text-[#987453]" />
          </div>
          <div className="font-editorial text-2xl font-bold text-[#19382B] dark:text-[#F3F1E8] mt-0.5">{featuredCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A9C74]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, reg no, title, location, or tree species..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] placeholder:text-[#8A9C74]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pending', 'approved', 'featured'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#42684D] text-[#F3F1E8]'
                  : 'text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22]'
              }`}
            >
              {st}
              {st === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-sm text-[10px] bg-[#987453] text-[#F3F1E8] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Cards Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-dashed border-[#BBC4A6] dark:border-[#BBC4A6]/30 text-[#42684D] dark:text-[#8A9C74] space-y-2 bg-[#FAF9F4] dark:bg-[#19382B]">
          <Camera className="w-8 h-8 mx-auto text-[#8A9C74] opacity-70" />
          <p className="text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8]">No student photos matching current filter.</p>
          <p className="text-xs text-[#8A9C74]">Try adjusting your search criteria or add a new entry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map((photo) => {
            const isPending = photo.status === 'pending';
            const isFeatured = photo.status === 'featured';

            return (
              <div
                key={photo.id}
                className={`flex flex-col rounded-lg border overflow-hidden transition-colors bg-[#FAF9F4] dark:bg-[#19382B] ${
                  isPending
                    ? 'border-[#987453] ring-1 ring-[#987453]/40'
                    : 'border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:border-[#42684D]'
                }`}
              >
                {/* Photo Thumbnail */}
                <div 
                  className="relative aspect-[4/3] bg-[#142D22] overflow-hidden cursor-pointer group"
                  onClick={() => setPreviewImage({ url: photo.imageUrl, title: photo.title })}
                >
                  <img
                    src={getOptimizedImageUrl(photo.imageUrl, 480)}
                    alt={photo.title}
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-[#11261D]/70" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {isPending && (
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-[#987453] text-[#F3F1E8] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Pending Review</span>
                      </span>
                    )}
                    {isFeatured && (
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-[#19382B] text-[#F3F1E8] border border-[#987453] flex items-center gap-1">
                        <Star className="w-3 h-3 fill-[#987453] text-[#987453]" />
                        <span>Featured</span>
                      </span>
                    )}
                    {!isPending && !isFeatured && (
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-[#42684D] text-[#F3F1E8]">
                        Approved
                      </span>
                    )}
                  </div>

                  {/* Species Tag if linked */}
                  {photo.speciesScientificName && (
                    <div className="absolute bottom-2 left-2 right-2 truncate">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-scientific italic font-semibold bg-[#19382B]/95 text-[#F3F1E8] border border-[#BBC4A6]/30">
                        <TreePine className="w-3 h-3 shrink-0 text-[#BBC4A6]" />
                        <span className="truncate">{photo.speciesScientificName}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8] leading-snug line-clamp-1">
                      {photo.title}
                    </h3>

                    <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-1 line-clamp-2 leading-relaxed">
                      {photo.caption}
                    </p>

                    {/* Metadata Strip */}
                    <div className="mt-2.5 pt-2 border-t border-[#BBC4A6]/40 dark:border-[#BBC4A6]/15 space-y-1 text-[11px] text-[#42684D] dark:text-[#8A9C74]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3 h-3 text-[#8A9C74] shrink-0" />
                        <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">{photo.studentName}</span>
                        {photo.studentBatch && <span>({photo.studentBatch})</span>}
                        {photo.studentRegNo && <span className="font-mono text-[#987453] dark:text-[#BBC4A6]">#{photo.studentRegNo}</span>}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 truncate max-w-[65%]">
                          <MapPin className="w-3 h-3 text-[#987453] shrink-0" />
                          <span className="truncate">{photo.location}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Calendar className="w-3 h-3 text-[#8A9C74] shrink-0" />
                          <span>{photo.date}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Admin Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#BBC4A6]/40 dark:border-[#BBC4A6]/15 gap-1.5">
                    {/* Primary Status Toggle */}
                    <div className="flex items-center gap-1">
                      {isPending ? (
                        <button
                          onClick={() => handleApprove(photo.id)}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] flex items-center gap-1 transition-colors"
                          title="Approve for public gallery"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleFeature(photo)}
                          className={`px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors border ${
                            isFeatured
                              ? 'bg-[#19382B] text-[#F3F1E8] border-[#987453]'
                              : 'bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 hover:border-[#987453] hover:text-[#987453]'
                          }`}
                          title={isFeatured ? 'Remove featured status' : 'Feature in gallery highlight'}
                        >
                          <Star className={`w-3 h-3 ${isFeatured ? 'fill-[#987453] text-[#987453]' : ''}`} />
                          <span>{isFeatured ? 'Featured' : 'Feature'}</span>
                        </button>
                      )}
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(photo)}
                        className="p-1.5 rounded-sm text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] transition-colors"
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
                            className="px-2 py-1 text-[10px] font-semibold bg-[#987453] hover:bg-[#826143] text-[#F3F1E8] rounded-sm transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="p-1 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8]"
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
                          className="p-1.5 rounded-sm text-[#987453] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] transition-colors"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#11261D]/80 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative max-w-xl w-full max-h-[92vh] flex flex-col bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 bg-[#EAE7DA] dark:bg-[#142D22] shrink-0">
              <h3 className="font-editorial font-bold text-base sm:text-lg text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6]" />
                <span>{editingItem ? 'Edit Student Photo' : 'Add New Student Photo'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {/* Student Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                    Batch / Session
                  </label>
                  <input
                    type="text"
                    value={studentBatch}
                    onChange={(e) => setStudentBatch(e.target.value)}
                    placeholder="2021-22"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                    Reg. Number
                  </label>
                  <input
                    type="text"
                    value={studentRegNo}
                    onChange={(e) => setStudentRegNo(e.target.value)}
                    placeholder="2021134018"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  />
                </div>
              </div>

              {/* Title & Tree Species */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lawachara Dipterocarpus Canopy"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                    Linked Tree Species
                  </label>
                  <select
                    value={selectedSpeciesId}
                    onChange={(e) => setSelectedSpeciesId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
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
                  <label className="block text-xs font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Lawachara National Park / SUST Campus"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>
              </div>

              {/* Image URL & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... or Google Drive link"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-semibold"
                  >
                    <option value="approved">Approved</option>
                    <option value="featured">Featured</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
              </div>

              {imageUrl && (
                <div className="p-2 border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] flex items-center gap-3">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    decoding="async"
                    onError={handleImageError}
                    className="w-16 h-14 object-cover rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/30 shrink-0"
                  />
                  <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74]">
                    Image preview loaded. Will display with student credits and linked tree profile.
                  </div>
                </div>
              )}

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                  Morphological / Field Notes
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Notes on stand composition, phenological stage, or canopy position..."
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
                <div>
                  {editingItem && (
                    deleteConfirmId === editingItem.id ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDelete(editingItem.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#987453] hover:bg-[#826143] text-[#F3F1E8] rounded-md transition-colors"
                        >
                          Confirm Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1.5 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8]"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(editingItem.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#987453] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] rounded-md flex items-center gap-1.5 transition-colors"
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
                    className="px-4 py-2 text-xs font-medium text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md transition-colors"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11261D]/90 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-[#19382B] border border-[#BBC4A6]/30 rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 bg-[#142D22] border-b border-[#BBC4A6]/20 text-[#F3F1E8]">
              <span className="font-editorial font-bold text-sm sm:text-base truncate pr-4">{previewImage.title}</span>
              <button 
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-md hover:bg-[#19382B] text-[#BBC4A6] hover:text-[#F3F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-[#11261D]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                decoding="async"
                onError={handleImageError}
                className="max-w-full max-h-[78vh] object-contain rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
