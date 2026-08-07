import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Search, Menu, X, Coins, Fuel } from 'lucide-react';
import { FaInstagram, FaYoutube, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { fetchWeather, type WeatherData, getGeolocation } from '../services/weatherService';
const LoginModal = lazy(() => import('./LoginModal'));
const EconomyModal = lazy(() => import('./EconomyModal'));
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import { cn } from '../lib/utils';
import { useSystemSettingsStore } from '../hooks/useSystemSettingsStore';
import WeatherIcon from './WeatherIcon';

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/news_percent?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  youtube: "https://youtube.com/@newspercent?si=MSijbFoZuTzZ_UfA",
  twitter: "https://x.com/NewspercentNews?s=20",
  whatsapp: "https://whatsapp.com/channel/0029VayEkt9BKfhrtE3ncR2H",
  telegram: "https://t.me/newspercent"
};

const NAV_CATEGORIES = [
  { name: 'National', href: '/category/national' },
  { name: 'Global', href: '/category/global' },
  { name: 'Politics', href: '/category/politics' },
  { name: 'Business', href: '/category/business' },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Entertainment', href: '/category/entertainment' },
  { name: 'Automobile', href: '/category/automobile' },
  { name: 'Lifestyle', href: '/category/lifestyle' },
  { name: 'Movies', href: '/category/movies' },
  { name: 'Startups', href: '/category/startups' },
  { name: 'Studies', href: '/category/studies' },
  { name: 'Case Studies', href: '/category/case-studies' },
  { name: 'Technology', href: '/category/technology' },
];

let logoClickCount = 0;
let logoClickTimeout: any = null;

const SiteHeader: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isEconomyOpen, setIsEconomyOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<boolean>(false);
  const [economyData, setEconomyData] = useState<any>(null);
  const { settings, fetchSettings } = useSystemSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  useEffect(() => {
    if (settings && settings.preciousMetalsApiEnabled === false && settings.fuelApiEnabled === false) {
      return;
    }
    const loadEconomy = async () => {
      try {
        const res = await api.get('/api/economy/intel');
        if (res.data) {
          setEconomyData(res.data);
        }
      } catch (err) {
        console.error('SiteHeader economy data error:', err);
      }
    };

    loadEconomy();
    const interval = setInterval(loadEconomy, 60000);
    return () => clearInterval(interval);
  }, [settings]);

  useEffect(() => {
    if (settings && settings.weatherApiEnabled === false) {
      return;
    }
    const loadWeather = async (city?: string, lat?: number, lon?: number) => {
      try {
        const data = await fetchWeather(lat, lon, city);
        if (data && data.source !== 'error') {
          setWeather(data);
          setWeatherError(false);
        } else {
          setWeatherError(true);
        }
      } catch (err) {
        console.error('SiteHeader weather error:', err);
        setWeatherError(true);
      }
    };

    getGeolocation()
      .then(({ lat, lon }) => loadWeather(undefined, lat, lon))
      .catch(() => loadWeather('Visakhapatnam'));
  }, [settings]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (logoClickTimeout) {
      clearTimeout(logoClickTimeout);
    }
    logoClickCount += 1;
    if (logoClickCount === 3) {
      logoClickCount = 0;
      console.log("[AUTH] Secure entry point triggered");
      setIsLoginOpen(true);
    } else {
      logoClickTimeout = setTimeout(() => {
        logoClickCount = 0;
      }, 2000);
      navigate('/');
    }
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMenuOpen(false);
      // Fallback search mock / navigate
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </Suspense>
      <Suspense fallback={null}>
        <EconomyModal isOpen={isEconomyOpen} onClose={() => setIsEconomyOpen(false)} />
      </Suspense>
      
      <header 
        className="w-full px-4 sm:px-8 pt-5 pb-1 z-50 transition-all duration-500 select-none relative"
        style={{
          background: "linear-gradient(180deg, rgba(254, 252, 249, 0.45) 0%, rgba(249, 246, 240, 0.28) 50%, rgba(243, 239, 231, 0.12) 80%, transparent 100%)",
          "--text-primary": "#111111",
          "--text-secondary": "#555555"
        } as React.CSSProperties}
      >
        <div 
          className="max-w-[1600px] mx-auto w-full py-2 px-6 lg:px-8 flex lg:grid lg:grid-cols-3 items-center justify-between gap-4 lg:gap-8 relative overflow-hidden group/glass transition-all duration-[180ms] ease-out hover:scale-[1.01]"
          style={{
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.10)`,
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.40)",
            boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.35), 0 12px 30px rgba(0, 0, 0, 0.08)",
            borderRadius: "28px",
          }}
        >
          {/* Subtle reflection overlay across the top edge of the glass */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
          
          {/* LEFT: Logo & Social (Aligned inline on one horizontal axis) */}
          <div className="flex items-center gap-6 lg:min-w-0 z-20 relative">
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 sm:gap-4 group select-none relative shrink-0">
              {/* Logo with no glow or blur, crisp branding */}
              <img src="/logo.webp" alt="N%" className="h-8 sm:h-9 w-auto object-contain relative z-10" />
              <div className="flex flex-col leading-none relative z-10">
                <div className="font-black text-lg sm:text-xl tracking-wider font-lemon-milk">
                  <span className="text-[var(--text-primary)] font-lemon-milk">NEWS</span>
                  <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
                </div>
              </div>
            </Link>

            {/* Social links - desktop only - aligned inline with logo */}
            <div className="hidden lg:flex items-center gap-4 px-1 shrink-0">
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="text-[#E1306C] transition-all transform hover:scale-[1.05] hover:drop-shadow-[0_0_6px_rgba(225,48,108,0.45)] duration-200" title="Instagram">
                <FaInstagram className="w-4 h-4" />
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="text-[#FF0000] transition-all transform hover:scale-[1.05] hover:drop-shadow-[0_0_6px_rgba(255,0,0,0.45)] duration-200" title="YouTube">
                <FaYoutube className="w-4 h-4" />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="text-gray-700 hover:text-black transition-all transform hover:scale-[1.05] hover:drop-shadow-[0_0_6px_rgba(0,0,0,0.2)] duration-200" title="X">
                <FaXTwitter className="w-4 h-4" />
              </a>
              <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="text-[#25D366] transition-all transform hover:scale-[1.05] hover:drop-shadow-[0_0_6px_rgba(37,211,102,0.45)] duration-200" title="WhatsApp">
                <FaWhatsapp className="w-4 h-4" />
              </a>
              <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="text-[#229ED9] transition-all transform hover:scale-[1.05] hover:drop-shadow-[0_0_6px_rgba(34,158,217,0.45)] duration-200" title="Telegram">
                <FaTelegram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* CENTER: Search Bar (Desktop Only - Frosted Glass Visual Focal Point) */}
          <div className="hidden lg:block w-full max-w-2xl mx-auto z-20 relative">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-2 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none transition-all font-medium duration-[180ms] ease-out hover:scale-[1.01]"
                style={{
                  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.20)`,
                  backdropFilter: "blur(32px) saturate(200%)",
                  WebkitBackdropFilter: "blur(32px) saturate(200%)",
                  border: "1px solid rgba(255, 255, 255, 0.50)",
                  boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.40), 0 8px 24px rgba(0, 0, 0, 0.08)",
                  borderRadius: "9999px",
                }}
                placeholder="Search for news, topics, or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
                    } else {
                      navigate('/');
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* RIGHT: Weather, Economy & Hamburger (Matching Glass Cards) */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 lg:min-w-0 w-full z-20 relative">
            {/* Weather Widget */}
            {settings?.weatherApiEnabled !== false && (
              <Link 
                to="/weather"
                className="flex items-center gap-2.5 py-1 px-3 transition-all duration-[180ms] ease-out group shrink-0 lg:w-[190px] lg:h-10 justify-start text-left hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
                style={{
                  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.15)`,
                  backdropFilter: "blur(32px) saturate(200%)",
                  WebkitBackdropFilter: "blur(32px) saturate(200%)",
                  border: "1px solid rgba(255, 255, 255, 0.45)",
                  boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.30), 0 6px 18px rgba(0, 0, 0, 0.06)",
                  borderRadius: "24px",
                }}
                title="Weather Forecast"
              >
                {weatherError ? (
                  <span className="hidden sm:inline text-[9px] font-bold text-red-500 uppercase tracking-wider">Weather unavailable</span>
                ) : weather ? (
                  <>
                    <WeatherIcon 
                      iconUrl={weather.icon} 
                      condition={weather.condition} 
                      className="w-7 h-7 text-primary group-hover:scale-105 transition-transform shrink-0" 
                    />
                    <div className="hidden sm:flex flex-col leading-tight text-left">
                      <span className="text-[11px] font-black text-gray-800 tabular-nums">
                        {weather.temp}°C
                      </span>
                      <span className="text-[8px] text-gray-500 font-semibold truncate max-w-[80px]">
                        {weather.city}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="hidden sm:inline text-[9px] font-bold text-gray-400 uppercase tracking-wider animate-pulse">Sync...</span>
                )}
              </Link>
            )}

            {/* Economy Compact Button */}
            <button
              onClick={() => setIsEconomyOpen(true)}
              className="flex items-center justify-between py-1 px-3 transition-all duration-[180ms] ease-out group shrink-0 lg:w-[220px] lg:h-10 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)]"
              style={{
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.15)`,
                backdropFilter: "blur(32px) saturate(200%)",
                WebkitBackdropFilter: "blur(32px) saturate(200%)",
                border: "1px solid rgba(255, 255, 255, 0.45)",
                boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.30), 0 6px 18px rgba(0, 0, 0, 0.06)",
                borderRadius: "24px",
              }}
              title="Economy Intelligence Portal"
            >
              {/* LEFT Gold Section */}
              <div className="flex-1 flex items-center justify-center gap-2 pr-2.5 border-r border-black/10 dark:border-white/15 h-full">
                <Coins className="w-4 h-4 text-amber-600 shrink-0 group-hover:scale-105 transition-transform" />
                <div className="flex flex-col leading-none text-left">
                  <span className="text-[8px] font-bold text-gray-500 tracking-wider">GOLD</span>
                  <span className="text-[11px] font-black text-gray-800 mt-0.5 tabular-nums">
                    {economyData && economyData.metals && economyData.metals.gold ? (
                      `${economyData.locale?.currencySymbol || '₹'}${economyData.metals.gold.price?.toFixed(0)}`
                    ) : (
                      '--'
                    )}
                  </span>
                </div>
              </div>

              {/* RIGHT Fuel Section */}
              <div className="flex-1 flex items-center justify-center gap-2 pl-2.5 h-full">
                <Fuel className="w-4 h-4 text-cyan-600 shrink-0 group-hover:scale-105 transition-transform" />
                <div className="flex flex-col leading-none text-left">
                  <span className="text-[8px] font-bold text-gray-500 tracking-wider">FUEL</span>
                  <span className="text-[11px] font-black text-gray-800 mt-0.5 tabular-nums">
                    {economyData && economyData.fuel && economyData.fuel.petrol ? (
                      `₹${economyData.fuel.petrol.price?.toFixed(0)}`
                    ) : (
                      '--'
                    )}
                  </span>
                </div>
              </div>
            </button>

            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 bg-white/60 border border-white/80 rounded-full hover:bg-white/90 hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 shrink-0 lg:hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
              title="Open Navigation"
            >
              <Menu className="w-4 h-4 text-gray-800" />
            </button>
          </div>
        </div>
      </header>
      {/* Hamburger Sliding Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-45"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-[280px] sm:max-w-sm bg-[var(--background-deep)]/95 backdrop-blur-2xl border-l border-[var(--glass-border)] z-50 p-6 flex flex-col justify-between overflow-y-auto no-scrollbar font-manrope shadow-2xl"
            >
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-[var(--glass-border)]">
                  <div className="flex items-center gap-3">
                    <img src="/logo.webp" alt="Logo" className="h-8 w-auto object-contain" />
                    <span className="text-[var(--text-primary)] font-bold text-sm tracking-widest uppercase">N% MAIN</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search */}
                <form onSubmit={handleMobileSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search intelligence..."
                    className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-3 pl-10 pr-4 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-none focus:border-primary transition-all font-mono font-bold"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]/40" />
                </form>

                {/* Navigation Categories */}
                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">Intelligence Categories</span>
                  <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
                    {NAV_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          "w-full text-left py-3 px-4 rounded-xl text-xs uppercase font-bold tracking-widest transition-all",
                          location.pathname === cat.href
                            ? "bg-primary/10 border border-primary/20 text-primary"
                            : "bg-[var(--background-mid)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-[var(--glass-border)] space-y-6">
                {/* Social icons */}
                <div className="flex justify-around items-center">
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#E1306C] transition-all transform hover:scale-110">
                    <FaInstagram className="w-6 h-6" />
                  </a>
                  <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#FF0000] transition-all transform hover:scale-110">
                    <FaYoutube className="w-6 h-6" />
                  </a>
                  <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#1DA1F2] transition-all transform hover:scale-110">
                    <FaXTwitter className="w-6 h-6" />
                  </a>
                  <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#25D366] transition-all transform hover:scale-110">
                    <FaWhatsapp className="w-6 h-6" />
                  </a>
                  <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[#229ED9] transition-all transform hover:scale-110">
                    <FaTelegram className="w-6 h-6" />
                  </a>
                </div>
                <div className="text-center text-[8px] text-[var(--text-secondary)]/60 uppercase font-black tracking-widest leading-none">
                  NewsPercent © 2026. All Clearances Enforced.
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SiteHeader;
