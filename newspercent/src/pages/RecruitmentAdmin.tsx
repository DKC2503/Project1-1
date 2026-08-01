import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  RefreshCw, 
  Save, 
  Eye, 
  Globe, 
  ToggleLeft, 
  ToggleRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../config/api';
import { useToastStore } from '../hooks/useToastStore';
import RichTextEditor from '../components/RichTextEditor';

interface RecruitmentSettings {
  _id?: string;
  title: string;
  description: string;
  googleFormLink: string;
  buttonText: string;
  status: 'OPEN' | 'CLOSED';
  published: 'Published' | 'Draft';
  updatedAt?: string;
}

const RecruitmentAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  const [title, setTitle] = useState('Join the NewsPercent Team');
  const [description, setDescription] = useState('');
  const [googleFormLink, setGoogleFormLink] = useState('');
  const [buttonText, setButtonText] = useState('Apply Now');
  const [status, setStatus] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [published, setPublished] = useState<'Published' | 'Draft'>('Published');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const fetchRecruitmentSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/recruitment');
      if (res.data && res.data.data) {
        const item: RecruitmentSettings = res.data.data;
        setTitle(item.title || 'Join the NewsPercent Team');
        setDescription(item.description || '');
        setGoogleFormLink(item.googleFormLink || '');
        setButtonText(item.buttonText || 'Apply Now');
        setStatus(item.status || 'OPEN');
        setPublished(item.published || 'Published');
        if (item.updatedAt) {
          setUpdatedAt(new Date(item.updatedAt).toLocaleString());
        }
      }
    } catch (err: any) {
      addToast('error', 'FETCH FAILED', err.response?.data?.error || 'Failed to load recruitment settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitmentSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('error', 'INPUT REQUIRED', 'Please provide a recruitment title.');
      return;
    }
    if (!googleFormLink.trim()) {
      addToast('error', 'INPUT REQUIRED', 'Please provide a Google Form link.');
      return;
    }
    if (!buttonText.trim()) {
      addToast('error', 'INPUT REQUIRED', 'Please specify the button text.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.put('/api/recruitment', {
        title: title.trim(),
        description,
        googleFormLink: googleFormLink.trim(),
        buttonText: buttonText.trim(),
        status,
        published
      });
      addToast('success', 'RECRUITMENT UPDATED', 'Settings saved and updated successfully.');
      if (res.data?.data?.updatedAt) {
        setUpdatedAt(new Date(res.data.data.updatedAt).toLocaleString());
      }
    } catch (err: any) {
      addToast('error', 'SAVE FAILED', err.response?.data?.error || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open('/careers?preview=true', '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Loading Recruitment Module...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 font-manrope">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-color)] pb-10">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-3 flex items-center gap-4">
            <Briefcase className="w-10 h-10 text-primary" />
            Recruitment Settings
          </h1>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.3em] italic">
            Configure Careers Page & Hiring Pipelines
          </p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handlePreview}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--surface-hover)] hover:bg-[var(--surface-hover)]/80 text-[var(--text-primary)] border border-[var(--glass-border)] rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-primary" />
            Preview Page
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Status and Publish Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status Toggle Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3.5 rounded-2xl transition-all",
                  status === 'OPEN' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                )}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Recruitment Status</h3>
                  <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest mt-1">
                    Toggle opening or closing careers submissions
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-[var(--surface-hover)]/30 border border-[var(--glass-border)]/50 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                  status === 'OPEN' 
                    ? "bg-green-500/10 border border-green-500/20 text-green-500" 
                    : "bg-red-500/10 border border-red-500/20 text-red-500"
                )}>
                  {status}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                  {status === 'OPEN' ? 'Application Form is Open' : 'Application Form is Closed'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStatus(prev => prev === 'OPEN' ? 'CLOSED' : 'OPEN')}
                className="text-[var(--text-primary)] hover:text-primary transition-all p-1"
              >
                {status === 'OPEN' ? (
                  <ToggleRight className="w-10 h-10 text-green-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-[var(--text-secondary)]" />
                )}
              </button>
            </div>
          </div>

          {/* Publish Toggle Card */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-3.5 rounded-2xl transition-all",
                  published === 'Published' ? "bg-amber-500/10 text-amber-500" : "bg-[#555555]/10 text-[var(--text-secondary)]"
                )}>
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Visibility State</h3>
                  <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest mt-1">
                    Control public availability of setting changes
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-[var(--surface-hover)]/30 border border-[var(--glass-border)]/50 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                  published === 'Published' 
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-500" 
                    : "bg-[#555555]/10 border border-[#555555]/20 text-[var(--text-secondary)]"
                )}>
                  {published}
                </span>
                <span className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                  {published === 'Published' ? 'Visible to Public Website' : 'Draft / Hidden from Public'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPublished(prev => prev === 'Published' ? 'Draft' : 'Published')}
                className="text-[var(--text-primary)] hover:text-primary transition-all p-1"
              >
                {published === 'Published' ? (
                  <ToggleRight className="w-10 h-10 text-amber-500" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-[var(--text-secondary)]" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Text Fields and Editor */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 sm:p-10 rounded-[3rem] space-y-8 relative overflow-hidden">
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight border-b border-[var(--glass-border)]/30 pb-4">
            Recruitment Landing Content
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">
                Recruitment Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Join the NewsPercent Team"
                className="w-full rounded-2xl py-4 px-5 text-xs font-bold focus:outline-none focus:border-primary transition-all bg-white/5 border border-white/10 text-white font-manrope"
              />
            </div>

            {/* Button Text */}
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">
                Button text
              </label>
              <input
                type="text"
                required
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="e.g. Apply Now"
                className="w-full rounded-2xl py-4 px-5 text-xs font-bold focus:outline-none focus:border-primary transition-all bg-white/5 border border-white/10 text-white font-manrope"
              />
            </div>
          </div>

          {/* Google Form Link */}
          <div className="space-y-2">
            <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">
              Google Form Link (Target URL)
            </label>
            <input
              type="url"
              required
              value={googleFormLink}
              onChange={(e) => setGoogleFormLink(e.target.value)}
              placeholder="e.g. https://forms.google.com/your-form-id"
              className="w-full rounded-2xl py-4 px-5 text-xs font-mono focus:outline-none focus:border-primary transition-all bg-white/5 border border-white/10 text-white"
            />
          </div>

          {/* Short Description (Rich Text Editor) */}
          <div className="space-y-2 !overflow-visible">
            <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1 mb-2 block">
              Short Description / Recruitment Overview
            </label>
            <RichTextEditor 
              content={description}
              onChange={(html) => setDescription(html)}
            />
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-left">
            {updatedAt ? (
              <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Last Saved: <span className="font-mono text-[var(--text-primary)]">{updatedAt}</span>
              </p>
            ) : (
              <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Settings have not been saved yet.
              </p>
            )}
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-xl shadow-primary/25 active:scale-98 transition-all text-xs font-black uppercase tracking-widest cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Recruitment Settings
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RecruitmentAdmin;
