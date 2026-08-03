import React from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid
} from 'recharts';

interface GrowthChartProps {
  data: { year: number; population: number }[];
  range: number; // 5, 10, 20, 50, 100
}

export const PopulationGrowthChart: React.FC<GrowthChartProps> = ({ data, range }) => {
  // Filter data based on selected year range
  const currentYear = 2026;
  const filteredData = (data ?? []).filter(d => d.year >= currentYear - range);

  // Format population labels (e.g. 8.1B)
  const formatYAxis = (tick: number) => {
    return `${(tick / 1000000000).toFixed(1)}B`;
  };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      
      // Calculate growth compared to previous year in data
      const idx = (data ?? []).findIndex(d => d.year === dataPoint.year);
      let growthText = '--';
      if (idx > 0 && data && data[idx - 1]) {
        const prevPop = data[idx - 1].population;
        const diff = dataPoint.population - prevPop;
        const pct = (diff / prevPop) * 100;
        growthText = `+${pct.toFixed(2)}%`;
      } else if (idx === 0) {
        growthText = 'Baseline';
      }

      const popBillions = (dataPoint.population / 1000000000).toFixed(2);

      return (
        <div className="bg-[var(--background-deep)] border border-primary/30 p-4 rounded-2xl shadow-2xl backdrop-blur-xl min-w-[150px]">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2 text-primary">
            Year {dataPoint.year}
          </p>
          <div className="space-y-1 text-xs font-bold font-manrope">
            <p className="text-[var(--text-primary)]">
              Population: <span className="font-extrabold text-[var(--text-primary)]">{popBillions}B</span>
            </p>
            <p className="text-[var(--text-primary)]">
              Growth: <span className="font-extrabold text-success">{growthText}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom key year dot renderer
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!filteredData.length) return null;
    
    const startYear = filteredData[0].year;
    const endYear = filteredData[filteredData.length - 1].year;
    const midIndex = Math.floor(filteredData.length / 2);
    const midYear = filteredData[midIndex].year;

    const isKeyYear = payload.year === startYear || payload.year === midYear || payload.year === endYear;

    if (isKeyYear) {
      return (
        <circle 
          cx={cx} 
          cy={cy} 
          r={5} 
          fill="#ff5a36" 
          stroke="#ffffff" 
          strokeWidth={1.5} 
          style={{ filter: 'url(#glow)' }}
        />
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={filteredData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="populationGrowthGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5a36" stopOpacity={0.35}/>
              <stop offset="50%" stopColor="#ff5a36" stopOpacity={0.18}/>
              <stop offset="100%" stopColor="#ff5a36" stopOpacity={0.02}/>
            </linearGradient>
            
            {/* SVG glow filter for premium cyber neon look */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff5a36" floodOpacity="0.5" />
            </filter>
          </defs>
          <CartesianGrid 
            stroke="rgba(255,255,255,0.08)" 
            strokeDasharray="3 3" 
            vertical={false} 
          />
          <XAxis 
            dataKey="year" 
            stroke="#B0B7C3" 
            fontSize={9} 
            tickLine={false}
            axisLine={false}
            dy={8}
          />
          <YAxis 
            stroke="#B0B7C3" 
            fontSize={9} 
            tickFormatter={formatYAxis}
            tickLine={false}
            axisLine={false}
            dx={-8}
          />
          <Tooltip content={customTooltip} />
          <Area 
            type="monotone" 
            dataKey="population" 
            stroke="#ff5a36" 
            strokeWidth={3.5} 
            fillOpacity={1} 
            fill="url(#populationGrowthGrad)"
            dot={<CustomDot />}
            activeDot={{ r: 6, fill: '#ff5a36', stroke: '#ffffff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface GenderChartProps {
  data: { name: string; value: number; count: number }[];
}

export const GenderDonutChart: React.FC<GenderChartProps> = ({ data }) => {
  const COLORS = ['#3B82F6', '#EC4899']; // Blue for Male, Pink for Female

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[var(--background-deep)] border border-primary/30 p-4 rounded-2xl shadow-2xl backdrop-blur-xl min-w-[140px] text-xs font-bold font-manrope">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-1">
            {dataPoint.name}
          </p>
          <p className="text-sm font-black text-[var(--text-primary)]">
            Ratio: {dataPoint.value}%
          </p>
          <p className="text-[9px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider mt-1">
            {(dataPoint.count / 1000000000).toFixed(2)} Billion
          </p>
        </div>
      );
    }
    return null;
  };

  const chartData = data ?? [];

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      {/* Container with relative for absolute centered label */}
      <div className="relative flex items-center justify-center w-[200px] h-[200px] mb-4">
        <PieChart width={200} height={200}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={customTooltip} />
        </PieChart>
        
        {/* Premium Center Label */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <span className="text-2xl font-black text-[var(--text-primary)] italic leading-none">8.12B</span>
          <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mt-1.5 leading-none">Global Pop</span>
        </div>
      </div>

      <div className="flex gap-8 text-[10px] font-bold uppercase tracking-wider mt-2">
        {chartData.map((item, idx) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
            <span className="text-[var(--text-secondary)]">{item.name}</span>
            <span className="text-[var(--text-primary)] font-black">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ProjectionChartProps {
  data: { year: number; population: number }[];
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ data }) => {
  const formatYAxis = (tick: number) => {
    return `${(tick / 1000000000).toFixed(0)}B`;
  };

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[var(--background-deep)] border border-[var(--glass-border)] p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Projection Year {dataPoint.year}
          </p>
          <p className="text-sm font-black text-cyan-400 italic">
            {dataPoint.population.toLocaleString()} people
          </p>
        </div>
      );
    }
    return null;
  };

  const chartData = data ?? [];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="projectionGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="year" 
            stroke="var(--text-secondary)" 
            fontSize={9} 
            tickLine={false}
            axisLine={false}
            opacity={0.6}
          />
          <YAxis 
            stroke="var(--text-secondary)" 
            fontSize={9} 
            tickFormatter={formatYAxis}
            tickLine={false}
            axisLine={false}
            opacity={0.6}
          />
          <Tooltip content={customTooltip} />
          <Area 
            type="monotone" 
            dataKey="population" 
            stroke="#06B6D4" // Cyan projection color
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#projectionGrad)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
