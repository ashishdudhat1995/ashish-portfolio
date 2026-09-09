import React, { useState, useEffect } from 'react';
import { 
  Send, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  History, 
  Layers, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { 
  fetchPublishingSummary, 
  publishAllChanges, 
  discardDraftChanges, 
  publishEntity, 
  fetchAuditLogs 
} from '../../../services/apiClient';
import type { PublishingSummary, AdminAuditLog, PublishValidationError } from '../../../types/portfolio';

interface PublishingModuleProps {
  onOpenPreview?: () => void;
}

export const PublishingModule: React.FC<PublishingModuleProps> = ({ onOpenPreview }) => {
  const [summary, setSummary] = useState<PublishingSummary | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<PublishValidationError[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumData, logsRes] = await Promise.all([
        fetchPublishingSummary(),
        fetchAuditLogs(1, 20)
      ]);
      setSummary(sumData);
      setAuditLogs(logsRes.data);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to load publishing data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePublishAll = async () => {
    setIsPublishing(true);
    setFeedback(null);
    setValidationErrors([]);

    try {
      const res = await publishAllChanges();
      setFeedback(res.message || 'All draft changes published successfully!');
      loadData();
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        setValidationErrors(err.errors);
        setFeedback('Publish operation blocked due to validation errors.');
      } else {
        setFeedback(err.message || 'Failed to publish all changes.');
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishSingle = async (entity: string, id?: string) => {
    setIsPublishing(true);
    setFeedback(null);
    setValidationErrors([]);

    try {
      const res = await publishEntity(entity, id);
      setFeedback(res.message || `Published ${entity} successfully!`);
      loadData();
    } catch (err: any) {
      if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        setValidationErrors(err.errors);
      } else {
        setFeedback(err.message || `Failed to publish ${entity}.`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscardDrafts = async () => {
    if (!window.confirm('Are you sure you want to discard all draft changes? This will restore all draft fields to the live published state.')) {
      return;
    }

    setIsDiscarding(true);
    setFeedback(null);

    try {
      const res = await discardDraftChanges();
      setFeedback(res.message || 'Draft changes discarded.');
      loadData();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Failed to discard drafts.');
    } finally {
      setIsDiscarding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-gray-400 space-y-3 bg-bgCard rounded-3xl border border-borderGlass">
        <div className="w-8 h-8 border-2 border-accentBlue border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Checking Publishing Boundary & Draft Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-mono text-xs max-w-6xl">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-accentCyan text-[10px] uppercase font-bold tracking-widest mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GLOBAL PORTFOLIO PUBLISHING BOUNDARY</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Draft & Publishing Workflow</h2>
          <p className="text-gray-400 text-xs mt-1">
            Safely edit portfolio content as drafts, preview live changes, and explicitly publish to the public website.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onOpenPreview && (
            <button
              type="button"
              onClick={onOpenPreview}
              className="px-4 py-3 rounded-xl bg-bgVoid border border-borderGlass text-white hover:border-accentBlue font-bold uppercase text-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-accentCyan" />
              <span>Preview Mode</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePublishAll}
            disabled={isPublishing || !summary || summary.totalDrafts === 0}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold uppercase text-xs shadow-glow-blue hover:opacity-95 cursor-pointer disabled:opacity-40 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isPublishing ? 'Publishing...' : 'Publish All Changes'}</span>
          </button>
        </div>
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

      {/* Validation Errors Box */}
      {validationErrors.length > 0 && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>Publication Blocked — Validation Issues Identified</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-xs">
            {validationErrors.map((err, idx) => (
              <li key={idx}>
                <strong className="text-white uppercase font-mono">[{err.entity}]</strong> ({err.field}): {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Status Card */}
        <div className={`p-6 rounded-3xl border shadow-xl ${
          summary?.totalDrafts === 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Live Status</span>
            {summary?.totalDrafts === 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          <h3 className="text-xl font-extrabold text-white mb-1">
            {summary?.totalDrafts === 0 ? 'Everything is Published' : `${summary?.totalDrafts} Unpublished Drafts`}
          </h3>
          <p className="text-xs text-gray-300">
            {summary?.totalDrafts === 0 
              ? 'The public website matches all admin edits.' 
              : 'Draft edits exist that have not yet been published to the live portfolio.'
            }
          </p>
        </div>

        {/* Last Published Timestamp */}
        <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Last Published</span>
            <Clock className="w-5 h-5 text-accentCyan" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-1">
            {summary?.lastPublishedAt ? new Date(summary.lastPublishedAt).toLocaleDateString() : 'Never'}
          </h3>
          <p className="text-xs text-gray-400">
            {summary?.lastPublishedAt ? new Date(summary.lastPublishedAt).toLocaleTimeString() : 'Initial deployment'}
          </p>
        </div>

        {/* Version Counter */}
        <div className="p-6 rounded-3xl bg-bgCard border border-borderGlass shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Published Version</span>
            <Layers className="w-5 h-5 text-accentBlue" />
          </div>
          <h3 className="text-xl font-extrabold text-white mb-1">v{summary?.publishedVersion || 1}.0</h3>
          <p className="text-xs text-gray-400">Draft version: v{summary?.draftVersion || 1}.0</p>
        </div>

      </div>

      {/* Pending Draft Entities List */}
      <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-borderGlass pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Pending Draft Changes</h3>
            <p className="text-xs text-gray-400">Specific sections or content records with unpublished edits</p>
          </div>

          {summary && summary.totalDrafts > 0 && (
            <button
              type="button"
              onClick={handleDiscardDrafts}
              disabled={isDiscarding}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition-all cursor-pointer font-bold text-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Drafts</span>
            </button>
          )}
        </div>

        {summary?.draftEntities.length === 0 ? (
          <div className="py-12 text-center text-gray-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="font-bold text-white text-sm">No pending draft edits</p>
            <p className="text-xs max-w-sm mx-auto">When you edit portfolio sections in CMS, draft changes will appear here for review before publishing.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {summary?.draftEntities.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-bgVoid border border-borderGlass flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      DRAFT
                    </span>
                    <span className="text-white font-bold text-xs">{item.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-mono">
                    Entity: {item.entity} {item.id ? `| ID: ${item.id}` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handlePublishSingle(item.entity, item.id)}
                  disabled={isPublishing}
                  className="px-3.5 py-2 rounded-xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan hover:bg-accentBlue hover:text-white transition-all cursor-pointer text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit History Log */}
      <div className="p-6 sm:p-8 rounded-3xl bg-bgCard border border-borderGlass space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-borderGlass pb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-accentCyan" />
            <h3 className="text-base font-bold text-white">Publishing & Administrative Audit Log</h3>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-400 hover:text-white cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-bgVoid/60 text-gray-400 border-b border-borderGlass uppercase text-[10px]">
              <tr>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Entity</th>
                <th className="p-3">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderGlass/60 text-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-bgVoid/40">
                  <td className="p-3 text-gray-400 text-[10px]">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      log.action === 'PUBLISH_ALL' || log.action === 'PUBLISH' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-accentBlue/20 text-accentCyan'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-white font-bold">{log.entityType}</td>
                  <td className="p-3 text-gray-400">{log.adminEmail || 'Admin'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
