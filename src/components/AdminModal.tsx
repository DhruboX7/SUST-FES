import React, { useState, useId, useMemo } from 'react';
import { ResourceItem, AcademicYear, ResourceCategory, FileType } from '../types';
import { SUST_FES_COURSES } from '../data/coursesData';
import { parseGoogleDriveUrl, guessFileType } from '../utils/driveParser';
import { 
  verifyAdminPin, 
  setStoredAdminPin, 
  exportLibraryToJson, 
  importLibraryFromJson,
  resetStoredResourcesToDefaults 
} from '../utils/storage';
import { 
  X, 
  PlusCircle, 
  Check, 
  AlertCircle, 
  Download, 
  Upload, 
  Trash2, 
  ShieldCheck, 
  Lock, 
  Key, 
  RefreshCw, 
  FileText, 
  Search,
  ExternalLink,
  Edit3,
  Copy,
  ArrowLeft,
  Filter,
  Tag,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  resources: ResourceItem[];
  onAddResource: (resource: ResourceItem) => void;
  onUpdateResource: (resource: ResourceItem) => void;
  onDeleteResource: (id: string) => void;
  onRefreshResources: (resources: ResourceItem[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  resources,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
  onRefreshResources,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'manage' | 'add' | 'backup'>('manage');

  // Manage tab state
  const [manageSearch, setManageSearch] = useState('');
  const [filterYear, setFilterYear] = useState<AcademicYear | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<ResourceCategory | 'all'>('all');
  const [filterSemester, setFilterSemester] = useState<1 | 2 | 'all'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Edit Mode state
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCustomCourseTitle, setEditCustomCourseTitle] = useState('');
  const [editCategory, setEditCategory] = useState<ResourceCategory>('slides');
  const [editYear, setEditYear] = useState<AcademicYear>(1);
  const [editSemester, setEditSemester] = useState<1 | 2 | 'all'>(1);
  const [editDriveUrl, setEditDriveUrl] = useState('');
  const [editSessionYear, setEditSessionYear] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editExamTerm, setEditExamTerm] = useState<'midterm' | 'final' | 'quiz' | 'all'>('final');
  const [editKeywords, setEditKeywords] = useState('');
  const [editPath, setEditPath] = useState('');
  const [editFormError, setEditFormError] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Form State for Quick Add
  const [driveUrl, setDriveUrl] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState<AcademicYear>(1);
  const [semester, setSemester] = useState<1 | 2 | 'all'>(1);
  const [selectedCourseCode, setSelectedCourseCode] = useState('FES 08211121');
  const [customCourseTitle, setCustomCourseTitle] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('slides');
  const [sessionYear, setSessionYear] = useState('2023-2024');
  const [authorOrTeacher, setAuthorOrTeacher] = useState('');
  const [description, setDescription] = useState('');
  const [examTerm, setExamTerm] = useState<'midterm' | 'final' | 'quiz' | 'all'>('final');
  const [addKeywords, setAddKeywords] = useState('');
  const [addPath, setAddPath] = useState('');
  const [addSuccessMsg, setAddSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  // Backup tab state
  const [newPin, setNewPin] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [pinErrorMsg, setPinErrorMsg] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Accessible ID for file upload
  const fileInputId = useId();

  // Handle Login
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPin(pinInput)) {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Incorrect PIN. The default departmental PIN is "sustfes".');
    }
  };

  const handleQuickUnlock = () => {
    setIsAuthenticated(true);
    setPinError('');
  };

  // Instant Link Parser feedback for Add
  const parsedDrive = parseGoogleDriveUrl(driveUrl);
  // Instant Link Parser feedback for Edit
  const parsedEditDrive = parseGoogleDriveUrl(editDriveUrl);

  // Available courses filtered by year
  const availableCoursesForAdd = SUST_FES_COURSES.filter((c) => {
    if (year === 'msc') return c.year === 'msc';
    return c.year === year;
  });

  const availableCoursesForEdit = SUST_FES_COURSES.filter((c) => {
    if (editYear === 'msc') return c.year === 'msc';
    return c.year === editYear;
  });

  const handleYearChange = (newYear: AcademicYear) => {
    setYear(newYear);
    const matching = SUST_FES_COURSES.filter((c) => c.year === newYear);
    if (matching.length > 0) {
      setSelectedCourseCode(matching[0].code);
    }
  };

  const handleEditYearChange = (newYear: AcademicYear) => {
    setEditYear(newYear);
    const matching = SUST_FES_COURSES.filter((c) => c.year === newYear);
    if (matching.length > 0) {
      setEditCourseCode(matching[0].code);
      setEditCustomCourseTitle(matching[0].title);
    }
  };

  // Start Editing a resource
  const handleStartEdit = (resource: ResourceItem) => {
    setEditingResource(resource);
    setEditTitle(resource.title);
    setEditCourseCode(resource.courseCode);
    setEditCustomCourseTitle(resource.courseTitle);
    setEditCategory(resource.category);
    setEditYear(resource.year);
    setEditSemester(resource.semester);
    setEditDriveUrl(resource.driveUrl);
    setEditSessionYear(resource.sessionYear || '');
    setEditAuthor(resource.authorOrTeacher || '');
    setEditDescription(resource.description || '');
    setEditExamTerm(resource.examTerm || 'final');
    setEditKeywords((resource.keywords || []).join(', '));
    setEditPath(resource.path || '');
    setEditFormError('');
    setEditSuccessMsg('');
  };

  // Save Edits to a resource
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource) return;
    setEditFormError('');

    if (!editTitle.trim()) {
      setEditFormError('Resource title cannot be empty.');
      return;
    }

    if (!editDriveUrl.trim()) {
      setEditFormError('Google Drive URL is required.');
      return;
    }

    const courseObj = SUST_FES_COURSES.find((c) => c.code === editCourseCode);
    const resolvedCourseTitle = courseObj ? courseObj.title : (editCustomCourseTitle.trim() || 'Specialized Topic');
    const parsed = parseGoogleDriveUrl(editDriveUrl.trim());

    const updatedKeywords = editKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const updatedResource: ResourceItem = {
      ...editingResource,
      title: editTitle.trim(),
      courseCode: editCourseCode,
      courseTitle: resolvedCourseTitle,
      category: editCategory,
      year: editYear,
      semester: editSemester,
      driveUrl: editDriveUrl.trim(),
      fileId: parsed.valid ? parsed.fileId : editingResource.fileId,
      fileType: guessFileType(editDriveUrl.trim(), editCategory, parsed.fileType),
      previewUrl: parsed.previewUrl || editingResource.previewUrl,
      downloadUrl: parsed.downloadUrl || editingResource.downloadUrl,
      sessionYear: editSessionYear.trim() || undefined,
      authorOrTeacher: editAuthor.trim() || 'FES SUST Dept',
      description: editDescription.trim() || undefined,
      examTerm: editCategory === 'pyq' ? editExamTerm : undefined,
      path: editPath.trim() || editingResource.path || `Google Drive / Year ${editYear} / Sem ${editSemester} / ${editCourseCode} / ${editTitle.trim()}`,
      keywords: updatedKeywords.length > 0 ? updatedKeywords : [editCourseCode, resolvedCourseTitle, editCategory],
      scannedSnippet: editDescription.trim() || `${editCourseCode} ${resolvedCourseTitle} - ${editTitle.trim()}`,
    };

    onUpdateResource(updatedResource);
    setEditSuccessMsg(`Successfully updated "${updatedResource.title}"!`);
    setTimeout(() => {
      setEditSuccessMsg('');
      setEditingResource(null);
    }, 1200);
  };

  // Duplicate a resource
  const handleDuplicate = (item: ResourceItem) => {
    const duplicated: ResourceItem = {
      ...item,
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: `${item.title} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    onAddResource(duplicated);
  };

  // Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!driveUrl.trim()) {
      setFormError('Please enter a Google Drive link.');
      return;
    }

    if (!parsedDrive.valid) {
      setFormError('Please enter a valid Google Drive or web share link.');
      return;
    }

    if (!title.trim()) {
      setFormError('Please provide a title for the document.');
      return;
    }

    const courseObj = SUST_FES_COURSES.find((c) => c.code === selectedCourseCode);
    const resolvedCourseTitle = courseObj ? courseObj.title : (customCourseTitle || 'Specialized Topic');

    const kwList = addKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const newResource: ResourceItem = {
      id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      courseCode: selectedCourseCode,
      courseTitle: resolvedCourseTitle,
      year,
      semester,
      category,
      driveUrl: driveUrl.trim(),
      fileId: parsedDrive.fileId,
      fileType: guessFileType(driveUrl, category, parsedDrive.fileType),
      previewUrl: parsedDrive.previewUrl,
      downloadUrl: parsedDrive.downloadUrl,
      sessionYear: sessionYear.trim(),
      authorOrTeacher: authorOrTeacher.trim() || 'FES SUST Dept',
      description: description.trim(),
      examTerm: category === 'pyq' ? examTerm : undefined,
      path: addPath.trim() || `Google Drive / Year ${year} / Sem ${semester} / ${selectedCourseCode} ${resolvedCourseTitle} / ${title.trim()}`,
      keywords: kwList.length > 0 ? kwList : [selectedCourseCode, resolvedCourseTitle, category, sessionYear.trim(), authorOrTeacher.trim()].filter(Boolean),
      scannedSnippet: description.trim() || `${selectedCourseCode} ${resolvedCourseTitle} - ${title.trim()}`,
      createdAt: new Date().toISOString(),
    };

    onAddResource(newResource);
    setAddSuccessMsg(`"${newResource.title}" added to the library!`);

    // Reset fields
    setDriveUrl('');
    setTitle('');
    setDescription('');
    setAddKeywords('');
    setAddPath('');
    setTimeout(() => setAddSuccessMsg(''), 4000);
  };

  // Manage Filtered List
  const filteredManageResources = useMemo(() => {
    return resources.filter((r) => {
      if (manageSearch.trim()) {
        const q = manageSearch.toLowerCase();
        const matches = 
          r.title.toLowerCase().includes(q) ||
          r.courseCode.toLowerCase().includes(q) ||
          r.courseTitle.toLowerCase().includes(q) ||
          (r.authorOrTeacher && r.authorOrTeacher.toLowerCase().includes(q)) ||
          (r.path && r.path.toLowerCase().includes(q)) ||
          (r.keywords && r.keywords.some((k) => k.toLowerCase().includes(q)));
        if (!matches) return false;
      }
      if (filterYear !== 'all' && r.year !== filterYear) return false;
      if (filterCategory !== 'all' && r.category !== filterCategory) return false;
      if (filterSemester !== 'all' && r.semester !== filterSemester && r.semester !== 'all') return false;
      return true;
    });
  }, [resources, manageSearch, filterYear, filterCategory, filterSemester]);

  // Bulk actions
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredManageResources.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredManageResources.map((r) => r.id));
    }
  };

  const handleToggleSelectId = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => onDeleteResource(id));
    setSelectedIds([]);
  };

  const handleConfirmReset = () => {
    const defaults = resetStoredResourcesToDefaults();
    onRefreshResources(defaults);
    setShowResetConfirm(false);
    setImportStatus('Departmental library reset to official curriculum default!');
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importLibraryFromJson(file);
    if (result.success && result.items) {
      onRefreshResources(result.items);
      setImportStatus(result.message);
    } else {
      setImportStatus(result.message);
    }
    setTimeout(() => setImportStatus(null), 5000);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinErrorMsg('');
    if (newPin.trim().length >= 4) {
      setStoredAdminPin(newPin.trim());
      setPinSuccessMsg('Admin PIN updated successfully!');
      setNewPin('');
      setTimeout(() => setPinSuccessMsg(''), 3000);
    } else {
      setPinErrorMsg('PIN must be at least 4 characters long.');
      setTimeout(() => setPinErrorMsg(''), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-stone-900 dark:text-stone-100 transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-800 text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Manage Department Library
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                  {resources.length} Materials
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Edit, categorize, and organize Google Drive links & curriculum resources
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gate if not logged in */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold mb-2">Departmental Access Key</h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">
              Enter the administrator PIN to edit, add, or manage course materials in the departmental library.
            </p>

            <form onSubmit={handlePinSubmit} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Default: sustfes)"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-center font-mono text-base tracking-widest focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm rounded-xl transition-colors shadow-xs"
                >
                  Unlock Management Section
                </button>

                <button
                  type="button"
                  onClick={handleQuickUnlock}
                  className="w-full py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5 text-emerald-600" />
                  <span>One-Click Quick Access (Default: sustfes)</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Tabs */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-stone-200 dark:border-stone-800 px-6 gap-6 bg-white dark:bg-stone-900 shrink-0 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab('manage');
                  setEditingResource(null);
                }}
                className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'manage'
                    ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit & Manage Course Materials ({resources.length})</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('add');
                  setEditingResource(null);
                }}
                className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'add'
                    ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Single Material</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('backup');
                  setEditingResource(null);
                }}
                className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'backup'
                    ? 'border-emerald-700 text-emerald-800 dark:border-emerald-400 dark:text-emerald-300'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Backup & Settings</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              
              {/* TAB 1: EDIT & MANAGE COURSE MATERIALS */}
              {activeTab === 'manage' && (
                <div>
                  {/* EDIT SUB-VIEW: When an item is selected for editing */}
                  {editingResource ? (
                    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
                      {/* Edit Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingResource(null)}
                            className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                            title="Back to list"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                                Edit Course Material
                              </h3>
                              <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
                                {editingResource.courseCode}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400">
                              Modify title, curriculum category, Drive link, directory path, and search keywords
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditingResource(null)}
                          className="text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Success / Error Messages */}
                      {editSuccessMsg && (
                        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                          <Check className="w-4 h-4 shrink-0" />
                          <span>{editSuccessMsg}</span>
                        </div>
                      )}

                      {editFormError && (
                        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{editFormError}</span>
                        </div>
                      )}

                      {/* Edit Form */}
                      <form onSubmit={handleSaveEdit} className="space-y-4">
                        {/* 1. Title */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                            Document / Material Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="e.g. FES 211 Silviculture: Nursery Management Slides"
                            className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          />
                        </div>

                        {/* 2. Google Drive URL */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                              Google Drive or Share URL *
                            </label>
                            {editDriveUrl.trim() && (
                              <a
                                href={editDriveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                              >
                                <span>Test Link</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <input
                            type="url"
                            required
                            value={editDriveUrl}
                            onChange={(e) => setEditDriveUrl(e.target.value)}
                            placeholder="https://drive.google.com/file/d/..."
                            className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          />
                          {editDriveUrl.trim() && (
                            <div className="mt-1.5 text-[11px]">
                              {parsedEditDrive.valid ? (
                                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                                  ✓ Valid link ({parsedEditDrive.fileType.toUpperCase()}) · File ID: {parsedEditDrive.fileId}
                                </span>
                              ) : (
                                <span className="text-amber-700 dark:text-amber-400">
                                  ⚠ Note: {parsedEditDrive.errorMessage}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 3. Year & Semester Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              Academic Year
                            </label>
                            <select
                              value={String(editYear)}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleEditYearChange(val === 'msc' ? 'msc' : (Number(val) as AcademicYear));
                              }}
                              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-1 focus:ring-emerald-600"
                            >
                              <option value="1">1st Year B.Sc.</option>
                              <option value="2">2nd Year B.Sc.</option>
                              <option value="3">3rd Year B.Sc.</option>
                              <option value="4">4th Year B.Sc.</option>
                              <option value="msc">M.Sc. / Thesis</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              Semester
                            </label>
                            <select
                              value={String(editSemester)}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditSemester(val === 'all' ? 'all' : (Number(val) as 1 | 2));
                              }}
                              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-1 focus:ring-emerald-600"
                            >
                              <option value="1">Semester I</option>
                              <option value="2">Semester II</option>
                              <option value="all">Full Year / Both</option>
                            </select>
                          </div>
                        </div>

                        {/* 4. Course Code & Title */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                            Curriculum Course
                          </label>
                          <select
                            value={editCourseCode}
                            onChange={(e) => {
                              const code = e.target.value;
                              setEditCourseCode(code);
                              const found = SUST_FES_COURSES.find((c) => c.code === code);
                              if (found) setEditCustomCourseTitle(found.title);
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-1 focus:ring-emerald-600 truncate"
                          >
                            {availableCoursesForEdit.map((c) => (
                              <option key={c.id} value={c.code}>
                                {c.code} · {c.title}
                              </option>
                            ))}
                            <option value="CUSTOM">Custom Course / Specialized</option>
                          </select>

                          {editCourseCode === 'CUSTOM' && (
                            <input
                              type="text"
                              value={editCustomCourseTitle}
                              onChange={(e) => setEditCustomCourseTitle(e.target.value)}
                              placeholder="Enter custom course name..."
                              className="mt-2 w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                            />
                          )}
                        </div>

                        {/* 5. Category & Exam Term / Session */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              Resource Category
                            </label>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value as ResourceCategory)}
                              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-1 focus:ring-emerald-600"
                            >
                              <option value="slides">Lecture Slides</option>
                              <option value="notes">Class Notes / Handouts</option>
                              <option value="pyq">Previous Year Questions (PYQs)</option>
                              <option value="practical">Lab & Field Manual</option>
                              <option value="book">Reference Book</option>
                              <option value="syllabus">Syllabus / Guide</option>
                            </select>
                          </div>

                          {editCategory === 'pyq' ? (
                            <div>
                              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                Exam Term
                              </label>
                              <select
                                value={editExamTerm}
                                onChange={(e) => setEditExamTerm(e.target.value as any)}
                                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                              >
                                <option value="final">Semester Final Exam</option>
                                <option value="midterm">Midterm Examination</option>
                                <option value="quiz">Class Quiz / Assessment</option>
                                <option value="all">Compiled All Exams</option>
                              </select>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                                Academic Session / Year
                              </label>
                              <input
                                type="text"
                                value={editSessionYear}
                                onChange={(e) => setEditSessionYear(e.target.value)}
                                placeholder="e.g. 2023-2024"
                                className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                              />
                            </div>
                          )}
                        </div>

                        {/* 6. Teacher & Directory Path */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              Teacher / Contributor
                            </label>
                            <input
                              type="text"
                              value={editAuthor}
                              onChange={(e) => setEditAuthor(e.target.value)}
                              placeholder="e.g. Prof. Dr. A. Rahman or CR 28th"
                              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                              Folder Path Breadcrumb
                            </label>
                            <input
                              type="text"
                              value={editPath}
                              onChange={(e) => setEditPath(e.target.value)}
                              placeholder="e.g. Google Drive / 2nd Year / Sem 1 / FES 211 / Slides"
                              className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* 7. Keywords */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                            Scanned Keywords (comma-separated for catalog search)
                          </label>
                          <input
                            type="text"
                            value={editKeywords}
                            onChange={(e) => setEditKeywords(e.target.value)}
                            placeholder="e.g. Silviculture, Nursery, Regeneration, Seedling, FES 211"
                            className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                          />
                        </div>

                        {/* 8. Description */}
                        <div>
                          <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                            Description / Topics Covered
                          </label>
                          <textarea
                            rows={3}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Add brief summary, chapters covered, or exam focus areas..."
                            className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-200 dark:border-stone-800">
                          <button
                            type="button"
                            onClick={() => setEditingResource(null)}
                            className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            <span>Save Changes</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    /* LIST VIEW: All materials with search, filters, inline edit, delete, and duplicate */
                    <div className="space-y-4">
                      {/* Filter Bar */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                          <input
                            type="text"
                            value={manageSearch}
                            onChange={(e) => setManageSearch(e.target.value)}
                            placeholder="Search by title, course code, path, or keyword..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                          />
                          {manageSearch && (
                            <button
                              onClick={() => setManageSearch('')}
                              className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                          {/* Year filter */}
                          <select
                            value={String(filterYear)}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFilterYear(val === 'all' ? 'all' : (val === 'msc' ? 'msc' : (Number(val) as AcademicYear)));
                            }}
                            className="px-2.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs shrink-0"
                          >
                            <option value="all">All Years</option>
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                            <option value="msc">M.Sc.</option>
                          </select>

                          {/* Category filter */}
                          <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value as any)}
                            className="px-2.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs shrink-0"
                          >
                            <option value="all">All Types</option>
                            <option value="slides">Slides</option>
                            <option value="notes">Notes</option>
                            <option value="pyq">PYQs</option>
                            <option value="practical">Practical</option>
                            <option value="book">Books</option>
                            <option value="syllabus">Syllabus</option>
                          </select>

                          {/* Quick Add Button */}
                          <button
                            type="button"
                            onClick={() => setActiveTab('add')}
                            className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Add Material</span>
                          </button>
                        </div>
                      </div>

                      {/* Header summary & Bulk actions */}
                      <div className="flex items-center justify-between text-xs px-1 text-stone-500 dark:text-stone-400">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 font-medium"
                          >
                            {selectedIds.length === filteredManageResources.length && filteredManageResources.length > 0 ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-stone-400" />
                            )}
                            <span>Select All</span>
                          </button>
                          <span>•</span>
                          <span>
                            Showing {filteredManageResources.length} of {resources.length} materials
                          </span>
                        </div>

                        {selectedIds.length > 0 && (
                          <div className="flex items-center gap-2 animate-fade-in">
                            <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                              {selectedIds.length} selected
                            </span>
                            <button
                              type="button"
                              onClick={handleBatchDelete}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete Selected</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Table / Material Rows */}
                      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900 shadow-xs">
                        <div className="max-h-[52vh] overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800">
                          {filteredManageResources.length === 0 ? (
                            <div className="p-8 text-center">
                              <AlertCircle className="w-8 h-8 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
                              <p className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                                No course materials match the current filters.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setManageSearch('');
                                  setFilterYear('all');
                                  setFilterCategory('all');
                                }}
                                className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
                              >
                                Reset search and filters
                              </button>
                            </div>
                          ) : (
                            filteredManageResources.map((item) => (
                              <div
                                key={item.id}
                                className={`p-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/60 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                  selectedIds.includes(item.id) ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                                }`}
                              >
                                {/* Left: Selection checkbox + course info */}
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSelectId(item.id)}
                                    className="mt-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 shrink-0"
                                  >
                                    {selectedIds.includes(item.id) ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                                    ) : (
                                      <Square className="w-4 h-4" />
                                    )}
                                  </button>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                                        {item.courseCode}
                                      </span>
                                      <span className="text-[11px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 capitalize font-medium">
                                        {item.category === 'pyq' ? 'PYQ' : item.category}
                                      </span>
                                      <span className="text-[11px] text-stone-400">
                                        {item.year === 'msc' ? 'M.Sc.' : `Year ${item.year}`} · Sem {item.semester}
                                      </span>
                                      {item.sessionYear && (
                                        <span className="text-[11px] text-stone-400 font-mono">
                                          ({item.sessionYear})
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                                      {item.title}
                                    </h4>

                                    {item.path && (
                                      <p className="text-[10px] text-stone-400 font-mono truncate mt-0.5">
                                        📁 {item.path}
                                      </p>
                                    )}

                                    {item.keywords && item.keywords.length > 0 && (
                                      <div className="flex items-center gap-1 flex-wrap mt-1">
                                        {item.keywords.slice(0, 3).map((kw, i) => (
                                          <span
                                            key={i}
                                            className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-500"
                                          >
                                            #{kw}
                                          </span>
                                        ))}
                                        {item.keywords.length > 3 && (
                                          <span className="text-[10px] text-stone-400">
                                            +{item.keywords.length - 3}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Right: Action buttons (Edit, Link, Duplicate, Delete) */}
                                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                  {deleteConfirmId === item.id ? (
                                    <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/60 p-1 rounded-lg border border-rose-200 dark:border-rose-800 animate-fade-in">
                                      <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-300 pl-1">
                                        Delete?
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onDeleteResource(item.id);
                                          setDeleteConfirmId(null);
                                        }}
                                        className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="px-2 py-0.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-700 dark:text-stone-300 rounded text-[10px]"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      {/* EDIT BUTTON (Always prominently visible in Manage Library) */}
                                      <button
                                        type="button"
                                        onClick={() => handleStartEdit(item)}
                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                                        title="Edit this course material"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                      </button>

                                      {/* Open in Drive */}
                                      <a
                                        href={item.driveUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 rounded-lg text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                        title="Redirect to Google Drive"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>

                                      {/* Duplicate / Clone */}
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicate(item)}
                                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                        title="Duplicate as template"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Delete */}
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(item.id)}
                                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                                        title="Delete material"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ADD SINGLE RESOURCE */}
              {activeTab === 'add' && (
                <form onSubmit={handleAddSubmit} className="space-y-5 max-w-2xl mx-auto">
                  
                  {addSuccessMsg && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{addSuccessMsg}</span>
                    </div>
                  )}

                  {formError && (
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* 1. Google Drive URL */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Google Drive Link or Document Share URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="Paste any link: https://drive.google.com/file/d/..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />

                    {driveUrl.trim() && (
                      <div className="mt-2 text-xs">
                        {parsedDrive.valid ? (
                          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold text-xs">
                                ✓ Valid Google Drive Link Detected! ({parsedDrive.fileType.toUpperCase()})
                              </div>
                              <div className="text-[11px] font-mono opacity-80 truncate">
                                File ID: {parsedDrive.fileId}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>{parsedDrive.errorMessage}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2. Resource Title */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Resource Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. FES 211: Silviculture Nursery Management & Tending Slides"
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  {/* 3. Year & Semester Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Academic Year
                      </label>
                      <select
                        value={String(year)}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleYearChange(val === 'msc' ? 'msc' : (Number(val) as AcademicYear));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="1">1st Year B.Sc.</option>
                        <option value="2">2nd Year B.Sc.</option>
                        <option value="3">3rd Year B.Sc.</option>
                        <option value="4">4th Year B.Sc.</option>
                        <option value="msc">M.Sc. / Thesis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Semester
                      </label>
                      <select
                        value={String(semester)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSemester(val === 'all' ? 'all' : (Number(val) as 1 | 2));
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="1">Semester I</option>
                        <option value="2">Semester II</option>
                        <option value="all">Full Year / Both</option>
                      </select>
                    </div>
                  </div>

                  {/* 4. Course Code & Title */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Department Course
                    </label>
                    <select
                      value={selectedCourseCode}
                      onChange={(e) => setSelectedCourseCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-1 focus:ring-emerald-600 truncate"
                    >
                      {availableCoursesForAdd.map((c) => (
                        <option key={c.id} value={c.code}>
                          {c.code} · {c.title}
                        </option>
                      ))}
                      <option value="CUSTOM">Other / Specialized Topic</option>
                    </select>

                    {selectedCourseCode === 'CUSTOM' && (
                      <input
                        type="text"
                        value={customCourseTitle}
                        onChange={(e) => setCustomCourseTitle(e.target.value)}
                        placeholder="Enter course title (e.g. Sundarbans Field Tour Handbook)"
                        className="mt-2 w-full px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                      />
                    )}
                  </div>

                  {/* 5. Resource Category & Exam Term */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Resource Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:ring-1 focus:ring-emerald-600"
                      >
                        <option value="slides">Lecture Slides</option>
                        <option value="notes">Class Notes / Handouts</option>
                        <option value="pyq">Previous Year Questions (PYQs)</option>
                        <option value="practical">Lab & Field Manual</option>
                        <option value="book">Reference Book</option>
                        <option value="syllabus">Syllabus / Guide</option>
                      </select>
                    </div>

                    {category === 'pyq' ? (
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Exam Term
                        </label>
                        <select
                          value={examTerm}
                          onChange={(e) => setExamTerm(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                        >
                          <option value="final">Semester Final Exam</option>
                          <option value="midterm">Midterm Examination</option>
                          <option value="quiz">Class Quiz / Assessment</option>
                          <option value="all">Compiled All Exams</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                          Academic Session / Year
                        </label>
                        <input
                          type="text"
                          value={sessionYear}
                          onChange={(e) => setSessionYear(e.target.value)}
                          placeholder="e.g. 2023-2024"
                          className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* 6. Teacher, Path, Keywords & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Teacher / Contributor
                      </label>
                      <input
                        type="text"
                        value={authorOrTeacher}
                        onChange={(e) => setAuthorOrTeacher(e.target.value)}
                        placeholder="e.g. Course Teacher or CR 28th Batch"
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        Folder Path (Optional)
                      </label>
                      <input
                        type="text"
                        value={addPath}
                        onChange={(e) => setAddPath(e.target.value)}
                        placeholder="e.g. Google Drive / Year 2 / Sem 1 / FES 211"
                        className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Search Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={addKeywords}
                      onChange={(e) => setAddKeywords(e.target.value)}
                      placeholder="e.g. Nursery, Regeneration, Seedling, Silviculture"
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Brief Description / Topics Covered
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Topics covered, exam hints, etc."
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!parsedDrive.valid}
                      className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Add Resource to Department Library</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: BACKUP, RESTORE & PIN */}
              {activeTab === 'backup' && (
                <div className="space-y-6 max-w-xl mx-auto">
                  
                  {/* Backup Card */}
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 space-y-3">
                    <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs">
                      <Download className="w-4 h-4 text-emerald-700" />
                      <span>Download Archive Backup</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      Export all {resources.length} study items into a portable <code className="text-emerald-700 font-mono">.json</code> file. You can save this on your personal Google Drive or laptop to ensure the department's links are never lost.
                    </p>
                    <button
                      onClick={() => exportLibraryToJson(resources)}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export sust-fes-library-backup.json</span>
                    </button>
                  </div>

                  {/* Restore Card */}
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 space-y-3">
                    <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs">
                      <Upload className="w-4 h-4 text-teal-700" />
                      <span>Restore / Import Backup</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      Upload a previously exported JSON backup file to instantly reload or restore documents.
                    </p>

                    <div>
                      <label 
                        htmlFor={fileInputId}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Select Backup File (.json)</span>
                      </label>
                      <input
                        id={fileInputId}
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {importStatus && (
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-2">
                        {importStatus}
                      </p>
                    )}
                  </div>

                  {/* Reset to Defaults */}
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 space-y-3">
                    <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs">
                      <RefreshCw className="w-4 h-4 text-stone-600" />
                      <span>Reset to Official Curriculum Defaults</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      Re-seeds the library with the official SUST FES syllabus course list and representative lecture/PYQ links.
                    </p>

                    {showResetConfirm ? (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-lg space-y-2">
                        <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                          Are you sure you want to restore the official default archive? Any custom additions will be replaced.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleConfirmReset}
                            className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-semibold"
                          >
                            Yes, Reset Library
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowResetConfirm(false)}
                            className="px-3 py-1 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="px-3 py-1.5 border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        Restore Default Archive
                      </button>
                    )}
                  </div>

                  {/* Change PIN Card */}
                  <form onSubmit={handleChangePin} className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 space-y-3">
                    <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-xs">
                      <Key className="w-4 h-4 text-amber-600" />
                      <span>Change Administrator PIN</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="New PIN (min 4 chars)"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs font-mono"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        Update PIN
                      </button>
                    </div>

                    {pinSuccessMsg && (
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {pinSuccessMsg}
                      </p>
                    )}
                    {pinErrorMsg && (
                      <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                        {pinErrorMsg}
                      </p>
                    )}
                  </form>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
