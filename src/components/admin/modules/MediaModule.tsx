import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Upload, 
  Search, 
  Grid, 
  List, 
  Copy, 
  Check, 
  Trash2, 
  Save, 
  AlertCircle, 
  FileText,
  Film,
  Image as ImageIcon,
  ShieldCheck
} from 'lucide-react';
import { 
  fetchAdminMediaList, 
  uploadAdminMediaFile, 
  updateAdminMediaMetadata, 
  deleteAdminMediaAsset 
} from '../../../services/apiClient';
import type { MediaAsset, MediaPagination } from '../../../types/portfolio';
import { FormField } from '../ui/FormField';
import { ConfirmDeleteModal } from '../ui/StateFeedback';

export const MediaModule: React.FC = () => {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [pagination, setPagination] = useState<MediaPagination>({ page: 1, limit: 24, total: 0, totalPages: 1 });
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);
  
  // Filters & State
  const [search, setSearch] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit metadata form state
  const [editForm, setEditForm] = useState<{
    altText: string;
    caption: string;
    description: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    status: 'ACTIVE' | 'ARCHIVED';
  }>({
    altText: '',
    caption: '',
    description: '',
    visibility: 'PUBLIC',
    status: 'ACTIVE'
  });

  const loadMedia = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetchAdminMediaList({
        page,
        limit: 24,
        search,
        mediaType: mediaTypeFilter,
        status: statusFilter
      });
      setItems(res.data);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to fetch media assets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia(1);
  }, [search, mediaTypeFilter, statusFilter]);

  const handleSelectAsset = (asset: MediaAsset) => {
    setSelectedAsset(asset);
    setEditForm({
      altText: asset.altText || '',
      caption: asset.caption || '',
      description: asset.description || '',
      visibility: asset.visibility || 'PUBLIC',
      status: asset.status || 'ACTIVE'
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', file.name.replace(/\.[^/.]+$/, ''));

    try {
      const newAsset = await uploadAdminMediaFile(formData);
      setFeedback(`Uploaded '${newAsset.filename}' successfully!`);
      loadMedia(1);
      handleSelectAsset(newAsset);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveMetadata = async () => {
    if (!selectedAsset) return;
    setIsSaving(true);
    try {
      const updated = await updateAdminMediaMetadata(selectedAsset.id, editForm);
      setSelectedAsset(updated);
      setItems(items.map(i => i.id === updated.id ? updated : i));
      setFeedback('Metadata saved successfully.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to update metadata.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (asset?: MediaAsset) => {
    const target = asset || selectedAsset;
    if (!target) return;
    setAssetToDelete(target);
  };

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    const shouldForce = assetToDelete.status === 'ARCHIVED' || assetToDelete.usage?.isReferenced;
    setIsSaving(true);
    try {
      const res = await deleteAdminMediaAsset(assetToDelete.id, !!shouldForce);
      setFeedback(res.message);
      setAssetToDelete(null);
      if (selectedAsset?.id === assetToDelete.id) {
        if (res.action === 'deleted') {
          setSelectedAsset(null);
        } else if (res.data) {
          setSelectedAsset(res.data);
        }
      }
      loadMedia(pagination.page);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to delete media asset.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyUrlToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(url);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 font-mono text-xs max-w-7xl">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-accentCyan text-[10px] uppercase font-bold tracking-widest mb-1">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>CENTRALIZED ASSET STORAGE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Media Reference Library</h2>
          <p className="text-gray-400 text-xs mt-1">
            Manage portfolio imagery, project assets, Open Graph previews, and media reference metadata.
          </p>
        </div>

        <label className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold uppercase text-xs shadow-glow-blue hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0">
          <Upload className="w-4 h-4" />
          <span>{isUploading ? 'Uploading...' : 'Upload Media Asset'}</span>
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            accept="image/*,.svg,.pdf"
          />
        </label>
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-bgCard border border-accentBlue/40 text-accentCyan flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accentCyan flex-shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid + Side Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Media Grid & Toolbar */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Toolbar */}
          <div className="p-4 rounded-2xl bg-bgCard border border-borderGlass flex flex-wrap items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search filename or alt text..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue"
                />
              </div>

              <select
                value={mediaTypeFilter}
                onChange={(e) => setMediaTypeFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Document</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-bgVoid border border-borderGlass">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-accentBlue/20 text-accentCyan' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-accentBlue/20 text-accentCyan' : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid View */}
          {isLoading ? (
            <div className="py-20 text-center text-gray-400 space-y-2 bg-bgCard rounded-3xl border border-borderGlass">
              <div className="w-7 h-7 border-2 border-accentBlue border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading Media Assets...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-gray-500 space-y-3 bg-bgCard rounded-3xl border border-borderGlass p-8">
              <FolderOpen className="w-12 h-12 mx-auto text-gray-600" />
              <h3 className="text-base font-bold text-white">No media uploaded yet</h3>
              <p className="text-xs max-w-sm mx-auto">Upload images or documents to populate your centralized portfolio media library.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item) => {
                const isSelected = selectedAsset?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectAsset(item)}
                    className={`group relative rounded-2xl border bg-bgCard p-3 cursor-pointer transition-all hover:border-accentBlue flex flex-col justify-between ${
                      isSelected ? 'border-accentBlue ring-2 ring-accentBlue/40 bg-accentBlue/10' : 'border-borderGlass'
                    }`}
                  >
                    {/* Media Thumbnail */}
                    <div className="h-36 rounded-xl bg-black/40 overflow-hidden flex items-center justify-center relative mb-3">
                      {item.mediaType === 'IMAGE' ? (
                        <img
                          src={item.url}
                          alt={item.altText || item.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : item.mediaType === 'VIDEO' ? (
                        <Film className="w-10 h-10 text-accentBlue" />
                      ) : (
                        <FileText className="w-10 h-10 text-accentCyan" />
                      )}

                      {/* Status & Delete Badges */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-bold pointer-events-auto ${
                          item.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {item.status}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(item);
                          }}
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors cursor-pointer pointer-events-auto shadow-md"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="space-y-1">
                      <p className="font-bold text-white text-xs truncate">{item.originalFilename || item.filename}</p>
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span>{item.mimeType.split('/')[1] || item.mediaType}</span>
                        <span>{(item.size / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-3xl bg-bgCard border border-borderGlass overflow-hidden shadow-xl">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-bgVoid/60 text-gray-400 border-b border-borderGlass uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Asset</th>
                    <th className="p-4">Type / MIME</th>
                    <th className="p-4">Size</th>
                    <th className="p-4">Dimensions</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderGlass/60 text-gray-200">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleSelectAsset(item)}
                      className={`hover:bg-bgVoid/40 cursor-pointer transition-colors ${
                        selectedAsset?.id === item.id ? 'bg-accentBlue/10' : ''
                      }`}
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-black/40 overflow-hidden flex-shrink-0 flex items-center justify-center border border-borderGlass">
                          {item.mediaType === 'IMAGE' ? (
                            <img src={item.url} alt={item.filename} className="w-full h-full object-cover" />
                          ) : (
                            <FileText className="w-5 h-5 text-accentCyan" />
                          )}
                        </div>
                        <span className="font-bold text-white truncate max-w-[180px]">{item.originalFilename || item.filename}</span>
                      </td>
                      <td className="p-4 text-gray-400 text-[11px]">{item.mimeType}</td>
                      <td className="p-4 text-gray-400 font-mono">{(item.size / 1024).toFixed(0)} KB</td>
                      <td className="p-4 text-gray-400 font-mono">{item.width ? `${item.width}x${item.height}px` : 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-bold ${
                          item.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyUrlToClipboard(item.url);
                          }}
                          className="p-2 rounded-xl bg-bgVoid hover:bg-accentBlue/20 text-gray-300 hover:text-white cursor-pointer inline-flex items-center gap-1"
                          title="Copy Direct Link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(item);
                          }}
                          className="p-2 rounded-xl bg-bgVoid hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 cursor-pointer inline-flex items-center gap-1"
                          title="Delete Asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 rounded-2xl bg-bgCard border border-borderGlass flex items-center justify-between text-gray-400 text-xs">
            <span>
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total assets)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => loadMedia(pagination.page - 1)}
                className="px-4 py-2 rounded-xl bg-bgVoid border border-borderGlass hover:text-white disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadMedia(pagination.page + 1)}
                className="px-4 py-2 rounded-xl bg-bgVoid border border-borderGlass hover:text-white disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

        </div>

        {/* Right Col: Media Detail & Metadata Editor Panel */}
        <div className="lg:col-span-1">
          {selectedAsset ? (
            <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-2xl sticky top-6">
              <div className="flex items-center justify-between border-b border-borderGlass pb-4">
                <h3 className="text-base font-bold text-white">Asset Details</h3>
                <span className="text-[10px] text-accentCyan uppercase font-bold tracking-wider">{selectedAsset.mediaType}</span>
              </div>

              {/* Asset Preview */}
              <div className="rounded-2xl bg-black/60 border border-borderGlass p-2 flex items-center justify-center overflow-hidden min-h-[180px] max-h-[260px] relative">
                {selectedAsset.mediaType === 'IMAGE' ? (
                  <img src={selectedAsset.url} alt={selectedAsset.altText || selectedAsset.filename} className="max-h-[240px] w-auto object-contain rounded-xl" />
                ) : selectedAsset.mediaType === 'VIDEO' ? (
                  <video src={selectedAsset.url} controls className="max-h-[240px] w-full" />
                ) : (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <FileText className="w-12 h-12 text-accentCyan mx-auto" />
                    <p className="font-bold text-white">{selectedAsset.filename}</p>
                  </div>
                )}
              </div>

              {/* Public URL Action */}
              <div className="p-3 rounded-xl bg-bgVoid border border-borderGlass flex items-center justify-between gap-2">
                <span className="text-gray-400 truncate text-[10px] flex-1">{selectedAsset.url}</span>
                <button
                  type="button"
                  onClick={() => copyUrlToClipboard(selectedAsset.url)}
                  className="px-3 py-1.5 rounded-lg bg-accentBlue/20 text-accentCyan hover:bg-accentBlue hover:text-white transition-all cursor-pointer font-bold text-[10px] flex items-center gap-1 flex-shrink-0"
                >
                  {copiedId === selectedAsset.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === selectedAsset.url ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* Usage Tracker */}
              {selectedAsset.usage && (
                <div className="p-4 rounded-xl bg-bgVoid border border-borderGlass space-y-2">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">DATABASE USAGE TRACKER</span>
                  {selectedAsset.usage.isReferenced ? (
                    <div className="space-y-1">
                      <p className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Currently Active In:</span>
                      </p>
                      <ul className="text-[10px] text-gray-300 space-y-0.5 pl-4 list-disc">
                        {selectedAsset.usage.references.map((ref, idx) => (
                          <li key={idx}>{ref}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-[11px]">Unused (Safe to remove)</p>
                  )}
                </div>
              )}

              {/* Technical Specifications */}
              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono text-gray-300">
                <div className="p-3 rounded-xl bg-bgVoid border border-borderGlass">
                  <span className="text-gray-500 text-[9px] uppercase block">File Size</span>
                  <span className="font-bold text-white">{(selectedAsset.size / 1024).toFixed(1)} KB</span>
                </div>
                <div className="p-3 rounded-xl bg-bgVoid border border-borderGlass">
                  <span className="text-gray-500 text-[9px] uppercase block">Dimensions</span>
                  <span className="font-bold text-white">{selectedAsset.width ? `${selectedAsset.width}x${selectedAsset.height}px` : 'N/A'}</span>
                </div>
              </div>

              {/* Metadata Edit Form */}
              <div className="space-y-4 pt-2 border-t border-borderGlass">
                <FormField label="Alt Text (Accessibility)" hint="Important for screen readers & SEO">
                  <input
                    type="text"
                    value={editForm.altText}
                    onChange={(e) => setEditForm({ ...editForm, altText: e.target.value })}
                    placeholder="Descriptive image alt text"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                  />
                </FormField>

                <FormField label="Caption">
                  <input
                    type="text"
                    value={editForm.caption}
                    onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                    placeholder="Short image caption"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Visibility">
                    <select
                      value={editForm.visibility}
                      onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                    >
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </FormField>

                  <FormField label="Status">
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-bgVoid border border-borderGlass text-white focus:outline-none focus:border-accentBlue"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </FormField>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-borderGlass">
                <button
                  type="button"
                  onClick={handleSaveMetadata}
                  disabled={isSaving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold uppercase text-xs shadow-glow-blue hover:opacity-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteClick(selectedAsset)}
                  disabled={isSaving}
                  className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  title="Delete Asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass text-center font-mono text-xs space-y-3 text-gray-500">
              <ImageIcon className="w-10 h-10 mx-auto text-gray-600" />
              <p className="font-bold text-white">No Asset Selected</p>
              <p className="text-[11px]">Click any media item from the grid to view specifications, usage references, and edit metadata.</p>
            </div>
          )}
        </div>

      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!assetToDelete}
        itemTitle={assetToDelete?.originalFilename || assetToDelete?.filename || 'Media Asset'}
        description={
          assetToDelete?.usage?.isReferenced
            ? `This media asset is currently referenced in: [${assetToDelete.usage.references.join(', ')}]. Confirming deletion will clean up referencing content cleanly.`
            : 'Are you sure you want to permanently delete this media asset and file from storage?'
        }
        confirmText="Yes, Delete Asset"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setAssetToDelete(null)}
        isLoading={isSaving}
      />

    </div>
  );
};
