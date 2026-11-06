import React, { useState, useMemo } from 'react';
import { ThesisItem } from '../../types';
import { SUST_FES_FACULTY } from '../../data/coursesData';
import { 
  BookMarked, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  ExternalLink,
  GraduationCap,
  Calendar,
  User,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react';

interface AdminThesesPanelProps {
  theses: ThesisItem[];
  onUpdateTheses: (theses: ThesisItem[]) => void;
}

export const AdminThesesPanel: React.FC<AdminThesesPanelProps> = ({
  theses,
  onUpdateTheses,
}) => {
  const [search, setSearch] = useState('');
  const [filterDegree, setFilterDegree] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ThesisItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [supervisor, setSupervisor] = useState(SUST_FES_FACULTY[0]?.name || 'Prof. Dr. Mohammad Redowan');
  const [degree, setDegree] = useState<'B.Sc. (Honours)' | 'M.Sc.'>('B.Sc. (Honours)');
  const [year, setYear] = useState('2024');
  const [researchArea, setResearchArea] = useState('Forest Mensuration & Carbon Sequestration');
  const [abstract, setAbstract] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [formError, setFormError] = useState('');

  const filteredTheses = useMemo(() => {
    return theses.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase()) ||
        item.supervisor.toLowerCase().includes(search.toLowerCase()) ||
        item.researchArea.toLowerCase().includes(search.toLowerCase()) ||
        item.year.includes(search);
      const matchDegree = filterDegree === 'all' || item.degree === filterDegree;
      return matchSearch && matchDegree;
    });
  }, [theses, search, filterDegree]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setAuthor('');
    setSupervisor(SUST_FES_FACULTY[0]?.name || 'Prof. Dr. Mohammad Redowan');
    setDegree('B.Sc. (Honours)');
    setYear('2024');
    setResearchArea('Forest Ecology & Biodiversity Conservation');
    setAbstract('');
    setDriveUrl('https://drive.google.com');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ThesisItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setAuthor(item.author);
    setSupervisor(item.supervisor);
    setDegree(item.degree as any);
    setYear(item.year);
    setResearchArea(item.researchArea);
    setAbstract(item.abstract);
    setDriveUrl(item.driveUrl || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setFormError('Please enter thesis title and author name.');
      return;
    }

    if (editingItem) {
      const updated: ThesisItem = {
        ...editingItem,
        title: title.trim(),
        author: author.trim(),
        supervisor: supervisor.trim(),
        degree,
        year: year.trim(),
        researchArea: researchArea.trim(),
        abstract: abstract.trim(),
        driveUrl: driveUrl.trim() || undefined,
      };
      const newAll = theses.map((t) => (t.id === editingItem.id ? updated : t));
      onUpdateTheses(newAll);
    } else {
      const newItem: ThesisItem = {
        id: `th-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        author: author.trim(),
        supervisor: supervisor.trim(),
        degree,
        year: year.trim(),
        researchArea: researchArea.trim(),
        abstract: abstract.trim(),
        driveUrl: driveUrl.trim() || undefined,
      };
      onUpdateTheses([newItem, ...theses]);
    }

    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const updated = theses.filter((t) => t.id !== id);
    onUpdateTheses(updated);
    setDeleteConfirmId(null);
  };

  const handleBatchDelete = () => {
    const updated = theses.filter((t) => !selectedIds.includes(t.id));
    onUpdateTheses(updated);
    setSelectedIds([]);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <span>Undergraduate & Graduate Thesis Archive Management</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {theses.length} monographs
            </span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Administer completed B.Sc. (Honours) dissertations and M.Sc. postgraduate research projects.
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
            <span>Add Thesis Entry</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search thesis title, author, supervisor, or area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div>
          <select
            value={filterDegree}
            onChange={(e) => setFilterDegree(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
          >
            <option value="all">All Degrees (B.Sc. & M.Sc.)</option>
            <option value="B.Sc. (Honours)">B.Sc. (Honours)</option>
            <option value="M.Sc.">M.Sc. Postgraduate</option>
          </select>
        </div>
      </div>

      {/* Theses Data Table */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 text-stone-500 font-medium uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button
                    onClick={() => {
                      if (selectedIds.length === filteredTheses.length) {
                        setSelectedIds([]);
                      } else {
                        setSelectedIds(filteredTheses.map((t) => t.id));
                      }
                    }}
                    className="text-stone-500"
                  >
                    {selectedIds.length === filteredTheses.length && filteredTheses.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Title & Research Area</th>
                <th className="py-3 px-4">Author & Degree</th>
                <th className="py-3 px-4">Supervisor</th>
                <th className="py-3 px-4">Year</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {filteredTheses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No theses match your search filters.
                  </td>
                </tr>
              ) : (
                filteredTheses.map((item) => (
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
                      <div className="font-semibold text-stone-900 dark:text-stone-100 max-w-md line-clamp-2">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        {item.researchArea}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-900 dark:text-stone-100">{item.author}</div>
                      <div className="text-[10px] uppercase font-bold text-stone-400">{item.degree}</div>
                    </td>
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-300">
                      {item.supervisor}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.year}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.driveUrl && (
                          <a
                            href={item.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-stone-400 hover:text-emerald-600 rounded"
                            title="Open Document"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-stone-400 hover:text-blue-600 rounded"
                          title="Edit Thesis"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirmId === item.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="px-2 py-1 text-[10px] font-bold bg-rose-600 text-white rounded"
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
                            title="Delete Thesis"
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {editingItem ? 'Edit Thesis Entry' : 'Add New Thesis / Dissertation'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Dissertation Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Assessment of Above-Ground Biomass and Carbon Stocks..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Author / Student Name *
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Md. Tanvir Hasan"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Degree Level
                  </label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  >
                    <option value="B.Sc. (Honours)">B.Sc. (Honours)</option>
                    <option value="M.Sc.">M.Sc. Postgraduate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Faculty Supervisor
                  </label>
                  <select
                    value={supervisor}
                    onChange={(e) => setSupervisor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  >
                    {SUST_FES_FACULTY.map((fac) => (
                      <option key={fac.id} value={fac.name}>
                        {fac.name} ({fac.designation})
                      </option>
                    ))}
                    <option value="Other Faculty / Visiting Supervisor">Other Supervisor</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2024"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Research Area / Field of Specialization
                </label>
                <input
                  type="text"
                  value={researchArea}
                  onChange={(e) => setResearchArea(e.target.value)}
                  placeholder="e.g. Forest Mensuration & Carbon Sequestration"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Google Drive / Document Link
                </label>
                <input
                  type="url"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-stone-700 dark:text-stone-300">
                  Thesis Abstract / Executive Summary
                </label>
                <textarea
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Brief synopsis of methodology, findings, and ecological implications..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100"
                />
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
                  {editingItem ? 'Save Changes' : 'Archive Thesis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
