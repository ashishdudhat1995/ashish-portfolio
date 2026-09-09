import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Trash2, 
  Archive, 
  Clock, 
  ShieldCheck,
  FileCheck,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  fetchAdminResumes, 
  uploadAdminResume, 
  publishAdminResume, 
  archiveAdminResume, 
  deleteAdminResume 
} from '../../../services/apiClient';
import type { AdminResumeItem, MediaAsset } from '../../../types/portfolio';
import { MediaPicker } from '../ui/MediaPicker';
import { ConfirmDeleteModal } from '../ui/StateFeedback';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface ResumeModuleProps {
  onCountChange?: (count: number) => void;
}

export const ResumeModule: React.FC<ResumeModuleProps> = ({ onCountChange }) => {
  const [resumes, setResumes] = useState<AdminResumeItem[]>([]);
  const [activeResume, setActiveResume] = useState<AdminResumeItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<AdminResumeItem | null>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaAsset | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('Ashishkumar Dudhat - Resume');
  const [versionLabel, setVersionLabel] = useState<string>('');
  const [publishNow, setPublishNow] = useState<boolean>(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAdminResumes();
      const list: AdminResumeItem[] = res.data || (Array.isArray(res) ? res : []);
      setResumes(list);
      const active = list.find(r => r.isActive && r.status === 'PUBLISHED') || null;
      setActiveResume(active);

      const totalCount = res.summary?.totalResumes ?? list.length;
      if (onCountChange) {
        onCountChange(totalCount);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load resumes.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Selected file must be a PDF document (.pdf).');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
      setSelectedMediaItem(null);
      if (!title || title === 'Ashishkumar Dudhat - Resume') {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(`Ashishkumar Dudhat - ${cleanName}`);
      }
    }
  };

  const handleSelectMediaFromPicker = (media: MediaAsset) => {
    const mime = (media.mimeType || '').toLowerCase();
    if (mime !== 'application/pdf' && media.mediaType !== 'DOCUMENT') {
      setError('Selected media asset must be a valid PDF document.');
      return;
    }
    setError(null);
    setSelectedMediaItem(media);
    setSelectedFile(null);
    setIsMediaPickerOpen(false);
    if (!title || title === 'Ashishkumar Dudhat - Resume') {
      const cleanName = (media.originalFilename || media.filename || 'PDF Document').replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(`Ashishkumar Dudhat - ${cleanName}`);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !selectedMediaItem) {
      setError('Please select a PDF file or choose an existing PDF from the Media Library.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const isMediaSelection = !!selectedMediaItem;

    try {
      const formData = new FormData();
      if (selectedMediaItem) {
        formData.append('mediaId', selectedMediaItem.id);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('title', title);
      formData.append('versionLabel', versionLabel);
      formData.append('publishNow', publishNow ? 'true' : 'false');

      await uploadAdminResume(formData);

      if (publishNow) {
        setSuccess(
          isMediaSelection
            ? 'Resume selected from Media Library and set active on the website successfully!'
            : 'Resume PDF uploaded and set active on the website successfully!'
        );
      } else {
        setSuccess('Resume saved as draft version. Click "Activate" in the table below to make it active on the website.');
      }

      setSelectedFile(null);
      setSelectedMediaItem(null);
      setVersionLabel('');
      await loadResumes();
    } catch (err: any) {
      setError(err.message || 'Failed to process resume PDF.');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async (id: string) => {
    setActionLoadingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await publishAdminResume(id);
      setSuccess(res.message || 'Resume published and set as active.');
      await loadResumes();
    } catch (err: any) {
      setError(err.message || 'Failed to publish resume.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    setActionLoadingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await archiveAdminResume(id);
      setSuccess(res.message || 'Resume archived successfully.');
      await loadResumes();
    } catch (err: any) {
      setError(err.message || 'Failed to archive resume.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteClick = (item: AdminResumeItem) => {
    setDeleteConfirmItem(item);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    const id = deleteConfirmItem.id;
    setActionLoadingId(id);
    setError(null);
    setSuccess(null);
    try {
      const res = await deleteAdminResume(id);
      setSuccess(res.message || 'Resume deleted successfully.');
      setDeleteConfirmItem(null);
      await loadResumes();
    } catch (err: any) {
      setError(err.message || 'Failed to delete resume.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-bgSurface/90 border border-borderGlass shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-accentBlue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Resume Management
                <span className="px-2.5 py-0.5 rounded-full bg-accentBlue/10 border border-accentBlue/30 text-[10px] font-mono text-accentCyan uppercase">
                  PDF & Storage
                </span>
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Upload, version, publish, and replace your official Curriculum Vitae (CV) for the public portfolio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadResumes}
            disabled={loading}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-bgCard border border-borderGlass text-gray-300 hover:text-white hover:border-borderHighlight transition-all text-xs font-mono flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="font-mono">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <p className="font-mono">{success}</p>
        </div>
      )}

      {/* Active Resume Status Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-bgSurface/95 via-bgCard/90 to-bgSurface/95 border border-borderGlass shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-borderGlass mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Currently Active Public Resume
          </h2>
          {activeResume ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] uppercase font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Published & Active
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] uppercase font-bold">
              No Resume Published
            </span>
          )}
        </div>

        {activeResume ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white">{activeResume.title}</h3>
                {activeResume.versionLabel && (
                  <span className="px-2.5 py-0.5 rounded-md bg-accentBlue/20 border border-accentBlue/40 text-accentCyan text-xs font-mono">
                    {activeResume.versionLabel}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono text-gray-400 pt-2">
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase">Filename</span>
                  <span className="text-gray-200 truncate block max-w-[200px]">
                    {activeResume.media?.originalFilename || activeResume.media?.filename}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase">File Size</span>
                  <span className="text-gray-200">{formatFileSize(activeResume.media?.size)}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-gray-500 uppercase">Published Date</span>
                  <span className="text-gray-200">{formatDate(activeResume.publishedAt)}</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-wrap md:flex-col gap-2 justify-end">
              <a
                href={`${API_BASE_URL}/portfolio/resume/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold text-xs shadow-glow-blue hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Active PDF</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>

              <button
                type="button"
                onClick={() => handleArchive(activeResume.id)}
                disabled={actionLoadingId === activeResume.id}
                className="px-4 py-2 rounded-xl bg-bgCard border border-borderGlass text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/30 text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archive Resume</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <p className="font-bold flex items-center gap-2 text-amber-300">
              <AlertCircle className="w-4 h-4" />
              No active resume is currently published on your website.
            </p>
            <p className="text-amber-200/80">
              Use the upload form below to upload your official PDF resume and check "Publish & set active immediately".
            </p>
          </div>
        )}
      </div>

      {/* Upload New Resume Form */}
      <div className="p-6 rounded-2xl bg-bgSurface/95 border border-borderGlass shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-borderGlass">
          <div className="p-2 rounded-xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Upload New Resume PDF</h2>
            <p className="text-[11px] text-gray-400 font-mono">Only PDF documents (.pdf) up to 10MB are permitted.</p>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Title Input */}
            <div className="space-y-1.5 font-mono">
              <label className="text-xs text-gray-300 font-bold block">
                Resume Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Ashishkumar Dudhat - Senior Software Engineer"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue transition-colors"
              />
            </div>

            {/* Version Label Input */}
            <div className="space-y-1.5 font-mono">
              <label className="text-xs text-gray-300 font-bold block">
                Version Label <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
                placeholder="e.g. v2026.1 or Senior Lead Edition"
                className="w-full px-3.5 py-2.5 rounded-xl bg-bgVoid border border-borderGlass text-white text-xs focus:outline-none focus:border-accentBlue transition-colors"
              />
            </div>
          </div>

          {/* File Picker & Media Library Selection */}
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-300 font-bold block">
                PDF Document File <span className="text-rose-400">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan hover:bg-accentBlue/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Choose Existing PDF from Media Library</span>
              </button>
            </div>

            {selectedMediaItem ? (
              <div className="p-4 rounded-2xl bg-accentBlue/10 border border-accentBlue/30 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-accentBlue/20 text-accentCyan">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">
                      Selected from Media Library: {selectedMediaItem.originalFilename || selectedMediaItem.filename}
                    </p>
                    <p className="text-[10px] text-accentCyan font-mono">
                      {formatFileSize(selectedMediaItem.size)} • PDF Document
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedMediaItem(null)}
                  className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-borderGlass hover:border-accentBlue/50 rounded-2xl p-6 text-center bg-bgVoid/60 transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-2">
                  <FileCheck className="w-8 h-8 text-accentCyan group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-white">
                    {selectedFile ? selectedFile.name : 'Click or drag & drop PDF resume file here'}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {selectedFile ? `${formatFileSize(selectedFile.size)} • PDF Document` : 'Or click "Choose Existing PDF from Media Library" above'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Publish Checkbox & Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-borderGlass font-mono">
            <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="w-4 h-4 rounded bg-bgVoid border-borderGlass text-accentBlue focus:ring-accentBlue"
              />
              <span>Publish & set active immediately on website</span>
            </label>

            <button
              type="submit"
              disabled={uploading || (!selectedFile && !selectedMediaItem)}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white transition-all flex items-center justify-center gap-2 cursor-pointer ${
                uploading || (!selectedFile && !selectedMediaItem)
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'bg-gradient-to-r from-accentBlue to-accentIndigo shadow-glow-blue hover:opacity-95'
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{selectedMediaItem ? 'Setting Selected Resume...' : 'Uploading Resume...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{selectedMediaItem ? 'Save Selected Resume & Publish' : 'Upload Resume & Publish'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Resume History & Management Table */}
      <div className="p-6 rounded-2xl bg-bgSurface/95 border border-borderGlass shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-borderGlass font-mono">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-accentCyan" />
            Resume History & Versions
          </h2>
          <span className="text-xs text-gray-400">Total: {resumes.length}</span>
        </div>

        {resumes.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-gray-400">
            No resume documents found in the database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-borderGlass text-gray-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Title & Version</th>
                  <th className="py-3 px-4">File Details</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderGlass">
                {resumes.map((item) => (
                  <tr key={item.id} className="hover:bg-bgCard/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{item.title}</div>
                      {item.versionLabel && (
                        <span className="text-[10px] text-accentCyan bg-accentBlue/10 px-2 py-0.5 rounded border border-accentBlue/30 mt-1 inline-block">
                          {item.versionLabel}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-gray-200 text-xs truncate max-w-[180px]">
                        {item.media?.originalFilename || item.media?.filename || 'Resume.pdf'}
                      </div>
                      <div className="text-[10px] text-gray-500">{formatFileSize(item.media?.size)}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {item.isActive && (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                            ACTIVE
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'PUBLISHED'
                              ? 'bg-accentBlue/20 text-accentCyan border border-accentBlue/30'
                              : item.status === 'DRAFT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-gray-800 text-gray-400 border border-gray-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                      {formatDate(item.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Activate Button */}
                        {(!item.isActive || item.status !== 'PUBLISHED') && (
                          <button
                            type="button"
                            onClick={() => handlePublish(item.id)}
                            disabled={actionLoadingId === item.id}
                            title="Set as active & publish"
                            className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Activate</span>
                          </button>
                        )}

                        {/* Archive Button */}
                        {item.status !== 'ARCHIVED' && (
                          <button
                            type="button"
                            onClick={() => handleArchive(item.id)}
                            disabled={actionLoadingId === item.id || item.isActive}
                            title={item.isActive ? "Cannot archive active resume" : "Archive resume"}
                            className={`p-1.5 rounded border transition-colors ${
                              item.isActive
                                ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                                : 'bg-bgCard border-borderGlass text-amber-300 hover:bg-amber-500/10 hover:border-amber-500/30 cursor-pointer'
                            }`}
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(item)}
                          disabled={actionLoadingId === item.id}
                          title={item.isActive ? "Delete active published resume" : "Delete resume"}
                          className={`p-1.5 rounded border transition-colors ${
                            actionLoadingId === item.id
                              ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed'
                              : 'bg-bgCard border-borderGlass text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 cursor-pointer'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Media Picker Modal for selecting existing PDF resumes */}
      <MediaPicker
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMediaFromPicker}
        filterType="DOCUMENT"
        title="Select Resume PDF from Media Library"
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirmItem}
        itemTitle={deleteConfirmItem?.title || 'Resume Record'}
        description={
          deleteConfirmItem?.isActive
            ? 'This is your active published resume. Deleting it will remove the public Download Resume option from the website until a new resume is uploaded.'
            : undefined
        }
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmItem(null)}
        isLoading={actionLoadingId === deleteConfirmItem?.id}
      />

    </div>
  );
};
