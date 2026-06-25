import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  Award, 
  TrendingUp, 
  Shield, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw
} from 'lucide-react';
import api from '../config/api';
import { useAuthStore } from '../hooks/useAuthStore';
import { useToastStore } from '../hooks/useToastStore';

const CreditSettings: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/settings');
      setSettings(res.data);
    } catch (err: any) {
      addToast('error', 'FETCH FAILED', 'Could not load credit configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async () => {
    if (user?.role !== 'super_admin') return;
    try {
      setSaving(true);
      await api.patch('/api/admin/settings', settings);
      addToast('success', 'CONFIG SAVED', 'Credit rules updated across all nodes');
    } catch (err: any) {
      addToast('error', 'SAVE FAILED', 'Failed to update credit configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateNestedSetting = (path: string, value: any) => {
    const newSettings = { ...settings };
    const parts = path.split('.');
    let current = newSettings;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setSettings(newSettings);
  };

  const addMilestone = () => {
    const newMilestones = [...settings.credits.milestones, { views: 0, credits: 0, title: '' }];
    updateNestedSetting('credits.milestones', newMilestones);
  };

  const removeMilestone = (index: number) => {
    const newMilestones = settings.credits.milestones.filter((_: any, i: number) => i !== index);
    updateNestedSetting('credits.milestones', newMilestones);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <RefreshCw className="w-10 h-10 text-primary animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Syncing Merit Configuration...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-color)] pb-10 px-4 sm:px-0">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-3 flex items-center gap-4">
            <Award className="w-10 h-10 text-primary" />
            Credit Merit Configuration
          </h1>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.3em] italic">
            Dynamic Nodal Reward Distribution System
          </p>
        </div>
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="w-full md:w-auto px-10 py-4 bg-primary text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Deploy Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Author Base Rewards */}
        <section className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] space-y-8 mx-4 sm:mx-0">
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-4">
            <Zap className="w-6 h-6 text-yellow-500" /> Base Author Rewards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Article Publish', path: 'credits.AUTHOR_ARTICLE_PUBLISH' },
              { label: 'Premium Article', path: 'credits.AUTHOR_PREMIUM_ARTICLE' },
              { label: 'Breaking News', path: 'credits.AUTHOR_BREAKING_NEWS' },
              { label: 'SEO Optimization', path: 'credits.AUTHOR_SEO_OPTIMIZED' },
              { label: 'Trending (10%)', path: 'credits.AUTHOR_TRENDING_10' },
              { label: 'Trending (30%)', path: 'credits.AUTHOR_TRENDING_30' },
            ].map(item => (
              <div key={item.path} className="space-y-2">
                <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{item.label}</label>
                <input 
                  type="number" 
                  value={settings.credits[item.path.split('.')[1]]}
                  onChange={(e) => updateNestedSetting(item.path, parseInt(e.target.value))}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-color)] rounded-xl p-4 text-sm font-black text-primary outline-none focus:border-primary/50 transition-all"
                />
              </div>
            ))}
          </div>
        </section>

        {/* View Milestones Manager */}
        <section className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] space-y-8 col-span-full mx-4 sm:mx-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-4">
              <TrendingUp className="w-6 h-6 text-green-500" /> Traffic Milestones
            </h2>
            <button 
              onClick={addMilestone}
              className="p-3 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" /> Add Milestone
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {settings.credits.milestones.map((milestone: any, index: number) => (
              <div key={index} className="p-6 bg-[var(--surface-hover)] border border-[var(--border-color)] rounded-[2rem] space-y-4 relative group">
                <button 
                  onClick={() => removeMilestone(index)}
                  className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Views Target</label>
                  <input 
                    type="number" 
                    value={milestone.views}
                    onChange={(e) => {
                      const newMilestones = [...settings.credits.milestones];
                      newMilestones[index].views = parseInt(e.target.value);
                      updateNestedSetting('credits.milestones', newMilestones);
                    }}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3 text-sm font-black text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Merit Award</label>
                  <input 
                    type="number" 
                    value={milestone.credits}
                    onChange={(e) => {
                      const newMilestones = [...settings.credits.milestones];
                      newMilestones[index].credits = parseInt(e.target.value);
                      updateNestedSetting('credits.milestones', newMilestones);
                    }}
                    className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-3 text-sm font-black text-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Admin Operational Rewards */}
        <section className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] space-y-8 mx-4 sm:mx-0">
          <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-4">
            <Shield className="w-6 h-6 text-blue-500" /> Admin Operational Rewards
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'User Approval', key: 'ADMIN_USER_APPROVAL' },
              { label: 'Article Review', key: 'ADMIN_ARTICLE_REVIEW' },
              { label: 'Article Approval', key: 'ADMIN_ARTICLE_APPROVAL' },
              { label: 'Premium Selection', key: 'ADMIN_PREMIUM_SELECTION' },
              { label: 'Community Mgmt', key: 'ADMIN_COMMUNITY_MGMT' },
              { label: 'Support Resolution', key: 'ADMIN_SUPPORT_RESOLUTION' },
              { label: 'Admin Publish Article', key: 'ADMIN_ARTICLE_PUBLISH' },
            ].map(item => (
              <div key={item.key} className="space-y-2">
                <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{item.label}</label>
                <input 
                  type="number" 
                  value={settings.credits[item.key]}
                  onChange={(e) => updateNestedSetting(`credits.${item.key}`, parseInt(e.target.value))}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-color)] rounded-xl p-4 text-sm font-black text-primary outline-none focus:border-primary/50 transition-all"
                />
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default CreditSettings;
