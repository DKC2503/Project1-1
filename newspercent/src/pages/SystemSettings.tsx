import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  ShieldAlert, 
  Zap, 
  FileJson, 
  RefreshCw,
  CloudSun,
  TrendingUp,
  Users,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import api from '../config/api';
import { useAuthStore } from '../hooks/useAuthStore';
import { useToastStore } from '../hooks/useToastStore';
import { useDialogStore } from '../hooks/useDialogStore';

interface SystemSettings {
  performanceCreditsEnabled: boolean;
  documentExportEnabled: boolean;
  weatherApiEnabled: boolean;
  marketApiEnabled: boolean;
  populationApiEnabled: boolean;
  emailServiceEnabled: boolean;
  emergencyMode: boolean;
  version: number;
  updatedAt: string;
}

const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  const dialog = useDialogStore();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/settings');
      setSettings(res.data);
    } catch (err: any) {
      addToast('error', 'FETCH FAILED', err.response?.data?.error || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = async (key: keyof SystemSettings, value: boolean) => {
    if (!user?.role?.includes('admin')) {
      addToast('error', 'PERMISSION DENIED', 'Insufficient clearance to modify system settings');
      return;
    }

    try {
      setSaving(true);
      const res = await api.patch('/api/admin/settings', { [key]: value });
      setSettings(res.data);
      addToast('success', 'SYSTEM UPDATED', `${key} has been ${value ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      addToast('error', 'UPDATE FAILED', err.response?.data?.error || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const triggerMaintenanceMode = async () => {
    if (!user?.role?.includes('admin')) return;

    const confirmed = await dialog.confirm('CRITICAL ACTION: Enable Maintenance Mode? This will temporarily restrict all systems and external integrations.', 'Maintenance Protocol');
    if (!confirmed) return;

    try {
      setSaving(true);
      const res = await api.patch('/api/admin/settings', { emergencyMode: true });
      setSettings(res.data);
      addToast('error', 'MAINTENANCE MODE', 'Systems restricted. Maintenance mode active.');
    } catch (err: any) {
      addToast('error', 'ACTION FAILED', 'Failed to trigger maintenance mode');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Loading System Settings...</p>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 font-manrope">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-color)] pb-10">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-3 flex items-center gap-4">
            <Settings className="w-10 h-10 text-primary" />
            System Settings
          </h1>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.3em] italic">
            Global Settings & API Infrastructure
          </p>
        </div>
      </div>

      {/* Maintenance Mode Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden p-10 rounded-[3rem] border-2 transition-all duration-500",
          settings.emergencyMode 
            ? "bg-red-500/10 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.2)]" 
            : "bg-[var(--card-bg)] border-red-500/20 hover:border-red-500/40"
        )}
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className={cn(
            "p-8 rounded-[2.5rem] transition-all duration-500",
            settings.emergencyMode ? "bg-red-500 animate-pulse" : "bg-red-500/20"
          )}>
            <ShieldAlert className={cn("w-16 h-16", settings.emergencyMode ? "text-white" : "text-red-500")} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
            <h2 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tight">Maintenance Protocol</h2>
            <p className="text-[var(--text-secondary)] text-xs font-medium uppercase tracking-widest leading-relaxed max-w-2xl">
              Activating Maintenance Mode will immediately disable Credits, External APIs, and Export systems. 
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={triggerMaintenanceMode}
                disabled={saving || settings.emergencyMode}
                className={cn(
                  "pointer-events-auto px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
                  settings.emergencyMode 
                    ? "bg-red-500 text-white cursor-not-allowed opacity-50"
                    : "bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20"
                )}
              >
                {settings.emergencyMode ? 'MAINTENANCE PROTOCOL ACTIVE' : 'INITIALIZE MAINTENANCE MODE'}
              </button>
              {settings.emergencyMode && (
                <button
                  onClick={() => handleToggle('emergencyMode', false)}
                  className="px-10 py-5 bg-[var(--card-bg)] border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  TERMINATE MAINTENANCE MODE
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[100px] -mr-32 -mt-32" />
      </motion.div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Credit System Control */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2.5rem] space-y-8 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Performance Credit System</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn("w-2 h-2 rounded-full", settings.performanceCreditsEnabled ? "bg-green-500" : "bg-red-500")} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    {settings.performanceCreditsEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('performanceCreditsEnabled', !settings.performanceCreditsEnabled)}
              disabled={saving}
              className={cn(
                "relative w-20 h-10 rounded-full transition-all duration-300 p-1",
                settings.performanceCreditsEnabled ? "bg-green-500" : "bg-red-500"
              )}
            >
              <div className={cn(
                "w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-300 transform",
                settings.performanceCreditsEnabled ? "translate-x-10" : "translate-x-0"
              )} />
            </button>
          </div>
          <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-[0.15em] leading-relaxed italic">
            When disabled, all credit calculations, history updates, and leaderboard rankings stop immediately. Existing credits remain untouched.
          </p>
        </div>

        {/* Export System */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2.5rem] space-y-8 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-purple-500/10 rounded-2xl">
                <FileJson className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Document Export Engine</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn("w-2 h-2 rounded-full", settings.documentExportEnabled ? "bg-green-500" : "bg-red-500")} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    {settings.documentExportEnabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('documentExportEnabled', !settings.documentExportEnabled)}
              disabled={saving}
              className={cn(
                "relative w-20 h-10 rounded-full transition-all duration-300 p-1",
                settings.documentExportEnabled ? "bg-purple-500" : "bg-red-500"
              )}
            >
              <div className={cn(
                "w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-300 transform",
                settings.documentExportEnabled ? "translate-x-10" : "translate-x-0"
              )} />
            </button>
          </div>
          <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-[0.15em] leading-relaxed italic">
            Controls DOCX generation routes and visibility of export elements across article listings.
          </p>
        </div>
      </div>

      {/* External API Control Section */}
      <div className="space-y-8 pt-4">
        <div>
          <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">External API Control</h2>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Temporarily restrict outgoing connections to conserve limits and request quotas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Weather API */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-amber-500/10 rounded-2xl">
                  <CloudSun className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Weather API</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn("w-2 h-2 rounded-full", settings.weatherApiEnabled ? "bg-green-500" : "bg-red-500")} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      {settings.weatherApiEnabled ? 'CONNECTED' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('weatherApiEnabled', !settings.weatherApiEnabled)}
                disabled={saving}
                className={cn(
                  "relative w-20 h-10 rounded-full transition-all duration-300 p-1",
                  settings.weatherApiEnabled ? "bg-green-500" : "bg-red-500"
                )}
              >
                <div className={cn(
                  "w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-300 transform",
                  settings.weatherApiEnabled ? "translate-x-10" : "translate-x-0"
                )} />
              </button>
            </div>
            <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-[0.15em] leading-relaxed italic">
              When toggled off, all outgoing forecast queries are suspended and the weather header widget is hidden.
            </p>
          </div>

          {/* Market API */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-emerald-500/10 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Market Data API</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn("w-2 h-2 rounded-full", settings.marketApiEnabled ? "bg-green-500" : "bg-red-500")} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      {settings.marketApiEnabled ? 'CONNECTED' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('marketApiEnabled', !settings.marketApiEnabled)}
                disabled={saving}
                className={cn(
                  "relative w-20 h-10 rounded-full transition-all duration-300 p-1",
                  settings.marketApiEnabled ? "bg-green-500" : "bg-red-500"
                )}
              >
                <div className={cn(
                  "w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-300 transform",
                  settings.marketApiEnabled ? "translate-x-10" : "translate-x-0"
                )} />
              </button>
            </div>
            <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-[0.15em] leading-relaxed italic">
              Halts quote requests to financial indicators. Suspends ticker auto-updates and hides the stock banner.
            </p>
          </div>

          {/* Population API */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-cyan-500/10 rounded-2xl">
                  <Users className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">World Population API</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn("w-2 h-2 rounded-full", settings.populationApiEnabled ? "bg-green-500" : "bg-red-500")} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      {settings.populationApiEnabled ? 'CONNECTED' : 'OFFLINE'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('populationApiEnabled', !settings.populationApiEnabled)}
                disabled={saving}
                className={cn(
                  "relative w-20 h-10 rounded-full transition-all duration-300 p-1",
                  settings.populationApiEnabled ? "bg-green-500" : "bg-red-500"
                )}
              >
                <div className={cn(
                  "w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-300 transform",
                  settings.populationApiEnabled ? "translate-x-10" : "translate-x-0"
                )} />
              </button>
            </div>
            <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-[0.15em] leading-relaxed italic">
              Disables population live database query refresh. Hides the live clock counter widget.
            </p>
          </div>

          {/* Email Service */}
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2.5rem] space-y-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-blue-500/10 rounded-2xl">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Email Service</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={cn("w-2 h-2 rounded-full", settings.emailServiceEnabled ? "bg-green-500" : "bg-red-500")} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                      {settings.emailServiceEnabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleToggle('emailServiceEnabled', !settings.emailServiceEnabled)}
                disabled={saving}
                className={cn(
                  "relative w-20 h-10 rounded-full transition-all duration-300 p-1",
                  settings.emailServiceEnabled ? "bg-green-500" : "bg-red-500"
                )}
              >
                <div className={cn(
                  "w-8 h-8 bg-white rounded-full shadow-lg transition-all duration-300 transform",
                  settings.emailServiceEnabled ? "translate-x-10" : "translate-x-0"
                )} />
              </button>
            </div>
            <p className="text-[var(--text-secondary)] text-[10px] font-medium uppercase tracking-[0.15em] leading-relaxed italic">
              Disables outgoing SMTP operations completely. OTP verification codes bypass SMTP and write directly to the console instead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPage;
