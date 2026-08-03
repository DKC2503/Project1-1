import React, { useEffect, useState } from 'react';
import { 
  Users, 
  RefreshCw,
  Search,
  Shield,
  Loader2,
  Award,
  TrendingUp,
  FileText,
  Eye
} from 'lucide-react';
import api from '../config/api';
import { useToastStore } from '../hooks/useToastStore';
import { cn } from '../lib/utils';

const AdminPerformance: React.FC = () => {
  const [stats, setStats] = useState<any>({ totalCredits: 0, activeContributors: 0, topPerformer: 'N/A' });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToastStore();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes] = await Promise.all([
        api.get('/api/admin/users'),
      ]);

      // Sort users by totalCredits for ranking
      const sortedUsers = [...(uRes.data ?? [])].sort((a, b) => (b.totalCredits || 0) - (a.totalCredits || 0));
      setUsers(sortedUsers);

      // Calculate simple stats from user list
      const totalCredits = sortedUsers.reduce((acc: number, u: any) => acc + (u.totalCredits || 0), 0);
      const topPerformer = sortedUsers[0];

      setStats({
        totalCredits,
        activeContributors: sortedUsers.filter((u: any) => (u.totalCredits || 0) > 0).length,
        topPerformer: topPerformer?.name || 'N/A'
      });
    } catch (err) {
      addToast('error', 'UPLINK FAILED', 'COULD NOT FETCH PERFORMANCE DATA');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Loading Performance Metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 font-manrope">
      {/* Header */}
      <header className={cn(
        "flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-10 rounded-[3rem] relative overflow-hidden group border",
        "bg-purple-500/5 border-purple-500/10",
        "light:bg-gradient-to-br light:from-[#F3E8FF] light:to-white light:border-[#E8D8F8]"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.05),transparent_70%)] light:hidden" />
        <div className="relative z-10">
          <h1 className="text-4xl font-normal tracking-tight text-[var(--text-primary)] uppercase font-lemon">Organization Merit</h1>
          <p className="text-purple-500 font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2 italic">
            <Shield className="w-3 h-3" /> Performance Dashboard and Oversight
          </p>
        </div>
        <button 
          onClick={fetchData}
          className="p-4 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl text-[var(--text-primary)] hover:bg-purple-500/10 hover:border-purple-500/20 transition-all relative z-10"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="liquid-glass p-8 rounded-[3rem] border-[var(--glass-border)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl">
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Total Merit Issued</p>
            </div>
            <p className="text-4xl font-black text-[var(--text-primary)] italic">{stats.totalCredits?.toLocaleString()}</p>
         </div>
         <div className="liquid-glass p-8 rounded-[3rem] border-[var(--glass-border)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Active Personnel</p>
            </div>
            <p className="text-4xl font-black text-primary italic">{stats.activeContributors}</p>
         </div>
         <div className="liquid-glass p-8 rounded-[3rem] border-[var(--glass-border)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-500/10 rounded-2xl">
                <Shield className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">Lead Contributor</p>
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)] uppercase truncate mt-2">{stats.topPerformer}</p>
         </div>
      </div>

      {/* Personnel Table */}
      <div className="liquid-glass rounded-[3rem] border-[var(--glass-border)] overflow-hidden">
        <div className="p-8 border-b border-[var(--glass-border)] flex flex-col md:flex-row justify-between items-center gap-6">
           <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <Users className="w-4 h-4" /> Contributor Roster
           </h3>
           <div className="relative w-full md:w-80">
              <input 
                type="text" 
                placeholder="Search Identity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-xl py-3 px-10 text-xs focus:outline-none focus:border-primary transition-all text-[var(--text-primary)] font-bold placeholder:text-[var(--text-secondary)]/50"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]/40" />
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full min-w-[800px]">
              <thead>
                 <tr className="bg-[var(--surface-hover)] text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-left text-[var(--text-secondary)]">
                    <th className="px-8 py-6">Rank</th>
                    <th className="px-8 py-6">Contributor</th>
                    <th className="px-8 py-6">Total Credits</th>
                    <th className="px-8 py-6">Articles Published</th>
                    <th className="px-8 py-6">Total Views</th>
                    <th className="px-8 py-6">Avg Views/Article</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-[var(--glass-border)]">
                 {filteredUsers.map((u) => {
                   const absoluteRank = users.findIndex(user => user._id === u._id) + 1;
                   return (
                     <tr key={u._id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-black ${absoluteRank <= 3 ? 'text-primary' : 'text-[var(--text-secondary)]'}`}>
                                 #{absoluteRank}
                              </span>
                              {absoluteRank === 1 && <Award className="w-3 h-3 text-yellow-500" />}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                             <p className="text-[11px] font-bold text-[var(--text-primary)] uppercase">{u.name}</p>
                             <p className="text-[8px] font-black text-purple-500 tracking-widest uppercase mt-1">{u.role?.replace('_', ' ')}</p>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <p className="text-sm font-black text-[var(--text-primary)] italic">{u.totalCredits || 0}</p>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <FileText className="w-3 h-3 text-orange-500 opacity-60" />
                             <p className="text-[11px] font-bold text-[var(--text-primary)]">{u.articlesPublished || 0}</p>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             <Eye className="w-3 h-3 text-blue-500 opacity-60" />
                             <p className="text-[11px] font-bold text-[var(--text-primary)]">{(u.totalViews || 0).toLocaleString()}</p>
                          </div>
                       </td>
                       <td className="px-8 py-6">
                          <p className="text-[11px] font-bold text-purple-500">
                            {u.articlesPublished > 0 
                              ? Math.round(u.totalViews / u.articlesPublished).toLocaleString() 
                              : 0}
                          </p>
                       </td>
                    </tr>
                   );
                 })}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPerformance;
