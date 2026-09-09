import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Menu, X, Terminal, ArrowUpRight } from 'lucide-react';
import { fetchPublicNavigation, fetchPublicPersonal } from '../../services/apiClient';

interface NavLinkItem {
  id: string;
  label: string;
  target: string;
  type?: string;
  openInNewTab?: boolean;
}

const DEFAULT_NAV_LINKS: NavLinkItem[] = [
  { id: 'home', label: 'Home', target: '#home' },
  { id: 'about', label: 'About', target: '#about' },
  { id: 'experience', label: 'Experience', target: '#experience' },
  { id: 'skills', label: 'Skills', target: '#skills' },
  { id: 'projects', label: 'Projects', target: '#projects' },
  { id: 'education', label: 'Education', target: '#education' },
  { id: 'contact', label: 'Contact', target: '#contact' },
];

export const Navbar: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [navLinks, setNavLinks] = useState<NavLinkItem[]>(DEFAULT_NAV_LINKS);
  const [personal, setPersonal] = useState<any>(null);

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    fetchPublicPersonal().then(p => { if (p) setPersonal(p); }).catch(() => {});
    fetchPublicNavigation().then((items) => {
      if (items && items.length > 0) {
        setNavLinks(items);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sectionLinks = navLinks.filter(link => link.target.startsWith('#'));
      const sections = sectionLinks.map(link => {
        const anchorId = link.target.replace(/^#/, '');
        return document.getElementById(anchorId);
      });
      const scrollPosition = window.scrollY + 120;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section) {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            const anchorId = sectionLinks[i].target.replace(/^#/, '');
            setActiveSection(anchorId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navLinks]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, link: NavLinkItem) => {
    setMobileMenuOpen(false);

    if (link.target.startsWith('#')) {
      e.preventDefault();
      const anchorId = link.target.replace(/^#/, '');

      if (anchorId === 'home' || anchorId === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection('home');
        return;
      }

      const element = document.getElementById(anchorId);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth',
        });
      }
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'bg-bgVoid/85 backdrop-blur-xl border-b border-borderGlass/60 py-3 shadow-2xl' 
        : 'bg-transparent py-5'
    }`}>
      
      {/* Top 3D Scroll Progress Line */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accentCyan via-accentBlue to-accentIndigo shadow-glow-cyan z-50"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <a 
          href="#home" 
          onClick={(e) => handleNavClick(e, { id: 'home', label: 'Home', target: '#home' })}
          className="flex items-center gap-2.5 font-mono group cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-accentBlue/10 border border-accentBlue/30 text-accentCyan group-hover:border-accentCyan transition-colors">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-wider block leading-none uppercase">
              {personal?.fullName || personal?.name || ''}
            </span>
            <span className="text-[10px] text-accentCyan tracking-widest uppercase">
              {personal?.professionalTitle || personal?.primaryRole || ''}
            </span>
          </div>
        </a>

        {/* Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 p-1.5 rounded-2xl bg-bgCard/60 border border-borderGlass backdrop-blur-md">
          {navLinks.map((link) => {
            const anchorId = link.target.replace(/^#/, '');
            const isActive = activeSection === anchorId;
            return (
              <a
                key={link.id}
                href={link.target}
                target={link.openInNewTab ? '_blank' : '_self'}
                rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={(e) => handleNavClick(e, link)}
                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer relative ${
                  isActive 
                    ? 'text-white font-bold' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-accentBlue/20 border border-accentBlue/40 rounded-xl shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Action Button */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, { id: 'contact', label: 'Contact', target: '#contact' })}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-accentBlue to-accentIndigo text-white text-xs font-mono font-bold shadow-glow-blue hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Let's Talk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2.5 rounded-xl bg-bgCard border border-borderGlass text-gray-300 hover:text-white cursor-pointer focus-visible:ring-2 focus-visible:ring-accentCyan focus-visible:outline-none"
          aria-label="Toggle Navigation Menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-bgCard/95 border-b border-borderGlass backdrop-blur-2xl px-4 py-6 space-y-3 font-mono text-sm"
        >
          {navLinks.map((link) => {
            const anchorId = link.target.replace(/^#/, '');
            const isActive = activeSection === anchorId;
            return (
              <a
                key={link.id}
                href={link.target}
                target={link.openInNewTab ? '_blank' : '_self'}
                rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={(e) => handleNavClick(e, link)}
                className={`block px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-accentBlue/20 text-accentCyan border border-accentBlue/40 font-bold' 
                    : 'text-gray-300 hover:bg-bgCardHover'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </motion.div>
      )}

    </header>
  );
};
