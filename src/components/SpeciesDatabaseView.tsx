import React, { useState, useEffect, useMemo } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { 
  TreePine, 
  Search, 
  Filter, 
  ShieldAlert, 
  MapPin, 
  Layers, 
  Tag, 
  Info,
  CheckCircle2,
  Camera,
  ZoomIn,
  Plus,
  User,
  X,
  ExternalLink,
} from 'lucide-react';

import { TreeSpecies, StudentPhotoItem } from '../types';
import { getStoredSpecies, getStoredStudentPhotos, isMatchedPhotoForSpecies } from '../utils/storage';
import { getOptimizedImageUrl, handleImageError, markImageCached } from '../utils/imageUtils';
import { SubmitStudentPhotoModal } from './SubmitStudentPhotoModal';
import { TreeSpeciesDetailModal } from './TreeSpeciesDetailModal';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  getLocalizedSpeciesField, 
  getLocalizedEcosystem, 
  getLocalizedConservationStatus, 
  getLocalizedUse 
} from '../utils/speciesTranslations';

export const SpeciesDatabaseView: React.FC = () => {
  const { t, lang } = useLanguage();

  usePageMeta({
    title: 'Dendrology & Tree Species Database with Photography',
    description: 'Silvicultural database of indigenous and plantation tree species of Bangladesh with taxonomy, botanical photography, student observations, and wood utilization profiles.',
  });

  const [species, setSpecies] = useState<TreeSpecies[]>([]);
  const [studentPhotos, setStudentPhotos] = useState<StudentPhotoItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>('all');
  const [selectedUse, setSelectedUse] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Selected Tree Species Detail Modal (with multi-photo gallery)
  const [selectedTreeDetail, setSelectedTreeDetail] = useState<TreeSpecies | null>(null);
  const [selectedTreePhotoIndex, setSelectedTreePhotoIndex] = useState<number>(0);

  const handleOpenSpeciesDetail = (sp: TreeSpecies, photoIdx = 0) => {
    setSelectedTreePhotoIndex(Math.max(0, photoIdx));
    setSelectedTreeDetail(sp);
  };

  // Student Photo Submission Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [contributeSpeciesId, setContributeSpeciesId] = useState<string | undefined>(undefined);

  // Lightbox Zoom Modal
  const [activeLightbox, setActiveLightbox] = useState<{
    url: string;
    title: string;
    scientificName?: string;
    credit?: string;
    floraUrl?: string;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [spData, stuData] = await Promise.all([
        getStoredSpecies(),
        getStoredStudentPhotos()
      ]);
      setSpecies(spData);
      setStudentPhotos(stuData);
    } catch (err) {
      console.warn('Species data load warning, using cached fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadData();

    const handleUpdate = (e: Event) => {
      const customEvt = e as CustomEvent<{ collection?: string }>;
      const collection = customEvt.detail?.collection;
      // Only reload when species, student_photos, or all collections were modified
      if (!collection || collection === 'species' || collection === 'student_photos' || collection === 'all') {
        if (isMounted) {
          loadData();
        }
      }
    };

    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('sust_fes_data_updated', handleUpdate);
    };
  }, []);

  const families = useMemo(() => {
    if (!Array.isArray(species)) return [];
    const set = new Set(species.map((s) => s.family).filter(Boolean));
    return Array.from(set).sort();
  }, [species]);

  const allUses = useMemo(() => {
    if (!Array.isArray(species)) return [];
    const set = new Set<string>();
    species.forEach((s) => {
      if (Array.isArray(s.uses)) {
        s.uses.forEach((u) => {
          if (u) set.add(u);
        });
      }
    });
    return Array.from(set).sort();
  }, [species]);

  const ecosystems = useMemo(() => {
    if (!Array.isArray(species)) return [];
    const set = new Set<string>();
    species.forEach((s) => {
      if (s.forestEcosystem) set.add(s.forestEcosystem);
    });
    return Array.from(set).sort();
  }, [species]);

  const filteredSpecies = useMemo(() => {
    if (!Array.isArray(species)) return [];
    return species.filter((s) => {
      if (!s) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          (s.scientificName && s.scientificName.toLowerCase().includes(q)) ||
          (s.commonName && s.commonName.toLowerCase().includes(q)) ||
          (s.banglaName && s.banglaName.toLowerCase().includes(q)) ||
          (s.family && s.family.toLowerCase().includes(q)) ||
          (s.distribution && s.distribution.toLowerCase().includes(q)) ||
          (s.silviculturalNotes && s.silviculturalNotes.toLowerCase().includes(q)) ||
          (s.forestEcosystem && s.forestEcosystem.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (selectedFamily !== 'all' && s.family !== selectedFamily) return false;
      if (selectedEcosystem !== 'all' && s.forestEcosystem !== selectedEcosystem) return false;
      if (selectedUse !== 'all' && (!Array.isArray(s.uses) || !s.uses.includes(selectedUse))) return false;
      return true;
    });
  }, [species, search, selectedFamily, selectedEcosystem, selectedUse]);

  // Group approved student photos by species ID or scientific name
  const studentPhotosBySpecies = useMemo(() => {
    const map = new Map<string, StudentPhotoItem[]>();
    if (!Array.isArray(studentPhotos)) return map;
    studentPhotos
      .filter((p) => p && (p.status === 'approved' || p.status === 'featured'))
      .forEach((p) => {
        if (p.treeSpeciesId) {
          const list = map.get(p.treeSpeciesId) || [];
          list.push(p);
          map.set(p.treeSpeciesId, list);
        } else if (p.speciesScientificName) {
          const list = map.get(p.speciesScientificName.toLowerCase()) || [];
          list.push(p);
          map.set(p.speciesScientificName.toLowerCase(), list);
        }
      });
    return map;
  }, [studentPhotos]);

  // Reset pagination window whenever user searches or filters
  useEffect(() => {
    setVisibleCount(12);
  }, [search, selectedFamily, selectedEcosystem, selectedUse]);

  const handleOpenContribute = (speciesId?: string) => {
    setContributeSpeciesId(speciesId);
    setIsSubmitModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Editorial Herbarium Banner */}
      <div className="bg-[#19382B] rounded-lg p-6 sm:p-8 text-[#F3F1E8] border border-[#42684D]/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[#BBC4A6] text-xs font-semibold uppercase tracking-wider mb-2">
            <TreePine className="w-4 h-4 text-[#8A9C74]" />
            <span>{t('herbariumSubtitle')}</span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold tracking-tight mb-2 text-[#F3F1E8]">
            {t('speciesDbTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#F3F1E8]/85 leading-relaxed">
            {t('speciesDbSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenContribute()}
          className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-md text-xs sm:text-sm font-semibold bg-[#42684D] hover:bg-[#8A9C74] hover:text-[#11261D] text-[#F3F1E8] transition-colors cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>{lang === 'bn' ? 'ফিল্ড ছবি যুক্ত করুন' : 'Contribute Field Photo'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchSpeciesPlaceholder')}
              aria-label="Search tree species"
              className="w-full pl-10 pr-4 py-2 rounded-md text-xs sm:text-sm bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] placeholder:text-[#42684D]/65 dark:placeholder:text-[#BBC4A6]/60 focus:outline-hidden focus:ring-2 focus:ring-[#42684D]"
            />
          </div>

          {/* Family and Ecosystem Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedEcosystem}
              onChange={(e) => setSelectedEcosystem(e.target.value)}
              aria-label="Filter by forest ecosystem"
              className="px-3 py-2 rounded-md text-xs font-medium bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8]"
            >
              <option value="all">{t('allEcosystems')} ({ecosystems.length})</option>
              {ecosystems.map((eco) => (
                <option key={eco} value={eco}>{getLocalizedEcosystem(eco, lang)}</option>
              ))}
            </select>

            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              aria-label="Filter by botanical family"
              className="px-3 py-2 rounded-md text-xs font-medium bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6] dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8]"
            >
              <option value="all">{t('allFamilies')} ({families.length})</option>
              {families.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* Reset button if filtered */}
            {(search || selectedFamily !== 'all' || selectedEcosystem !== 'all' || selectedUse !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedFamily('all');
                  setSelectedEcosystem('all');
                  setSelectedUse('all');
                }}
                className="px-3 py-2 rounded-md text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] bg-[#EAE7DA] dark:bg-[#142D22] hover:bg-[#BBC4A6]/40 border border-[#BBC4A6]/70 transition-colors shrink-0 cursor-pointer"
              >
                {t('reset')}
              </button>
            )}
          </div>
        </div>

        {/* Clean Ecosystem Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15 no-scrollbar w-full">
          {[
            { id: 'all', label: t('allEcosystems') },
            { id: 'Sundarbans Mangrove Tidal Forest', label: t('mangroves') },
            { id: 'Madhupur & Barind Moist Deciduous Sal Forest', label: t('salDeciduous') },
            { id: 'Sylhet & Chittagong Hill Tracts Semi-Evergreen Forest', label: t('hillSemiEvergreen') },
            { id: 'Plains, Alluvial Basin & Homestead Forestry', label: t('plainsHomestead') },
          ].map((ecoTab) => {
            const isSelected = selectedEcosystem === ecoTab.id;
            return (
              <button
                key={ecoTab.id}
                type="button"
                onClick={() => setSelectedEcosystem(ecoTab.id)}
                className={`px-3 py-1.5 text-xs rounded-md whitespace-nowrap shrink-0 font-medium transition-colors cursor-pointer border ${
                  isSelected
                    ? 'bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] border-[#19382B] dark:border-[#8A9C74] font-semibold'
                    : 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 hover:border-[#42684D] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
                }`}
              >
                {ecoTab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 overflow-hidden"
            >
              <div className="aspect-[4/3] bg-[#EAE7DA] dark:bg-[#142D22]" />
              <div className="p-5 space-y-3">
                <div className="h-3.5 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm w-1/2" />
                <div className="h-14 bg-[#F3F1E8] dark:bg-[#11261D] rounded-sm" />
                <div className="h-10 bg-[#EAE7DA] dark:bg-[#142D22] rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredSpecies.length === 0 ? (
        <div className="text-center py-16 bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-8">
          <TreePine className="w-10 h-10 text-[#8A9C74] mx-auto mb-3" />
          <h3 className="text-base font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
            {t('noSpeciesFound')}
          </h3>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] max-w-sm mx-auto">
            {t('noSpeciesFoundDesc')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSpecies.slice(0, visibleCount).map((sp) => {
              const rawStudentObs = studentPhotosBySpecies.get(sp.id) ||
                                 studentPhotosBySpecies.get((sp.scientificName || '').toLowerCase()) || [];
              const studentObs = rawStudentObs.filter((obs) =>
                isMatchedPhotoForSpecies(obs.imageUrl, sp.scientificName || '')
              );

              const photoUrl =
                sp.imageUrl && isMatchedPhotoForSpecies(sp.imageUrl, sp.scientificName || '')
                  ? sp.imageUrl
                  : '/assets/hero_forestry_sust.webp';
              const validPlates = (sp.morePhotos || []).filter(
                (p) => p?.url && p.url !== sp.imageUrl && isMatchedPhotoForSpecies(p.url, sp.scientificName || '')
              );
              const totalPhotos = (sp.imageUrl ? 1 : 0) + validPlates.length + studentObs.length;

            return (
              <article
                key={sp.id}
                className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 overflow-hidden hover:border-[#42684D] dark:hover:border-[#8A9C74] transition-colors flex flex-col justify-between"
              >
                <div>
                  {/* Prominent Botanical Photograph with Consistent 4:3 Aspect Ratio */}
                  <div 
                    className="relative aspect-[4/3] bg-[#19382B] overflow-hidden cursor-pointer group"
                    onClick={() => handleOpenSpeciesDetail(sp, 0)}
                  >
                    <img
                      src={getOptimizedImageUrl(photoUrl, 720)}
                      alt={`${sp.scientificName} — ${sp.commonName}`}
                      onLoad={(e) => markImageCached(e.currentTarget.getAttribute('src'))}
                      onError={handleImageError}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-28 bg-[#19382B]/75" />

                    {/* Family & Conservation Tag on Photo */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-semibold bg-[#19382B]/90 text-[#F3F1E8] border border-[#BBC4A6]/30">
                        {t('familyLabel')} {sp.family}
                      </span>

                      <span className={`px-2.5 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-wider ${
                        (sp.conservationStatus || '').includes('Critically') || (sp.conservationStatus || '').includes('Vulnerable')
                          ? 'bg-[#987453] text-[#FAF9F4]'
                          : 'bg-[#42684D] text-[#FAF9F4]'
                      }`}>
                        {getLocalizedConservationStatus(sp.conservationStatus || 'Least Concern', lang)}
                      </span>
                    </div>

                    {/* Botanical Title & Photo Count Overlay */}
                    <div 
                      className="absolute bottom-3 left-3.5 right-3.5 text-[#F3F1E8] flex items-end justify-between gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSpeciesDetail(sp, 0);
                      }}
                    >
                      <div className="min-w-0 pr-2">
                        <h2 className="font-scientific text-2xl sm:text-[1.65rem] font-semibold leading-tight text-[#FAF9F4] truncate">
                          {sp.scientificName}
                        </h2>
                        <div className="text-xs text-[#F3F1E8]/90 font-medium flex items-center gap-1.5 truncate mt-0.5">
                          <span>{sp.commonName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#BBC4A6]">{sp.banglaName}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span className="px-2.5 py-1 rounded-sm text-[10px] font-mono font-semibold bg-[#19382B]/90 text-[#F3F1E8] border border-[#BBC4A6]/35 flex items-center gap-1">
                          <Camera className="w-3 h-3 text-[#BBC4A6]" />
                          <span>{totalPhotos} {t('photosWord')}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    {/* Ecosystem & Photo Provenance Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15 pb-2.5">
                      {sp.forestEcosystem ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#42684D] dark:text-[#8A9C74]">
                          <TreePine className="w-3.5 h-3.5 shrink-0" />
                          <span>{getLocalizedEcosystem(sp.forestEcosystem, lang)}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-[#987453] dark:text-[#BBC4A6]">
                        <span className="truncate max-w-[200px]">
                          {sp.photoCredit || 'SUST FES Herbarium Archive'}
                        </span>
                        {(sp.sourceUrl || sp.floraUrl) && (
                          <a
                            href={sp.sourceUrl || sp.floraUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#42684D] dark:text-[#8A9C74] hover:underline flex items-center gap-0.5 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>
                              {(sp.sourceUrl || '').includes('wikimedia')
                                ? 'Wikimedia'
                                : (sp.sourceUrl || '').includes('bforest.gov.bd')
                                ? 'BFIS'
                                : (sp.sourceUrl || '').includes('bnh.gov.bd')
                                ? 'BNH'
                                : 'Source'}
                            </span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Natural Distribution & Habitat */}
                    <div className="p-3 rounded-md bg-[#F3F1E8] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 text-xs space-y-1.5">
                      <div className="flex items-start gap-2 text-[#19382B] dark:text-[#F3F1E8]">
                        <MapPin className="w-3.5 h-3.5 text-[#987453] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold">{t('distributionLabel')} </span>
                          <span className="text-[#42684D] dark:text-[#BBC4A6]">{getLocalizedSpeciesField(sp, 'distribution', lang)}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-[#42684D] dark:text-[#BBC4A6]">
                        <Layers className="w-3.5 h-3.5 text-[#8A9C74] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">{t('habitatLabel')} </span>
                          <span>{getLocalizedSpeciesField(sp, 'habitat', lang)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Silvicultural Notes */}
                    <p className="text-xs text-[#19382B]/85 dark:text-[#F3F1E8]/85 leading-relaxed">
                      {getLocalizedSpeciesField(sp, 'silviculturalNotes', lang)}
                    </p>

                    {/* Botanical Photo Plates Strip */}
                    {sp.morePhotos && sp.morePhotos.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1.5">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                            <span>{t('botanicalPlates')} ({sp.morePhotos.length + 1})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenSpeciesDetail(sp, 0)}
                            className="text-[10px] font-semibold text-[#42684D] dark:text-[#8A9C74] hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>{t('addPhoto')}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                          <button
                            type="button"
                            onClick={() => handleOpenSpeciesDetail(sp, 0)}
                            className="relative w-14 h-12 rounded-md overflow-hidden shrink-0 border border-[#42684D] bg-[#19382B] cursor-pointer"
                            title="Primary Specimen Habit"
                          >
                            <img
                              src={getOptimizedImageUrl(photoUrl, 240)}
                              alt={sp.scientificName}
                              onLoad={(e) => markImageCached(e.currentTarget.getAttribute('src'))}
                              onError={handleImageError}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-[#19382B]/85 text-[8px] text-[#F3F1E8] text-center font-mono">
                              Habit
                            </span>
                          </button>
                          {sp.morePhotos.slice(0, 4).map((p, pIdx) => {
                            const dedupedBefore = sp.morePhotos!
                              .slice(0, pIdx)
                              .filter((prev) => prev.url !== sp.imageUrl).length;
                            const targetIdx = p.url === sp.imageUrl ? 0 : 1 + dedupedBefore;
                            return (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => handleOpenSpeciesDetail(sp, targetIdx)}
                                className="relative w-14 h-12 rounded-md overflow-hidden shrink-0 border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#19382B] hover:border-[#42684D] transition-colors cursor-pointer"
                                title={p.caption || `Plate ${pIdx + 1}`}
                              >
                                <img
                                  src={getOptimizedImageUrl(p.url, 240)}
                                  alt={p.caption || `Plate ${pIdx + 1}`}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  onLoad={(e) => markImageCached(e.currentTarget.getAttribute('src'))}
                                  onError={handleImageError}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-0 inset-x-0 bg-[#19382B]/85 text-[8px] text-[#BBC4A6] text-center font-mono capitalize">
                                  {p.tag || `#${pIdx + 1}`}
                                </span>
                              </button>
                            );
                          })}
                          {sp.morePhotos.length > 4 && (
                            <button
                              type="button"
                              onClick={() => handleOpenSpeciesDetail(sp, 5)}
                              className="w-14 h-12 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-[10px] font-semibold flex flex-col items-center justify-center shrink-0 border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 hover:bg-[#BBC4A6]/40 transition-colors cursor-pointer"
                            >
                              <span>+{sp.morePhotos.length - 4}</span>
                              <span className="text-[8px] text-[#42684D] dark:text-[#BBC4A6]">more</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Student Observations Section */}
                    {studentObs.length > 0 && (
                      <div className="pt-2 border-t border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                            <span>{t('studentFieldObservations')} ({studentObs.length})</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {studentObs.map((obs, obsIdx) => {
                            const dedupedMoreCount = (sp.morePhotos || []).filter(
                              (mp) => mp.url !== sp.imageUrl
                            ).length;
                            const studentStartIdx = (sp.imageUrl ? 1 : 0) + dedupedMoreCount + obsIdx;
                            return (
                              <div
                                key={obs.id}
                                onClick={() => handleOpenSpeciesDetail(sp, studentStartIdx)}
                                className="relative group shrink-0 w-24 h-16 rounded-md overflow-hidden border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#19382B] cursor-pointer hover:border-[#42684D]"
                                title={`${obs.title} by ${obs.studentName}`}
                              >
                                <img
                                  src={getOptimizedImageUrl(obs.imageUrl, 240)}
                                  alt={obs.title}
                                  loading="lazy"
                                  decoding="async"
                                  referrerPolicy="no-referrer"
                                  onLoad={(e) => markImageCached(e.currentTarget.getAttribute('src'))}
                                  onError={handleImageError}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-[#19382B]/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#F3F1E8]">
                                  <ZoomIn className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Uses & Actions */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="pt-3 border-t border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15 flex flex-wrap gap-1.5">
                    {(sp.uses || []).map((u, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-sm text-[10px] font-medium bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#BBC4A6] border border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15"
                      >
                        {getLocalizedUse(u, lang)}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#BBC4A6]/45 dark:border-[#BBC4A6]/15 gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleOpenSpeciesDetail(sp, 0)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#19382B] dark:bg-[#42684D] text-[#F3F1E8] hover:bg-[#42684D] transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t('viewAllPhotos')} ({totalPhotos}) &amp; {t('details')}</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleOpenSpeciesDetail(sp, 0)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#42684D] dark:text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] transition-colors cursor-pointer"
                        title="Add more photos to this tree species"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('addPhoto')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenContribute(sp.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#987453] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>{t('studentLens')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

          {/* Progressive Load More / Results Indicator */}
          {filteredSpecies.length > 12 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#BBC4A6]/60 dark:border-[#BBC4A6]/15 text-xs text-[#42684D] dark:text-[#BBC4A6]">
              <span>
                Showing <strong className="text-[#19382B] dark:text-[#F3F1E8]">{Math.min(visibleCount, filteredSpecies.length)}</strong> of <strong className="text-[#19382B] dark:text-[#F3F1E8]">{filteredSpecies.length}</strong> botanical species
              </span>
              {visibleCount < filteredSpecies.length ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredSpecies.length))}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-md font-semibold text-xs bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Load More Species (+{Math.min(12, filteredSpecies.length - visibleCount)})</span>
                </button>
              ) : (
                <span className="text-[#42684D] dark:text-[#8A9C74] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  All {filteredSpecies.length} species displayed
                </span>
              )}
            </div>
          )}
        </>
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
                <h3 className="font-semibold text-sm sm:text-base truncate">
                  {activeLightbox.title}
                  {activeLightbox.scientificName && (
                    <span className="font-scientific ml-2 font-normal text-base text-[#BBC4A6]">
                      ({activeLightbox.scientificName})
                    </span>
                  )}
                </h3>
                {activeLightbox.credit && (
                  <p className="text-xs text-[#BBC4A6] truncate">{activeLightbox.credit}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeLightbox.floraUrl && (
                  <a
                    href={activeLightbox.floraUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-md bg-[#42684D] hover:bg-[#8A9C74] hover:text-[#11261D] text-[#F3F1E8] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Flora of Bangladesh</span>
                  </a>
                )}
                <a
                  href={activeLightbox.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-md bg-[#19382B] hover:bg-[#42684D] text-[#F3F1E8] text-xs font-medium flex items-center gap-1.5 border border-[#BBC4A6]/25 transition-colors"
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
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[72vh] object-contain rounded-md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tree Species Multi-Photo & Detail Modal with 'Add More Photos' Option */}
      <TreeSpeciesDetailModal
        species={selectedTreeDetail}
        studentPhotos={studentPhotos}
        isOpen={!!selectedTreeDetail}
        initialPhotoIndex={selectedTreePhotoIndex}
        onClose={() => setSelectedTreeDetail(null)}
        onOpenStudentSubmit={(speciesId) => {
          setSelectedTreeDetail(null);
          setContributeSpeciesId(speciesId);
          setIsSubmitModalOpen(true);
        }}
        onSpeciesUpdated={(updated) => {
          setSpecies((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
          setSelectedTreeDetail(updated);
        }}
      />

      {/* Student Submission Modal */}
      <SubmitStudentPhotoModal
        isOpen={isSubmitModalOpen}
        onClose={() => {
          setIsSubmitModalOpen(false);
          setContributeSpeciesId(undefined);
        }}
        preSelectedSpeciesId={contributeSpeciesId}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
