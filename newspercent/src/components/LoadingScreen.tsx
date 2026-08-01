import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

// Separate asset reference for the loading screen logo
const LOADING_LOGO = '/logo.webp';

interface LoadingScreenProps {
  onComplete: () => void;
  subtext?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete, subtext }) => {
  const isPortalRoute = typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/author'));
  const isLight = !isPortalRoute || document.documentElement.classList.contains('light');

  console.log("[LOADING] Rendering LoadingScreen. isLight:", isLight);

  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    console.log("[LOADING] Effect started, timer set for 2s");
    const timer = setTimeout(() => {
      console.log("[LOADING] Timer completed, calling onComplete");
      onCompleteRef.current();
    }, 2000);
    return () => {
      console.log("[LOADING] Effect cleanup, timer cleared");
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-colors duration-500",
        isLight ? "bg-[#F8F9FA]" : "bg-black"
      )}
    >
      {/* Background Glow */}
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none transition-colors duration-500",
          isLight ? "bg-[#F5D76E]/20" : "bg-[#F5D76E]/10"
        )} 
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-12 relative z-10"
      >
        <div className="relative w-28 h-28 md:w-32 md:h-32 xl:w-36 xl:h-36 flex items-center justify-center">
          {/* Orbiting Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={cn(
              "absolute inset-0 rounded-full border-[1.5px] transition-all duration-500",
              isLight 
                ? "border-[#F5D76E]/45 border-t-[#F5D76E] shadow-[0_0_25px_rgba(245,215,110,0.55)]" 
                : "border-[#F5D76E]/30 border-t-[#F5D76E] shadow-[0_0_25px_rgba(245,215,110,0.45)]"
            )}
          />
          
          {/* Secondary Faint Ring */}
          <div className={cn(
            "absolute inset-[-10px] rounded-full border transition-colors duration-500",
            isLight ? "border-black/5" : "border-white/5"
          )} />

          {/* Central Circular Logo with Glow */}
          <div className={cn(
            "relative w-20 h-20 md:w-24 md:h-24 xl:w-28 xl:h-28 rounded-full flex items-center justify-center overflow-hidden border transition-all duration-500",
            isLight 
              ? "bg-white border-black/5 shadow-[0_0_55px_rgba(245,215,110,0.25)]" 
              : "bg-black border-white/10 shadow-[0_0_50px_rgba(245,215,110,0.25)]"
          )}>
            <img 
              src={LOADING_LOGO} 
              alt="NEWSPERCENT" 
              className="w-full h-full object-cover rounded-full"
            />
            {/* Inner Circular Glow Overlay */}
            <div className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-tr to-transparent pointer-events-none transition-colors duration-500",
              isLight ? "from-[#F5D76E]/15" : "from-[#F5D76E]/15"
            )} />
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-3">
          <motion.div 
            initial={{ letterSpacing: "0.2em", opacity: 0 }}
            animate={{ letterSpacing: "0.5em", opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="font-black text-4xl md:text-5xl tracking-[0.5em] font-lemon-milk ml-[0.5em]"
          >
            <span className={cn(
              "transition-colors duration-500 font-lemon-milk",
              isLight ? "text-[#1A1A1A]" : "text-white"
            )}>
              NEWS
            </span>
            <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
          </motion.div>
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.95, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={cn(
              "text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] xl:tracking-[0.4em] uppercase text-center max-w-[90vw] md:max-w-xl transition-colors duration-500 leading-relaxed px-4",
              isLight ? "text-[#4A4A4A]" : "text-[#F5D76E]/90"
            )}
          >
            {subtext || "South India's First Youth-Led Digital News Network"}
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
