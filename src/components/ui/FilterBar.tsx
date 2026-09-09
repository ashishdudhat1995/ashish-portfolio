import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FilterOption {
  id: string;
  title: string;
}

interface FilterBarProps {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ options, selectedId, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative flex items-center gap-2 w-full pt-2">
      {/* Left Scroll Button */}
      <button
        type="button"
        onClick={handleScrollLeft}
        className="p-2 rounded-xl bg-bgCard border border-borderGlass text-gray-300 hover:text-white hover:border-accentBlue transition-colors flex-shrink-0 cursor-pointer shadow-md"
        aria-label="Scroll filter left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Filter Pills Horizontal Scroll Container */}
      <div 
        ref={containerRef}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full py-1"
      >
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`px-4 py-2 rounded-xl text-xs font-mono whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-accentBlue text-white font-bold shadow-glow-blue'
                  : 'bg-bgCard text-gray-300 border border-borderGlass hover:bg-bgCardHover hover:text-white'
              }`}
            >
              {option.title}
            </button>
          );
        })}
      </div>

      {/* Right Scroll Button */}
      <button
        type="button"
        onClick={handleScrollRight}
        className="p-2 rounded-xl bg-bgCard border border-borderGlass text-gray-300 hover:text-white hover:border-accentBlue transition-colors flex-shrink-0 cursor-pointer shadow-md"
        aria-label="Scroll filter right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
