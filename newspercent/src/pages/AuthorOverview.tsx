import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Filter, 
  Edit2, 
  Eye, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  FileText,
  Loader2,
  LayoutDashboard,
  RefreshCw,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useDialogStore } from '../hooks/useDialogStore';
import { useIsMobile } from '../hooks/useIsMobile';

const AuthorOverview: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dialog = useDialogStore();
  const isMobile = useIsMobile();

  const fetchMyArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/my-articles');
      setArticles(res.data);

      try {
        const creditsRes = await api.get('/api/credits/me');
        setCredits(creditsRes.data);
      } catch (e) {
        console.log("Credits not available or not active", e);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Intelligence feed synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyArticles();
  }, []);

  const handleSubmitForReview = async (id: string) => {
    try {
      await api.patch(`/api/articles/${id}`, { status: 'PENDING_REVIEW' });
      fetchMyArticles();
    } catch (err: any) {
      dialog.alert(err.response?.data?.error || 'Transmission failed. Authorization server rejected the request.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Syncing Personal Articles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 bg-red-500/5 border border-red-500/10 rounded-[3rem] p-12 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 animate-pulse" />
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">System Error</h2>
        <p className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-widest max-w-md mx-auto leading-relaxed">{error}</p>
        <button 
          onClick={fetchMyArticles}
          className="px-10 py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-500/20 uppercase text-[10px] tracking-widest flex items-center gap-3"
        >
          <RefreshCw className="w-4 h-4" /> Retry Sync
        </button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Articles', value: articles.length, icon: FileText, color: 'text-primary' },
    { label: 'Total Article Views', value: articles.reduce((sum, a) => sum + (a.views || 0), 0), icon: Eye, color: 'text-blue-500' },
    { label: 'Published Articles', value: articles.filter(a => a.status === 'PUBLISHED').length, icon: CheckCircle2, color: 'text-success' },
    { label: 'Pending Review', value: articles.filter(a => a.status === 'PENDING_REVIEW').length, icon: Clock, color: 'text-orange-500' },
  ];

  // ==========================================
  // RENDER DEDICATED MOBILE VERSION
  // ==========================================
  if (isMobile) {
    const pendingCount = articles.filter(a => a.status === 'PENDING_REVIEW').length;
    return (
      <div className="space-y-6 pb-24 font-manrope">
        {/* Header */}
        <header className="p-4 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl">
          <h1 className="text-lg font-black uppercase text-white tracking-wider">Author Center</h1>
          <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">Mobile Command Dashboard</p>
        </header>

        {/* Quick Grid Cards */}
        <div className="grid grid-cols-2 gap-3 px-1">
          {/* Card 1: Create Article */}
          <div 
            onClick={() => navigate('/author/new')}
            className="p-4 rounded-2xl bg-primary text-white flex flex-col justify-between aspect-square shadow-lg shadow-primary/10 active:scale-95 transition-transform"
          >
            <Plus className="w-6 h-6 text-white" />
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/80">Action</h4>
              <p className="text-sm font-black uppercase">Create Article</p>
            </div>
          </div>

          {/* Card 2: My Articles */}
          <div 
            onClick={() => {
              const el = document.getElementById('my-articles-feed');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex flex-col justify-between aspect-square active:scale-95 transition-transform"
          >
            <FileText className="w-6 h-6 text-blue-500" />
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{articles.length} Written</h4>
              <p className="text-sm font-black uppercase text-white">My Articles</p>
            </div>
          </div>

          {/* Card 3: Credits */}
          <div 
            onClick={() => navigate('/author/performance')}
            className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex flex-col justify-between aspect-square active:scale-95 transition-transform"
          >
            <Award className="w-6 h-6 text-success animate-pulse" />
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Merit Score</h4>
              <p className="text-sm font-black uppercase text-white">
                {credits ? `${credits.balance || 0} Credits` : 'Performance'}
              </p>
            </div>
          </div>

          {/* Card 4: Pending Reviews */}
          <div 
            className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex flex-col justify-between aspect-square relative"
          >
            <Clock className="w-6 h-6 text-orange-500" />
            {pendingCount > 0 && (
              <span className="absolute top-4 right-4 px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black rounded-full animate-bounce">
                {pendingCount}
              </span>
            )}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{pendingCount} Queue</h4>
              <p className="text-sm font-black uppercase text-white">Pending Reviews</p>
            </div>
          </div>
        </div>

        {/* Card 5: Profile Info Card */}
        <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--glass-border)] flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-sm uppercase shrink-0">
            {articles[0]?.authorName?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden leading-tight flex-1">
            <h4 className="text-xs font-black uppercase tracking-wide truncate text-white">{articles[0]?.authorName || 'Field Agent'}</h4>
            <span className="text-[8px] font-black uppercase tracking-widest text-primary">Clearance Level • Author</span>
          </div>
        </div>

        {/* Scrollable Feed List */}
        <div id="my-articles-feed" className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-black uppercase tracking-widest text-white">Transmission Feed</h3>
            <span className="text-[8px] text-[var(--text-secondary)] uppercase font-bold">List of articles</span>
          </div>

          <div className="space-y-3">
            {articles.map((article) => (
              <div 
                key={article._id}
                className="p-4 rounded-2xl bg-[var(--surface-hover)]/30 border border-[var(--glass-border)] space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-16 h-10 rounded-lg overflow-hidden shrink-0 border border-white/5 shadow-md">
                    <img src={article.featuredImage} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-wider border",
                      article.status === 'PUBLISHED' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                      article.status === 'PENDING_REVIEW' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                      "bg-white/5 border-white/10 text-white/60"
                    )}>
                      {article.status}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate leading-tight mt-1">{article.title}</h4>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[var(--glass-border)]">
                  <span className="text-[8px] font-bold text-[var(--text-secondary)] opacity-60 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {article.views || 0}
                  </span>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/article/${article._id}`)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:border-primary active:scale-90 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/author/new?id=${article._id}`)}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 text-white hover:border-blue-500 active:scale-90 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {(article.status === 'DRAFT' || article.status === 'REVISION_REQUESTED') && (
                      <button
                        onClick={() => handleSubmitForReview(article._id)}
                        className="px-3.5 py-1.5 bg-primary text-white font-black uppercase text-[8px] tracking-wider rounded-lg shadow-lg shadow-primary/20 active:scale-90 transition-all"
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER ORIGINAL DESKTOP VERSION
  // ==========================================
  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-primary/5 border border-primary/10 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden group">
        <div className="relative z-10">
          <h1 className="text-4xl font-normal tracking-tight text-white uppercase font-lemon">My Dashboard</h1>
          <p className="text-primary font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2 italic">
            <LayoutDashboard className="w-3 h-3" /> Author Performance & Publishing History
          </p>
        </div>
        <button 
          onClick={() => navigate('/author/new')}
          className="relative z-10 w-full sm:w-auto bg-primary hover:bg-red-600 text-white font-black px-10 py-5 rounded-2xl shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="liquid-glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/5 group hover:border-primary/20 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className="text-2xl font-black text-white">{stat.value}</span>
            </div>
            <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
           <h2 className="text-xl font-black text-white uppercase tracking-tight font-manrope">My Articles</h2>
           <div className="flex gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                 <Filter className="w-3 h-3" /> Filter List
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence mode="popLayout">
            {articles.map((article, i) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="liquid-glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border-white/5 hover:border-primary/20 transition-all group"
              >
                <div className="flex flex-col lg:flex-row items-center gap-10">
                   <div className="w-full lg:w-48 aspect-video rounded-2xl overflow-hidden border border-white/5 relative flex-shrink-0 shadow-2xl">
                      <img src={article.featuredImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                   </div>

                   <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-4">
                         <span className={cn(
                           "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                           article.status === 'PUBLISHED' ? "bg-green-500/10 border-green-500/20 text-green-500" : 
                           article.status === 'APPROVED' ? "bg-green-500/10 border-green-500/20 text-green-500" : 
                           article.status === 'PENDING_REVIEW' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                           article.status === 'REJECTED' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                           article.status === 'REVISION_REQUESTED' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                           article.status === 'DRAFT' ? "bg-gray-500/10 border-gray-500/20 text-gray-400" :
                           "bg-white/5 border-white/10 text-[var(--text-secondary)]"
                         )}>
                            {article.status === 'REVISION_REQUESTED' ? 'REVISION REQUIRED' : article.status}
                         </span>
                         <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Updated {new Date(article.updatedAt).toLocaleDateString()}
                         </span>
                      </div>
                      
                      <h3 className="text-xl font-black text-white leading-tight group-hover:text-primary transition-colors">{article.title}</h3>
                      
                      {article.revisionMessage && (
                        <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start gap-3">
                           <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                           <div>
                              <p className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1">Editor Revision Notes:</p>
                              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{article.revisionMessage}</p>
                           </div>
                        </div>
                      )}
                   </div>

                   <div className="flex items-center gap-3 w-full lg:w-auto">
                      <button 
                        onClick={() => navigate(`/article/${article._id}`)}
                        className="flex-1 lg:flex-none p-4 bg-white/5 border border-white/10 hover:border-primary/40 rounded-xl text-white transition-all group/btn"
                      >
                         <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <button 
                        onClick={() => navigate(`/author/new?id=${article._id}`)}
                        className="flex-1 lg:flex-none p-4 bg-white/5 border border-white/10 hover:border-blue-500/40 rounded-xl text-white transition-all group/btn"
                      >
                         <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      {article.status === 'DRAFT' || article.status === 'REVISION_REQUESTED' ? (
                        <button 
                          onClick={() => handleSubmitForReview(article._id)}
                          className="flex-1 lg:flex-none px-8 py-4 bg-primary hover:bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20"
                        >
                           Submit
                        </button>
                      ) : (
                        <div className="px-8 py-4 bg-white/5 border border-white/10 text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest rounded-xl italic">
                           Locked
                        </div>
                      )}
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthorOverview;
