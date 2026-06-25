import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, HeartPulse, UserCheck, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

// Constants for live counters
const BIRTHS_PER_MS = 367556 / 86400000;
const DEATHS_PER_MS = 167419 / 86400000;

interface LiveRatesProps {
  birthsPerYear: number;
  deathsPerYear: number;
}

export const LiveRatesGrid: React.FC<LiveRatesProps> = ({ birthsPerYear, deathsPerYear }) => {
  const [birthsToday, setBirthsToday] = useState(0);
  const [deathsToday, setDeathsToday] = useState(0);

  useEffect(() => {
    const calculateTodayStats = () => {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const elapsedMs = now.getTime() - startOfToday;

      setBirthsToday(Math.floor(elapsedMs * BIRTHS_PER_MS));
      setDeathsToday(Math.floor(elapsedMs * DEATHS_PER_MS));
    };

    calculateTodayStats();
    const interval = setInterval(calculateTodayStats, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Birth Rate Card */}
      <div className="p-6 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-3xl flex flex-col justify-between group hover:border-primary/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Births Today</span>
          <div className="p-2 bg-primary/10 rounded-xl">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-[var(--text-primary)] tabular-nums italic">
            +{birthsToday.toLocaleString()}
          </h3>
          <div className="mt-4 space-y-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            <p>Per Year: {birthsPerYear.toLocaleString()}</p>
            <p>Per Day: ~{Math.round(birthsPerYear / 365).toLocaleString()}</p>
            <p>Per Minute: ~{Math.round(birthsPerYear / 525600).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Death Rate Card */}
      <div className="p-6 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-3xl flex flex-col justify-between group hover:border-red-500/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Deaths Today</span>
          <div className="p-2 bg-red-500/10 rounded-xl">
            <HeartPulse className="w-4 h-4 text-red-500" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-[var(--text-primary)] tabular-nums italic">
            -{deathsToday.toLocaleString()}
          </h3>
          <div className="mt-4 space-y-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            <p>Per Year: {deathsPerYear.toLocaleString()}</p>
            <p>Per Day: ~{Math.round(deathsPerYear / 365).toLocaleString()}</p>
            <p>Per Minute: ~{Math.round(deathsPerYear / 525600).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Net Growth Card */}
      <div className="p-6 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-3xl flex flex-col justify-between group hover:border-cyan-500/20 transition-all">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Net Growth Today</span>
          <div className="p-2 bg-cyan-500/10 rounded-xl">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-black text-cyan-400 tabular-nums italic">
            +{(birthsToday - deathsToday).toLocaleString()}
          </h3>
          <div className="mt-4 space-y-1 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            <p>Per Year: {(birthsPerYear - deathsPerYear).toLocaleString()}</p>
            <p>Per Day: ~{Math.round((birthsPerYear - deathsPerYear) / 365).toLocaleString()}</p>
            <p>Per Minute: ~{Math.round((birthsPerYear - deathsPerYear) / 525600).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DecadesProps {
  decades: { decade: string; increase: number; growth: number }[];
}

export const DecadesTimeline: React.FC<DecadesProps> = ({ decades }) => {
  return (
    <div className="space-y-6">
      <div className="relative border-l border-[var(--glass-border)] ml-4 pl-8 space-y-8 py-2">
        {decades.map((d) => (
          <div key={d.decade} className="relative group">
            {/* Dot marker */}
            <span className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-[var(--background-deep)] border-2 border-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="w-2 h-2 rounded-full bg-primary" />
            </span>
            <div>
              <span className="text-sm font-black text-primary tracking-wide block">{d.decade}</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-1.5 text-xs">
                <p className="text-[var(--text-primary)] font-bold">
                  Increase: <span className="font-extrabold text-primary">+{d.increase.toLocaleString()}</span>
                </p>
                <p className="text-[var(--text-secondary)]">
                  Growth Rate: <span className="font-extrabold text-[var(--text-primary)]">{d.growth}%</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DemographicsProps {
  demographics: {
    medianAge: number;
    urbanPercentage: number;
    ruralPercentage: number;
    lifeExpectancy: number;
    density: number;
  };
}

export const DemographicsInsights: React.FC<DemographicsProps> = ({ demographics }) => {
  const metrics = [
    { label: 'Median Age', value: `${demographics.medianAge} Years`, icon: UserCheck, color: 'text-primary' },
    { label: 'Urban Population', value: `${demographics.urbanPercentage}%`, icon: Sparkles, color: 'text-cyan-400' },
    { label: 'Rural Population', value: `${demographics.ruralPercentage}%`, icon: Activity, color: 'text-amber-500' },
    { label: 'Life Expectancy', value: `${demographics.lifeExpectancy} Years`, icon: HeartPulse, color: 'text-green-500' },
    { label: 'Population Density', value: `${demographics.density} Ppl/km²`, icon: TrendingUp, color: 'text-purple-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {metrics.map((m) => (
        <div key={m.label} className="p-4 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl flex flex-col justify-between hover:border-[var(--glass-border)]/60 transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider max-w-[80px]">
              {m.label}
            </span>
            <m.icon className={cn("w-4 h-4 shrink-0", m.color)} />
          </div>
          <span className="text-lg font-black text-[var(--text-primary)] tracking-tight">
            {m.value}
          </span>
        </div>
      ))}
    </div>
  );
};
