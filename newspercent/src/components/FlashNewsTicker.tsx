import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { cn } from '../lib/utils';
const FlashNewsTicker: React.FC = () => {
  const [headlines, setHeadlines] = useState<any[]>([]);
  const isLight = true;

  useEffect(() => {
    const fetchFlash = async () => {
      try {
        const res = await api.get('/api/flash');
        setHeadlines(res.data);
      } catch (err) {
        console.error('Failed to fetch flash news:', err);
      }
    };
    fetchFlash();
    
    const interval = setInterval(fetchFlash, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (headlines.length === 0) return null;

  // Duplicate headlines to ensure they fill the scrolling area and loop seamlessly
  const displayHeadlines = [...headlines, ...headlines, ...headlines];

  return (
    <div className={cn(
      "w-full h-8 flex items-center overflow-hidden border-y transition-all duration-500",
      isLight 
        ? "bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_4px_rgba(0,0,0,0.02)]" 
        : "bg-black border-white/5"
    )}>
      {/* STATIC BADGE */}
      <div className={cn(
        "h-full px-3 flex items-center gap-1 z-30 transition-all duration-500 shrink-0 border-r",
        isLight 
          ? "bg-[#FFF9E6] border-[#FDE68A]" 
          : "bg-[#1A1A1B] border-white/5"
      )}>
        <span className={cn(
          "text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-colors duration-500",
          isLight ? "text-primary" : "text-primary"
        )}>
          ⚡ FLASH |
        </span>
      </div>

      {/* SCROLLING CONTENT */}
      <div className="flex-1 h-full overflow-hidden relative flex items-center">
        <style>{`
          @keyframes flash-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.333%); }
          }
          .flash-marquee-container:hover .flash-marquee-content {
            animation-play-state: paused;
          }
        `}</style>
        
        <div className="flash-marquee-container flex-1 overflow-hidden relative py-0.5">
          <div 
            className="flash-marquee-content flex gap-8 whitespace-nowrap"
            style={{
              animation: 'flash-marquee 50s linear infinite',
              width: 'max-content'
            }}
          >
            {displayHeadlines.map((item, index) => (
              <div 
                key={`${item._id}-${index}`} 
                className="inline-flex items-center gap-8"
                style={{ paddingRight: '32px' }}
              >
                <div className={cn(
                  "w-1 h-1 rounded-full shrink-0 transition-colors duration-500",
                  isLight ? "bg-primary" : "bg-primary shadow-[0_0_6px_rgba(255,87,34,0.4)]"
                )} />
                <span className={cn(
                  "text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.5px] leading-none transition-colors duration-500",
                  isLight ? "text-[#333333]" : "text-white"
                )}>
                  {item.headline}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FADE OVERLAYS */}
        <div className={cn(
          "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l to-transparent z-10 pointer-events-none transition-all duration-500",
          isLight ? "from-white" : "from-black"
        )} />
      </div>
    </div>
  );
};

export default FlashNewsTicker;
