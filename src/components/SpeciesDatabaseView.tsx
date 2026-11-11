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
  Sparkles
} from 'lucide-react';

import { TreeSpecies, StudentPhotoItem } from '../types';
import { getStoredSpecies, getStoredStudentPhotos } from '../utils/storage';
import { SubmitStudentPhotoModal } from './SubmitStudentPhotoModal';
import { TreeSpeciesDetailModal } from './TreeSpeciesDetailModal';

export const SpeciesDatabaseView: React.FC = () => {
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

  // Selected Tree Species Detail Modal (with multi-photo gallery)
  const [selectedTreeDetail, setSelectedTreeDetail] = useState<TreeSpecies | null>(null);

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
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('sust_fes_data_updated', handleUpdate);
    return () => window.removeEventListener('sust_fes_data_updated', handleUpdate);
  }, []);

  const families = useMemo(() => {
    const set = new Set(species.map((s) => s.family));
    return Array.from(set).sort();
  }, [species]);

  const allUses = useMemo(() => {
    const set = new Set<string>();
    species.forEach((s) => s.uses.forEach((u) => set.add(u)));
    return Array.from(set).sort();
  }, [species]);

  const ecosystems = useMemo(() => {
    const set = new Set<string>();
    species.forEach((s) => {
      if (s.forestEcosystem) set.add(s.forestEcosystem);
    });
    return Array.from(set).sort();
  }, [species]);

  const filteredSpecies = useMemo(() => {
    return species.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          s.scientificName.toLowerCase().includes(q) ||
          s.commonName.toLowerCase().includes(q) ||
          s.banglaName.toLowerCase().includes(q) ||
          s.family.toLowerCase().includes(q) ||
          s.distribution.toLowerCase().includes(q) ||
          s.silviculturalNotes.toLowerCase().includes(q) ||
          (s.forestEcosystem && s.forestEcosystem.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (selectedFamily !== 'all' && s.family !== selectedFamily) return false;
      if (selectedEcosystem !== 'all' && s.forestEcosystem !== selectedEcosystem) return false;
      if (selectedUse !== 'all' && !s.uses.includes(selectedUse)) return false;
      return true;
    });
  }, [species, search, selectedFamily, selectedEcosystem, selectedUse]);

  // Group approved student photos by species ID or scientific name
  const studentPhotosBySpecies = useMemo(() => {
    const map = new Map<string, StudentPhotoItem[]>();
    studentPhotos
      .filter((p) => p.status === 'approved' || p.status === 'featured')
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

  const handleOpenContribute = (speciesId?: string) => {
    setContributeSpeciesId(speciesId);
    setIsSubmitModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-950 rounded-2xl p-6 sm:p-8 text-white border border-emerald-900/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <TreePine className="w-4 h-4 text-emerald-400" />
            <span>FES SUST Dendrology & Botanical Herbarium</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Tree Species Database & Field Photos
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Botanical taxonomy, high-resolution habit photography, student field observations, and wood utilization profiles for the 55 major forestry tree species of Bangladesh.
          </p>
        </div>

        <button
          onClick={() => handleOpenContribute()}
          className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-md hover:shadow-lg transition-all"
        >
          <Camera className="w-4 h-4" />
          <span>Contribute Field Photo</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by scientific name (Dipterocarpus), common name, Bangla (গর্জন), or notes..."
            aria-label="Search tree species"
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Family and Ecosystem Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedEcosystem}
            onChange={(e) => setSelectedEcosystem(e.target.value)}
            aria-label="Filter by forest ecosystem"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            <option value="all">All Forest Ecosystems ({ecosystems.length})</option>
            {ecosystems.map((eco) => (
              <option key={eco} value={eco}>{eco}</option>
            ))}
          </select>

          <select
            value={selectedFamily}
            onChange={(e) => setSelectedFamily(e.target.value)}
            aria-label="Filter by botanical family"
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200"
          >
            <option value="all">All Families ({families.length})</option>
            {families.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          {/* Reset button if filtered */}
          {(search || selectedFamily !== 'all' || selectedEcosystem !== 'all' || selectedUse !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedFamily('all');
                setSelectedEcosystem('all');
                setSelectedUse('all');
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100 bg-stone-100 dark:bg-stone-800 transition-colors shrink-0 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Quick Ecosystem Highlighted Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar w-full">
          {[
            { id: 'all', label: 'All Ecosystems' },
            { id: 'Sundarbans Mangrove Tidal Forest', label: '🌊 Mangroves' },
            { id: 'Madhupur & Barind Moist Deciduous Sal Forest', label: '🍂 Sal / Deciduous' },
            { id: 'Sylhet & Chittagong Hill Tracts Semi-Evergreen Forest', label: '🌲 Hill Semi-Evergreen' },
            { id: 'Plains, Alluvial Basin & Homestead Forestry', label: '🏡 Plains & Homestead' },
          ].map((ecoTab) => {
            const isSelected = selectedEcosystem === ecoTab.id;
            return (
              <button
                key={ecoTab.id}
                type="button"
                onClick={() => setSelectedEcosystem(ecoTab.id)}
                className={`px-3 py-1.5 text-xs rounded-xl whitespace-nowrap shrink-0 font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-linear-to-r from-emerald-800 to-emerald-700 dark:from-emerald-700 dark:to-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-400/40 scale-[1.02]'
                    : 'bg-white dark:bg-stone-800/90 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700/80 hover:border-emerald-500/50 hover:bg-emerald-50/50 dark:hover:bg-stone-700 font-medium shadow-2xs'
                }`}
              >
                {ecoTab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Grid */}
      {filteredSpecies.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-8">
          <TreePine className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 dark:text-stone-200 mb-1">
            No Species Found
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            Try a different botanical name or clear your filters to view the complete catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSpecies.map((sp) => {
            const studentObs = studentPhotosBySpecies.get(sp.id) || 
                               studentPhotosBySpecies.get(sp.scientificName.toLowerCase()) || [];

            const photoUrl = sp.imageUrl || '/assets/hero_forestry_sust.webp';
            const totalPhotos = 1 + (sp.morePhotos?.length || 0) + studentObs.length;

            return (
              <div
                key={sp.id}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo Habit Banner - Clicking opens Multi-Photo Detail Modal */}
                  <div 
                    className="relative h-52 sm:h-56 bg-stone-950 overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedTreeDetail(sp)}
                  >
                    <img
                      src={photoUrl}
                      alt={`${sp.scientificName} - ${sp.commonName}`}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                      }}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/20" />

                    {/* Detail Trigger Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-2xs">
                      <Camera className="w-4 h-4 text-emerald-400" />
                      <span>View All Photos ({totalPhotos}) & Details</span>
                    </div>

                    {/* Family & Conservation Badge on Photo */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-black/75 text-emerald-300 backdrop-blur-xs">
                        Family: {sp.family}
                      </span>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs ${
                        sp.conservationStatus.includes('Critically')
                          ? 'bg-red-800 text-white'
                          : sp.conservationStatus.includes('Vulnerable')
                          ? 'bg-amber-700 text-white'
                          : 'bg-emerald-800 text-white'
                      }`}>
                        {sp.conservationStatus}
                      </span>
                    </div>

                    {/* Title & Photo Count Overlay */}
                    <div 
                      className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTreeDetail(sp);
                      }}
                    >
                      <div className="min-w-0 pr-2">
                        <h2 className="text-lg sm:text-xl font-black italic leading-tight drop-shadow-sm hover:text-emerald-300 transition-colors truncate">
                          {sp.scientificName}
                        </h2>
                        <div className="text-xs text-stone-200 font-medium flex items-center gap-1.5 drop-shadow-sm truncate">
                          <span>{sp.commonName}</span>
                          <span>·</span>
                          <span className="font-semibold text-emerald-300 font-sans">{sp.banglaName}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-black/80 text-white border border-white/20 backdrop-blur-xs flex items-center gap-1">
                          <Camera className="w-3 h-3 text-emerald-400" />
                          <span>{totalPhotos} Photos</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3.5">
                    {/* Ecosystem & Photo Provenance Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-stone-100 dark:border-stone-800 pb-2.5">
                      {sp.forestEcosystem ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                          <TreePine className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{sp.forestEcosystem}</span>
                        </div>
                      ) : (
                        <div />
                      )}

                      {sp.photoCredit && (
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-stone-400">
                          <span className="truncate max-w-[200px]">{sp.photoCredit}</span>
                          {(sp.sourceUrl || sp.floraUrl) && (
                            <a
                              href={sp.sourceUrl || sp.floraUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 shrink-0"
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
                      )}
                    </div>

                    {/* Natural Distribution & Habitat */}
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800/80 text-xs space-y-1.5">
                      <div className="flex items-start gap-2 text-stone-700 dark:text-stone-300">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-stone-900 dark:text-stone-100">Distribution: </span>
                          {sp.distribution}
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-stone-600 dark:text-stone-400">
                        <Layers className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-stone-800 dark:text-stone-200">Habitat: </span>
                          {sp.habitat}
                        </div>
                      </div>
                    </div>

                    {/* Silvicultural Notes */}
                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                      {sp.silviculturalNotes}
                    </p>

                    {/* Botanical Photo Plates Strip (Habit, Leaf, Bark, Flower, Fruit) */}
                    {sp.morePhotos && sp.morePhotos.length > 0 && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                          <span className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Botanical Plates ({sp.morePhotos.length + 1})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedTreeDetail(sp)}
                            className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Add photo</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                          {/* Primary thumbnail */}
                          <button
                            type="button"
                            onClick={() => setSelectedTreeDetail(sp)}
                            className="relative w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-emerald-500/60 bg-stone-900 group"
                            title="Primary Specimen Habit"
                          >
                            <img
                              src={photoUrl}
                              alt={sp.scientificName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                              decoding="async"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-emerald-300 text-center font-mono">
                              Habit
                            </span>
                          </button>
                          {/* Additional botanical plates */}
                          {sp.morePhotos.slice(0, 4).map((p, pIdx) => (
                            <button
                              key={pIdx}
                              type="button"
                              onClick={() => setSelectedTreeDetail(sp)}
                              className="relative w-14 h-12 rounded-lg overflow-hidden shrink-0 border border-stone-200 dark:border-stone-800 bg-stone-900 hover:border-emerald-500 transition-colors group"
                              title={p.caption || `Plate ${pIdx + 1}`}
                            >
                              <img
                                src={p.url}
                                alt={p.caption || `Plate ${pIdx + 1}`}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-stone-300 text-center font-mono capitalize">
                                {p.tag || `#${pIdx + 1}`}
                              </span>
                            </button>
                          ))}
                          {sp.morePhotos.length > 4 && (
                            <button
                              type="button"
                              onClick={() => setSelectedTreeDetail(sp)}
                              className="w-14 h-12 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-[10px] font-bold flex flex-col items-center justify-center shrink-0 border border-stone-200 dark:border-stone-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors"
                            >
                              <span>+{sp.morePhotos.length - 4}</span>
                              <span className="text-[8px] text-stone-400">more</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Student Observations Section if available */}
                    {studentObs.length > 0 && (
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                            <span>Student Field Observations ({studentObs.length})</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                          {studentObs.map((obs) => (
                            <div
                              key={obs.id}
                              onClick={() => setSelectedTreeDetail(sp)}
                              className="relative group shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-950 cursor-pointer shadow-xs hover:border-emerald-500"
                              title={`${obs.title} by ${obs.studentName}`}
                            >
                              <img
                                src={obs.imageUrl}
                                alt={obs.title}
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Uses & Actions */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-1.5">
                    {sp.uses.map((u, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                      >
                        {u}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedTreeDetail(sp)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>View All Photos ({totalPhotos}) & Details</span>
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedTreeDetail(sp)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 transition-colors"
                        title="Add more photos to this tree species"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenContribute(sp.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Student Lens</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                <h3 className="font-bold text-sm sm:text-base truncate">
                  {activeLightbox.title}
                  {activeLightbox.scientificName && (
                    <span className="ml-2 font-normal italic text-xs text-emerald-400">
                      ({activeLightbox.scientificName})
                    </span>
                  )}
                </h3>
                {activeLightbox.credit && (
                  <p className="text-xs text-stone-400 truncate">{activeLightbox.credit}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeLightbox.floraUrl && (
                  <a
                    href={activeLightbox.floraUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-900/90 hover:bg-emerald-800 text-emerald-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-emerald-700/60"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Flora of Bangladesh</span>
                  </a>
                )}
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
          </div>
        </div>
      )}

      {/* Tree Species Multi-Photo & Detail Modal with 'Add More Photos' Option */}
      <TreeSpeciesDetailModal
        species={selectedTreeDetail}
        studentPhotos={studentPhotos}
        isOpen={!!selectedTreeDetail}
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
