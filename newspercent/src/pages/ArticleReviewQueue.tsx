import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileSearch,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';
import { cn, getCategoryBadgeClass } from '../lib/utils';
import { useDialogStore } from '../hooks/useDialogStore';

import { creditService } from '../services/performanceService';
import { useToastStore } from '../hooks/useToastStore';
import { useSystemSettingsStore } from '../hooks/useSystemSettingsStore';

const ArticleReviewQueue: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dialog = useDialogStore();
  const { addToast } = useToastStore();
  const { settings } = useSystemSettingsStore();

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/admin/pending');
      setArticles(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Intelligence queue synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: string, status: string, message?: string) => {
    try {
      await api.patch(`/api/admin/articles/${id}`, {
        status,
        revisionMessage: message || null
      });
      fetchPending();
    } catch (err: any) {
      dialog.alert(err.response?.data?.error || 'Transmission failed. Authorization server rejected the request.');
    }
  };

  const handleExport = async (art: any) => {
     await creditService.exportArticle(art._id, art.title);
     addToast('success', 'EXPORT SYNCED', 'DOCX GENERATED SUCCESSFULLY');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 italic">Syncing Editorial Data-Stream...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 bg-red-500/5 border border-red-500/10 rounded-[3rem] p-12">
        <AlertCircle className="w-16 h-16 text-red-500 animate-pulse" />
        <div className="text-center">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">System Error</h2>
          <p className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex justify-between items-end bg-orange-500/5 border border-orange-500/10 p-10 rounded-[3rem] relative overflow-hidden group">
        <div className="relative z-10">
          <h1 className="text-4xl font-normal tracking-tight text-white uppercase font-lemon">Editorial Queue</h1>
          <p className="text-orange-500 font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2 italic">
            <FileSearch className="w-3 h-3" /> Integrity Verification & Information Control
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-end">
          <span className="text-[var(--text-secondary)] text-[8px] font-bold uppercase tracking-[0.2em] opacity-40">Verification Backlog</span>
          <span className="text-white text-xs font-black mt-1">{articles.length} PENDING NODES</span>
        </div>
      </header>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 liquid-glass rounded-[3rem] border-white/5 opacity-50">
           <ShieldCheck className="w-20 h-20 text-success mb-8 animate-pulse" />
           <p className="text-xl font-black text-white uppercase tracking-tight">Intelligence Integrity Secured</p>
           <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-2">All transmissions have been verified & processed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          <AnimatePresence mode="popLayout">
            {articles.map((article, i) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="liquid-glass p-10 rounded-[3rem] border-white/5 hover:border-orange-500/20 transition-all group relative overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                   <div className="w-full lg:w-72 aspect-video rounded-[2rem] overflow-hidden border border-white/5 relative flex-shrink-0 shadow-2xl">
                      <img src={article.featuredImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                   </div>

                   <div className="flex-1 space-y-6">
                       <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-300",
                            getCategoryBadgeClass(article.category)
                          )}>
                            {article.category}
                          </span>
                         <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest flex items-center gap-2">
                           <Clock className="w-3.5 h-3.5" /> Received {new Date(article.updatedAt).toLocaleTimeString()}
                         </span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-white leading-tight font-manrope">{article.title}</h3>
                      
                      <div className="flex items-center gap-6 py-4 border-y border-white/5">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[11px] font-black text-primary">
                               {article.authorName.charAt(0)}
                            </div>
                            <span className="text-xs font-bold text-white uppercase tracking-tight">{article.authorName}</span>
                         </div>
                         <div className="w-px h-4 bg-white/10" />
                         <button 
                          onClick={() => navigate(`/article/${article._id}`)}
                          className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase hover:text-blue-400 transition-colors"
                         >
                            <ExternalLink className="w-3.5 h-3.5" /> Decrypt Content
                         </button>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-4">
                         {settings?.documentExportEnabled && (
                           <button 
                            onClick={() => handleExport(article)}
                            className="px-6 py-4 bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                           >
                              <FileSearch className="w-4 h-4" /> Export DOCX
                           </button>
                         )}
                         <button 
                          onClick={() => handleAction(article._id, 'PUBLISHED')}
                          className="flex-1 lg:flex-none px-10 py-4 bg-success hover:bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-success/20 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                         >
                            <CheckCircle2 className="w-4 h-4" /> Authorize Feed
                         </button>
                         <button 
                          onClick={async () => {
                            const res = await dialog.revision();
                            if (res) handleAction(article._id, 'REVISION_REQUESTED', `[${res.priority}] ${res.notes}`);
                          }}
                          className="flex-1 lg:flex-none px-10 py-4 bg-orange-600/10 border border-orange-600/20 hover:bg-orange-600 hover:text-white rounded-2xl text-orange-500 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                         >
                            <MessageSquare className="w-4 h-4" /> Issue Revisions
                         </button>
                         <button 
                          onClick={() => handleAction(article._id, 'REJECTED')}
                          className="flex-1 lg:flex-none px-10 py-4 bg-red-600/10 border border-red-600/20 hover:bg-red-600 hover:text-white rounded-2xl text-red-500 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                         >
                            <XCircle className="w-4 h-4" /> Terminate Link
                         </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ArticleReviewQueue;
