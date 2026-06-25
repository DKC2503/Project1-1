import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Terminal, 
  AlertTriangle, 
  Fingerprint, 
  Monitor,
  ShieldOff,
  Users,
  UserCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { securityService } from '../services/securityService';
import type { SecurityStats, LoginResponse } from '../services/securityService';

const SecurityProtocols: React.FC = () => {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [logsData, setLogsData] = useState<LoginResponse | null>(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [filter, page]);

  const fetchStats = async () => {
    try {
      const data = await securityService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await securityService.getLogins(filter, page);
      setLogsData(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-8 font-manrope">
      <header className={cn(
        "flex flex-col md:flex-row justify-between items-start md:items-center p-8 rounded-[2rem] gap-4 border",
        "bg-cyan-500/5 border-cyan-500/20",
        "light:bg-gradient-to-br light:from-[#FFF7F3] light:to-white light:border-[#E8E2D8]"
      )}>
        <div>
          <h1 className="text-3xl font-normal tracking-tight text-[var(--text-primary)] uppercase">Security Logs</h1>
          <p className="text-cyan-500 font-bold text-[9px] tracking-[0.3em] uppercase mt-1">Real-time System Access Logs</p>
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

      <div className="liquid-glass rounded-[3rem] overflow-hidden border-[var(--glass-border)] light:shadow-sm">
         <div className="p-8 border-b border-[var(--glass-border)] flex flex-col md:flex-row items-center justify-between gap-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--text-primary)] flex items-center gap-3">
               <Terminal className="w-4 h-4 text-cyan-500" /> Access Protocol Logs
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {['all', 'admins', 'authors', 'failed'].map((f) => (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setPage(1); }}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all",
                    filter === f 
                      ? "bg-cyan-500 text-black" 
                      : "bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-cyan-500"
                  )}
                >
                  {f === 'all' ? 'All Users' : f}
                </button>
              ))}
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
               <thead>
                  <tr className="bg-[var(--surface-hover)]">
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Subject</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Clearance</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">IP Signature</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Terminal Context</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Browser</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Timestamp</th>
                     <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[var(--glass-border)] font-mono">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <Activity className="w-8 h-8 text-cyan-500 animate-spin" />
                          <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em]">Decrypting Logs...</span>
                        </div>
                      </td>
                    </tr>
                  ) : !logsData || !Array.isArray(logsData.logs) || logsData.logs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-20 text-center">
                        <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.3em]">No Access Records Found</span>
                      </td>
                    </tr>
                  ) : (
                    logsData.logs.map((log) => (
                      <tr key={log._id} className={cn("hover:bg-cyan-500/5 transition-colors group", log.status === 'failed' && "bg-red-500/5 hover:bg-red-500/10")}>
                         <td className="p-6">
                            <div className="flex flex-col">
                               <div className="flex items-center gap-3">
                                  <div className={cn("w-2 h-2 rounded-full", log.status === 'failed' ? "bg-red-500" : "bg-cyan-500")} />
                                  <span className="text-xs font-bold text-[var(--text-primary)]">{log.name || 'Anonymous'}</span>
                               </div>
                               <span className="text-[9px] text-[var(--text-secondary)] mt-1 ml-5">{log.email}</span>
                            </div>
                         </td>
                         <td className="p-6">
                            <span className={cn(
                              "text-[9px] font-black px-2 py-0.5 rounded-full uppercase", 
                              log.role === 'admin' || log.role === 'super_admin' ? 'bg-red-500/10 text-red-500' : 
                              log.role === 'author' ? 'bg-cyan-500/10 text-cyan-500' : 
                              'bg-[var(--surface-hover)] text-[var(--text-primary)]'
                            )}>
                               {log.role}
                            </span>
                         </td>
                         <td className="p-6 text-[10px] text-[var(--text-secondary)]">{log.ipAddress}</td>
                         <td className="p-6">
                            <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] uppercase">
                               <Monitor className="w-3 h-3" /> {log.operatingSystem} ({log.deviceType})
                            </div>
                         </td>
                         <td className="p-6 text-[10px] text-[var(--text-secondary)] uppercase">{log.browser}</td>
                         <td className="p-6">
                            <div className="flex flex-col">
                               <span className="text-[10px] text-[var(--text-primary)]">{formatTime(log.loginTime)}</span>
                               <span className="text-[8px] text-[var(--text-secondary)]">{formatDate(log.loginTime)}</span>
                            </div>
                         </td>
                         <td className="p-6 text-right">
                            <span className={cn("text-[9px] font-black uppercase px-3 py-1 rounded-full", log.status === 'failed' ? "bg-red-500 text-white" : "bg-green-500/10 text-green-500")}>
                               {log.status === 'failed' ? "ANOMALY" : "VERIFIED"}
                            </span>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>

         {logsData && logsData.pagination.pages > 1 && (
           <div className="p-6 border-t border-[var(--glass-border)] flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                Showing {((logsData.pagination.page - 1) * logsData.pagination.limit) + 1} - {Math.min(logsData.pagination.page * logsData.pagination.limit, logsData.pagination.total)} of {logsData.pagination.total} entries
              </span>
              <div className="flex gap-2">
                 <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 bg-[var(--surface-hover)] rounded-lg disabled:opacity-30 hover:text-cyan-500 transition-colors"
                 >
                    <ChevronLeft className="w-4 h-4" />
                 </button>
                 <div className="flex items-center px-4 text-[10px] font-black text-cyan-500">
                    PAGE {page} / {logsData.pagination.pages}
                 </div>
                 <button 
                  disabled={page === logsData.pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 bg-[var(--surface-hover)] rounded-lg disabled:opacity-30 hover:text-cyan-500 transition-colors"
                 >
                    <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
         )}
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
