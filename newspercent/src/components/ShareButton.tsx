import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { shareArticle } from '../services/newsService';
import ShareModal from './ShareModal';
import { cn } from '../lib/utils';
import { useToastStore } from '../hooks/useToastStore';

interface ShareButtonProps {
  articleId: string;
  title: string;
  shares?: number;
  className?: string;
  variant?: 'icon' | 'full';
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  articleId, 
  title, 
  shares: initialShares = 0, 
  className,
  variant = 'icon'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shareCount, setShareCount] = useState(initialShares);
  const { addToast } = useToastStore();
  const isLight = true;

  const shareUrl = `${window.location.origin}/article/${articleId}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl
        });
        addToast('success', 'INTELLIGENCE DISTRIBUTED', 'Broadcast successful through system channels.');
        // Increment share count in backend
        const newCount = await shareArticle(articleId);
        if (newCount !== null) setShareCount(newCount);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setIsModalOpen(true);
        }
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const onModalClose = async () => {
    setIsModalOpen(false);
    // When modal is opened, we assume a share attempt might have happened
    const newCount = await shareArticle(articleId);
    if (newCount !== null) setShareCount(newCount);
  };

  return (
    <>
      <button 
        onClick={handleShare}
        className={cn(
          "transition-all duration-300 group flex items-center justify-center gap-2",
          variant === 'icon' 
            ? isLight
              ? "p-4 bg-[#FFFFFF] border border-[#DADADA] text-[#111111] hover:bg-[#F5F5F5] hover:border-[#CFCFCF] rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95"
              : "p-4 bg-[var(--surface-hover)] border border-[var(--glass-border)] hover:border-primary/40 hover:bg-primary/5 hover:text-primary rounded-2xl text-[var(--text-primary)] font-black uppercase text-[10px] tracking-widest cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95"
            : "px-6 py-3 bg-white/5 border border-[var(--glass-border)] hover:border-primary/40 rounded-xl text-[var(--text-secondary)] hover:text-primary",
          className
        )}
        aria-label={`Share this article. Total shares: ${shareCount}`}
        title="Share this article with others."
      >
        <Share2 className={cn("w-4 h-4 group-hover:scale-125 transition-transform duration-300", variant === 'full' && "w-3.5 h-3.5")} />
        {variant === 'icon' ? (
          <span className="hidden sm:inline">SHARE</span>
        ) : (
          <span className="text-[9px] font-black uppercase tracking-widest">SHARE</span>
        )}
      </button>

      <ShareModal 
        isOpen={isModalOpen}
        onClose={onModalClose}
        url={shareUrl}
        title={title}
      />
    </>
  );
};

export default ShareButton;
