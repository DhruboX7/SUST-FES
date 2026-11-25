import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  Plus, 
  Trash2, 
  Star, 
  ExternalLink, 
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
import { isMatchedPhotoForSpecies, fetchStaticJson } from '../../utils/storage';
import { getOptimizedImageUrl, getFallbackImageUrl, handleImageError } from '../../utils/imageUtils';

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
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    };
  }, []);

  const showSuccess = (msg: string, duration = 3000) => {
    setSuccessMsg(msg);
    if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    successTimerRef.current = window.setTimeout(() => setSuccessMsg(''), duration);
  };

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
    showSuccess('Botanical plate added to gallery list.', 3000);
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
    showSuccess(`Added ${toAdd.length} botanical plates in batch!`, 3000);
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
    showSuccess('Selected photo set as Primary Specimen Habit photo.', 3000);
  };

  const handleDeletePlate = (index: number) => {
    setMorePhotos((prev) => prev.filter((_, i) => i !== index));
    showSuccess(`Plate #${index + 1} removed from list. Click "Save Photo Changes" below to apply.`, 4000);
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
      const floraMap = await fetchStaticJson<Record<string, any>>('flora_bangladesh_photos.json');
      if (floraMap) {
        const sciLower = (species.scientificName || '').trim().toLowerCase().replace(/\s+/g, ' ');
        const key = sciLower
          ? Object.keys(floraMap).find(
              (k) => k.trim().toLowerCase().replace(/\s+/g, ' ') === sciLower
            )
          : undefined;

        if (key && floraMap[key]) {
          const entry = floraMap[key];
          const allUrls: string[] = entry.allPhotos || (entry.imageUrl ? [entry.imageUrl] : []);

          if (allUrls.length > 0) {
            setFloraSyncResult({
              count: allUrls.length,
              photos: allUrls,
            });

            const matchedEntryPrimary =
              entry.imageUrl && isMatchedPhotoForSpecies(entry.imageUrl, species.scientificName)
                ? entry.imageUrl
                : '';

            let activePrimary =
              primaryUrl && isMatchedPhotoForSpecies(primaryUrl, species.scientificName)
                ? primaryUrl
                : matchedEntryPrimary;

            if (!primaryUrl && matchedEntryPrimary) {
              setPrimaryUrl(matchedEntryPrimary);
            }
            if (!floraUrl && entry.sourceUrl) {
              setFloraUrl(entry.sourceUrl);
            }
            if (!photoCredit && entry.sourceName) {
              setPhotoCredit(entry.sourceName);
            }

            // Filter only verified matched URLs
            const matchedUrls = allUrls.filter((url) => isMatchedPhotoForSpecies(url, species.scientificName));
            if (!activePrimary && matchedUrls.length > 0) {
              activePrimary = matchedUrls[0];
              setPrimaryUrl(activePrimary);
            }

            // Automatically import missing photos into morePhotos
            const currentUrls = new Set([activePrimary, ...morePhotos.map((p) => p.url)].filter(Boolean));
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
              showSuccess(`Imported ${newPlates.length} matched botanical plates from floraofbangladesh.com!`, 4000);
            } else {
              showSuccess(`Found ${matchedUrls.length} matched photos on Flora of Bangladesh. All are already imported!`, 4000);
            }
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
            showSuccess(`Imported ${toAdd.length} high-resolution matched Wikimedia Commons plates!`, 4000);
          } else {
            showSuccess('All matched Wikimedia plates found are already in the gallery.', 4000);
          }
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

  // Remove any unmatched or duplicate photos from current species gallery
  const handleRemoveUnmatched = () => {
    const prevPrimary = primaryUrl.trim();
    const isPrimaryMatched = !prevPrimary || isMatchedPhotoForSpecies(prevPrimary, species.scientificName);
    let nextPrimary = isPrimaryMatched ? prevPrimary : '';

    const seen = new Set<string>();
    if (nextPrimary) seen.add(nextPrimary);

    const filtered: TreePhoto[] = [];
    for (const p of morePhotos) {
      const cleanUrl = (p?.url || '').trim();
      if (!cleanUrl || !isMatchedPhotoForSpecies(cleanUrl, species.scientificName)) continue;
      if (seen.has(cleanUrl)) continue;
      seen.add(cleanUrl);
      filtered.push({ ...p, url: cleanUrl });
    }

    if (!nextPrimary && filtered.length > 0) {
      nextPrimary = filtered.shift()!.url;
    }

    const beforeTotal = (prevPrimary ? 1 : 0) + morePhotos.length;
    const afterTotal = (nextPrimary ? 1 : 0) + filtered.length;
    const removedCount = Math.max(0, beforeTotal - afterTotal);

    setPrimaryUrl(nextPrimary);
    setMorePhotos(filtered);

    if (removedCount > 0 || !isPrimaryMatched) {
      showSuccess(
        `Purged ${removedCount} unmatched or duplicate photo(s). Click "Save Photo Changes" below to apply.`,
        4000
      );
    } else {
      showSuccess('All photos in this species gallery are strictly verified and matched!', 3000);
    }
  };

  // 1-Click BFIS Forest Department check
  const handleCheckBfis = async () => {
    setIsSyncingFlora(true);
    setErrorMsg('');
    try {
      const parts = (species.scientificName || '').trim().split(/\s+/).filter(Boolean);
      if (parts.length < 2) {
        setErrorMsg('Invalid scientific binomial format.');
        return;
      }
      const fileName = `${parts[0]}_${parts[1]}.jpg`;
      const bfisUrl = `https://bfis.bforest.gov.bd/TreeInfo/public/uploads/${fileName}`;

      const currentUrls = new Set([primaryUrl, ...morePhotos.map((p) => p.url)]);
      if (currentUrls.has(bfisUrl)) {
        showSuccess('Official BFIS tree photo is already imported in this gallery.', 3000);
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
      showSuccess('Added Bangladesh Forest Department (BFIS) official silviculture photo!', 4000);
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#11261D]/85 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-4xl w-full max-h-[94vh] flex flex-col bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 bg-[#EAE7DA] dark:bg-[#142D22] shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Camera className="w-5 h-5 text-[#42684D] dark:text-[#BBC4A6]" />
              <h3 className="font-editorial text-base sm:text-lg font-bold text-[#19382B] dark:text-[#F3F1E8]">
                Species Photo Management:{' '}
                <span className="font-scientific font-semibold">{species.scientificName}</span>
              </h3>
              <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-[#FAF9F4] dark:bg-[#19382B] text-[#42684D] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 font-semibold">
                {totalPhotosCount} photos
              </span>
            </div>
            <div className="text-xs text-[#42684D] dark:text-[#8A9C74] mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{species.commonName}</span>
              <span>·</span>
              <span className="font-medium text-[#19382B] dark:text-[#BBC4A6]">{species.banglaName}</span>
              <span>·</span>
              <span className="font-mono">{species.family}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          {/* Quick Toolbar: Multi-Source Botanical Sync */}
          <div className="p-3.5 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#19382B] dark:text-[#F3F1E8] font-semibold">
              <Camera className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6] shrink-0" />
              <span>Multi-Source Authentic Botanical Photo Curation</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCheckAndImportFlora}
                disabled={isSyncingFlora}
                className="px-2.5 py-1.5 rounded-md bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 text-[11px]"
                title="Fetch photos from floraofbangladesh.com"
              >
                <Globe className={`w-3.5 h-3.5 ${isSyncingFlora ? 'animate-spin' : ''}`} />
                <span>Flora of BD</span>
              </button>

              <button
                type="button"
                onClick={handleCheckWikimedia}
                disabled={isSyncingFlora}
                className="px-2.5 py-1.5 rounded-md bg-[#19382B] hover:bg-[#42684D] text-[#F3F1E8] border border-[#BBC4A6]/30 font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 text-[11px]"
                title="Query open Wikimedia Commons media API"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Wikimedia Commons</span>
              </button>

              <button
                type="button"
                onClick={handleCheckBfis}
                disabled={isSyncingFlora}
                className="px-2.5 py-1.5 rounded-md bg-[#8A9C74] hover:bg-[#42684D] text-[#F3F1E8] font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 text-[11px]"
                title="Check Bangladesh Forest Department (BFIS) upload"
              >
                <TreePine className="w-3.5 h-3.5" />
                <span>Forest Dept (BFIS)</span>
              </button>

              <button
                type="button"
                onClick={handleRemoveUnmatched}
                className="px-2.5 py-1.5 rounded-md bg-[#FAF9F4] dark:bg-[#19382B] hover:bg-[#987453] hover:text-[#F3F1E8] text-[#987453] border border-[#987453]/60 font-semibold flex items-center gap-1.5 transition-colors text-[11px]"
                title="Purge any unmatched photos from this species gallery"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clean Unmatched</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkOpen(!isBulkOpen)}
                className="px-2.5 py-1.5 rounded-md bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/30 text-[#19382B] dark:text-[#F3F1E8] font-semibold hover:border-[#42684D] transition-colors flex items-center gap-1.5 text-[11px]"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isBulkOpen ? 'Close Paste' : 'Batch Paste'}</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          {successMsg && (
            <div className="p-3 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#42684D] text-[#19382B] dark:text-[#F3F1E8] font-semibold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453] text-[#987453] dark:text-[#F3F1E8] font-semibold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-[#987453] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Bulk Paste Section */}
          {isBulkOpen && (
            <div className="p-4 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#EAE7DA]/70 dark:bg-[#142D22] space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                  Batch Add Multiple Photo Links
                </span>
                <span className="text-[#8A9C74] text-[11px]">
                  Paste multiple image URLs (one per line)
                </span>
              </div>
              <textarea
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                placeholder="https://blogger.googleusercontent.com/.../photo1.jpg&#10;https://blogger.googleusercontent.com/.../photo2.jpg"
                rows={4}
                className="w-full p-2.5 font-mono text-[11px] rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
              />
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#42684D] dark:text-[#BBC4A6]">Default Botanical Tag:</span>
                  <select
                    value={bulkTag}
                    onChange={(e) => setBulkTag(e.target.value as any)}
                    className="px-2 py-1 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] font-medium"
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
                  className="px-4 py-1.5 bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] font-semibold rounded-md transition-colors"
                >
                  Import All URLs to Gallery
                </button>
              </div>
            </div>
          )}

          {/* 1. PRIMARY SPECIMEN HABIT PHOTO SECTION */}
          <div className="p-4 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#EAE7DA]/60 dark:bg-[#142D22] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                <Star className="w-4 h-4 text-[#987453] fill-[#987453]" />
                <span>Primary Specimen Habit Photo (Cover Photo)</span>
              </div>
              <span className="text-[11px] text-[#8A9C74]">
                Featured on public species catalog cards
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* Preview Thumbnail */}
              <div className="md:col-span-1">
                <div
                  className="relative aspect-[4/3] sm:aspect-square rounded-md overflow-hidden bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/30 cursor-pointer group"
                  onClick={() => primaryUrl && setPreviewZoomUrl(primaryUrl)}
                >
                  <img
                    src={primaryUrl || getFallbackImageUrl()}
                    alt="Primary Specimen"
                    decoding="async"
                    onError={handleImageError}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                  />
                  <div className="absolute inset-0 bg-[#11261D]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#F3F1E8] gap-1 font-semibold text-[11px]">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Zoom</span>
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-[#19382B]/90 text-[#F3F1E8] border border-[#987453] font-mono text-[9px] font-bold">
                    PRIMARY
                  </div>
                </div>
              </div>

              {/* URL & Attributes */}
              <div className="md:col-span-3 space-y-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-[#19382B] dark:text-[#BBC4A6]">
                      Primary Image URL *
                    </label>
                    {primaryUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setPrimaryUrl('');
                          showSuccess('Primary photo cleared. Click "Save Photo Changes" below to apply.', 4000);
                        }}
                        className="text-[11px] font-semibold text-[#987453] hover:underline flex items-center gap-1"
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
                    className="w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                      Photo Attribution / Credit
                    </label>
                    <input
                      type="text"
                      value={photoCredit}
                      onChange={(e) => setPhotoCredit(e.target.value)}
                      placeholder="e.g. Flora of Bangladesh / SUST Herbarium"
                      className="w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                      Flora of Bangladesh Article URL
                    </label>
                    <input
                      type="text"
                      value={floraUrl}
                      onChange={(e) => setFloraUrl(e.target.value)}
                      placeholder="http://www.floraofbangladesh.com/2016/..."
                      className="w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BOTANICAL PLATES (morePhotos) GALLERY LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                <Layers className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6]" />
                <span>Botanical Multi-Photo Plates ({morePhotos.length} plates)</span>
              </div>
              <span className="text-[11px] text-[#8A9C74]">
                Morphological views: Habit, Leaves, Bark, Inflorescence, Fruits
              </span>
            </div>

            {morePhotos.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#BBC4A6] dark:border-[#BBC4A6]/30 rounded-md p-6 bg-[#EAE7DA]/40 dark:bg-[#142D22]/60">
                <Camera className="w-8 h-8 text-[#8A9C74] mx-auto mb-2" />
                <p className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                  No additional botanical plates configured yet
                </p>
                <p className="text-[11px] text-[#42684D] dark:text-[#8A9C74] mt-1">
                  Click "Flora of BD" above or add photos below to create a multi-photo plate gallery.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {morePhotos.map((plate, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22] hover:border-[#42684D] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    {/* Left: Thumbnail & Tag */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div
                        className="relative w-16 h-14 rounded-sm overflow-hidden bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 cursor-pointer shrink-0 group"
                        onClick={() => setPreviewZoomUrl(plate.url)}
                      >
                        <img
                          src={getOptimizedImageUrl(plate.url, 240)}
                          alt={plate.caption || `Plate ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          onError={handleImageError}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform"
                        />
                        <div className="absolute inset-0 bg-[#11261D]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[#F3F1E8]">
                          <ZoomIn className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <select
                            value={plate.tag || 'general'}
                            onChange={(e) => handleUpdatePlateTag(index, e.target.value as any)}
                            className="px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider bg-[#EAE7DA] dark:bg-[#19382B] text-[#42684D] dark:text-[#BBC4A6] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25"
                          >
                            <option value="habit">Habit / Canopy</option>
                            <option value="leaf">Leaf / Foliage</option>
                            <option value="bark">Bark / Trunk</option>
                            <option value="flower">Flower</option>
                            <option value="fruit">Fruit / Pod</option>
                            <option value="seed">Seed</option>
                            <option value="general">General</option>
                          </select>
                          <span className="font-mono text-[10px] text-[#8A9C74]">
                            Plate #{index + 1}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={plate.caption || ''}
                          onChange={(e) => handleUpdatePlateCaption(index, e.target.value)}
                          placeholder="Caption / morphological feature..."
                          className="w-full sm:w-80 px-2 py-1 text-xs rounded-sm border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
                        />
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMakePrimary(index)}
                        className="px-2.5 py-1 rounded-md bg-[#EAE7DA] dark:bg-[#19382B] hover:bg-[#987453] hover:text-[#F3F1E8] text-[#19382B] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/25 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                        title="Set this photo as the Primary Cover specimen"
                      >
                        <Star className="w-3 h-3" />
                        <span>Make Primary</span>
                      </button>

                      <div className="flex items-center border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-md overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleMovePlate(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] disabled:opacity-30 text-[#42684D] dark:text-[#BBC4A6]"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePlate(index, 'down')}
                          disabled={index === morePhotos.length - 1}
                          className="p-1 hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] disabled:opacity-30 text-[#42684D] dark:text-[#BBC4A6] border-l border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeletePlate(index)}
                        className="p-1.5 rounded-sm text-[#987453] hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] transition-colors"
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
            className="p-4 rounded-md border border-[#42684D]/50 bg-[#EAE7DA]/70 dark:bg-[#142D22] space-y-3"
          >
            <div className="font-semibold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6]" />
              <span>Add Another Botanical Plate</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                  Photo URL *
                </label>
                <input
                  type="text"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://... or Google Drive link"
                  className="w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                  Botanical Tag
                </label>
                <select
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] font-medium"
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
                <label className="block font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                  Caption / Morphological Description
                </label>
                <input
                  type="text"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="e.g. Fissured bark showing lenticels"
                  className="w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#19382B] dark:text-[#BBC4A6] mb-1">
                  Photo Credit
                </label>
                <input
                  type="text"
                  value={newCredit}
                  onChange={(e) => setNewCredit(e.target.value)}
                  placeholder="e.g. FES SUST Herbarium / Lawachara Excursion"
                  className="w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Plate to Gallery</span>
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer with Save / Cancel */}
        <div className="flex items-center justify-between p-4 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 bg-[#EAE7DA] dark:bg-[#142D22] shrink-0">
          <div className="text-[11px] text-[#42684D] dark:text-[#8A9C74]">
            Total Photos: <span className="font-bold text-[#19382B] dark:text-[#F3F1E8]">{totalPhotosCount}</span> (1 Primary + {morePhotos.length} Plates)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B] rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveModal}
              className="px-5 py-2 font-semibold bg-[#42684D] hover:bg-[#19382B] text-[#F3F1E8] rounded-md transition-colors flex items-center gap-1.5"
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
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#11261D]/90 animate-fade-in"
          onClick={() => setPreviewZoomUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#19382B] rounded-lg overflow-hidden shadow-2xl border border-[#BBC4A6]/30 p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewZoomUrl(null)}
              className="absolute top-3 right-3 p-1.5 rounded-md bg-[#11261D]/90 text-[#F3F1E8] hover:bg-[#19382B] border border-[#BBC4A6]/30 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewZoomUrl}
              alt="Zoomed Plate"
              decoding="async"
              onError={handleImageError}
              className="max-w-full max-h-[82vh] object-contain rounded-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};
