import React, { useState } from 'react';
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react';
import api from '../config/api';
import { cn } from '../lib/utils';

interface FeaturedImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  uploadType?: 'admin' | 'author' | 'article' | 'breaking-news' | 'flash-news';
}

const FeaturedImageUpload: React.FC<FeaturedImageUploadProps> = ({ value, onChange, uploadType }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Payload Exceeds Limit: Max 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError(null);
      
      const endpoint = uploadType ? `/api/upload?type=${uploadType}` : '/api/upload';
      const res = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        onChange(res.data.imageUrl);
      }
    } catch (err: any) {
      console.error("UPLOAD ERROR:", err);
      if (uploadType === 'admin' || uploadType === 'author') {
        setError('Profile Image Upload Failed');
      } else {
        setError('Transmission Failed: Link Terminated');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    onChange('');
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className={cn(
        "relative aspect-video rounded-2xl border-2 border-dashed transition-all overflow-hidden group",
        value ? "border-success/40" : "border-white/10 hover:border-primary/40 bg-white/2"
      )}>
        {value ? (
          <>
            <img src={value} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" alt="Featured" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button 
                onClick={removeImage}
                className="p-3 bg-red-500 text-white rounded-xl shadow-xl shadow-red-500/20 transform translate-y-4 group-hover:translate-y-0 transition-all"
               >
                 <X className="w-5 h-5" />
               </button>
            </div>
          </>
        ) : (
          <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center p-8 text-center group">
            <input type="file" className="hidden" onChange={handleUpload} accept="image/*" disabled={loading} />
            {loading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Uploading Asset...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <Upload className="w-6 h-6 text-primary" />
                </div>
                <p className="text-xs font-bold text-white uppercase tracking-tight mb-2">Upload visual asset</p>
                <p className="text-[9px] text-[var(--text-secondary)] font-medium uppercase tracking-[0.2em]">JPG, PNG, WEBP • Max 10MB</p>
              </>
            )}
          </label>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-[10px] font-black text-red-500 uppercase tracking-widest italic animate-shake">
           <AlertCircle className="w-4 h-4 flex-shrink-0" />
           {error}
        </div>
      )}
    </div>
  );
};

export default FeaturedImageUpload;
