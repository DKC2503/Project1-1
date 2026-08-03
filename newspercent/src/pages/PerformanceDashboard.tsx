import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  TrendingUp, 
  History, 
  Award, 
  Star, 
  Newspaper,
  ShieldCheck,
  Clock,
  Loader2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { creditService, type CreditProfile, type CreditTransaction, type LeaderboardEntry } from '../services/performanceService';
import { useAuthStore } from '../hooks/useAuthStore';
import { cn } from '../lib/utils';

const PerformanceDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<CreditProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setSnapshotTab] = useState<'leaderboard' | 'history'>('leaderboard');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prof, lead, hist] = await Promise.all([
          creditService.getProfile(),
          creditService.getLeaderboard(),
          user ? creditService.getHistory(user._id) : []
        ]);
        setProfile(prof);
        setLeaderboard(lead ?? []);
        setHistory((hist ?? []) as any);
      } catch (err) {
        console.error('Performance Data Error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Decrypting Performance Metrics...</p>
      </div>
    );
  }

  const badgeList = profile?.badges ?? [];
  const achievementList = profile?.achievements ?? [];

  return (
    <div className="space-y-12 pb-20 font-manrope">
      {/* Header */}
      <header className={cn(
        "flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-10 rounded-[3rem] relative overflow-hidden group border",
        "bg-primary/5 border-primary/10",
        "light:bg-gradient-to-br light:from-[#FFF7F3] light:to-white light:border-[#E8E2D8]"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,69,58,0.05),transparent_70%)] light:hidden" />
        <div className="relative z-10">
          <h1 className="text-4xl font-normal tracking-tight text-[var(--text-primary)] uppercase font-lemon">N% Credit Terminal</h1>
          <p className="text-primary font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2 italic">
            <ShieldCheck className="w-3 h-3" /> Personnel performance & contribution metrics
          </p>
        </div>
        
        <div className="flex gap-10 relative z-10">
           <div className="text-right">
              <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Global Merit Ranking</p>
              <p className="text-4xl font-black text-[var(--text-primary)] italic">#{leaderboard.findIndex(e => e._id === user?._id) + 1 || 'N/A'}</p>
           </div>
        </div>
      </header>
 
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard 
          icon={Zap} 
          label="Total Credits" 
          value={(profile?.totalCredits || 0).toLocaleString()} 
          subValue="Life-time contribution"
          color="primary"
         />
         <StatCard 
          icon={TrendingUp} 
          label="Monthly Intake" 
          value={(profile?.monthlyCredits || 0).toLocaleString()} 
          subValue="Current cycle"
          color="cyan"
         />
         <StatCard 
          icon={Newspaper} 
          label="Articles Published" 
          value={profile?.articlesPublished || 0} 
          subValue="Approved briefings"
          color="purple"
         />
         <StatCard 
          icon={Eye} 
          label="Average Views" 
          value={profile?.articlesPublished ? Math.round(profile.totalViews / profile.articlesPublished).toLocaleString() : 0} 
          subValue="Engagement per article"
          color="orange"
         />
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Badges & Profile */}
        <div className="lg:col-span-4 space-y-10">
           <div className="liquid-glass p-8 rounded-[3rem] border-[var(--glass-border)]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
                 <Award className="w-4 h-4" /> Achievement Badges
              </h3>
              
              <div className="flex flex-wrap gap-4">
                 {badgeList.length ? badgeList.map(badge => (
                   <div key={badge} className="px-4 py-2 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl flex items-center gap-2 group hover:border-primary/40 transition-all cursor-default">
                       <Star className="w-3 h-3 text-primary" />
                       <span className="text-[9px] font-bold text-[var(--text-primary)] uppercase tracking-wider">{badge}</span>
                   </div>
                 )) : (
                   <p className="text-[10px] text-[var(--text-secondary)] italic">No badges earned yet. Continue transmitting...</p>
                 )}
              </div>
           </div>
 
           <div className="liquid-glass p-8 rounded-[3rem] border-[var(--glass-border)]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-8 flex items-center gap-2">
                 <History className="w-4 h-4" /> Latest Achievements
              </h3>
              
              <div className="space-y-4">
                 {achievementList.slice(-5).reverse().map((ach, i) => (
                   <div key={i} className="flex gap-4 p-4 bg-[var(--surface-hover)] rounded-2xl border border-[var(--glass-border)]">
                       <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Star className="w-3 h-3 text-primary" />
                       </div>
                       <p className="text-[10px] font-bold text-[var(--text-primary)] uppercase leading-relaxed pt-1">{ach}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right Side: Leaderboard / History */}
        <div className="lg:col-span-8 space-y-10">
           <div className="liquid-glass rounded-[3rem] border-[var(--glass-border)] overflow-hidden flex flex-col">
              <div className="flex border-b border-[var(--glass-border)]">
                 <button 
                  onClick={() => setSnapshotTab('leaderboard')}
                  className={cn(
                    "flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                    tab === 'leaderboard' ? "text-primary bg-primary/5" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                 >
                   Global Leaderboard
                 </button>
                 <button 
                  onClick={() => setSnapshotTab('history')}
                  className={cn(
                    "flex-1 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                    tab === 'history' ? "text-primary bg-primary/5" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                 >
                   Credit History
                 </button>
              </div>

              <div className="p-8">
                 <AnimatePresence mode="wait">
                    {tab === 'leaderboard' ? (
                      <motion.div 
                        key="lead"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                         {leaderboard.map((entry, idx) => (
                           <div key={entry._id} className={cn(
                             "flex items-center justify-between p-5 rounded-2xl border transition-all",
                             entry._id === user?._id ? "bg-primary/10 border-primary/30" : "bg-[var(--surface-hover)] border-[var(--glass-border)] hover:border-primary/20"
                           )}>
                              <div className="flex items-center gap-6">
                                 <span className="w-6 text-sm font-black text-primary italic">#{idx + 1}</span>
                                 <div>
                                    <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase">{entry.name}</h4>
                                    <p className="text-[9px] font-bold text-primary tracking-widest uppercase">{entry.role}</p>
                                 </div>
                              </div>
                              <div className="flex gap-12 text-right">
                                 <div className="hidden md:block">
                                    <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase">Score</p>
                                    <p className="text-xs font-black text-[var(--text-primary)]">{entry.rankingScore.toFixed(1)}</p>
                                 </div>
                                 <div>
                                    <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase">Credits</p>
                                    <p className="text-xs font-black text-primary">{entry.totalCredits}</p>
                                 </div>
                              </div>
                           </div>
                         ))}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="hist"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                         {history.length ? history.map((tx) => (
                            <div key={tx._id} className="flex items-center justify-between p-5 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)]">
                               <div className="flex items-center gap-6">
                                  <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    tx.credits > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                  )}>
                                     {tx.credits > 0 ? <Zap className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                  </div>
                                  <div>
                                     <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase">{tx.description}</h4>
                                     <p className="text-[8px] font-bold text-[var(--text-secondary)] tracking-widest uppercase mt-1">
                                       {tx.creditType} • {new Date(tx.createdAt).toLocaleString()}
                                     </p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className={cn(
                                    "text-sm font-black italic",
                                    tx.credits > 0 ? "text-green-500" : "text-red-500"
                                  )}>
                                    {tx.credits > 0 ? '+' : ''}{tx.credits}
                                  </p>
                               </div>
                            </div>
                          )) : (
                            <p className="text-center py-10 text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-[0.2em]">Transmission log empty.</p>
                          )}
                      </motion.div>
                    )}
                 </AnimatePresence>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, subValue, color }: any) => (
  <div className="liquid-glass p-8 rounded-[3rem] border-[var(--glass-border)] space-y-4 group hover:border-primary/20 transition-all">
     <div className={cn(
       "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
       color === 'primary' ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(255,59,48,0.2)]" :
       color === 'cyan' ? "bg-cyan-500/10 text-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]" :
       color === 'purple' ? "bg-purple-500/10 text-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]" :
       "bg-orange-500/10 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
     )}>
        <Icon className="w-6 h-6" />
     </div>
     <div>
        <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">{label}</p>
        <p className="text-3xl font-black text-[var(--text-primary)] italic mt-1">{value}</p>
        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-2 opacity-60 flex items-center gap-2">
           <Clock className="w-3 h-3" /> {subValue}
        </p>
     </div>
  </div>
);

export default PerformanceDashboard;
