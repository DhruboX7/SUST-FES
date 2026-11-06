import React, { useState, useEffect } from 'react';
import { 
  X, 
  Camera, 
  Plus, 
  Trash2, 
  Star, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Layers, 
  Tag, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw,
  Copy,
  ZoomIn,
  TreePine
} from 'lucide-react';
import { TreeSpecies, TreePhoto } from '../../types';
import { isMatchedPhotoForSpecies } from '../../utils/storage';

interface AdminSpeciesPhotosModalProps {
  species: TreeSpecies | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSpecies: TreeSpecies) => void;
}

export const AdminSpeciesPhotosModal: React.FC<AdminSpeciesPhotosModalProps> = ({
  species,
  isOpen,
  onClose,
  onSave,
}) => {
  // Local editable photo state
  const [primaryUrl, setPrimaryUrl] = useState('');
  const [photoCredit, setPhotoCredit] = useState('');
  const [floraUrl, setFloraUrl] = useState('');
  const [morePhotos, setMorePhotos] = useState<TreePhoto[]>([]);

  // Add Single Photo Form
  const [newUrl, setNewUrl] = useState('');
  const [newTag, setNewTag] = useState<'habit' | 'leaf' | 'bark' | 'flower' | 'fruit' | 'seed' | 'general'>('leaf');
  const [newCaption, setNewCaption] = useState('');
  const [newCredit, setNewCredit] = useState('');

  // Bulk Add State
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [bulkTag, setBulkTag] = useState<'habit' | 'leaf' | 'bark' | 'flower' | 'fruit' | 'seed' | 'general'>('general');

  // Flora Sync State
  const [isSyncingFlora, setIsSyncingFlora] = useState(false);
  const [floraSyncResult, setFloraSyncResult] = useState<{ count: number; photos: string[] } | null>(null);

  // Status Messages
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Lightbox preview for any image
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  // Initialize state when species changes
  useEffect(() => {
    if (species) {
      setPrimaryUrl(species.imageUrl || '');
      setPhotoCredit(species.photoCredit || '');
      setFloraUrl(species.floraUrl || '');
      setMorePhotos(species.morePhotos ? [...species.morePhotos] : []);
      setNewUrl('');
      setNewCaption('');
      setNewCredit('');
      setBulkUrls('');
      setIsBulkOpen(false);
      setFloraSyncResult(null);
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [species?.id, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (previewZoomUrl) {
          setPreviewZoomUrl(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewZoomUrl, onClose]);

  if (!isOpen || !species) return null;

  const sanitizeUrl = (raw: string): string => {
    let url = raw.trim();
    if (url.includes('drive.google.com/file/d/')) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
      }
    }
    return url;
  };

  const handleAddSinglePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!newUrl.trim()) {
      setErrorMsg('Please enter a valid image URL.');
      return;
    }

    const cleanUrl = sanitizeUrl(newUrl);

    // Avoid duplicate
    if (cleanUrl === primaryUrl || morePhotos.some((p) => p.url === cleanUrl)) {
      setErrorMsg('This photo URL already exists in this species gallery.');
      return;
    }

    const newPhoto: TreePhoto = {
      url: cleanUrl,
      caption: newCaption.trim() || `${species.commonName} - ${newTag} plate`,
      tag: newTag,
      credit: newCredit.trim() || photoCredit || 'FES SUST Herbarium',
    };

    setMorePhotos((prev) => [...prev, newPhoto]);
    setNewUrl('');
    setNewCaption('');
    setNewCredit('');
    setSuccessMsg('Botanical plate added to gallery list.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddBulkPhotos = () => {
    setErrorMsg('');
    if (!bulkUrls.trim()) {
      setErrorMsg('Please paste one or more image URLs.');
      return;
    }

    const lines = bulkUrls
      .split('\n')
      .map((l) => sanitizeUrl(l))
      .filter((l) => l.startsWith('http://') || l.startsWith('https://') || l.startsWith('/'));

    if (lines.length === 0) {
      setErrorMsg('No valid URLs detected in the pasted text.');
      return;
    }

    const existingUrls = new Set([primaryUrl, ...morePhotos.map((p) => p.url)]);
    const toAdd: TreePhoto[] = [];

    lines.forEach((url, idx) => {
      if (!existingUrls.has(url)) {
        existingUrls.add(url);
        toAdd.push({
          url,
          caption: `${species.commonName} - ${bulkTag} plate #${morePhotos.length + toAdd.length + 1}`,
          tag: bulkTag,
          credit: photoCredit || 'Flora Botanical Plate',
        });
      }
    });

    if (toAdd.length === 0) {
      setErrorMsg('All pasted URLs are already present in the gallery.');
      return;
    }

    setMorePhotos((prev) => [...prev, ...toAdd]);
    setBulkUrls('');
    setIsBulkOpen(false);
    setSuccessMsg(`Added ${toAdd.length} botanical plates in batch!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleMakePrimary = (index: number) => {
    const selected = morePhotos[index];
    if (!selected) return;

    // Swap: current primary becomes a plate in morePhotos, selected becomes primary
    const oldPrimary = primaryUrl;
    setPrimaryUrl(selected.url);

    const updatedPlates = [...morePhotos];
    if (oldPrimary) {
      updatedPlates[index] = {
        url: oldPrimary,
        caption: `${species.commonName} - specimen plate`,
        tag: 'habit',
        credit: photoCredit,
      };
    } else {
      updatedPlates.splice(index, 1);
    }

    setMorePhotos(updatedPlates);
    setSuccessMsg('Selected photo set as Primary Specimen Habit photo.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDeletePlate = (index: number) => {
    setMorePhotos((prev) => prev.filter((_, i) => i !== index));
    setSuccessMsg(`Plate #${index + 1} removed from list. Click "Save Photo Changes" below to apply.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleMovePlate = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === morePhotos.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...morePhotos];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setMorePhotos(updated);
  };

  const handleUpdatePlateTag = (index: number, tag: TreePhoto['tag']) => {
    setMorePhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, tag } : p))
    );
  };

  const handleUpdatePlateCaption = (index: number, caption: string) => {
    setMorePhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, caption } : p))
    );
  };

  // 1-Click Flora of Bangladesh Sync for this specific species
  const handleCheckAndImportFlora = async () => {
    setIsSyncingFlora(true);
    setErrorMsg('');
    try {
      const res = await fetch('/data/flora_bangladesh_photos.json');
      if (res.ok) {
        const floraMap = await res.json();
        const key = Object.keys(floraMap).find(
          (k) =>
            k.toLowerCase() === species.scientificName.trim().toLowerCase() ||
            k.toLowerCase().includes(species.scientificName.trim().toLowerCase()) ||
            species.scientificName.trim().toLowerCase().includes(k.toLowerCase())
        );

        if (key && floraMap[key]) {
          const entry = floraMap[key];
          const allUrls: string[] = entry.allPhotos || (entry.imageUrl ? [entry.imageUrl] : []);

          if (allUrls.length > 0) {
            setFloraSyncResult({
              count: allUrls.length,
              photos: allUrls,
            });

            // If primary is empty, set primary
            if (!primaryUrl && entry.imageUrl) {
              setPrimaryUrl(entry.imageUrl);
            }
            if (!floraUrl && entry.sourceUrl) {
              setFloraUrl(entry.sourceUrl);
            }
            if (!photoCredit && entry.sourceName) {
              setPhotoCredit(entry.sourceName);
            }

            // Filter only verified matched URLs
            const matchedUrls = allUrls.filter((url) => isMatchedPhotoForSpecies(url, species.scientificName));

            // Automatically import missing photos into morePhotos
            const currentUrls = new Set([primaryUrl || entry.imageUrl, ...morePhotos.map((p) => p.url)]);
            const newPlates: TreePhoto[] = [];

            matchedUrls.forEach((url, i) => {
              if (!currentUrls.has(url)) {
                currentUrls.add(url);
                // Assign sensible botanical tags based on order
                let tag: TreePhoto['tag'] = 'leaf';
                if (i === 0) tag = 'habit';
                else if (i === 1) tag = 'leaf';
                else if (i === 2) tag = 'bark';
                else if (i === 3) tag = 'flower';
                else if (i === 4) tag = 'fruit';
                else tag = 'general';

                newPlates.push({
                  url,
                  caption: `${species.commonName} (${species.banglaName}) - Flora Botanical Plate #${i + 1}`,
                  tag,
                  credit: entry.sourceName || 'Flora of Bangladesh',
                });
              }
            });

            if (newPlates.length > 0) {
              setMorePhotos((prev) => [...prev, ...newPlates]);
              setSuccessMsg(`Imported ${newPlates.length} matched botanical plates from floraofbangladesh.com!`);
            } else {
              setSuccessMsg(`Found ${matchedUrls.length} matched photos on Flora of Bangladesh. All are already imported!`);
            }
            setTimeout(() => setSuccessMsg(''), 4000);
          } else {
            setErrorMsg(`No photos listed on Flora of Bangladesh for "${species.scientificName}".`);
          }
        } else {
          setErrorMsg(`Species "${species.scientificName}" was not found in the Flora of Bangladesh catalog.`);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to fetch Flora of Bangladesh photo index.');
    } finally {
      setIsSyncingFlora(false);
    }
  };

  // 1-Click Wikimedia Commons Search for this species
  const handleCheckWikimedia = async () => {
    setIsSyncingFlora(true);
    setErrorMsg('');
    try {
      const url = `https://commons.wikimedia.org/w/api.php?origin=*&action=query&generator=search&gsrsearch=${encodeURIComponent(
        species.scientificName
      )}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|size|extmetadata&format=json`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.query && data.query.pages) {
          const pages = Object.values(data.query.pages) as any[];
          const currentUrls = new Set([primaryUrl, ...morePhotos.map((p) => p.url)]);
          const toAdd: TreePhoto[] = [];

          pages.forEach((p) => {
            const info = p.imageinfo?.[0];
            if (!info || !info.url) return;
            const imgUrl = info.url;
            if (!isMatchedPhotoForSpecies(imgUrl, species.scientificName)) return;

            if (!currentUrls.has(imgUrl)) {
              currentUrls.add(imgUrl);
              const meta = info.extmetadata || {};
              const license = meta.LicenseShortName?.value || 'CC BY-SA';
              const artist = meta.Artist?.value?.replace(/<[^>]*>/g, '').trim() || 'Wikimedia Commons';
              toAdd.push({
                url: imgUrl,
                caption: `${species.commonName} - Wikimedia Plate · ${license}`,
                tag: 'habit',
                credit: `Wikimedia Commons (${artist})`,
                sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(p.title)}`,
              });
            }
          });

          if (toAdd.length > 0) {
            setMorePhotos((prev) => [...prev, ...toAdd]);
            setSuccessMsg(`Imported ${toAdd.length} high-resolution matched Wikimedia Commons plates!`);
          } else {
            setSuccessMsg('All matched Wikimedia plates found are already in the gallery.');
          }
          setTimeout(() => setSuccessMsg(''), 4000);
        } else {
          setErrorMsg(`No direct Wikimedia images found for "${species.scientificName}".`);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to query Wikimedia Commons media API.');
    } finally {
      setIsSyncingFlora(false);
    }
  };

  // Remove any unmatched photos from current species gallery
  const handleRemoveUnmatched = () => {
    const beforeCount = morePhotos.length;
    const filtered = morePhotos.filter((p) => isMatchedPhotoForSpecies(p.url, species.scientificName));
    const removedCount = beforeCount - filtered.length;
    setMorePhotos(filtered);

    // Also sanitize primaryUrl
    let nextPrimary = primaryUrl;
    if (!isMatchedPhotoForSpecies(primaryUrl, species.scientificName)) {
      nextPrimary = filtered[0]?.url || '';
      setPrimaryUrl(nextPrimary);
    }

    if (removedCount > 0 || nextPrimary !== primaryUrl) {
      setSuccessMsg(`Purged ${removedCount} unmatched photos. Kept strictly verified species plates!`);
    } else {
      setSuccessMsg('All photos in this species gallery are strictly verified and matched!');
    }
  };

  // 1-Click BFIS Forest Department check
  const handleCheckBfis = async () => {
    setIsSyncingFlora(true);
    setErrorMsg('');
    try {
      const parts = species.scientificName.trim().split(' ');
      if (parts.length < 2) {
        setErrorMsg('Invalid scientific binomial format.');
        return;
      }
      const fileName = `${parts[0]}_${parts[1]}.jpg`;
      const bfisUrl = `https://bfis.bforest.gov.bd/TreeInfo/public/uploads/${fileName}`;

      const currentUrls = new Set([primaryUrl, ...morePhotos.map((p) => p.url)]);
      if (currentUrls.has(bfisUrl)) {
        setSuccessMsg('Official BFIS tree photo is already imported in this gallery.');
        setTimeout(() => setSuccessMsg(''), 3000);
        return;
      }

      setMorePhotos((prev) => [
        ...prev,
        {
          url: bfisUrl,
          caption: `${species.commonName} (${species.banglaName}) - Official Forest Dept Silviculture Record`,
          tag: 'habit',
          credit: 'Bangladesh Forest Department (BFIS TreeInfo)',
          sourceUrl: 'https://bfis.bforest.gov.bd/TreeInfo/public/',
        },
      ]);
      setSuccessMsg('Added Bangladesh Forest Department (BFIS) official silviculture photo!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to verify BFIS photo endpoint.');
    } finally {
      setIsSyncingFlora(false);
    }
  };

  const handleSaveModal = () => {
    const updated: TreeSpecies = {
      ...species,
      imageUrl: primaryUrl.trim(),
      photoCredit: photoCredit.trim(),
      floraUrl: floraUrl.trim(),
      morePhotos: morePhotos.map((p) => ({
        url: p.url.trim(),
        caption: p.caption?.trim(),
        tag: p.tag || 'general',
        credit: p.credit?.trim() || photoCredit.trim(),
      })),
      verifiedAt: new Date().toISOString(),
    };

    onSave(updated);
    onClose();
  };

  const totalPhotosCount = (primaryUrl ? 1 : 0) + morePhotos.length;

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
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                Species Photo Management: <span className="italic">{species.scientificName}</span>
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                {totalPhotosCount} photos
              </span>
            </div>
            <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
              <span>{species.commonName}</span>
              <span>·</span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">{species.banglaName}</span>
              <span>·</span>
              <span className="font-mono">{species.family}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          {/* Quick Toolbar: Multi-Source Botanical Sync */}
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-Source Authentic Botanical Photo Curation</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCheckAndImportFlora}
                disabled={isSyncingFlora}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 text-[11px]"
                title="Fetch photos from floraofbangladesh.com"
              >
                <Globe className={`w-3.5 h-3.5 ${isSyncingFlora ? 'animate-spin' : ''}`} />
                <span>Flora of BD</span>
              </button>

              <button
                type="button"
                onClick={handleCheckWikimedia}
                disabled={isSyncingFlora}
                className="px-2.5 py-1.5 rounded-lg bg-sky-800 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 text-[11px]"
                title="Query open Wikimedia Commons media API"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Wikimedia Commons</span>
              </button>

              <button
                type="button"
                onClick={handleCheckBfis}
                disabled={isSyncingFlora}
                className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 text-[11px]"
                title="Check Bangladesh Forest Department (BFIS) upload"
              >
                <TreePine className="w-3.5 h-3.5 text-emerald-400" />
                <span>Forest Dept (BFIS)</span>
              </button>

              <button
                type="button"
                onClick={handleRemoveUnmatched}
                className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 font-bold flex items-center gap-1.5 transition-colors text-[11px]"
                title="Purge any unmatched photos from this species gallery"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Clean Unmatched</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkOpen(!isBulkOpen)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold hover:border-emerald-500 transition-colors flex items-center gap-1.5 text-[11px]"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isBulkOpen ? 'Close Paste' : 'Batch Paste'}</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-200 font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Bulk Paste Section */}
          {isBulkOpen && (
            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/70 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 dark:text-stone-100">
                  Batch Add Multiple Photo Links
                </span>
                <span className="text-stone-400 text-[11px]">
                  Paste multiple image URLs (one per line)
                </span>
              </div>
              <textarea
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                placeholder="https://blogger.googleusercontent.com/.../photo1.jpg&#10;https://blogger.googleusercontent.com/.../photo2.jpg"
                rows={4}
                className="w-full p-2.5 font-mono text-[11px] rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
              />
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-600 dark:text-stone-300">Default Botanical Tag:</span>
                  <select
                    value={bulkTag}
                    onChange={(e) => setBulkTag(e.target.value as any)}
                    className="px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium"
                  >
                    <option value="habit">Tree Habit / Canopy</option>
                    <option value="leaf">Leaves / Foliage</option>
                    <option value="bark">Bark / Trunk</option>
                    <option value="flower">Flower / Inflorescence</option>
                    <option value="fruit">Fruit / Pod / Seed</option>
                    <option value="general">General Botanical View</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddBulkPhotos}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Import All URLs to Gallery
                </button>
              </div>
            </div>
          )}

          {/* 1. PRIMARY SPECIMEN HABIT PHOTO SECTION */}
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Primary Specimen Habit Photo (Cover Photo)</span>
              </div>
              <span className="text-[11px] text-stone-400">
                Featured on public species catalog cards
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* Preview Thumbnail */}
              <div className="md:col-span-1">
                <div
                  className="relative aspect-video sm:aspect-square rounded-xl overflow-hidden bg-stone-950 border border-stone-300 dark:border-stone-700 cursor-pointer group shadow-xs"
                  onClick={() => primaryUrl && setPreviewZoomUrl(primaryUrl)}
                >
                  <img
                    src={primaryUrl || '/assets/hero_forestry_sust.webp'}
                    alt="Primary Specimen"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 font-semibold text-[11px]">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Zoom</span>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/75 text-amber-300 font-mono text-[9px] font-bold">
                    PRIMARY
                  </div>
                </div>
              </div>

              {/* URL & Attributes */}
              <div className="md:col-span-3 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-stone-700 dark:text-stone-300">
                      Primary Image URL *
                    </label>
                    {primaryUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setPrimaryUrl('');
                          setSuccessMsg('Primary photo cleared. Click "Save Photo Changes" below to apply.');
                          setTimeout(() => setSuccessMsg(''), 4000);
                        }}
                        className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 hover:underline"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear Primary Photo</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={primaryUrl}
                    onChange={(e) => setPrimaryUrl(sanitizeUrl(e.target.value))}
                    placeholder="https://... or Google Drive image link"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Photo Attribution / Credit
                    </label>
                    <input
                      type="text"
                      value={photoCredit}
                      onChange={(e) => setPhotoCredit(e.target.value)}
                      placeholder="e.g. Flora of Bangladesh / SUST Herbarium"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Flora of Bangladesh Article URL
                    </label>
                    <input
                      type="text"
                      value={floraUrl}
                      onChange={(e) => setFloraUrl(e.target.value)}
                      placeholder="http://www.floraofbangladesh.com/2016/..."
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BOTANICAL PLATES (morePhotos) GALLERY LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>Botanical Multi-Photo Plates ({morePhotos.length} plates)</span>
              </div>
              <span className="text-[11px] text-stone-400">
                Morphological views: Habit, Leaves, Bark, Inflorescence, Fruits
              </span>
            </div>

            {morePhotos.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-6 bg-stone-50/50 dark:bg-stone-950/30">
                <Camera className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                <p className="font-semibold text-stone-700 dark:text-stone-300">
                  No additional botanical plates configured yet
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Click "Fetch All from Flora of BD" above or add photos below to create a multi-photo plate gallery.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {morePhotos.map((plate, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-500/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    {/* Left: Thumbnail & Tag */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className="relative w-16 h-14 rounded-lg overflow-hidden bg-stone-950 border border-stone-200 dark:border-stone-800 cursor-pointer shrink-0 group"
                        onClick={() => setPreviewZoomUrl(plate.url)}
                      >
                        <img
                          src={plate.url}
                          alt={plate.caption || `Plate ${index + 1}`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ZoomIn className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <select
                            value={plate.tag || 'general'}
                            onChange={(e) => handleUpdatePlateTag(index, e.target.value as any)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          >
                            <option value="habit">Habit / Canopy</option>
                            <option value="leaf">Leaf / Foliage</option>
                            <option value="bark">Bark / Trunk</option>
                            <option value="flower">Flower</option>
                            <option value="fruit">Fruit / Pod</option>
                            <option value="seed">Seed</option>
                            <option value="general">General</option>
                          </select>
                          <span className="font-mono text-[10px] text-stone-400">
                            Plate #{index + 1}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={plate.caption || ''}
                          onChange={(e) => handleUpdatePlateCaption(index, e.target.value)}
                          placeholder="Caption / morphological feature..."
                          className="w-full sm:w-80 px-2 py-1 text-xs rounded border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMakePrimary(index)}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-amber-950/80 text-stone-700 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        title="Set this photo as the Primary Cover specimen"
                      >
                        <Star className="w-3 h-3" />
                        <span>Make Primary</span>
                      </button>

                      <div className="flex items-center border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleMovePlate(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 text-stone-500"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePlate(index, 'down')}
                          disabled={index === morePhotos.length - 1}
                          className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-30 text-stone-500 border-l border-stone-200 dark:border-stone-800"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePlate(index)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                        title="Delete Plate"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. ADD SINGLE PHOTO FORM */}
          <form
            onSubmit={handleAddSinglePhoto}
            className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3"
          >
            <div className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-emerald-700" />
              <span>Add Another Botanical Plate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Photo URL *
                </label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://... or Google Drive link"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Botanical Tag
                </label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-medium"
                >
                  <option value="habit">Tree Habit / Canopy</option>
                  <option value="leaf">Leaves / Foliage</option>
                  <option value="bark">Bark / Trunk</option>
                  <option value="flower">Flower / Inflorescence</option>
                  <option value="fruit">Fruit / Pod</option>
                  <option value="seed">Seed</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Caption / Morphological Description
                </label>
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="e.g. Fissured bark showing lenticels"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Photo Credit
                </label>
                <input
                  type="text"
                  value={newCredit}
                  onChange={(e) => setNewCredit(e.target.value)}
                  placeholder="e.g. FES SUST Herbarium / Lawachara Excursion"
                  className="w-full px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Plate to Gallery</span>
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer with Save / Cancel */}
        <div className="flex items-center justify-between p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
          <div className="text-[11px] text-stone-500">
            Total Photos: <span className="font-bold text-stone-800 dark:text-stone-200">{totalPhotosCount}</span> (1 Primary + {morePhotos.length} Plates)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveModal}
              className="px-5 py-2 font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Photo Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Preview */}
      {previewZoomUrl && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setPreviewZoomUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-stone-950 rounded-2xl overflow-hidden shadow-2xl border border-stone-800 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewZoomUrl(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/75 text-white hover:bg-black transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewZoomUrl}
              alt="Zoomed Plate"
              className="max-w-full max-h-[82vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
