import React, { useState, useId, useMemo, useRef, useEffect } from 'react';
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
  CheckSquare,
  Square
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
  const [sessionYear, setSessionYear] = useState('2025-26');
  const [authorOrTeacher, setAuthorOrTeacher] = useState('');
  const [description, setDescription] = useState('');
  const [examTerm, setExamTerm] = useState<'midterm' | 'final' | 'quiz' | 'all'>('final');
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
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, []);

  const scheduleTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

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
    };

    onUpdateResource(updatedResource);
    setEditSuccessMsg(`Successfully updated "${updatedResource.title}"!`);
    scheduleTimeout(() => {
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
      createdAt: new Date().toISOString(),
    };

    onAddResource(newResource);
    setAddSuccessMsg(`"${newResource.title}" added to the library!`);

    // Reset fields
    setDriveUrl('');
    setTitle('');
    setDescription('');
    scheduleTimeout(() => setAddSuccessMsg(''), 4000);
  };

  // Manage Filtered List
  const filteredManageResources = useMemo(() => {
    return resources.filter((r) => {
      if (!r) return false;
      if (manageSearch.trim()) {
        const q = manageSearch.toLowerCase().trim();
        const matches = 
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.courseCode && r.courseCode.toLowerCase().includes(q)) ||
          (r.courseTitle && r.courseTitle.toLowerCase().includes(q)) ||
          (r.authorOrTeacher && r.authorOrTeacher.toLowerCase().includes(q)) ||
          (r.description && r.description.toLowerCase().includes(q));
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
    scheduleTimeout(() => setImportStatus(null), 4000);
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
    scheduleTimeout(() => setImportStatus(null), 5000);
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinErrorMsg('');
    if (newPin.trim().length >= 4) {
      setStoredAdminPin(newPin.trim());
      setPinSuccessMsg('Admin PIN updated successfully!');
      setNewPin('');
      scheduleTimeout(() => setPinSuccessMsg(''), 3000);
    } else {
      setPinErrorMsg('PIN must be at least 4 characters long.');
      scheduleTimeout(() => setPinErrorMsg(''), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#19382B]/80 animate-fade-in">
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-lg shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-[#19382B] dark:text-[#F3F1E8] transition-colors">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 bg-[#EAE7DA] dark:bg-[#142D22] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-[#42684D] text-[#FAF9F4]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-editorial text-lg font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                  Manage Department Library
                </h2>
                <span className="px-2 py-0.5 rounded-sm bg-[#FAF9F4] dark:bg-[#19382B] text-[#42684D] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-[11px] font-mono font-semibold">
                  {resources.length} Materials
                </span>
              </div>
              <p className="text-xs text-[#42684D] dark:text-[#BBC4A6]/80">
                Edit, categorize, and organize Google Drive links & curriculum resources
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#FAF9F4] dark:hover:bg-[#19382B] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gate if not logged in */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-lg bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-[#42684D] dark:text-[#8A9C74] flex items-center justify-center mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="font-editorial text-xl font-semibold mb-2 text-[#19382B] dark:text-[#F3F1E8]">Departmental Access Key</h3>
            <p className="text-sm text-[#42684D] dark:text-[#BBC4A6]/80 mb-6">
              Enter the administrator PIN to edit, add, or manage course materials in the departmental library.
            </p>

            <form onSubmit={handlePinSubmit} className="w-full space-y-4">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter PIN (Default: sustfes)"
                  className="w-full px-4 py-2.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-center font-mono text-base tracking-widest focus:border-[#42684D] focus:outline-none"
                  autoFocus
                />
                {pinError && (
                  <p className="text-xs text-[#987453] mt-2 font-semibold">
                    {pinError}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] font-semibold text-sm rounded-md transition-colors cursor-pointer"
                >
                  Unlock Management Section
                </button>

                <button
                  type="button"
                  onClick={handleQuickUnlock}
                  className="w-full py-2 bg-[#EAE7DA] dark:bg-[#142D22] hover:border-[#42684D] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-[#19382B] dark:text-[#F3F1E8] font-medium text-xs rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                  <span>One-Click Quick Access (Default: sustfes)</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Tabs */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 px-6 gap-6 bg-[#FAF9F4] dark:bg-[#19382B] shrink-0 overflow-x-auto no-scrollbar">
              <button
                onClick={() => {
                  setActiveTab('manage');
                  setEditingResource(null);
                }}
                className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'manage'
                    ? 'border-[#42684D] text-[#19382B] dark:border-[#8A9C74] dark:text-[#F3F1E8]'
                    : 'border-transparent text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
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
                className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'add'
                    ? 'border-[#42684D] text-[#19382B] dark:border-[#8A9C74] dark:text-[#F3F1E8]'
                    : 'border-transparent text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
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
                className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === 'backup'
                    ? 'border-[#42684D] text-[#19382B] dark:border-[#8A9C74] dark:text-[#F3F1E8]'
                    : 'border-transparent text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8]'
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
                      <div className="flex items-center justify-between pb-3 border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingResource(null)}
                            className="p-1.5 rounded-md text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] transition-colors cursor-pointer"
                            title="Back to list"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                                Edit Course Material
                              </h3>
                              <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-[#EAE7DA] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 font-semibold">
                                {editingResource.courseCode}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#42684D] dark:text-[#BBC4A6]/80">
                              Modify title, curriculum category, Drive link, and topics
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditingResource(null)}
                          className="text-xs text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Success / Error Messages */}
                      {editSuccessMsg && (
                        <div className="p-3 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#42684D] text-[#19382B] dark:text-[#F3F1E8] text-xs font-medium flex items-center gap-2">
                          <Check className="w-4 h-4 shrink-0 text-[#42684D] dark:text-[#8A9C74]" />
                          <span>{editSuccessMsg}</span>
                        </div>
                      )}

                      {editFormError && (
                        <div className="p-3 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453]/60 text-[#987453] dark:text-[#F3F1E8] text-xs font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-[#987453]" />
                          <span>{editFormError}</span>
                        </div>
                      )}

                      {/* Edit Form */}
                      <form onSubmit={handleSaveEdit} className="space-y-4">
                        {/* 1. Title */}
                        <div>
                          <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                            Document / Material Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="e.g. FES 211 Silviculture: Nursery Management Slides"
                            className="w-full px-3.5 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                          />
                        </div>

                        {/* 2. Google Drive URL */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                              Google Drive or Share URL *
                            </label>
                            {editDriveUrl.trim() && (
                              <a
                                href={editDriveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-[#42684D] dark:text-[#8A9C74] hover:underline inline-flex items-center gap-1"
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
                            className="w-full px-3.5 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs font-mono focus:border-[#42684D] focus:outline-none"
                          />
                          {editDriveUrl.trim() && (
                            <div className="mt-1.5 text-[11px]">
                              {parsedEditDrive.valid ? (
                                <span className="text-[#42684D] dark:text-[#8A9C74] font-medium">
                                  ✓ Valid link ({parsedEditDrive.fileType.toUpperCase()}) · File ID: {parsedEditDrive.fileId}
                                </span>
                              ) : (
                                <span className="text-[#987453]">
                                  ⚠ Note: {parsedEditDrive.errorMessage}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 3. Year & Semester Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                              Academic Year
                            </label>
                            <select
                              value={String(editYear)}
                              onChange={(e) => {
                                const val = e.target.value;
                                handleEditYearChange(val === 'msc' ? 'msc' : (Number(val) as AcademicYear));
                              }}
                              className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                            >
                              <option value="1">1st Year B.Sc.</option>
                              <option value="2">2nd Year B.Sc.</option>
                              <option value="3">3rd Year B.Sc.</option>
                              <option value="4">4th Year B.Sc.</option>
                              <option value="msc">M.Sc. / Thesis</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                              Semester
                            </label>
                            <select
                              value={String(editSemester)}
                              onChange={(e) => {
                                const val = e.target.value;
                                setEditSemester(val === 'all' ? 'all' : (Number(val) as 1 | 2));
                              }}
                              className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                            >
                              <option value="1">Semester I</option>
                              <option value="2">Semester II</option>
                              <option value="all">Full Year / Both</option>
                            </select>
                          </div>
                        </div>

                        {/* 4. Course Code & Title */}
                        <div>
                          <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
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
                            className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none truncate"
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
                              className="mt-2 w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                            />
                          )}
                        </div>

                        {/* 5. Category & Exam Term / Session */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                              Resource Category
                            </label>
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value as ResourceCategory)}
                              className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
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
                              <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                                Exam Term
                              </label>
                              <select
                                value={editExamTerm}
                                onChange={(e) => setEditExamTerm(e.target.value as 'midterm' | 'final' | 'quiz' | 'all')}
                                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                              >
                                <option value="final">Semester Final Exam</option>
                                <option value="midterm">Midterm Examination</option>
                                <option value="quiz">Class Quiz / Assessment</option>
                                <option value="all">Compiled All Exams</option>
                              </select>
                            </div>
                          ) : (
                            <div>
                              <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                                Academic Session / Year
                              </label>
                              <input
                                type="text"
                                value={editSessionYear}
                                onChange={(e) => setEditSessionYear(e.target.value)}
                                placeholder="e.g. 2025-26"
                                className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                              />
                            </div>
                          )}
                        </div>

                        {/* 6. Teacher */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                              Teacher / Contributor
                            </label>
                            <input
                              type="text"
                              value={editAuthor}
                              onChange={(e) => setEditAuthor(e.target.value)}
                              placeholder="e.g. Prof. Dr. A. Rahman or CR FES28"
                              className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* 8. Description */}
                        <div>
                          <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                            Description / Topics Covered
                          </label>
                          <textarea
                            rows={3}
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Add brief summary, chapters covered, or exam focus areas..."
                            className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                          />
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
                          <button
                            type="button"
                            onClick={() => setEditingResource(null)}
                            className="px-4 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 text-xs font-semibold text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-md bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
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
                          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A9C74]" />
                          <input
                            type="text"
                            value={manageSearch}
                            onChange={(e) => setManageSearch(e.target.value)}
                            placeholder="Search by title, course code, path, or keyword..."
                            className="w-full pl-9 pr-8 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                          />
                          {manageSearch && (
                            <button
                              onClick={() => setManageSearch('')}
                              className="absolute right-2.5 top-2.5 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] cursor-pointer"
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
                            className="px-2.5 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs shrink-0 focus:border-[#42684D] focus:outline-none"
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
                            onChange={(e) => setFilterCategory(e.target.value as ResourceCategory | 'all')}
                            className="px-2.5 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs shrink-0 focus:border-[#42684D] focus:outline-none"
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
                            className="px-3 py-2 bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] rounded-md text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>Add Material</span>
                          </button>
                        </div>
                      </div>

                      {/* Header summary & Bulk actions */}
                      <div className="flex items-center justify-between text-xs px-1 text-[#42684D] dark:text-[#BBC4A6]">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="hover:text-[#19382B] dark:hover:text-[#F3F1E8] flex items-center gap-1 font-medium cursor-pointer"
                          >
                            {selectedIds.length === filteredManageResources.length && filteredManageResources.length > 0 ? (
                              <CheckSquare className="w-3.5 h-3.5 text-[#42684D] dark:text-[#8A9C74]" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-[#8A9C74]" />
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
                            <span className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                              {selectedIds.length} selected
                            </span>
                            <button
                              type="button"
                              onClick={handleBatchDelete}
                              className="px-2.5 py-1 bg-[#987453] hover:bg-[#19382B] text-[#FAF9F4] rounded-sm text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete Selected</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Table / Material Rows */}
                      <div className="border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 rounded-lg overflow-hidden bg-[#FAF9F4] dark:bg-[#142D22]">
                        <div className="max-h-[52vh] overflow-y-auto divide-y divide-[#BBC4A6]/40 dark:divide-[#BBC4A6]/15">
                          {filteredManageResources.length === 0 ? (
                            <div className="p-8 text-center">
                              <AlertCircle className="w-8 h-8 text-[#8A9C74] mx-auto mb-2" />
                              <p className="text-xs font-semibold text-[#42684D] dark:text-[#BBC4A6]">
                                No course materials match the current filters.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setManageSearch('');
                                  setFilterYear('all');
                                  setFilterCategory('all');
                                }}
                                className="mt-2 text-xs text-[#42684D] dark:text-[#8A9C74] hover:underline cursor-pointer"
                              >
                                Reset search and filters
                              </button>
                            </div>
                          ) : (
                            filteredManageResources.map((item) => (
                              <div
                                key={item.id}
                                className={`p-3.5 hover:bg-[#EAE7DA]/60 dark:hover:bg-[#19382B]/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                  selectedIds.includes(item.id) ? 'bg-[#EAE7DA]/70 dark:bg-[#19382B]/80' : ''
                                }`}
                              >
                                {/* Left: Selection checkbox + course info */}
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSelectId(item.id)}
                                    className="mt-1 text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] shrink-0 cursor-pointer"
                                  >
                                    {selectedIds.includes(item.id) ? (
                                      <CheckSquare className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                                    ) : (
                                      <Square className="w-4 h-4" />
                                    )}
                                  </button>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className="font-mono font-semibold text-xs px-2 py-0.5 rounded-sm bg-[#EAE7DA] dark:bg-[#19382B] text-[#42684D] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
                                        {item.courseCode}
                                      </span>
                                      <span className="text-[11px] px-2 py-0.5 rounded-sm bg-[#F3F1E8] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] border border-[#BBC4A6]/50 dark:border-[#BBC4A6]/15 capitalize font-medium">
                                        {item.category === 'pyq' ? 'PYQ' : item.category}
                                      </span>
                                      <span className="text-[11px] text-[#8A9C74]">
                                        {item.year === 'msc' ? 'M.Sc.' : `Year ${item.year}`} · Sem {item.semester}
                                      </span>
                                      {item.sessionYear && (
                                        <span className="text-[11px] text-[#987453] dark:text-[#BBC4A6] font-mono">
                                          ({item.sessionYear})
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] truncate">
                                      {item.title}
                                    </h4>
                                  </div>
                                </div>

                                {/* Right: Action buttons (Edit, Link, Duplicate, Delete) */}
                                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                                  {deleteConfirmId === item.id ? (
                                    <div className="flex items-center gap-1.5 bg-[#EAE7DA] dark:bg-[#19382B] p-1 rounded-md border border-[#987453]/60 animate-fade-in">
                                      <span className="text-[10px] font-semibold text-[#987453] pl-1">
                                        Delete?
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          onDeleteResource(item.id);
                                          setDeleteConfirmId(null);
                                        }}
                                        className="px-2 py-0.5 bg-[#987453] hover:bg-[#19382B] text-[#FAF9F4] rounded-sm text-[10px] font-semibold cursor-pointer"
                                      >
                                        Yes
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="px-2 py-0.5 bg-[#F3F1E8] dark:bg-[#142D22] text-[#42684D] dark:text-[#BBC4A6] rounded-sm text-[10px] cursor-pointer"
                                      >
                                        No
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      {/* EDIT BUTTON */}
                                      <button
                                        type="button"
                                        onClick={() => handleStartEdit(item)}
                                        className="px-2.5 py-1.5 rounded-md bg-[#EAE7DA] dark:bg-[#19382B] hover:border-[#42684D] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20 text-[#19382B] dark:text-[#F3F1E8] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
                                        className="p-1.5 rounded-md text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] transition-colors"
                                        title="Redirect to Google Drive"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>

                                      {/* Duplicate / Clone */}
                                      <button
                                        type="button"
                                        onClick={() => handleDuplicate(item)}
                                        className="p-1.5 rounded-md text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] transition-colors cursor-pointer"
                                        title="Duplicate as template"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Delete */}
                                      <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(item.id)}
                                        className="p-1.5 rounded-md text-[#8A9C74] hover:text-[#987453] hover:bg-[#EAE7DA] dark:hover:bg-[#19382B] transition-colors cursor-pointer"
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
                    <div className="p-3 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#42684D] text-[#19382B] dark:text-[#F3F1E8] text-xs font-medium flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0 text-[#42684D] dark:text-[#8A9C74]" />
                      <span>{addSuccessMsg}</span>
                    </div>
                  )}

                  {formError && (
                    <div className="p-3 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453]/60 text-[#987453] dark:text-[#F3F1E8] text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-[#987453]" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* 1. Google Drive URL */}
                  <div>
                    <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                      Google Drive Link or Document Share URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="Paste any link: https://drive.google.com/file/d/..."
                      className="w-full px-3.5 py-2.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                    />

                    {driveUrl.trim() && (
                      <div className="mt-2 text-xs">
                        {parsedDrive.valid ? (
                          <div className="p-2.5 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#42684D] text-[#19382B] dark:text-[#F3F1E8] flex items-start gap-2">
                            <Check className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74] shrink-0 mt-0.5" />
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
                          <div className="p-2.5 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453]/60 text-[#987453] dark:text-[#F3F1E8] flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-[#987453] shrink-0" />
                            <span>{parsedDrive.errorMessage}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 2. Resource Title */}
                  <div>
                    <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                      Resource Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. FES 211: Silviculture Nursery Management & Tending Slides"
                      className="w-full px-3.5 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                    />
                  </div>

                  {/* 3. Year & Semester Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                        Academic Year
                      </label>
                      <select
                        value={String(year)}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleYearChange(val === 'msc' ? 'msc' : (Number(val) as AcademicYear));
                        }}
                        className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                      >
                        <option value="1">1st Year B.Sc.</option>
                        <option value="2">2nd Year B.Sc.</option>
                        <option value="3">3rd Year B.Sc.</option>
                        <option value="4">4th Year B.Sc.</option>
                        <option value="msc">M.Sc. / Thesis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                        Semester
                      </label>
                      <select
                        value={String(semester)}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSemester(val === 'all' ? 'all' : (Number(val) as 1 | 2));
                        }}
                        className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                      >
                        <option value="1">Semester I</option>
                        <option value="2">Semester II</option>
                        <option value="all">Full Year / Both</option>
                      </select>
                    </div>
                  </div>

                  {/* 4. Course Code & Title */}
                  <div>
                    <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                      Department Course
                    </label>
                    <select
                      value={selectedCourseCode}
                      onChange={(e) => setSelectedCourseCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none truncate"
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
                        className="mt-2 w-full px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                      />
                    )}
                  </div>

                  {/* 5. Resource Category & Exam Term */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                        Resource Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as ResourceCategory)}
                        className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
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
                        <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                          Exam Term
                        </label>
                        <select
                          value={examTerm}
                          onChange={(e) => setExamTerm(e.target.value as 'midterm' | 'final' | 'quiz' | 'all')}
                          className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                        >
                          <option value="final">Semester Final Exam</option>
                          <option value="midterm">Midterm Examination</option>
                          <option value="quiz">Class Quiz / Assessment</option>
                          <option value="all">Compiled All Exams</option>
                        </select>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                          Academic Session / Year
                        </label>
                        <input
                          type="text"
                          value={sessionYear}
                          onChange={(e) => setSessionYear(e.target.value)}
                          placeholder="e.g. 2025-26"
                          className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* 6. Teacher & Description */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                        Teacher / Contributor
                      </label>
                      <input
                        type="text"
                        value={authorOrTeacher}
                        onChange={(e) => setAuthorOrTeacher(e.target.value)}
                        placeholder="e.g. Course Teacher or CR FES28"
                        className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                      Brief Description / Topics Covered
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Topics covered, exam hints, etc."
                      className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#142D22] text-[#19382B] dark:text-[#F3F1E8] text-xs focus:border-[#42684D] focus:outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={!parsedDrive.valid}
                      className="w-full py-2.5 bg-[#42684D] hover:bg-[#19382B] disabled:opacity-50 disabled:cursor-not-allowed text-[#FAF9F4] font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                  <div className="p-4 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22] space-y-3">
                    <div className="flex items-center gap-2 text-[#19382B] dark:text-[#F3F1E8] font-semibold text-xs">
                      <Download className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                      <span>Download Archive Backup</span>
                    </div>
                    <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] leading-relaxed">
                      Export all {resources.length} study items into a portable <code className="text-[#19382B] dark:text-[#F3F1E8] font-mono">.json</code> file. You can save this on your personal Google Drive or laptop to ensure the department's links are never lost.
                    </p>
                    <button
                      onClick={() => exportLibraryToJson(resources)}
                      className="px-4 py-2 bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] rounded-md text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export sust-fes-library-backup.json</span>
                    </button>
                  </div>

                  {/* Restore Card */}
                  <div className="p-4 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22] space-y-3">
                    <div className="flex items-center gap-2 text-[#19382B] dark:text-[#F3F1E8] font-semibold text-xs">
                      <Upload className="w-4 h-4 text-[#42684D] dark:text-[#8A9C74]" />
                      <span>Restore / Import Backup</span>
                    </div>
                    <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] leading-relaxed">
                      Upload a previously exported JSON backup file to instantly reload or restore documents.
                    </p>

                    <div>
                      <label 
                        htmlFor={fileInputId}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#19382B] dark:bg-[#42684D] hover:bg-[#42684D] dark:hover:bg-[#8A9C74] text-[#FAF9F4] rounded-md text-xs font-semibold cursor-pointer transition-colors"
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
                      <p className="text-xs font-medium text-[#42684D] dark:text-[#8A9C74] mt-2">
                        {importStatus}
                      </p>
                    )}
                  </div>

                  {/* Reset to Defaults */}
                  <div className="p-4 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22] space-y-3">
                    <div className="flex items-center gap-2 text-[#19382B] dark:text-[#F3F1E8] font-semibold text-xs">
                      <RefreshCw className="w-4 h-4 text-[#987453]" />
                      <span>Reset to Official Curriculum Defaults</span>
                    </div>
                    <p className="text-xs text-[#42684D] dark:text-[#BBC4A6]">
                      Re-seeds the library with the official SUST FES syllabus course list and representative lecture/PYQ links.
                    </p>

                    {showResetConfirm ? (
                      <div className="p-3 bg-[#EAE7DA] dark:bg-[#19382B] border border-[#987453]/60 rounded-md space-y-2">
                        <p className="text-xs text-[#987453] dark:text-[#F3F1E8] font-medium">
                          Are you sure you want to restore the official default archive? Any custom additions will be replaced.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleConfirmReset}
                            className="px-3 py-1 bg-[#987453] hover:bg-[#19382B] text-[#FAF9F4] rounded-sm text-xs font-semibold cursor-pointer"
                          >
                            Yes, Reset Library
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowResetConfirm(false)}
                            className="px-3 py-1 bg-[#FAF9F4] dark:bg-[#142D22] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/25 text-[#42684D] dark:text-[#BBC4A6] rounded-sm text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="px-3 py-1.5 border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 hover:border-[#987453] text-[#19382B] dark:text-[#F3F1E8] rounded-md text-xs font-medium transition-colors cursor-pointer"
                      >
                        Restore Default Archive
                      </button>
                    )}
                  </div>

                  {/* Change PIN Card */}
                  <form onSubmit={handleChangePin} className="p-4 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#F3F1E8] dark:bg-[#142D22] space-y-3">
                    <div className="flex items-center gap-2 text-[#19382B] dark:text-[#F3F1E8] font-semibold text-xs">
                      <Key className="w-4 h-4 text-[#987453]" />
                      <span>Change Administrator PIN</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="New PIN (min 4 chars)"
                        className="flex-1 px-3 py-1.5 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] text-xs font-mono focus:border-[#42684D] focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-[#42684D] hover:bg-[#19382B] text-[#FAF9F4] rounded-md text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Update PIN
                      </button>
                    </div>

                    {pinSuccessMsg && (
                      <p className="text-xs font-medium text-[#42684D] dark:text-[#8A9C74]">
                        {pinSuccessMsg}
                      </p>
                    )}
                    {pinErrorMsg && (
                      <p className="text-xs font-medium text-[#987453]">
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
