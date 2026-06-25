import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  subtitle, 
  children,
  maxWidth = 'max-w-lg'
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className={cn(
              "relative w-full liquid-glass p-10 rounded-[2.5rem] border border-primary/20 shadow-2xl overflow-hidden flex flex-col transition-colors duration-300",
              "light:bg-white light:border-[#E8E2D8] light:shadow-xl",
              maxWidth
            )}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,69,58,0.05),transparent_70%)] pointer-events-none light:hidden" />
            
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 text-[var(--text-secondary)] hover:text-primary transition-colors p-2 bg-white/5 light:bg-black/5 rounded-full z-20"
            >
              <X className="w-5 h-5" />
            </button>

            {(title || subtitle) && (
              <div className="mb-8 relative z-10 text-left">
                {title && (
                  <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight font-manrope">
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p className="text-[10px] text-primary font-bold tracking-widest uppercase mt-2 opacity-80 italic">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            <div className="relative z-10">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
