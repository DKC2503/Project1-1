import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useDialogStore } from '../../hooks/useDialogStore';
import { cn } from '../../lib/utils';

const GlobalDialogProvider: React.FC = () => {
  const { isOpen, type, options, close } = useDialogStore();
  const [revisionNotes, setRevisionNotes] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    if (isOpen) {
      setRevisionNotes('');
      setPriority('Medium');
    }
  }, [isOpen]);

  if (type !== 'revision') return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => close(null)}
      title={options.title}
      subtitle={options.message}
    >
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Revision Notes</label>
          <textarea
            autoFocus
            value={revisionNotes}
            onChange={(e) => setRevisionNotes(e.target.value)}
            placeholder="Enter detailed intelligence feedback..."
            className="w-full h-40 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-3xl py-4 px-6 text-[var(--input-text)] placeholder-[var(--input-placeholder)] focus:outline-none focus:border-primary transition-all font-manrope text-sm resize-none"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Priority Level</label>
          <div className="grid grid-cols-4 gap-2">
            {['Low', 'Medium', 'High', 'Critical'].map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={cn(
                  "py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border",
                  priority === p 
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                    : "bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--glass-border)] hover:border-primary/40"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => close(null)}
            className="flex-1 py-4 bg-[var(--surface-hover)] text-[var(--text-primary)] font-black rounded-2xl border border-[var(--glass-border)] uppercase text-[10px] tracking-widest hover:opacity-80"
          >
            Cancel
          </button>
          <button
            disabled={!revisionNotes.trim()}
            onClick={() => close({ notes: revisionNotes, priority })}
            className="flex-1 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 uppercase text-[10px] tracking-widest hover:bg-red-600 disabled:opacity-50"
          >
            Send Revision Request
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default GlobalDialogProvider;
