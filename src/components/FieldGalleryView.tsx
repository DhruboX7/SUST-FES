import React, { useState, useEffect, useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { 
  Camera, 
  MapPin, 
  Calendar, 
  Layers, 
  Compass, 
  TreePine,
  Image as ImageIcon,
  User,
  Plus,
  Star,
  ZoomIn,
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';

import { GalleryItem, StudentPhotoItem } from '../types';
import { getStoredGallery, getStoredStudentPhotos } from '../utils/storage';
import { SubmitStudentPhotoModal } from './SubmitStudentPhotoModal';

export const FieldGalleryView: React.FC = () => {
  usePageMeta({
    title: 'Field Excursion & Student Photography Gallery',
    description: 'Visual photographic chronicle of forestry field tours, ecological surveys, student dendrology observations, and botanical research at SUST FES.',
  });

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [studentPhotos, setStudentPhotos] = useState<StudentPhotoItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Submission Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Lightbox Zoom Modal State
  const [activeLightbox, setActiveLightbox] = useState<{
    url: string;
    title: string;
    credit?: string;
    location?: string;
    caption?: string;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [galData, stuData] = await Promise.all([
        getStoredGallery(),
        getStoredStudentPhotos()
      ]);
      setItems(galData);
      setStudentPhotos(stuData);
    } catch (err) {
      console.error('Failed to load gallery data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => window.removeEventListener('sust_fes_data_updated', handleUpdate);
  }, []);

  // Filter approved or featured student photos
  const publicStudentPhotos = useMemo(() => {
    return studentPhotos.filter((p) => p.status === 'approved' || p.status === 'featured');
  }, [studentPhotos]);

  const categories = [
    { key: 'all', label: 'All Photos', count: items.length + publicStudentPhotos.length },
    { key: 'students', label: 'Student Field Lens', count: publicStudentPhotos.length, isSpecial: true },
    { key: 'field-tour', label: 'Field Excursions', count: items.filter((i) => i.category === 'field-tour').length },
    { key: 'lab', label: 'Laboratory Practical', count: items.filter((i) => i.category === 'lab').length },
    { key: 'campus', label: 'Campus Arboretum', count: items.filter((i) => i.category === 'campus').length },
    { key: 'research', label: 'Faculty Research', count: items.filter((i) => i.category === 'research').length },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 rounded-2xl p-6 sm:p-8 text-white border border-emerald-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Camera className="w-4 h-4 text-emerald-400" />
            <span>Visual Field & Research Chronicle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Field Excursion & Student Gallery
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Photographic archive documenting annual silvicultural expeditions across Lawachara, the Sundarbans, Sylhet hill reserves, departmental laboratories, and field observations captured by SUST forestry students.
          </p>
        </div>

        {/* Submit Photo Button */}
        <div className="shrink-0 flex items-center">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Submit a Field Photo</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map((c) => {
            const isActive = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {c.isSpecial && <Camera className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                }`}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Student Lens Tip */}
        <div className="text-[11px] text-stone-500 dark:text-stone-400 hidden lg:flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Students can submit field tour & tree photos directly for admin review</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Render General Gallery Items (unless filtered to students only) */}
        {selectedCategory !== 'students' &&
          items
            .filter((i) => selectedCategory === 'all' || i.category === selectedCategory)
            .map((item) => (
              <div
                key={item.id}
                className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div 
                  className="relative aspect-video overflow-hidden bg-stone-950 cursor-pointer"
                  onClick={() => setActiveLightbox({
                    url: item.imageUrl,
                    title: item.title,
                    location: item.location,
                    caption: item.caption,
                    credit: 'SUST Department Archive'
                  })}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                    }}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-2xs">
                    <ZoomIn className="w-4 h-4" />
                    <span>View High-Res Photo</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-semibold">
                    {item.year}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="capitalize font-mono">Category: {item.category.replace('-', ' ')}</span>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-400">Department Archive</span>
                  </div>
                </div>
              </div>
            ))}

        {/* Render Student Photos (when 'all' or 'students') */}
        {(selectedCategory === 'all' || selectedCategory === 'students') &&
          publicStudentPhotos.map((photo) => (
            <div
              key={photo.id}
              className="group bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between ring-1 ring-emerald-500/10"
            >
              <div 
                className="relative aspect-video overflow-hidden bg-stone-950 cursor-pointer"
                onClick={() => setActiveLightbox({
                  url: photo.imageUrl,
                  title: photo.title,
                  location: photo.location,
                  caption: photo.caption,
                  credit: `Captured by ${photo.studentName} ${photo.studentBatch ? `(${photo.studentBatch})` : ''}`
                })}
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                  }}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-2xs">
                  <ZoomIn className="w-4 h-4" />
                  <span>View Student Capture</span>
                </div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-800/90 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>Student Lens</span>
                  </span>
                  {photo.status === 'featured' && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-700/90 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-mono font-semibold">
                  {photo.date}
                </div>

                {/* Species badge if linked */}
                {photo.speciesScientificName && (
                  <div className="absolute bottom-2 left-2 right-2 truncate">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/80 text-emerald-300 backdrop-blur-xs truncate max-w-full">
                      <TreePine className="w-3 h-3 shrink-0" />
                      <span className="truncate">{photo.speciesScientificName}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{photo.location}</span>
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug mb-1">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3">
                    {photo.caption}
                  </p>
                </div>

                {/* Student Attribution Footer */}
                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                    <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{photo.studentName}</span>
                    {photo.studentBatch && (
                      <span className="text-stone-400 font-normal">({photo.studentBatch})</span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    Verified Capture
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
          onClick={() => setActiveLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-stone-950 border-b border-stone-800 text-white shrink-0">
              <div className="pr-4 truncate">
                <h3 className="font-bold text-sm sm:text-base truncate">{activeLightbox.title}</h3>
                {activeLightbox.credit && (
                  <p className="text-xs text-stone-400 truncate">{activeLightbox.credit}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeLightbox.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Original</span>
                </a>
                <button
                  onClick={() => setActiveLightbox(null)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black/60">
              <img
                src={activeLightbox.url}
                alt={activeLightbox.title}
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {activeLightbox.caption && (
              <div className="p-3 bg-stone-950 border-t border-stone-800 text-xs text-stone-300 text-center">
                {activeLightbox.caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Submission Modal */}
      <SubmitStudentPhotoModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
