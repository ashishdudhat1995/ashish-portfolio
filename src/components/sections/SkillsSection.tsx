import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, 
  Cpu, 
  Database, 
  Cloud, 
  Layers, 
  Wrench, 
  GitBranch,
  Monitor,
  Sparkles,
  Terminal
} from 'lucide-react';
import type { SkillItem } from '../../types/portfolio';
import { Card3D } from '../ui/Card3D';
import { FilterBar } from '../ui/FilterBar';

interface SkillsSectionProps {
  skills?: any[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ 
  skills: inputSkills 
}) => {
  const skills = Array.isArray(inputSkills) ? inputSkills : [];
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSkillToast, setActiveSkillToast] = useState<SkillItem | null>(null);

  const categoryIconMap: Record<string, React.ReactNode> = {
    languages: <Code2 className="w-5 h-5 text-accentCyan" />,
    frontend: <Monitor className="w-5 h-5 text-accentBlue" />,
    backend: <Cpu className="w-5 h-5 text-accentBlue" />,
    architecture: <Layers className="w-5 h-5 text-accentIndigo" />,
    databases: <Database className="w-5 h-5 text-indigo-400" />,
    'cloud-devops': <Cloud className="w-5 h-5 text-emerald-400" />,
    'ci-cd': <GitBranch className="w-5 h-5 text-amber-400" />,
    'testing-tools': <Wrench className="w-5 h-5 text-rose-400" />,
    os: <Terminal className="w-5 h-5 text-sky-400" />
  };

  const categoriesFilterList = [
    { id: 'All', title: 'All Stack' },
    ...skills.map(s => ({ id: s.id, title: s.title }))
  ];

  const filteredCategories = selectedCategory === 'All'
    ? skills
    : skills.filter(s => s.id === selectedCategory);

  return (
    <section id="skills" className="py-24 relative z-10 border-t border-borderGlass/40">
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
              <span>Full-Stack Systems Topology</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
              Engineering Across the Entire Stack: <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accentCyan via-accentBlue to-accentIndigo">
                From Interface to Infrastructure
              </span>
            </h2>
          </div>

          {/* Interactive Filter Bar with Left/Right Scroll Buttons */}
          <FilterBar
            options={categoriesFilterList}
            selectedId={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </motion.div>

        {/* 3D Stack Architecture Canvas Node */}
        <motion.div 
          className="mb-16 glass-panel p-8 rounded-3xl border border-borderGlass relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.92, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-borderGlass text-xs font-mono text-gray-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-accentCyan" />
              <span className="text-white font-bold">SYSTEMS_TOPOLOGY_MAP</span>
            </div>
            <span className="text-accentCyan font-semibold">9 RESUME CATEGORIES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs font-mono">
            
            <div className="p-4 rounded-2xl bg-bgCard border border-borderGlass space-y-2">
              <p className="text-[10px] text-accentCyan uppercase font-bold">1. PRESENTATION LAYER</p>
              <p className="text-sm font-bold text-white">Angular / React.js / Next.js</p>
              <p className="text-gray-400 text-[11px]">Redux, Context API, Tailwind CSS, ES6+/TS</p>
            </div>

            <div className="p-4 rounded-2xl bg-bgCard border border-borderGlass space-y-2">
              <p className="text-[10px] text-accentBlue uppercase font-bold">2. SERVICE LAYER</p>
              <p className="text-sm font-bold text-white">Node.js / Express / NestJS</p>
              <p className="text-gray-400 text-[11px]">REST APIs, GraphQL, Socket.IO, RabbitMQ</p>
            </div>

            <div className="p-4 rounded-2xl bg-bgCard border border-borderGlass space-y-2">
              <p className="text-[10px] text-indigo-400 uppercase font-bold">3. DATASTORE LAYER</p>
              <p className="text-sm font-bold text-white">MongoDB / MySQL / Postgres</p>
              <p className="text-gray-400 text-[11px]">Redis In-Memory Cache (40% Latency Drop)</p>
            </div>

            <div className="p-4 rounded-2xl bg-bgCard border border-borderGlass space-y-2">
              <p className="text-[10px] text-emerald-400 uppercase font-bold">4. CLOUD INFRASTRUCTURE</p>
              <p className="text-sm font-bold text-white">AWS (EC2, S3, RDS, Lambda)</p>
              <p className="text-gray-400 text-[11px]">Docker Containerization, GCP, GitHub CI/CD</p>
            </div>

          </div>
        </motion.div>

        {/* Categories Grid with Card3D */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(5px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{ duration: 0.5, delay: idx * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Card3D depth={12} glowColor="rgba(37, 99, 235, 0.2)">
                <div className="p-7 rounded-3xl bg-bgCard/90 border border-borderGlass hover:border-accentBlue/40 transition-all h-full flex flex-col justify-between">
                  <div>
                    {/* Category Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-bgVoid border border-borderGlass">
                        {categoryIconMap[cat.id] || <Sparkles className="w-5 h-5 text-accentCyan" />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white leading-tight">{cat.title}</h3>
                        {cat.subtitle && (
                          <p className="text-xs font-mono text-gray-400">{cat.subtitle}</p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed mb-6 font-sans">
                      {cat.description}
                    </p>

                    {/* Skill Items List */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {cat.skills.map((skill: any, sIdx: number) => {
                        const name = typeof skill === 'string' ? skill : (skill.name || skill);
                        const isFeatured = typeof skill === 'string' ? false : Boolean(skill.featured || skill.isFeatured);
                        const toastObj = typeof skill === 'string' ? { name: skill, description: `${skill} skill tag` } : skill;

                        return (
                          <button
                            key={sIdx}
                            type="button"
                            onMouseEnter={() => setActiveSkillToast(toastObj)}
                            onMouseLeave={() => setActiveSkillToast(null)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all text-left ${
                              isFeatured
                                ? 'bg-bgVoid text-white border border-accentBlue/40 font-semibold hover:border-accentCyan shadow-sm'
                                : 'bg-bgVoid/60 text-gray-300 border border-borderGlass hover:border-gray-500'
                            }`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AWS Cloud Tree breakdown if present */}
                  {cat.id === 'cloud-devops' && (
                    <div className="mt-4 pt-4 border-t border-borderGlass/60 font-mono text-xs">
                      <p className="text-[10px] uppercase text-accentCyan mb-2 font-bold">
                        AWS CLOUD SERVICES TREE:
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        {['EC2', 'S3', 'RDS', 'Lambda', 'Route 53', 'CloudFront'].map((awsComp) => (
                          <span key={awsComp} className="px-2 py-0.5 rounded bg-bgVoid border border-accentBlue/30 text-accentCyan font-bold">
                            {awsComp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </Card3D>
            </motion.div>
          ))}
        </div>

        {/* Factual Skill Toast Banner */}
        <AnimatePresence>
          {activeSkillToast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-bgSurface border border-accentBlue text-white shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-1 text-xs font-mono text-accentCyan">
                <Sparkles className="w-4 h-4" />
                <span className="font-bold">{activeSkillToast.name}</span>
              </div>
              <p className="text-xs text-gray-300 font-mono leading-relaxed">
                {activeSkillToast.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
