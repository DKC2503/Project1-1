import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Copy, 
  Send, 
  Globe, 
  Share2, 
  MessageCircle,
  Check,
  ExternalLink
} from 'lucide-react';
import { useToastStore } from '../hooks/useToastStore';
import { cn } from '../lib/utils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title }) => {
  const { addToast } = useToastStore();
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      addToast('success', 'LINK COPIED', 'The intelligence link has been synchronized to your clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      addToast('error', 'COPY FAILED', 'Unable to copy link to clipboard.');
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-[#25D366]',
      link: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`
    },
    {
      name: 'X (Twitter)',
      icon: Globe,
      color: 'bg-black',
      link: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    },
    {
      name: 'Facebook',
      icon: Share2,
      color: 'bg-[#1877F2]',
      link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-[#0088cc]',
      link: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'LinkedIn',
      icon: ExternalLink,
      color: 'bg-[#0077b5]',
      link: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[var(--background-deep)] border border-[var(--glass-border)] rounded-[2.5rem] shadow-2xl overflow-hidden p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Distribute Intelligence</h3>
                <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic opacity-60">Broadcast through encrypted channels</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-xl text-[var(--text-secondary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Copy Link Section */}
            <div className="mb-8">
              <label className="text-[9px] font-black text-primary uppercase tracking-widest mb-3 block">Direct Access Link</label>
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-[var(--glass-border)] rounded-xl p-4 text-[var(--text-secondary)] text-xs truncate font-mono">
                  {url}
                </div>
                <button 
                  onClick={copyToClipboard}
                  className={cn(
                    "px-6 rounded-xl transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest",
                    copied ? "bg-success text-white" : "bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Social Options */}
            <div>
              <label className="text-[9px] font-black text-primary uppercase tracking-widest mb-6 block">Encrypted Channels</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {shareOptions.map((option) => (
                  <a
                    key={option.name}
                    href={option.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white/5 border border-[var(--glass-border)] hover:border-primary/40 hover:bg-white/10 transition-all group"
                  >
                    <div className={cn("p-3 rounded-2xl text-white group-hover:scale-110 transition-transform", option.color)}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">{option.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Branding Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
