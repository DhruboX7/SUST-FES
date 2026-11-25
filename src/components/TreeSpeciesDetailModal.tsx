import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Camera, 
  Plus, 
  ZoomIn, 
  ExternalLink, 
  TreePine, 
  MapPin, 
  Layers, 
  Tag, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  Loader2,
} from 'lucide-react';
import { TreeSpecies, TreePhoto, StudentPhotoItem } from '../types';
import { addPhotoToTreeSpecies, isMatchedPhotoForSpecies } from '../utils/storage';
import {
  getOptimizedImageUrl,
  handleImageError,
  isImageCached,
  markImageCached,
  preloadImageUrl,
} from '../utils/imageUtils';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  getLocalizedSpeciesField, 
  getLocalizedEcosystem, 
  getLocalizedConservationStatus, 
  getLocalizedUse 
} from '../utils/speciesTranslations';

interface TreeSpeciesDetailModalProps {
  species: TreeSpecies | null;
  studentPhotos: StudentPhotoItem[];
  isOpen: boolean;
  initialPhotoIndex?: number;
  onClose: () => void;
  onOpenStudentSubmit: (speciesId: string) => void;
  onSpeciesUpdated?: (updated: TreeSpecies) => void;
}

export const TreeSpeciesDetailModal: React.FC<TreeSpeciesDetailModalProps> = ({
  species,
  studentPhotos,
  isOpen,
  initialPhotoIndex = 0,
  onClose,
  onOpenStudentSubmit,
  onSpeciesUpdated,
}) => {
  const { t, lang } = useLanguage();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTag, setNewPhotoTag] = useState<'habit' | 'leaf' | 'bark' | 'flower' | 'fruit' | 'seed' | 'general'>('leaf');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [addSuccessMsg, setAddSuccessMsg] = useState('');
  const [addErrorMsg, setAddErrorMsg] = useState('');

  // Track active image readiness for instant UI switching without stale previous photo lag
  const [, setCacheVersion] = useState(0);
  const [fallbackToOriginalMap, setFallbackToOriginalMap] = useState<Record<string, boolean>>({});

  // Lightbox Zoom Modal for enlarged view
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // Build combined list of all photos
  const allPhotos = useMemo(() => {
    if (!species) return [];
    const list: {
      url: string;
      caption: string;
      tag?: string;
      credit?: string;
      sourceUrl?: string;
      isStudent?: boolean;
      studentName?: string;
    }[] = [];

    const seenUrls = new Set<string>();

    // 1. Primary Photo
    if (species.imageUrl && isMatchedPhotoForSpecies(species.imageUrl, species.scientificName)) {
      seenUrls.add(species.imageUrl);
      list.push({
        url: species.imageUrl,
        caption: `${species.commonName} (${species.banglaName}) - Primary Specimen Habit`,
        tag: 'habit',
        credit: species.photoCredit || 'Botanical Reference Photo',
        sourceUrl: species.sourceUrl || species.floraUrl,
      });
    }

    // 2. Multi-Photos from species.morePhotos
    if (species.morePhotos && species.morePhotos.length > 0) {
      species.morePhotos.forEach((p, idx) => {
        if (
          p?.url &&
          !seenUrls.has(p.url) &&
          isMatchedPhotoForSpecies(p.url, species.scientificName)
        ) {
          seenUrls.add(p.url);
          list.push({
            url: p.url,
            caption: p.caption || `${species.commonName} - Botanical Plate #${idx + 1}`,
            tag: p.tag || 'general',
            credit: p.credit || species.photoCredit || 'Botanical Reference Photo',
            sourceUrl: p.sourceUrl || species.sourceUrl || species.floraUrl,
          });
        }
      });
    }

    // 3. Approved Student Captures for this species
    const matchingStudentPhotos = studentPhotos.filter(
      (sp) =>
        sp.status !== 'pending' &&
        isMatchedPhotoForSpecies(sp.imageUrl, species.scientificName) &&
        (sp.treeSpeciesId === species.id ||
          (sp.speciesScientificName &&
            sp.speciesScientificName.toLowerCase() === species.scientificName.toLowerCase()))
    );

    matchingStudentPhotos.forEach((sp) => {
      if (!seenUrls.has(sp.imageUrl)) {
        seenUrls.add(sp.imageUrl);
        list.push({
          url: sp.imageUrl,
          caption: `${sp.title} - ${sp.caption}`,
          tag: 'student',
          credit: `Captured by ${sp.studentName} ${sp.studentBatch ? `(${sp.studentBatch})` : ''} · ${sp.location}`,
          isStudent: true,
          studentName: sp.studentName,
        });
      }
    });

    // Fallback if empty
    if (list.length === 0) {
      list.push({
        url: '/assets/hero_forestry_sust.webp',
        caption: `${species.commonName} - Department Herbarium Record`,
        tag: 'habit',
        credit: 'SUST Department Archive',
      });
    }

    return list;
  }, [species, studentPhotos]);

  const safeIndex = allPhotos.length > 0 ? Math.min(currentPhotoIndex, allPhotos.length - 1) : 0;

  const handlePrev = useCallback(() => {
    if (allPhotos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
  }, [allPhotos.length]);

  const handleNext = useCallback(() => {
    if (allPhotos.length <= 1) return;
    setCurrentPhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
  }, [allPhotos.length]);

  // Close modal on Escape & support ArrowLeft/ArrowRight photo switching
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement | null)?.tagName;
      const isTyping = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT';

      if (e.key === 'Escape') {
        if (isZoomOpen) {
          setIsZoomOpen(false);
        } else {
          onClose();
        }
      } else if (!isTyping && e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (!isTyping && e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isZoomOpen, onClose, handlePrev, handleNext]);

  // Reset index when opening or switching species
  useEffect(() => {
    if (!isOpen) return;
    const clamped =
      allPhotos.length > 0 ? Math.max(0, Math.min(initialPhotoIndex, allPhotos.length - 1)) : 0;
    setCurrentPhotoIndex(clamped);
    setIsAddingPhoto(false);
    setNewPhotoUrl('');
    setAddSuccessMsg('');
    setAddErrorMsg('');
    setFallbackToOriginalMap({});
  }, [species?.id, isOpen, initialPhotoIndex, allPhotos.length]);

  // Preload active, adjacent, and remaining plates at 960px as soon as modal opens or index shifts
  useEffect(() => {
    if (!isOpen || allPhotos.length === 0) return;
    let cancelled = false;

    const total = allPhotos.length;
    const orderedIndices: number[] = [safeIndex];
    if (total > 1) {
      orderedIndices.push((safeIndex + 1) % total);
      orderedIndices.push((safeIndex - 1 + total) % total);
    }
    for (let i = 0; i < total; i++) {
      if (!orderedIndices.includes(i)) orderedIndices.push(i);
    }

    // Immediate priority preload for current + neighbors, then remaining gallery plates
    const priorityBatch = orderedIndices.slice(0, 3);
    const restBatch = orderedIndices.slice(3, 12);

    const triggerPreload = (idx: number) => {
      const item = allPhotos[idx];
      if (!item) return;
      const viewerUrl = getOptimizedImageUrl(item.url, 960);
      const thumbUrl = getOptimizedImageUrl(item.url, 240);
      if (!isImageCached(thumbUrl)) {
        preloadImageUrl(thumbUrl).then(() => {
          if (!cancelled) setCacheVersion((v) => v + 1);
        });
      }
      if (!isImageCached(viewerUrl)) {
        preloadImageUrl(viewerUrl).then(() => {
          if (!cancelled) setCacheVersion((v) => v + 1);
        });
      }
    };

    priorityBatch.forEach(triggerPreload);

    const restTimer = setTimeout(() => {
      if (!cancelled) {
        restBatch.forEach(triggerPreload);
      }
    }, 60);

    return () => {
      cancelled = true;
      clearTimeout(restTimer);
    };
  }, [isOpen, species?.id, safeIndex, allPhotos]);

  // Keep active thumbnail visible in horizontal strip
  useEffect(() => {
    if (isOpen && activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        block: 'nearest',
        inline: 'center',
        behavior: 'smooth',
      });
    }
  }, [isOpen, safeIndex]);

  if (!isOpen || !species) return null;

  const activePhoto = allPhotos[safeIndex];
  const optimizedViewerUrl = getOptimizedImageUrl(activePhoto.url, 960);
  const viewerThumbUrl = getOptimizedImageUrl(activePhoto.url, 240);
  const useOriginalForActive = Boolean(fallbackToOriginalMap[activePhoto.url]);
  const effectiveViewerUrl = useOriginalForActive ? activePhoto.url : optimizedViewerUrl;
  const isViewerCached = isImageCached(effectiveViewerUrl);
  const optimizedZoomUrl = getOptimizedImageUrl(activePhoto.url, 1400);
  const effectiveZoomUrl = useOriginalForActive ? activePhoto.url : optimizedZoomUrl;

  const handleAddPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddErrorMsg('');
    setAddSuccessMsg('');

    if (!newPhotoUrl.trim()) {
      setAddErrorMsg('Please provide a valid image URL.');
      return;
    }

    let processedUrl = newPhotoUrl.trim();
    if (processedUrl.includes('drive.google.com/file/d/')) {
      const match = processedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        processedUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
      }
    }

    const newPhoto: TreePhoto = {
      url: processedUrl,
      caption: newPhotoCaption.trim() || `${species.commonName} - ${newPhotoTag} view`,
      tag: newPhotoTag,
      credit: 'Contributed Photo · FES SUST Herbarium',
    };

    const updated = addPhotoToTreeSpecies(species.id, newPhoto);
    if (updated) {
      if (onSpeciesUpdated) onSpeciesUpdated(updated);
      setAddSuccessMsg('New photo added to this species gallery!');
      setNewPhotoUrl('');
      setNewPhotoCaption('');
      setIsAddingPhoto(false);
      setCurrentPhotoIndex(allPhotos.length); // jump to newly added
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setAddSuccessMsg('');
        successTimerRef.current = null;
      }, 4000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#11261D]/85"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-4xl w-full max-h-[94vh] flex flex-col bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 bg-[#EAE7DA] dark:bg-[#142D22] shrink-0">
          <div className="pr-4 truncate">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold text-[#42684D] dark:text-[#8A9C74]">
                Family: {species.family}
              </span>
              <span className="text-[#BBC4A6]">·</span>
              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider ${
                (species.conservationStatus || '').includes('Critically') || (species.conservationStatus || '').includes('Vulnerable')
                  ? 'bg-[#987453] text-[#FAF9F4]'
                  : 'bg-[#42684D] text-[#FAF9F4]'
              }`}>
                {species.conservationStatus || 'Least Concern'}
              </span>
              {species.forestEcosystem && (
                <>
                  <span className="text-[#BBC4A6]">·</span>
                  <span className="text-[11px] font-medium text-[#19382B] dark:text-[#BBC4A6] flex items-center gap-1">
                    <TreePine className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                    <span>{species.forestEcosystem}</span>
                  </span>
                </>
              )}
            </div>
            <h2 className="font-scientific text-2xl sm:text-3xl font-semibold text-[#19382B] dark:text-[#F3F1E8] leading-tight mt-0.5">
              {species.scientificName}
            </h2>
            <div className="text-xs sm:text-sm text-[#42684D] dark:text-[#BBC4A6] font-medium">
              <span>{species.commonName}</span>
              <span className="mx-1.5">·</span>
              <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                {species.banglaName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B] transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* MULTI-PHOTO GALLERY SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                <h3 className="text-sm font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                  {lang === 'bn' ? 'বোটানিক্যাল ও নমুনার ছবি' : 'Botanical & Specimen Photos'} ({allPhotos.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPhoto(!isAddingPhoto)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-[#42684D] text-[#F3F1E8] hover:bg-[#19382B] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingPhoto ? t('closeForm') : t('addMorePhotos')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenStudentSubmit(species.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:border-[#42684D] transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t('studentFieldLens')}</span>
                </button>
              </div>
            </div>

            {/* Add More Photos Form */}
            {isAddingPhoto && (
              <form
                onSubmit={handleAddPhotoSubmit}
                className="p-4 rounded-md border border-[#BBC4A6] dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] space-y-3"
              >
                <div className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>
                    Add Another Photo for <span className="font-scientific text-sm">{species.scientificName}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                      Photo URL (HTTPS image link or Google Drive file) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://... or Google Drive shared image link"
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6] dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                      Botanical Feature / Tag
                    </label>
                    <select
                      value={newPhotoTag}
                      onChange={(e) => setNewPhotoTag(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6] dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] font-medium"
                    >
                      <option value="habit">Tree Habit / Canopy</option>
                      <option value="leaf">Leaves / Foliage</option>
                      <option value="bark">Bark / Trunk</option>
                      <option value="flower">Flower / Inflorescence</option>
                      <option value="fruit">Fruit / Seed / Pod</option>
                      <option value="general">General View</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                    Caption / Notes
                  </label>
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="e.g. Fissured dark grey bark, or Inflorescence in blooming stage"
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#BBC4A6] dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>

                {addErrorMsg && (
                  <p className="text-xs text-[#987453] font-medium">{addErrorMsg}</p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPhoto(false)}
                    className="px-3 py-1.5 text-xs text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold bg-[#19382B] hover:bg-[#42684D] text-[#F3F1E8] rounded-md cursor-pointer"
                  >
                    Save Photo to Species
                  </button>
                </div>
              </form>
            )}

            {addSuccessMsg && (
              <div className="p-3 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#42684D]/40 text-[#19382B] dark:text-[#F3F1E8] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                <span>{addSuccessMsg}</span>
              </div>
            )}

            {/* Main Interactive Photo Viewer */}
            <div className="relative rounded-lg overflow-hidden border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#11261D]">
              <div
                className="relative h-64 sm:h-80 md:h-96 w-full flex items-center justify-center cursor-pointer group"
                onClick={() => setIsZoomOpen(true)}
              >
                {/* Instant cached-thumbnail backdrop while 960px image fetches on cold switch */}
                {!isViewerCached && viewerThumbUrl !== effectiveViewerUrl && (
                  <img
                    src={viewerThumbUrl}
                    alt=""
                    aria-hidden="true"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-contain opacity-90 pointer-events-none"
                  />
                )}

                <img
                  key={effectiveViewerUrl}
                  src={effectiveViewerUrl}
                  alt={activePhoto.caption}
                  onLoad={() => {
                    markImageCached(effectiveViewerUrl);
                    setCacheVersion((v) => v + 1);
                  }}
                  onError={(e) => {
                    if (!useOriginalForActive && optimizedViewerUrl !== activePhoto.url) {
                      setFallbackToOriginalMap((prev) => ({ ...prev, [activePhoto.url]: true }));
                    } else {
                      handleImageError(e);
                    }
                  }}
                  decoding={isViewerCached ? 'sync' : 'async'}
                  referrerPolicy="no-referrer"
                  className={`relative z-1 max-h-full max-w-full object-contain group-hover:opacity-90 ${
                    isViewerCached ? 'opacity-100' : 'transition-opacity duration-150 opacity-100'
                  }`}
                />

                {!isViewerCached && (
                  <div className="absolute bottom-3 right-3 z-2 px-2.5 py-1 rounded-sm bg-[#19382B]/90 text-[#F3F1E8] text-[10px] font-medium flex items-center gap-1.5 border border-[#BBC4A6]/25 pointer-events-none">
                    <Loader2 className="w-3 h-3 animate-spin text-[#BBC4A6]" />
                    <span>Loading photo...</span>
                  </div>
                )}

                {/* Hover overlay hint */}
                <div className="absolute inset-0 z-2 bg-[#19382B]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-[#F3F1E8] text-xs font-semibold">
                  <ZoomIn className="w-5 h-5" />
                  <span>Click for Fullscreen Zoom</span>
                </div>

                {/* Top Badge on Photo */}
                <div className="absolute top-3 left-3 z-3 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider bg-[#19382B]/90 text-[#BBC4A6] font-mono">
                    {activePhoto.tag || 'specimen'}
                  </span>
                  {activePhoto.isStudent && (
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-[#987453] text-[#FAF9F4] flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Student Observation</span>
                    </span>
                  )}
                </div>

                {/* Counter Badge */}
                <div className="absolute top-3 right-3 z-3 px-2.5 py-0.5 rounded-sm text-[10px] font-mono font-semibold bg-[#19382B]/90 text-[#F3F1E8]">
                  {safeIndex + 1} / {allPhotos.length}
                </div>

                {/* Left / Right Carousel Controls */}
                {allPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-3 p-2.5 rounded-md bg-[#19382B]/85 hover:bg-[#19382B] text-[#F3F1E8] transition-colors cursor-pointer"
                      aria-label="Previous photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-3 p-2.5 rounded-md bg-[#19382B]/85 hover:bg-[#19382B] text-[#F3F1E8] transition-colors cursor-pointer"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Caption & Credit Bar */}
              <div className="p-3 bg-[#19382B] border-t border-[#42684D]/40 text-[#F3F1E8] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="font-medium text-[#F3F1E8] truncate pr-2">
                  {activePhoto.caption}
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  {activePhoto.credit && (
                    <div className="text-[11px] text-[#BBC4A6] font-mono">
                      {activePhoto.credit}
                    </div>
                  )}
                  {activePhoto.sourceUrl && (
                    <a
                      href={activePhoto.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded-sm bg-[#42684D] hover:bg-[#8A9C74] hover:text-[#11261D] text-[#F3F1E8] text-[10px] font-semibold flex items-center gap-1 transition-colors"
                      title="Open verified source record"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>
                        {activePhoto.sourceUrl.includes('wikimedia')
                          ? 'Wikimedia Commons'
                          : activePhoto.sourceUrl.includes('bforest.gov.bd')
                          ? 'Forest Dept (BFIS)'
                          : activePhoto.sourceUrl.includes('bnh.gov.bd')
                          ? 'National Herbarium'
                          : 'Source Record'}
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {allPhotos.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {allPhotos.map((p, idx) => {
                  const thumbSrc = getOptimizedImageUrl(p.url, 240);
                  const viewerSrc = getOptimizedImageUrl(p.url, 960);
                  const isActiveThumb = safeIndex === idx;
                  return (
                    <button
                      key={`${p.url}-${idx}`}
                      ref={isActiveThumb ? activeThumbRef : undefined}
                      type="button"
                      onClick={() => setCurrentPhotoIndex(idx)}
                      onMouseEnter={() => {
                        preloadImageUrl(viewerSrc);
                      }}
                      onFocus={() => {
                        preloadImageUrl(viewerSrc);
                      }}
                      className={`relative w-20 h-14 rounded-md overflow-hidden shrink-0 border-2 transition-colors cursor-pointer ${
                        isActiveThumb
                          ? 'border-[#42684D] dark:border-[#8A9C74]'
                          : 'border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={thumbSrc}
                        alt={`Thumbnail ${idx + 1}`}
                        loading="eager"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onLoad={() => markImageCached(thumbSrc)}
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 inset-x-0 bg-[#19382B]/85 text-[9px] text-center text-[#F3F1E8] font-mono py-0.5 capitalize">
                        {p.tag || `#${idx + 1}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* BOTANICAL DOSSIER & PROFILE */}
          <div className="space-y-4 pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15">
            {/* Distribution & Habitat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-md bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15">
                <div className="flex items-center gap-1.5 font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                  <MapPin className="w-3.5 h-3.5 text-[#987453]" />
                  <span>{t('geographicDistribution')}</span>
                </div>
                <p className="text-[#42684D] dark:text-[#BBC4A6] leading-relaxed">
                  {getLocalizedSpeciesField(species, 'distribution', lang)}
                </p>
              </div>

              <div className="p-3.5 rounded-md bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15">
                <div className="flex items-center gap-1.5 font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                  <Layers className="w-3.5 h-3.5 text-[#8A9C74]" />
                  <span>{t('ecologicalHabitat')}</span>
                </div>
                <p className="text-[#42684D] dark:text-[#BBC4A6] leading-relaxed">
                  {getLocalizedSpeciesField(species, 'habitat', lang)}
                </p>
              </div>
            </div>

            {/* Silvicultural Notes */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#987453] dark:text-[#BBC4A6] mb-1.5">
                {t('silviculturalNotesLabel')}
              </h4>
              <p className="text-xs sm:text-sm text-[#19382B] dark:text-[#F3F1E8]/90 leading-relaxed bg-[#F3F1E8] dark:bg-[#142D22] p-3.5 rounded-md border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15">
                {getLocalizedSpeciesField(species, 'silviculturalNotes', lang)}
              </p>
            </div>

            {/* Timber & Ecological Uses */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#987453] dark:text-[#BBC4A6] mb-1.5">
                {t('economicUsesLabel')}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(species.uses || []).map((use, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-sm text-xs font-medium bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20"
                  >
                    {getLocalizedUse(use, lang)}
                  </span>
                ))}
              </div>
            </div>

            {/* External Links */}
            {species.floraUrl && (
              <div className="pt-2">
                <a
                  href={species.floraUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-semibold bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 hover:border-[#42684D] transition-colors"
                >
                  <Globe className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>{t('readFullBotanicalFlora')}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Zoom Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-[#11261D]/95"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[94vh] flex flex-col bg-[#19382B] border border-[#BBC4A6]/30 rounded-lg overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-[#142D22] border-b border-[#BBC4A6]/20 text-[#F3F1E8] shrink-0">
              <div className="truncate pr-4">
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  <span className="font-scientific text-base sm:text-lg mr-1.5">{species.scientificName}</span>
                  <span>· {activePhoto.caption}</span>
                </h3>
                {activePhoto.credit && (
                  <p className="text-xs text-[#BBC4A6] truncate">{activePhoto.credit}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activePhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-[#42684D] hover:bg-[#8A9C74] hover:text-[#11261D] text-[#F3F1E8] text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Original</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(false)}
                  className="p-1.5 text-[#BBC4A6] hover:text-[#F3F1E8] rounded-md hover:bg-[#19382B] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-[#11261D]">
              <img
                key={effectiveZoomUrl}
                src={effectiveZoomUrl}
                alt={activePhoto.caption}
                onLoad={() => markImageCached(effectiveZoomUrl)}
                onError={(e) => {
                  if (!useOriginalForActive && optimizedZoomUrl !== activePhoto.url) {
                    setFallbackToOriginalMap((prev) => ({ ...prev, [activePhoto.url]: true }));
                  } else {
                    handleImageError(e);
                  }
                }}
                decoding="async"
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[78vh] object-contain rounded-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
