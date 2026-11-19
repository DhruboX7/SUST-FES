import React, { useState } from 'react';
import { ResourceItem, QuickLinkItem, ResourceCategory } from '../../types';
import { parseGoogleDriveUrl } from '../../utils/driveParser';
import { 
  Link2, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  AlertCircle,
  Globe,
  FileCheck,
  RefreshCw
} from 'lucide-react';

interface AdminLinksPanelProps {
  resources: ResourceItem[];
  quickLinks: QuickLinkItem[];
  onUpdateResource: (resource: ResourceItem) => void;
  onUpdateQuickLinks: (links: QuickLinkItem[]) => void;
}

export const AdminLinksPanel: React.FC<AdminLinksPanelProps> = ({
  resources,
  quickLinks,
  onUpdateResource,
  onUpdateQuickLinks,
}) => {
  const [activeSection, setActiveSection] = useState<'quicklinks' | 'resources'>('quicklinks');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ResourceCategory | 'all'>('all');

  // Quick Links State
  const [isAddLinkOpen, setIsAddLinkOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<QuickLinkItem | null>(null);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkCategory, setLinkCategory] = useState<QuickLinkItem['category']>('portal');
  const [linkDescription, setLinkDescription] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Resource Link Quick Edit
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [newDriveUrl, setNewDriveUrl] = useState('');

  // Link Test Results
  const [testedUrl, setTestedUrl] = useState<string | null>(null);

  // Quick Link Add / Edit
  const handleOpenAddLink = () => {
    setLinkTitle('');
    setLinkUrl('');
    setLinkCategory('portal');
    setLinkDescription('');
    setEditingLink(null);
    setIsAddLinkOpen(true);
  };

  const handleOpenEditLink = (item: QuickLinkItem) => {
    setEditingLink(item);
    setLinkTitle(item.title);
    setLinkUrl(item.url);
    setLinkCategory(item.category);
    setLinkDescription(item.description || '');
    setIsAddLinkOpen(true);
  };

  const handleSaveQuickLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    if (editingLink) {
      const updated = quickLinks.map((l) =>
        l.id === editingLink.id
          ? {
              ...l,
              title: linkTitle.trim(),
              url: linkUrl.trim(),
              category: linkCategory,
              description: linkDescription.trim(),
            }
          : l
      );
      onUpdateQuickLinks(updated);
    } else {
      const newLink: QuickLinkItem = {
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: linkTitle.trim(),
        url: linkUrl.trim(),
        category: linkCategory,
        description: linkDescription.trim(),
      };
      onUpdateQuickLinks([...quickLinks, newLink]);
    }

    setIsAddLinkOpen(false);
    setEditingLink(null);
  };

  const handleDeleteQuickLink = (id: string) => {
    const updated = quickLinks.filter((l) => l.id !== id);
    onUpdateQuickLinks(updated);
    setDeleteConfirmId(null);
  };

  // Resource Link Edit
  const handleOpenEditResource = (res: ResourceItem) => {
    setEditingResource(res);
    setNewDriveUrl(res.driveUrl);
  };

  const handleSaveResourceLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource || !newDriveUrl.trim()) return;

    const parsed = parseGoogleDriveUrl(newDriveUrl.trim());
    const updated: ResourceItem = {
      ...editingResource,
      driveUrl: newDriveUrl.trim(),
      fileId: parsed.fileId || editingResource.fileId,
      previewUrl: parsed.previewUrl || newDriveUrl.trim(),
      downloadUrl: parsed.downloadUrl || newDriveUrl.trim(),
    };

    onUpdateResource(updated);
    setEditingResource(null);
  };

  const q = search.toLowerCase();
  const filteredResources = (Array.isArray(resources) ? resources : []).filter((r) => {
    if (!r) return false;
    const matchSearch =
      !q ||
      (r.title || '').toLowerCase().includes(q) ||
      (r.courseCode || '').toLowerCase().includes(q) ||
      (r.driveUrl || '').toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Switcher & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF9F4] dark:bg-[#19382B] p-4 rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20">
        <div>
          <h3 className="text-base font-bold text-[#19382B] dark:text-[#F3F1E8] flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#42684D] dark:text-[#BBC4A6]" />
            <span>Link Management & Institutional URL Center</span>
          </h3>
          <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mt-0.5">
            Audit, update, and validate external portal links, Google Drive IDs, syllabus PDFs, and student contribution links.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center p-1 bg-[#EAE7DA] dark:bg-[#142D22] border border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 rounded-md text-xs">
            <button
              onClick={() => setActiveSection('quicklinks')}
              className={`px-3 py-1.5 font-medium rounded-sm transition-colors cursor-pointer ${
                activeSection === 'quicklinks'
                  ? 'bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] shadow-xs'
                  : 'text-[#42684D] dark:text-[#BBC4A6]'
              }`}
            >
              Institutional Links ({quickLinks.length})
            </button>
            <button
              onClick={() => setActiveSection('resources')}
              className={`px-3 py-1.5 font-medium rounded-sm transition-colors cursor-pointer ${
                activeSection === 'resources'
                  ? 'bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8] shadow-xs'
                  : 'text-[#42684D] dark:text-[#BBC4A6]'
              }`}
            >
              Resource Drive Links ({resources.length})
            </button>
          </div>

          {activeSection === 'quicklinks' && (
            <button
              onClick={handleOpenAddLink}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] text-[#F3F1E8] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Link</span>
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: INSTITUTIONAL QUICK LINKS */}
      {activeSection === 'quicklinks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <div
              key={link.id}
              className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 p-4 flex flex-col justify-between hover:border-[#42684D] dark:hover:border-[#8A9C74] transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-[#EAE7DA] dark:bg-[#142D22] text-[#987453] dark:text-[#BBC4A6]">
                    {link.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditLink(link)}
                      className="p-1 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] rounded-sm cursor-pointer"
                      title="Edit Link"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {deleteConfirmId === link.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDeleteQuickLink(link.id)}
                          className="px-2 py-0.5 text-[10px] font-bold bg-[#987453] text-[#F3F1E8] rounded-sm hover:bg-[#19382B] cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(link.id)}
                        className="p-1 text-[#8A9C74] hover:text-[#987453] rounded-sm cursor-pointer"
                        title="Delete Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-[#19382B] dark:text-[#F3F1E8] leading-snug mb-1">
                  {link.title}
                </h4>
                {link.description && (
                  <p className="text-xs text-[#42684D] dark:text-[#BBC4A6] mb-3 line-clamp-2">
                    {link.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-[#BBC4A6]/40 dark:border-[#BBC4A6]/15 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-[#8A9C74] truncate max-w-[180px]">
                  {link.url}
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#42684D] dark:text-[#BBC4A6] hover:text-[#19382B] dark:hover:text-[#F3F1E8] hover:underline font-medium"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: RESOURCE DRIVE LINKS AUDIT */}
      {activeSection === 'resources' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8A9C74]" />
              <input
                type="text"
                placeholder="Search resource title or drive URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 bg-[#FAF9F4] dark:bg-[#19382B] text-[#19382B] dark:text-[#F3F1E8]"
            >
              <option value="all">All Resource Types</option>
              <option value="slides">Slides</option>
              <option value="notes">Notes</option>
              <option value="book">Books</option>
              <option value="practical">Lab Manuals</option>
              <option value="pyq">Exam Papers</option>
            </select>
          </div>

          <div className="bg-[#FAF9F4] dark:bg-[#19382B] rounded-lg border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EAE7DA] dark:bg-[#142D22] border-b border-[#BBC4A6]/70 dark:border-[#BBC4A6]/20 text-[#42684D] dark:text-[#BBC4A6] font-medium uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Drive Link / File ID</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BBC4A6]/40 dark:divide-[#BBC4A6]/15">
                  {filteredResources.slice(0, 50).map((res) => (
                    <tr key={res.id} className="hover:bg-[#EAE7DA]/50 dark:hover:bg-[#142D22]/60">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">{res.title}</div>
                        <div className="text-[10px] text-[#8A9C74] capitalize">{res.category} · {res.fileType}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[#42684D] dark:text-[#BBC4A6]">
                        {res.courseCode}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#8A9C74] max-w-[280px] truncate">
                        {res.driveUrl}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={res.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-[#8A9C74] hover:text-[#42684D] dark:hover:text-[#F3F1E8] rounded-sm"
                            title="Open in Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleOpenEditResource(res)}
                            className="p-1.5 text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] rounded-sm cursor-pointer"
                            title="Update Drive Link"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Institutional Link */}
      {isAddLinkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11261D]/85 animate-fade-in">
          <div className="bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-lg p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 pb-3">
              <h3 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                {editingLink ? 'Edit Institutional Link' : 'Add New Link'}
              </h3>
              <button onClick={() => setIsAddLinkOpen(false)} className="text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickLink} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">Link Title</label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="e.g. Department Portal"
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">Destination URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">Category</label>
                <select
                  value={linkCategory}
                  onChange={(e) => setLinkCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                >
                  <option value="portal">Official Portal</option>
                  <option value="drive">Google Drive Archive</option>
                  <option value="syllabus">Syllabus / Curriculum</option>
                  <option value="form">Submission Form</option>
                  <option value="general">Research & Library</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">Description</label>
                <textarea
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder="Brief note on what this link provides..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
                <button
                  type="button"
                  onClick={() => setIsAddLinkOpen(false)}
                  className="px-4 py-2 font-medium text-[#42684D] dark:text-[#BBC4A6] hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] text-[#F3F1E8] rounded-md shadow-xs cursor-pointer"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Edit Resource Drive Link */}
      {editingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11261D]/85 animate-fade-in">
          <div className="bg-[#FAF9F4] dark:bg-[#19382B] border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 rounded-lg p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20 pb-3">
              <h3 className="font-editorial text-base font-semibold text-[#19382B] dark:text-[#F3F1E8]">
                Update Resource Drive URL
              </h3>
              <button onClick={() => setEditingResource(null)} className="text-[#8A9C74] hover:text-[#19382B] dark:hover:text-[#F3F1E8] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResourceLink} className="space-y-3">
              <div>
                <div className="font-semibold text-[#19382B] dark:text-[#F3F1E8]">{editingResource.title}</div>
                <div className="font-mono text-[#42684D] dark:text-[#BBC4A6] text-[11px]">{editingResource.courseCode} · {editingResource.courseTitle}</div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#19382B] dark:text-[#F3F1E8]">
                  New Google Drive Link / Download URL
                </label>
                <input
                  type="url"
                  value={newDriveUrl}
                  onChange={(e) => setNewDriveUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-[#BBC4A6]/70 dark:border-[#BBC4A6]/25 bg-[#F3F1E8] dark:bg-[#11261D] text-[#19382B] dark:text-[#F3F1E8] font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#BBC4A6]/50 dark:border-[#BBC4A6]/20">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
                  className="px-4 py-2 font-medium text-[#42684D] dark:text-[#BBC4A6] rounded-md hover:bg-[#EAE7DA] dark:hover:bg-[#142D22] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold bg-[#19382B] hover:bg-[#42684D] dark:bg-[#42684D] dark:hover:bg-[#8A9C74] text-[#F3F1E8] rounded-md shadow-xs cursor-pointer"
                >
                  Update URL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
