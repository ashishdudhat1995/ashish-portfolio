import React from 'react';
import { motion } from 'framer-motion';

interface TechItem {
  name: string;
  color: string;
  bgGlow: string;
  iconSvg: React.ReactNode;
}

const TECH_STACK: TechItem[] = [
  {
    name: 'Angular',
    color: '#DD0031',
    bgGlow: 'rgba(221, 0, 49, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 256 272" fill="none">
        <path d="M128 0L0 45.7L19.5 212.8L128 272L236.5 212.8L256 45.7L128 0Z" fill="#DD0031" />
        <path d="M128 0V272L236.5 212.8L256 45.7L128 0Z" fill="#C3002F" />
        <path d="M128 34.3L57.5 192.4H88.3L102.5 157.1H153.3L167.5 192.4H198.3L128 34.3ZM128 95.3L144.1 133.5H111.9L128 95.3Z" fill="white" />
      </svg>
    )
  },
  {
    name: 'React.js',
    color: '#61DAFB',
    bgGlow: 'rgba(97, 218, 251, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5 animate-[spin_10s_linear_infinite]" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="10" fill="#61DAFB" />
        <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#61DAFB" strokeWidth="4" />
        <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#61DAFB" strokeWidth="4" transform="rotate(60 50 50)" />
        <ellipse cx="50" cy="50" rx="38" ry="14" stroke="#61DAFB" strokeWidth="4" transform="rotate(120 50 50)" />
      </svg>
    )
  },
  {
    name: 'TypeScript',
    color: '#3178C6',
    bgGlow: 'rgba(49, 120, 198, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5 rounded" viewBox="0 0 128 128" fill="none">
        <rect width="128" height="128" rx="16" fill="#3178C6" />
        <path d="M72.2 101.4C73.8 104.2 76.5 106.2 80.2 106.2C84.4 106.2 87.2 104 87.2 100C87.2 92.4 75.8 89.2 75.8 77.2C75.8 69.4 82 63.8 92.4 63.8C98.4 63.8 103.2 66 106 70.8L97.2 76.2C95.4 73.4 93.4 72 90.8 72C87.4 72 85.2 73.8 85.2 76.6C85.2 83.6 96.6 86.4 96.6 99C96.6 107.6 89.6 113.6 79 113.6C70.6 113.6 64.6 109 61.6 102.2L72.2 101.4ZM58.2 64.8V112.6H49.4V72.8H34.4V64.8H58.2Z" fill="white" />
      </svg>
    )
  },
  {
    name: 'Node.js',
    color: '#5FA04E',
    bgGlow: 'rgba(95, 160, 78, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 256 256" fill="none">
        <path d="M128 12L232 72V192L128 252L24 192V72L128 12Z" fill="#5FA04E" />
        <path d="M128 12V252L232 192V72L128 12Z" fill="#4B853E" />
        <path d="M128 126L164 105V147L128 168V126Z" fill="#FFFFFF" />
      </svg>
    )
  },
  {
    name: 'Next.js',
    color: '#FFFFFF',
    bgGlow: 'rgba(255, 255, 255, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 180 180" fill="none">
        <circle cx="90" cy="90" r="85" fill="black" stroke="#333" strokeWidth="6" />
        <path d="M149.5 156.4L78 64V126H64V54H78.8L139.2 131.6L149.5 156.4Z" fill="white" />
        <path d="M116 54H130V105H116V54Z" fill="white" />
      </svg>
    )
  },
  {
    name: 'AWS Cloud',
    color: '#FF9900',
    bgGlow: 'rgba(255, 153, 0, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 100 60" fill="none">
        <path d="M22 35 C15 35, 10 28, 15 20 C18 15, 26 15, 30 20 C35 12, 48 12, 52 20 C58 15, 68 18, 70 25 C76 25, 80 30, 78 35 Z" fill="#FF9900" />
        <path d="M20 48 Q 50 60, 80 48 M72 44 L80 48 L76 54" stroke="#FF9900" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
    )
  },
  {
    name: 'Docker',
    color: '#2496ED',
    bgGlow: 'rgba(36, 150, 237, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M13 8.5h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm-3 3h2v2H4zm3 0h2v2H7zm3 0h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm-9 3h2v2H7z" fill="#2496ED" />
        <path d="M22.5 12.5c-.5-.3-1.5-.4-2.2-.2-.2-.6-.6-1.1-1.1-1.5l-.4-.3-.3.4c-.5.7-.7 1.6-.6 2.5 0 .2.1.4.1.6-1.2.2-2.3.8-3.1 1.7H1v1.2C1 19.3 4.2 21 11.2 21c6.5 0 10.6-2.5 11.3-6.8.4-.1.8-.4 1-.8l.2-.5-.7-.4z" fill="#2496ED" />
      </svg>
    )
  },
  {
    name: 'PostgreSQL',
    color: '#4169E1',
    bgGlow: 'rgba(65, 105, 225, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none">
        <path d="M32 4C18 4 10 14 10 28C10 44 22 56 32 60C42 56 54 44 54 28C54 14 46 4 32 4Z" fill="#4169E1" opacity="0.3" />
        <path d="M32 8C22 8 16 16 16 28C16 40 24 50 32 54C40 50 48 40 48 28C48 16 42 8 32 8Z" stroke="#336791" strokeWidth="4" fill="none" />
        <circle cx="26" cy="24" r="3" fill="#336791" />
        <circle cx="38" cy="24" r="3" fill="#336791" />
      </svg>
    )
  },
  {
    name: 'MongoDB',
    color: '#47A248',
    bgGlow: 'rgba(71, 162, 72, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 1.5C12 1.5 6.5 7.5 6.5 13.5C6.5 16.5 8.5 19.5 11 21V22.5H13V21C15.5 19.5 17.5 16.5 17.5 13.5C17.5 7.5 12 1.5 12 1.5ZM12.5 19.5V4.5C14.5 8.5 16 12 16 13.5C16 16 14.5 18.5 12.5 19.5Z" fill="#47A248" />
      </svg>
    )
  },
  {
    name: 'Tailwind CSS',
    color: '#06B6D4',
    bgGlow: 'rgba(6, 182, 212, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 100 60" fill="none">
        <path d="M26 12 C18 12, 12 20, 16 28 C18 22, 24 20, 28 22 C34 25, 38 34, 46 34 C54 34, 60 26, 56 18 C54 24, 48 26, 44 24 C38 21, 34 12, 26 12 Z M54 32 C46 32, 40 40, 44 48 C46 42, 52 40, 56 42 C62 45, 66 54, 74 54 C82 54, 88 46, 84 38 C82 44, 76 46, 72 44 C66 41, 62 32, 54 32 Z" fill="#06B6D4" />
      </svg>
    )
  },
  {
    name: 'Redis',
    color: '#DC382D',
    bgGlow: 'rgba(220, 56, 45, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M2 7.5L12 3L22 7.5L12 12L2 7.5Z" fill="#DC382D" />
        <path d="M2 12L12 16.5L22 12" stroke="#DC382D" strokeWidth="2" fill="none" />
        <path d="M2 16.5L12 21L22 16.5" stroke="#DC382D" strokeWidth="2" fill="none" />
      </svg>
    )
  },
  {
    name: 'GraphQL',
    color: '#E10098',
    bgGlow: 'rgba(225, 0, 152, 0.15)',
    iconSvg: (
      <svg className="w-5 h-5" viewBox="0 0 100 100" fill="none">
        <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" stroke="#E10098" strokeWidth="6" fill="none" />
        <circle cx="50" cy="10" r="8" fill="#E10098" />
        <circle cx="85" cy="30" r="8" fill="#E10098" />
        <circle cx="85" cy="70" r="8" fill="#E10098" />
        <circle cx="50" cy="90" r="8" fill="#E10098" />
        <circle cx="15" cy="70" r="8" fill="#E10098" />
        <circle cx="15" cy="30" r="8" fill="#E10098" />
      </svg>
    )
  }
];

export const TechStack3DMarquee: React.FC = () => {
  const isReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Duplicate items for infinite seamless scroll ribbon
  const marqueeItems = [...TECH_STACK, ...TECH_STACK, ...TECH_STACK];

  return (
    <div className="w-full py-2 font-mono overflow-hidden relative">
      <div className="relative py-1 perspective-1000">
        <motion.div
          className="flex items-center gap-3 w-max cursor-grab active:cursor-grabbing"
          animate={isReducedMotion ? {} : { x: ['0%', '-33.333%'] }}
          transition={isReducedMotion ? {} : {
            duration: 25,
            ease: 'linear',
            repeat: Infinity,
          }}
          whileHover={isReducedMotion ? {} : { animationPlayState: 'paused' }}
        >
          {marqueeItems.map((item, idx) => (
            <motion.div
              key={`${item.name}-${idx}`}
              whileHover={{ 
                scale: 1.08, 
                rotateY: 15, 
                rotateX: -8,
                translateZ: 20,
                boxShadow: `0 10px 25px -5px ${item.bgGlow}`
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              style={{
                transformStyle: 'preserve-3d',
                borderColor: 'rgba(255, 255, 255, 0.08)'
              }}
              className="px-3.5 py-2 rounded-xl bg-bgCard/80 border border-borderGlass backdrop-blur-md flex items-center gap-2.5 flex-shrink-0 transition-colors duration-300 hover:border-accentCyan/50 group/item shadow-md"
            >
              <div 
                className="p-1.5 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover/item:scale-110 flex-shrink-0"
                style={{ backgroundColor: item.bgGlow }}
              >
                {item.iconSvg}
              </div>

              <span className="text-xs font-bold text-gray-200 group-hover/item:text-white tracking-wide">
                {item.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
