import React from 'react';
import { Briefcase, Layers, Terminal, GraduationCap, Award, Trophy, Share2, Mail, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  iconName: string;
  subtitle?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  iconName,
  subtitle,
  isLoading,
  onClick
}) => {
  const getIcon = () => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-accentCyan" />;
      case 'Layers': return <Layers className="w-5 h-5 text-accentBlue" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-indigo-400" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5 text-purple-400" />;
      case 'Award': return <Award className="w-5 h-5 text-emerald-400" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'Share2': return <Share2 className="w-5 h-5 text-sky-400" />;
      case 'Mail': return <Mail className="w-5 h-5 text-rose-400" />;
      default: return <Briefcase className="w-5 h-5 text-accentCyan" />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-3xl bg-bgCard border border-borderGlass hover:border-accentBlue/40 transition-all font-mono text-xs shadow-xl relative overflow-hidden group ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-2xl bg-bgVoid border border-borderGlass">
          {getIcon()}
        </div>

        {onClick && (
          <div className="p-1.5 rounded-lg bg-bgVoid text-gray-400 group-hover:text-accentCyan transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
          {label}
        </span>

        {isLoading ? (
          <div className="h-8 w-20 bg-bgVoid/80 animate-pulse rounded-lg my-1" />
        ) : (
          <p className="text-3xl font-black text-white tracking-tight">
            {value}
          </p>
        )}

        {subtitle && (
          <p className="text-[11px] text-gray-500 truncate pt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
