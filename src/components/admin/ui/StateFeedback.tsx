import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Trash2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading records...' }) => (
  <div className="p-12 rounded-2xl bg-bgCard border border-borderGlass flex flex-col items-center justify-center gap-3 font-mono text-xs text-gray-400">
    <Loader2 className="w-6 h-6 text-accentCyan animate-spin" />
    <span>{message}</span>
  </div>
);

interface EmptyStateProps {
  title?: string;
  description?: string;
  onAddNew?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There are no items created for this module yet.',
  onAddNew
}) => (
  <div className="p-12 rounded-2xl bg-bgCard border border-borderGlass flex flex-col items-center justify-center text-center gap-3 font-mono text-xs">
    <AlertCircle className="w-8 h-8 text-gray-500" />
    <h4 className="text-sm font-bold text-white">{title}</h4>
    <p className="text-gray-400 max-w-sm">{description}</p>
    {onAddNew && (
      <button
        type="button"
        onClick={onAddNew}
        className="mt-2 px-4 py-2 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo transition-colors cursor-pointer"
      >
        + Create First Record
      </button>
    )}
  </div>
);

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  itemTitle: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  itemTitle,
  description,
  confirmText = 'Delete Record',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-bgVoid/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-md w-full p-6 rounded-3xl bg-bgCard border border-rose-500/40 shadow-2xl z-10 font-mono text-xs space-y-4"
        >
          <div className="flex items-center gap-3 text-rose-400">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Confirm Deletion</h3>
          </div>

          <p className="text-gray-300 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-white font-bold">"{itemTitle}"</strong>?
          </p>

          {description ? (
            <p className="text-rose-300/90 text-xs bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl">
              {description}
            </p>
          ) : (
            <p className="text-rose-400/80 text-[10px]">
              Tip: If you only want to hide this item from the public portfolio, toggle its <strong>Enabled/Disabled</strong> status instead.
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-bgVoid border border-borderGlass text-gray-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
