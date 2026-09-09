import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Terminal, 
  CheckCircle2, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Card3D } from '../ui/Card3D';

interface EducationSectionProps {
  education?: any[];
}

export const EducationSection: React.FC<EducationSectionProps> = ({ 
  education: inputEducation 
}) => {
  const education = Array.isArray(inputEducation) ? inputEducation : [];

  const handleScrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('contact');
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="education" className="py-24 relative z-10 border-t border-borderGlass/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header - Drops down from Top (-30px) */}
        <motion.div 
          className="flex flex-col items-start mb-16"
          initial={{ opacity: 0, y: -40, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center gap-2 text-accentCyan text-xs font-mono tracking-widest uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-accentCyan" />
            <span>Academic & Professional Foundation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Where the Engineering <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentCyan via-accentBlue to-accentIndigo">
              Journey Began
            </span>
          </h2>
        </motion.div>

        {/* Main Split: Factual Education Milestone (Left) & 3D Foundation Plane (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center mb-24">
          
          {/* Left Column: Flies in from Left (-50px) */}
          <div className="lg:col-span-7 space-y-6">
            {education.map((edu, idx) => (
              <motion.div
                key={edu.id || idx}
                initial={{ opacity: 0, x: -60, filter: 'blur(5px)' }}
                whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Card3D depth={12} glowColor="rgba(37, 99, 235, 0.25)">
                  <div className="glass-panel p-8 sm:p-9 rounded-3xl border border-borderGlass relative group hover:border-accentBlue/40 transition-all shadow-xl">
                    
                    {/* Milestone Top Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-borderGlass/60 pb-5">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs font-mono text-accentCyan uppercase font-semibold tracking-wider">
                            Degree & Discipline
                          </span>
                          <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                            {edu.degree || edu.field}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-bgVoid border border-borderGlass text-xs font-mono text-gray-300">
                        <Calendar className="w-3.5 h-3.5 text-accentCyan" />
                        <span>{edu.period}</span>
                      </div>
                    </div>

                    {/* Institution Details */}
                    <div className="space-y-2 mb-6">
                      <p className="text-base font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-accentBlue" />
                        <span>{edu.institution}</span>
                      </p>
                      <p className="text-xs font-mono text-gray-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-500" />
                        <span>{edu.location}</span>
                      </p>
                    </div>

                    {/* Factual Academic Description */}
                    {edu.description && (
                      <p className="text-xs text-gray-300 font-sans leading-relaxed pt-3 border-t border-borderGlass/60">
                        {edu.description}
                      </p>
                    )}

                    {/* Academic Highlights */}
                    {edu.highlights && edu.highlights.length > 0 && (
                      <div className="space-y-2.5 pt-4 border-t border-borderGlass/60">
                        {edu.highlights.map((h, hIdx) => (
                          <div key={hIdx} className="flex items-start gap-2.5 text-xs text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-accentCyan flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{typeof h === 'string' ? h : (h?.text || '')}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                </Card3D>
              </motion.div>
            ))}
          </div>

          {/* Right Column: 3D Technical Foundation Layer Plate - Flies in from Right (+50px) */}
          <motion.div 
            className="lg:col-span-5 flex justify-center"
            initial={{ opacity: 0, x: 50, rotateX: 15, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, rotateX: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Card3D depth={18} glowColor="rgba(56, 189, 248, 0.2)">
              <div className="relative w-full max-w-md p-7 rounded-3xl bg-bgSurface/90 border border-borderGlass backdrop-blur-2xl shadow-2xl overflow-hidden group">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-borderGlass text-xs font-mono text-gray-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-accentCyan" />
                    <span className="text-white font-bold">ENGINEERING_FOUNDATION</span>
                  </div>
                  <span className="text-accentCyan font-semibold">BE-IT (2013–2017)</span>
                </div>

                {/* Architectural Evolution Nodes */}
                <div className="space-y-4 font-mono text-xs">
                  
                  <div className="p-3.5 rounded-xl bg-bgCard border border-borderGlass flex items-center justify-between">
                    <span className="text-gray-400">Core Discipline:</span>
                    <span className="text-white font-semibold">Information Technology</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-bgCard border border-borderGlass flex items-center justify-between">
                    <span className="text-gray-400">Evolution Stage:</span>
                    <span className="text-accentCyan font-semibold">8+ Years Production Practice</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-bgCard border border-borderGlass flex items-center justify-between">
                    <span className="text-gray-400">Primary Domain:</span>
                    <span className="text-accentBlue font-semibold">Full Stack Systems Architecture</span>
                  </div>

                </div>

                {/* Bottom Quote Note */}
                <p className="mt-6 text-xs text-gray-400 leading-relaxed font-mono border-t border-borderGlass pt-4">
                  "Solid computer science fundamentals formed the foundation for designing high-throughput APIs, microservices, and distributed cloud systems."
                </p>

              </div>
            </Card3D>
          </motion.div>

        </div>

        {/* Contact Transition Bridge CTA Card - Scales Up from Center */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Card3D depth={10} glowColor="rgba(37, 99, 235, 0.3)">
            <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-accentBlue/30 relative overflow-hidden text-center shadow-2xl">
              
              {/* Subtle Ambient Specular Glow Background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-accentCyan/10 via-accentBlue/10 to-accentIndigo/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accentBlue/10 border border-accentBlue/30 text-accentCyan text-xs font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
                  <span>READY FOR THE NEXT ENGINEERING MILESTONE</span>
                </div>

                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Interested in Engineering Leadership & Technical Depth for Your Team?
                </h3>

                <p className="text-sm sm:text-base text-gray-300 font-sans leading-relaxed max-w-2xl mx-auto">
                  Whether you need high-performance MERN/MEAN microservices, fintech API integrations, or technical leadership—let's connect.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href="#contact"
                    onClick={handleScrollToContact}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-accentBlue via-accentIndigo to-accentCyan text-white font-mono text-xs font-extrabold uppercase tracking-wider shadow-glow-blue flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all group cursor-pointer"
                  >
                    <span>Initiate Contact & Discussion</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>

              </div>

            </div>
          </Card3D>
        </motion.div>

      </div>
    </section>
  );
};
