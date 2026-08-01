import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft,
  X,
  Info,
  Mail,
  MapPin,
  Phone,
  LogOut,
  FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';
import api from '../../config/api';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useToastStore } from '../../hooks/useToastStore';

// Mobile layout components
import { lazy, Suspense } from 'react';
import { MobileHeader } from './MobileHeader';
import ShareButton from '../ShareButton';
const LoginModal = lazy(() => import('../LoginModal'));
const WorldPopulationModal = lazy(() => import('../WorldPopulationModal'));

interface MobileArticleViewProps {
  article: any;
  onBack: () => void;
}

export const MobileArticleView: React.FC<MobileArticleViewProps> = ({ article, onBack }) => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuthStore();
  const { addToast } = useToastStore();

  const [isLiked, setIsLiked] = useState(() => {
    const likedList = JSON.parse(localStorage.getItem('liked_articles') || '[]');
    return likedList.includes(article._id);
  });
  const [likesCount, setLikesCount] = useState(article.likes || 0);
  const [likeLoading, setLikeLoading] = useState(false);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPopModalOpen, setIsPopModalOpen] = useState(false);
  
  // Custom functional modals
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    addToast('success', 'SIGNED OUT', 'Your clearance has been revoked.');
    setIsMenuOpen(false);
  };

  const handleLike = async () => {
    if (likeLoading) return;
    const likedList = JSON.parse(localStorage.getItem('liked_articles') || '[]');
    const alreadyLiked = likedList.includes(article._id);
    
    setIsLiked(!alreadyLiked);
    setLikesCount((prev: number) => alreadyLiked ? Math.max(0, prev - 1) : prev + 1);
    
    try {
      setLikeLoading(true);
      if (alreadyLiked) {
        await api.delete(`/api/articles/${article._id}/like`);
        const index = likedList.indexOf(article._id);
        if (index > -1) likedList.splice(index, 1);
        localStorage.setItem('liked_articles', JSON.stringify(likedList));
        addToast('success', 'ARTICLE UNLIKED', 'Like removed from this article.');
      } else {
        await api.post(`/api/articles/${article._id}/like`);
        likedList.push(article._id);
        localStorage.setItem('liked_articles', JSON.stringify(likedList));
        addToast('success', 'ARTICLE LIKED', 'Thank you for liking this article!');
      }
    } catch (err) {
      setIsLiked(alreadyLiked);
      setLikesCount((prev: number) => alreadyLiked ? prev + 1 : Math.max(0, prev - 1));
      addToast('error', 'ACTION FAILED', 'Could not sync like status.');
    } finally {
      setLikeLoading(false);
    }
  };


  const CATEGORIES = [
    { name: 'National', slug: 'national' },
    { name: 'Global', slug: 'global' },
    { name: 'Politics', slug: 'politics' },
    { name: 'Business', slug: 'business' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Entertainment', slug: 'entertainment' },
    { name: 'Technology', slug: 'technology' },
    { name: 'Lifestyle', slug: 'lifestyle' },
    { name: 'Movies', slug: 'movies' }
  ];

  return (
    <div className="relative min-h-screen bg-[var(--background-deep)] text-[var(--text-primary)] font-manrope pb-6 select-none">
      
      {/* HEADER */}
      <MobileHeader 
        onMenuClick={() => setIsMenuOpen(true)} 
        onLogoTripleClick={() => setIsLoginOpen(true)} 
        searchQuery=""
        setSearchQuery={(query) => {
          if (query.trim()) {
            navigate(`/?search=${encodeURIComponent(query)}`);
          }
        }}
      />

      <main className="max-w-4xl mx-auto px-4 py-6 font-manrope space-y-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-primary transition-colors uppercase text-[9px] font-bold tracking-[0.2em]"
        >
          <ChevronLeft className="w-4 h-4" /> Back to feed
        </button>

        <header className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-md text-primary text-[8px] font-black uppercase tracking-[0.2em]">
              {article.category}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] leading-tight uppercase font-lemon-milk">
            {article.title}
          </h1>

          <div className="flex flex-col gap-3 py-4 border-y border-[var(--glass-border)]">
            <div className="flex flex-col leading-tight">
              <span className="text-[var(--text-primary)] font-bold text-xs uppercase">{article.authorName}</span>
            </div>

            <div className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              <span>{new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </header>

        {article.featuredImage && (
          <div className="rounded-xl overflow-hidden border border-[var(--glass-border)]">
            <img 
              src={article.featuredImage} 
              alt={article.title}
              className="w-full aspect-[16/9] object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="prose dark:prose-invert prose-red max-w-none text-[var(--text-secondary)] text-sm leading-relaxed font-manrope">
          <div dangerouslySetInnerHTML={{ __html: article.content }} className="article-content" />
        </div>

        {/* Premium Engagement Bar */}
        <div className="flex flex-row items-center justify-center gap-3 p-4 rounded-xl bg-white border border-[#DADADA] shadow-sm">
          <button 
            onClick={handleLike}
            disabled={likeLoading}
            className={cn(
              "flex-1 py-3 border rounded-lg transition-all duration-300 flex items-center justify-center gap-2.5 font-black uppercase text-[9px] tracking-widest cursor-pointer",
              isLiked 
                ? "bg-[#FFEBE5] border-[#FF5722]/30 text-[#FF5722]"
                : "bg-white border-[#DADADA] text-[#111111]"
            )}
            aria-label={isLiked ? `Unlike this article. Total likes: ${likesCount}` : `Like this article. Total likes: ${likesCount}`}
          >
            <span>{isLiked ? 'LIKED' : 'LIKE'}</span>
          </button>

          <ShareButton 
            articleId={article._id} 
            title={article.title} 
            shares={article.shares} 
            className="flex-1 py-3 border rounded-lg text-[9px]"
          />
        </div>
      </main>

      {/* Clean Whitespace End Page (Footer and Bottom Navigation removed entirely) */}
      <div className="h-16" />

      {/* MENU SIDEBAR */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/35 backdrop-blur-sm z-[100]"
            />

            {/* Sidebar menu drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-[var(--background-deep)] border-l border-[var(--glass-border)] z-[101] p-6 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6">
                {/* Drawer Header */}
                <div className="flex justify-between items-center pb-4 border-b border-[var(--glass-border)]">
                  <div className="flex items-center gap-2 select-none">
                    <img src="/logo.webp" alt="N%" className="h-7 w-auto" />
                    <span className="text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest">N% MENU</span>
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 hover:bg-[var(--surface-hover)] rounded-full text-[var(--text-secondary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <span className="text-[8px] font-black uppercase tracking-widest text-primary italic">Sector Channels</span>
                  <div className="grid grid-cols-1 gap-1.5 max-h-[45vh] overflow-y-auto pr-1 no-scrollbar">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={`/category/${cat.slug}`}
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full text-left py-2.5 px-3 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all bg-[var(--background-mid)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)]"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* About & Contact buttons */}
                <div className="space-y-2 pt-2 border-t border-[var(--glass-border)]">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsAboutOpen(true);
                    }}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                  >
                    <span>About Us</span>
                    <Info className="w-3.5 h-3.5 text-[var(--text-secondary)]/50" />
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsContactOpen(true);
                    }}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                  >
                    <span>Contact Us</span>
                    <Mail className="w-3.5 h-3.5 text-[var(--text-secondary)]/50" />
                  </button>
                </div>
              </div>

              {/* Login / Auth Footer */}
              {token && user && (
                <div className="pt-4 border-t border-[var(--glass-border)]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 px-1 py-1">
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-black uppercase">
                        {user.name?.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="text-[10px] font-bold text-[var(--text-primary)] truncate">{user.name}</span>
                        <span className="text-[7px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{user.role}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 font-bold rounded-xl transition-all uppercase text-[9px] tracking-widest flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out Node
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* World Population Portal Modal */}
      <Suspense fallback={null}>
        <WorldPopulationModal 
          isOpen={isPopModalOpen} 
          onClose={() => setIsPopModalOpen(false)} 
        />
      </Suspense>
  
      {/* Login Access Portal Modal */}
      <Suspense fallback={null}>
        <LoginModal 
          isOpen={isLoginOpen} 
          onClose={() => setIsLoginOpen(false)} 
        />
      </Suspense>

      {/* FUNCTIONAL MODAL: ABOUT US */}
      <AnimatePresence>
        {isAboutOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAboutOpen(false)}
              className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-[340px] liquid-glass p-6 rounded-2xl bg-[var(--background-deep)] border border-[var(--glass-border)] shadow-2xl flex flex-col"
            >
              <button 
                onClick={() => setIsAboutOpen(false)}
                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4 select-none">
                <img src="/logo.webp" alt="N%" className="h-6 w-auto" />
                <span className="font-bold text-sm tracking-widest font-lemon-milk">
                  <span className="text-[var(--text-primary)] font-lemon-milk">NEWS</span>
                  <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
                </span>
              </div>

              <div className="space-y-3 text-[var(--text-secondary)] text-xs leading-relaxed">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                  OUR MISSION
                </h4>
                <p>
                  NewsPercent represents journalism in its most refined form, prioritizing real-time insights, deep investigations, and verified global data transmission.
                </p>
                <p>
                  Operated as an independent news intelligence terminal, we deliver global perspectives, financial market trends, and technical analysis directly to secure nodes around the world.
                </p>
                <div className="pt-3 border-t border-[var(--glass-border)] flex items-center gap-2 text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-wider">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Protocol Clearance Active
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FUNCTIONAL MODAL: CONTACT US */}
      <AnimatePresence>
        {isContactOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsContactOpen(false)}
              className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-[340px] liquid-glass p-6 rounded-2xl bg-[var(--background-deep)] border border-[var(--glass-border)] shadow-2xl flex flex-col"
            >
              <button 
                onClick={() => setIsContactOpen(false)}
                className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4 select-none">
                <img src="/logo.webp" alt="N%" className="h-6 w-auto" />
                <span className="font-bold text-sm tracking-widest font-lemon-milk">
                  <span className="text-[var(--text-primary)] font-lemon-milk">NEWS</span>
                  <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
                </span>
              </div>

              <div className="space-y-4 text-[var(--text-secondary)] text-xs">
                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                  INTELLIGENCE HQ CONTACT
                </h4>

                <div className="space-y-3 font-medium">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Visakhapatnam, Andhra Pradesh, India</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <span>contact@newspercent.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-primary shrink-0" />
                    <span>+91 891 234 5678</span>
                  </div>
                </div>

                <p className="text-[9px] text-[var(--text-muted)] pt-2 border-t border-[var(--glass-border)] uppercase leading-normal">
                  Secure transmissions will be verified by desk editors within 6 hours.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
