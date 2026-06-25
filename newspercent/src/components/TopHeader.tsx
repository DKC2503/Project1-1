import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchWeather, type WeatherData } from '../services/weatherService';

const TopHeader: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchWeather();
        setWeather(data);
      } catch (err) {
        console.error('TopHeader weather error:', err);
      }
    };
    load();
  }, []);

  return (
    <>
      <div className="w-full h-10 bg-[var(--background-deep)] border-b border-[var(--glass-border)] flex items-center px-6 justify-between text-[11px] font-medium text-[var(--text-secondary)] z-50 sticky top-0 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <span>{format(currentTime, 'EEEE, d MMMM yyyy')}</span>
          <span className="text-[var(--text-secondary)] opacity-40">|</span>
          <span className="text-[var(--text-primary)] tabular-nums">{format(currentTime, 'HH:mm:ss')}</span>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            to="/weather" 
            className="flex items-center gap-2 hover:text-[var(--text-primary)] transition-colors text-[var(--text-secondary)] font-semibold"
          >
            {weather ? (
              <>
                <img src={weather.icon} alt="Weather" className="w-4 h-4 object-contain" />
                <span className="text-[var(--text-primary)] font-bold">{weather.city}, {weather.temp}°C</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-primary animate-pulse" />
                <span>Weather Station</span>
              </>
            )}
          </Link>

        </div>
      </div>


    </>
  );
};

export default TopHeader;

