import React, { useState, useEffect } from 'react';
import { X, Search, Globe, Compass, Calendar, Award } from 'lucide-react';
import api from '../config/api';
import { PopulationGrowthChart, GenderDonutChart, ProjectionChart } from './PopulationCharts';
import { LiveRatesGrid, DecadesTimeline, DemographicsInsights } from './PopulationStats';
import { useSystemSettingsStore } from '../hooks/useSystemSettingsStore';

interface WorldPopulationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorldPopulationModal: React.FC<WorldPopulationModalProps> = ({ isOpen, onClose }) => {
  const [intel, setIntel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartRange, setChartRange] = useState<number>(50); // Default 50 Years
  const { settings, fetchSettings } = useSystemSettingsStore();

  useEffect(() => {
    if (isOpen && !settings) {
      fetchSettings();
    }
  }, [isOpen, settings, fetchSettings]);

  useEffect(() => {
    if (!isOpen) return;

    const loadIntel = async () => {
      if (settings && settings.populationApiEnabled === false) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get('/api/population/intel');
        setIntel(res.data);
      } catch (err) {
        console.error('Failed to load population data:', err);
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

  if (!isOpen) return null;

  // Filter countries based on search term
  const filteredCountries = intel
    ? intel.countries.filter((c: any) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
            <img src="/globe.jpg" alt="Globe" className="w-8 h-8 rounded-full object-cover animate-spin-slow" />
            <div>
              <h2 className="text-sm sm:text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                Population Intelligence
              </h2>
              <p className="text-[8px] sm:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5 sm:mt-1">
                Global Demographic Insights & Projections
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
          {settings && settings.populationApiEnabled === false ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4 text-center">
              <Globe className="w-12 h-12 text-[var(--text-secondary)]/30 animate-pulse" />
              <p className="text-sm font-bold text-red-500 uppercase tracking-widest">
                Population API is currently disabled by the administrator.
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                No external demographics requests can be executed at this time.
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Decrypting Demographic mainframe...</p>
            </div>
          ) : intel ? (
            <>
              {/* SECTION: BIRTH & DEATH LIVE COUNTERS (LiveRatesGrid) */}
              <div>
                <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-4 sm:mb-6 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" /> Real-Time Rates & Dynamics
                </h3>
                <LiveRatesGrid 
                  birthsPerYear={intel.birthsPerYear} 
                  deathsPerYear={intel.deathsPerYear} 
                />
              </div>

              {/* MAIN METRIC LAYOUTS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
                
                {/* LEFT BLOCK: HISTORICAL GROWTH CHART & TIMELINE (Span 7) */}
                <div className="lg:col-span-7 space-y-8 sm:space-y-10">
                  
                  {/* Growth Chart Section */}
                  <div className="p-4 sm:p-6 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-[1.5rem] sm:rounded-[2rem]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                          Global Population Trend
                        </h4>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-0.5">
                          Population growth over specified historical epochs
                        </p>
                      </div>
                      
                      {/* Interactive range toggle controls */}
                      <div className="flex bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
                        {[5, 10, 20, 50, 100].map((yr) => (
                          <button
                            key={yr}
                            onClick={() => setChartRange(yr)}
                            className={`flex-1 sm:flex-initial px-2 sm:px-3 py-1 text-[9px] font-extrabold uppercase rounded transition-all cursor-pointer ${
                              chartRange === yr 
                                ? 'bg-primary text-white shadow-lg' 
                               : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            {yr}Y
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Key Metrics Stat Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 pt-4 border-t border-[var(--glass-border)]/50">
                      <div className="p-3 bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-xl">
                        <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Current Population</p>
                        <p className="text-xs sm:text-sm font-black text-[var(--text-primary)] mt-1">8.12 Billion</p>
                      </div>
                      <div className="p-3 bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-xl">
                        <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Growth Rate</p>
                        <p className="text-xs sm:text-sm font-black text-success mt-1">0.84%</p>
                      </div>
                      <div className="p-3 bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-xl">
                        <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Projected 2050</p>
                        <p className="text-xs sm:text-sm font-black text-cyan-400 mt-1">9.74 Billion</p>
                      </div>
                    </div>

                    <PopulationGrowthChart data={intel.historical} range={chartRange} />
                  </div>

                  {/* Decade timeline section */}
                  <div className="p-6 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-[2rem]">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] mb-6 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" /> Decade-Wise Statistics
                    </h4>
                    <DecadesTimeline decades={intel.decades} />
                  </div>

                  {/* Future Projections Section */}
                  <div className="p-6 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-[2rem]">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] mb-1">
                        UN Future Population Projections
                      </h4>
                      <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-6">
                        Medium variant projections through 2100
                      </p>
                    </div>
                    <ProjectionChart data={intel.projections} />
                  </div>

                </div>

                {/* RIGHT BLOCK: COUNTRY ROSTER & GENDER RATIOS (Span 5) */}
                <div className="lg:col-span-5 space-y-10">
                  
                  {/* Country Rankings list */}
                  <div className="p-6 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-[2rem] flex flex-col h-[480px]">
                    <div className="mb-6 space-y-4">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                          Country Rank Analysis
                        </h4>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-0.5">
                          Demographic share rankings per sovereign country
                        </p>
                      </div>
                      
                      {/* Sovereign Search Input */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search Sovereign..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-2 px-8 text-xs font-bold focus:outline-none focus:border-primary transition-all text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
                        />
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)]/40" />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                      {filteredCountries.map((c: any) => (
                        <div 
                          key={c.name} 
                          className="flex items-center justify-between p-3.5 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl hover:border-primary/20 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-primary italic w-5">
                              #{c.rank}
                            </span>
                            <span className="text-xs font-bold text-[var(--text-primary)]">
                              {c.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-[var(--text-primary)]">
                              {c.population.toLocaleString()}
                            </p>
                            <p className="text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">
                              {c.share}% of world
                            </p>
                          </div>
                        </div>
                      ))}
                      {filteredCountries.length === 0 && (
                        <div className="flex h-40 items-center justify-center">
                          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                            No Sovereign Match
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gender Split Donut */}
                  <div className="p-6 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-[2rem]">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] mb-2">
                      Gender Distribution Split
                    </h4>
                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mb-4">
                      Current global male vs female ratio balance
                    </p>
                    <GenderDonutChart data={intel.gender} />
                  </div>

                  {/* Growth Rate Comparison */}
                  <div className="p-6 bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] rounded-[2rem] space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                          Annual Growth Rate
                        </h4>
                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-0.5">
                          Net rate trend metrics
                        </p>
                      </div>
                      <span className="text-2xl font-black text-primary italic">
                        {intel.growthRate}%
                      </span>
                    </div>
                    
                    <div className="pt-4 border-t border-[var(--glass-border)] space-y-2">
                      <p className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                        Historical Dynamics
                      </p>
                      {intel.growthRateHistory.map((h: any) => (
                        <div key={h.year} className="flex justify-between text-xs font-bold">
                          <span className="text-[var(--text-secondary)]">{h.year} {h.year === 2030 ? '(Proj)' : ''}</span>
                          <span className="text-[var(--text-primary)]">{h.rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* DEMOGRAPHICS INSIGHTS FOOTER (DemographicsInsights) */}
              <div className="pt-6 border-t border-[var(--glass-border)]">
                <h3 className="text-xs font-black uppercase tracking-[0.25em] text-[var(--text-secondary)] mb-6 flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" /> Key Demographic Vectors
                </h3>
                <DemographicsInsights demographics={intel.demographics} />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
              <p className="text-xs font-black text-red-500 uppercase tracking-widest">
                Failed to communicate with population mainframe.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorldPopulationModal;
