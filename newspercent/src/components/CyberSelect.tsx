import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
  colorClass?: string;
}

interface CyberSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  position?: 'absolute' | 'relative';
}

const CyberSelect: React.FC<CyberSelectProps> = ({ value, onChange, options, placeholder, position = 'absolute' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full bg-[var(--background-mid)] border border-[var(--glass-border)] rounded-2xl py-4 px-6 transition-all flex items-center justify-between group focus:outline-none",
          isOpen ? "border-primary/50 ring-2 ring-primary/10" : "hover:border-primary/30"
        )}
      >
        <div className="flex items-center gap-4">
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                  <selectedOption.icon className={cn("w-4 h-4", selectedOption.colorClass || "text-primary")} />
                </div>
              )}
              <span className="font-black text-[10px] uppercase tracking-widest text-[var(--text-primary)] font-manrope">
                {selectedOption.label}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest font-manrope">
              {placeholder || 'Select Classification'}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
          <ChevronDown className={cn(
            "w-4 h-4 transition-colors", 
            isOpen ? "text-primary" : "text-[var(--text-secondary)] group-hover:text-primary"
          )} />
        </motion.div>
      </button>

      {/* DROPDOWN PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              position === 'absolute' ? "absolute left-0 right-0 mt-3" : "relative mt-3",
              "z-[1000] rounded-[2rem] border border-[var(--glass-border)] bg-[var(--background-deep)] shadow-2xl overflow-hidden backdrop-blur-2xl"
            )}
          >
            <div className="max-h-80 overflow-y-auto custom-scrollbar p-3">
              {options.map((option) => {
                const isSelected = option.value === value;
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-xl transition-all group/item mb-1 last:mb-0",
                      isSelected 
                        ? "bg-primary/10 border border-primary/10" 
                        : "hover:bg-primary/5 border border-transparent"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      {Icon && (
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          isSelected ? "bg-primary text-white" : "bg-[var(--background-mid)] text-[var(--text-secondary)] group-hover/item:text-primary"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                      <span className={cn(
                        "text-[10px] uppercase tracking-widest font-black transition-colors",
                        isSelected ? "text-primary" : "text-[var(--text-secondary)] group-hover/item:text-[var(--text-primary)]"
                      )}>
                        {option.label}
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CyberSelect;
