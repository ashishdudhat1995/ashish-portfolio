import { useState, useEffect, lazy, Suspense } from 'react';
import { BackgroundCanvas } from './components/canvas/BackgroundCanvas';
import { Navbar } from './components/navigation/Navbar';
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { EducationSection } from './components/sections/EducationSection';
import { ContactSection } from './components/sections/ContactSection';
import { Footer } from './components/ui/Footer';
import { Cursor3D } from './components/ui/Cursor3D';
import { ScrollToTop3D } from './components/ui/ScrollToTop3D';
import { SeoHead } from './components/common/SeoHead';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { portfolioService } from './services/portfolioService';
import { portfolioData } from './data/portfolioData';
import type { PortfolioData } from './types/portfolio';

const AdminPage = lazy(() => import('./components/admin/AdminPage').then(m => ({ default: m.AdminPage })));

export function App() {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [liveData, setLiveData] = useState<PortfolioData>(portfolioData);

  // Load public sanitized portfolio data (filters out enabled === false and sorts by order)
  const loadPublicPortfolio = async () => {
    const data = await portfolioService.getPublicPortfolio();
    if (data) {
      setLiveData(data);
    }
  };

  useEffect(() => {
    loadPublicPortfolio();

    // Check URL hash or path for Admin route
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin' || path === '/admin' || path.startsWith('/admin/') || path.endsWith('/admin')) {
        setIsAdminOpen(true);
      } else {
        setIsAdminOpen(false);
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);

    // Keyboard shortcut (Ctrl + Shift + A) to toggle Admin CMS
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (isAdminOpen) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-bgVoid text-white flex items-center justify-center font-mono text-sm">
          Loading Admin CMS...
        </div>
      }>
        <AdminPage 
          onClose={() => {
            window.location.hash = '';
            setIsAdminOpen(false);
            loadPublicPortfolio(); // Refresh live site when exiting admin
          }} 
        />
      </Suspense>
    );
  }

  return (
    <div className="relative min-h-screen bg-bgVoid text-gray-100 selection:bg-accentBlue selection:text-white">
      <SeoHead />
      <Cursor3D />
      <BackgroundCanvas />
      <Navbar />
      
      <main className="relative z-10">
        <ErrorBoundary fallbackSectionName="Hero Section">
          <HeroSection personal={liveData.personal} heroStats={liveData.heroStats} resume={liveData.resume} />
        </ErrorBoundary>
        
        <ErrorBoundary fallbackSectionName="About Section">
          <AboutSection about={liveData.about} />
        </ErrorBoundary>

        <ErrorBoundary fallbackSectionName="Experience Section">
          <ExperienceSection experience={liveData.experience} />
        </ErrorBoundary>

        <ErrorBoundary fallbackSectionName="Skills Section">
          <SkillsSection skills={liveData.skills} />
        </ErrorBoundary>

        <ErrorBoundary fallbackSectionName="Projects Section">
          <ProjectsSection projects={liveData.projects} />
        </ErrorBoundary>

        <ErrorBoundary fallbackSectionName="Education Section">
          <EducationSection education={liveData.education} />
        </ErrorBoundary>

        <ErrorBoundary fallbackSectionName="Contact Section">
          <ContactSection personal={liveData.personal} />
        </ErrorBoundary>
      </main>

      <Footer personal={liveData.personal} />
      <ScrollToTop3D />
    </div>
  );
}

export default App;
