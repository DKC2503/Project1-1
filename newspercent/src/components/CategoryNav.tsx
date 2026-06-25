import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const navLinks = [
  { name: 'National', href: '/category/national' },
  { name: 'Global', href: '/category/global' },
  { name: 'Politics', href: '/category/politics' },
  { name: 'Business', href: '/category/business' },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Entertainment', href: '/category/entertainment' },
  { name: 'Automobile', href: '/category/automobile' },
  { name: 'Lifestyle', href: '/category/lifestyle' },
  { name: 'Movies', href: '/category/movies' },
  { name: 'Startups', href: '/category/startups' },
  { name: 'Studies', href: '/category/studies' },
  { name: 'Case Studies', href: '/category/case-studies' },
  { name: 'Technology', href: '/category/technology' },
];

const CategoryNav: React.FC = () => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      updateScrollButtons();
      return () => {
        container.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="w-full bg-[var(--background-deep)] border-b border-[var(--glass-border)] py-4 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-8 relative flex items-center">
        {/* Left Scroll Button */}
        <AnimatePresence>
          {showLeftArrow && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => scroll('left')}
              className="absolute left-4 z-20 p-2 bg-[var(--background-deep)] border border-[var(--glass-border)] rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar w-full px-4"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-all duration-300 px-6 py-2.5 rounded-full border",
                location.pathname === link.href 
                  ? "text-primary bg-primary/5 border-primary/20" 
                  : "text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Scroll Button */}
        <AnimatePresence>
          {showRightArrow && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => scroll('right')}
              className="absolute right-4 z-20 p-2 bg-[var(--background-deep)] border border-[var(--glass-border)] rounded-full text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default CategoryNav;
