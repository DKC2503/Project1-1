import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  X, 
  Search, 
  ChevronRight, 
  Info,
  Mail,
  MapPin,
  Phone,
  LogOut,
  FileText
} from 'lucide-react';
import type { NewsArticle } from '../../services/newsService';
import { useAuthStore } from '../../hooks/useAuthStore';
import { useToastStore } from '../../hooks/useToastStore';

// Mobile layout components
import { lazy, Suspense } from 'react';
import { MobileHeader } from './MobileHeader';
const LoginModal = lazy(() => import('../LoginModal'));
const WorldPopulationModal = lazy(() => import('../WorldPopulationModal'));

interface MobileCategoryViewProps {
  categoryName: string;
  categoryDescription: string;
  initialArticles: NewsArticle[];
}

export const MobileCategoryView: React.FC<MobileCategoryViewProps> = ({
  categoryName,
  categoryDescription,
  initialArticles
}) => {
  const { user, token, logout } = useAuthStore();
  const { addToast } = useToastStore();

  const [searchQuery, setSearchQuery] = useState('');
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

  const [visibleCount, setVisibleCount] = useState(6);

  const filteredArticles = initialArticles.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
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
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <main className="px-4 py-6 space-y-6">
        
        {/* Category Information Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-0.5 bg-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">
              Intelligence Sector
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[var(--text-primary)]">
            {categoryName}
          </h1>
          <p className="text-[var(--text-secondary)] text-xs leading-relaxed mt-2">
            {categoryDescription}
          </p>
        </div>

        {/* Search within Category */}
        <div className="relative">
          <input 
            type="text" 
            placeholder={`Filter ${categoryName.toLowerCase()} brief...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:border-primary font-manrope font-bold"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          <div className="border-b border-white/5 pb-2">
            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
              Available Transmissions ({filteredArticles.length})
            </span>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="space-y-4">
              {displayArticles.map((article) => (
                <Link 
                  to={`/article/${article.id}`} 
                  key={article.id}
                  className="block bg-white/5 border border-[var(--glass-border)] hover:border-primary/40 rounded-xl overflow-hidden transition-all duration-300"
                >
                  {article.featuredImage && (
                    <div className="w-full aspect-[16/9] bg-white/5 border-b border-[var(--glass-border)] relative">
                      <img 
                        src={article.featuredImage} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[8px] text-white/50 font-bold uppercase tracking-wider">
                      <span>By {article.author}</span>
                      <span>{article.publishDate}</span>
                    </div>
                    <h3 className="text-sm font-extrabold text-[var(--text-primary)] leading-tight uppercase font-manrope line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-[var(--text-secondary)] text-xs leading-relaxed line-clamp-2">
                      {article.summary}
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-primary">
                      READ TRANSMISSION <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              ))}

              {hasMore && (
                <button 
                  onClick={handleLoadMore}
                  className="w-full py-4 border border-[var(--glass-border)] rounded-xl text-[9px] font-black tracking-widest uppercase text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] hover:border-primary transition-all cursor-pointer bg-white/5"
                >
                  Load More Transmissions
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-white/30 text-xs uppercase font-bold tracking-widest">
              No matching briefings found
            </div>
          )}
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
