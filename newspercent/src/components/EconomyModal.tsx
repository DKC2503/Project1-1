import React, { useState, useEffect } from 'react';
import { X, Search, Coins, MapPin, TrendingUp, TrendingDown, Fuel, Award } from 'lucide-react';
import api from '../config/api';
import { useSystemSettingsStore } from '../hooks/useSystemSettingsStore';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

interface EconomyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EconomyModal: React.FC<EconomyModalProps> = ({ isOpen, onClose }) => {
  const [intel, setIntel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChartAsset, setActiveChartAsset] = useState<'gold' | 'silver' | 'petrol' | 'diesel'>('gold');
  const [chartRange, setChartRange] = useState<'24H' | '7D' | '30D' | '6M' | '1Y'>('30D');
  
  // Regional search inputs & results
  const [searchState, setSearchState] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState('');

  const { settings, fetchSettings } = useSystemSettingsStore();

  useEffect(() => {
    if (isOpen && !settings) {
      fetchSettings();
    }
  }, [isOpen, settings, fetchSettings]);

  useEffect(() => {
    if (!isOpen) return;

    const loadIntel = async () => {
      if (settings && settings.fuelApiEnabled === false && settings.preciousMetalsApiEnabled === false) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get('/api/economy/intel');
        setIntel(res.data);
      } catch (err) {
        console.error('Failed to load economy data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadIntel();
  }, [isOpen, settings]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCompareSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchState && !searchCity) return;
    
    try {
      setCompareLoading(true);
      setCompareError('');
      const res = await api.get(`/api/economy/compare`, {
        params: { state: searchState, city: searchCity }
      });
      setComparisonResult(res.data);
    } catch (err) {
      console.error('Compare search failed:', err);
      setCompareError('Failed to fetch regional data.');
    } finally {
      setCompareLoading(false);
    }
  };

  if (!isOpen) return null;

  // Render helpers
  const formatChange = (val: number, percent: number) => {
    const isUp = val >= 0;
    const symbol = intel?.locale?.currencySymbol || '$';
    return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${isUp ? 'text-success' : 'text-red-500'}`}>
        {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
        {isUp ? '+' : '-'}{symbol}{Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isUp ? '+' : ''}{percent.toFixed(2)}%)
      </span>
    );
  };

  // Recharts custom tooltip
  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dp = payload[0].payload;
      const assetLabels: Record<string, string> = {
        gold: intel?.locale?.goldLabel || 'Gold Price',
        silver: intel?.locale?.silverLabel || 'Silver Price',
        petrol: 'Petrol Price',
        diesel: 'Diesel Price'
      };

      return (
        <div className="bg-[var(--background-deep)] border border-primary/30 p-4 rounded-2xl shadow-2xl backdrop-blur-xl min-w-[150px] font-manrope">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1.5 text-primary">
            {dp.label}
          </p>
          <p className="text-xs font-bold text-[var(--text-primary)]">
            {assetLabels[activeChartAsset]}: <span className="font-extrabold text-[var(--text-primary)]">
              {(activeChartAsset === 'gold' || activeChartAsset === 'silver')
                ? `${intel?.locale?.currencySymbol || '$'}${dp.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / ${intel?.locale?.unit || 'oz'}`
                : `₹${dp.price.toFixed(2)}/L`
              }
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Extract active chart data
  const chartData = intel?.charts?.[activeChartAsset]?.[chartRange] || [];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 md:p-10 font-manrope">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl h-[90vh] bg-[var(--background-deep)] border border-[var(--glass-border)] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden z-10 animate-in fade-in zoom-in duration-300">
        
        {/* Modal Header */}
        <header className="flex justify-between items-center px-4 py-4 sm:px-8 sm:py-6 border-b border-[var(--glass-border)] bg-[var(--surface-hover)]/30">
          <div className="flex items-center gap-3">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            <div>
              <h2 className="text-sm sm:text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                Economy Intelligence
              </h2>
              <p className="text-[8px] sm:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5 sm:mt-1">
                Real-Time Commodity Tracking & Regional Rates
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 sm:space-y-10 custom-scrollbar">
          {settings && settings.preciousMetalsApiEnabled === false && settings.fuelApiEnabled === false ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4 text-center">
              <Coins className="w-12 h-12 text-[var(--text-secondary)]/30 animate-pulse" />
              <p className="text-sm font-bold text-red-500 uppercase tracking-widest">
                Economy APIs are currently disabled by the administrator.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                No external financial updates can be fetched at this time.
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Accessing Commodities Ledger...</p>
            </div>
          ) : intel ? (
            <>
              {/* SECTION: SUMMARY & LIVE METALS/FUEL */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. PRECIOUS METALS CARD */}
                <div className="p-5 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-2xl space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-3 border-b border-[var(--glass-border)]/50">
                    <Coins className="w-4 h-4 text-amber-500" /> {intel.locale?.title || 'Precious Metals'}
                  </h3>
                  
                  {/* Gold Price */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{intel.locale?.goldLabel || 'Gold'}</span>
                      <span className="text-sm font-black text-[var(--text-primary)]">
                        {intel.locale?.currencySymbol || '$'}{intel.metals.gold.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / {intel.locale?.unit || 'oz'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                      <span>Daily Change:</span>
                      <span>{formatChange(intel.metals.gold.ch, intel.metals.gold.chp)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                      <span>Yesterday's Close:</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {intel.locale?.currencySymbol || '$'}{intel.metals.gold.yesterday.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / {intel.locale?.unit || 'oz'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                      <span>Weekly Change:</span>
                      <span>{formatChange(intel.metals.gold.weeklyChange, intel.metals.gold.weeklyChangePercent)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-semibold pb-4 border-b border-[var(--glass-border)]/30">
                      <span>Monthly Change:</span>
                      <span>{formatChange(intel.metals.gold.monthlyChange, intel.metals.gold.monthlyChangePercent)}</span>
                    </div>
                  </div>

                  {/* Silver Price */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-[var(--text-primary)]">{intel.locale?.silverLabel || 'Silver'}</span>
                      <span className="text-sm font-black text-[var(--text-primary)]">
                        {intel.locale?.currencySymbol || '$'}{intel.metals.silver.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / {intel.locale?.unit || 'oz'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                      <span>Daily Change:</span>
                      <span>{formatChange(intel.metals.silver.ch, intel.metals.silver.chp)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                      <span>Yesterday's Close:</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {intel.locale?.currencySymbol || '$'}{intel.metals.silver.yesterday.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / {intel.locale?.unit || 'oz'}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)]">
                      <span>Weekly Change:</span>
                      <span>{formatChange(intel.metals.silver.weeklyChange, intel.metals.silver.weeklyChangePercent)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-semibold">
                      <span>Monthly Change:</span>
                      <span>{formatChange(intel.metals.silver.monthlyChange, intel.metals.silver.monthlyChangePercent)}</span>
                    </div>
                  </div>
                </div>

                {/* 2. REGIONAL FUEL PRICES CARD */}
                <div className="p-5 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-3 border-b border-[var(--glass-border)]/50">
                      <Fuel className="w-4 h-4 text-cyan-500" /> Geolocation Fuel Rates
                    </h3>
                    
                    <div className="mt-4 space-y-4">
                      {/* Geolocated Badge */}
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] font-bold uppercase">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>Detected Region: <span className="text-primary">{intel.fuel.petrol.city || intel.fuel.petrol.state || 'Visakhapatnam'}</span></span>
                      </div>

                      {/* Petrol Price */}
                      <div className="p-3 bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Petrol Rate</p>
                          <p className="text-[8px] text-[var(--text-secondary)] mt-0.5">Updated: {intel.fuel.petrol.lastUpdated}</p>
                        </div>
                        <p className="text-base font-black text-[var(--text-primary)]">₹{intel.fuel.petrol.price.toFixed(2)}<span className="text-[9px] font-medium text-[var(--text-secondary)]">/L</span></p>
                      </div>

                      {/* Diesel Price */}
                      <div className="p-3 bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider">Diesel Rate</p>
                          <p className="text-[8px] text-[var(--text-secondary)] mt-0.5">Updated: {intel.fuel.diesel.lastUpdated}</p>
                        </div>
                        <p className="text-base font-black text-[var(--text-primary)]">₹{intel.fuel.diesel.price.toFixed(2)}<span className="text-[9px] font-medium text-[var(--text-secondary)]">/L</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 text-[9px] text-[var(--text-secondary)] border-t border-[var(--glass-border)]/30 font-semibold italic text-center">
                    Fuel rates fetched via Indian Live Fuel API
                  </div>
                </div>

                {/* 3. ECONOMY SUMMARY CARD */}
                <div className="p-5 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-2xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 pb-3 border-b border-[var(--glass-border)]/50">
                      <Award className="w-4 h-4 text-emerald-500" /> Today's Market Summary
                    </h3>
                    
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {/* Gold Badge */}
                      <div className="p-3 bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">GOLD</span>
                        {intel.summary.gold === 'up' ? (
                          <span className="inline-flex items-center gap-0.5 text-xs font-black text-success">▲ UP</span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs font-black text-red-500">▼ DOWN</span>
                        )}
                      </div>

                      {/* Silver Badge */}
                      <div className="p-3 bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">SILVER</span>
                        {intel.summary.silver === 'up' ? (
                          <span className="inline-flex items-center gap-0.5 text-xs font-black text-success">▲ UP</span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs font-black text-red-500">▼ DOWN</span>
                        )}
                      </div>

                      {/* Petrol Badge */}
                      <div className="p-3 bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">PETROL</span>
                        {intel.summary.petrol === 'up' ? (
                          <span className="inline-flex items-center gap-0.5 text-xs font-black text-success">▲ UP</span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs font-black text-red-500">▼ DOWN</span>
                        )}
                      </div>

                      {/* Diesel Badge */}
                      <div className="p-3 bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">DIESEL</span>
                        {intel.summary.diesel === 'up' ? (
                          <span className="inline-flex items-center gap-0.5 text-xs font-black text-success">▲ UP</span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-xs font-black text-red-500">▼ DOWN</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 text-[9px] text-[var(--text-secondary)] border-t border-[var(--glass-border)]/30 font-semibold italic text-center">
                    Subtle green/red market indicators
                  </div>
                </div>
              </div>

              {/* HISTORICAL CHARTS */}
              <div className="p-6 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-[2rem] space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                      Commodities Historical Trends
                    </h3>
                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-0.5">
                      Toggle asset datasets and timeline scales below
                    </p>
                  </div>
                  
                  {/* Controls Container */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Asset Toggles */}
                    <div className="flex bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-lg p-1">
                      {(['gold', 'silver', 'petrol', 'diesel'] as const).map((asset) => (
                        <button
                          key={asset}
                          onClick={() => setActiveChartAsset(asset)}
                          className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer ${
                            activeChartAsset === asset 
                              ? 'bg-primary text-white shadow-lg' 
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {asset === 'gold' 
                            ? (intel.locale?.goldLabel || 'Gold') 
                            : asset === 'silver' 
                            ? (intel.locale?.silverLabel || 'Silver') 
                            : asset}
                        </button>
                      ))}
                    </div>

                    {/* Range Toggles */}
                    <div className="flex bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-lg p-1">
                      {(['24H', '7D', '30D', '6M', '1Y'] as const).map((rng) => (
                        <button
                          key={rng}
                          onClick={() => setChartRange(rng)}
                          className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer ${
                            chartRange === rng 
                              ? 'bg-cyan-500 text-white shadow-lg' 
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {rng}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Graph Container */}
                <div className="w-full h-80 pt-4 border-t border-[var(--glass-border)]/50">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="economyChartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35}/>
                            <stop offset="50%" stopColor="var(--primary)" stopOpacity={0.18}/>
                            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02}/>
                          </linearGradient>
                          <filter id="economyGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="var(--primary)" floodOpacity="0.5" />
                          </filter>
                        </defs>
                        <CartesianGrid 
                          stroke="rgba(255,255,255,0.08)" 
                          strokeDasharray="3 3" 
                          vertical={false} 
                        />
                        <XAxis 
                          dataKey="label" 
                          stroke="#B0B7C3" 
                          fontSize={9} 
                          tickLine={false}
                          axisLine={false}
                          dy={8}
                        />
                        <YAxis 
                          stroke="#B0B7C3" 
                          fontSize={9} 
                          tickFormatter={(t) => t.toFixed(1)}
                          tickLine={false}
                          axisLine={false}
                          dx={-8}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip content={customTooltip} />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="var(--primary)" 
                          strokeWidth={3.5} 
                          fillOpacity={1} 
                          fill="url(#economyChartGrad)"
                          activeDot={{ r: 6, fill: 'var(--primary)', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        No Historical Data Point Found
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* REGIONAL COMPARISON PORTAL */}
              <div className="p-6 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-[2rem] space-y-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                    Regional Comparison Terminal
                  </h3>
                  <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-0.5">
                    Query specific State or City rates across fuel and precious metals
                  </p>
                </div>

                <form onSubmit={handleCompareSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter State (e.g. Andhra Pradesh)..."
                      value={searchState}
                      onChange={(e) => setSearchState(e.target.value)}
                      className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-primary transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter City (e.g. Visakhapatnam)..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-xs font-bold focus:outline-none focus:border-primary transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Compare Regional Rates
                  </button>
                </form>

                {compareLoading && (
                  <div className="flex items-center gap-2 text-[10px] text-primary uppercase font-bold animate-pulse">
                    <div className="w-4.5 h-4.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Querying local API registries...
                  </div>
                )}

                {compareError && (
                  <div className="text-xs font-bold text-red-500 uppercase">
                    {compareError}
                  </div>
                )}

                {comparisonResult && !compareLoading && (
                  <div className="p-5 bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
                    {/* Location Info */}
                    <div className="col-span-2 md:col-span-4 flex items-center gap-2 text-xs font-black text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--glass-border)]/50 pb-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Comparison for {comparisonResult.city !== 'N/A' ? comparisonResult.city : ''} {comparisonResult.state !== 'N/A' ? `, ${comparisonResult.state}` : ''}
                    </div>

                    {/* Petrol */}
                    <div className="p-3 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl">
                      <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Petrol</span>
                      <p className="text-sm font-black text-[var(--text-primary)] mt-1">
                        {comparisonResult.petrol ? `₹${comparisonResult.petrol.toFixed(2)}/L` : 'N/A'}
                      </p>
                    </div>

                    {/* Diesel */}
                    <div className="p-3 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl">
                      <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">Diesel</span>
                      <p className="text-sm font-black text-[var(--text-primary)] mt-1">
                        {comparisonResult.diesel ? `₹${comparisonResult.diesel.toFixed(2)}/L` : 'N/A'}
                      </p>
                    </div>

                    {/* Gold */}
                    <div className="p-3 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl">
                      <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">{intel?.locale?.goldLabel || 'Gold'}</span>
                      <p className="text-sm font-black text-[var(--text-primary)] mt-1">
                        {comparisonResult.gold ? `${comparisonResult.currencySymbol || '$'}${comparisonResult.gold.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / ${comparisonResult.unit || 'oz'}` : 'N/A'}
                      </p>
                    </div>

                    {/* Silver */}
                    <div className="p-3 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl">
                      <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase">{intel?.locale?.silverLabel || 'Silver'}</span>
                      <p className="text-sm font-black text-[var(--text-primary)] mt-1">
                        {comparisonResult.silver ? `${comparisonResult.currencySymbol || '$'}${comparisonResult.silver.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} / ${comparisonResult.unit || 'oz'}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
              <p className="text-xs font-black text-red-500 uppercase tracking-widest">
                Failed to communicate with commodities mainframe.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EconomyModal;
