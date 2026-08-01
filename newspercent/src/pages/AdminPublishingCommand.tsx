import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  Send, 
  Trash2, 
  ChevronLeft,
  Globe,
  Loader2,
  AlertTriangle,
  Landmark,
  Building,
  Briefcase,
  Trophy,
  Film,
  Car,
  Sparkles,
  Clapperboard,
  Rocket,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import RichTextEditor from '../components/RichTextEditor';
import FeaturedImageUpload from '../components/FeaturedImageUpload';
import SeoSettingsPanel from '../components/SeoSettingsPanel';
import { useToastStore } from '../hooks/useToastStore';
import CyberSelect from '../components/CyberSelect';
import { cn } from '../lib/utils';

const CATEGORY_ICONS: Record<string, any> = {
  National: Landmark,
  Global: Globe,
  Politics: Building,
  Business: Briefcase,
  Sports: Trophy,
  Entertainment: Film,
  Automobile: Car,
  Lifestyle: Sparkles,
  Movies: Clapperboard,
  Startups: Rocket,
  Studies: BookOpen,
  'Case Studies': BarChart3,
  Technology: Zap
};

const CATEGORY_OPTIONS = Object.keys(CATEGORY_ICONS).map(cat => ({
  value: cat,
  label: cat,
  icon: CATEGORY_ICONS[cat],
  colorClass: 'text-[var(--text-secondary)]'
}));

const AdminPublishingCommand: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const { addToast } = useToastStore();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    category: 'National',
    featuredImage: '',
    isBreakingNews: false,
    status: 'PUBLISHED',
    seoTitle: '',
    metaDescription: '',
    focusKeyword: '',
    slug: '',
    canonicalUrl: '',
    keywords: [] as string[],
    robotsDirective: 'index, follow',
    openGraphImage: '',
    seoScore: 0
  });

  useEffect(() => {
    if (editId) {
      const fetchArticle = async () => {
        try {
          setFetching(true);
          const res = await api.get(`/api/articles/${editId}`);
          const { 
            title, 
            subtitle, 
            content, 
            category, 
            featuredImage, 
            isBreakingNews, 
            status,
            seoTitle,
            metaDescription,
            focusKeyword,
            slug,
            canonicalUrl,
            keywords,
            robotsDirective,
            openGraphImage,
            seoScore
          } = res.data;
          setFormData({ 
            title, 
            subtitle: subtitle || '', 
            content, 
            category, 
            featuredImage, 
            isBreakingNews: !!isBreakingNews, 
            status,
            seoTitle: seoTitle || '',
            metaDescription: metaDescription || '',
            focusKeyword: focusKeyword || '',
            slug: slug || '',
            canonicalUrl: canonicalUrl || '',
            keywords: keywords || [],
            robotsDirective: robotsDirective || 'index, follow',
            openGraphImage: openGraphImage || '',
            seoScore: seoScore || 0
          });
        } catch (err) {
          console.error('Error fetching article for edit:', err);
          addToast('error', 'FETCH FAILED', 'ARTICLE NOT FOUND');
        } finally {
          setFetching(false);
        }
      };
      fetchArticle();
    }
  }, [editId]);

  const handleSubmit = async (status: string) => {
    if (!formData.title || !formData.content) {
      addToast('error', 'DATA ERROR', 'DATA PAYLOAD INCOMPLETE');
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData, status };
      
      if (editId) {
        await api.patch(`/api/admin/articles/${editId}`, payload);
        addToast('success', 'SAVE COMPLETE', 'ARTICLE SAVED SUCCESSFULLY');
      } else {
        await api.post('/api/articles', { ...payload, status: 'PUBLISHED' });
        addToast('success', 'PUBLISHED', 'ARTICLE PUBLISHED SUCCESSFULLY');
      }

      setTimeout(() => navigate('/admin/articles'), 1000);
    } catch (err) {
      addToast('error', 'PUBLISHING FAILED', 'SERVER ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBreaking = async () => {
    if (!editId || formData.status !== 'PUBLISHED') {
        // If not saved/published, just toggle in state
        setFormData(prev => ({ ...prev, isBreakingNews: !prev.isBreakingNews }));
        return;
    }

    try {
      setLoading(true);
      if (formData.isBreakingNews) {
        await api.delete(`/api/admin/articles/${editId}/breaking`);
        setFormData(prev => ({ ...prev, isBreakingNews: false }));
        addToast('success', 'STATUS UPDATED', 'ARTICLE REMOVED FROM BREAKING');
      } else {
        await api.put(`/api/admin/articles/${editId}/breaking`);
        setFormData(prev => ({ ...prev, isBreakingNews: true }));
        addToast('success', 'STATUS UPDATED', 'ARTICLE SET AS BREAKING NEWS');
      }
    } catch (err) {
      addToast('error', 'UPDATE FAILED', 'COULD NOT SYNC BREAKING STATUS');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Loading Article...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 px-4 sm:px-0 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-red-500/5 border border-red-500/10 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden group">
        <div className="relative z-10">
          <button 
            onClick={() => navigate('/admin/articles')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-primary transition-colors mb-6 uppercase text-[9px] font-bold tracking-widest"
          >
            <ChevronLeft className="w-3 h-3" /> Return to Content Manager
          </button>
          <h1 className="text-4xl font-normal tracking-tight text-white uppercase font-lemon">Publishing Center</h1>
          <p className="text-primary font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2 italic">
            <Zap className="w-3 h-3" /> Direct global publishing system
          </p>
        </div>
        
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          {formData.status === 'PUBLISHED' && (
            <button 
              onClick={handleToggleBreaking}
              disabled={loading}
              className={cn(
                "flex-1 md:flex-none px-6 py-4 border rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                formData.isBreakingNews 
                  ? "bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20" 
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              )}
            >
              <AlertTriangle className={cn("w-4 h-4", formData.isBreakingNews && "fill-current")} />
              {formData.isBreakingNews ? 'Active Breaking' : 'Mark Breaking'}
            </button>
          )}
          <button 
            onClick={() => handleSubmit('PUBLISHED')}
            disabled={loading}
            className="flex-1 md:flex-none px-10 py-4 bg-primary hover:bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Publish Article</>}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        <div className="lg:col-span-2 space-y-8 sm:space-y-10">
          <div className="liquid-glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-white/5 space-y-6 sm:space-y-8">
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2">Article Title</label>
               <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                placeholder="Enter article title..."
                className="w-full bg-[var(--input-bg)] border-b-2 border-[var(--input-border)] focus:border-primary py-4 px-2 text-2xl font-black text-[var(--input-text)] placeholder-[var(--input-placeholder)] transition-all focus:outline-none"
               />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2">Article Content</label>
               <RichTextEditor 
                content={formData.content}
                onChange={(content) => setFormData(prev => ({...prev, content}))}
               />
            </div>
          </div>

          {/* SEO Settings Panel Card */}
          <SeoSettingsPanel formData={formData} setFormData={setFormData} />
        </div>

        <div className="space-y-8 sm:space-y-10">
           <div className="liquid-glass p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border-white/5 space-y-6 sm:space-y-8 !overflow-visible">
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2">Visual Asset</label>
                 <FeaturedImageUpload 
                  value={formData.featuredImage}
                  onChange={(url) => setFormData(prev => ({...prev, featuredImage: url}))}
                  uploadType={formData.isBreakingNews ? 'breaking-news' : 'article'}
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2">Category Selection</label>
                 <CyberSelect 
                  value={formData.category}
                  onChange={(val) => setFormData(prev => ({...prev, category: val}))}
                  options={CATEGORY_OPTIONS}
                 />
              </div>
           </div>

           <button 
            onClick={() => navigate('/admin/articles')}
            className="w-full py-5 bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white rounded-[2rem] text-red-500 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 group"
           >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Cancel Draft
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPublishingCommand;
