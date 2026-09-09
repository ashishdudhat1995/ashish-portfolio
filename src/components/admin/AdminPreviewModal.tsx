import React, { useEffect, useState } from 'react';
import { Eye, Send, ArrowLeft } from 'lucide-react';
import { fetchAdminPreviewData, publishAllChanges } from '../../services/apiClient';

interface AdminPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPreviewModal: React.FC<AdminPreviewModalProps> = ({ isOpen, onClose }) => {
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Inject noindex meta tag dynamically while preview is open
    let metaRobots = document.querySelector("meta[name='robots']");
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    metaRobots.setAttribute('content', 'noindex, nofollow');

    const loadPreview = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAdminPreviewData();
        setPreviewData(data);
      } catch (err) {
        setFeedback(err instanceof Error ? err.message : 'Failed to load preview data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      // Revert robots meta tag on close
      if (metaRobots) {
        metaRobots.setAttribute('content', 'index, follow');
      }
    };
  }, [isOpen]);

  const handlePublishFromPreview = async () => {
    setIsPublishing(true);
    setFeedback(null);
    try {
      const res = await publishAllChanges();
      setFeedback(res.message || 'All draft changes published!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setFeedback(err.message || 'Publishing failed.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bgVoid font-mono text-xs">
      
      {/* Sticky Top Preview Banner */}
      <div className="sticky top-0 z-50 bg-amber-500/90 backdrop-blur-md border-b border-amber-400/50 text-slate-950 px-4 py-3 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-300" />
            <span>Draft Preview</span>
          </span>
          <span className="font-extrabold text-xs tracking-wide">
            PREVIEW MODE — Viewing Unpublished Draft Changes
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {feedback && (
            <span className="text-xs font-bold text-slate-900 bg-amber-200/80 px-2 py-1 rounded">
              {feedback}
            </span>
          )}

          <button
            type="button"
            onClick={handlePublishFromPreview}
            disabled={isPublishing}
            className="px-4 py-1.5 rounded-lg bg-slate-950 text-white font-bold uppercase text-[11px] hover:bg-slate-900 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-amber-300" />
            <span>{isPublishing ? 'Publishing...' : 'Publish All'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-amber-600/30 text-slate-950 font-bold uppercase text-[11px] hover:bg-amber-600/50 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Preview</span>
          </button>
        </div>
      </div>

      {/* Preview Content View */}
      {isLoading ? (
        <div className="py-32 text-center text-gray-400 space-y-3">
          <div className="w-8 h-8 border-2 border-accentBlue border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Assembling Draft Portfolio Preview...</p>
        </div>
      ) : (
        <div className="p-6 max-w-6xl mx-auto space-y-10 py-10">
          
          <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-4">
            <h1 className="text-3xl font-extrabold text-white">{previewData?.personal?.fullName || 'Draft Portfolio'}</h1>
            <p className="text-accentCyan font-bold">{previewData?.personal?.professionalTitle}</p>
            <p className="text-gray-300 text-sm max-w-3xl leading-relaxed">
              {typeof previewData?.personal?.bio === 'string' ? previewData?.personal?.bio : JSON.stringify(previewData?.personal?.bio)}
            </p>
          </div>

          {/* Hero Section Preview */}
          <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-accentBlue">HERO SECTION (DRAFT)</span>
            <h2 className="text-2xl font-bold text-white">{previewData?.hero?.headline}</h2>
            <p className="text-gray-400 text-xs">{previewData?.hero?.description}</p>
          </div>

          {/* Projects Preview */}
          <div className="p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-accentCyan">PROJECTS ({previewData?.projects?.length || 0} DRAFT ITEMS)</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewData?.projects?.map((p: any) => (
                <div key={p.id} className="p-4 rounded-2xl bg-bgVoid border border-borderGlass space-y-2">
                  <h3 className="font-bold text-white text-sm">{p.name}</h3>
                  <p className="text-xs text-gray-400">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
