import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Globe, 
  ArrowRight,
  Info,
  Mail,
  LogOut,
  X,
  ChevronRight,
  Plus,
  Minus,
  ArrowUpRight
} from 'lucide-react';
import { 
  FaInstagram, 
  FaYoutube, 
  FaWhatsapp, 
  FaTelegram, 
  FaFacebook 
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

// Hook & Store Imports
import { useAuthStore } from '../../hooks/useAuthStore';
import { useToastStore } from '../../hooks/useToastStore';
import { useSystemSettingsStore } from '../../hooks/useSystemSettingsStore';

// Service Imports
import { fetchNews, fetchMainBreaking, fetchBigBreaking, type NewsArticle } from '../../services/newsService';
import { fetchMarketIntel, type StockData } from '../../services/marketService';

// Component Imports
import { MobileHeader } from './MobileHeader';
import FlashNewsTicker from '../FlashNewsTicker';
import WorldPopulationModal from '../WorldPopulationModal';
import LoginModal from '../LoginModal';

// World Population Live Counter Constants
const BASE_POP_TIME = 1781943879000; // June 20, 2026 13:54:39
const BASE_POPULATION = 8120665920;
const GROWTH_RATE_PER_MS = 0.00244;
const BIRTHS_PER_MS = 367556 / 86400000;
const DEATHS_PER_MS = 167419 / 86400000;

export const MobileHome: React.FC = () => {
  const { user, token, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { settings } = useSystemSettingsStore();
  const location = useLocation();

  // State Declarations
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [mainBreaking, setMainBreaking] = useState<NewsArticle | null>(null);
  const [bigBreaking, setBigBreaking] = useState<NewsArticle | null>(null);
  
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [marketStatus, setMarketStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPopModalOpen, setIsPopModalOpen] = useState(false);
  


  // Live World Population Counter State
  const [population, setPopulation] = useState(0);
  const [birthsToday, setBirthsToday] = useState(0);
  const [deathsToday, setDeathsToday] = useState(0);

  // Stock Ticker Auto-scroll State and Refs
  const tickerRef = useRef<HTMLDivElement>(null);
  const [isTickerPaused, setIsTickerPaused] = useState(false);

  // Fetch all homepage data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const fetchMarket = !settings || settings.marketApiEnabled !== false;
        const [newsData, mainB, bigB, marketRes] = await Promise.all([
          fetchNews(),
          fetchMainBreaking(),
          fetchBigBreaking(),
          fetchMarket ? fetchMarketIntel() : Promise.resolve({ success: false, data: [], source: 'disabled' })
        ]);

        setArticles(newsData);
        setMainBreaking(mainB);
        setBigBreaking(bigB);

        if (marketRes.success && marketRes.data) {
          setStocks(marketRes.data);
          setMarketStatus('success');
        } else if (marketRes.source === 'disabled') {
          setMarketStatus('error');
        } else {
          setMarketStatus('error');
        }
      } catch (err) {
        console.error('[MobileHome] Data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Setup polling for stock market data (every 60s)
    const interval = setInterval(async () => {
      const currentSettings = useSystemSettingsStore.getState().settings;
      if (currentSettings && currentSettings.marketApiEnabled === false) {
        return;
      }
      const marketRes = await fetchMarketIntel();
      if (marketRes.success && marketRes.data) {
        setStocks(marketRes.data);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [settings]);

  // Stock auto-scroll ticker animation loop
  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker || marketStatus !== 'success' || stocks.length === 0 || isTickerPaused) return;

    let animationFrameId: number;
    const speed = 0.5; // scrolling speed in pixels per frame

    const scroll = () => {
      if (ticker) {
        ticker.scrollLeft += speed;
        const halfWidth = ticker.scrollWidth / 3;
        if (ticker.scrollLeft >= halfWidth) {
          ticker.scrollLeft -= halfWidth;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [marketStatus, stocks, isTickerPaused]);

  // Handle cross-page scrolling on load
  useEffect(() => {
    if (!loading && location.state && (location.state as any).scrollTo) {
      const tab = (location.state as any).scrollTo;
      setTimeout(() => {
        handleTabChange(tab);
      }, 100);
      window.history.replaceState({}, document.title);
    }
  }, [loading, location.state]);

  // World Population Clock ticking effect
  useEffect(() => {
    if (settings && settings.populationApiEnabled === false) {
      return;
    }
    const updateStats = () => {
      const now = Date.now();
      const nowDate = new Date();
      const startOfToday = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate()).getTime();
      const elapsedMs = now - startOfToday;

      setPopulation(Math.floor(BASE_POPULATION + (now - BASE_POP_TIME) * GROWTH_RATE_PER_MS));
      setBirthsToday(Math.floor(elapsedMs * BIRTHS_PER_MS));
      setDeathsToday(Math.floor(elapsedMs * DEATHS_PER_MS));
    };

    updateStats();
    const interval = setInterval(updateStats, 150);
    return () => clearInterval(interval);
  }, [settings]);

  // Determine the primary featured article
  const heroArticle = mainBreaking || bigBreaking || (articles.length > 0 ? articles[0] : null);

  // Filter out the hero article from lists to prevent duplicate cards
  const filteredArticles = heroArticle 
    ? articles.filter(a => a.id !== heroArticle.id) 
    : articles;

  // Social Links mapping
  const SOCIAL_LINKS = {
    instagram: "https://www.instagram.com/news_percent?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    youtube: "https://youtube.com/@newspercent?si=MSijbFoZuTzZ_UfA",
    twitter: "https://x.com/NewspercentNews?s=20",
    whatsapp: "https://whatsapp.com/channel/0029VayEkt9BKfhrtE3ncR2H",
    telegram: "https://t.me/newspercent",
    facebook: "https://facebook.com/newspercent"
  };

  // Categories list exactly as specified
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

  // Tab change & smooth scroll
  const handleTabChange = (tab: string) => {
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(tab);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleSignOut = () => {
    logout();
    addToast('success', 'SIGNED OUT', 'Your clearance has been revoked.');
    setIsMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-deep)] flex flex-col items-center justify-center gap-4">
        <Globe className="w-8 h-8 text-primary animate-spin" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] animate-pulse">
          Syncing Mobile Feed...
        </span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--background-deep)] text-[var(--text-primary)] font-manrope pb-6 select-none">
      
      {/* 1. HEADER */}
      <MobileHeader onMenuClick={() => setIsMenuOpen(true)} onLogoTripleClick={() => setIsLoginOpen(true)} />

      {/* 2. SOCIAL MEDIA ICONS ROW (icons only) */}
      <div className="w-full bg-[var(--background-mid)] border-b border-[var(--glass-border)] py-3 px-4 flex items-center justify-center gap-6">
        <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all p-1">
          <FaInstagram className="w-5 h-5" />
        </a>
        <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all p-1">
          <FaYoutube className="w-5 h-5" />
        </a>
        <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all p-1">
          <FaXTwitter className="w-5 h-5" />
        </a>
        <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all p-1">
          <FaWhatsapp className="w-5 h-5" />
        </a>
        <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all p-1">
          <FaTelegram className="w-5 h-5" />
        </a>
        <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all p-1">
          <FaFacebook className="w-5 h-5" />
        </a>
      </div>

      {/* 3. FLASH NEWS TICKER (Below Social Row) */}
      <div id="flash" className="scroll-mt-16">
        <FlashNewsTicker />
      </div>

      <main className="px-4 py-6 space-y-6">

        {/* 4. WORLD POPULATION CARD (Reduced in height by 30%) */}
        {settings?.populationApiEnabled !== false && (
          <div 
            onClick={() => setIsPopModalOpen(true)}
            className="liquid-glass py-3 px-4 rounded-xl border border-[var(--glass-border)] bg-white/5 active:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] animate-pulse" />
            
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4 text-primary animate-spin-slow" />
              </div>

              <div className="flex-1 flex flex-col leading-tight">
                <div className="flex items-center gap-1.5 justify-between">
                  <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                    World Population Status
                  </span>
                  <span className="flex items-center gap-1 text-[7px] font-extrabold text-primary bg-primary/10 border border-primary/20 rounded-md px-1.5 py-0.5 tracking-wider uppercase">
                    Live <ArrowUpRight className="w-2 h-2 shrink-0" />
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-base font-black text-[var(--text-primary)] tabular-nums tracking-wide">
                    {population.toLocaleString()}
                  </span>
                  
                  <div className="flex items-center gap-2 text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
                    <span className="flex items-center text-success">
                      <Plus className="w-2.5 h-2.5 animate-pulse" />
                      {birthsToday.toLocaleString()}
                    </span>
                    <span className="text-[var(--glass-border)]">|</span>
                    <span className="flex items-center text-red-500">
                      <Minus className="w-2.5 h-2.5 animate-pulse" />
                      {deathsToday.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. STOCK TICKER (below World Population Card, above Hero Article) */}
        {settings?.marketApiEnabled !== false && marketStatus === 'success' && stocks.length > 0 && (
          <div 
            id="markets" 
            className="w-full h-8 flex items-center overflow-hidden border-y border-[var(--glass-border)] bg-white/5 transition-all duration-500 scroll-mt-16"
          >
            {/* STATIC PREFIX BADGE */}
            <div className="h-full px-2.5 flex items-center shrink-0 border-r border-[var(--glass-border)] bg-[var(--background-mid)] z-10">
              <span className="text-[9px] font-black uppercase tracking-wider text-primary whitespace-nowrap">
                📈 MARKETS |
              </span>
            </div>

            {/* SCROLLING CONTENT */}
            <div 
              ref={tickerRef}
              onTouchStart={() => setIsTickerPaused(true)}
              onTouchEnd={() => setIsTickerPaused(false)}
              onMouseDown={() => setIsTickerPaused(true)}
              onMouseUp={() => setIsTickerPaused(false)}
              onMouseLeave={() => setIsTickerPaused(false)}
              className="flex-1 h-full overflow-x-auto flex gap-4 items-center scrollbar-none snap-x touch-pan-x select-none cursor-grab active:cursor-grabbing z-0"
              style={{ scrollBehavior: 'auto' }}
            >
              {[...stocks, ...stocks, ...stocks].map((stock, index) => (
                <div 
                  key={`${stock.symbol}-${index}`}
                  className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider shrink-0"
                >
                  <span className="text-[var(--text-secondary)]">{stock.symbol.replace('.NS', '').replace('^', '')}</span>
                  <span className="text-[var(--text-primary)] tabular-nums font-black">{stock.price ? stock.price.toFixed(2) : '--'}</span>
                  <span className={`flex items-center text-[8px] tabular-nums font-extrabold ${
                    stock.trend === 'up' ? 'text-green-400' : 'text-red-500'
                  }`}>
                    {stock.trend === 'up' ? '▲' : '▼'} {stock.changePercent ? Math.abs(stock.changePercent).toFixed(2) : '0.00'}%
                  </span>
                  {index < (stocks.length * 3 - 1) && (
                    <span className="text-[var(--glass-border)] ml-1 select-none">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. HERO ARTICLE */}
        {heroArticle && (
          <div id="trending" className="space-y-3 scroll-mt-16">
            <div className="flex items-center gap-1.5 border-b border-[var(--glass-border)] pb-2">
              <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">Hero Briefing</span>
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
            </div>

            <Link 
              to={`/article/${heroArticle.id}`}
              className="block bg-white/5 border border-[var(--glass-border)] hover:border-primary/40 rounded-2xl overflow-hidden transition-all duration-300"
            >
              {heroArticle.featuredImage && (
                <div className="w-full aspect-[16/9] relative overflow-hidden bg-white/5 border-b border-[var(--glass-border)]">
                  <img 
                    src={heroArticle.featuredImage} 
                    alt={heroArticle.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-white text-[8px] font-black tracking-widest uppercase rounded">
                    {heroArticle.category}
                  </div>
                </div>
              )}

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[8px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                  <span>By {heroArticle.author}</span>
                  <span>{heroArticle.publishDate}</span>
                </div>
                <h3 className="text-base font-extrabold text-[var(--text-primary)] leading-tight uppercase font-manrope line-clamp-2">
                  {heroArticle.title}
                </h3>
                <p className="text-[var(--text-secondary)] text-xs leading-relaxed line-clamp-2">
                  {heroArticle.summary}
                </p>
                <div className="pt-2 flex items-center gap-2 text-[9px] font-black uppercase tracking-wider text-primary">
                  READ FULL TRANSMISSION <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* 8. CATEGORY SECTIONS (Filtered: hidden if 0 articles) */}
        <div className="space-y-8">
          {CATEGORIES.map((cat) => {
            const categoryArticles = filteredArticles
              .filter(a => a.category?.toLowerCase() === cat.name.toLowerCase())
              .slice(0, 2);

            if (categoryArticles.length === 0) return null;

            return (
              <div key={cat.slug} className="space-y-3">
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-2">
                  <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">
                    {cat.name}
                  </span>
                  <Link 
                    to={`/category/${cat.slug}`}
                    className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Article Lists (Up to 2 articles max) */}
                <div className="space-y-3">
                  {categoryArticles.map((article) => (
                    <Link 
                      to={`/article/${article.id}`} 
                      key={article.id}
                      className="flex gap-4 p-3 bg-white/5 border border-[var(--glass-border)] rounded-xl active:bg-white/10 transition-colors"
                    >
                      {article.featuredImage && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-[var(--glass-border)]">
                          <img 
                            src={article.featuredImage} 
                            alt={article.title} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-2 leading-snug uppercase">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[8px] text-[var(--text-secondary)]/60 uppercase tracking-widest mt-2">
                          <span>{article.publishDate}</span>
                          <span>•</span>
                          <span>{article.readingTime || '6m Read'}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
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
                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                  >
                    <span>About Us</span>
                    <Info className="w-3.5 h-3.5 text-[var(--text-secondary)]/50" />
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                  >
                    <span>Contact Us</span>
                    <Mail className="w-3.5 h-3.5 text-[var(--text-secondary)]/50" />
                  </Link>
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
      <WorldPopulationModal 
        isOpen={isPopModalOpen} 
        onClose={() => setIsPopModalOpen(false)} 
      />

      {/* Login Access Portal Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </div>
  );
};
