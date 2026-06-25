import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  Clock, 
  Database,
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useDialogStore } from '../hooks/useDialogStore';
import { useToastStore } from '../hooks/useToastStore';
import { useAuthStore } from '../hooks/useAuthStore';
import { useSystemSettingsStore } from '../hooks/useSystemSettingsStore';
import { creditService } from '../services/performanceService';

const CATEGORIES = [
  'National', 'Global', 'Politics', 'Business', 'Sports', 
  'Entertainment', 'Automobile', 'Lifestyle', 'Movies', 
  'Startups', 'Studies', 'Case Studies', 'Technology'
];

const ContentEngine: React.FC = () => {
  interface DiagnosticData {
    connectionStatus: string;
    apiStatus: string;
    dbStatus: string;
    responseCode: string | number;
    timestamp: string;
    errorMessage: string;
    route: string;
  }

  const [articles, setArticles] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<DiagnosticData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const dialog = useDialogStore();
  const { addToast } = useToastStore();
  const { user } = useAuthStore();
  const { settings } = useSystemSettingsStore();

  const isAdmin = ['super_admin', 'admin', 'editor', 'reviewer'].includes(user?.role || '');

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      setDiagnosticError(null);
      // Admins fetch all articles, authors fetch their own
      const endpoint = isAdmin ? '/api/articles' : '/api/my-articles';
      const res = await api.get(endpoint);
      setArticles(res.data);
    } catch (err: any) {
      const isNetworkError = !err.response;
      const status = err.response?.status || 'N/A';
      const routeStr = err.config?.url || (isAdmin ? '/api/articles' : '/api/my-articles');
      const backendMsg = err.response?.data?.error || err.message || 'Unknown network error';
      
      const databaseState = err.response?.data?.databaseState || 
                            (err.response?.data?.isMongoError ? 'DISCONNECTED' : 'Unknown');

      const isMongo = err.response?.data?.isMongoError || 
                      backendMsg.toLowerCase().includes('mongo') || 
                      backendMsg.toLowerCase().includes('mongoose') ||
                      backendMsg.toLowerCase().includes('topology') ||
                      backendMsg.toLowerCase().includes('connection');

      const dbStatusText = databaseState === 'CONNECTED' ? 'Database Connected' : 
                           databaseState === 'DISCONNECTED' || isMongo ? 'Database Offline' : 
                           isNetworkError ? 'Unknown (API Offline)' : 'Database Connected';

      const apiStatusText = isNetworkError ? 'API Unreachable' : 
                            status === 404 ? 'Content Manager API Route Missing (404)' : 
                            status === 403 ? 'Permission Denied / Unauthorized (403)' : 
                            'Content Manager API Failed';

      setDiagnosticError({
        connectionStatus: isNetworkError ? 'Disconnected' : 'Connected',
        apiStatus: apiStatusText,
        dbStatus: dbStatusText,
        responseCode: status,
        timestamp: err.response?.data?.timestamp || new Date().toLocaleString(),
        errorMessage: backendMsg,
        route: routeStr
      });
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [user]);

  const handlePublish = async (id: string) => {
    try {
      setActionLoading(id);
      await api.patch(`/api/admin/articles/${id}`, { status: 'PUBLISHED' });
      addToast('success', 'TRANSMISSION LIVE', 'ARTICLE FEED ACTIVE');
      fetchArticles();
    } catch (err: any) {
      dialog.alert(err.response?.data?.error || 'Transmission failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkExport = async () => {
     if (settings && !settings.documentExportEnabled) {
        addToast('error', 'DENIED', 'Document export is disabled.');
        return;
     }
     const selected = articles.filter(a => selectedIds.includes(a._id));
     for (const art of selected) {
        await creditService.exportArticle(art._id, art.title);
     }
     addToast('success', 'EXPORT COMPLETE', `${selected.length} RECORDS PROCESSED`);
  };

  const handleSingleExport = async (art: any) => {
     if (settings && !settings.documentExportEnabled) {
        addToast('error', 'DENIED', 'Document export is disabled.');
        return;
     }
     await creditService.exportArticle(art._id, art.title);
     addToast('success', 'EXPORT SYNCED', 'DOCX GENERATED SUCCESSFULLY');
  };

  const toggleSelect = (id: string) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteArticle = async (id: string) => {
    const confirmed = await dialog.confirm('Are you sure you want to permanently scuttle this intelligence record?', 'Scuttle Protocol');
    if (!confirmed) return;
    try {
      setActionLoading(id);
      await api.delete(`/api/admin/articles/${id}`);
      addToast('success', 'DELETED', 'ARTICLE PERMANENTLY REMOVED');
      fetchArticles();
    } catch (err: any) {
      addToast('error', 'DELETE FAILED', err.response?.data?.error || 'Failed to delete article');
    } finally {
      setActionLoading(null);
    }
  };

  // Main Breaking handlers
  const handleSetMainBreaking = async (id: string) => {
    try {
      setActionLoading(id);
      await api.put(`/api/admin/breaking/main/${id}`);
      addToast('success', 'STATUS UPDATED', 'SET AS MAIN BREAKING NEWS');
      fetchArticles();
    } catch (err: any) {
      addToast('error', 'ACTION FAILED', err.response?.data?.error || 'Failed to set main breaking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMainBreaking = async (id: string) => {
    try {
      setActionLoading(id);
      await api.delete('/api/admin/breaking/main');
      addToast('success', 'STATUS UPDATED', 'REMOVED MAIN BREAKING BANNER');
      fetchArticles();
    } catch (err: any) {
      addToast('error', 'ACTION FAILED', err.response?.data?.error || 'Failed to remove main breaking');
    } finally {
      setActionLoading(null);
    }
  };

  // Category Breaking handlers
  const handleSetCategoryBreaking = async (id: string, category: string) => {
    try {
      setActionLoading(id);
      await api.put(`/api/admin/breaking/category/${id}`, { category });
      addToast('success', 'STATUS UPDATED', `SET AS BREAKING NEWS IN ${category.toUpperCase()}`);
      fetchArticles();
    } catch (err: any) {
      addToast('error', 'ACTION FAILED', err.response?.data?.error || 'Failed to set category breaking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveCategoryBreaking = async (id: string, category: string) => {
    try {
      setActionLoading(id);
      await api.delete(`/api/admin/breaking/category/${category}`);
      addToast('success', 'STATUS UPDATED', `REMOVED BREAKING BANNER FROM ${category.toUpperCase()}`);
      fetchArticles();
    } catch (err: any) {
      addToast('error', 'ACTION FAILED', err.response?.data?.error || 'Failed to remove category breaking');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Decrypting Repository...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 font-manrope space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <AlertCircle className="w-14 h-14 text-primary animate-bounce mx-auto" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">System Diagnostics Panel</h2>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-[0.2em] italic">
            Intelligence Repository Diagnostics Control
          </p>
        </div>

        {/* Diagnostic Parameter Cards */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-[2rem] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2 pb-2 border-b border-white/5">
            Diagnostics Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Connection Status */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
              <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Connection Status</span>
              <div className={cn(
                "text-xs font-black uppercase tracking-wide",
                diagnosticError?.connectionStatus === 'Connected' ? "text-green-500" : "text-red-500"
              )}>
                {diagnosticError?.connectionStatus || 'Unknown'}
              </div>
            </div>

            {/* API Status */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
              <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">API Status</span>
              <div className="text-xs font-black uppercase tracking-wide text-white">
                {diagnosticError?.apiStatus || 'API Request Failed'}
              </div>
            </div>

            {/* Database Status */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
              <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Database Status</span>
              <div className={cn(
                "text-xs font-black uppercase tracking-wide",
                diagnosticError?.dbStatus?.includes('Connected') ? "text-green-500" : "text-red-500"
              )}>
                {diagnosticError?.dbStatus || 'Database Status Unknown'}
              </div>
            </div>

            {/* Response Code */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
              <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider">Response Code</span>
              <div className="text-xs font-black uppercase tracking-wide text-white font-mono">
                {diagnosticError?.responseCode ? (diagnosticError.responseCode === 'N/A' ? 'N/A' : `HTTP ${diagnosticError.responseCode}`) : 'N/A'}
              </div>
            </div>

          </div>

          {/* Time & Route Info */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-wider leading-relaxed">
            <div>
              <span className="text-white/40">Timestamp:</span> <span className="text-white font-mono">{diagnosticError?.timestamp || new Date().toLocaleString()}</span>
            </div>
            <div>
              <span className="text-white/40">Route:</span> <span className="text-white font-mono lowercase">{diagnosticError?.route || '/api/articles'}</span>
            </div>
          </div>
        </div>

        {/* Detailed Backend Message */}
        <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-[2rem] space-y-2">
          <h4 className="text-[10px] text-red-500 uppercase font-black tracking-widest">Exact Backend Diagnostics Error</h4>
          <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed font-mono">
            {error}
          </p>
        </div>

        {/* Retry Button */}
        <div className="flex justify-center">
          <button 
            onClick={fetchArticles}
            className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
          >
            <RefreshCw className="w-4 h-4" /> Force Sync Attempt
          </button>
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-blue-500/5 border border-blue-500/10 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden group">
        <div className="relative z-10">
          <h1 className="text-4xl font-normal tracking-tight text-white uppercase font-lemon">Content Manager</h1>
          <p className="text-blue-500 font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2 italic">
            <Database className="w-3 h-3" /> Global Intelligence Repository & Lifecycle Control
          </p>
        </div>
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
           {settings?.documentExportEnabled && selectedIds.length > 0 && (
             <button 
              onClick={handleBulkExport}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3 uppercase text-[10px] tracking-widest"
             >
                <Database className="w-4 h-4" /> Export Selected ({selectedIds.length})
             </button>
           )}
           <button 
            onClick={() => navigate(isAdmin ? '/admin/studio' : '/author/new')}
            className="relative z-10 bg-primary hover:bg-red-600 text-white font-black px-10 py-5 rounded-2xl shadow-2xl shadow-primary/20 transition-all flex items-center gap-3 uppercase text-[10px] tracking-widest"
           >
             <Plus className="w-4 h-4" /> Initialize New Entry
           </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input 
              type="text"
              placeholder="Search intelligence records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm text-white focus:outline-none focus:border-primary focus:bg-white/10 transition-all font-manrope"
            />
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={fetchArticles}
              className="flex-1 md:flex-none px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
            >
               <RefreshCw className="w-4 h-4" /> Refresh Stream
            </button>
            <div className="flex-1 md:flex-none px-8 py-4 bg-primary/10 border border-primary/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-primary flex items-center justify-center gap-3 italic">
               {filteredArticles.length} RECORDS ONLINE
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredArticles.map((article, i) => {
            const isMenuOpen = openMenuId === article._id;
            return (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="liquid-glass p-6 rounded-[2rem] border-white/5 hover:border-primary/20 transition-all group"
                style={{
                  overflow: isMenuOpen ? 'visible' : 'hidden',
                  zIndex: isMenuOpen ? 50 : 1,
                  position: 'relative'
                }}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                   <div className="w-full lg:w-48 aspect-video rounded-2xl overflow-hidden border border-white/5 relative flex-shrink-0">
                      <img src={article.featuredImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <button 
                          onClick={() => toggleSelect(article._id)}
                          className={cn(
                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all backdrop-blur-md",
                            selectedIds.includes(article._id) ? "bg-primary border-primary" : "bg-black/40 border-white/20 hover:border-white/40"
                          )}
                        >
                           {selectedIds.includes(article._id) && <Plus className="w-4 h-4 text-white rotate-45" />}
                        </button>
                        <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase border border-white/10">
                           {article.category}
                        </div>
                      </div>
                   </div>

                   <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                         <span className={cn(
                           "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                           article.status === 'PUBLISHED' ? "bg-success/10 border-success/20 text-success" : 
                           article.status === 'PENDING_REVIEW' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                           "bg-white/5 border-white/10 text-[var(--text-secondary)]"
                         )}>
                            {article.status}
                         </span>
                         <span className="text-[10px] font-bold text-[var(--text-secondary)] opacity-40 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {new Date(article.updatedAt).toLocaleDateString()}
                         </span>
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors leading-tight">{article.title}</h3>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-primary">
                              {article.authorName.charAt(0)}
                           </div>
                           <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">{article.authorName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-[var(--text-secondary)] opacity-60">
                           <span className="flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> {article.views}</span>
                        </div>
                      </div>

                      {isAdmin && article.status === 'PUBLISHED' && (
                         <div className="flex flex-wrap gap-2 pt-2 items-center !overflow-visible relative">
                             {/* Main Breaking Button */}
                             {article.isMainBreaking ? (
                                 <button 
                                     onClick={() => handleRemoveMainBreaking(article._id)}
                                     disabled={actionLoading !== null}
                                     className="px-3 py-1.5 bg-yellow-500 text-black border border-yellow-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:bg-transparent hover:text-yellow-500 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                     {actionLoading === article._id ? (
                                         <Loader2 className="w-3 h-3 animate-spin" />
                                     ) : (
                                         '⚡ Active Main Breaking (Remove)'
                                     )}
                                 </button>
                             ) : (
                                 <button 
                                     onClick={() => handleSetMainBreaking(article._id)}
                                     disabled={actionLoading !== null}
                                     className="px-3 py-1.5 bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-500 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all text-white/70 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                     {actionLoading === article._id ? (
                                         <Loader2 className="w-3 h-3 animate-spin" />
                                     ) : (
                                         '⚡ Set Main Breaking'
                                     )}
                                 </button>
                             )}

                             {/* Category Breaking Button & Dropdown */}
                             {article.isCategoryBreaking ? (
                                 <button 
                                     onClick={() => handleRemoveCategoryBreaking(article._id, article.isCategoryBreaking)}
                                     disabled={actionLoading !== null}
                                     className="px-3 py-1.5 bg-red-600/80 text-white border border-red-600/80 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all hover:bg-transparent hover:text-red-500 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                     {actionLoading === article._id ? (
                                         <Loader2 className="w-3 h-3 animate-spin" />
                                     ) : (
                                         `📂 ${article.isCategoryBreaking} Breaking (Remove)`
                                     )}
                                 </button>
                             ) : (
                                 <div className="relative">
                                     <button 
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             e.preventDefault();
                                             setOpenMenuId(openMenuId === article._id ? null : article._id);
                                         }}
                                         className="px-3 py-1.5 bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1 text-white/70 disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                         📂 Set Category Breaking <ChevronDown className="w-3 h-3 shrink-0" />
                                     </button>
                                     {isMenuOpen && (
                                       <div className="absolute left-0 mt-2 py-2 w-48 bg-[var(--background-deep)] border border-[var(--glass-border)] rounded-xl shadow-2xl z-[100] max-h-60 overflow-y-auto">
                                         {CATEGORIES.map(cat => (
                                           <button
                                             key={cat}
                                             onClick={() => {
                                               handleSetCategoryBreaking(article._id, cat);
                                               setOpenMenuId(null);
                                             }}
                                             className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-wider text-white hover:bg-primary/10 hover:text-primary transition-all"
                                           >
                                             {cat}
                                           </button>
                                         ))}
                                       </div>
                                     )}
                                 </div>
                             )}
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
                      {settings?.documentExportEnabled && (
                         <button 
                           onClick={() => handleSingleExport(article)}
                           className="flex-1 lg:flex-none p-4 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-white rounded-xl text-blue-500 transition-all group/btn"
                           title="Export DOCX"
                         >
                            <Database className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                         </button>
                      )}
                      <button 
                        onClick={() => navigate(isAdmin ? `/admin/studio?id=${article._id}` : `/author/new?id=${article._id}`)}
                        className="flex-1 lg:flex-none p-4 bg-white/5 border border-white/10 hover:border-blue-500/40 rounded-xl text-white transition-all group/btn"
                      >
                         <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      {article.status !== 'PUBLISHED' && (
                         <button 
                           onClick={() => handlePublish(article._id)}
                           disabled={actionLoading !== null}
                           className="flex-1 lg:flex-none px-6 py-4 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white rounded-xl text-primary font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-primary/10"
                         >
                            Publish
                         </button>
                      )}
                      <button 
                        onClick={() => handleDeleteArticle(article._id)}
                        disabled={actionLoading !== null}
                        className="p-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl text-red-500 transition-all"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ContentEngine;
