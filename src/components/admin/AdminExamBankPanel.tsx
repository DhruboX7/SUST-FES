import React, { useState, useMemo } from 'react';
import { ResourceItem, AcademicYear, FileType } from '../../types';
import { SUST_FES_COURSES } from '../../data/coursesData';
import { parseGoogleDriveUrl, guessFileType } from '../../utils/driveParser';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Check, 
  X, 
  AlertCircle,
  CheckSquare,
  Square
} from 'lucide-react';

interface AdminExamBankPanelProps {
  resources: ResourceItem[];
  onAddResource: (resource: ResourceItem) => void;
  onUpdateResource: (resource: ResourceItem) => void;
  onDeleteResource: (id: string) => void;
}

export const AdminExamBankPanel: React.FC<AdminExamBankPanelProps> = ({
  resources,
  onAddResource,
  onUpdateResource,
  onDeleteResource,
}) => {
  const [search, setSearch] = useState('');
  const [filterYear, setFilterYear] = useState<AcademicYear | 'all'>('all');
  const [filterSemester, setFilterSemester] = useState<1 | 2 | 'all'>('all');
  const [filterTerm, setFilterTerm] = useState<'midterm' | 'final' | 'quiz' | 'all'>('all');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ResourceItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [courseCode, setCourseCode] = useState('FES 08211121');
  const [customTitle, setCustomTitle] = useState('');
  const [year, setYear] = useState<AcademicYear>(1);
  const [semester, setSemester] = useState<1 | 2 | 'all'>(1);
  const [examTerm, setExamTerm] = useState<'midterm' | 'final' | 'quiz' | 'all'>('final');
  const [sessionYear, setSessionYear] = useState('2025-26');
  const [driveUrl, setDriveUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // All PYQ resources
  const pyqItems = useMemo(() => {
    return (Array.isArray(resources) ? resources : []).filter((r) => r && r.category === 'pyq');
  }, [resources]);

  const filteredItems = useMemo(() => {
    const q = search.toLowerCase();
    return pyqItems.filter((item) => {
      if (!item) return false;
      const matchSearch =
        !q ||
        (item.title || '').toLowerCase().includes(q) ||
        (item.courseCode || '').toLowerCase().includes(q) ||
        (item.courseTitle || '').toLowerCase().includes(q) ||
        (item.sessionYear || '').toLowerCase().includes(q);

      const matchYear = filterYear === 'all' || item.year === filterYear;
      const matchSemester = filterSemester === 'all' || item.semester === filterSemester;
      const matchTerm = filterTerm === 'all' || (item.examTerm || 'final') === filterTerm;

      return matchSearch && matchYear && matchSemester && matchTerm;
    });
  }, [pyqItems, search, filterYear, filterSemester, filterTerm]);

  const handleOpenAdd = () => {
    setCourseCode('FES 08211121');
    const matched = SUST_FES_COURSES.find((c) => c.code === 'FES 08211121');
    setCustomTitle(matched ? `${matched.code} Final Exam Paper` : 'Examination Question');
    setYear(1);
    setSemester(1);
    setExamTerm('final');
    setSessionYear('2025-26');
    setDriveUrl('');
    setAuthor('Dept. Exam Archive');
    setDescription('');
    setFormError('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: ResourceItem) => {
    setEditingItem(item);
    setCourseCode(item.courseCode || 'FES 08211121');
    setCustomTitle(item.title || '');
    setYear(item.year || 1);
    setSemester(item.semester || 1);
    setExamTerm(item.examTerm || 'final');
    setSessionYear(item.sessionYear || '2025-26');
    setDriveUrl(item.driveUrl || '');
    setAuthor(item.authorOrTeacher || '');
    setDescription(item.description || '');
    setFormError('');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!driveUrl.trim()) {
      setFormError('Please enter a Google Drive link or PDF download URL.');
      return;
    }

    const driveInfo = parseGoogleDriveUrl(driveUrl);
    const resolvedTitle = customTitle.trim() || `${courseCode} Examination Paper`;
    const matchedCourse = SUST_FES_COURSES.find((c) => c.code === courseCode);

    const newItem: ResourceItem = {
      id: `pyq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: resolvedTitle,
      courseCode,
      courseTitle: matchedCourse ? matchedCourse.title : resolvedTitle,
      year,
      semester,
      category: 'pyq',
      driveUrl: driveUrl.trim(),
      fileId: driveInfo.fileId || '',
      fileType: driveInfo.fileType || guessFileType(driveUrl, 'pyq'),
      previewUrl: driveInfo.previewUrl || driveUrl.trim(),
      downloadUrl: driveInfo.downloadUrl || driveUrl.trim(),
      sessionYear: sessionYear.trim(),
      authorOrTeacher: author.trim() || 'Dept. Exam Archive',
      description: description.trim(),
      examTerm,
      createdAt: new Date().toISOString(),
    };

    onAddResource(newItem);
    setIsAddOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setFormError('');

    if (!driveUrl.trim()) {
      setFormError('Please enter a Google Drive link or PDF URL.');
      return;
    }

    const driveInfo = parseGoogleDriveUrl(driveUrl);
    const matchedCourse = SUST_FES_COURSES.find((c) => c.code === courseCode);

    const updated: ResourceItem = {
      ...editingItem,
      title: customTitle.trim() || editingItem.title,
      courseCode,
      courseTitle: matchedCourse ? matchedCourse.title : editingItem.courseTitle,
      year,
      semester,
      category: 'pyq',
      driveUrl: driveUrl.trim(),
      fileId: driveInfo.fileId || editingItem.fileId,
      fileType: driveInfo.fileType || editingItem.fileType,
      previewUrl: driveInfo.previewUrl || driveUrl.trim(),
      downloadUrl: driveInfo.downloadUrl || driveUrl.trim(),
      sessionYear: sessionYear.trim(),
      authorOrTeacher: author.trim(),
      description: description.trim(),
      examTerm,
    };

    onUpdateResource(updated);
    setEditingItem(null);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleBatchDelete = () => {
    selectedIds.forEach((id) => onDeleteResource(id));
    setSelectedIds([]);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF9F4] dark:bg-[#19382B] p-4 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20">
        <div>
          <h3 className="text-base font-bold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#42684D] dark:text-[#BBC4A6]" />
            <span>Exam Question Bank Management (PYQ)</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-[#EAE7DA] text-[#19382B] dark:bg-[#142D22] dark:text-[#BBC4A6] border border-[#BBC4A6]/60 dark:border-[#BBC4A6]/20">
              {pyqItems.length} papers
            </span>
          </h3>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
            Administer previous semester midterm, final, and quiz examination questions by course code and academic session.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            deleteConfirmId === 'batch' ? (
              <div className="flex items-center gap-1.5 p-1 rounded-md bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453]/60 animate-in fade-in">
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="px-3 py-1 text-xs font-semibold bg-[#987453] hover:bg-[#19382B] text-[#F3F1E8] rounded-sm transition-colors shadow-xs cursor-pointer"
                >
                  Confirm Delete ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-1 text-[#42684D] hover:text-[#19382B] dark:text-[#BBC4A6] dark:hover:text-[#F3F1E8] cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDeleteConfirmId('batch')}
                className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#987453] hover:bg-[#19382B] text-[#F3F1E8] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )
          )}

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] text-[#F3F1E8] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Exam Paper</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A9C74]" />
          <input
            type="text"
            placeholder="Search course or session..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] focus:outline-hidden focus:ring-1 focus:ring-[#42684D]"
          />
        </div>

        <div>
          <select
            value={String(filterYear)}
            onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : (Number(e.target.value) as AcademicYear))}
            className="w-full px-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
          >
            <option value="all">All Academic Years</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>

        <div>
          <select
            value={String(filterSemester)}
            onChange={(e) => setFilterSemester(e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2))}
            className="w-full px-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
          >
            <option value="all">All Semesters</option>
            <option value="1">1st Semester</option>
            <option value="2">2nd Semester</option>
          </select>
        </div>

        <div>
          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
          >
            <option value="all">All Exam Terms</option>
            <option value="final">Final Term</option>
            <option value="midterm">Midterm Examination</option>
            <option value="quiz">Class Test / Quiz</option>
          </select>
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#EAE7DA] dark:bg-[#142D22] border-b border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 text-[#42684D] dark:text-[#BBC4A6] font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button onClick={handleSelectAll} className="flex items-center text-[#42684D] dark:text-[#BBC4A6] cursor-pointer">
                    {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Course & Title</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Session & Term</th>
                <th className="py-3 px-4">Contributor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BBC4A6]/40 dark:divide-[#BBC4A6]/15">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8A9C74]">
                    No examination questions match your current filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#EAE7DA]/50 dark:hover:bg-[#142D22]/60 transition-colors">
                    <td className="py-3 px-4">
                      <button onClick={() => handleToggleSelect(item.id)} className="text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#BBC4A6] cursor-pointer">
                        {selectedIds.includes(item.id) ? (
                          <CheckSquare className="w-4 h-4 text-[#42684D] dark:text-[#BBC4A6]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">{item.title}</div>
                      <div className="text-[11px] font-mono text-[#42684D] dark:text-[#BBC4A6]">{item.courseCode} · {item.courseTitle}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#19382B] dark:text-[#F3F1E8]">
                      Year {item.year}, Sem {item.semester}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-[#19382B] dark:text-[#F3F1E8]">{item.sessionYear || '—'}</div>
                      <div className="text-[10px] uppercase font-bold text-[#987453] dark:text-[#BBC4A6]">{item.examTerm || 'final'}</div>
                    </td>
                    <td className="py-3 px-4 text-[#42684D] dark:text-[#BBC4A6] truncate max-w-[140px]">
                      {item.authorOrTeacher || 'Dept. Archive'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={item.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] rounded-sm hover:bg-[#EAE7DA] dark:hover:bg-[#142D22]"
                          title="Open Drive Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] rounded-sm hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                onDeleteResource(item.id);
                                setDeleteConfirmId(null);
                              }}
                              className="px-2 py-1 text-[10px] font-bold bg-[#987453] text-[#F3F1E8] rounded-sm cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-[#8A9C74] hover:text-[#987453] rounded-sm hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(isAddOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11261D]/85 animate-fade-in">
          <div className="bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-lg p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 pb-3">
              <h3 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                {editingItem ? 'Edit Exam Question Paper' : 'Add Past Year Question (PYQ)'}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingItem(null);
                }}
                className="p-1.5 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#987453]/60 rounded-md text-[#987453] dark:text-[#F3F1E8] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#987453]" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={editingItem ? handleSaveEdit : handleSaveAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                  Select Course Code
                </label>
                <select
                  value={courseCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setCourseCode(code);
                    const matched = SUST_FES_COURSES.find((c) => c.code === code);
                    if (matched) {
                      setYear(matched.year as AcademicYear);
                      setSemester(matched.semester === 'both' ? 1 : matched.semester);
                      if (!editingItem) {
                        setCustomTitle(`${matched.code} ${examTerm.toUpperCase()} Examination`);
                      }
                    }
                  }}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                >
                  {SUST_FES_COURSES.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} · {c.title} (Year {c.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                  Paper Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. FES 08211121 Final Exam 2023"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                    Year Level
                  </label>
                  <select
                    value={String(year)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setYear(val === 'msc' ? 'msc' : (Number(val) as AcademicYear));
                    }}
                    className="w-full px-2.5 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="msc">M.Sc.</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                    Semester
                  </label>
                  <select
                    value={String(semester)}
                    onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
                    className="w-full px-2.5 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                  >
                    <option value="1">1st Sem</option>
                    <option value="2">2nd Sem</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                    Exam Term
                  </label>
                  <select
                    value={examTerm}
                    onChange={(e) => setExamTerm(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                  >
                    <option value="final">Final Term</option>
                    <option value="midterm">Midterm</option>
                    <option value="quiz">Quiz / CT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    value={sessionYear}
                    onChange={(e) => setSessionYear(e.target.value)}
                    placeholder="2025-26"
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                    Uploaded / Provided By
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="CR FES28"
                    className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                  Google Drive or PDF URL
                </label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  required
                />
                <p className="text-[11px] text-[#8A9C74] mt-1">
                  Accepts Google Drive share links, preview URLs, or direct PDF links. Automatically parsed.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#19382B] dark:text-[#F3F1E8] mb-1">
                  Optional Notes / Paper Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contains Part A and Part B questions, total 70 marks..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 font-medium text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] text-[#F3F1E8] rounded-md transition-colors shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Save Changes' : 'Publish Question Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
