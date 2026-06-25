import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const CATEGORIES = [
  'National', 'Global', 'Business', 'Sports', 'Automobile', 
  'Lifestyle', 'Movies', 'Startups', 'Studies', 'Case Studies', 'Technology'
];

interface CategorySelectorProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-6">
      <label className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] ml-2 opacity-50">
        Intelligence Classification
      </label>
      
      <div className="flex flex-wrap items-center gap-y-4 gap-x-2 px-2">
        {CATEGORIES.map((cat, index) => (
          <React.Fragment key={cat}>
            <button
              type="button"
              onClick={() => {
                console.log(`[CategorySelector] Selected Category: ${cat}`);
                onSelect(cat);
              }}
              className={cn(
                "relative py-2 px-1 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 hover:text-primary outline-none group",
                selected === cat ? "text-primary" : "text-[var(--text-secondary)]"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                {selected === cat && (
                  <motion.span 
                    layoutId="activeDot"
                    className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(255,59,48,0.8)]"
                  />
                )}
                {cat}
              </span>

              {/* Active Underline & Glow */}
              {selected === cat && (
                <>
                  <motion.div 
                    layoutId="activeUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_rgba(255,59,48,0.6)]"
                  />
                  <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full pointer-events-none" />
                </>
              )}
            </button>
            
            {/* Separator */}
            {index < CATEGORIES.length - 1 && (
              <span className="text-[var(--text-secondary)] opacity-10 font-thin text-lg">|</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
