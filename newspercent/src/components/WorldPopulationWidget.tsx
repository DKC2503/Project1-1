import React, { useState, useEffect } from 'react';
import { Globe, Plus, Minus, ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/utils';
import WorldPopulationModal from './WorldPopulationModal';
import { useSystemSettingsStore } from '../hooks/useSystemSettingsStore';

// Constants for live counters
const BASE_POP_TIME = 1781943879000; // June 20, 2026 13:54:39
const BASE_POPULATION = 8120665920;
const GROWTH_RATE_PER_MS = 0.00244;

const BIRTHS_PER_MS = 367556 / 86400000;
const DEATHS_PER_MS = 167419 / 86400000;

const WorldPopulationWidget: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [population, setPopulation] = useState(0);
  const [birthsToday, setBirthsToday] = useState(0);
  const [deathsToday, setDeathsToday] = useState(0);
  const { settings, fetchSettings } = useSystemSettingsStore();

  useEffect(() => {
    if (!settings) {
      fetchSettings();
    }
  }, [settings, fetchSettings]);

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
    const interval = setInterval(updateStats, 150); // Fast ticks for realistic counter updates
    return () => clearInterval(interval);
  }, [settings]);

  if (settings && settings.populationApiEnabled === false) {
    return null;
  }

  return (
    <>
      <div 
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "flex items-center gap-3.5 px-6 py-2.5 bg-[var(--background-deep)] border-r border-[var(--glass-border)] shrink-0 z-10",
          "cursor-pointer hover:bg-primary/5 active:bg-primary/10 transition-all group duration-300 relative overflow-hidden"
        )}
        title="Click to view interactive population analytics portal"
      >
        {/* Subtle accent backdrop shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        
        {/* Icon with hover rotation */}
        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:border-primary/40 group-hover:scale-105 transition-all">
          <Globe className="w-4 h-4 text-primary animate-spin-slow group-hover:text-primary" />
        </div>

        {/* Text values */}
        <div className="flex flex-col leading-tight select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
              World Population
            </span>
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[7px] font-extrabold text-primary bg-primary/10 border border-primary/20 rounded-md px-1 py-0.5 tracking-wider uppercase scale-90 group-hover:scale-95 transition-transform">
              Live Portal <ArrowUpRight className="w-2 h-2 shrink-0" />
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-xs sm:text-sm font-black text-[var(--text-primary)] tabular-nums tracking-wide">
              {population.toLocaleString()}
            </span>
          </div>
          
          {/* Animated daily metrics below */}
          <div className="hidden sm:flex items-center gap-2 mt-0.5 text-[8px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
            <span className="flex items-center text-success">
              <Plus className="w-2 h-2" />
              {birthsToday.toLocaleString()} Births
            </span>
            <span className="text-[var(--glass-border)]">|</span>
            <span className="flex items-center text-red-500">
              <Minus className="w-2 h-2" />
              {deathsToday.toLocaleString()} Deaths
            </span>
            <span className="text-[var(--glass-border)]">|</span>
            <span className="text-cyan-400">
              +{(birthsToday - deathsToday).toLocaleString()} Growth
            </span>
          </div>
        </div>
      </div>

      {/* World Population Portal Modal */}
      <WorldPopulationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default WorldPopulationWidget;
