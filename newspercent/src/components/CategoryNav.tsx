import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // Using a small tolerance (1.5px) for subpixel layout values
      setCanScrollLeft(scrollLeft > 1.5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1.5);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      // Also check scroll after a short delay to account for fonts/layout loading
      const timer = setTimeout(checkScroll, 100);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
        clearTimeout(timer);
      };
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <nav className="w-full bg-[var(--background-deep)] border-b border-[var(--glass-border)] py-4 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto relative flex items-center px-12">
        {/* Left Arrow Button */}
        <button
          onClick={() => scroll('left')}
          className={cn(
            "absolute left-2 p-2 text-[var(--text-primary)] hover:text-primary transition-all duration-300 z-10 hover:bg-[var(--surface-hover)] rounded-full cursor-pointer flex items-center justify-center",
            !canScrollLeft && "opacity-20 cursor-not-allowed hover:bg-transparent hover:text-[var(--text-secondary)]"
          )}
          disabled={!canScrollLeft}
          title="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar w-full py-1"
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

        {/* Right Arrow Button */}
        <button
          onClick={() => scroll('right')}
          className={cn(
            "absolute right-2 p-2 text-[var(--text-primary)] hover:text-primary transition-all duration-300 z-10 hover:bg-[var(--surface-hover)] rounded-full cursor-pointer flex items-center justify-center",
            !canScrollRight && "opacity-20 cursor-not-allowed hover:bg-transparent hover:text-[var(--text-secondary)]"
          )}
          disabled={!canScrollRight}
          title="Scroll Right"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </nav>
  );
};

export default CategoryNav;
