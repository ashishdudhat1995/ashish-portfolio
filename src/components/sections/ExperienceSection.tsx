import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Zap, 
  CheckCircle2, 
  Heart,
  ShieldCheck,
  Terminal,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { Card3D } from '../ui/Card3D';

interface ExperienceSectionProps {
  experience?: any[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ 
  experience: inputExperience 
}) => {
  const experience = Array.isArray(inputExperience) ? inputExperience : [];
  const [activeRoleIndex, setActiveRoleIndex] = useState<number>(0);

  const activeItem = experience[activeRoleIndex] || experience[0] || null;

  return (
    <section id="experience" className="py-24 relative z-10 border-t border-borderGlass/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          className="flex flex-col items-start mb-16"
          initial={{ opacity: 0, y: -40, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center gap-2 text-accentCyan text-xs font-mono tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-accentCyan" />
            <span>Career Journey & Engineering Progression</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Work Experience & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentCyan via-accentBlue to-accentIndigo">
              Technical Leadership
            </span>
          </h2>
        </motion.div>

        {(!activeItem || experience.length === 0) ? (
          <div className="p-8 rounded-3xl glass-panel border border-borderGlass text-center font-mono text-gray-400 text-sm">
            No published work experience records available.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Company & Role Selector List */}
          <div className="lg:col-span-5 space-y-3">
            <p className="text-xs font-mono text-accentCyan uppercase tracking-widest mb-4">
              SELECT COMPANY / ROLE TO EXPLORE:
            </p>

            {experience.map((item, idx) => {
              const isActive = activeRoleIndex === idx;
              const isBreak = item.isBreak;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -50, filter: 'blur(5px)' }}
                  whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveRoleIndex(idx)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? isBreak
                          ? 'bg-rose-950/20 border-rose-500/50 shadow-lg text-white'
                          : 'bg-bgCard border-accentBlue shadow-glow-blue text-white'
                        : 'bg-bgCard/40 border-borderGlass text-gray-400 hover:bg-bgCard/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 pr-2">
                      <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                        isActive
                          ? isBreak
                            ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                            : 'bg-accentBlue/20 border-accentBlue text-accentCyan'
                          : 'bg-bgVoid border-borderGlass text-gray-400'
                      }`}>
                        {isBreak ? (
                          <Heart className="w-5 h-5 text-rose-400" />
                        ) : (
                          <Briefcase className="w-5 h-5" />
                        )}
                      </div>

                      <div className="overflow-hidden">
                        <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
                          {item.company}
                        </p>
                        <p className="text-xs font-mono text-accentCyan truncate font-semibold">
                          {item.role}
                        </p>
                        <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                          {item.period}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      isActive ? 'translate-x-1 text-accentCyan' : 'text-gray-600 group-hover:text-gray-300'
                    }`} />
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Selected Role Interactive Detail Display Panel */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.3 }}
              >
                <Card3D depth={14} glowColor={activeItem.isBreak ? "rgba(244, 63, 94, 0.2)" : "rgba(37, 99, 235, 0.3)"}>
                  <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 ${
                    activeItem.isBreak
                      ? 'bg-rose-950/10 border-rose-500/30'
                      : 'glass-panel border-accentBlue/40'
                  }`}>
                    
                    {/* Role Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderGlass/60 pb-6">
                      <div>
                        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                          <span className={`text-xs font-mono font-semibold uppercase px-3 py-1 rounded-xl border ${
                            activeItem.isBreak 
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' 
                              : 'bg-accentBlue/10 text-accentCyan border-accentBlue/30'
                          }`}>
                            {activeItem.progressionLevel || activeItem.role}
                          </span>
                          <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-500" />
                            <span>{activeItem.location}</span>
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                          {activeItem.role}
                        </h3>
                        <p className="text-base font-bold text-accentBlue">
                          @ {activeItem.company}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bgVoid border border-borderGlass text-xs font-mono text-gray-300 self-start sm:self-auto">
                        <Calendar className="w-3.5 h-3.5 text-accentCyan" />
                        <span>{activeItem.period}</span>
                      </div>
                    </div>

                    {/* Role Executive Summary */}
                    <div>
                      <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-2">ROLE SUMMARY:</p>
                      <p className="text-base text-gray-300 leading-relaxed font-sans">
                        {activeItem.summary}
                      </p>
                    </div>

                    {/* Quantitative Key Metric Badges */}
                    {activeItem.keyMetrics && activeItem.keyMetrics.length > 0 && (
                      <div>
                        <p className="text-xs font-mono text-accentCyan uppercase tracking-widest mb-2.5">KEY MEASURABLE IMPACT:</p>
                        <div className="flex flex-wrap gap-2.5">
                          {activeItem.keyMetrics.map((metric, mIdx) => {
                            const text = typeof metric === 'string'
                              ? metric
                              : ((metric as any)?.value && (metric as any)?.label
                                  ? `${(metric as any).value} - ${(metric as any).label}`
                                  : (metric as any)?.label || (metric as any)?.value || (metric as any)?.description || '');
                            return (
                              <span 
                                key={mIdx}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border ${
                                  activeItem.isBreak 
                                    ? 'bg-rose-500/10 text-rose-200 border-rose-500/20' 
                                    : 'bg-accentBlue/10 text-accentCyan border-accentBlue/30 shadow-sm'
                                }`}
                              >
                                <Zap className="w-3.5 h-3.5 text-accentCyan" />
                                <span>{text}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Detailed Accomplishments List */}
                    {activeItem.highlights && activeItem.highlights.length > 0 && (
                      <div>
                        <p className="text-xs font-mono text-accentIndigo uppercase tracking-widest mb-3 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-accentIndigo" />
                          <span>ENGINEERING ACCOMPLISHMENTS & DELIVERABLES:</span>
                        </p>

                        <div className="space-y-3">
                          {activeItem.highlights.map((h, hIdx) => {
                            const text = typeof h === 'string' ? h : ((h as any)?.text || (h as any)?.label || '');
                            return (
                              <div key={hIdx} className="flex items-start gap-3 p-3.5 rounded-xl bg-bgVoid/80 border border-borderGlass">
                                <CheckCircle2 className="w-4 h-4 text-accentCyan flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-300 leading-relaxed">{text}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Role Technologies Stack */}
                    {activeItem.technologies && activeItem.technologies.length > 0 && (
                      <div>
                        <p className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-gray-400" />
                          <span>TECHNOLOGY STACK USED:</span>
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs font-mono">
                          {activeItem.technologies.map((tech, tIdx) => {
                            const text = typeof tech === 'string' ? tech : ((tech as any)?.name || '');
                            return (
                              <span 
                                key={tIdx}
                                className="px-3 py-1.5 rounded-xl bg-bgVoid border border-borderGlass text-gray-200 font-semibold"
                              >
                                {text}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </Card3D>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      </div>
    </section>
  );
};
