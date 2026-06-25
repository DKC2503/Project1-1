import React from 'react';
import { Home, TrendingUp, DollarSign, Zap, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface MobileBottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onMenuClick: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ 
  activeTab, 
  onTabChange, 
  onMenuClick 
}) => {
  const location = useLocation();

  const handleTabClick = (tab: string, e: React.MouseEvent) => {
    if (onTabChange) {
      e.preventDefault();
      onTabChange(tab);
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--background-deep)]/95 backdrop-blur-md border-t border-[var(--glass-border)] z-45 flex items-center justify-around px-4 shadow-lg">
      <Link 
        to="/" 
        onClick={(e) => handleTabClick('home', e)}
        className={cn(
          "flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-wider transition-colors",
          (activeTab === 'home' || (!activeTab && location.pathname === '/')) ? "text-primary" : "text-[var(--text-secondary)]"
        )}
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>
      
      <a 
        href="#trending" 
        onClick={(e) => handleTabClick('trending', e)}
        className={cn(
          "flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-wider transition-colors",
          activeTab === 'trending' ? "text-primary" : "text-[var(--text-secondary)]"
        )}
      >
        <TrendingUp className="w-4 h-4" />
        <span>Trending</span>
      </a>

      <a 
        href="#markets" 
        onClick={(e) => handleTabClick('markets', e)}
        className={cn(
          "flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-wider transition-colors",
          activeTab === 'markets' ? "text-primary" : "text-[var(--text-secondary)]"
        )}
      >
        <DollarSign className="w-4 h-4" />
        <span>Markets</span>
      </a>

      <a 
        href="#flash" 
        onClick={(e) => handleTabClick('flash', e)}
        className={cn(
          "flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-wider transition-colors",
          activeTab === 'flash' ? "text-primary" : "text-[var(--text-secondary)]"
        )}
      >
        <Zap className="w-4 h-4" />
        <span>Flash</span>
      </a>

      <button 
        onClick={onMenuClick}
        className="flex flex-col items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:text-primary transition-colors"
      >
        <Menu className="w-4 h-4" />
        <span>Menu</span>
      </button>
    </div>
  );
};

