import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Cpu, 
  Cloud, 
  Award, 
  CreditCard, 
  Activity, 
  CheckCircle2, 
  Sparkles,
  Terminal,
  ShieldCheck,
  Zap,
  Database,
  Server,
  Globe,
  Building,
  Layers,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { Card3D } from '../ui/Card3D';

interface AboutSectionProps {
  about?: any;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ 
  about: inputAbout 
}) => {
  const about = inputAbout || null;
  const DEFAULT_PILLARS = [
    { id: "pillar-1", text: "Scalable Microservices Architecture", order: 1, enabled: true },
    { id: "pillar-2", text: "High-Concurrency Payment Infrastructure", order: 2, enabled: true },
    { id: "pillar-3", text: "Agile Team Mentorship", order: 3, enabled: true }
  ];

  const rawPillars = (about && Array.isArray(about.pillars) && about.pillars.length > 0) ? about.pillars : DEFAULT_PILLARS;
  const pillars = rawPillars.filter((p: any) => p.enabled !== false);
  const rawDomains = (about && Array.isArray(about.domains)) ? about.domains : [];
  const domains = rawDomains.filter((d: any) => d.enabled !== false);
  const technicalStrengths = (about && Array.isArray(about.technicalStrengths)) ? about.technicalStrengths : [];

  const [activeDomainIndex, setActiveDomainIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<number>(0);

  const activeDomain = domains[activeDomainIndex] || domains[0] || null;
  const currentStrength = technicalStrengths[activeTab] || technicalStrengths[0] || null;

  const domainIconMap: Record<string, React.ReactNode> = {
    CreditCard: <CreditCard className="w-5 h-5 text-accentCyan" />,
    Activity: <Activity className="w-5 h-5 text-emerald-400" />,
    Cloud: <Cloud className="w-5 h-5 text-accentBlue" />,
    Cpu: <Cpu className="w-5 h-5 text-indigo-400" />,
    Code2: <Code2 className="w-5 h-5 text-accentCyan" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    Terminal: <Terminal className="w-5 h-5 text-accentCyan" />,
    Zap: <Zap className="w-5 h-5 text-amber-400" />,
    Database: <Database className="w-5 h-5 text-accentCyan" />,
    Server: <Server className="w-5 h-5 text-accentBlue" />,
    Globe: <Globe className="w-5 h-5 text-accentCyan" />,
    Building: <Building className="w-5 h-5 text-indigo-400" />,
    Layers: <Layers className="w-5 h-5 text-accentBlue" />,
    Briefcase: <Briefcase className="w-5 h-5 text-emerald-400" />
  };

  const strengthIconMap: Record<string, React.ReactNode> = {
    Code2: <Code2 className="w-5 h-5 text-accentCyan" />,
    Cpu: <Cpu className="w-5 h-5 text-accentBlue" />,
    Cloud: <Cloud className="w-5 h-5 text-indigo-400" />,
    Award: <Award className="w-5 h-5 text-emerald-400" />
  };

  return (
    <section id="about" className="py-24 relative z-10 border-t border-borderGlass/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Spatial Drop & Exit Blur */}
        <motion.div 
          className="flex flex-col items-start mb-16"
          initial={{ opacity: 0, y: -40, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center gap-2 text-accentCyan text-xs font-mono tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-accentCyan" />
            <span>Architectural Philosophy & Senior Leadership</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            {about?.editorialHeading || ''}
          </h2>
        </motion.div>

        {/* Narrative Grid: Left Editorial Narrative + Right 3D Systems Topology */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          
          {/* Left Narrative - Slide from Left */}
          <motion.div 
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, x: -60, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="space-y-4 text-gray-300 text-base sm:text-lg leading-relaxed font-sans font-normal">
              {(Array.isArray(about?.introduction) ? about.introduction : (typeof about?.introduction === 'string' ? [about.introduction] : [])).map((para: string, idx: number) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* Key Engineering Pillars Badge Row */}
            {pillars.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-3 font-mono text-xs">
                {pillars.map((pillar: any, pIdx: number) => {
                  const text = typeof pillar === 'string' ? pillar : (pillar.text || pillar.label || '');
                  return (
                    <motion.span
                      key={pillar.id || pIdx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: false, amount: 0.15 }}
                      transition={{ duration: 0.4, delay: pIdx * 0.08 }}
                      className="px-3.5 py-1.5 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan font-bold flex items-center gap-1.5 hover:border-accentBlue/60 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-accentCyan" />
                      <span>{text}</span>
                    </motion.span>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Right 3D Topology Plate: 3D Spatial Fly-in & Exit Blur */}
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, x: 60, rotateX: 18, scale: 0.9, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, x: 0, rotateX: 0, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Card3D depth={18} glowColor="rgba(56, 189, 248, 0.2)">
              <div className="p-7 rounded-3xl bg-bgSurface/90 border border-borderGlass backdrop-blur-2xl shadow-2xl space-y-5">
                
                <div className="flex items-center justify-between border-b border-borderGlass pb-4 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-accentCyan" />
                    <span className="text-white font-bold">SYSTEMS_TOPOLOGY_VIEW</span>
                  </div>
                  <span className="text-accentCyan font-semibold">3-TIER ARCHITECTURE</span>
                </div>

                {/* Layer 1: Presentation Layer */}
                <div className="p-4 rounded-2xl bg-bgCard border border-borderGlass flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accentCyan/10 border border-accentCyan/30 text-accentCyan">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-gray-400 uppercase">Layer 1: Interface</p>
                      <p className="text-sm font-bold text-white">Angular / React.js / Next.js</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-bgVoid border border-borderGlass text-accentCyan">SSR / Memo</span>
                </div>

                {/* Layer 2: API Gateway Layer */}
                <div className="p-4 rounded-2xl bg-bgCard border border-borderGlass flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentBlue">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-gray-400 uppercase">Layer 2: Service API</p>
                      <p className="text-sm font-bold text-white">Node.js / Express / NestJS</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-bgVoid border border-borderGlass text-accentBlue">Microservices</span>
                </div>

                {/* Layer 3: Datastore & Cloud Layer */}
                <div className="p-4 rounded-2xl bg-bgCard border border-borderGlass flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-gray-400 uppercase">Layer 3: Datastore & Cloud</p>
                      <p className="text-sm font-bold text-white">AWS / Docker / Redis / Mongo</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-bgVoid border border-borderGlass text-indigo-400">ACID & Caching</span>
                </div>

              </div>
            </Card3D>
          </motion.div>

        </div>

        {/* Domain Expertise Experience Layout */}
        <div className="mb-24">
          <motion.div 
            className="flex flex-col items-start mb-8"
            initial={{ opacity: 0, y: -30, filter: 'blur(5px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-2 text-accentCyan text-xs font-mono tracking-widest uppercase mb-2">
              <span className="w-2 h-2 rounded-full bg-accentCyan" />
              <span>Domain Expertise & Industry Specialization</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Core Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentCyan to-accentBlue">Domains</span>
            </h3>
          </motion.div>

          {domains.length === 0 ? (
            <div className="p-8 rounded-3xl glass-panel border border-borderGlass text-center font-mono text-gray-400 text-sm">
              No active industry domains configured.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Domain Selector List */}
              <div className="lg:col-span-5 space-y-3">
                <p className="text-xs font-mono text-accentCyan uppercase tracking-widest mb-4">
                  SELECT SECTOR TO EXPLORE:
                </p>

                {domains.map((dom: any, idx: number) => {
                  const isActive = activeDomainIndex === idx;

                  return (
                    <motion.div
                      key={dom.id || idx}
                      initial={{ opacity: 0, x: -40, filter: 'blur(5px)' }}
                      whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                      viewport={{ once: false, amount: 0.15 }}
                      transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveDomainIndex(idx)}
                        className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between group cursor-pointer ${
                          isActive
                            ? 'bg-bgCard border-accentBlue shadow-glow-blue text-white'
                            : 'bg-bgCard/40 border-borderGlass text-gray-400 hover:bg-bgCard/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 pr-2">
                          <div className={`p-2.5 rounded-xl border flex-shrink-0 transition-colors ${
                            isActive
                              ? 'bg-accentBlue/20 border-accentBlue text-accentCyan'
                              : 'bg-bgVoid border-borderGlass text-gray-400'
                          }`}>
                            {domainIconMap[dom.icon] || <Layers className="w-5 h-5 text-accentCyan" />}
                          </div>

                          <div className="overflow-hidden">
                            <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>
                              {dom.name}
                            </p>
                            <p className="text-xs font-mono text-accentCyan truncate font-medium mt-0.5">
                              {dom.tagline}
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

              {/* Right Column: Selected Domain Detail Display Panel */}
              {activeDomain && (
                <div className="lg:col-span-7">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDomain.id || activeDomainIndex}
                      initial={{ opacity: 0, y: 20, scale: 0.97, filter: 'blur(5px)' }}
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -20, scale: 0.97, filter: 'blur(5px)' }}
                      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <Card3D depth={14} glowColor="rgba(37, 99, 235, 0.25)">
                        <div className="p-8 rounded-3xl glass-panel border border-accentBlue/40 shadow-2xl space-y-6">
                          
                          {/* Domain Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-borderGlass/60 pb-6">
                            <div>
                              <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                                <div className="p-2 rounded-xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan">
                                  {domainIconMap[activeDomain.icon] || <Sparkles className="w-5 h-5" />}
                                </div>
                                <span className="text-xs font-mono text-accentCyan uppercase px-3 py-1 rounded-xl bg-accentBlue/10 border border-accentBlue/30 font-bold">
                                  Industry Sector #{activeDomainIndex + 1}
                                </span>
                              </div>
                              <h3 className="text-2xl font-extrabold text-white">{activeDomain.name}</h3>
                              <p className="text-xs font-mono text-accentCyan font-semibold mt-1">{activeDomain.tagline}</p>
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <p className="text-sm text-gray-200 leading-relaxed font-sans font-normal">
                              {activeDomain.description}
                            </p>
                          </div>

                          {/* Highlights */}
                          {activeDomain.highlights && activeDomain.highlights.length > 0 && (
                            <div className="space-y-3 pt-2 border-t border-borderGlass/60">
                              <p className="text-xs font-mono text-accentCyan uppercase tracking-widest font-semibold">
                                KEY ARCHITECTURAL DELIVERABLES & IMPACT:
                              </p>
                              <div className="grid grid-cols-1 gap-2.5">
                                {activeDomain.highlights.map((item: any, hIdx: number) => {
                                  const text = typeof item === 'string' ? item : (item?.label || item?.text || '');
                                  return (
                                    <motion.div 
                                      key={hIdx}
                                      initial={{ opacity: 0, x: -15 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.3, delay: hIdx * 0.05 }}
                                      className="p-3.5 rounded-2xl bg-bgVoid/80 border border-borderGlass flex items-center gap-3 text-xs text-gray-200"
                                    >
                                      <CheckCircle2 className="w-4 h-4 text-accentCyan flex-shrink-0" />
                                      <span className="font-mono">{text}</span>
                                    </motion.div>
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
              )}

            </div>
          )}
        </div>

        {/* Technical Competency Tabs with Framer Motion Animations */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(5px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-accentCyan text-xs font-mono tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-accentCyan" />
              <span>TECHNICAL COMPETENCY FOCUS:</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Tab Selectors - Animated List */}
            <div className="lg:col-span-5 space-y-3">
              {technicalStrengths.map((item, idx) => {
                const strength = item as { icon?: string; category?: string; description?: string; skills?: string[] };
                const isActive = activeTab === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.15 }}
                    transition={{ duration: 0.4, delay: idx * 0.06 }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab(idx)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer group ${
                        isActive
                          ? 'bg-bgCard border-accentBlue text-white shadow-glow-blue'
                          : 'bg-bgCard/40 border-borderGlass text-gray-400 hover:bg-bgCard/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 pr-2">
                        <div className={`p-2.5 rounded-xl border transition-colors ${
                          isActive 
                            ? 'bg-accentBlue/20 border-accentBlue text-accentCyan' 
                            : 'bg-bgVoid border-borderGlass text-gray-400'
                        }`}>
                          {strengthIconMap[strength.icon || 'Code2'] || <Code2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-200'}`}>
                            {strength.category}
                          </p>
                          <p className="text-xs font-mono text-accentCyan font-normal mt-0.5">
                            {(strength.skills || []).length} core technologies
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

            {/* Tab Details Display Panel - Animated 3D Card */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 30, scale: 0.96, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -30, scale: 0.96, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <Card3D depth={14} glowColor="rgba(37, 99, 235, 0.25)">
                    <div className="p-8 rounded-3xl glass-panel border border-accentBlue/40 shadow-2xl space-y-6">
                      
                      <div className="border-b border-borderGlass/60 pb-4">
                        <span className="text-xs font-mono text-accentCyan uppercase px-3 py-1 rounded-xl bg-accentBlue/10 border border-accentBlue/30 font-bold mb-3 inline-block">
                          Core Competency Focus
                        </span>
                        <h3 className="text-2xl font-extrabold text-white">
                          {(currentStrength as { category?: string })?.category}
                        </h3>
                      </div>

                      <p className="text-sm text-gray-200 leading-relaxed font-sans font-normal">
                        {(currentStrength as { description?: string })?.description}
                      </p>

                      <div className="pt-2 border-t border-borderGlass/60">
                        <p className="text-xs font-mono text-accentCyan uppercase mb-3 tracking-widest font-semibold">
                          KEY STACK & FEATURED TOOLING:
                        </p>
                        <div className="flex flex-wrap gap-2.5">
                          {((currentStrength as { skills?: string[] })?.skills || []).map((skill: string, sIdx: number) => (
                            <motion.span
                              key={sIdx}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.25, delay: sIdx * 0.04 }}
                              className="px-3.5 py-2 rounded-xl bg-bgVoid border border-borderGlass hover:border-accentBlue/40 text-xs font-mono text-gray-200 font-semibold flex items-center gap-2 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-accentCyan" />
                              <span>{skill}</span>
                            </motion.span>
                          ))}
                        </div>
                      </div>

                    </div>
                  </Card3D>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
};
