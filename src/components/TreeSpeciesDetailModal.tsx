import React, { useState, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { TreeSpecies, TreePhoto, StudentPhotoItem } from '../types';
import { addPhotoToTreeSpecies } from '../utils/storage';
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
  onClose: () => void;
  onOpenStudentSubmit: (speciesId: string) => void;
  onSpeciesUpdated?: (updated: TreeSpecies) => void;
}

export const TreeSpeciesDetailModal: React.FC<TreeSpeciesDetailModalProps> = ({
  species,
  studentPhotos,
  isOpen,
  onClose,
  onOpenStudentSubmit,
  onSpeciesUpdated,
}) => {
  const { t, lang } = useLanguage();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTag, setNewPhotoTag] = useState<'habit' | 'leaf' | 'bark' | 'flower' | 'fruit' | 'seed' | 'general'>('leaf');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [addSuccessMsg, setAddSuccessMsg] = useState('');
  const [addErrorMsg, setAddErrorMsg] = useState('');

  // Lightbox Zoom Modal for enlarged view
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isZoomOpen) {
          setIsZoomOpen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isZoomOpen, onClose]);

  // Reset index when species changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
    setIsAddingPhoto(false);
    setNewPhotoUrl('');
    setAddSuccessMsg('');
    setAddErrorMsg('');
  }, [species?.id]);

  if (!isOpen || !species) return null;

  // Build combined list of all photos
  const allPhotos: {
    url: string;
    caption: string;
    tag?: string;
    credit?: string;
    sourceUrl?: string;
    isStudent?: boolean;
    studentName?: string;
  }[] = [];

  // 1. Primary Photo
  if (species.imageUrl) {
    allPhotos.push({
      url: species.imageUrl,
      caption: `${species.commonName} (${species.banglaName}) - Primary Specimen Habit`,
      tag: 'habit',
      credit: species.photoCredit || 'Botanical Reference Photo',
      sourceUrl: species.sourceUrl || species.floraUrl,
    });
  }

  // 2. Multi-Photos from species.morePhotos (e.g. Flora of Bangladesh plates, BFIS, Wikimedia)
  if (species.morePhotos && species.morePhotos.length > 0) {
    species.morePhotos.forEach((p, idx) => {
      // Avoid duplicate of primary if URL is identical
      if (p.url !== species.imageUrl) {
        allPhotos.push({
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
      (sp.treeSpeciesId === species.id ||
        (sp.speciesScientificName &&
          sp.speciesScientificName.toLowerCase() === species.scientificName.toLowerCase()))
  );

  matchingStudentPhotos.forEach((sp) => {
    allPhotos.push({
      url: sp.imageUrl,
      caption: `${sp.title} - ${sp.caption}`,
      tag: 'student',
      credit: `Captured by ${sp.studentName} ${sp.studentBatch ? `(${sp.studentBatch})` : ''} · ${sp.location}`,
      isStudent: true,
      studentName: sp.studentName,
    });
  });

  // Fallback if empty
  if (allPhotos.length === 0) {
    allPhotos.push({
      url: '/assets/hero_forestry_sust.webp',
      caption: `${species.commonName} - Department Herbarium Record`,
      tag: 'habit',
      credit: 'SUST Department Archive',
    });
  }

  const activePhoto = allPhotos[Math.min(currentPhotoIndex, allPhotos.length - 1)];

  const handlePrev = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
  };

  const handleNext = () => {
    setCurrentPhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
  };

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
      setTimeout(() => setAddSuccessMsg(''), 4000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-4xl w-full max-h-[94vh] flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
          <div className="pr-4 truncate">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400">
                Family: {species.family}
              </span>
              <span className="text-stone-300 dark:text-stone-700">·</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                species.conservationStatus.includes('Critically')
                  ? 'bg-red-800 text-white'
                  : species.conservationStatus.includes('Vulnerable')
                  ? 'bg-amber-700 text-white'
                  : 'bg-emerald-800 text-white'
              }`}>
                {species.conservationStatus}
              </span>
              {species.forestEcosystem && (
                <>
                  <span className="text-stone-300 dark:text-stone-700">·</span>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <TreePine className="w-3.5 h-3.5" />
                    <span>{species.forestEcosystem}</span>
                  </span>
                </>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-black italic text-stone-900 dark:text-stone-100 leading-tight mt-0.5">
              {species.scientificName}
            </h2>
            <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium">
              <span>{species.commonName}</span>
              <span className="mx-1.5">·</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 font-sans">
                {species.banglaName}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* MULTI-PHOTO GALLERY SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  {lang === 'bn' ? 'বোটানিক্যাল ও নমুনার ছবি' : 'Botanical & Specimen Photos'} ({allPhotos.length})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPhoto(!isAddingPhoto)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingPhoto ? t('closeForm') : t('addMorePhotos')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenStudentSubmit(species.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-emerald-700 transition-colors cursor-pointer"
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
                className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-3 animate-fade-in"
              >
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Add Another Photo for {species.scientificName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Photo URL (HTTPS image link or Google Drive file) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPhotoUrl}
                      onChange={(e) => setNewPhotoUrl(e.target.value)}
                      placeholder="https://... or Google Drive shared image link"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Botanical Feature / Tag
                    </label>
                    <select
                      value={newPhotoTag}
                      onChange={(e) => setNewPhotoTag(e.target.value as any)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium"
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
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Caption / Notes
                  </label>
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={(e) => setNewPhotoCaption(e.target.value)}
                    placeholder="e.g. Fissured dark grey bark, or Inflorescence in blooming stage"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  />
                </div>

                {addErrorMsg && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{addErrorMsg}</p>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPhoto(false)}
                    className="px-3 py-1.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                  >
                    Save Photo to Species
                  </button>
                </div>
              </form>
            )}

            {addSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{addSuccessMsg}</span>
              </div>
            )}

            {/* Main Interactive Photo Viewer */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950 shadow-md">
              <div
                className="relative h-64 sm:h-80 md:h-96 w-full flex items-center justify-center cursor-pointer group"
                onClick={() => setIsZoomOpen(true)}
              >
                <img
                  src={activePhoto.url}
                  alt={activePhoto.caption}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                  }}
                  className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-300"
                />

                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-bold backdrop-blur-2xs">
                  <ZoomIn className="w-5 h-5" />
                  <span>Click for Fullscreen Zoom</span>
                </div>

                {/* Top Badge on Photo */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/75 text-emerald-300 backdrop-blur-xs font-mono">
                    {activePhoto.tag || 'specimen'}
                  </span>
                  {activePhoto.isStudent && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-700 text-white backdrop-blur-xs flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>Student Observation</span>
                    </span>
                  )}
                </div>

                {/* Counter Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/75 text-white backdrop-blur-xs">
                  {currentPhotoIndex + 1} / {allPhotos.length}
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
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
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
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors"
                      aria-label="Next photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Caption & Credit Bar */}
              <div className="p-3 bg-stone-900 border-t border-stone-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="font-medium text-stone-200 truncate pr-2">
                  {activePhoto.caption}
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  {activePhoto.credit && (
                    <div className="text-[11px] text-stone-400 font-mono">
                      {activePhoto.credit}
                    </div>
                  )}
                  {activePhoto.sourceUrl && (
                    <a
                      href={activePhoto.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded-md bg-emerald-900/90 hover:bg-emerald-800 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors border border-emerald-700/60"
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
                {allPhotos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPhotoIndex(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      currentPhotoIndex === idx
                        ? 'border-emerald-500 scale-105 shadow-md ring-2 ring-emerald-500/30'
                        : 'border-stone-200 dark:border-stone-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={p.url}
                      alt={`Thumbnail ${idx + 1}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-center text-stone-300 font-mono py-0.2 capitalize">
                      {p.tag || `#${idx + 1}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BOTANICAL DOSSIER & PROFILE */}
          <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-stone-800">
            {/* Distribution & Habitat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>{t('geographicDistribution')}</span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  {getLocalizedSpeciesField(species, 'distribution', lang)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-1.5 font-bold text-stone-900 dark:text-stone-100 mb-1">
                  <Layers className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t('ecologicalHabitat')}</span>
                </div>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  {getLocalizedSpeciesField(species, 'habitat', lang)}
                </p>
              </div>
            </div>

            {/* Silvicultural Notes */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                {t('silviculturalNotesLabel')}
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50/50 dark:bg-stone-950/40 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800">
                {getLocalizedSpeciesField(species, 'silviculturalNotes', lang)}
              </p>
            </div>

            {/* Timber & Ecological Uses */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5">
                {t('economicUsesLabel')}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {species.uses.map((use, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
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
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  <Globe className="w-4 h-4 text-emerald-600" />
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
          className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[94vh] flex flex-col bg-stone-900 border border-stone-700 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-stone-950 border-b border-stone-800 text-white shrink-0">
              <div className="truncate pr-4">
                <h3 className="font-bold text-sm sm:text-base truncate">
                  {species.scientificName} · {activePhoto.caption}
                </h3>
                {activePhoto.credit && (
                  <p className="text-xs text-stone-400 truncate">{activePhoto.credit}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activePhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open Original</span>
                </a>
                <button
                  onClick={() => setIsZoomOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-center justify-center bg-black/70">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption}
                className="max-w-full max-h-[78vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
