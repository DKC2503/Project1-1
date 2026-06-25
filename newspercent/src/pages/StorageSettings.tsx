import React, { useEffect, useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  History, 
  Calendar, 
  Key, 
  Folder,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import { useToastStore } from '../hooks/useToastStore';
import { cn } from '../lib/utils';

interface ActiveStorageConfig {
  cloudName: string;
  apiKey: string;
  status: string;
  updatedAt: string | null;
  updatedBy: string;
  folderPrefix: string;
  purpose: string;
  startDate: string;
}

interface ConnectionLog {
  _id: string;
  cloudName: string;
  apiKey: string;
  purpose: string;
  status: 'ACTIVE' | 'RETIRED' | 'FAILED';
  startDate: string;
  endDate?: string;
  reason?: string;
  updatedBy: string;
  folderPrefix: string;
}

const StorageSettingsPage: React.FC = () => {
  const [currentActive, setCurrentActive] = useState<ActiveStorageConfig | null>(null);
  const [profileActive, setProfileActive] = useState<ActiveStorageConfig | null>(null);
  const [connections, setConnections] = useState<ConnectionLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  // Form State
  const [formData, setFormData] = useState({
    cloudName: '',
    apiKey: '',
    apiSecret: '',
    folderPrefix: 'newspercent',
    purpose: 'article', // Default Purpose
    reason: ''
  });
  
  const [showSecret, setShowSecret] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [verificationError, setVerificationError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/storage/config');
      setCurrentActive(res.data.currentActive);
      setProfileActive(res.data.profileActive);
      setConnections(res.data.allConnections || []);
    } catch (err: any) {
      addToast('error', 'FETCH FAILED', err.response?.data?.error || 'Failed to load storage configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openRotationModal = () => {
    setFormData({
      cloudName: '',
      apiKey: '',
      apiSecret: '',
      folderPrefix: 'newspercent',
      purpose: 'article',
      reason: ''
    });
    setVerificationStatus('idle');
    setVerificationError('');
    setShowSecret(false);
    setModalOpen(true);
  };

  const handleVerify = async () => {
    if (!formData.cloudName || !formData.apiKey || !formData.apiSecret || !formData.purpose) {
      addToast('error', 'INPUT REQUIRED', 'Please fill in Purpose, Cloud Name, API Key, and API Secret.');
      return;
    }

    try {
      setVerifying(true);
      setVerificationStatus('idle');
      setVerificationError('');

      await api.post('/api/admin/storage/verify', {
        cloudName: formData.cloudName,
        apiKey: formData.apiKey,
        apiSecret: formData.apiSecret,
        folderPrefix: formData.folderPrefix,
        purpose: formData.purpose
      });

      setVerificationStatus('success');
      addToast('success', 'VERIFICATION SUCCESSFUL', 'Cloudinary connection is working.');
    } catch (err: any) {
      setVerificationStatus('failed');
      const errMsg = err.response?.data?.error || 'Connection verification failed.';
      setVerificationError(errMsg);
      addToast('error', 'VERIFICATION FAILED', errMsg);
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cloudName || !formData.apiKey || !formData.apiSecret || !formData.purpose) {
      addToast('error', 'INPUT REQUIRED', 'Please fill in all mandatory credentials.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/api/admin/storage/config', formData);
      addToast('success', 'STORAGE ROTATED', res.data.message || 'New Cloudinary account is now active.');
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to rotate storage credentials.';
      addToast('error', 'ROTATION FAILED', errMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Loading Storage Mainframe...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 font-manrope">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-color)] pb-10 px-4 sm:px-0">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-3 flex items-center gap-4">
            <Database className="w-10 h-10 text-primary" />
            Storage Management
          </h1>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.3em] italic">
            Configure Classified Cloudinary Accounts & Rotation History
          </p>
        </div>
        <button
          onClick={openRotationModal}
          className="w-full md:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg shadow-primary/20 hover:scale-105"
        >
          <Plus className="w-4 h-4" /> Add / Rotate Storage Connection
        </button>
      </div>

      {/* STORAGE DASHBOARD (Overview Status Cards) */}
      <div className="space-y-4 px-4 sm:px-0">
        <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)]">
          Active Storage Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Article Storage (Active Article Storage) */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group space-y-6">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-primary italic block mb-1">
                  Active Article Storage
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight font-mono">
                  {currentActive?.cloudName}
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 text-[9px] font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10 pt-4 border-t border-white/5">
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Purpose</p>
                <p className="text-xs font-black text-white">Article Content Images</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Provider</p>
                <p className="text-xs font-black text-white">Cloudinary (Articles)</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Folder Prefix</p>
                <p className="text-xs font-bold text-white font-mono">{currentActive?.folderPrefix || 'newspercent'}/</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Activation Date</p>
                <p className="text-xs font-bold text-white">
                  {currentActive?.startDate ? new Date(currentActive.startDate).toLocaleDateString() : 'System Default'}
                </p>
              </div>
            </div>

            <div className="pt-2 relative z-10 text-[9px] text-[var(--text-secondary)] uppercase font-medium tracking-wide">
              Managed by: <span className="text-white font-bold">{currentActive?.updatedBy || 'System'}</span>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-700" />
          </div>

          {/* Card 2: Profile Storage (Active Profile Storage) */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] relative overflow-hidden group space-y-6">
            <div className="flex justify-between items-start relative z-10">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500 italic block mb-1">
                  Active Profile Storage
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight font-mono">
                  {profileActive?.cloudName}
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-[9px] font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> ACTIVE
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 relative z-10 pt-4 border-t border-white/5">
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Purpose</p>
                <p className="text-xs font-black text-white">Profile Images</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Provider</p>
                <p className="text-xs font-black text-white">Cloudinary (Profiles)</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Folder Prefix</p>
                <p className="text-xs font-bold text-white font-mono">{profileActive?.folderPrefix || 'newspercent/profiles'}/</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--text-secondary)] uppercase font-bold tracking-wider mb-1">Activation Date</p>
                <p className="text-xs font-bold text-white">
                  {profileActive?.startDate ? new Date(profileActive.startDate).toLocaleDateString() : 'System Default'}
                </p>
              </div>
            </div>

            <div className="pt-2 relative z-10 text-[9px] text-[var(--text-secondary)] uppercase font-medium tracking-wide">
              Isolated Vault: <span className="text-[var(--text-secondary)]">Profile image storage remains strictly isolated.</span>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/10 transition-all duration-700" />
          </div>

        </div>
      </div>

      {/* Safety Warning */}
      <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] flex items-start gap-4 mx-4 sm:mx-0">
        <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Cloudinary Storage Isolation & Rotation Safety Rules</h4>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-medium tracking-wider leading-relaxed">
            - Activating a new storage connection routes <span className="text-white font-bold">only new uploads</span> to the newly active credentials.
            <br />
            - <span className="text-white font-bold">Existing URLs and historical media assets are untouched</span> and will load normally from their respective Cloudinary accounts.
            <br />
            - Profile Uploads and Article Uploads are routed separately based on <span className="text-white font-bold">mandatory purpose classification</span>.
          </p>
        </div>
      </div>

      {/* STORAGE INVENTORY & CONNECTION HISTORY PANEL */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] space-y-6 mx-4 sm:mx-0">
        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
          <History className="w-5 h-5 text-primary" /> Storage Connection History
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                <th className="py-4">Purpose / Classification</th>
                <th className="py-4">Cloud Name</th>
                <th className="py-4">Start / Activation Date</th>
                <th className="py-4">End / Retired Date</th>
                <th className="py-4">Status</th>
                <th className="py-4">Rotation Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {connections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[var(--text-secondary)] uppercase font-bold tracking-widest opacity-60">
                    No registered storage connections found.
                  </td>
                </tr>
              ) : (
                connections.map((conn) => (
                  <tr key={conn._id} className="text-xs text-white">
                    <td className="py-4">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border",
                        ['Profile Images', 'profile'].includes(conn.purpose) 
                          ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                          : "bg-primary/10 border-primary/20 text-primary"
                      )}>
                        {['Profile Images', 'profile'].includes(conn.purpose) ? 'Profile Images' : 'Article Images'}
                      </span>
                    </td>
                    <td className="py-4 font-mono font-bold">{conn.cloudName}</td>
                    <td className="py-4 text-[var(--text-secondary)] uppercase font-bold tracking-tight">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]/50" />
                        {new Date(conn.startDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 text-[var(--text-secondary)] uppercase font-bold tracking-tight">
                      {conn.endDate ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-red-500/50" />
                          {new Date(conn.endDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] italic font-semibold">—</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                        conn.status === 'ACTIVE' 
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : conn.status === 'RETIRED'
                          ? "bg-white/5 text-[var(--text-secondary)] border border-white/5"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      )}>
                        {conn.status}
                      </span>
                    </td>
                    <td className="py-4 text-[var(--text-secondary)] font-medium max-w-xs truncate" title={conn.reason}>
                      {conn.reason || 'Primary Default connection'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rotation secure modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && !verifying && setModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-[#0D0D11]/90 border border-white/10 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl relative z-10 space-y-6"
            >
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Database className="w-6 h-6 text-primary" /> Register Storage Connection
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest mt-1">
                  Rotate Cloudinary credentials with purpose classification
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                
                 {/* Storage Type (Selectable Cards) */}
                 <div className="space-y-2">
                   <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">
                     Storage Type
                   </label>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {/* Option A: Article Images */}
                     <div
                       onClick={() => setFormData({ ...formData, purpose: 'article' })}
                       className={cn(
                         "cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-2 bg-[#16161F]/60 select-none",
                         formData.purpose === 'article'
                           ? "border-primary shadow-lg shadow-primary/10"
                           : "border-white/10 hover:border-white/20"
                       )}
                     >
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                           📰 Article Images
                         </span>
                         <input
                           type="radio"
                           name="purpose"
                           checked={formData.purpose === 'article'}
                           onChange={() => setFormData({ ...formData, purpose: 'article' })}
                           className="accent-primary cursor-pointer"
                         />
                       </div>
                       <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold tracking-wider leading-relaxed">
                         Stores article thumbnails, featured images, article gallery images and content media.
                       </p>
                     </div>

                     {/* Option B: Profile Images */}
                     <div
                       onClick={() => setFormData({ ...formData, purpose: 'profile' })}
                       className={cn(
                         "cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-2 bg-[#16161F]/60 select-none",
                         formData.purpose === 'profile'
                           ? "border-cyan-500 shadow-lg shadow-cyan-500/10"
                           : "border-white/10 hover:border-white/20"
                       )}
                     >
                       <div className="flex items-center justify-between">
                         <span className="text-xs font-black text-white uppercase tracking-tight flex items-center gap-2">
                           👤 Profile Images
                         </span>
                         <input
                           type="radio"
                           name="purpose"
                           checked={formData.purpose === 'profile'}
                           onChange={() => setFormData({ ...formData, purpose: 'profile' })}
                           className="accent-cyan-500 cursor-pointer"
                         />
                       </div>
                       <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold tracking-wider leading-relaxed">
                         Stores administrator and author profile photos.
                       </p>
                     </div>
                   </div>
                 </div>

                {/* Cloud Name */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">Cloud Name</label>
                  <input
                    type="text"
                    required
                    value={formData.cloudName}
                    onChange={(e) => setFormData({ ...formData, cloudName: e.target.value })}
                    placeholder="e.g. newspercent-profiles"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm text-white focus:outline-none focus:border-primary transition-all font-mono"
                  />
                </div>

                {/* API Key */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">API Key</label>
                  <div className="relative">
                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      required
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="Cloudinary API Key"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-sm text-white focus:outline-none focus:border-primary transition-all font-mono"
                    />
                  </div>
                </div>

                {/* API Secret */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">API Secret</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 p-1 hover:text-primary text-white/40 transition-colors"
                    >
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <input
                      type={showSecret ? "text" : "password"}
                      required
                      value={formData.apiSecret}
                      onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                      placeholder="Cloudinary API Secret"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-primary transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Folder Prefix */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">Folder Prefix</label>
                  <div className="relative">
                    <Folder className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      value={formData.folderPrefix}
                      onChange={(e) => setFormData({ ...formData, folderPrefix: e.target.value })}
                      placeholder="newspercent"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-sm text-white focus:outline-none focus:border-primary transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Reason for Rotation */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-primary ml-1">Reason for Rotation / Rotation Reason</label>
                  <textarea
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Describe rotation reasoning (e.g., standard security cycle, quota limits)"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-5 text-sm text-white focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>

                {/* Verification Results Panel */}
                {verificationStatus !== 'idle' && (
                  <div className={cn(
                    "p-4 border rounded-2xl text-[10px] font-bold uppercase tracking-wider flex items-start gap-3",
                    verificationStatus === 'success' 
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}>
                    {verificationStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Verification Successful: Connection checked on active preset path. Safe to activate.</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <div className="space-y-1">
                          <div>Verification Failed: Credentials rejected.</div>
                          <div className="font-mono text-[9px] text-red-500 lowercase">{verificationError}</div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={verifying || saving}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-white"
                  >
                    {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify Connection'}
                  </button>
                  <button
                    type="submit"
                    disabled={verifying || saving || verificationStatus !== 'success'}
                    className="flex-1 py-4 bg-primary hover:bg-primary-hover disabled:bg-primary/20 disabled:text-white/20 disabled:cursor-not-allowed rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all text-white"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Activate Connection'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StorageSettingsPage;
