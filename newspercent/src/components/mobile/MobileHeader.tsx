import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchWeather, getGeolocation, type WeatherData } from '../../services/weatherService';
import { useSystemSettingsStore } from '../../hooks/useSystemSettingsStore';

interface MobileHeaderProps {
  onMenuClick: () => void;
  onLogoTripleClick: () => void;
}

let logoClickCount = 0;
let logoClickTimeout: any = null;

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick, onLogoTripleClick }) => {
  const navigate = useNavigate();
  const { settings } = useSystemSettingsStore();

  // Weather States
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

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
        // Fallback on initial error
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
        // Fetch Visakhapatnam immediately
        await loadWeather('Visakhapatnam');
        // Geolocation in background
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
    <header className="sticky top-0 z-50 w-full bg-[var(--background-deep)] border-b border-[var(--glass-border)] px-4 py-2.5 flex items-center justify-between min-h-[56px]">
      <div onClick={handleLogoClick} className="flex items-center gap-1.5 select-none cursor-pointer shrink-0">
        <img src="/logo.webp" alt="N%" className="h-7 w-auto object-contain" />
        <span className="font-bold text-base font-lemon-milk">
          <span className="text-[var(--text-primary)] font-lemon-milk">NEWS</span>
          <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
        </span>
      </div>

      {/* Compact Weather Widget (Shortcut to Weather Page) */}
      {settings?.weatherApiEnabled !== false && !weatherLoading && weather && weather.city ? (
        <div 
          onClick={() => navigate('/weather')}
          className="flex flex-col text-left select-none max-w-[130px] ml-auto mr-4 font-manrope leading-tight cursor-pointer hover:opacity-80 active:opacity-60 transition-opacity"
        >
          <div className="flex items-center gap-0.5 text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-wider h-4">
            <span className="shrink-0 text-[8.5px]">📍</span>
            <span className="truncate max-w-[80px]">{weather.city}</span>
            <span className="text-[6px] text-[var(--text-muted)]">▼</span>
          </div>
          
          <div className="flex items-center gap-1 leading-none mt-0.5">
            {weather.icon ? (
              <img src={weather.icon} alt="" className="w-3.5 h-3.5 object-contain shrink-0" />
            ) : (
              <span className="text-[9px]">☀️</span>
            )}
            <span className="text-[11px] font-black text-[var(--text-primary)] tabular-nums">
              {weather.temp}°C
            </span>
          </div>

          <div className="text-[7.5px] text-[var(--text-secondary)] font-extrabold uppercase tracking-wider truncate max-w-[100px] leading-none mt-0.5">
            {weather.condition}
          </div>
        </div>
      ) : (settings?.weatherApiEnabled !== false && weatherLoading) ? (
        <div 
          onClick={() => navigate('/weather')}
          className="flex flex-col text-left select-none max-w-[120px] ml-auto mr-4 animate-pulse leading-tight cursor-pointer"
        >
          <div className="w-14 h-2.5 bg-[var(--surface-hover)] rounded" />
          <div className="w-10 h-3 bg-[var(--surface-hover)] rounded mt-1" />
          <div className="w-12 h-2 bg-[var(--surface-hover)] rounded mt-1" />
        </div>
      ) : null}
      
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={onMenuClick}
          className="p-2 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-full text-[var(--text-primary)]"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
