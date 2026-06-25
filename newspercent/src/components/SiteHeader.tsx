import React, { useState, useEffect } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { FaInstagram, FaYoutube, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { fetchWeather, type WeatherData, getGeolocation } from '../services/weatherService';
import LoginModal from './LoginModal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useSystemSettingsStore } from '../hooks/useSystemSettingsStore';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<boolean>(false);
  const { settings, fetchSettings } = useSystemSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

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
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      <header className="w-full bg-[var(--background-deep)] border-b border-[var(--glass-border)] px-4 sm:px-8 py-4 sm:py-6 z-50 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4 lg:gap-8">
          
          {/* LEFT: Logo & Social */}
          <div className="flex items-center gap-8 lg:min-w-[300px]">
            <div className="flex flex-col items-start lg:items-center gap-3">
              <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 sm:gap-4 group select-none">
                <div className="p-1.5 sm:p-2 bg-[var(--surface-hover)] rounded-xl sm:rounded-2xl group-hover:bg-primary/10 transition-colors duration-500">
                  <img src="/logo.webp" alt="N%" className="h-8 sm:h-12 w-auto object-contain" />
                </div>
                <div className="flex flex-col leading-none">
                  <div className="font-bold text-xl sm:text-3xl tracking-tight font-lemon-milk">
                    <span className="text-[var(--text-primary)] font-lemon-milk">NEWS</span>
                    <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
                  </div>
                </div>
              </Link>

              {/* Social links - desktop only */}
              <div className="hidden lg:flex items-center gap-4 px-2">
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all transform hover:scale-110">
                  <FaInstagram className="w-4 h-4" />
                </a>
                <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all transform hover:scale-110">
                  <FaYoutube className="w-4 h-4" />
                </a>
                <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all transform hover:scale-110">
                  <FaXTwitter className="w-4 h-4" />
                </a>
                <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all transform hover:scale-110">
                  <FaWhatsapp className="w-4 h-4" />
                </a>
                <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-all transform hover:scale-110">
                  <FaTelegram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* CENTER: Search Bar (Desktop Only) */}
          <div className="hidden lg:block flex-1 max-w-2xl">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[var(--text-secondary)] group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-full text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                placeholder="Search for news, topics, or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* RIGHT: Weather, Theme Toggle & Hamburger */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 lg:min-w-[300px]">
            {/* Weather Widget */}
            {settings?.weatherApiEnabled !== false && (
              <Link 
                to="/weather"
                className="flex items-center gap-2 py-1 sm:py-1.5 px-2 sm:px-3.5 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl sm:rounded-2xl hover:border-primary/40 transition-all group shrink-0"
                title="Weather Forecast"
              >
                {weatherError ? (
                  <span className="hidden sm:inline text-[9px] font-bold text-red-500 uppercase tracking-wider">Weather data temporarily unavailable</span>
                ) : weather ? (
                  <>
                    {weather.icon && (
                      <img 
                        src={weather.icon} 
                        alt="" 
                        className="w-6 h-6 sm:w-7 sm:h-7 object-contain group-hover:scale-105 transition-transform" 
                      />
                    )}
                    <div className="hidden sm:flex flex-col leading-tight text-left">
                      <span className="text-xs font-black text-[var(--text-primary)] tabular-nums">
                        {weather.temp}°C
                      </span>
                      <span className="text-[8px] text-[var(--text-secondary)] font-semibold truncate max-w-[90px]">
                        {weather.city}
                      </span>
                    </div>
                  </>
                ) : (
                  <span className="hidden sm:inline text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider animate-pulse">Sync...</span>
                )}
              </Link>
            )}

            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 sm:p-3 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-full hover:border-primary/40 transition-all shrink-0 lg:hidden"
              title="Open Navigation"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-primary)]" />
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
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-colors">
                    <FaInstagram className="w-5 h-5" />
                  </a>
                  <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-colors">
                    <FaYoutube className="w-5 h-5" />
                  </a>
                  <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-colors">
                    <FaXTwitter className="w-5 h-5" />
                  </a>
                  <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-colors">
                    <FaWhatsapp className="w-5 h-5" />
                  </a>
                  <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-colors">
                    <FaTelegram className="w-5 h-5" />
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
