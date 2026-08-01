import React, { useEffect, useState } from 'react';
import { 
    FileText, 
    Eye, 
    TrendingUp, 
    Clock, 
    ThumbsUp, 
    Award,
    RefreshCw,
    Loader2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area
} from 'recharts';
import api from '../config/api';
import { useToastStore } from '../hooks/useToastStore';
import { cn, getCategoryBadgeClass } from '../lib/utils';

const AuthorPerformance: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('7d');
    const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
    const { addToast } = useToastStore();

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/api/author/performance?period=${period}`);
            setData(res.data);
        } catch (err) {
            console.error('Failed to fetch author performance:', err);
            addToast('error', 'UPLINK FAILED', 'COULD NOT RETRIEVE PERFORMANCE DATA');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    if (loading && !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Decrypting Personal Metrics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 font-manrope">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-success/5 border border-success/10 p-10 rounded-[3rem] relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-normal tracking-tight text-[var(--text-primary)] uppercase font-lemon">Personal Merit</h1>
                    <p className="text-success font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2 italic">
                        <TrendingUp className="w-3 h-3" /> Field Agent Performance Insight Terminal
                    </p>
                </div>
                <div className="flex gap-4 relative z-10">
                    {['7d', '30d'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                period === p 
                                ? "bg-success text-white shadow-lg shadow-success/20" 
                                : "bg-white/5 text-[var(--text-secondary)] hover:text-white"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                    <button 
                        onClick={fetchData}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </button>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Transmissions" 
                    value={data?.totalArticles} 
                    icon={<FileText className="w-5 h-5" />} 
                    color="text-blue-500"
                />
                <StatCard 
                    title="Global Reach (Views)" 
                    value={data?.totalViews?.toLocaleString()} 
                    icon={<Eye className="w-5 h-5" />} 
                    color="text-primary"
                />
                <StatCard 
                    title="Avg Reach/Report" 
                    value={Math.round(data?.averageViews).toLocaleString()} 
                    icon={<TrendingUp className="w-5 h-5" />} 
                    color="text-success"
                />
                <StatCard 
                    title="Engagement (Likes)" 
                    value={data?.totalLikes || 0} 
                    icon={<ThumbsUp className="w-5 h-5" />} 
                    color="text-orange-500"
                />
            </div>

            {/* Performance Graph */}
            <div className="liquid-glass p-10 rounded-[3rem] border-white/5 shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight">Performance Trend</h3>
                        <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1 opacity-60">Daily view distribution across reports</p>
                    </div>
                </div>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.growthChart}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="rgba(255,255,255,0.3)" 
                                fontSize={10} 
                                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            />
                            <YAxis 
                                stroke="rgba(255,255,255,0.3)" 
                                fontSize={10} 
                                allowDecimals={false}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'var(--background-deep)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                                itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                            />
                            <Area type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Top Articles */}
                <div className="liquid-glass p-10 rounded-[3rem] border-white/5">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Highest Impact Reports</h3>
                    <div className="space-y-4">
                        {data?.topArticles?.map((art: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-white/2 rounded-2xl group hover:border-primary/30 border border-transparent transition-all">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                        {i + 1}
                                    </div>
                                    <div className="truncate">
                                        <p className="text-[12px] font-bold text-white truncate">{art.title}</p>
                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">{art.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-[10px] font-black uppercase text-[var(--text-secondary)]">
                                    <span className="flex items-center gap-2"><Eye className="w-3 h-3 text-primary" /> {art.views}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Most Viewed Spotlight */}
                <div className="bg-primary text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/20 relative overflow-hidden flex flex-col justify-between min-h-[400px]">
                    <div className="absolute right-[-5%] top-[-10%] opacity-10 rotate-12">
                        <Award size={300} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">Lead Intelligence Node</h3>
                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-12">The transmission with maximum global penetration</p>
                        
                        {data?.mostViewedArticle ? (
                            <div className="space-y-6">
                                <h4 className="text-3xl font-black leading-tight italic">"{data.mostViewedArticle.title}"</h4>
                                <div className="flex items-center gap-10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Impact (Views)</p>
                                        <p className="text-4xl font-black tabular-nums">{data.mostViewedArticle.views.toLocaleString()}</p>
                                    </div>
                                    <div className="h-12 w-px bg-white/20" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Engagement</p>
                                        <p className="text-4xl font-black tabular-nums">{data.mostViewedArticle.likes || 0}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm font-bold uppercase tracking-widest italic opacity-50">No data available</p>
                        )}
                    </div>
                    
                    <div className="relative z-10 mt-auto pt-8 border-t border-white/10">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em]">Verified Field Transmission 2026</p>
                    </div>
                </div>
            </div>

            {/* Recent Transmissions Table */}
            <div className="liquid-glass rounded-[3rem] border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Recent Operational History
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-white/2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                                <th className="px-8 py-6">Date</th>
                                <th className="px-8 py-6">Intelligence Header</th>
                                <th className="px-8 py-6">Category</th>
                                <th className="px-8 py-6 text-right">Views</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data?.recentArticles?.map((art: any, i: number) => {
                                const isExpanded = expandedArticleId === art._id;
                                const isApproved = ['APPROVED', 'PUBLISHED'].includes(art.status);

                                return (
                                    <React.Fragment key={art._id || i}>
                                        <tr 
                                            onClick={() => setExpandedArticleId(isExpanded ? null : art._id)}
                                            className="hover:bg-white/2 transition-colors cursor-pointer"
                                        >
                                            <td className="px-8 py-6 text-[10px] font-bold text-[var(--text-secondary)]">{new Date(art.createdAt).toLocaleDateString()}</td>
                                            <td className="px-8 py-6 text-sm font-bold text-white uppercase">{art.title}</td>
                                            <td className="px-8 py-6">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all duration-300",
                                                    getCategoryBadgeClass(art.category)
                                                )}>
                                                    {art.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-primary tabular-nums">
                                                <div className="flex items-center justify-end gap-3">
                                                    <span>{art.views || 0}</span>
                                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={4} className="px-8 py-8 bg-white/1">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                                                        
                                                        {/* SEO Metadata Card */}
                                                        <div className="bg-white/2 border border-white/5 p-6 rounded-[2rem] space-y-4">
                                                            <h4 className="text-xs font-black text-white uppercase tracking-wider">Search Engine Optimization</h4>
                                                            <div className="space-y-4 border-t border-white/5 pt-4">
                                                                <div className="space-y-1">
                                                                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest">SEO Title</span>
                                                                    <div className="bg-white/2 border border-white/5 rounded-xl p-3 text-xs text-white font-bold break-words">
                                                                        {art.seoTitle || art.title || <span className="italic opacity-40">None (Defaults to Article Title)</span>}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest">Focus Keyword</span>
                                                                    <div className="bg-white/2 border border-white/5 rounded-xl p-3 text-xs text-white font-bold">
                                                                        {art.focusKeyword || <span className="italic opacity-40">Not provided</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Credit breakdown */}
                                                        <div className="bg-white/2 border border-white/5 p-6 rounded-[2rem] space-y-4">
                                                            <h4 className="text-xs font-black text-white uppercase tracking-wider">Merit Breakdown</h4>
                                                            
                                                            <div className="space-y-2 text-[10px] text-white uppercase">
                                                                {isApproved ? (
                                                                    <>
                                                                        <div className="flex justify-between py-1 border-b border-white/5">
                                                                            <span className="text-[var(--text-secondary)] font-bold">SEO Credits Awarded</span>
                                                                            <span className="font-mono text-green-500 font-bold">+{art.awardedSeoCredits || 0}</span>
                                                                        </div>
                                                                        <div className="flex justify-between py-1 border-b border-white/5">
                                                                            <span className="text-[var(--text-secondary)] font-bold">Content Quality</span>
                                                                            <span className="font-mono">+{art.creditBreakdown?.contentQuality || 0}</span>
                                                                        </div>
                                                                        <div className="flex justify-between py-1 border-b border-white/5">
                                                                            <span className="text-[var(--text-secondary)] font-bold">Originality</span>
                                                                            <span className="font-mono">+{art.creditBreakdown?.originality || 0}</span>
                                                                        </div>
                                                                        <div className="flex justify-between py-1 border-b border-white/5">
                                                                            <span className="text-[var(--text-secondary)] font-bold">Research Quality</span>
                                                                            <span className="font-mono">+{art.creditBreakdown?.researchQuality || 0}</span>
                                                                        </div>
                                                                        <div className="flex justify-between py-1 border-b border-white/5">
                                                                            <span className="text-[var(--text-secondary)] font-bold">Images & Assets</span>
                                                                            <span className="font-mono">+{art.creditBreakdown?.images || 0}</span>
                                                                        </div>
                                                                        <div className="flex justify-between py-1 border-b border-white/5">
                                                                            <span className="text-[var(--text-secondary)] font-bold">Headline Quality</span>
                                                                            <span className="font-mono">+{art.creditBreakdown?.headline || 0}</span>
                                                                        </div>
                                                                        <div className="flex justify-between py-1 border-b border-white/5">
                                                                            <span className="text-[var(--text-secondary)] font-bold">Publishing Bonus</span>
                                                                            <span className="font-mono">+{art.creditBreakdown?.publishingBonus || 0}</span>
                                                                        </div>
                                                                        <div className="flex justify-between py-2 border-t border-primary/20 text-xs font-black pt-3">
                                                                            <span className="text-white">Total Credits Earned</span>
                                                                            <span className="font-mono text-primary text-sm font-black">+{art.totalCredits || 0}</span>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="py-12 text-center text-[var(--text-secondary)] font-bold tracking-widest uppercase italic border border-white/5 rounded-xl bg-white/2">
                                                                        Credits will be awarded upon approval
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }: any) => (
    <div className="liquid-glass p-8 rounded-[2rem] border-white/5 hover:border-primary/20 transition-all group">
        <div className="flex items-center justify-between mb-6">
            <div className={cn("p-3 bg-white/5 rounded-xl group-hover:scale-110 transition-transform border border-white/5", color)}>
                {icon}
            </div>
        </div>
        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">{title}</p>
        <p className="text-3xl font-black text-white italic">{value || 0}</p>
    </div>
);

export default AuthorPerformance;
