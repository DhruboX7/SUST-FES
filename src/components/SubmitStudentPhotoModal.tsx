import React, { useState, useEffect } from 'react';
import { X, Camera, CheckCircle2, AlertCircle, TreePine, MapPin, Calendar, User, Hash, ExternalLink } from 'lucide-react';
import { TreeSpecies } from '../types';
import { getStoredSpecies, addStudentPhotoSubmission } from '../utils/storage';

interface SubmitStudentPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedSpeciesId?: string;
  onSuccess?: () => void;
}

export const SubmitStudentPhotoModal: React.FC<SubmitStudentPhotoModalProps> = ({
  isOpen,
  onClose,
  preSelectedSpeciesId,
  onSuccess,
}) => {
  const [speciesList, setSpeciesList] = useState<TreeSpecies[]>([]);
  const [studentName, setStudentName] = useState('');
  const [studentBatch, setStudentBatch] = useState('');
  const [studentRegNo, setStudentRegNo] = useState('');
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('SUST Campus, Sylhet');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(preSelectedSpeciesId || '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    getStoredSpecies().then((data) => setSpeciesList(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (preSelectedSpeciesId) {
      setSelectedSpeciesId(preSelectedSpeciesId);
    }
  }, [preSelectedSpeciesId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('Please enter a descriptive photo title.');
      return;
    }
    if (!imageUrl.trim()) {
      setErrorMsg('Please provide a direct photo URL or Google Drive image link.');
      return;
    }

    // Resolve linked species
    const matchedSpecies = speciesList.find((s) => s.id === selectedSpeciesId);

    // Transform Google Drive links if provided
    let processedUrl = imageUrl.trim();
    if (processedUrl.includes('drive.google.com/file/d/')) {
      const match = processedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        processedUrl = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1200`;
      }
    }

    addStudentPhotoSubmission(
      {
        studentName: studentName.trim(),
        studentBatch: studentBatch.trim() || undefined,
        studentRegNo: studentRegNo.trim() || undefined,
        title: title.trim(),
        caption: caption.trim() || 'Dendrology and field tour observation capture by FES student.',
        location: location.trim() || 'SUST Campus, Sylhet',
        date,
        imageUrl: processedUrl,
        treeSpeciesId: matchedSpecies?.id,
        speciesScientificName: matchedSpecies ? matchedSpecies.scientificName : undefined,
      },
      'pending' // Submitted for admin review
    );

    setIsSubmitted(true);
    if (onSuccess) onSuccess();
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setStudentName('');
    setStudentBatch('');
    setStudentRegNo('');
    setTitle('');
    setCaption('');
    setImageUrl('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-fade-in"
      onClick={handleResetAndClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-xl w-full max-h-[92vh] flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug">
                Submit Field Tour / Student Photo
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500 dark:text-stone-400">
                Department of Forestry and Environmental Science, SUST
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isSubmitted ? (
            <div className="py-8 px-4 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Photo Submitted for Department Review!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{studentName}</strong>. Your field capture has been registered in the FES digital archive. It will appear on the public Student Lens and Tree Species profiles once approved by departmental administrators in the Manage console.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-800 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Student Credentials Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Student Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Session / Batch
                  </label>
                  <input
                    type="text"
                    value={studentBatch}
                    onChange={(e) => setStudentBatch(e.target.value)}
                    placeholder="e.g. 2021-22"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Registration No.
                  </label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      value={studentRegNo}
                      onChange={(e) => setStudentRegNo(e.target.value)}
                      placeholder="2021134018"
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Linked Tree Species */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Observation Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Mature Dipterocarpus turbinatus Foliage"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                    <TreePine className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Associated Tree Species</span>
                  </label>
                  <select
                    value={selectedSpeciesId}
                    onChange={(e) => setSelectedSpeciesId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  >
                    <option value="">General Forest / Campus Habitat</option>
                    {speciesList.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.scientificName} ({sp.banglaName} / {sp.commonName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Field Location & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>Field Tour Location *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lawachara National Park / SUST Campus"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>Observation Date</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {/* Image URL & Live Preview */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1 flex items-center justify-between">
                  <span>Photo URL (Direct Image Link or Google Drive Share) *</span>
                  <span className="text-[10px] text-stone-400 font-normal">JPG, PNG, WebP</span>
                </label>
                <input
                  type="text"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... or Google Drive shared file link"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                />

                {imageUrl && (
                  <div className="mt-2 p-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-stone-50 dark:bg-stone-950 flex items-center gap-3">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/hero_forestry_sust.webp';
                      }}
                      className="w-16 h-14 object-cover rounded-md border border-stone-300 dark:border-stone-700 shrink-0"
                    />
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Live thumbnail preview. Ensure the image link is publicly accessible so faculty and classmates can view it.
                    </div>
                  </div>
                )}
              </div>

              {/* Caption / Morphological Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Morphological Notes / Observations
                </label>
                <textarea
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe specimen habit, bark characteristics, flowering stage, canopy position, or ecological setting..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
                >
                  Submit Photo
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
