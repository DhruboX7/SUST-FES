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
} from 'lucide-react';

import { GalleryItem, StudentPhotoItem } from '../types';
import { getStoredGallery, getStoredStudentPhotos } from '../utils/storage';
import { getOptimizedImageUrl, handleImageError } from '../utils/imageUtils';
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

  const loadData = async (isMountedCheck?: () => boolean) => {
    setIsLoading(true);
    try {
      const [galData, stuData] = await Promise.all([
        getStoredGallery(),
        getStoredStudentPhotos()
      ]);
      if (isMountedCheck && !isMountedCheck()) return;
      setItems(Array.isArray(galData) ? galData : []);
      setStudentPhotos(Array.isArray(stuData) ? stuData : []);
    } catch (err) {
      console.error('Failed to load gallery data:', err);
    } finally {
      if (!isMountedCheck || isMountedCheck()) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadData(() => isMounted);

    const handleUpdate = (e: Event) => {
      const collection = (e as CustomEvent<{ collection?: string }>).detail?.collection;
      if (!collection || collection === 'gallery' || collection === 'student_photos' || collection === 'all') {
        if (isMounted) {
          loadData(() => isMounted);
        }
      }
    };

    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('sust_fes_data_updated', handleUpdate);
    };
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
      
      {/* Editorial Banner */}
      <div className="bg-[#19382B] rounded-lg p-6 sm:p-8 text-[#F3F1E8] border border-[#42684D]/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[#BBC4A6] text-xs font-semibold uppercase tracking-wider mb-2">
            <Camera className="w-4 h-4 text-[#8A9C74]" />
            <span>Visual Field &amp; Research Chronicle</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[#F3F1E8]">
            Field Excursion &amp; Student Gallery
          </h1>
          <p className="text-xs sm:text-sm text-[#F3F1E8]/85 leading-relaxed">
            Documentary chronicle of annual silvicultural expeditions across Lawachara, the Sundarbans, Sylhet hill reserves, departmental laboratories, and student field observations.
          </p>
        </div>

        {/* Submit Photo Button */}
        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-md text-xs sm:text-sm font-semibold bg-[#42684D] hover:bg-[#8A9C74] hover:text-[#11261D] text-[#F3F1E8] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Submit a Field Photo</span>
          </button>
        </div>
      </div>

      {/* Category Tabs & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
          {categories.map((c) => {
            const isActive = selectedCategory === c.key;
            return (
              <button
                type="button"
                key={c.key}
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  isActive
                    ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] border-[#19382B] dark:border-[#8A9C74]'
                    : 'bg-[#FAF9F4] dark:bg-[#19382B] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:border-[#42684D] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                }`}
              >
                {c.isSpecial && <Camera className="w-3.5 h-3.5 text-[#8A9C74]" />}
                <span>{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-xs font-mono ${
                  isActive ? 'bg-[#42684D] dark:bg-[#19382B] text-[#F3F1E8]' : 'bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6]'
                }`}>
                  {c.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Student Lens Tip */}
        <div className="text-[11px] text-[#987453] dark:text-[#BBC4A6] hidden lg:flex items-center gap-1.5 font-medium">
          <Camera className="w-3.5 h-3.5" />
          <span>Students can submit field tour &amp; tree observations for editorial review</span>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <div
              key={idx}
              className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-[#EAE7DA] dark:bg-[#142D22]" />
              <div className="p-5 space-y-2.5">
                <div className="h-3 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm w-1/3" />
                <div className="h-4 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm w-3/4" />
                <div className="h-10 bg-[#F3F1E8] dark:bg-[#11261D] rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      ) : (selectedCategory === 'students' ? publicStudentPhotos.length === 0 : (selectedCategory === 'all' ? items.length + publicStudentPhotos.length === 0 : items.filter((i) => i.category === selectedCategory).length === 0)) ? (
        <div className="text-center py-16 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-8">
          <ImageIcon className="w-10 h-10 text-[#8A9C74] mx-auto mb-3" />
          <h3 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
            No Photographs in This Category
          </h3>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] max-w-sm mx-auto">
            Select another field category or contribute a field expedition photograph for editorial review.
          </p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Render General Gallery Items (unless filtered to students only) */}
        {selectedCategory !== 'students' &&
          items
            .filter((i) => selectedCategory === 'all' || i.category === selectedCategory)
            .map((item) => (
              <article
                key={item.id}
                className="group bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 overflow-hidden hover:border-[#42684D] dark:hover:border-[#8A9C74] transition-colors flex flex-col justify-between"
              >
                <div 
                  className="relative aspect-[4/3] overflow-hidden bg-[#19382B] cursor-pointer"
                  onClick={() => setActiveLightbox({
                    url: item.imageUrl,
                    title: item.title,
                    location: item.location,
                    caption: item.caption,
                    credit: item.photographer || 'SUST Department of Forestry & Environmental Science'
                  })}
                >
                  <img
                    src={getOptimizedImageUrl(item.imageUrl, 640)}
                    alt={item.title}
                    onError={handleImageError}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-[#19382B]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-[#F3F1E8] text-xs font-semibold">
                    <ZoomIn className="w-4 h-4" />
                    <span>View Photograph</span>
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-sm bg-[#19382B]/90 text-[#F3F1E8] text-[10px] font-mono tabular-nums font-semibold border border-[#BBC4A6]/25">
                    {item.year}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#987453] dark:text-[#BBC4A6] mb-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8] leading-snug mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#42684D] dark:text-[#F3F1E8]/80 leading-relaxed">
                      {item.caption}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15 flex items-center justify-between gap-2 text-[11px] text-[#8A9C74] dark:text-[#BBC4A6]">
                    <span className="capitalize font-mono shrink-0">{(item.category || 'field').replace('-', ' ')}</span>
                    <span className="font-medium text-[#42684D] dark:text-[#8A9C74] truncate text-right" title={item.photographer || 'Department Archive'}>
                      {item.photographer || 'SUST FES Archive'}
                    </span>
                  </div>
                </div>
              </article>
            ))}

        {/* Render Student Photos (when 'all' or 'students') */}
        {(selectedCategory === 'all' || selectedCategory === 'students') &&
          publicStudentPhotos.map((photo) => (
            <article
              key={photo.id}
              className="group bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 overflow-hidden hover:border-[#42684D] dark:hover:border-[#8A9C74] transition-colors flex flex-col justify-between"
            >
              <div 
                className="relative aspect-[4/3] overflow-hidden bg-[#19382B] cursor-pointer"
                onClick={() => setActiveLightbox({
                  url: photo.imageUrl,
                  title: photo.title,
                  location: photo.location,
                  caption: photo.caption,
                  credit: `Photograph · ${photo.studentName} ${photo.studentBatch ? `(${photo.studentBatch})` : ''}`
                })}
              >
                <img
                  src={getOptimizedImageUrl(photo.imageUrl, 640)}
                  alt={photo.title}
                  onError={handleImageError}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-[#19382B]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-[#F3F1E8] text-xs font-semibold">
                  <ZoomIn className="w-4 h-4" />
                  <span>View Student Capture</span>
                </div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-sm bg-[#42684D]/95 text-[#F3F1E8] text-[10px] font-semibold flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    <span>Student Lens</span>
                  </span>
                  {photo.status === 'featured' && (
                    <span className="px-2 py-0.5 rounded-sm bg-[#987453] text-[#FAF9F4] text-[10px] font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-sm bg-[#19382B]/90 text-[#F3F1E8] text-[10px] font-mono font-semibold border border-[#BBC4A6]/25">
                  {photo.date}
                </div>

                {/* Species badge if linked */}
                {photo.speciesScientificName && (
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 truncate">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-xs bg-[#19382B]/90 text-[#FAF9F4] border border-[#BBC4A6]/30 truncate max-w-full">
                      <TreePine className="w-3 h-3 text-[#8A9C74] shrink-0" />
                      <span className="font-scientific truncate">{photo.speciesScientificName}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#987453] dark:text-[#BBC4A6] mb-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{photo.location}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8] leading-snug mb-1">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-[#42684D] dark:text-[#F3F1E8]/80 leading-relaxed line-clamp-3">
                    {photo.caption}
                  </p>
                </div>

                {/* Student Attribution Footer */}
                <div className="mt-3 pt-3 border-t border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                    <User className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74] shrink-0" />
                    <span className="truncate">{photo.studentName}</span>
                    {photo.studentBatch && (
                      <span className="text-[#987453] dark:text-[#BBC4A6] font-normal">({photo.studentBatch})</span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#42684D] dark:text-[#8A9C74] font-semibold uppercase tracking-wider">
                    Verified Capture
                  </span>
                </div>
              </div>
            </article>
          ))}
      </div>
      )}

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#11261D]/90"
          onClick={() => setActiveLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-[#19382B] border border-[#BBC4A6]/30 rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-[#142D22] border-b border-[#BBC4A6]/20 text-[#F3F1E8] shrink-0">
              <div className="pr-4 truncate">
                <h3 className="font-semibold text-sm sm:text-base truncate">{activeLightbox.title}</h3>
                {activeLightbox.credit && (
                  <p className="text-xs text-[#BBC4A6] truncate">{activeLightbox.credit}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activeLightbox.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-[#42684D] hover:bg-[#8A9C74] hover:text-[#11261D] text-[#F3F1E8] text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveLightbox(null)}
                  className="p-1.5 text-[#BBC4A6] hover:text-[#F3F1E8] rounded-md hover:bg-[#19382B] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-[#11261D]">
              <img
                src={activeLightbox.url}
                alt={activeLightbox.title}
                onError={handleImageError}
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[72vh] object-contain rounded-md"
              />
            </div>

            {activeLightbox.caption && (
              <div className="p-3 bg-[#142D22] border-t border-[#BBC4A6]/20 text-xs text-[#BBC4A6] text-center">
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
