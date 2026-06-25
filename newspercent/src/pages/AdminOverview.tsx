import React, { useEffect, useState } from 'react';
import { 
  Users, 
  FileText, 
  Clock, 
  Eye, 
  BarChart3,
  AlertCircle,
  RefreshCw,
  Globe,
  Shield,
  Heart,
  Activity,
  Terminal,
  Monitor,
  Zap,
  ShieldAlert,
  Award,
  History,
  TrendingUp,
  Bell
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import api from '../config/api';
import { useAuthStore } from '../hooks/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

const AdminOverview: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [securityStats, setSecurityStats] = useState<any>(null);
  const [recentLogins, setRecentLogins] = useState<any[]>([]);
  const [sysSettings, setSysSettings] = useState<any>(null);
  const [creditProfile, setCreditProfile] = useState<any>(null);
  const [creditHistory, setCreditHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Big Breaking News states
  const [currentBigBreaking, setCurrentBigBreaking] = useState<any>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [apiHealth, setApiHealth] = useState<any>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsRes, articlesRes, secStatsRes, loginsRes, settingsRes, creditsRes, historyRes, bigBreakingRes, healthRes] = await Promise.all([
        api.get('/api/admin/analytics'),
        api.get('/api/news'),
        api.get('/api/security/stats'),
        api.get('/api/security/logins?limit=10'),
        api.get('/api/settings/public'),
        api.get('/api/credits/me'),
        user ? api.get(`/api/credits/history/${user._id}`) : Promise.resolve({ data: [] }),
        api.get('/api/big-breaking'),
        api.get('/api/admin/external-apis/health')
      ]);
      
      setStats(statsRes.data);
      setArticles(articlesRes.data);
      setSecurityStats(secStatsRes.data);
      setRecentLogins(loginsRes.data.logs || []);
      setSysSettings(settingsRes.data);
      setCreditProfile(creditsRes.data);
      setCreditHistory(historyRes.data || []);
      setCurrentBigBreaking(bigBreakingRes.data.article);
      setApiHealth(healthRes.data);
    } catch (err: any) {
      console.error('Analytics Fetch Error:', err);
      setError(err.response?.data?.error || err.message || 'Database connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetBigBreaking = async () => {
    if (!selectedArticleId) return;
    try {
      setLoading(true);
      await api.put(`/api/admin/big-breaking/${selectedArticleId}`);
      const bigBreakingRes = await api.get('/api/big-breaking');
      setCurrentBigBreaking(bigBreakingRes.data.article);
      setSelectedArticleId('');
      setSearchFilter('');
      alert('Big Breaking article successfully updated!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to set Big Breaking article.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBigBreaking = async () => {
    try {
      setLoading(true);
      await api.delete('/api/admin/big-breaking');
      setCurrentBigBreaking(null);
      alert('Big Breaking news removed.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove Big Breaking article.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Aggregating Global Intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 bg-red-500/5 border border-red-500/10 rounded-[3rem] p-12">
        <AlertCircle className="w-16 h-16 text-red-500 animate-pulse" />
        <div className="text-center">
          <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-2">System Error</h2>
          <p className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            {error}
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="px-10 py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-500/20 uppercase text-[10px] tracking-widest flex items-center gap-3"
        >
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  // SECTION 1: PLATFORM OVERVIEW (Dashboard Summary Cards)
  const statCards = [
    { label: 'Total Articles', value: stats?.totalArticles || 0, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Published Articles', value: stats?.publishedArticles || 0, icon: Globe, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Published Today', value: stats?.publishedToday || 0, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Total Views', value: (stats?.totalViews || 0).toLocaleString(), icon: Eye, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { label: 'Total Authors', value: stats?.totalAuthors || 0, icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Total Admins', value: stats?.totalAdmins || 0, icon: Shield, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  // Derive top lists for Sections 2 and 3
  const topViewedArticles = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const topLikedArticles = [...articles].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 10);

  const statusCards = [
    { 
      label: 'Credit System Status', 
      value: sysSettings?.performanceCreditsEnabled ? 'Active' : 'Disabled', 
      icon: Zap, 
      color: sysSettings?.performanceCreditsEnabled ? 'text-green-500' : 'text-red-500', 
      bg: sysSettings?.performanceCreditsEnabled ? 'bg-green-500/10' : 'bg-red-500/10' 
    }
  ];

  const publishedArticles = articles.filter(a => a.status === 'PUBLISHED');
  const filteredSearchArticles = publishedArticles.filter(a => 
      a.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (isMobile) {
    const pendingReviewsCount = articles.filter(a => a.status === 'PENDING_REVIEW').length;
    
    return (
      <div className="space-y-6 pb-24 font-manrope">
        {sysSettings?.emergencyMode && (
          <div className="bg-red-500 text-white p-4 text-center font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 text-[10px] animate-pulse">
            MAINTENANCE ACTIVE: SYSTEMS RESTRICTED
          </div>
        )}

        <header className="p-4 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl">
          <h1 className="text-lg font-black uppercase text-white tracking-wider">Admin Control</h1>
          <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">Platform Command Dashboard</p>
        </header>

        {/* Quick Operations Grid */}
        <div className="grid grid-cols-2 gap-3 px-1">
          {/* 1. Editorial Queue */}
          <div 
            onClick={() => navigate('/admin/pending')}
            className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex flex-col justify-between aspect-square active:scale-95 transition-transform cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <FileText className="w-6 h-6 text-orange-500" />
              {pendingReviewsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[8px] font-black">{pendingReviewsCount}</span>
              )}
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Operational</h4>
              <p className="text-sm font-black uppercase text-white">Editorial Queue</p>
            </div>
          </div>

          {/* 2. Analytics */}
          <div 
            onClick={() => navigate('/admin/analytics')}
            className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex flex-col justify-between aspect-square active:scale-95 transition-transform cursor-pointer"
          >
            <BarChart3 className="w-6 h-6 text-success" />
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{(stats?.totalViews || 0).toLocaleString()} Views</h4>
              <p className="text-sm font-black uppercase text-white">Analytics</p>
            </div>
          </div>

          {/* 3. Credits */}
          <div 
            onClick={() => navigate('/admin/merit')}
            className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex flex-col justify-between aspect-square active:scale-95 transition-transform cursor-pointer"
          >
            <Zap className="w-6 h-6 text-yellow-500" />
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                {sysSettings?.performanceCreditsEnabled ? 'Active' : 'Disabled'}
              </h4>
              <p className="text-sm font-black uppercase text-white">Credits</p>
            </div>
          </div>

          {/* 4. Flash News */}
          <div 
            onClick={() => navigate('/admin/flash-news')}
            className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex flex-col justify-between aspect-square active:scale-95 transition-transform cursor-pointer"
          >
            <Zap className="w-6 h-6 text-primary animate-pulse" />
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Broadcasts</h4>
              <p className="text-sm font-black uppercase text-white">Flash News</p>
            </div>
          </div>

          {/* 5. Notifications */}
          <div 
            onClick={() => navigate('/admin')}
            className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex flex-col justify-between aspect-square active:scale-95 transition-transform cursor-pointer"
          >
            <Bell className="w-6 h-6 text-purple-500" />
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">System Alerts</h4>
              <p className="text-sm font-black uppercase text-white">Notifications</p>
            </div>
          </div>

          {/* 6. Settings */}
          <div 
            onClick={() => navigate('/admin/settings/system')}
            className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex flex-col justify-between aspect-square active:scale-95 transition-transform cursor-pointer"
          >
            <Shield className="w-6 h-6 text-blue-500" />
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Configurations</h4>
              <p className="text-sm font-black uppercase text-white">Settings</p>
            </div>
          </div>
        </div>

        {/* Security / System status widget */}
        <div className="p-4 rounded-2xl bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">Operations Feed</h4>
            <span className="text-[8px] bg-green-500/20 text-green-500 border border-green-500/30 px-1.5 py-0.5 rounded font-black uppercase">Live</span>
          </div>
          <div className="space-y-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            <div className="flex justify-between">
              <span>Articles Count:</span>
              <span className="text-white">{stats?.totalArticles || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Staff:</span>
              <span className="text-white">{stats?.totalAuthors || 0} Authors</span>
            </div>
            <div className="flex justify-between">
              <span>System Health:</span>
              <span className="text-success">99.98% Active</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 font-manrope">
      {sysSettings?.emergencyMode && (
        <div className="bg-red-500 text-white p-6 text-center font-black uppercase tracking-[0.3em] rounded-[2rem] shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse flex items-center justify-center gap-4">
          <ShieldAlert className="w-6 h-6" /> MAINTENANCE MODE ACTIVE: SYSTEMS RESTRICTED <ShieldAlert className="w-6 h-6" />
        </div>
      )}
      {sysSettings && !sysSettings.performanceCreditsEnabled && !sysSettings.emergencyMode && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 p-6 text-center font-black uppercase tracking-widest rounded-[2rem] flex items-center justify-center gap-4">
          <AlertCircle className="w-5 h-5" /> PERFORMANCE CREDIT SYSTEM IS CURRENTLY DISABLED. NO CREDITS ARE BEING AWARDED.
        </div>
      )}

      <header className={cn(
        "flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden group border",
        "bg-primary/5 border-primary/10",
        "light:bg-gradient-to-br light:from-[#FFF7F3] light:to-white light:border-[#E8E2D8]"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,69,58,0.05),transparent_70%)] light:hidden" />
        <div className="relative z-10">
          <h1 className="text-4xl font-normal tracking-tight text-[var(--text-primary)] uppercase font-lemon">Dashboard</h1>
          <p className="text-primary font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2 italic">
            <BarChart3 className="w-3 h-3" /> System Performance & Global Metrics
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-end">
          <span className="text-[var(--text-secondary)] text-[8px] font-bold uppercase tracking-[0.2em] opacity-40">System Uptime</span>
          <span className="text-[var(--text-primary)] text-xs font-black mt-1">99.98% ACTIVE</span>
        </div>
      </header>

      {/* SECTION 1: PLATFORM OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...statusCards, ...statCards].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="liquid-glass p-8 rounded-[2.5rem] border-[var(--glass-border)] transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-bl-full" />
            <div className="flex justify-between items-start mb-6">
              <div className={cn(
                "p-4 rounded-2xl border border-[var(--glass-border)] group-hover:scale-110 transition-transform duration-500",
                card.bg
              )}>
                <card.icon className={cn("w-6 h-6", card.color)} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">{card.value}</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
              {card.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* EXTERNAL API STATUS DASHBOARD WIDGET */}
      <div className="liquid-glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border-[var(--glass-border)] shadow-2xl relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight font-lemon flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary" /> External API Status
          </h2>
          <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
            Last Health Check: {apiHealth?.timestamp ? new Date(apiHealth.timestamp).toLocaleTimeString() : 'N/A'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weather API Health */}
          <div className="p-6 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Globe className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold uppercase text-white">Weather API</h4>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">Provider: WeatherAPI</p>
              </div>
            </div>
            <span className={cn(
              "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md border",
              apiHealth?.weatherStatus === 'Connected' ? "bg-green-500/10 border-green-500/20 text-green-500" :
              apiHealth?.weatherStatus === 'Disabled' ? "bg-white/5 border-white/10 text-white/50" :
              "bg-red-500/10 border-red-500/20 text-red-500"
            )}>
              {apiHealth?.weatherStatus || 'Disconnected'}
            </span>
          </div>

          {/* Stock Market API Health */}
          <div className="p-6 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold uppercase text-white">Stock Market API</h4>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">Provider: Yahoo Finance</p>
              </div>
            </div>
            <span className={cn(
              "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md border",
              apiHealth?.stockStatus === 'Connected' ? "bg-green-500/10 border-green-500/20 text-green-500" :
              apiHealth?.stockStatus === 'Disabled' ? "bg-white/5 border-white/10 text-white/50" :
              "bg-red-500/10 border-red-500/20 text-red-500"
            )}>
              {apiHealth?.stockStatus || 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* BIG BREAKING NEWS MANAGEMENT */}
      <div className="liquid-glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border-[var(--glass-border)] shadow-2xl relative overflow-hidden space-y-6">
        <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight font-manrope flex items-center gap-3">
          <Zap className="w-5 h-5 text-yellow-500 animate-pulse" /> Big Breaking News Management
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Current Big Breaking Article */}
          <div className="p-6 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-2 block">
                Current Big Breaking Article
              </span>
              {currentBigBreaking ? (
                <div className="space-y-3 mt-2">
                  <h3 className="text-lg font-black text-white uppercase font-manrope line-clamp-2 leading-snug">{currentBigBreaking.title}</h3>
                  <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold">
                    Category: {currentBigBreaking.category} • Author: {currentBigBreaking.authorName || 'Field Agent'}
                  </p>
                  <button 
                    onClick={handleRemoveBigBreaking}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-[9px] uppercase tracking-widest transition-all mt-4"
                  >
                    Remove Assignment
                  </button>
                </div>
              ) : (
                <p className="text-xs font-semibold text-white/40 italic mt-2">No Big Breaking article assigned at this time.</p>
              )}
            </div>
          </div>

          {/* Right Column: Searchable Selector */}
          <div className="p-6 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-3xl space-y-4">
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] block">
              Assign New Big Breaking Article
            </span>
            
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Type to search articles..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:border-primary transition-all font-manrope"
              />
              
              <div className="max-h-36 overflow-y-auto border border-white/10 rounded-xl divide-y divide-white/5 bg-black/20 pr-1">
                {filteredSearchArticles.map(art => (
                  <button
                    key={art._id || art.id}
                    onClick={() => setSelectedArticleId(art._id || art.id)}
                    className={cn(
                      "w-full text-left p-3 text-[10px] font-bold uppercase transition-all flex justify-between items-center",
                      selectedArticleId === (art._id || art.id) ? "bg-primary/20 text-primary border-l-2 border-primary" : "text-white/70 hover:bg-white/5"
                    )}
                  >
                    <span className="truncate pr-4">[{art.category}] {art.title}</span>
                    <span className="text-[8px] opacity-40 flex-shrink-0">{new Date(art.publishedAt || art.createdAt).toLocaleDateString()}</span>
                  </button>
                ))}
                {filteredSearchArticles.length === 0 && (
                  <p className="p-4 text-center text-[10px] font-bold text-white/30 uppercase">No matching articles</p>
                )}
              </div>

              <button
                onClick={handleSetBigBreaking}
                disabled={!selectedArticleId}
                className="w-full py-3.5 bg-primary hover:bg-red-600 disabled:opacity-50 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all mt-2"
              >
                Set As Big Breaking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: ACTIVE SYSTEM OPERATORS */}
      <div className="liquid-glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border-[var(--glass-border)] shadow-2xl relative overflow-hidden">
        <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight font-manrope mb-8 flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" /> Active System Operators
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {[
             { label: 'Active Sessions', value: securityStats?.activeSessions || 0, color: 'text-success', bg: 'bg-success/10', icon: Activity },
             { label: 'Successful Logins Today', value: securityStats?.successfulLoginsToday || 0, color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Shield },
             { label: 'Total Admins Online', value: securityStats?.totalAdmins || 0, color: 'text-cyan-500', bg: 'bg-cyan-500/10', icon: Users },
             { label: 'Total Authors Online', value: securityStats?.totalAuthors || 0, color: 'text-purple-500', bg: 'bg-purple-500/10', icon: Users },
           ].map((stat, i) => (
             <div key={i} className="p-6 rounded-3xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex items-center gap-4 group transition-all hover:border-primary/20">
               <div className={cn("p-3 rounded-2xl", stat.bg)}>
                 <stat.icon className={cn("w-5 h-5", stat.color)} />
               </div>
               <div>
                 <p className="text-2xl font-black text-[var(--text-primary)]">{stat.value}</p>
                 <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{stat.label}</p>
               </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* SECTION 2: MOST VIEWED ARTICLES */}
         <div className="liquid-glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border-[var(--glass-border)] shadow-2xl relative overflow-hidden flex flex-col h-[500px]">
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight font-manrope mb-6 flex items-center gap-3">
               <Eye className="w-5 h-5 text-blue-500" /> Top Articles Today
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {topViewedArticles.length > 0 ? (
                <div className="space-y-4">
                  {topViewedArticles.map((article, i) => (
                    <div key={article._id || article.id} className="flex items-center gap-4 p-4 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl group hover:border-blue-500/30 transition-all">
                      <span className="text-lg font-black text-[var(--text-secondary)] opacity-50 w-6 text-center tabular-nums">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-blue-500 transition-colors">{article.title}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1 truncate">
                          {article.category} • {article.author || article.authorName} • {new Date(article.publishDate || article.publishedAt || article.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-sm font-black text-[var(--text-primary)] tabular-nums">{article.views || 0}</span>
                        <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Views</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">No articles found</p>
                </div>
              )}
            </div>
         </div>

         {/* SECTION 3: MOST LIKED ARTICLES */}
         <div className="liquid-glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border-[var(--glass-border)] shadow-2xl relative overflow-hidden flex flex-col h-[500px]">
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight font-manrope mb-6 flex items-center gap-3">
               <Heart className="w-5 h-5 text-red-500" /> Trending By Engagement
            </h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {topLikedArticles.length > 0 ? (
                <div className="space-y-4">
                  {topLikedArticles.map((article, i) => (
                    <div key={article._id || article.id} className="flex items-center gap-4 p-4 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl group hover:border-red-500/30 transition-all">
                      <span className="text-lg font-black text-[var(--text-secondary)] opacity-50 w-6 text-center tabular-nums">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-red-500 transition-colors">{article.title}</p>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1 truncate">
                          {article.category} • By {article.author || article.authorName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-sm font-black text-[var(--text-primary)] tabular-nums">{article.likes || 0}</span>
                        <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Likes</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">No engagement data</p>
                </div>
              )}
            </div>
         </div>
      </div>

      {/* SECTION 5: RECENT ACCESS ACTIVITY & PERSONAL MERIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Access Activity */}
        <div className="lg:col-span-2 liquid-glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border-[var(--glass-border)] shadow-2xl relative overflow-hidden flex flex-col h-[550px]">
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight font-manrope mb-8 flex items-center gap-3">
            <Terminal className="w-5 h-5 text-cyan-500" /> Recent Access Activity
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-[var(--surface-hover)]">
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">User</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Role</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Login Time</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Device</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Browser</th>
                    <th className="p-4 text-[9px] font-bold uppercase tracking-widest text-[var(--text-secondary)] text-right">Duration (min)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {recentLogins.map((log) => (
                    <tr key={log._id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="p-4 font-bold text-sm text-[var(--text-primary)]">{log.name || log.email}</td>
                      <td className="p-4">
                        <span className={cn("text-[8px] font-bold uppercase tracking-widest px-2 py-1 rounded-full", log.role.includes('admin') ? "bg-cyan-500/10 text-cyan-500" : "bg-primary/10 text-primary")}>
                          {log.role.includes('admin') ? 'ADMIN' : log.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase">{new Date(log.loginTime).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                          <Monitor className="w-3 h-3" /> {log.operatingSystem} ({log.deviceType})
                        </div>
                      </td>
                      <td className="p-4 text-[10px] font-bold text-[var(--text-secondary)] uppercase">{log.browser}</td>
                      <td className="p-4 text-right text-sm font-bold text-[var(--text-primary)]">{log.sessionDuration || '-'}</td>
                    </tr>
                  ))}
                  {recentLogins.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                        No recent activity found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Personal Merit & Credit History */}
        <div className="lg:col-span-1 liquid-glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 border-[var(--glass-border)] shadow-2xl relative overflow-hidden flex flex-col h-[550px]">
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight font-manrope mb-8 flex items-center gap-3">
            <Award className="w-5 h-5 text-primary" /> Personal Merit Terminal
          </h2>
          
          {/* Credit Overview Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl flex flex-col justify-between">
              <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-primary animate-pulse" /> Monthly Credits
              </span>
              <span className="text-2xl font-black text-[var(--text-primary)] italic">
                {creditProfile?.monthlyCredits || 0}
              </span>
            </div>
            <div className="p-4 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl flex flex-col justify-between">
              <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-success" /> Total Credits
              </span>
              <span className="text-2xl font-black text-[var(--text-primary)] italic">
                {creditProfile?.totalCredits || 0}
              </span>
            </div>
          </div>

          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-4 flex items-center gap-2">
            <History className="w-3.5 h-3.5 text-primary" /> Credit Event History
          </h3>

          {/* Scrollable credit transaction log */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {creditHistory.length > 0 ? (
              creditHistory.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-4 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
                      tx.credits > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                    )}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase truncate">{tx.description}</h4>
                      <p className="text-[8px] font-bold text-[var(--text-secondary)] tracking-widest uppercase mt-0.5 truncate">
                        {tx.creditType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className={cn(
                      "text-xs font-black italic",
                      tx.credits > 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {tx.credits > 0 ? '+' : ''}{tx.credits}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em]">Transmission log empty</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;