import React, { useEffect, useState } from 'react';
import { 
  XCircle, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileSearch,
  Loader2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import { useNavigate } from 'react-router-dom';
import { cn, getCategoryBadgeClass } from '../lib/utils';
import { useDialogStore } from '../hooks/useDialogStore';
import { useAuthStore } from '../hooks/useAuthStore';

import { creditService } from '../services/performanceService';
import { useToastStore } from '../hooks/useToastStore';
import { useSystemSettingsStore } from '../hooks/useSystemSettingsStore';

const ArticleReviewQueue: React.FC = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dialog = useDialogStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const { settings } = useSystemSettingsStore();

  const [creditConfig, setCreditConfig] = useState<any>({
    maxContentCredits: 40,
    maxResearchCredits: 30,
    maxSeoCredits: 10,
    maxHeadlineCredits: 10,
    maxImageCredits: 10,
    maxPublishingCredits: 10,
    defaultPublishingCredits: 5,
    maxTotalCredits: 120
  });

  // Track active review card ID
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  // Track currently edited breakdown values
  const [breakdown, setBreakdown] = useState<any>({
    contentQuality: 0,
    originality: 0,
    researchQuality: 0,
    seo: 0,
    images: 0,
    headline: 0,
    publishingBonus: 0
  });

  const fetchPending = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resPending, resCredits] = await Promise.all([
        api.get('/api/admin/pending'),
        api.get('/api/admin/settings/credits').catch(() => ({ data: { data: null } }))
      ]);
      setArticles(resPending.data);
      if (resCredits.data?.data) {
        setCreditConfig(resCredits.data.data);
      }
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
      addToast('success', 'STATUS UPDATED', 'Article status updated successfully');
      fetchPending();
    } catch (err: any) {
      dialog.alert(err.response?.data?.error || 'Transmission failed. Authorization server rejected the request.');
    }
  };

  const handleApproveWithCredits = async (id: string) => {
    try {
      const total = Object.values(breakdown).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number;
      if (total > creditConfig.maxTotalCredits) {
        addToast('error', 'CREDIT LIMIT EXCEEDED', `Total awarded credits cannot exceed maximum allowance of ${creditConfig.maxTotalCredits}`);
        return;
      }

      await api.patch(`/api/admin/articles/${id}`, {
        status: 'PUBLISHED',
        awardedSeoCredits: breakdown.seo,
        creditBreakdown: breakdown,
        totalCredits: total,
        approvedBy: user?.name || 'Admin',
        approvedAt: new Date()
      });
      addToast('success', 'ARTICLE PUBLISHED', `Authorized feed with +${total} credits`);
      setActiveReviewId(null);
      fetchPending();
    } catch (err: any) {
      dialog.alert(err.response?.data?.error || 'Approval failed.');
    }
  };

  const handleExport = async (art: any) => {
     await creditService.exportArticle(art._id, art.title);
     addToast('success', 'EXPORT SYNCED', 'DOCX GENERATED SUCCESSFULLY');
  };

  const toggleReviewPanel = (article: any) => {
    if (activeReviewId === article._id) {
      setActiveReviewId(null);
    } else {
      setActiveReviewId(article._id);
      
      const initial = article.creditBreakdown && article.creditBreakdown.contentQuality > 0 
        ? {
            contentQuality: article.creditBreakdown.contentQuality,
            originality: article.creditBreakdown.originality || 0,
            researchQuality: article.creditBreakdown.researchQuality || 0,
            seo: article.awardedSeoCredits !== undefined ? article.awardedSeoCredits : 0,
            images: article.creditBreakdown.images || 0,
            publishingBonus: article.creditBreakdown.publishingBonus !== undefined ? article.creditBreakdown.publishingBonus : (creditConfig.defaultPublishingCredits || 5),
            headline: article.creditBreakdown.headline || 0
          }
        : {
            contentQuality: Math.round(creditConfig.maxContentCredits * 0.75) || 30,
            originality: Math.round(creditConfig.maxResearchCredits * 0.5) || 15,
            researchQuality: Math.round(creditConfig.maxResearchCredits * 0.67) || 20,
            seo: article.awardedSeoCredits || 0,
            images: Math.round(creditConfig.maxImageCredits * 0.8) || 8,
            publishingBonus: creditConfig.defaultPublishingCredits || 5,
            headline: Math.round(creditConfig.maxHeadlineCredits * 0.6) || 6
          };
      setBreakdown(initial);
    }
  };

  const handleBreakdownChange = (key: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, val));
    setBreakdown((prev: any) => ({ ...prev, [key]: clamped }));
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
            {articles.map((article, i) => {
              const isReviewing = activeReviewId === article._id;
              const totalSum = isReviewing 
                ? Object.values(breakdown).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number 
                : article.totalCredits || 0;

              return (
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

                        {/* Control Actions */}
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
                            onClick={() => toggleReviewPanel(article)}
                            className={cn(
                              "px-6 py-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                              isReviewing
                                ? "bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/20"
                                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                            )}
                           >
                              <Sliders className="w-4 h-4" />
                              {isReviewing ? 'Close Credit Panel' : 'Review & Award Credits'}
                              {isReviewing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                           </button>

                           <button 
                            onClick={async () => {
                              const res = await dialog.revision();
                              if (res) handleAction(article._id, 'REVISION_REQUESTED', `[${res.priority}] ${res.notes}`);
                            }}
                            className="px-6 py-4 bg-orange-600/10 border border-orange-600/20 hover:bg-orange-600 hover:text-white rounded-2xl text-orange-500 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                           >
                              <MessageSquare className="w-4 h-4" /> Issue Revisions
                           </button>

                           <button 
                            onClick={() => handleAction(article._id, 'REJECTED')}
                            className="px-6 py-4 bg-red-600/10 border border-red-600/20 hover:bg-red-600 hover:text-white rounded-2xl text-red-500 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                           >
                              <XCircle className="w-4 h-4" /> Terminate Link
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Expandable Editorial Review and Credit Breakdown Panel */}
                  <AnimatePresence>
                    {isReviewing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                          
                          {/* SEO Title & Focus Keyword Review */}
                          <div className="bg-white/2 border border-white/5 p-6 rounded-[2rem] space-y-6">
                            <div>
                              <h4 className="text-sm font-black text-white uppercase tracking-wider">Search Engine Optimization</h4>
                              <p className="text-[8px] text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">Author provided search metadata</p>
                            </div>

                            <div className="space-y-4 border-t border-white/5 pt-4">
                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">SEO Title</span>
                                <div className="bg-white/2 border border-white/5 rounded-xl p-4 text-xs text-white font-bold break-words">
                                  {article.seoTitle || article.title || <span className="italic opacity-40">None (Defaults to Article Title)</span>}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Focus Keyword</span>
                                <div className="bg-white/2 border border-white/5 rounded-xl p-4 text-xs text-white font-bold">
                                  {article.focusKeyword || <span className="italic opacity-40">Not provided</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Dynamic Credit Award Breakdown */}
                          <div className="bg-white/2 border border-white/5 p-6 rounded-[2rem] space-y-6">
                            <div>
                              <h4 className="text-sm font-black text-white uppercase tracking-wider">Editorial Merit Breakdown</h4>
                              <p className="text-[8px] text-[var(--text-secondary)] uppercase tracking-widest mt-0.5">Distribute nodal credits across quality criteria</p>
                            </div>

                            <div className="space-y-4">
                              {/* Content Quality */}
                              <div className="flex justify-between items-center gap-4 bg-white/2 border border-white/5 p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Content Quality</span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    value={breakdown.contentQuality}
                                    onChange={(e) => handleBreakdownChange('contentQuality', parseInt(e.target.value) || 0, creditConfig.maxContentCredits)}
                                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-1.5 text-center text-xs font-black text-primary"
                                  />
                                  <span className="text-[9px] text-[var(--text-secondary)] font-mono">/ {creditConfig.maxContentCredits} Max</span>
                                </div>
                              </div>

                              {/* Originality */}
                              <div className="flex justify-between items-center gap-4 bg-white/2 border border-white/5 p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Originality</span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    value={breakdown.originality}
                                    onChange={(e) => handleBreakdownChange('originality', parseInt(e.target.value) || 0, creditConfig.maxResearchCredits)}
                                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-1.5 text-center text-xs font-black text-primary"
                                  />
                                  <span className="text-[9px] text-[var(--text-secondary)] font-mono">/ {creditConfig.maxResearchCredits} Max</span>
                                </div>
                              </div>

                              {/* Research Quality */}
                              <div className="flex justify-between items-center gap-4 bg-white/2 border border-white/5 p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Research Quality</span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    value={breakdown.researchQuality}
                                    onChange={(e) => handleBreakdownChange('researchQuality', parseInt(e.target.value) || 0, creditConfig.maxResearchCredits)}
                                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-1.5 text-center text-xs font-black text-primary"
                                  />
                                  <span className="text-[9px] text-[var(--text-secondary)] font-mono">/ {creditConfig.maxResearchCredits} Max</span>
                                </div>
                              </div>

                              {/* SEO Credits */}
                              <div className="flex justify-between items-center gap-4 bg-white/2 border border-white/5 p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">SEO Optimization</span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    value={breakdown.seo}
                                    onChange={(e) => handleBreakdownChange('seo', parseInt(e.target.value) || 0, creditConfig.maxSeoCredits)}
                                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-1.5 text-center text-xs font-black text-primary"
                                  />
                                  <span className="text-[9px] text-[var(--text-secondary)] font-mono">/ {creditConfig.maxSeoCredits} Max</span>
                                </div>
                              </div>

                              {/* Images */}
                              <div className="flex justify-between items-center gap-4 bg-white/2 border border-white/5 p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Images & Assets</span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    value={breakdown.images}
                                    onChange={(e) => handleBreakdownChange('images', parseInt(e.target.value) || 0, creditConfig.maxImageCredits)}
                                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-1.5 text-center text-xs font-black text-primary"
                                  />
                                  <span className="text-[9px] text-[var(--text-secondary)] font-mono">/ {creditConfig.maxImageCredits} Max</span>
                                </div>
                              </div>

                              {/* Headline */}
                              <div className="flex justify-between items-center gap-4 bg-white/2 border border-white/5 p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Headline Quality</span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    value={breakdown.headline}
                                    onChange={(e) => handleBreakdownChange('headline', parseInt(e.target.value) || 0, creditConfig.maxHeadlineCredits)}
                                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-1.5 text-center text-xs font-black text-primary"
                                  />
                                  <span className="text-[9px] text-[var(--text-secondary)] font-mono">/ {creditConfig.maxHeadlineCredits} Max</span>
                                </div>
                              </div>

                              {/* Publishing Bonus */}
                              <div className="flex justify-between items-center gap-4 bg-white/2 border border-white/5 p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Publishing Bonus</span>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    value={breakdown.publishingBonus}
                                    onChange={(e) => handleBreakdownChange('publishingBonus', parseInt(e.target.value) || 0, creditConfig.maxPublishingCredits)}
                                    className="w-16 bg-white/5 border border-white/10 rounded-lg p-1.5 text-center text-xs font-black text-primary"
                                  />
                                  <span className="text-[9px] text-[var(--text-secondary)] font-mono">/ {creditConfig.maxPublishingCredits} Max</span>
                                </div>
                              </div>
                            </div>

                            {/* Total Merit Summary and Approval Action */}
                            <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="text-left">
                                <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-[0.2em] font-bold">Total Merit Reward</div>
                                <div className={cn(
                                  "text-3xl font-extrabold uppercase font-mono tracking-tighter mt-1",
                                  totalSum > creditConfig.maxTotalCredits ? "text-red-500" : "text-white"
                                )}>
                                  {totalSum} Credits
                                </div>
                                <div className="text-[8px] text-[var(--text-secondary)] uppercase tracking-wider mt-0.5">
                                  Max Allowance: {creditConfig.maxTotalCredits}
                                </div>
                              </div>

                              <button 
                                onClick={() => handleApproveWithCredits(article._id)}
                                className="w-full sm:w-auto px-8 py-4 bg-success hover:bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-success/20 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 cursor-pointer"
                              >
                                <Award className="w-4 h-4" /> Authorize Feed
                              </button>
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default ArticleReviewQueue;
