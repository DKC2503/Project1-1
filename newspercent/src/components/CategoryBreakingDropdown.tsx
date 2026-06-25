import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';

export interface CategoryItem {
  value: string;
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORY_ITEMS: CategoryItem[] = [
  { value: 'Technology', label: 'Technology', emoji: '💻', color: '#FF453A' },
  { value: 'Business', label: 'Business', emoji: '💼', color: '#0A84FF' },
  { value: 'Politics', label: 'Politics', emoji: '🏛', color: '#BF5AF2' },
  { value: 'Sports', label: 'Sports', emoji: '🏏', color: '#30D158' },
  { value: 'Entertainment', label: 'Entertainment', emoji: '🎬', color: '#FF379F' },
  { value: 'Science', label: 'Science', emoji: '🔬', color: '#FFD60A' },
  { value: 'Health', label: 'Health', emoji: '❤️', color: '#FF375F' },
  { value: 'Education', label: 'Education', emoji: '🎓', color: '#5E5CE6' }
];

interface CategoryBreakingDropdownProps {
  onSelect: (category: string) => void;
  onClose: () => void;
  isOpen: boolean;
  disabled?: boolean;
}

export const CategoryBreakingDropdown: React.FC<CategoryBreakingDropdownProps> = ({
  onSelect,
  onClose,
  isOpen,
  disabled = false
}) => {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter categories based on search
  const filtered = CATEGORY_ITEMS.filter(cat =>
    cat.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setActiveIndex(0);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || disabled) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIndex]) {
          onSelect(filtered[activeIndex].value);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, disabled, filtered, activeIndex, onSelect, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        const container = listRef.current;
        const scrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const activeTop = activeEl.offsetTop;
        const activeHeight = activeEl.clientHeight;

        if (activeTop < scrollTop) {
          container.scrollTop = activeTop;
        } else if (activeTop + activeHeight > scrollTop + containerHeight) {
          container.scrollTop = activeTop + activeHeight - containerHeight;
        }
      }
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute left-0 bottom-full mb-2 w-64 bg-[var(--background-deep)] border border-[var(--glass-border)] rounded-2xl shadow-xl p-2 z-50 transition-all duration-300",
        "animate-in fade-in slide-in-from-bottom-2 duration-200"
      )}
    >
      {/* Search Input */}
      <div className="relative mb-2 px-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]/60" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Filter categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          disabled={disabled}
          className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-2 pl-9 pr-3 text-[10px] uppercase tracking-widest font-black text-[var(--text-primary)] focus:outline-none transition-all font-manrope placeholder-[var(--text-secondary)]/50"
        />
      </div>

      {/* Categories List */}
      <div
        ref={listRef}
        className="max-h-[220px] overflow-y-auto flex flex-col gap-0.5 pr-1 scrollbar-thin scrollbar-thumb-[var(--glass-border)] scrollbar-track-transparent"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--glass-border) transparent'
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((cat, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={cat.value}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(cat.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-[10px] font-black uppercase tracking-widest transition-all duration-200 border border-transparent",
                  isActive
                    ? "bg-primary/10 text-primary border-primary/20 scale-[1.02]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] hover:scale-[1.01]"
                )}
                style={{
                  borderLeft: isActive ? `3px solid ${cat.color}` : `3px solid transparent`
                }}
              >
                <span className="text-sm flex-shrink-0">{cat.emoji}</span>
                <span className="flex-1 font-manrope">{cat.label}</span>
              </button>
            );
          })
        ) : (
          <div className="py-4 text-center text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]/40">
            No categories found
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryBreakingDropdown;
