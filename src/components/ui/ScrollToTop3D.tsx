import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop3D: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 350) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.15, y: -4 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="fixed bottom-8 right-8 z-40 p-3.5 rounded-2xl bg-bgSurface/90 border border-accentBlue text-white shadow-2xl backdrop-blur-xl group cursor-pointer"
          aria-label="Scroll back to top"
        >
          <div className="relative z-10 flex items-center justify-center">
            <ArrowUp className="w-5 h-5 text-accentCyan group-hover:-translate-y-1 transition-transform" />
          </div>

          {/* 3D Specular Glow Ring */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accentCyan to-accentBlue opacity-40 blur-md group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
