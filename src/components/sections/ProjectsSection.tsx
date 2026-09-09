import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  CreditCard, 
  Cloud, 
  Server, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  ArrowRight,
  Calendar,
  Maximize2,
  X,
  Zap,
  Layers
} from 'lucide-react';
import type { ProjectItem } from '../../types/portfolio';
import { Card3D } from '../ui/Card3D';
import { FilterBar } from '../ui/FilterBar';

interface ProjectsSectionProps {
  projects?: ProjectItem[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ 
  projects: inputProjects 
}) => {
  const projects = Array.isArray(inputProjects) ? inputProjects : [];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeModalProject, setActiveModalProject] = useState<ProjectItem | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  const domainIcons: Record<string, React.ReactNode> = {
    Healthcare: <Activity className="w-5 h-5 text-emerald-400" />,
    Fintech: <CreditCard className="w-5 h-5 text-accentCyan" />,
    SaaS: <Cloud className="w-5 h-5 text-accentBlue" />,
    Enterprise: <Server className="w-5 h-5 text-accentPurple" />,
    Networking: <Users className="w-5 h-5 text-amber-400" />,
  };

  const categories = ['All', 'Healthcare', 'Fintech', 'SaaS', 'Enterprise', 'Networking'];
  const domainOptions = categories.map(c => ({ id: c, title: c === 'All' ? 'All Products' : c }));

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveModalProject(null);
        setLightboxImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section id="projects" className="py-24 relative z-10 border-t border-borderGlass/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          className="flex flex-col items-start gap-6 mb-12"
          initial={{ opacity: 0, y: -40, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="w-full">
            <div className="flex items-center gap-2 text-accentCyan text-xs font-mono tracking-widest uppercase mb-3">
              <span className="w-2 h-2 rounded-full bg-accentCyan" />
              <span>Production Case Studies</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
              Architectural Solutions & <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentCyan via-accentBlue to-accentIndigo">
                Real-World Applications
              </span>
            </h2>
          </div>

          {/* Interactive Filter Bar with Left/Right Scroll Buttons */}
          <FilterBar
            options={domainOptions}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </motion.div>

        {/* 3D Grid Case Study Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {filteredProjects.map((project, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div
                key={project.id}
                initial={{ 
                  opacity: 0, 
                  x: isEven ? -70 : 70, 
                  y: 40, 
                  rotateY: isEven ? 12 : -12,
                  scale: 0.9,
                  filter: 'blur(6px)'
                }}
                whileInView={{ 
                  opacity: 1, 
                  x: 0, 
                  y: 0, 
                  rotateY: 0,
                  scale: 1,
                  filter: 'blur(0px)'
                }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.6, delay: (idx % 2) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="h-full"
              >
                <Card3D depth={14} glowColor="rgba(37, 99, 235, 0.25)" className="h-full">
                  <div
                    onClick={() => setActiveModalProject(project)}
                    className="rounded-3xl border border-borderGlass hover:border-accentBlue/50 bg-bgCard/90 hover:bg-bgCard transition-all duration-300 overflow-hidden relative p-7 sm:p-8 h-full flex flex-col justify-between cursor-pointer group shadow-xl"
                  >
                    <div>
                      {/* Top Header & Domain Badge */}
                      <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-borderGlass/60">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-bgVoid border border-borderGlass">
                            {domainIcons[project.category] || <Sparkles className="w-5 h-5 text-accentCyan" />}
                          </div>
                          <div>
                            <span className="text-[11px] font-mono text-accentCyan font-bold uppercase tracking-wider">
                              {project.category} • {project.domain}
                            </span>
                            <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight group-hover:text-accentCyan transition-colors">
                              {project.name}
                            </h3>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-xl bg-bgVoid border border-borderGlass text-xs font-mono text-gray-400 flex-shrink-0">
                          {project.period}
                        </span>
                      </div>

                      {/* Subtitle & Concise Description */}
                      <p className="text-xs font-mono text-accentBlue mb-2">
                        {project.subtitle}
                      </p>
                      <p className="text-sm text-gray-300 leading-relaxed mb-5 line-clamp-3">
                        {project.description}
                      </p>

                      {/* Visual Interface Preview Thumbnail */}
                      {project.images && project.images.length > 0 && (
                        <div className="relative rounded-2xl border border-borderGlass overflow-hidden bg-bgVoid aspect-[16/9] mb-5 group/img">
                          <img 
                            src={project.images[0]} 
                            alt={`${project.name} preview`} 
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-bgVoid/80 via-transparent to-transparent opacity-60" />
                          <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-bgVoid/90 backdrop-blur-md border border-borderGlass text-[10px] font-mono text-accentCyan flex items-center gap-1">
                            <Maximize2 className="w-3 h-3" />
                            <span>Preview</span>
                          </div>
                        </div>
                      )}

                      {/* Technical Architecture Pipeline Pill Strip */}
                      <div className="p-3.5 rounded-xl bg-bgVoid/80 border border-borderGlass font-mono text-[11px] mb-4">
                        <p className="text-[9px] uppercase text-gray-500 mb-1.5 font-bold tracking-wider">
                          STACK PIPELINE:
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 text-gray-300">
                          <span className="px-2 py-0.5 rounded bg-bgCard border border-borderGlass text-accentCyan">
                            {project.techStackByLayer?.frontend?.[0] || 'Frontend'}
                          </span>
                          <span className="text-gray-600">&rarr;</span>
                          <span className="px-2 py-0.5 rounded bg-bgCard border border-borderGlass text-accentBlue">
                            {project.techStackByLayer?.backend?.[0] || 'Backend'}
                          </span>
                          <span className="text-gray-600">&rarr;</span>
                          <span className="px-2 py-0.5 rounded bg-bgCard border border-borderGlass text-indigo-400">
                            {project.techStackByLayer?.database?.[0] || 'Database'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action CTA Button */}
                    <div className="pt-2 flex items-center justify-between border-t border-borderGlass/60">
                      <span className="text-xs font-mono text-gray-400 group-hover:text-accentCyan transition-colors">
                        Click to view complete case study
                      </span>
                      <div className="p-2 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan group-hover:bg-accentBlue group-hover:text-white transition-all flex items-center gap-1 text-xs font-mono font-bold">
                        <span>Explore</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                  </div>
                </Card3D>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* ULTRA-MODERN FULL CASE STUDY MODAL */}
      <AnimatePresence>
        {activeModalProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10 overflow-y-auto">
            
            {/* Backdrop Blur Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalProject(null)}
              className="fixed inset-0 bg-bgVoid/90 backdrop-blur-2xl z-0" 
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-bgCard border border-accentBlue/40 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col my-auto"
            >
              
              {/* Modal Top Header Bar */}
              <div className="p-6 sm:p-8 bg-bgSurface/90 backdrop-blur-md border-b border-borderGlass flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan">
                    {domainIcons[activeModalProject.category] || <Sparkles className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-accentCyan uppercase font-bold tracking-wider">
                      <span>{activeModalProject.category}</span>
                      <span>•</span>
                      <span>{activeModalProject.domain}</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                      {activeModalProject.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass text-xs font-mono text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-accentCyan" />
                    <span>{activeModalProject.period}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveModalProject(null)}
                    className="p-2.5 rounded-2xl bg-bgVoid text-gray-400 hover:text-white border border-borderGlass hover:border-accentBlue transition-colors cursor-pointer"
                    aria-label="Close Case Study Modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Content Body */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-8 no-scrollbar flex-1 font-sans">
                
                {/* Banner Mockup Image */}
                {activeModalProject.images && activeModalProject.images.length > 0 && (
                  <div 
                    onClick={() => setLightboxImage({ url: activeModalProject.images[0], title: activeModalProject.name })}
                    className="relative rounded-2xl border border-borderGlass overflow-hidden bg-bgVoid aspect-[16/9] cursor-pointer group/modalImg"
                  >
                    <img 
                      src={activeModalProject.images[0]} 
                      alt={activeModalProject.name} 
                      className="w-full h-full object-cover group-hover/modalImg:scale-102 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bgVoid/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-4 right-4 px-4 py-2 rounded-xl bg-bgVoid/90 backdrop-blur-md border border-borderGlass text-xs font-mono text-accentCyan flex items-center gap-2">
                      <Maximize2 className="w-4 h-4" />
                      <span>Click to Enlarge Architecture Mockup</span>
                    </div>
                  </div>
                )}

                {/* Subtitle & Executive Description */}
                <div>
                  <p className="text-sm font-mono text-accentBlue mb-2">
                    {activeModalProject.subtitle}
                  </p>
                  <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
                    {activeModalProject.description}
                  </p>
                </div>

                {/* Key Measurable Impact Badges */}
                {activeModalProject.impact && activeModalProject.impact.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase font-mono tracking-wider text-accentCyan mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accentCyan" />
                      <span>Key Measurable Outcomes & Business Impact:</span>
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {activeModalProject.impact.map((imp, idx) => {
                        const text = typeof imp === 'string' ? imp : ((imp as any)?.text || (imp as any)?.label || (imp as any)?.value || '');
                        return (
                          <span key={idx} className="px-4 py-2 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan text-xs font-mono font-bold flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>{text}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Technical Architecture Pipeline Diagram */}
                <div className="p-5 rounded-2xl bg-bgVoid border border-borderGlass font-mono text-xs">
                  <p className="text-[10px] uppercase text-gray-400 mb-3 font-bold tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-accentCyan" />
                    <span>PRODUCTION ARCHITECTURE PIPELINE:</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-gray-300">
                    <span className="px-3 py-1.5 rounded-xl bg-bgCard border border-borderGlass text-accentCyan font-bold">
                      Client UI ({activeModalProject.techStackByLayer?.frontend?.[0] || 'Frontend'})
                    </span>
                    <span className="text-gray-600">&rarr;</span>
                    <span className="px-3 py-1.5 rounded-xl bg-bgCard border border-borderGlass text-accentBlue font-bold">
                      API Gateway ({activeModalProject.techStackByLayer?.backend?.[0] || 'Backend'})
                    </span>
                    <span className="text-gray-600">&rarr;</span>
                    <span className="px-3 py-1.5 rounded-xl bg-bgCard border border-borderGlass text-indigo-400 font-bold">
                      Datastore ({activeModalProject.techStackByLayer?.database?.[0] || 'Database'})
                    </span>
                    <span className="text-gray-600">&rarr;</span>
                    <span className="px-3 py-1.5 rounded-xl bg-bgCard border border-borderGlass text-emerald-400 font-bold">
                      Cloud ({activeModalProject.techStackByLayer?.cloud?.[0] || 'AWS Infrastructure'})
                    </span>
                  </div>
                </div>

                {/* Structured Technology Metadata By Layer */}
                {activeModalProject.techStackByLayer && (
                  <div>
                    <h4 className="text-xs uppercase font-mono tracking-wider text-accentCyan mb-3 flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-accentCyan" />
                      <span>Structured Technology Stack By Layer:</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                      {activeModalProject.techStackByLayer.frontend && (
                        <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass">
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Frontend Layer</p>
                          <div className="flex flex-wrap gap-1.5">
                            {activeModalProject.techStackByLayer.frontend.map((t, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-bgCard text-gray-200">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeModalProject.techStackByLayer.backend && (
                        <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass">
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Backend & Services</p>
                          <div className="flex flex-wrap gap-1.5">
                            {activeModalProject.techStackByLayer.backend.map((t, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-bgCard text-gray-200">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeModalProject.techStackByLayer.database && (
                        <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass">
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Database & Caching</p>
                          <div className="flex flex-wrap gap-1.5">
                            {activeModalProject.techStackByLayer.database.map((t, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-bgCard text-gray-200">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeModalProject.techStackByLayer.cloud && (
                        <div className="p-4 rounded-2xl bg-bgVoid border border-borderGlass">
                          <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Cloud Infrastructure</p>
                          <div className="flex flex-wrap gap-1.5">
                            {activeModalProject.techStackByLayer.cloud.map((t, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg bg-bgCard text-gray-200">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Detailed Engineering Accomplishments */}
                {activeModalProject.capabilities && activeModalProject.capabilities.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase font-mono tracking-wider text-accentIndigo mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-accentIndigo" />
                      <span>Detailed Engineering Accomplishments & Deliverables:</span>
                    </h4>

                    <div className="space-y-3">
                      {activeModalProject.capabilities.map((cap, idx) => {
                        const text = typeof cap === 'string' ? cap : ((cap as any)?.text || (cap as any)?.label || '');
                        return (
                          <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-bgVoid border border-borderGlass">
                            <CheckCircle2 className="w-4.5 h-4.5 text-accentCyan flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-200 leading-relaxed">{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Architectural Highlights */}
                {activeModalProject.architecturePoints && activeModalProject.architecturePoints.length > 0 && (
                  <div>
                    <h4 className="text-xs uppercase font-mono tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      <span>System Architecture Highlights & Patterns:</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeModalProject.architecturePoints.map((ap, idx) => {
                        const text = typeof ap === 'string' ? ap : ((ap as any)?.text || (ap as any)?.label || '');
                        return (
                          <div key={idx} className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-200">
                            <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>{text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer Bar */}
              <div className="p-6 bg-bgSurface/90 backdrop-blur-md border-t border-borderGlass flex items-center justify-between flex-shrink-0 font-mono text-xs">
                <span className="text-gray-400 hidden sm:inline">Press Esc or click outside to close</span>
                <button
                  type="button"
                  onClick={() => setActiveModalProject(null)}
                  className="px-6 py-2.5 rounded-xl bg-accentBlue text-white font-bold hover:bg-accentIndigo transition-colors cursor-pointer ml-auto"
                >
                  Close Case Study
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Fullscreen Lightbox Image Viewer */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="absolute inset-0 bg-bgVoid/95 backdrop-blur-2xl" 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative max-w-5xl w-full bg-bgSurface border border-borderGlass rounded-3xl overflow-hidden shadow-2xl z-10 p-4"
            >
              <div className="flex items-center justify-between p-3 border-b border-borderGlass mb-3 text-xs font-mono">
                <span className="text-white font-bold">{lightboxImage.title} — System Architecture Mockup</span>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-lg bg-bgCard text-gray-400 hover:text-white border border-borderGlass"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-bgVoid border border-borderGlass">
                <img src={lightboxImage.url} alt={lightboxImage.title} className="w-full h-full object-contain" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </section>
  );
};
