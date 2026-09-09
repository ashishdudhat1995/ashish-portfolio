import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Check, 
  X, 
  FileText, 
  Film, 
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { fetchAdminMediaList, uploadAdminMediaFile } from '../../../services/apiClient';
import type { MediaAsset, MediaPagination } from '../../../types/portfolio';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaAsset) => void;
  title?: string;
  selectedMediaId?: string | null;
  filterType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'ALL';
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Asset',
  selectedMediaId,
  filterType = 'ALL'
}) => {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [pagination, setPagination] = useState<MediaPagination>({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>(filterType === 'ALL' ? '' : filterType);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadMediaList = async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const res = await fetchAdminMediaList({
        page: pageNum,
        limit: 12,
        search,
        mediaType: typeFilter
      });
      setItems(res.data);
      if (res.pagination) setPagination(res.pagination);
    } catch {
      // Clean fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMediaList(1);
    }
  }, [isOpen, search, typeFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', file.name.replace(/\.[^/.]+$/, ''));

    try {
      const newMedia = await uploadAdminMediaFile(formData);
      onSelect(newMedia);
      onClose();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload media file.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono text-xs">
      <div className="bg-bgCard border border-borderGlass rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-borderGlass flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">{title}</h3>
            <p className="text-[11px] text-gray-400">Select an existing asset from the library or upload a new file</p>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-bgVoid text-gray-400 hover:text-white border border-borderGlass cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-borderGlass bg-bgVoid/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
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
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue cursor-pointer"
            >
              <option value="">All Media Types</option>
              <option value="IMAGE">Images</option>
              <option value="VIDEO">Videos</option>
              <option value="DOCUMENT">Documents</option>
            </select>
          </div>

          <label className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold uppercase text-xs shadow-glow-blue hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0">
            <Upload className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading...' : 'Upload New File'}</span>
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              accept="image/*,.svg,.pdf"
            />
          </label>
        </div>

        {uploadError && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Media Grid */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[300px]">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <div className="w-6 h-6 border-2 border-accentBlue border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading Media Library...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-gray-500 space-y-3">
              <FolderOpen className="w-10 h-10 mx-auto text-gray-600" />
              <p className="text-white font-bold">No media assets found</p>
              <p className="text-xs max-w-sm mx-auto">Upload a new image or file using the upload button above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((item) => {
                const isSelected = selectedMediaId === item.id || selectedMediaId === item.url || selectedMediaId === item.storageKey;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`group relative rounded-2xl border bg-bgVoid p-3 cursor-pointer transition-all hover:border-accentBlue flex flex-col justify-between ${
                      isSelected ? 'border-accentBlue ring-2 ring-accentBlue/40 bg-accentBlue/10' : 'border-borderGlass'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="h-28 rounded-xl bg-black/40 overflow-hidden flex items-center justify-center relative mb-2">
                      {item.mediaType === 'IMAGE' ? (
                        <img
                          src={item.url}
                          alt={item.altText || item.filename}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : item.mediaType === 'VIDEO' ? (
                        <Film className="w-8 h-8 text-accentBlue" />
                      ) : (
                        <FileText className="w-8 h-8 text-accentCyan" />
                      )}

                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-accentBlue text-white shadow-lg">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="space-y-1">
                      <p className="font-bold text-white text-[11px] truncate">{item.originalFilename || item.filename}</p>
                      <div className="flex items-center justify-between text-[9px] text-gray-400">
                        <span>{item.mimeType.split('/')[1] || item.mediaType}</span>
                        <span>{(item.size / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-borderGlass bg-bgVoid/40 flex items-center justify-between text-gray-400 text-xs">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total assets)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => loadMediaList(pagination.page - 1)}
              className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass hover:text-white disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => loadMediaList(pagination.page + 1)}
              className="px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass hover:text-white disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
