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
  Square,
  Sparkles
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
  const [sessionYear, setSessionYear] = useState('2023-2024');
  const [driveUrl, setDriveUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  // All PYQ resources
  const pyqItems = useMemo(() => {
    return resources.filter((r) => r.category === 'pyq');
  }, [resources]);

  const filteredItems = useMemo(() => {
    return pyqItems.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.courseCode.toLowerCase().includes(search.toLowerCase()) ||
        item.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
        (item.sessionYear && item.sessionYear.toLowerCase().includes(search.toLowerCase()));

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
    setSessionYear('2023-2024');
    setDriveUrl('');
    setAuthor('Dept. Exam Archive');
    setDescription('');
    setFormError('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (item: ResourceItem) => {
    setEditingItem(item);
    setCourseCode(item.courseCode);
    setCustomTitle(item.title);
    setYear(item.year);
    setSemester(item.semester);
    setExamTerm(item.examTerm || 'final');
    setSessionYear(item.sessionYear || '2023-2024');
    setDriveUrl(item.driveUrl);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Exam Question Bank Management (PYQ)</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {pyqItems.length} papers
            </span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Administer previous semester midterm, final, and quiz examination questions by course code and academic session.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Exam Paper</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search course or session..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={String(filterYear)}
            onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : (Number(e.target.value) as AcademicYear))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
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
            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
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
            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          >
            <option value="all">All Exam Terms</option>
            <option value="final">Final Term</option>
            <option value="midterm">Midterm Examination</option>
            <option value="quiz">Class Test / Quiz</option>
          </select>
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button onClick={handleSelectAll} className="flex items-center text-stone-500">
                    {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
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
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No examination questions match your current filters.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <button onClick={() => handleToggleSelect(item.id)} className="text-stone-400 hover:text-emerald-600">
                        {selectedIds.includes(item.id) ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{item.title}</div>
                      <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">{item.courseCode} · {item.courseTitle}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      Year {item.year}, Sem {item.semester}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-stone-700 dark:text-stone-300">{item.sessionYear || '—'}</div>
                      <div className="text-[10px] uppercase font-bold text-stone-500">{item.examTerm || 'final'}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400 truncate max-w-[140px]">
                      {item.authorOrTeacher || 'Dept. Archive'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={item.driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-stone-400 hover:text-emerald-600 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800"
                          title="Open Drive Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-stone-400 hover:text-blue-600 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800"
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
                              className="px-2 py-1 text-[10px] font-bold bg-rose-600 text-white rounded-md"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 text-stone-400 hover:text-stone-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {editingItem ? 'Edit Exam Question Paper' : 'Add Past Year Question (PYQ)'}
              </h3>
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingItem(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={editingItem ? handleSaveEdit : handleSaveAdd} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
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
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                >
                  {SUST_FES_COURSES.map((c) => (
                    <option key={c.id} value={c.code}>
                      {c.code} · {c.title} (Year {c.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Paper Title
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. FES 08211121 Final Exam 2023"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Year Level
                  </label>
                  <select
                    value={String(year)}
                    onChange={(e) => setYear(Number(e.target.value) as AcademicYear)}
                    className="w-full px-2.5 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Semester
                  </label>
                  <select
                    value={String(semester)}
                    onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
                    className="w-full px-2.5 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  >
                    <option value="1">1st Sem</option>
                    <option value="2">2nd Sem</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Exam Term
                  </label>
                  <select
                    value={examTerm}
                    onChange={(e) => setExamTerm(e.target.value as any)}
                    className="w-full px-2.5 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  >
                    <option value="final">Final Term</option>
                    <option value="midterm">Midterm</option>
                    <option value="quiz">Quiz / CT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Academic Session
                  </label>
                  <input
                    type="text"
                    value={sessionYear}
                    onChange={(e) => setSessionYear(e.target.value)}
                    placeholder="2023-2024"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Uploaded / Provided By
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="CR 29th Batch"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Google Drive or PDF URL
                </label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                  required
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Accepts Google Drive share links, preview URLs, or direct PDF links. Automatically parsed.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Optional Notes / Paper Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contains Part A and Part B questions, total 70 marks..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
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
