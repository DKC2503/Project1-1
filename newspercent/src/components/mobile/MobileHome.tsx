import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowRight,
  Info,
  Mail,
  LogOut,
  X,
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
import { fetchNews, type NewsArticle } from '../../services/newsService';
import { fetchMarketIntel, type StockData } from '../../services/marketService';

// Component Imports
import { MobileHeader } from './MobileHeader';
import FlashNewsTicker from '../FlashNewsTicker';
const WorldPopulationModal = lazy(() => import('../WorldPopulationModal'));
const LoginModal = lazy(() => import('../LoginModal'));
import LoadingScreen from '../LoadingScreen';
import { lazy, Suspense } from 'react';

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

  // State Declarations
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [marketStatus, setMarketStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [loading, setLoading] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);
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
        const [newsData, marketRes] = await Promise.all([
          fetchNews(),
          fetchMarket ? fetchMarketIntel() : Promise.resolve({ success: false, data: [], source: 'disabled' })
        ]);

        setArticles(newsData);

        if (marketRes.success && marketRes.data) {
          setStocks(marketRes.data);
          setMarketStatus('success');
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
    const speed = 0.5;

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

  // Selection logic for Hero Article:
  // IF there is at least one Breaking article published within the last 48 hours:
  // → Show the latest Breaking article.
  // ELSE:
  // → Show the latest published article.
  const getHeroArticle = (): NewsArticle | null => {
    if (articles.length === 0) return null;

    const now = Date.now();
    const fortyEightHoursAgo = now - 48 * 60 * 60 * 1000;

    // Filter breaking articles within last 48 hours
    const breakingRecent = articles.filter(a => {
      const isBreaking = a.isBreakingNews || a.isMainBreaking || a.isBigBreaking;
      if (!isBreaking) return false;

      const publishTime = a.rawPublishDate ? new Date(a.rawPublishDate).getTime() : 0;
      return publishTime >= fortyEightHoursAgo;
    });

    if (breakingRecent.length > 0) {
      // Sort by publish date descending to get the latest
      return breakingRecent.sort((a, b) => {
        const timeA = a.rawPublishDate ? new Date(a.rawPublishDate).getTime() : 0;
        const timeB = b.rawPublishDate ? new Date(b.rawPublishDate).getTime() : 0;
        return timeB - timeA;
      })[0];
    }

    // Otherwise, return the latest published article
    return [...articles].sort((a, b) => {
      const timeA = a.rawPublishDate ? new Date(a.rawPublishDate).getTime() : 0;
      const timeB = b.rawPublishDate ? new Date(b.rawPublishDate).getTime() : 0;
      return timeB - timeA;
    })[0];
  };

  const heroArticle = getHeroArticle();

  // Filter out the hero article from lists to prevent duplicate cards
  // Filter out the hero article from lists to prevent duplicate cards, and filter by search query
  const filteredArticles = (heroArticle 
    ? articles.filter(a => a.id !== heroArticle.id) 
    : articles
  ).filter(article => {
    if (!searchQuery.trim()) return true;
    return (
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Social Links mapping
  const SOCIAL_LINKS = {
    instagram: "https://www.instagram.com/news_percent?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    youtube: "https://youtube.com/@newspercent?si=MSijbFoZuTzZ_UfA",
    twitter: "https://x.com/NewspercentNews?s=20",
    whatsapp: "https://whatsapp.com/channel/0029VayEkt9BKfhrtE3ncR2H",
    telegram: "https://t.me/newspercent",
    facebook: "https://facebook.com/newspercent"
  };

  // Dynamically extract categories from all loaded articles + merge with base list
  const getDynamicCategories = () => {
    const baseCategories = [
      'National',
      'Global',
      'Politics',
      'Business',
      'Sports',
      'Entertainment',
      'Technology',
      'Automobile',
      'Lifestyle',
      'Movies',
      'Startups',
      'Studies',
      'Case Studies'
    ];

    const articleCategories = articles
      .map(a => a.category)
      .filter((cat): cat is string => typeof cat === 'string' && cat.trim() !== '');

    const categoryMap = new Map<string, string>();
    
    // Seed base categories
    baseCategories.forEach(cat => categoryMap.set(cat.toLowerCase(), cat));
    
    // Add dynamic ones from database articles
    articleCategories.forEach(cat => {
      if (['breaking', 'breaking news', 'unknown'].includes(cat.toLowerCase())) return;
      categoryMap.set(cat.toLowerCase(), cat);
    });

    return Array.from(categoryMap.values()).map(name => {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      return { name, slug };
    });
  };

  const CATEGORIES = getDynamicCategories();

  const handleSignOut = () => {
    logout();
    addToast('success', 'SIGNED OUT', 'Your clearance has been revoked.');
    setIsMenuOpen(false);
  };

  const showSplash = loading || !splashComplete;

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <LoadingScreen 
            key="splash" 
            onComplete={() => setSplashComplete(true)} 
            subtext="SYNCING NEWS NETWORK..." 
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative min-h-screen bg-[var(--background-deep)] text-[var(--text-primary)] font-manrope pb-12 select-none"
      >
      
      {/* 1. MOBILE HEADER (Hamburger | N% Logo | Weather | Economy) */}
      <MobileHeader 
        onMenuClick={() => setIsMenuOpen(true)} 
        onLogoTripleClick={() => setIsLoginOpen(true)} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* SVG Gradient Def for Instagram Link */}
      <svg width="0" height="0" className="absolute">
        <linearGradient id="instagram-gradient" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop stopColor="#f9ce34" offset="0%" />
          <stop stopColor="#ee2a7b" offset="50%" />
          <stop stopColor="#6228d7" offset="100%" />
        </linearGradient>
      </svg>

      {/* Spaced stack for widgets */}
      <div className="flex flex-col gap-8 mt-6 px-4">
        
        {/* 2. SOCIAL MEDIA ICONS ROW (Centered horizontally, official brand colors, size 30% smaller) */}
        <div className="w-full bg-white/5 border border-[var(--glass-border)] py-4 rounded-2xl flex items-center justify-center gap-8 shadow-sm">
          <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:scale-110 active:scale-95 transition-all p-1" title="Instagram">
            <FaInstagram className="w-[18px] h-[18px] fill-[url(#instagram-gradient)]" style={{ fill: "url(#instagram-gradient)" }} />
          </a>
          <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="text-[#FF0000] hover:scale-110 active:scale-95 transition-all p-1" title="YouTube">
            <FaYoutube className="w-[18px] h-[18px]" />
          </a>
          <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-white hover:scale-110 active:scale-95 transition-all p-1" title="X (Twitter)">
            <FaXTwitter className="w-[18px] h-[18px]" />
          </a>
          <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:scale-110 active:scale-95 transition-all p-1" title="WhatsApp">
            <FaWhatsapp className="w-[18px] h-[18px]" />
          </a>
          <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer" className="text-[#229ED9] hover:scale-110 active:scale-95 transition-all p-1" title="Telegram">
            <FaTelegram className="w-[18px] h-[18px]" />
          </a>
          <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-[#1877F2] hover:scale-110 active:scale-95 transition-all p-1" title="Facebook">
            <FaFacebook className="w-[18px] h-[18px]" />
          </a>
        </div>

        {/* 3. WORLD POPULATION STATUS CARD (Centered circular Earth image) */}
        {settings?.populationApiEnabled !== false && (
          <div 
            onClick={() => setIsPopModalOpen(true)}
            className="liquid-glass py-4 px-5 rounded-2xl border border-[var(--glass-border)] bg-white/5 active:bg-white/10 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] animate-pulse" />
            
            <div className="flex items-center gap-4">
              <div className="p-1 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <img src="/globe.jpg" alt="Globe" className="w-9 h-9 rounded-full object-cover animate-spin-slow" />
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

                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="text-base sm:text-lg font-black text-[var(--text-primary)] tabular-nums tracking-wide">
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

        {/* 4. MARKET INTELLIGENCE STOCK TICKER */}
        {settings?.marketApiEnabled !== false && marketStatus === 'success' && stocks.length > 0 && (
          <div 
            id="markets" 
            className="w-full h-10 flex items-center overflow-hidden border border-[var(--glass-border)] bg-white/5 rounded-2xl transition-all duration-500"
          >
            <div className="h-full px-3 flex items-center shrink-0 border-r border-[var(--glass-border)] bg-[var(--background-mid)] z-10 rounded-l-2xl">
              <span className="text-[9px] font-black uppercase tracking-wider text-primary whitespace-nowrap">
                📈 MARKETS
              </span>
            </div>

            <div 
              ref={tickerRef}
              onTouchStart={() => setIsTickerPaused(true)}
              onTouchEnd={() => setIsTickerPaused(false)}
              onMouseDown={() => setIsTickerPaused(true)}
              onMouseUp={() => setIsTickerPaused(false)}
              onMouseLeave={() => setIsTickerPaused(false)}
              className="flex-1 h-full overflow-x-auto flex gap-4 items-center scrollbar-none snap-x touch-pan-x select-none cursor-grab active:cursor-grabbing z-0 pl-3 rounded-r-2xl"
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

        {/* 5. FLASH NEWS STRIP */}
        <div id="flash" className="w-full overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-white/5">
          <FlashNewsTicker />
        </div>

        {/* 6. HERO ARTICLE */}
        {heroArticle && (
          <div id="trending" className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--glass-border)] pb-2">
              <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em] flex items-center gap-1.5">
                {(heroArticle.isBreakingNews || heroArticle.isMainBreaking || heroArticle.isBigBreaking) ? (
                  <>
                    <span className="text-red-500">🔴 BREAKING NEWS</span>
                    <span className="text-[var(--text-muted)]">•</span>
                    <span>{heroArticle.category}</span>
                  </>
                ) : (
                  <>
                    <span>HERO BRIEFING</span>
                    <span className="text-[var(--text-muted)]">•</span>
                    <span>{heroArticle.category}</span>
                  </>
                )}
              </span>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(255,59,48,0.6)] ml-auto" />
            </div>

            <Link 
              to={`/article/${heroArticle.id}`}
              className="block bg-white/5 border border-[var(--glass-border)] hover:border-primary/40 rounded-3xl overflow-hidden transition-all duration-300 shadow-md"
            >
              {heroArticle.featuredImage && (
                <div className="w-full aspect-[16/9] relative overflow-hidden bg-white/5 border-b border-[var(--glass-border)]">
                  <img 
                    src={heroArticle.featuredImage} 
                    alt={heroArticle.title} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-3 py-1 bg-primary text-white text-[8px] font-black tracking-widest uppercase rounded-lg">
                      {heroArticle.category}
                    </span>
                    {(heroArticle.isBreakingNews || heroArticle.isMainBreaking || heroArticle.isBigBreaking) && (
                      <span className="px-2 py-1 bg-red-600 text-white text-[8px] font-black tracking-widest uppercase rounded-lg flex items-center gap-1 shadow-lg">
                        <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        Breaking
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-[8px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                  <span>By {heroArticle.author}</span>
                  <span>{heroArticle.publishDate}</span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] leading-tight uppercase font-manrope line-clamp-2">
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

        {/* 7. LATEST ARTICLES (Excluding the hero article) */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 border-b border-[var(--glass-border)] pb-2">
            <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">
              Latest Articles
            </span>
          </div>

          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const isBreaking = article.isBreakingNews || article.isMainBreaking || article.isBigBreaking;
              return (
                <Link 
                  to={`/article/${article.id}`} 
                  key={article.id}
                  className="flex gap-4 p-4 bg-white/5 border border-[var(--glass-border)] rounded-2xl active:bg-white/10 transition-all duration-300"
                >
                  {article.featuredImage && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-[var(--glass-border)]">
                      <img 
                        src={article.featuredImage} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {isBreaking && (
                          <span className="text-[9px] font-black uppercase text-red-500 tracking-wider flex items-center gap-1">
                            🔴 BREAKING
                          </span>
                        )}
                        <span className="text-[9px] font-black uppercase text-primary tracking-wider">
                          {article.category}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-[var(--text-primary)] line-clamp-2 leading-snug uppercase font-manrope">
                        {article.title}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between text-[8px] text-[var(--text-secondary)]/70 font-bold uppercase tracking-wider mt-2">
                      <span>By {article.author}</span>
                      <span>{article.publishDate}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>

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
              transition={{ type: 'spring' as const, damping: 24, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-[280px] bg-[var(--background-deep)] border-l border-[var(--glass-border)] z-[101] p-6 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-6 flex-1 flex flex-col overflow-hidden">
                {/* Drawer Header (Premium Brand alignment & high contrast close button) */}
                <div className="flex justify-between items-center pb-4 border-b border-[var(--glass-border)] shrink-0">
                  <div className="flex items-center gap-3 select-none">
                    <img src="/logo.webp" alt="N%" className="h-8 w-auto object-contain" />
                    <div className="font-black text-lg tracking-wider font-lemon-milk leading-none">
                      <span className="text-white font-lemon-milk">NEWS</span>
                      <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Scrollable middle container to prevent overflow */}
                <div className="flex-1 overflow-y-auto space-y-6 pr-1 no-scrollbar">
                  {/* Categories */}
                  <div className="space-y-3">
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary italic">Sector Channels</span>
                    <div className="grid grid-cols-1 gap-1.5">
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

                  {/* Corporate Desk / Quick Links */}
                  <div className="space-y-3 pt-4 border-t border-[var(--glass-border)]">
                    <span className="text-[8px] font-black uppercase tracking-widest text-primary italic">Corporate Desk</span>
                    <div className="grid grid-cols-1 gap-1.5">
                      <Link
                        to="/about"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                      >
                        <span>About Us</span>
                        <Info className="w-3.5 h-3.5 text-[var(--text-secondary)]/50" />
                      </Link>
                      <Link
                        to="/contact"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                      >
                        <span>Contact Us</span>
                        <Mail className="w-3.5 h-3.5 text-[var(--text-secondary)]/50" />
                      </Link>
                      <Link
                        to="/careers"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                      >
                        Careers
                      </Link>
                      <Link
                        to="/advertise"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                      >
                        Advertise
                      </Link>
                      <Link
                        to="/privacy"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                      >
                        Privacy Policy
                      </Link>
                      <Link
                        to="/editorial"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                      >
                        Editorial Policy
                      </Link>
                      <Link
                        to="/terms"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-2 px-3 rounded-lg text-[10px] uppercase font-black tracking-widest text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)] transition-all text-left bg-[var(--background-mid)] border border-[var(--glass-border)]"
                      >
                        Terms & Conditions
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Login / Auth Footer (Stick to bottom) */}
              {token && user && (
                <div className="pt-4 border-t border-[var(--glass-border)] shrink-0">
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
      </motion.div>
    </>
  );
};
