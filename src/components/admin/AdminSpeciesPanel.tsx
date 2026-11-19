import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TreeSpecies, TreePhoto, BotanyAiResult } from '../../types';
import { isMatchedPhotoForSpecies, fetchStaticJson } from '../../utils/storage';
import { verifyAndEnrichSpeciesWithAI, validateBinomialNomenclature } from '../../utils/botanyAi';
import { getOptimizedImageUrl, getFallbackImageUrl, handleImageError } from '../../utils/imageUtils';
import { AdminSpeciesPhotosModal } from './AdminSpeciesPhotosModal';
import { 
  Trees, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
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
  const noticeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    };
  }, []);

  const showFloraNotice = (msg: string) => {
    setFloraSyncNotice(msg);
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current);
    noticeTimerRef.current = window.setTimeout(() => setFloraSyncNotice(''), 6000);
  };

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
          const sciLower = (sp.scientificName || '').trim().toLowerCase();
          const matchKey = sciLower
            ? Object.keys(floraMap).find(
                (k) =>
                  k.toLowerCase() === sciLower ||
                  k.toLowerCase().includes(sciLower) ||
                  sciLower.includes(k.toLowerCase())
              )
            : undefined;

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
        showFloraNotice(
          `Synced ${speciesCount} tree species and enriched ${totalPlatesImported} authentic botanical plates from floraofbangladesh.com!`
        );
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
      const sciName = sp.scientificName || '';
      const initialPhotos = sp.morePhotos || [];
      const filtered = initialPhotos.filter((p) => p && isMatchedPhotoForSpecies(p.url, sciName));
      totalRemoved += (initialPhotos.length - filtered.length);

      let nextCover = sp.imageUrl;
      if (!isMatchedPhotoForSpecies(sp.imageUrl || '', sciName)) {
        nextCover = filtered[0]?.url || sp.imageUrl;
      }
      return {
        ...sp,
        imageUrl: nextCover,
        morePhotos: filtered
      };
    });

    onUpdateSpecies(cleaned);
    showFloraNotice(
      totalRemoved > 0
        ? `Purged ${totalRemoved} unmatched photo(s) across catalog! Only verified species plates kept.`
        : 'All tree photos across the catalog are strictly verified and matched!'
    );
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
    const q = search.toLowerCase();
    return species.filter((item) => {
      const matchSearch =
        (item.scientificName || '').toLowerCase().includes(q) ||
        (item.commonName || '').toLowerCase().includes(q) ||
        (item.banglaName || '').includes(search) ||
        (item.family || '').toLowerCase().includes(q);
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
    setUsesInput((item.uses || []).join(', '));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF9F4] dark:bg-[#19382B] p-4 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20">
        <div>
          <h3 className="font-editorial text-lg font-bold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2 flex-wrap">
            <Trees className="w-5 h-5 text-[#42684D] dark:text-[#BBC4A6]" />
            <span>Tree Species & Dendrology Management</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-sm bg-[#EAE7DA] text-[#42684D] dark:bg-[#142D22] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
              {species.length} species
            </span>
          </h3>
          <p className="text-xs text-[#42684D] dark:text-[#8A9C74] mt-0.5">
            Manage Bangladesh & SUST campus flora with taxonomic crosschecking and ICBN binomial validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedIds.length > 0 && (
            deleteConfirmId === 'batch' ? (
              <div className="flex items-center gap-1.5 p-1 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453]/60">
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="px-3 py-1 text-xs font-semibold bg-[#987453] hover:bg-[#826143] text-[#F3F1E8] rounded-sm transition-colors"
                >
                  Confirm Delete ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-1 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8]"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirmId('batch')}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#987453] hover:bg-[#826143] text-[#F3F1E8] flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )
          )}

          <button
            onClick={handleSyncFloraOfBangladesh}
            disabled={isSyncingFlora}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-[#42684D]/50 bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#BBC4A6] hover:bg-[#BBC4A6]/40 dark:hover:bg-[#42684D]/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Update tree photos directly from floraofbangladesh.com"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingFlora ? 'animate-spin' : ''}`} />
            <span>{isSyncingFlora ? 'Syncing...' : 'Sync with Flora'}</span>
          </button>

          <button
            onClick={handlePurgeAllUnmatched}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-[#987453]/60 bg-[#FAF9F4] dark:bg-[#142D22] text-[#987453] hover:bg-[#EAE7DA] dark:hover:bg-[#987453]/20 flex items-center gap-1.5 transition-colors"
            title="Purge all leaked, sidebar, or unmatched images across all species"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#987453]" />
            <span>Clean Unmatched</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tree Species</span>
          </button>
        </div>
      </div>

      {floraSyncNotice && (
        <div className="p-3 rounded-lg bg-[#EAE7DA] dark:bg-[#19382B] border border-[#42684D] text-[#19382B] dark:text-[#F3F1E8] text-xs flex items-center gap-2 animate-fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6] shrink-0" />
          <span>{floraSyncNotice}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A9C74]" />
          <input
            type="text"
            placeholder="Search scientific name, common name, or family..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] placeholder:text-[#8A9C74]"
          />
        </div>

        <div>
          <select
            value={filterFamily}
            onChange={(e) => setFilterFamily(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
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
            className="w-full px-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-medium"
          >
            <option value="all">All Photos ({species.length})</option>
            <option value="multi">Multi-Photo Plates ({multiPhotoCount})</option>
            <option value="single">Single Photo ({singlePhotoCount})</option>
            <option value="missing">Missing Photo ({missingPhotoCount})</option>
          </select>
        </div>
      </div>

      {/* Species Data Table */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EAE7DA] dark:bg-[#142D22] border-b border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-[#42684D] dark:text-[#BBC4A6] font-semibold uppercase tracking-wider">
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
                    className="text-[#42684D] dark:text-[#BBC4A6]"
                  >
                    {selectedIds.length === filteredSpecies.length && filteredSpecies.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6]" />
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
            <tbody className="divide-y divide-[#BBC4A6]/40 dark:divide-[#BBC4A6]/15">
              {filteredSpecies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8A9C74]">
                    No tree species match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredSpecies.map((item) => {
                  const plateCount = item.morePhotos?.length || 0;
                  const totalPhotos = (item.imageUrl ? 1 : 0) + plateCount;

                  return (
                    <tr key={item.id} className="hover:bg-[#EAE7DA]/50 dark:hover:bg-[#142D22]/60 transition-colors">
                      <td className="py-3 px-4">
                        <button
                          onClick={() =>
                            setSelectedIds((prev) =>
                              prev.includes(item.id) ? prev.filter((i) => i !== item.id) : [...prev, item.id]
                            )
                          }
                          className="text-[#8A9C74] hover:text-[#42684D]"
                        >
                          {selectedIds.includes(item.id) ? (
                            <CheckSquare className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6]" />
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
                              src={getOptimizedImageUrl(item.imageUrl || getFallbackImageUrl(), 240)}
                              alt={item.scientificName}
                              loading="lazy"
                              decoding="async"
                              onError={handleImageError}
                              className="w-10 h-10 object-cover rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 group-hover:border-[#42684D] transition-colors"
                            />
                            <div className="absolute inset-0 bg-[#19382B]/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center text-[#F3F1E8]">
                              <Camera className="w-3 h-3" />
                            </div>
                          </button>
                          <div>
                            <div className="font-scientific text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                              {item.scientificName}
                            </div>
                            <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74] flex items-center gap-1.5">
                              <span>{item.commonName}</span>
                              {item.banglaName && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-medium text-[#19382B] dark:text-[#BBC4A6]">{item.banglaName}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#42684D] dark:text-[#BBC4A6]">
                        {item.family}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setManagingPhotosSpecies(item)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                              plateCount > 0
                                ? 'bg-[#EAE7DA] dark:bg-[#142D22] text-[#19382B] dark:text-[#BBC4A6] border-[#42684D]/50 hover:bg-[#BBC4A6]/30'
                                : item.imageUrl
                                ? 'bg-[#F3F1E8] dark:bg-[#142D22] text-[#987453] border-[#987453]/50 hover:bg-[#EAE7DA]'
                                : 'bg-[#EAE7DA] dark:bg-[#142D22] text-[#987453] border-[#987453] hover:bg-[#987453] hover:text-[#F3F1E8]'
                            }`}
                            title="Manage primary habit and botanical multi-photo plates"
                          >
                            <Camera className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                            <span>{totalPhotos} Photos</span>
                          </button>
                          {plateCount > 0 && (
                            <span className="text-[10px] font-mono text-[#8A9C74] hidden lg:inline">
                              +{plateCount} plates
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] text-[#42684D] dark:text-[#BBC4A6]">
                          {item.conservationStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74] max-w-xs truncate">
                          {(item.uses || []).slice(0, 3).join(', ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setManagingPhotosSpecies(item)}
                            className="p-1.5 text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] rounded-sm transition-colors"
                            title="Manage Botanical Photos & Plates"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] rounded-sm transition-colors"
                            title="Edit Species"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {deleteConfirmId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-2 py-1 text-[10px] font-semibold bg-[#987453] hover:bg-[#826143] text-[#F3F1E8] rounded-sm"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8]"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="p-1.5 text-[#8A9C74] hover:text-[#987453] rounded-sm transition-colors"
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

      {/* Add / Edit Species Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11261D]/80 animate-fade-in overflow-y-auto">
          <div className="bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-lg p-6 max-w-2xl w-full shadow-xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 pb-3">
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
                  <Trees className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6]" />
                  <span>{editingItem ? 'Edit Tree Species' : 'Add New Tree Species'}</span>
                </h3>
                <span className="text-[11px] text-[#8A9C74]">Taxonomic verification & silvicultural catalog</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Taxonomy Verification Banner */}
            <div className="p-3.5 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-md space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-[#19382B] dark:text-[#F3F1E8] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6]" />
                  <span>Botanical Overview & Taxonomy Crosschecker</span>
                </div>
                <button
                  type="button"
                  onClick={handleRunAiCrosscheck}
                  disabled={isAiLoading}
                  className="px-3 py-1 bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Crosscheck & Auto-Fill</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#42684D] dark:text-[#8A9C74]">
                Type the binomial name (e.g. <span className="font-scientific text-xs">Swietenia macrophylla</span>) or vernacular name, then click to crosscheck ICBN rules, family classification, IUCN status, and silvicultural notes.
              </p>

              {aiReport && (
                <div className="mt-2 pt-2 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 text-[11px] space-y-1">
                  <div className="flex items-center gap-2 text-[#19382B] dark:text-[#F3F1E8] font-semibold flex-wrap">
                    <CheckCircle2 className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6]" />
                    <span>Crosscheck Status: {aiReport.taxonomyNotes}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
                      {Math.round(aiReport.confidence * 100)}% Confidence
                    </span>
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <div className="p-3 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453] rounded-md text-[#987453] dark:text-[#F3F1E8] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#987453]" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSpecies} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                    Scientific Binomial Name *
                  </label>
                  <input
                    type="text"
                    value={scientificName}
                    onChange={(e) => setScientificName(e.target.value)}
                    placeholder="e.g. Tectona grandis"
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-scientific text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                    Botanical Family
                  </label>
                  <input
                    type="text"
                    value={family}
                    onChange={(e) => setFamily(e.target.value)}
                    placeholder="e.g. Lamiaceae"
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                    Common English Name
                  </label>
                  <input
                    type="text"
                    value={commonName}
                    onChange={(e) => setCommonName(e.target.value)}
                    placeholder="e.g. Teak"
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                    Bangla Name (বাংলা নাম)
                  </label>
                  <input
                    type="text"
                    value={banglaName}
                    onChange={(e) => setBanglaName(e.target.value)}
                    placeholder="e.g. সেগুন"
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                    IUCN Conservation Status
                  </label>
                  <input
                    type="text"
                    value={conservationStatus}
                    onChange={(e) => setConservationStatus(e.target.value)}
                    placeholder="e.g. Least Concern (IUCN Red List)"
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                    Geographic Distribution
                  </label>
                  <input
                    type="text"
                    value={distribution}
                    onChange={(e) => setDistribution(e.target.value)}
                    placeholder="e.g. Sylhet, Chittagong, CHT"
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                  Timber & Silvicultural Uses (Comma-separated)
                </label>
                <input
                  type="text"
                  value={usesInput}
                  onChange={(e) => setUsesInput(e.target.value)}
                  placeholder="e.g. Luxury Furniture, Shipbuilding, Veneer, Soil Conservation"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                  Ecological Habitat
                </label>
                <input
                  type="text"
                  value={habitat}
                  onChange={(e) => setHabitat(e.target.value)}
                  placeholder="e.g. Tropical moist deciduous hill tracts with well-drained soils"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#BBC4A6]">
                  Silvicultural & Dendrological Notes
                </label>
                <textarea
                  value={silviculturalNotes}
                  onChange={(e) => setSilviculturalNotes(e.target.value)}
                  placeholder="Regeneration characteristics, light requirement, growth rate..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
                  <label className="font-semibold text-[#19382B] dark:text-[#BBC4A6]">
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
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#19382B] dark:text-[#F3F1E8] bg-[#EAE7DA] dark:bg-[#142D22] hover:bg-[#BBC4A6]/40 px-2 py-0.5 rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/30 transition-colors"
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
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] bg-[#EAE7DA] dark:bg-[#142D22] px-2 py-0.5 rounded-sm border border-[#42684D]/50 transition-colors"
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
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                />
                {imageUrl && (
                  <div className="mt-2 p-2 border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] flex items-center gap-3">
                    <img
                      src={imageUrl}
                      alt="Tree preview"
                      decoding="async"
                      onError={handleImageError}
                      className="w-16 h-14 object-cover rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/30 shrink-0"
                    />
                    <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74]">
                      Live specimen photo preview. Renders on public tree database and herbarium views.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md transition-colors"
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
