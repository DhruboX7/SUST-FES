import React, { useState, useMemo } from 'react';
import { TreeSpecies, TreePhoto, BotanyAiResult } from '../../types';
import { isMatchedPhotoForSpecies, fetchStaticJson } from '../../utils/storage';
import { verifyAndEnrichSpeciesWithAI, validateBinomialNomenclature } from '../../utils/botanyAi';
import { AdminSpeciesPhotosModal } from './AdminSpeciesPhotosModal';
import { 
  Trees, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Check, 
  X, 
  AlertCircle, 
  ExternalLink,
  Info,
  CheckCircle2,
  CheckSquare,
  Square,
  ShieldCheck,
  Tag,
  Globe,
  RefreshCw,
  Camera,
  Layers,
  Image as ImageIcon,
  Star
} from 'lucide-react';

interface AdminSpeciesPanelProps {
  species: TreeSpecies[];
  onUpdateSpecies: (species: TreeSpecies[]) => void;
}

export const AdminSpeciesPanel: React.FC<AdminSpeciesPanelProps> = ({
  species,
  onUpdateSpecies,
}) => {
  const [search, setSearch] = useState('');
  const [filterFamily, setFilterFamily] = useState<string>('all');
  const [photoFilter, setPhotoFilter] = useState<'all' | 'multi' | 'single' | 'missing'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSyncingFlora, setIsSyncingFlora] = useState(false);
  const [floraSyncNotice, setFloraSyncNotice] = useState('');

  // Photo Management Modal State
  const [managingPhotosSpecies, setManagingPhotosSpecies] = useState<TreeSpecies | null>(null);

  const handleSyncFloraOfBangladesh = async () => {
    setIsSyncingFlora(true);
    setFloraSyncNotice('');
    try {
      const floraMap = await fetchStaticJson<Record<
        string,
        { imageUrl: string; sourceUrl: string; sourceName: string; allPhotos?: string[] }
      >>('flora_bangladesh_photos.json');
      if (floraMap) {
        let speciesCount = 0;
        let totalPlatesImported = 0;

        const updated = species.map((sp) => {
          const matchKey = Object.keys(floraMap).find(
            (k) =>
              k.toLowerCase() === sp.scientificName.trim().toLowerCase() ||
              k.toLowerCase().includes(sp.scientificName.trim().toLowerCase()) ||
              sp.scientificName.trim().toLowerCase().includes(k.toLowerCase())
          );

          if (matchKey && floraMap[matchKey]) {
            speciesCount++;
            const entry = floraMap[matchKey];
            const allUrls: string[] = entry.allPhotos || (entry.imageUrl ? [entry.imageUrl] : []);

            const existingUrls = new Set([
              entry.imageUrl,
              sp.imageUrl,
              ...(sp.morePhotos?.map((p) => p.url) || [])
            ]);

            const currentPlates: TreePhoto[] = [...(sp.morePhotos || [])];

            allUrls.forEach((url, i) => {
              if (
                url !== entry.imageUrl &&
                isMatchedPhotoForSpecies(url, sp.scientificName) &&
                !currentPlates.some((p) => p.url === url)
              ) {
                let tag: TreePhoto['tag'] = 'leaf';
                if (i === 1) tag = 'leaf';
                else if (i === 2) tag = 'bark';
                else if (i === 3) tag = 'flower';
                else if (i === 4) tag = 'fruit';
                else tag = 'general';

                currentPlates.push({
                  url,
                  caption: `${sp.commonName} - Botanical Plate #${currentPlates.length + 1}`,
                  tag,
                  credit: entry.sourceName || 'Flora of Bangladesh',
                });
                totalPlatesImported++;
              }
            });

            const nextCover = isMatchedPhotoForSpecies(sp.imageUrl || '', sp.scientificName)
              ? sp.imageUrl
              : (isMatchedPhotoForSpecies(entry.imageUrl, sp.scientificName) ? entry.imageUrl : (currentPlates[0]?.url || sp.imageUrl));

            return {
              ...sp,
              imageUrl: nextCover,
              photoCredit: sp.photoCredit || entry.sourceName,
              floraUrl: sp.floraUrl || entry.sourceUrl,
              morePhotos: currentPlates,
            };
          }
          return sp;
        });

        onUpdateSpecies(updated);
        setFloraSyncNotice(
          `Synced ${speciesCount} tree species and enriched ${totalPlatesImported} authentic botanical plates from floraofbangladesh.com!`
        );
        setTimeout(() => setFloraSyncNotice(''), 6000);
      }
    } catch (err) {
      console.error('Failed to sync with flora database:', err);
    } finally {
      setIsSyncingFlora(false);
    }
  };

  const handlePurgeAllUnmatched = () => {
    let totalRemoved = 0;
    const cleaned = species.map((sp) => {
      const initialPhotos = sp.morePhotos || [];
      const filtered = initialPhotos.filter((p) => isMatchedPhotoForSpecies(p.url, sp.scientificName));
      totalRemoved += (initialPhotos.length - filtered.length);

      let nextCover = sp.imageUrl;
      if (!isMatchedPhotoForSpecies(sp.imageUrl || '', sp.scientificName)) {
        nextCover = filtered[0]?.url || sp.imageUrl;
      }
      return {
        ...sp,
        imageUrl: nextCover,
        morePhotos: filtered
      };
    });

    onUpdateSpecies(cleaned);
    setFloraSyncNotice(
      totalRemoved > 0
        ? `Purged ${totalRemoved} unmatched photo(s) across catalog! Only verified species plates kept.`
        : 'All tree photos across the catalog are strictly verified and matched!'
    );
    setTimeout(() => setFloraSyncNotice(''), 6000);
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TreeSpecies | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [scientificName, setScientificName] = useState('');
  const [commonName, setCommonName] = useState('');
  const [banglaName, setBanglaName] = useState('');
  const [family, setFamily] = useState('');
  const [usesInput, setUsesInput] = useState('');
  const [habitat, setHabitat] = useState('');
  const [conservationStatus, setConservationStatus] = useState('Least Concern (IUCN)');
  const [distribution, setDistribution] = useState('');
  const [silviculturalNotes, setSilviculturalNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // AI Assistant State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<BotanyAiResult | null>(null);
  const [formError, setFormError] = useState('');

  const families = useMemo(() => {
    const set = new Set(species.map((s) => s.family).filter(Boolean));
    return Array.from(set).sort();
  }, [species]);

  const multiPhotoCount = useMemo(
    () => species.filter((s) => (s.morePhotos?.length || 0) >= 1 && !!s.imageUrl).length,
    [species]
  );
  const singlePhotoCount = useMemo(
    () => species.filter((s) => !!s.imageUrl && (!s.morePhotos || s.morePhotos.length === 0)).length,
    [species]
  );
  const missingPhotoCount = useMemo(
    () => species.filter((s) => !s.imageUrl).length,
    [species]
  );

  const filteredSpecies = useMemo(() => {
    return species.filter((item) => {
      const matchSearch =
        item.scientificName.toLowerCase().includes(search.toLowerCase()) ||
        item.commonName.toLowerCase().includes(search.toLowerCase()) ||
        item.banglaName.includes(search) ||
        item.family.toLowerCase().includes(search.toLowerCase());
      const matchFamily = filterFamily === 'all' || item.family === filterFamily;
      if (!matchSearch || !matchFamily) return false;

      if (photoFilter === 'multi') {
        if (!item.imageUrl || !item.morePhotos || item.morePhotos.length === 0) return false;
      } else if (photoFilter === 'single') {
        if (!item.imageUrl || (item.morePhotos && item.morePhotos.length > 0)) return false;
      } else if (photoFilter === 'missing') {
        if (!!item.imageUrl) return false;
      }

      return true;
    });
  }, [species, search, filterFamily, photoFilter]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setScientificName('');
    setCommonName('');
    setBanglaName('');
    setFamily('');
    setUsesInput('');
    setHabitat('');
    setConservationStatus('Least Concern (IUCN)');
    setDistribution('');
    setSilviculturalNotes('');
    setImageUrl('');
    setAiReport(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: TreeSpecies) => {
    setEditingItem(item);
    setScientificName(item.scientificName);
    setCommonName(item.commonName);
    setBanglaName(item.banglaName);
    setFamily(item.family);
    setUsesInput(item.uses.join(', '));
    setHabitat(item.habitat);
    setConservationStatus(item.conservationStatus);
    setDistribution(item.distribution);
    setSilviculturalNotes(item.silviculturalNotes);
    setImageUrl(item.imageUrl || '');
    setAiReport(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleRunAiCrosscheck = async () => {
    const query = scientificName.trim() || commonName.trim() || banglaName.trim();
    if (!query) {
      setFormError('Please enter a scientific name, common name, or Bengali name to run AI crosscheck.');
      return;
    }

    setIsAiLoading(true);
    setFormError('');

    try {
      const result = await verifyAndEnrichSpeciesWithAI(query);
      setAiReport(result);

      // Auto-fill form fields
      setScientificName(result.scientificName);
      setCommonName(result.commonName);
      setBanglaName(result.banglaName);
      setFamily(result.family);
      setUsesInput(result.uses.join(', '));
      setHabitat(result.habitat);
      setConservationStatus(result.conservationStatus);
      setDistribution(result.distribution);
      setSilviculturalNotes(result.silviculturalNotes);
    } catch (err) {
      setFormError('AI crosscheck failed. Please check the binomial format.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveSpecies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scientificName.trim()) {
      setFormError('Scientific name is required.');
      return;
    }

    // ICBN validation check
    const validation = validateBinomialNomenclature(scientificName.trim());
    if (!validation.isValid) {
      setFormError(validation.error || 'Invalid scientific binomial nomenclature.');
      return;
    }

    const parsedUses = usesInput
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);

    if (editingItem) {
      const updated: TreeSpecies = {
        ...editingItem,
        scientificName: validation.normalizedName || scientificName.trim(),
        commonName: commonName.trim() || scientificName.trim(),
        banglaName: banglaName.trim(),
        family: family.trim() || 'Plantae',
        uses: parsedUses.length > 0 ? parsedUses : ['Timber'],
        habitat: habitat.trim(),
        conservationStatus: conservationStatus.trim(),
        distribution: distribution.trim(),
        silviculturalNotes: silviculturalNotes.trim(),
        imageUrl: imageUrl.trim(),
        verifiedAt: new Date().toISOString(),
      };

      const newAll = species.map((s) => (s.id === editingItem.id ? updated : s));
      onUpdateSpecies(newAll);
    } else {
      const newSpecies: TreeSpecies = {
        id: `spec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        scientificName: validation.normalizedName || scientificName.trim(),
        commonName: commonName.trim() || scientificName.trim(),
        banglaName: banglaName.trim(),
        family: family.trim() || 'Plantae',
        uses: parsedUses.length > 0 ? parsedUses : ['Timber'],
        habitat: habitat.trim(),
        conservationStatus: conservationStatus.trim(),
        distribution: distribution.trim(),
        silviculturalNotes: silviculturalNotes.trim(),
        imageUrl: imageUrl.trim(),
        verifiedAt: new Date().toISOString(),
      };

      onUpdateSpecies([newSpecies, ...species]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const updated = species.filter((s) => s.id !== id);
    onUpdateSpecies(updated);
    setDeleteConfirmId(null);
  };

  const handleBatchDelete = () => {
    const updated = species.filter((s) => !selectedIds.includes(s.id));
    onUpdateSpecies(updated);
    setSelectedIds([]);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Trees className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Tree Species & Dendrology Management</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {species.length} species
            </span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Manage Bangladesh & SUST campus flora with automated Gemini AI taxonomy crosschecking and ICBN binomial validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            onClick={handleSyncFloraOfBangladesh}
            disabled={isSyncingFlora}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-600/50 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Update tree photos directly from floraofbangladesh.com"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFlora ? 'animate-spin' : ''}`} />
            <span>{isSyncingFlora ? 'Syncing...' : 'Sync with Flora'}</span>
          </button>

          <button
            onClick={handlePurgeAllUnmatched}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1.5 transition-colors"
            title="Purge all leaked, sidebar, or unmatched images across all 56 species"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Clean Unmatched</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tree Species</span>
          </button>
        </div>
      </div>

      {floraSyncNotice && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{floraSyncNotice}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search scientific name, common name, or family..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div>
          <select
            value={filterFamily}
            onChange={(e) => setFilterFamily(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          >
            <option value="all">All Botanical Families ({families.length})</option>
            {families.map((fam) => (
              <option key={fam} value={fam}>{fam}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={photoFilter}
            onChange={(e) => setPhotoFilter(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium"
          >
            <option value="all">All Photos ({species.length})</option>
            <option value="multi">Multi-Photo Plates ({multiPhotoCount})</option>
            <option value="single">Single Photo ({singlePhotoCount})</option>
            <option value="missing">Missing Photo ({missingPhotoCount})</option>
          </select>
        </div>
      </div>

      {/* Species Data Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button
                    onClick={() => {
                      if (selectedIds.length === filteredSpecies.length) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(filteredSpecies.map((s) => s.id));
                      }
                    }}
                    className="text-stone-500"
                  >
                    {selectedIds.length === filteredSpecies.length && filteredSpecies.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Taxonomy & Vernacular</th>
                <th className="py-3 px-4">Family</th>
                <th className="py-3 px-4">Botanical Photos</th>
                <th className="py-3 px-4">IUCN Status</th>
                <th className="py-3 px-4">Primary Uses</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredSpecies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No tree species match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredSpecies.map((item) => {
                  const plateCount = item.morePhotos?.length || 0;
                  const totalPhotos = (item.imageUrl ? 1 : 0) + plateCount;

                  return (
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
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setManagingPhotosSpecies(item)}
                            className="relative group shrink-0"
                            title="Click to manage botanical photos for this species"
                          >
                            <img
                              src={item.imageUrl || '/assets/hero_forestry_sust.webp'}
                              alt={item.scientificName}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                              }}
                              className="w-10 h-10 object-cover rounded-lg border border-stone-200 dark:border-stone-800 group-hover:border-emerald-500 transition-colors"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white">
                              <Camera className="w-3 h-3" />
                            </div>
                          </button>
                          <div>
                            <div className="font-bold italic text-stone-900 dark:text-stone-100">
                              {item.scientificName}
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                              <span>{item.commonName}</span>
                              {item.banglaName && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-medium text-emerald-800 dark:text-emerald-400">{item.banglaName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-700 dark:text-emerald-400">
                        {item.family}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setManagingPhotosSpecies(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors shadow-2xs ${
                              plateCount > 0
                                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900'
                                : item.imageUrl
                                ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900'
                                : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                            }`}
                            title="Manage primary habit and botanical multi-photo plates"
                          >
                            <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{totalPhotos} Photos</span>
                          </button>
                          {plateCount > 0 && (
                            <span className="text-[10px] font-mono text-stone-400 hidden lg:inline">
                              +{plateCount} plates
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-stone-700 dark:text-stone-300">
                          {item.conservationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-stone-600 dark:text-stone-400 max-w-xs truncate">
                          {item.uses.slice(0, 3).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setManagingPhotosSpecies(item)}
                            className="p-1.5 text-stone-400 hover:text-emerald-600 rounded transition-colors"
                            title="Manage Botanical Photos & Plates"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-stone-400 hover:text-blue-600 rounded"
                            title="Edit Species"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-2 py-1 text-[10px] font-bold bg-rose-600 text-white rounded-md"
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
                              title="Delete Species"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Species Modal with AI Assistant */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Trees className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>{editingItem ? 'Edit Tree Species' : 'Add New Tree Species'}</span>
                </h3>
                <span className="text-[11px] text-stone-500">Taxonomic verification & silvicultural catalog</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Assistant Banner */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>AI Botanical Overview & Taxonomy Crosschecker</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunAiCrosscheck}
                  disabled={isAiLoading}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Crosscheck & Auto-Fill</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                Type the binomial name (e.g. <em>Swietenia macrophylla</em>) or vernacular name, then click to crosscheck ICBN rules, family classification, IUCN status, and generate silvicultural notes.
              </p>

              {aiReport && (
                <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800 text-[11px] space-y-1">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Crosscheck Status: {aiReport.taxonomyNotes}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900">
                      {Math.round(aiReport.confidence * 100)}% Confidence
                    </span>
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSpecies} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Scientific Binomial Name *
                  </label>
                  <input
                    type="text"
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    placeholder="e.g. Tectona grandis"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono italic"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Botanical Family
                  </label>
                  <input
                    type="text"
                    value={family}
                    onChange={(e) => setFamily(e.target.value)}
                    placeholder="e.g. Lamiaceae"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Common English Name
                  </label>
                  <input
                    type="text"
                    value={commonName}
                    onChange={(e) => setCommonName(e.target.value)}
                    placeholder="e.g. Teak"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Bangla Name (বাংলা নাম)
                  </label>
                  <input
                    type="text"
                    value={banglaName}
                    onChange={(e) => setBanglaName(e.target.value)}
                    placeholder="e.g. সেগুন"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    IUCN Conservation Status
                  </label>
                  <input
                    type="text"
                    value={conservationStatus}
                    onChange={(e) => setConservationStatus(e.target.value)}
                    placeholder="e.g. Least Concern (IUCN Red List)"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Geographic Distribution
                  </label>
                  <input
                    type="text"
                    value={distribution}
                    onChange={(e) => setDistribution(e.target.value)}
                    placeholder="e.g. Sylhet, Chittagong, CHT"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Timber & Silvicultural Uses (Comma-separated)
                </label>
                <input
                  type="text"
                  value={usesInput}
                  onChange={(e) => setUsesInput(e.target.value)}
                  placeholder="e.g. Luxury Furniture, Shipbuilding, Veneer, Soil Conservation"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Ecological Habitat
                </label>
                <input
                  type="text"
                  value={habitat}
                  onChange={(e) => setHabitat(e.target.value)}
                  placeholder="e.g. Tropical moist deciduous hill tracts with well-drained soils"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Silvicultural & Dendrological Notes
                </label>
                <textarea
                  value={silviculturalNotes}
                  onChange={(e) => setSilviculturalNotes(e.target.value)}
                  placeholder="Regeneration characteristics, light requirement, growth rate..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                  <label className="font-semibold text-stone-700 dark:text-stone-300">
                    Herbarium / Specimen Photo URL (Optional)
                  </label>
                  <div className="flex items-center gap-2">
                    {editingItem && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setManagingPhotosSpecies(editingItem);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800 transition-colors"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Manage Plates ({(editingItem.morePhotos?.length || 0) + (editingItem.imageUrl ? 1 : 0)})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        if (!scientificName.trim()) {
                          setFormError('Please enter a scientific name first.');
                          return;
                        }
                        try {
                          const floraMap = await fetchStaticJson<Record<string, any>>('flora_bangladesh_photos.json');
                          if (floraMap) {
                            const key = Object.keys(floraMap).find(k => 
                              k.toLowerCase() === scientificName.trim().toLowerCase() ||
                              k.toLowerCase().includes(scientificName.trim().toLowerCase()) ||
                              scientificName.trim().toLowerCase().includes(k.toLowerCase())
                            );
                            if (key && floraMap[key]) {
                              setImageUrl(floraMap[key].imageUrl);
                            } else {
                              setFormError(`No photo found on Flora of Bangladesh for ${scientificName}`);
                            }
                          }
                        } catch (err) {
                          console.warn('Could not load Flora of Bangladesh data:', err);
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Fetch from Flora of Bangladesh</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... or /assets/..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                />
                {imageUrl && (
                  <div className="mt-2 p-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-stone-50 dark:bg-stone-900 flex items-center gap-3">
                    <img
                      src={imageUrl}
                      alt="Tree preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                      }}
                      className="w-16 h-14 object-cover rounded-md border border-stone-300 dark:border-stone-700 shrink-0"
                    />
                    <div className="text-[11px] text-stone-500">
                      Live specimen photo preview. Renders on public tree database and herbarium views.
                    </div>
                  </div>
                )}
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
                  {editingItem ? 'Save Species Changes' : 'Add to Herbarium Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Botanical Photo Management Modal */}
      <AdminSpeciesPhotosModal
        species={managingPhotosSpecies}
        isOpen={!!managingPhotosSpecies}
        onClose={() => setManagingPhotosSpecies(null)}
        onSave={(updatedSpecies) => {
          const updatedList = species.map((s) => (s.id === updatedSpecies.id ? updatedSpecies : s));
          onUpdateSpecies(updatedList);
          setManagingPhotosSpecies(null);
        }}
      />
    </div>
  );
};
