import React, { useEffect, useState, useMemo } from 'react';
import { 
    TrendingUp, 
    Clock, 
    ChevronUp, 
    ChevronDown, 
    ThumbsUp, 
    Archive,
    RefreshCw,
    Globe,
    Zap,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Award
} from 'lucide-react';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { analyticsService } from '../services/analyticsService';
import { useToastStore } from '../hooks/useToastStore';
import { cn } from '../lib/utils';
import { useDialogStore } from '../hooks/useDialogStore';

// Premium Color Palette
const COLORS = {
    gold: '#FFD84D',
    primary: 'var(--primary)',
    success: '#10B981',
    info: '#3B82F6',
    warning: '#F59E0B',
    danger: '#EF4444',
    categories: {
        National: '#3B82F6',
        Global: '#8B5CF6',
        Politics: '#EF4444',
        Business: '#10B981',
        Sports: '#F59E0B',
        Technology: '#06B6D4',
        Movies: '#EC4899',
        Lifestyle: '#F97316',
        Automobile: '#6366F1',
        Startups: '#14B8A6',
        Studies: '#82CA9D',
        'Case Studies': '#A4DE6C'
    }
};

const AnalyticsDashboard: React.FC = () => {
    const [period, setPeriod] = useState('7d');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [archiving, setArchiving] = useState(false);
    const { addToast } = useToastStore();
    const dialog = useDialogStore();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await analyticsService.getDashboardData(period);
            setData(res);
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            addToast('error', 'UPLINK FAILED', 'Could not retrieve organizational intelligence data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    const handleArchive = async () => {
        const confirmed = await dialog.confirm('Are you sure you want to archive previous month analytics? This will purge raw logs from MongoDB.', 'Archival Protocol');
        if (!confirmed) return;
        
        setArchiving(true);
        try {
            const res = await analyticsService.archiveData();
            addToast('success', 'ARCHIVE SUCCESSFUL', `Intelligence logs stored in ${res.fileName}`);
            fetchData();
        } catch (err) {
            addToast('error', 'ARCHIVAL FAILED', 'Process terminated. Storage integrity unverified.');
        } finally {
            setArchiving(false);
        }
    };

    // Process Chart Data with Fallback
    const chartData = useMemo(() => {
        const raw = data?.traffic?.growthChart || [];
        
        // If no data exists, generate demo data for visualization
        if (raw.length === 0) {
            console.log('[Analytics] No real data found. Loading mission simulation data.');
            const demoDays = period === '30d' ? 30 : period === '24h' ? 24 : 7;
            const fallback = [];
            const now = new Date();
            
            for (let i = demoDays - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                fallback.push({
                    date: date.toISOString().split('T')[0],
                    uniqueVisitors: Math.floor(Math.random() * 15) + 5,
                    returningVisitors: Math.floor(Math.random() * 10) + 2,
                    isDemo: true
                });
            }
            return fallback;
        }

        console.log('[Analytics] Real intelligence data synchronized:', raw);
        return raw;
    }, [data, period]);

    // Calculate dynamic values from processed chart data
    const todayStats = useMemo(() => {
        if (!chartData || chartData.length === 0) return { uv: 0, growth: 0 };
        
        const today = chartData[chartData.length - 1];
        const yesterday = chartData[chartData.length - 2];
        
        const uv = today.uniqueVisitors || 0;
        const yuv = yesterday?.uniqueVisitors || 0;
        const growth = yuv === 0 ? (uv > 0 ? 100 : 0) : Math.round(((uv - yuv) / yuv) * 100);
        
        return { uv, growth };
    }, [chartData]);

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
                <div className="relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full animate-pulse" />
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-primary font-black uppercase tracking-[0.5em] animate-pulse">Synchronizing Mainframe</h2>
                    <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-3 opacity-60 italic">Deciphering Global Traffic Patterns...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-24 font-manrope max-w-[1600px] mx-auto">
            
            {/* --- TOP HUD: TITLE & CONTROLS --- */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 px-4 sm:px-0">
                <div>
                    <h1 className="text-5xl font-normal tracking-tighter text-[var(--text-primary)] uppercase font-lemon">Intelligence Analytics</h1>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full">
                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                            <span className="text-[9px] font-black text-success uppercase tracking-widest">Live Node Monitoring</span>
                        </div>
                        <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-widest opacity-40">System Core v1.2</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-[var(--card-bg)] p-4 sm:p-2 rounded-[1.5rem] border border-[var(--glass-border)] shadow-2xl backdrop-blur-xl w-full xl:w-auto justify-between sm:justify-start">
                    <div className="flex p-1 bg-[var(--surface-hover)] rounded-xl border border-[var(--glass-border)] flex-1 sm:flex-none justify-around sm:justify-start">
                        {['24h', '7d', '30d'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={cn(
                                    "px-6 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-500 flex-1 sm:flex-none",
                                    period === p 
                                    ? "bg-primary text-white shadow-xl shadow-primary/30" 
                                    : "text-[var(--text-secondary)] hover:text-white"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <div className="h-8 w-px bg-[var(--glass-border)] mx-2 hidden sm:block" />
                    <div className="flex gap-2 pr-2">
                        <button 
                            onClick={fetchData}
                            className="p-3 bg-[var(--surface-hover)] text-primary hover:bg-primary hover:text-white rounded-xl transition-all border border-[var(--glass-border)] group"
                            title="Refresh Stream"
                        >
                            <RefreshCw className={cn("w-4 h-4 transition-transform duration-700 group-hover:rotate-180", loading && "animate-spin")} />
                        </button>
                        <button 
                            onClick={handleArchive}
                            disabled={archiving}
                            className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-[var(--glass-border)] text-[var(--text-primary)] text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                            <Archive className="w-4 h-4 text-primary" /> {archiving ? 'Purging...' : 'Archive Month'}
                        </button>
                    </div>
                </div>
            </div>

            {/* --- SECTION 1: KEY PERFORMANCE INDICATORS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-0">
                {/* LIVE TRAFFIC CARD */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group col-span-1 md:col-span-2 lg:col-span-1"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-orange-500 rounded-[2rem] sm:rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-[var(--card-bg)] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-primary/20 shadow-2xl h-full flex flex-col justify-between overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12">
                            <Activity size={120} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/10">
                                    <Globe className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Live Traffic</p>
                                    <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">Real-time unique node access</p>
                                </div>
                            </div>
                            <div className="flex items-end gap-4">
                                <CountUp value={todayStats.uv} className="text-6xl font-black text-white italic tracking-tighter" />
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-black mb-3 px-2 py-1 rounded-lg border",
                                    todayStats.growth >= 0 ? "bg-success/10 border-success/20 text-success" : "bg-danger/10 border-danger/20 text-danger"
                                )}>
                                    {todayStats.growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {Math.abs(todayStats.growth)}% Today
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-[var(--glass-border)]">
                            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">Compared to 24h average</p>
                        </div>
                    </div>
                </motion.div>

                <StatCard 
                    title="Total Engagement" 
                    value={data?.traffic?.totalViews} 
                    growth={data?.traffic?.growth} 
                    icon={<Target className="w-5 h-5 text-blue-500" />} 
                    label="Cumulative Page Views"
                />
                <StatCard 
                    title="Returning Nodes" 
                    value={data?.traffic?.returning?.returning} 
                    icon={<RefreshCw className="w-5 h-5 text-purple-500" />} 
                    label="Returning Agent Rate"
                    subValue={`${data?.traffic?.returning?.rate}% Rate`}
                />
                <StatCard 
                    title="Avg Interaction" 
                    value={`${Math.round(data?.content?.completion?.rate)}%`} 
                    icon={<Activity className="w-5 h-5 text-success" />} 
                    label="Article Completion Rate"
                />
            </div>

            {/* --- SECTION 2: VIEWERSHIP HISTORY (LARGE CHART) --- */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--card-bg)] p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-[var(--glass-border)] shadow-2xl relative overflow-hidden mx-4 sm:mx-0"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20" />
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 sm:mb-16 gap-6">
                    <div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Viewership History</h3>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
                            <TrendingUp className="w-4 h-4 text-primary" /> Multi-vector node growth distribution
                        </p>
                    </div>
                    <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Last {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '24 Hours'}</span>
                    </div>
                </div>

                <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={COLORS.gold} stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor={COLORS.gold} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="5 5" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="rgba(255,255,255,0.3)" 
                                fontSize={10} 
                                axisLine={false}
                                tickLine={false}
                                tick={{ dy: 20 }}
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            />
                            <YAxis 
                                stroke="rgba(255,255,255,0.3)" 
                                fontSize={10} 
                                axisLine={false}
                                tickLine={false}
                                allowDecimals={false}
                                tick={{ dx: -20 }}
                                tickFormatter={(val) => Math.round(val).toLocaleString()}
                            />
                            <Tooltip content={<CustomTooltip chartData={chartData} />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                            <Area 
                                type="monotone" 
                                dataKey="uniqueVisitors" 
                                stroke={COLORS.gold} 
                                strokeWidth={4} 
                                fillOpacity={1} 
                                fill="url(#goldGradient)" 
                                activeDot={{ r: 8, stroke: COLORS.gold, strokeWidth: 2, fill: '#000', className: 'shadow-glow-gold' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* --- SECTION 3: CATEGORY & SEARCH INTELLIGENCE --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 px-4 sm:px-0">
                
                {/* CATEGORY DISTRIBUTION (DONUT) */}
                <div className="lg:col-span-5 bg-[var(--card-bg)] p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-[var(--glass-border)] shadow-2xl flex flex-col">
                    <div className="mb-6 sm:mb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Category Distribution</h3>
                        <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] mt-2 opacity-50">Topic-specific reach analysis</p>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="h-[300px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data?.content?.topCategories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={8}
                                        dataKey="views"
                                        stroke="none"
                                    >
                                        {data?.content?.topCategories?.map((entry: any, index: number) => (
                                            <Cell 
                                                key={`cell-${index}`} 
                                                fill={(COLORS.categories as any)[entry.name] || COLORS.primary} 
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<SimpleTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">Total Views</span>
                                <span className="text-3xl font-black text-white italic mt-1">
                                    {data?.content?.topCategories?.reduce((acc: number, curr: any) => acc + curr.views, 0).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 w-full gap-4 mt-8">
                            {data?.content?.topCategories?.slice(0, 6).map((cat: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/2 border border-white/5 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="w-2.5 h-2.5 rounded-full" 
                                            style={{ backgroundColor: (COLORS.categories as any)[cat.name] || COLORS.primary }} 
                                        />
                                        <span className="text-[10px] font-bold text-white uppercase truncate max-w-[80px]">{cat.name}</span>
                                    </div>
                                    <span className="text-[10px] font-black text-primary">{cat.percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SEARCH INTELLIGENCE */}
                <div className="lg:col-span-7 bg-[var(--card-bg)] p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5 rotate-45">
                        <Zap size={150} />
                    </div>
                    <div className="mb-6 sm:mb-10">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Search Intelligence</h3>
                        <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-[0.2em] mt-2 opacity-50">Neural keyword processing stream</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-8">
                        {data?.behavior?.topSearches?.map((search: any, i: number) => (
                            <motion.div 
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-5 group hover:border-primary/50 transition-all cursor-default backdrop-blur-md"
                            >
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-white uppercase tracking-widest">{search.keyword}</span>
                                    <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em] mt-1 italic">Query Count: {search.count}</span>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-primary/40 group-hover:text-primary transition-colors" />
                            </motion.div>
                        ))}
                        {data?.behavior?.topSearches?.length === 0 && <NoData />}
                    </div>

                    <div className="mt-10 sm:mt-20 pt-6 sm:pt-10 border-t border-[var(--glass-border)]">
                        <h4 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] mb-4 sm:mb-8">Average Reading Time</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-6">
                            {data?.content?.readingTime?.map((rt: any, i: number) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{rt.category}</p>
                                        <Clock className="w-3 h-3 text-primary/40" />
                                    </div>
                                    <p className="text-xl font-black text-white italic">{Math.floor(rt.time / 60)}m {Math.round(rt.time % 60)}s</p>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (rt.time / 600) * 100)}%` }}
                                            className="h-full bg-primary/40"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 4: TOP PERFORMING ARTICLES --- */}
            <div className="bg-[var(--card-bg)] rounded-[2rem] sm:rounded-[3rem] border border-[var(--glass-border)] shadow-2xl overflow-hidden mx-4 sm:mx-0">
                <div className="p-6 sm:p-12 border-b border-[var(--glass-border)] flex items-center justify-between">
                    <div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Top Performing Articles</h3>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-[0.3em] mt-3">High-Impact intelligence transmissions ranked by global reach</p>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-2xl">
                        <Award className="w-6 h-6 text-primary" />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-white/2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                                <th className="px-12 py-8">Intelligence Header</th>
                                <th className="px-12 py-8">Classification</th>
                                <th className="px-12 py-8">Field Agent</th>
                                <th className="px-12 py-8">Transmission Date</th>
                                <th className="px-12 py-8 text-right">Reach (Views)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--glass-border)]">
                            {data?.content?.topArticles?.map((art: any, i: number) => (
                                <tr key={i} className="group hover:bg-white/2 transition-all cursor-default">
                                    <td className="px-12 py-8">
                                        <div className="flex items-center gap-6 max-w-lg">
                                            <div className="w-20 h-14 rounded-xl overflow-hidden bg-[var(--surface-hover)] border border-[var(--glass-border)] relative shrink-0">
                                                <img src={art.featuredImage || '/logo.webp'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-white uppercase truncate leading-tight tracking-tight">{art.title}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-[9px] font-black text-success uppercase flex items-center gap-1">
                                                        <ThumbsUp className="w-2.5 h-2.5" /> {art.likes || 0}
                                                    </span>
                                                    <span className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1">
                                                        <ArrowUpRight className="w-2.5 h-2.5" /> {art.shares || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-12 py-8">
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                            {art.category}
                                        </span>
                                    </td>
                                    <td className="px-12 py-8">
                                        <p className="text-[10px] font-black text-white uppercase italic tracking-widest opacity-80">{art.authorName}</p>
                                    </td>
                                    <td className="px-12 py-8">
                                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                                            {new Date(art.publishedAt || Date.now()).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </td>
                                    <td className="px-12 py-8 text-right">
                                        <p className="text-xl font-black text-primary italic tabular-nums">{art.views.toLocaleString()}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- SECTION 5: VISITOR INSIGHTS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                <InsightCard title="Nodes Today" value={todayStats.uv} sub="Daily Unique" />
                <InsightCard title="Returning" value={data?.traffic?.returning?.returning} sub="Recurrent Nodes" />
                <InsightCard title="Loyalty Rate" value={`${data?.traffic?.returning?.rate}%`} sub="Retention Velocity" />
                <InsightCard title="Avg Depth" value={Math.round(data?.traffic?.totalViews / (data?.traffic?.uniqueVisitors || 1))} sub="Pages / Node" />
                <InsightCard title="Flow Volume" value={data?.traffic?.totalViews} sub="Total Interaction" />
            </div>

        </div>
    );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, growth, icon, label, subValue }: any) => (
    <div className="bg-[var(--card-bg)] p-10 rounded-[2.5rem] border border-[var(--glass-border)] hover:border-primary/30 transition-all group relative overflow-hidden h-full flex flex-col justify-between">
        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity -rotate-12 translate-x-4 -translate-y-4">
            {icon}
        </div>
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div className="p-3 bg-white/5 text-white rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-all border border-white/5">
                    {icon}
                </div>
                {growth !== undefined && (
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg",
                        growth >= 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    )}>
                        {growth >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {Math.abs(growth)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-3">{title}</p>
                <div className="flex items-baseline gap-4">
                    <p className="text-4xl font-black text-white italic tracking-tighter tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                    {subValue && <span className="text-[10px] font-black text-primary uppercase italic opacity-60">{subValue}</span>}
                </div>
            </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[var(--glass-border)]">
            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-40 italic">{label}</p>
        </div>
    </div>
);

const InsightCard = ({ title, value, sub }: any) => (
    <div className="bg-[var(--card-bg)] p-8 rounded-[2rem] border border-[var(--glass-border)] flex flex-col items-center justify-center text-center group hover:bg-white/2 transition-colors">
        <p className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-2 group-hover:scale-110 transition-transform">{title}</p>
        <p className="text-2xl font-black text-white italic tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-2 opacity-40">{sub}</p>
    </div>
);

const CountUp = ({ value, className }: { value: number, className?: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        let totalDuration = 1000;
        let increment = end / (totalDuration / 16);
        
        let timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return <span className={className}>{count.toLocaleString()}</span>;
};

const CustomTooltip = ({ active, payload, chartData }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        
        // Dynamic Growth Calculation
        let growthStr = "+18%"; // Default simulation value
        if (chartData && !data.isDemo) {
            const currentIndex = chartData.findIndex((d: any) => d.date === data.date);
            const prevData = chartData[currentIndex - 1];
            if (prevData) {
                const current = data.uniqueVisitors || 0;
                const previous = prevData.uniqueVisitors || 0;
                const growth = previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);
                growthStr = `${growth >= 0 ? '+' : ''}${growth}%`;
            } else {
                growthStr = "STABLE";
            }
        }

        return (
            <div className="bg-[var(--background-deep)]/90 backdrop-blur-2xl border border-primary/20 p-6 rounded-2xl shadow-3xl">
                <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-4 border-b border-white/5 pb-3">
                    {new Date(data.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-10">
                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">Unique Visitors</span>
                        <span className="text-sm font-black text-primary italic">{data.uniqueVisitors?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between gap-10">
                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">Returning</span>
                        <span className="text-sm font-black text-purple-500 italic">{data.returningVisitors?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between gap-10">
                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">Growth</span>
                        <span className={cn(
                            "text-sm font-black italic",
                            growthStr.startsWith('+') || growthStr === 'STABLE' ? "text-success" : "text-danger"
                        )}>{growthStr}</span> 
                    </div>
                </div>
                {data.isDemo && (
                    <div className="mt-4 pt-3 border-t border-white/5">
                        <p className="text-[7px] font-black text-orange-500 uppercase tracking-widest text-center">Simulated Mission Data</p>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const SimpleTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[var(--background-deep)]/90 backdrop-blur-xl border border-white/10 p-4 rounded-xl shadow-2xl">
                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">{data.name}</p>
                <p className="text-sm font-black text-primary italic">{data.views.toLocaleString()} Views</p>
            </div>
        );
    }
    return null;
};

const NoData = () => (
    <div className="py-10 w-full text-center">
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest opacity-30 italic">Satellite telemetry unavailable</p>
    </div>
);

export default AnalyticsDashboard;
