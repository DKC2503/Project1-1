import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, type ToastType } from '../hooks/useToastStore';
import { cn } from '../lib/utils';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getGlow = (type: ToastType) => {
    switch (type) {
      case 'success': return 'shadow-[0_0_20px_rgba(0,210,106,0.2)] border-success/20';
      case 'error': return 'shadow-[0_0_20px_rgba(255,59,48,0.2)] border-red-500/20';
      case 'warning': return 'shadow-[0_0_20px_rgba(245,158,11,0.2)] border-amber-500/20';
      case 'info': return 'shadow-[0_0_20px_rgba(37,99,235,0.2)] border-blue-500/20';
    }
  };

  return (
    <div className="fixed top-8 right-8 z-[500] flex flex-col gap-4 w-full max-w-[380px] pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "pointer-events-auto liquid-glass p-5 rounded-2xl border flex items-start gap-4 relative overflow-hidden group",
              getGlow(toast.type)
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(toast.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] mb-1">
                {toast.title}
              </h4>
              <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            {/* Auto-dismiss progress bar */}
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: 0 }}
              transition={{ duration: 3, ease: 'linear' }}
              className={cn(
                "absolute bottom-0 left-0 h-[2px] opacity-40",
                toast.type === 'success' ? 'bg-success' :
                toast.type === 'error' ? 'bg-red-500' :
                toast.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
