import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const MESSAGES = [
  'Loading Article...',
  'Preparing Story...',
  'Fetching Latest Update...',
  'Opening News Report...'
];

const LOADING_LOGO = '/logo.webp';

const ArticleLoader: React.FC = () => {
  const isLight = !document.documentElement.classList.contains('dark');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setMessage(randomMsg);
  }, []);

  return (
    <div 
      className={cn(
        "min-h-screen fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-colors duration-500",
        isLight ? "bg-[#F8F9FA]" : "bg-black"
      )}
    >
      {/* Background Glow */}
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] blur-[100px] rounded-full pointer-events-none transition-all duration-500",
          isLight ? "bg-[#FFD84D]/10" : "bg-primary/5"
        )} 
      />

      <div className="flex flex-col items-center gap-8 relative z-10">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Orbiting Loader Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            className={cn(
              "absolute inset-0 rounded-full border-[1.5px] transition-all duration-500",
              isLight 
                ? "border-[#FFD84D]/25 border-t-[#FFD84D] shadow-[0_0_15px_rgba(255,216,77,0.3)]" 
                : "border-primary/10 border-t-primary shadow-[0_0_15px_rgba(255,77,45,0.2)]"
            )}
          />
          
          {/* Central Circular N% Logo */}
          <div className={cn(
            "relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden border transition-all duration-500",
            isLight 
              ? "bg-white border-black/5 shadow-[0_0_25px_rgba(255,216,77,0.1)]" 
              : "bg-black border-white/10 shadow-[0_0_25px_rgba(255,77,45,0.1)]"
          )}>
            <img 
              src={LOADING_LOGO} 
              alt="N%" 
              className="w-full h-full object-cover rounded-full"
            />
            {/* Inner Glow Overlay */}
            <div className={cn(
              "absolute inset-0 rounded-full bg-gradient-to-tr to-transparent pointer-events-none",
              isLight ? "from-[#FFD84D]/5" : "from-primary/5"
            )} />
          </div>
        </div>

        {/* Loading Text */}
        <motion.span 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "text-xs font-semibold tracking-[0.2em] uppercase transition-colors duration-500",
            isLight ? "text-[#666666]" : "text-primary"
          )}
        >
          {message}
        </motion.span>
      </div>
    </div>
  );
};

export default ArticleLoader;
