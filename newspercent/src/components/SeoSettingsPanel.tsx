import React from 'react';
import { Globe } from 'lucide-react';

interface SeoSettingsPanelProps {
  formData: {
    title: string;
    seoTitle?: string;
    focusKeyword?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const SeoSettingsPanel: React.FC<SeoSettingsPanelProps> = ({ formData, setFormData }) => {
  const seoTitle = formData.seoTitle || '';
  const focusKeyword = formData.focusKeyword || '';

  return (
    <div className="liquid-glass p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border-white/5 space-y-6">
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <Globe className="w-5 h-5 text-primary" />
          Search Engine Optimization (SEO)
        </h2>
        <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-widest mt-1">
          Configure search metadata
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
        {/* SEO Title */}
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">
            SEO Title
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, seoTitle: e.target.value }))}
            placeholder="Defaults to article title..."
            className="w-full rounded-2xl py-4 px-5 text-xs font-bold focus:outline-none focus:border-primary transition-all bg-white/5 border border-white/10 text-white"
          />
        </div>

        {/* Focus Keyword */}
        <div className="space-y-2">
          <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">
            Focus Keyword
          </label>
          <input
            type="text"
            value={focusKeyword}
            onChange={(e) => setFormData((prev: any) => ({ ...prev, focusKeyword: e.target.value }))}
            placeholder="e.g. India Economy"
            className="w-full rounded-2xl py-4 px-5 text-xs font-bold focus:outline-none focus:border-primary transition-all bg-white/5 border border-white/10 text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default SeoSettingsPanel;
