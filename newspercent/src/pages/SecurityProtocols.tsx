import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Fingerprint, 
  ShieldOff,
  Users,
  UserCheck,
  Clock,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { securityService } from '../services/securityService';
import type { SecurityStats } from '../services/securityService';

const SecurityProtocols: React.FC = () => {
  const [stats, setStats] = useState<SecurityStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await securityService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8 font-manrope">
      <header className={cn(
        "flex flex-col md:flex-row justify-between items-start md:items-center p-8 rounded-[2rem] gap-4 border",
        "bg-cyan-500/5 border-cyan-500/20",
        "light:bg-gradient-to-br light:from-[#FFF7F3] light:to-white light:border-[#E8E2D8]"
      )}>
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-[var(--text-primary)] uppercase">Security Dashboard</h1>
          <p className="text-cyan-500 font-bold text-[9px] tracking-[0.3em] uppercase mt-1">Real-time System Access Status</p>
        </div>
        <div className="flex flex-wrap gap-4">
           <div className="bg-cyan-500/20 px-6 py-2 rounded-full border border-cyan-500/30 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
              <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">SYSTEM MONITOR ACTIVE</span>
           </div>
           {stats?.latestLogin && (
             <div className="bg-[var(--surface-hover)] px-6 py-2 rounded-full border border-[var(--glass-border)] flex items-center gap-3">
                <Clock className="w-3 h-3 text-cyan-500" />
                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                  Latest Login: {formatTime(stats.latestLogin.loginTime)}
                </span>
             </div>
           )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="liquid-glass p-8 rounded-[2.5rem] border-red-500/20 bg-red-500/5 light:bg-white light:border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-6">
               <ShieldOff className="w-8 h-8 text-red-500" />
               <span className="text-[9px] font-black text-red-500 uppercase">Alerts Today</span>
            </div>
            <p className="text-4xl font-black text-[var(--text-primary)] tabular-nums mb-1">
              {stats?.failedLoginsToday || 0}
            </p>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Failed Access Attempts</p>
         </div>
         
         <div className="liquid-glass p-8 rounded-[2.5rem] border-cyan-500/20 light:bg-white light:border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-6">
               <Fingerprint className="w-8 h-8 text-cyan-500" />
               <span className="text-[9px] font-black text-cyan-500 uppercase">Live Ops</span>
            </div>
            <p className="text-4xl font-black text-[var(--text-primary)] tabular-nums mb-1">
              {stats?.activeSessions || 0}
            </p>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Active Intelligence Sessions</p>
         </div>

         <div className="liquid-glass p-8 rounded-[2.5rem] border-cyan-500/20 light:bg-white light:border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-6">
               <UserCheck className="w-8 h-8 text-cyan-500" />
               <span className="text-[9px] font-black text-cyan-500 uppercase">Clearance</span>
            </div>
            <p className="text-4xl font-black text-[var(--text-primary)] tabular-nums mb-1">
              {stats?.totalAdmins || 0}
            </p>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Verified Administrators</p>
         </div>

         <div className="liquid-glass p-8 rounded-[2.5rem] border-cyan-500/20 light:bg-white light:border-[#E8E2D8]">
            <div className="flex items-center justify-between mb-6">
               <Users className="w-8 h-8 text-cyan-500" />
               <span className="text-[9px] font-black text-cyan-500 uppercase">Total Personnel</span>
            </div>
            <p className="text-4xl font-black text-[var(--text-primary)] tabular-nums mb-1">
              {stats?.totalUsers || 0}
            </p>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Registered Entities</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="liquid-glass p-10 rounded-[3rem] border-cyan-500/10">
            <h4 className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-8 flex items-center gap-2">
               <Shield className="w-4 h-4" /> Security Protocol Status
            </h4>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-[var(--surface-hover)] rounded-2xl border border-cyan-500/10">
                  <div className="flex items-center gap-4">
                     <Globe className="w-5 h-5 text-cyan-500" />
                     <div>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Global Access Control</p>
                        <p className="text-[8px] text-[var(--text-secondary)] uppercase mt-0.5">Multi-region IP filtering</p>
                     </div>
                  </div>
                  <span className="text-[10px] font-black text-green-500 uppercase">ACTIVE</span>
               </div>
               <div className="flex items-center justify-between p-6 bg-[var(--surface-hover)] rounded-2xl border border-cyan-500/10">
                  <div className="flex items-center gap-4">
                     <Fingerprint className="w-5 h-5 text-cyan-500" />
                     <div>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Biometric Hash Sync</p>
                        <p className="text-[8px] text-[var(--text-secondary)] uppercase mt-0.5">Encrypted identity verification</p>
                     </div>
                  </div>
                  <span className="text-[10px] font-black text-cyan-500 uppercase">SYNCHRONIZED</span>
               </div>
            </div>
         </div>
         <div className="liquid-glass p-10 rounded-[3rem] border-cyan-500/10">
            <h4 className="text-xs font-black uppercase tracking-widest text-cyan-500 mb-8 flex items-center gap-2">
               <AlertTriangle className="w-4 h-4 text-amber-500" /> Incident Mitigation
            </h4>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-[var(--surface-hover)] rounded-2xl border border-cyan-500/10">
                  <div>
                     <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Session Expiry Force</p>
                     <p className="text-[8px] text-[var(--text-secondary)] uppercase mt-0.5">Auto-terminate inactive nodes</p>
                  </div>
                  <span className="text-[10px] font-black text-cyan-500 uppercase">ENABLED</span>
               </div>
               <div className="flex items-center justify-between p-6 bg-red-500/5 rounded-2xl border border-red-500/20">
                  <div>
                     <p className="text-[10px] font-bold text-red-500 uppercase">Anomaly Detection</p>
                     <p className="text-[8px] text-red-500/60 uppercase mt-0.5">Pattern matching for brute force</p>
                  </div>
                  <span className="text-[10px] font-black text-red-500 uppercase animate-pulse">MONITORING</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SecurityProtocols;
