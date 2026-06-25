import React, { useState, useEffect } from 'react';
import { fetchMarketIntel, type StockData } from '../services/marketService';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import WorldPopulationWidget from './WorldPopulationWidget';
import { useSystemSettingsStore } from '../hooks/useSystemSettingsStore';

const StockTicker: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [source, setSource] = useState<string>('api');
  const { settings } = useSystemSettingsStore();

  const loadStocks = async () => {
    const currentSettings = useSystemSettingsStore.getState().settings;
    if (currentSettings && currentSettings.marketApiEnabled === false) {
      return;
    }
    const res = await fetchMarketIntel();
    if (res.success && res.data && res.data.length > 0) {
      setStocks(res.data);
      setSource(res.source);
    } else if (stocks.length === 0) {
      setSource('error');
    } else {
      setSource('stale');
    }
  };

  useEffect(() => {
    if (settings && settings.marketApiEnabled === false) {
      return;
    }
    loadStocks();
    const interval = setInterval(loadStocks, 60000); // 60 seconds polling interval
    return () => clearInterval(interval);
  }, [settings]);

  if (settings && settings.marketApiEnabled === false && settings.populationApiEnabled === false) {
    return null;
  }

  if (settings && settings.marketApiEnabled === false) {
    return (
      <div className="w-full relative bg-[var(--background-deep)] border-b border-[var(--glass-border)] select-none">
        <div className="flex items-center w-full">
          <WorldPopulationWidget />
          <div className="flex-1 bg-red-950/30 py-2.5 px-6 flex items-center justify-center gap-2 text-red-400 text-xs font-bold tracking-wider uppercase">
            <AlertCircle className="w-4 h-4" />
            <span>Market data temporarily unavailable</span>
          </div>
        </div>
      </div>
    );
  }

  if (source === 'error' && stocks.length === 0) {
    return (
      <div className="w-full relative bg-[var(--background-deep)] border-b border-[var(--glass-border)] select-none">
        <div className="flex items-center w-full">
          <WorldPopulationWidget />
          <div className="flex-1 bg-red-950/30 py-2.5 px-6 flex items-center justify-center gap-2 text-red-400 text-xs font-bold tracking-wider uppercase">
            <AlertCircle className="w-4 h-4" />
            <span>Market data temporarily unavailable</span>
          </div>
        </div>
      </div>
    );
  }

  // Duplicate items for seamless continuous looping in marquee
  const displayStocks = [...stocks, ...stocks, ...stocks];

  return (
    <div className="w-full relative bg-[var(--background-deep)] border-b border-[var(--glass-border)] overflow-hidden select-none">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
        @media (max-width: 767px) {
          .marquee-content-responsive {
            animation: none !important;
          }
        }
      `}</style>
      
      <div className="flex items-center w-full">
        {/* World Population Widget */}
        <WorldPopulationWidget />

        <div className="marquee-container flex-1 overflow-x-auto md:overflow-hidden touch-pan-x py-2.5 no-scrollbar">
          <div 
            className="marquee-content marquee-content-responsive flex gap-12 whitespace-nowrap px-4 md:px-0"
            style={{
              animation: 'marquee 60s linear infinite',
              width: 'max-content'
            }}
          >
            {displayStocks.map((stock, index) => (
              <div 
                key={`${stock.symbol}-${index}`} 
                className="inline-flex items-center gap-2.5 px-1 text-xs font-semibold"
              >
                <span className="text-[var(--text-primary)] font-bold tracking-wide uppercase">
                  {stock.symbol.replace('.NS', '').replace('^', '')}
                </span>
                <span className="text-[var(--text-secondary)] tabular-nums">
                  {stock.price ? stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--'}
                </span>
                <span className={cn(
                  "flex items-center gap-0.5 font-bold tabular-nums text-[10px]",
                  stock.trend === 'up' ? "text-success" : "text-danger"
                )}>
                  {stock.trend === 'up' ? '+' : ''}
                  {stock.change ? stock.change.toFixed(2) : '0.00'} 
                  ({stock.trend === 'up' ? '+' : ''}
                  {stock.changePercent ? stock.changePercent.toFixed(2) : '0.00'}%)
                  {stock.trend === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5 ml-0.5 text-success" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 ml-0.5 text-danger" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockTicker;
