import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Save, 
  Image as ImageIcon, 
  Type, 
  Layout, 
  ChevronLeft,
  Loader2,
  Trash2,
  ArrowRight,
  Globe,
  Zap
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../config/api';
import RichTextEditor from '../components/RichTextEditor';
import FeaturedImageUpload from '../components/FeaturedImageUpload';
import SeoSettingsPanel from '../components/SeoSettingsPanel';
import { useToastStore } from '../hooks/useToastStore';
import CyberSelect from '../components/CyberSelect';

const CATEGORY_OPTIONS = ['National', 'Global', 'Politics', 'Business', 'Sports', 'Entertainment', 'Automobile', 'Lifestyle', 'Movies', 'Startups', 'Studies', 'Case Studies', 'Technology'].map(cat => ({
  value: cat,
  label: cat,
  icon: Globe,
  colorClass: 'text-[var(--text-secondary)]'
}));

const CreateArticle: React.FC = () => {
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
    status: 'DRAFT',
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
          addToast('error', 'TERMINAL LINK FAILED', 'ARTICLE RECORD NOT FOUND');
        } finally {
          setFetching(false);
        }
      };
      fetchArticle();
    }
  }, [editId]);

  const handleSubmit = async (status: string) => {
    if (!formData.title || !formData.content) {
      addToast('error', 'CRITICAL ERROR', 'INTELLIGENCE PAYLOAD INCOMPLETE');
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData, status };
      console.log("[SUBMIT ARTICLE] Payload:", payload);
      
      if (editId) {
        await api.patch(`/api/articles/${editId}`, payload);
        addToast('success', 'TRANSMISSION UPDATED', 'LINK STABLE');
      } else {
        await api.post('/api/articles', payload);
        addToast('success', 'TRANSMISSION COMPLETE', 'DATA VERIFIED');
      }

      setTimeout(() => navigate('/author'), 1000);
    } catch (err) {
      addToast('error', 'TRANSMISSION FAILED', 'UPLINK REFUSED');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Decrypting Intelligence Record...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 px-4 sm:px-0 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white/2 border border-white/5 p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden group">
        <div className="relative z-10">
          <button 
            onClick={() => navigate('/author')}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-primary transition-colors mb-6 uppercase text-[9px] font-bold tracking-widest"
          >
            <ChevronLeft className="w-3 h-3" /> Return to Dashboard
          </button>
          <h1 className="text-4xl font-normal tracking-tight text-white uppercase font-lemon">
            {editId ? 'Edit Article' : 'New Article'}
          </h1>
          <p className="text-primary font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2 italic">
            <Zap className="w-3 h-3" /> Create and edit articles for publishing
          </p>
        </div>
        
        <div className="flex gap-4 relative z-10 w-full md:w-auto">
          <button 
            onClick={() => handleSubmit('DRAFT')}
            disabled={loading}
            className="flex-1 md:flex-none px-8 py-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button 
            onClick={() => handleSubmit('PENDING_REVIEW')}
            disabled={loading}
            className="flex-1 md:flex-none px-10 py-4 bg-primary hover:bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-primary/20 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Submit for Review</>}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10">
        <div className="lg:col-span-2 space-y-8 sm:space-y-10">
          <div className="liquid-glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-white/5 space-y-6 sm:space-y-8">
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2 flex items-center gap-2">
                 <Type className="w-3 h-3" /> Article Title
               </label>
               <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                placeholder="Enter article title..."
                className="w-full bg-white/2 border-b-2 border-white/5 focus:border-primary py-4 px-2 text-2xl font-black text-white placeholder:text-white/10 transition-all focus:outline-none"
               />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2 flex items-center gap-2">
                 <ArrowRight className="w-3 h-3" /> Subtitle
               </label>
               <textarea 
                rows={2}
                value={formData.subtitle}
                onChange={(e) => setFormData(prev => ({...prev, subtitle: e.target.value}))}
                placeholder="Optional subtitle summary..."
                className="w-full bg-white/2 border border-white/5 rounded-2xl p-6 text-sm text-[var(--text-secondary)] focus:border-primary/40 focus:outline-none transition-all resize-none"
               />
            </div>

            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2 flex items-center gap-2 mb-4">
                 <Layout className="w-3 h-3" /> Information Body
               </label>
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
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2 flex items-center gap-2">
                   <ImageIcon className="w-3 h-3" /> Visual Asset
                 </label>
                 <FeaturedImageUpload 
                  value={formData.featuredImage}
                  onChange={(url) => setFormData(prev => ({...prev, featuredImage: url}))}
                 />
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-2 flex items-center gap-2">
                   <Globe className="w-3 h-3" /> Category Routing
                 </label>
                 <CyberSelect 
                  value={formData.category}
                  onChange={(val) => setFormData(prev => ({...prev, category: val}))}
                  options={CATEGORY_OPTIONS}
                 />
              </div>
           </div>

           <button 
            onClick={() => navigate('/author')}
            className="w-full py-5 bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white rounded-[2rem] text-red-500 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 group"
           >
              <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Cancel Draft
           </button>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
