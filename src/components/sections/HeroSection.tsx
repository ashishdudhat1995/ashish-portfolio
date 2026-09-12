import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Briefcase, 
  Zap, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Sparkles,
  Download,
  User
} from 'lucide-react';
import { Card3D } from '../ui/Card3D';
import { TechStack3DMarquee } from '../ui/TechStack3DMarquee';
import { getApiBaseUrl } from '../../services/apiClient';

interface HeroSectionProps {
  personal?: any;
  heroStats?: any[];
  resume?: any;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ 
  personal: inputPersonal, 
  heroStats: inputHeroStats,
  resume
}) => {
  const personal = inputPersonal || null;
  const heroStats = inputHeroStats || [];

  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  const handleDownloadResume = async (e: React.MouseEvent) => {
    e.preventDefault();
    const rawUrl = resume?.downloadUrl || '/api/portfolio/resume/download';
    const baseUrl = getApiBaseUrl();
    
    let fullUrl = rawUrl;
    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      const cleanPath = rawUrl.startsWith('/api') ? rawUrl : `/api${rawUrl}`;
      fullUrl = `${baseUrl.replace(/\/api$/, '')}${cleanPath}`;
    }

    try {
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error('Download request failed');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = resume?.filename || 'Ashishkumar-Dudhat-Resume.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch {
      window.location.href = fullUrl;
    }
  };

  const statIcons: Record<string, React.ReactNode> = {
    Briefcase: <Briefcase className="w-5 h-5 text-accentCyan" />,
    Zap: <Zap className="w-5 h-5 text-accentBlue" />,
    TrendingUp: <TrendingUp className="w-5 h-5 text-emerald-400" />,
    Users: <Users className="w-5 h-5 text-indigo-400" />
  };

  return (
    <section id="home" className="min-h-screen pt-28 pb-16 flex flex-col justify-center relative z-10 overflow-hidden">
      
      {/* Executive Ambient Glow Spheres */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accentBlue/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-accentCyan/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-16">
          
          {/* Left Column: Typographic Narrative - 3D Spatial Fly-in & Exit Blur */}
          <motion.div 
            className="lg:col-span-7 space-y-6"
            initial={{ opacity: 0, x: -70, rotateY: 12, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-accentBlue/10 border border-accentBlue/30 text-accentCyan text-xs font-mono backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accentCyan opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accentCyan" />
              </span>
              <span className="font-semibold uppercase tracking-wider">
                {personal?.availabilityStatus || personal?.availability || 'Available to Join Immediately'}
              </span>
            </div>

            {/* Name Heading */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none uppercase">
                {personal?.fullName || personal?.name || ''}
              </h1>

              {personal?.professionalTitle && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-bgCard border border-borderGlass text-xs font-mono text-accentCyan font-bold">
                    {personal.professionalTitle}
                  </span>
                </div>
              )}
            </div>

            {/* Narrative Bio */}
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-2xl">
              {personal.tagline}
            </p>

            {/* 3D Animated Auto-Rotating Technology Stack Marquee */}
            <TechStack3DMarquee />

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <a
                href="#projects"
                onClick={(e) => handleScroll(e, 'projects')}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white font-bold text-sm shadow-glow-blue hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2.5 group cursor-pointer"
              >
                <span>View Production Work</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#contact"
                onClick={(e) => handleScroll(e, 'contact')}
                className="px-7 py-3.5 rounded-xl bg-bgCard border border-borderGlass text-gray-200 font-bold text-sm hover:bg-bgCardHover hover:text-white hover:border-borderHighlight transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Contact Ashish</span>
              </a>

              {resume && resume.downloadUrl && (
                <a
                  href={resume.downloadUrl}
                  onClick={handleDownloadResume}
                  className="px-7 py-3.5 rounded-xl bg-accentBlue/20 border border-accentBlue/40 text-accentCyan font-bold text-sm hover:bg-accentBlue/30 hover:border-accentBlue/60 hover:text-white transition-all flex items-center gap-2.5 cursor-pointer shadow-glow-blue/20 group"
                  aria-label="Download Resume"
                >
                  <Download className="w-4 h-4 text-accentCyan group-hover:scale-110 transition-transform" />
                  <span>Download Resume</span>
                </a>
              )}
            </div>

          </motion.div>

          {/* Right Column: 3D Tilt Photo Frame - 3D Spatial Fly-in & Exit Blur */}
          <motion.div 
            className="lg:col-span-5 flex justify-center"
            initial={{ opacity: 0, x: 70, scale: 0.88, rotateY: -12, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, x: 0, scale: 1, rotateY: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.15 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                rotateX,
                rotateY,
                transformStyle: 'preserve-3d',
              }}
              className="relative w-full max-w-sm aspect-[4/5] rounded-3xl p-3 glass-panel border border-accentBlue/30 shadow-2xl perspective-1000 group cursor-pointer"
            >
              {/* Photo Frame Container */}
              <div 
                className="relative w-full h-full rounded-2xl overflow-hidden bg-bgVoid border border-borderGlass isolate"
                style={{ 
                  transform: 'translateZ(30px)',
                  borderRadius: '1rem',
                  WebkitMaskImage: '-webkit-radial-gradient(white, black)'
                }}
              >
                {(personal?.photoUrl || personal?.profileImageId) ? (
                  <img 
                    src={personal.photoUrl || personal.profileImageId} 
                    alt={personal?.name || personal?.fullName || 'Ashishkumar Dudhat'} 
                    className="w-full h-full object-cover object-top rounded-2xl group-hover:scale-105 transition-transform duration-700 pointer-events-none" 
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-bgVoid via-bgSurface to-bgCard p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                    <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-accentBlue/30 via-accentCyan/20 to-accentIndigo/30 border-2 border-accentCyan/50 flex items-center justify-center shadow-glow-blue mb-4 group-hover:scale-105 transition-transform duration-500">
                      <span className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accentCyan via-white to-accentBlue tracking-wider font-mono">
                        {(() => {
                          const n = personal?.name || personal?.fullName || 'Ashishkumar Dudhat';
                          const parts = n.trim().split(/\s+/);
                          return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : n.substring(0, 2).toUpperCase();
                        })()}
                      </span>
                    </div>
                    <div className="relative z-10 px-3.5 py-1.5 rounded-full bg-accentBlue/10 border border-accentBlue/30 text-accentCyan text-[11px] font-mono flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>Senior Full Stack Lead</span>
                    </div>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-bgVoid via-transparent to-transparent opacity-80" />

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-bgVoid/90 backdrop-blur-md border border-borderGlass">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{personal.name}</p>
                      <p className="text-xs font-mono text-accentCyan">8+ Years Senior Software Engineer</p>
                    </div>
                    <div className="p-2 rounded-lg bg-accentBlue/20 border border-accentBlue/40 text-accentCyan">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating 3D Badge 1 */}
              <div 
                className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-bgSurface border border-accentBlue/40 text-xs font-mono text-white shadow-xl flex items-center gap-2"
                style={{ transform: 'translateZ(50px)' }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Full Stack & APIs</span>
              </div>



            </motion.div>
          </motion.div>

        </div>

        {/* 4 Quantitative Hero Stat Cards - 3D Zoom & Depth Exit Blur */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {heroStats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50, scale: 0.82, filter: 'blur(5px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
              className="h-full"
            >
              <Card3D depth={12} glowColor="rgba(37, 99, 235, 0.2)" className="h-full">
                <div className="p-6 rounded-2xl bg-bgCard/90 border border-borderGlass hover:border-accentBlue/40 transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3 min-h-[2.5rem]">
                      <span className="text-xs font-mono text-gray-400 uppercase font-semibold leading-tight">{stat.label}</span>
                      <div className="p-2 rounded-lg bg-bgVoid border border-borderGlass flex-shrink-0">
                        {statIcons[stat.iconName || 'Briefcase'] || <Briefcase className="w-5 h-5 text-accentCyan" />}
                      </div>
                    </div>
                    <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
                      {stat.value}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 font-mono pt-3 border-t border-borderGlass/50 mt-2">
                    {stat.description}
                  </p>
                </div>
              </Card3D>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
