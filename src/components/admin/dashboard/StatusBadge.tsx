import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'online' | 'completeness';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'completeness' }) => {
  if (type === 'online') {
    const isOnline = status === 'Online';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
        isOnline 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
      }`}>
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
        <span>{status}</span>
      </span>
    );
  }

  const isConfigured = status !== 'Not configured';
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 ${
      isConfigured 
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
    }`}>
      {isConfigured ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertTriangle className="w-3 h-3 text-amber-300" />}
      <span>{status}</span>
    </span>
  );
};
