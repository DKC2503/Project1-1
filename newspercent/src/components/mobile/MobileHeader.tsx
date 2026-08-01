import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Menu, Coins, Search, X, Fuel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchWeather, getGeolocation, type WeatherData } from '../../services/weatherService';
import { useSystemSettingsStore } from '../../hooks/useSystemSettingsStore';
import WeatherIcon from '../WeatherIcon';
const EconomyModal = lazy(() => import('../EconomyModal'));
import api from '../../config/api';
import { type NewsArticle } from '../../services/newsService';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onLogoTripleClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

let logoClickCount = 0;
let logoClickTimeout: any = null;

export const MobileHeader: React.FC<MobileHeaderProps> = (props) => {
  const { onMenuClick, onLogoTripleClick } = props;
  const navigate = useNavigate();
  const { settings } = useSystemSettingsStore();

  // Weather States
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Economy States
  const [economyData, setEconomyData] = useState<any>(null);
  const [isEconomyOpen, setIsEconomyOpen] = useState(false);

  // Search Toggle State & Data Lists for Fullscreen Search
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NewsArticle[]>([]);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);

  // Fetch weather function
  const loadWeather = async (targetCity?: string) => {
    const sysSettings = useSystemSettingsStore.getState().settings;
    if (sysSettings && !sysSettings.weatherApiEnabled) {
      setWeatherLoading(false);
      return;
    }

    try {
      setWeatherLoading(true);
      const queryCity = targetCity || localStorage.getItem('weather_city') || 'Visakhapatnam';
      
      const data = await fetchWeather(undefined, undefined, queryCity);
      if (data && data.source !== 'error') {
        setWeather(data);
        localStorage.setItem('weather_city', data.city);
      } else if (!targetCity) {
        const fallbackData = await fetchWeather(undefined, undefined, 'Visakhapatnam');
        if (fallbackData && fallbackData.source !== 'error') {
          setWeather(fallbackData);
        }
      }
    } catch (err) {
      console.error('[MobileHeader] Weather load error:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    if (!settings) return;
    if (!settings.weatherApiEnabled) {
      setWeatherLoading(false);
      return;
    }

    const initWeather = async () => {
      const storedCity = localStorage.getItem('weather_city');
      if (storedCity) {
        await loadWeather(storedCity);
      } else {
        await loadWeather('Visakhapatnam');
        getGeolocation()
          .then(async (coords) => {
            const data = await fetchWeather(coords.lat, coords.lon);
            if (data && data.source !== 'error') {
              setWeather(data);
              localStorage.setItem('weather_city', data.city);
            }
          })
          .catch(() => {
            console.log('[MobileHeader] Geolocation declined/failed, keeping default.');
          });
      }
    };
    initWeather();
  }, [settings]);

  // Fetch economy rates
  useEffect(() => {
    const loadEconomy = async () => {
      try {
        const res = await api.get('/api/economy/intel');
        if (res.data) {
          setEconomyData(res.data);
        }
      } catch (err) {
        console.error('[MobileHeader] Economy data error:', err);
      }
    };
    loadEconomy();
    const interval = setInterval(loadEconomy, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all articles when search is opened for instant live filtering
  useEffect(() => {
    if (isSearchActive) {
      const loadAllArticles = async () => {
        try {
          const res = await api.get('/api/news');
          if (res.data) {
            setAllArticles(res.data.map((art: any) => ({
              id: art._id,
              category: art.category || 'Global',
              title: art.title || 'Untitled Report',
              summary: art.subtitle || (art.content ? art.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 'Briefing details...'),
              author: art.authorName || 'Field Agent',
              publishDate: new Date(art.publishedAt || art.createdAt).toLocaleDateString(),
              featuredImage: art.featuredImage || '/logo.webp'
            })));
          }
        } catch (err) {
          console.error('[MobileHeader] Search cache download error:', err);
        }
      };
      loadAllArticles();
    }
  }, [isSearchActive]);

  // Search filter loop
  useEffect(() => {
    if (!localSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const query = localSearchQuery.toLowerCase();
    const matched = allArticles.filter(art => 
      art.title.toLowerCase().includes(query) ||
      art.summary.toLowerCase().includes(query) ||
      art.category.toLowerCase().includes(query) ||
      art.author.toLowerCase().includes(query)
    );
    setSearchResults(matched);
  }, [localSearchQuery, allArticles]);

  // Handle escape key to close search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchActive(false);
        setLocalSearchQuery('');
      }
    };
    if (isSearchActive) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchActive]);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (logoClickTimeout) {
      clearTimeout(logoClickTimeout);
    }
    logoClickCount += 1;
    if (logoClickCount === 3) {
      logoClickCount = 0;
      onLogoTripleClick();
    } else {
      logoClickTimeout = setTimeout(() => {
        logoClickCount = 0;
      }, 2000);
      navigate('/');
    }
  };

  return (
    <>
      <div 
        className="sticky top-0 z-50 w-full px-3 pt-3 pb-2 select-none transition-all duration-[180ms] ease-out flex flex-col gap-2"
        style={{
          background: "linear-gradient(180deg, rgba(254, 252, 249, 0.45) 0%, rgba(249, 246, 240, 0.28) 50%, rgba(243, 239, 231, 0.12) 80%, transparent 100%)",
        }}
      >
        {/* ROW 1: Menu | Search | Logo | Weather */}
        <header 
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            height: '42px',
            paddingLeft: '14px',
            paddingRight: '14px',
            background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.10)`,
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            border: "1px solid rgba(255, 255, 255, 0.40)",
            boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.35), 0 12px 30px rgba(0, 0, 0, 0.08)",
            borderRadius: "20px",
            width: '100%',
            transition: 'all 180ms ease-out'
          }}
          className="hover:scale-[1.01] relative overflow-hidden group/glass"
        >
          {/* Subtle reflection overlay across the top edge of the glass */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

          {isSearchActive ? (
            /* Expandable search overlay taking full width inside the header row */
            <div 
              style={{
                gridColumn: 'span 3',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.20)`,
                backdropFilter: "blur(32px) saturate(200%)",
                WebkitBackdropFilter: "blur(32px) saturate(200%)",
                border: '1px solid rgba(255, 255, 255, 0.50)',
                borderRadius: '9999px',
                paddingLeft: '12px',
                paddingRight: '12px',
                height: '30px',
                width: '100%',
                boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.40), 0 8px 24px rgba(0, 0, 0, 0.08)",
                zIndex: 20
              }}
            >
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type="text"
                className="placeholder-gray-500"
                style={{
                  flex: 1,
                  background: 'transparent',
                  color: '#111111',
                  border: 'none',
                  outline: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: 'Manrope, sans-serif'
                }}
                placeholder="Search news, topics, or events..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                autoFocus
              />
              <button 
                onClick={() => {
                  setIsSearchActive(false);
                  setLocalSearchQuery('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X className="w-4 h-4 text-gray-800" />
              </button>
            </div>
          ) : (
            <>
              {/* LEFT: Menu & Search */}
              <div className="flex items-center gap-3.5 justify-self-start z-20">
                <button 
                  onClick={onMenuClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    color: '#111111',
                    transition: 'transform 180ms ease-out'
                  }}
                  className="active:scale-95 hover:scale-105"
                  title="Open Navigation"
                >
                  <Menu style={{ width: '20px', height: '20px' }} strokeWidth={2.5} className="text-gray-800" />
                </button>
                
                <button 
                  onClick={() => setIsSearchActive(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    color: '#111111',
                    transition: 'transform 180ms ease-out'
                  }}
                  className="active:scale-95 hover:scale-105"
                  title="Search news"
                >
                  <Search style={{ width: '20px', height: '20px' }} strokeWidth={2.5} className="text-gray-800" />
                </button>
              </div>

              {/* CENTER: Logo (Centered inside grid layout) */}
              <div 
                onClick={handleLogoClick}
                style={{
                  justifySelf: 'center',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 20
                }}
              >
                <img 
                  src="/logo.webp" 
                  alt="N%" 
                  style={{
                    width: '26px',
                    height: '26px',
                    objectFit: 'contain',
                    display: 'block'
                  }} 
                />
              </div>

              {/* RIGHT: Weather Widget */}
              <div className="justify-self-end z-20">
                {settings?.weatherApiEnabled !== false && !weatherLoading && weather && weather.city ? (
                  <div 
                    onClick={() => navigate('/weather')}
                    style={{
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.15)`,
                      backdropFilter: "blur(32px) saturate(200%)",
                      WebkitBackdropFilter: "blur(32px) saturate(200%)",
                      border: '1px solid rgba(255, 255, 255, 0.45)',
                      borderRadius: '14px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      gap: '4px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.30), 0 6px 18px rgba(0, 0, 0, 0.06)",
                      transition: 'all 180ms ease-out'
                    }}
                    className="hover:scale-[1.01] hover:-translate-y-0.5"
                    title="Weather Dashboard"
                  >
                    <WeatherIcon 
                      iconUrl={weather.icon} 
                      condition={weather.condition} 
                      className="w-3.5 h-3.5 text-primary opacity-100 shrink-0" 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                      <span style={{ fontSize: '9px', fontWeight: 900, color: '#111111' }}>
                        {weather.temp}°C
                      </span>
                      <span style={{ fontSize: '6px', fontWeight: 700, color: '#555555', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {weather.city}
                      </span>
                    </div>
                  </div>
                ) : (settings?.weatherApiEnabled !== false && weatherLoading) ? (
                  <div 
                    style={{
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.15)`,
                      backdropFilter: "blur(32px) saturate(200%)",
                      WebkitBackdropFilter: "blur(32px) saturate(200%)",
                      border: '1px solid rgba(255, 255, 255, 0.45)',
                      borderRadius: '14px',
                      paddingLeft: '8px',
                      paddingRight: '8px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.30), 0 6px 18px rgba(0, 0, 0, 0.06)"
                    }}
                  >
                    <span style={{ fontSize: '8px', fontWeight: 900, color: '#777777', textTransform: 'uppercase' }} className="animate-pulse">
                      Sync...
                    </span>
                  </div>
                ) : (
                  <div style={{ height: '28px' }} />
                )}
              </div>
            </>
          )}
        </header>

        {/* ROW 2: Gold Card | Fuel Card */}
        <div className="flex items-center gap-3 w-full">
          {/* Gold Card */}
          <div 
            onClick={() => setIsEconomyOpen(true)}
            style={{
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.15)`,
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              border: '1px solid rgba(255, 255, 255, 0.45)',
              borderRadius: '14px',
              paddingLeft: '10px',
              paddingRight: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.30), 0 6px 18px rgba(0, 0, 0, 0.06)",
              transition: 'all 180ms ease-out',
              zIndex: 20
            }}
            className="flex-1 flex items-center justify-center gap-2 hover:scale-[1.01] hover:-translate-y-0.5 active:scale-95"
            title="Gold Price"
          >
            <Coins className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div className="flex flex-col leading-none text-left">
              <span className="text-[7.5px] font-bold text-gray-500 tracking-wider">GOLD</span>
              <span className="text-[10px] font-black text-amber-600 mt-0.5 tabular-nums">
                {economyData && economyData.metals && economyData.metals.gold ? (
                  `₹${(economyData.metals.gold.price).toFixed(0)}`
                ) : (
                  '--'
                )}
              </span>
            </div>
          </div>

          {/* Fuel Card */}
          <div 
            onClick={() => setIsEconomyOpen(true)}
            style={{
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.15)`,
              backdropFilter: "blur(32px) saturate(200%)",
              WebkitBackdropFilter: "blur(32px) saturate(200%)",
              border: '1px solid rgba(255, 255, 255, 0.45)',
              borderRadius: '14px',
              paddingLeft: '10px',
              paddingRight: '10px',
              cursor: 'pointer',
              userSelect: 'none',
              boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.30), 0 6px 18px rgba(0, 0, 0, 0.06)",
              transition: 'all 180ms ease-out',
              zIndex: 20
            }}
            className="flex-1 flex items-center justify-center gap-2 hover:scale-[1.01] hover:-translate-y-0.5 active:scale-95"
            title="Fuel Price"
          >
            <Fuel className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <div className="flex flex-col leading-none text-left">
              <span className="text-[7.5px] font-bold text-gray-500 tracking-wider">FUEL</span>
              <span className="text-[10px] font-black text-cyan-600 mt-0.5 tabular-nums">
                {economyData && economyData.fuel && economyData.fuel.petrol ? (
                  `₹${economyData.fuel.petrol.price?.toFixed(0)}`
                ) : (
                  '--'
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Search Overlay */}
      <AnimatePresence>
        {isSearchActive && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-[var(--background-deep)]/95 backdrop-blur-2xl z-[9999] flex flex-col p-4 font-manrope text-[var(--text-primary)] overflow-hidden"
          >
            {/* Search Input Box */}
            <div className="flex items-center gap-3 w-full pb-4 border-b border-[var(--glass-border)] shrink-0 mt-2">
              <div 
                className="flex-1 flex items-center gap-2.5 px-4 py-2 h-11"
                style={{
                  background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.008'/%3E%3C/svg%3E"), linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.08) 100%), rgba(255, 255, 255, 0.20)`,
                  backdropFilter: "blur(32px) saturate(200%)",
                  WebkitBackdropFilter: "blur(32px) saturate(200%)",
                  border: "1px solid rgba(255, 255, 255, 0.50)",
                  boxShadow: "inset 0 1px 1px 0 rgba(255, 255, 255, 0.40), 0 8px 24px rgba(0, 0, 0, 0.08)",
                  borderRadius: "9999px"
                }}
              >
                <Search className="w-4 h-4 text-[var(--text-secondary)]/50 shrink-0" />
                <input
                  type="text"
                  className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-secondary)]/40 outline-none text-xs font-semibold"
                  placeholder="Search articles, categories, authors..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  autoFocus
                />
                {localSearchQuery && (
                  <button 
                    onClick={() => setLocalSearchQuery('')}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-[var(--text-secondary)]"
                  >
                    <X className="w-4 h-4 text-[var(--text-primary)]" />
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => {
                  setIsSearchActive(false);
                  setLocalSearchQuery('');
                }}
                className="px-4 py-2.5 bg-black/5 border border-[var(--glass-border)] dark:bg-white/5 dark:hover:bg-white/10 text-[var(--text-primary)] text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shrink-0"
              >
                Cancel
              </button>
            </div>

            {/* Results Output Feed */}
            <div className="flex-1 overflow-y-auto pt-4 space-y-4 no-scrollbar">
              {localSearchQuery.trim() === '' ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-secondary)]/40 gap-3">
                  <Search className="w-10 h-10 opacity-20" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Type to search intelligence reports</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-[var(--text-secondary)]/40 gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500">No matching reports found</span>
                </div>
              ) : (
                <div className="space-y-3 pb-8">
                  <span className="text-[9px] font-black uppercase text-amber-600 tracking-widest block mb-2">
                    Database Matches ({searchResults.length})
                  </span>
                  {searchResults.map((art) => (
                    <div 
                      key={art.id}
                      onClick={() => {
                        setIsSearchActive(false);
                        setLocalSearchQuery('');
                        navigate(`/article/${art.id}`);
                      }}
                      className="flex gap-4 p-3 bg-white/70 dark:bg-white/5 border border-[var(--glass-border)] rounded-2xl active:bg-white/10 transition-all cursor-pointer hover:border-primary/20 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                    >
                      {art.featuredImage && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0 border border-[var(--glass-border)]">
                          <img 
                            src={art.featuredImage} 
                            alt={art.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <div>
                          <span className="text-[8px] font-black text-amber-600 uppercase tracking-wider">
                            {art.category}
                          </span>
                          <h4 className="text-xs font-extrabold text-[var(--text-primary)] truncate uppercase font-manrope mt-0.5">
                            {art.title}
                          </h4>
                          <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1 mt-0.5 leading-snug">
                            {art.summary}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[7px] text-[var(--text-secondary)]/60 font-bold uppercase tracking-wider mt-1">
                          <span>By {art.author}</span>
                          <span>{art.publishDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Economy Modal */}
      <Suspense fallback={null}>
        <EconomyModal isOpen={isEconomyOpen} onClose={() => setIsEconomyOpen(false)} />
      </Suspense>
    </>
  );
};
