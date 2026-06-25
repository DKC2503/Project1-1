import React, { useState, useEffect } from 'react';
import { fetchWeather, type WeatherData, getGeolocation } from '../services/weatherService';
import { Search, MapPin, Wind, Droplets, Sun, Compass, Cloud, AlertCircle, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSystemSettingsStore } from '../hooks/useSystemSettingsStore';

const WeatherDashboard: React.FC = () => {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings, fetchSettings } = useSystemSettingsStore();

  const loadWeather = async (city?: string, lat?: number, lon?: number) => {
    if (settings && settings.weatherApiEnabled === false) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(lat, lon, city);
      if (data) {
        setWeather(data);
        if (data.source !== 'error') {
          localStorage.setItem('weather_city', data.city);
        } else {
          setError(data.message || 'Weather data temporarily unavailable');
        }
      } else {
        setError('Weather data temporarily unavailable');
      }
    } catch (err) {
      setError('Weather data temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

  useEffect(() => {
    if (settings && settings.weatherApiEnabled === false) {
      setLoading(false);
      return;
    }
    getGeolocation()
      .then(({ lat, lon }) => loadWeather(undefined, lat, lon))
      .catch(() => loadWeather('Visakhapatnam'));
  }, [settings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      loadWeather(query.trim());
    }
  };

  const handleUseLocation = () => {
    getGeolocation()
      .then(({ lat, lon }) => loadWeather(undefined, lat, lon))
      .catch(() => setError('Geolocation permission denied or unavailable'));
  };

  return (
    <div className="relative min-h-screen bg-[var(--background-deep)] text-[var(--text-primary)] transition-all">

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 relative z-10">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="p-3 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-full hover:border-primary/40 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase">Weather Forecast</h1>
            </div>
          </div>

          {/* Search Inputs */}
          {settings?.weatherApiEnabled !== false && (
            <form onSubmit={handleSearch} className="flex items-center gap-3 w-full md:max-w-md">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search city..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-full py-3.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <button 
                type="button"
                onClick={handleUseLocation}
                className="p-3.5 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-full hover:border-primary/40 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Use GPS location"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Warning Indicator */}
        {error && (
          <div className="mb-8 p-4 bg-red-950/20 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Weather data temporarily unavailable</span>
          </div>
        )}

        {/* Stale Cache Alert */}
        {weather && weather.source === 'stale' && (
          <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-3 text-amber-400 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Weather data temporarily unavailable (Showing latest available cached data)</span>
          </div>
        )}

        {settings && settings.weatherApiEnabled === false ? (
          <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-[2.5rem] flex flex-col items-center justify-center gap-4">
            <Cloud className="w-12 h-12 text-[var(--text-secondary)]/30 animate-pulse" />
            <p className="text-base font-bold text-red-500 uppercase tracking-widest">
              Weather API is currently disabled by the administrator.
            </p>
            <p className="text-xs text-[var(--text-secondary)] font-semibold">
              No external weather station requests can be executed at this time.
            </p>
          </div>
        ) : loading ? (
          // Skeleton Loader
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-[280px] bg-[var(--background-light)] animate-pulse rounded-[2.5rem]" />
              <div className="h-[220px] bg-[var(--background-light)] animate-pulse rounded-[2.5rem]" />
            </div>
            <div className="h-[540px] bg-[var(--background-light)] animate-pulse rounded-[2.5rem]" />
          </div>
        ) : weather ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Current & Hourly */}
            <div className="lg:col-span-2 space-y-8">
              {/* Primary Current Card */}
              <div className="liquid-glass p-8 rounded-[2.5rem] border-[var(--glass-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                <div className="space-y-4 z-10">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                      {weather.city}, {weather.country}
                    </span>
                  </div>
                  <div className="text-7xl font-black tracking-tighter tabular-nums text-[var(--text-primary)] flex items-start">
                    {weather.temp}
                    <span className="text-3xl font-light text-primary/80 mt-1">°C</span>
                  </div>
                  <div className="text-base font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                    {weather.condition}
                  </div>
                  <div className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">
                    Feels like {weather.feelsLike}°C
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3 z-10">
                  {weather.icon && (
                    <img 
                      src={weather.icon} 
                      alt="" 
                      className="w-24 h-24 object-contain drop-shadow-md"
                    />
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-5 rounded-2xl flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <Droplets className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Humidity</span>
                  </div>
                  <span className="text-base font-black text-[var(--text-primary)] tabular-nums">{weather.humidity}%</span>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-5 rounded-2xl flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <Wind className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Wind</span>
                  </div>
                  <span className="text-base font-black text-[var(--text-primary)] tabular-nums">{weather.windSpeed} km/h</span>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-5 rounded-2xl flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <Sun className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">UV Index</span>
                  </div>
                  <span className="text-base font-black text-[var(--text-primary)] tabular-nums">{weather.uvIndex}</span>
                </div>
                <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] p-5 rounded-2xl flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <Compass className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Pressure</span>
                  </div>
                  <span className="text-base font-black text-[var(--text-primary)] tabular-nums">{weather.pressure} hPa</span>
                </div>
              </div>

              {/* Hourly Outlook */}
              {weather.hourly && weather.hourly.length > 0 && (
                <div className="liquid-glass p-8 rounded-[2.5rem] border-[var(--glass-border)]">
                  <h3 className="text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase mb-6 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-primary" />
                    Hourly Forecast (12 Hours)
                  </h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/10">
                    {weather.hourly.map((h, i) => (
                      <div 
                        key={i} 
                        className="bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl p-4 flex flex-col items-center gap-2 min-w-[85px] text-center"
                      >
                        <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">{h.time}</span>
                        <img src={h.icon} alt="" className="w-8 h-8 object-contain" />
                        <span className="text-sm font-black text-[var(--text-primary)] tabular-nums">{h.temp}°</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Weekly Outlook */}
            <div className="space-y-8">
              <div className="liquid-glass p-8 rounded-[2.5rem] border-[var(--glass-border)] flex flex-col h-full">
                <h3 className="text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase mb-6 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  7-Day Forecast
                </h3>
                <div className="space-y-4 flex-1">
                  {weather.weekly && weather.weekly.length > 0 ? (
                    weather.weekly.map((day, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-3.5 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl hover:border-primary/10 transition-colors"
                      >
                        <div className="w-16">
                          <span className="text-xs font-bold text-[var(--text-primary)] uppercase">{day.day}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-1 justify-center">
                          <img src={day.icon} alt="" className="w-8 h-8 object-contain" />
                          <span className="hidden sm:inline text-[9px] text-[var(--text-secondary)] uppercase truncate max-w-[80px]">
                            {day.condition}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-right">
                          <span className="text-xs font-black text-[var(--text-primary)] tabular-nums">{day.high}°</span>
                          <span className="text-xs font-semibold text-[var(--text-secondary)] tabular-nums opacity-60">{day.low}°</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[var(--text-secondary)] italic">Weekly forecast unavailable</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-[2.5rem]">
            <Cloud className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce" />
            <p className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest">
              Please search or locate your station
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default WeatherDashboard;
