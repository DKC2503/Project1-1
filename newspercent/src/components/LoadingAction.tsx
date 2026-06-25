import React from 'react';
import { motion } from 'framer-motion';
import { useThemeStore } from '../hooks/useThemeStore';

const LoadingAction: React.FC = () => {
  const { isLoading } = useThemeStore();

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[var(--background-deep)]/80 backdrop-blur-md flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img src="/logo.webp" alt="N%" className="h-6 w-auto" />
          </motion.div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">
          Synchronizing Intelligence
        </span>
      </div>
    </motion.div>
  );
};

export default LoadingAction;
