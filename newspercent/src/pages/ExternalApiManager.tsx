import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  History, 
  Calendar, 
  PlayCircle,
  Eye,
  EyeOff,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import { useToastStore } from '../hooks/useToastStore';
import { cn } from '../lib/utils';

interface APIConfig {
  provider: string;
  apiKeyMasked: string;
  status: string;
  enabled: boolean;
  registered: string | null;
  lastTested: string | null;
  lastHttpStatus?: number | null;
  lastResponseMsg?: string | null;
  source?: string;
}

interface HistoryLog {
  _id: string;
  serviceName: string;
  provider: string;
  status: 'ACTIVE' | 'RETIRED' | 'FAILED';
  enabled: boolean;
  startDate: string;
  endDate?: string;
  reason?: string;
  updatedBy: string;
}

const ExternalApiManager: React.FC = () => {
  const [weatherConfig, setWeatherConfig] = useState<APIConfig | null>(null);
  const [stockConfig, setStockConfig] = useState<APIConfig | null>(null);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Health status
  const [healthStatus, setHealthStatus] = useState<{
    weatherStatus: string;
    stockStatus: string;
    timestamp: string | null;
  }>({
    weatherStatus: 'Loading...',
    stockStatus: 'Loading...',
    timestamp: null
  });
  const [healthChecking, setHealthChecking] = useState(false);

  // Rotation Modals / State
  const [modalOpen, setModalOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToastStore();

  // Rotation Form State
  const [formData, setFormData] = useState({
    serviceName: 'Weather API',
    provider: 'WeatherAPI',
    apiKey: '',
    reason: ''
  });
  const [showKey, setShowKey] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [verificationError, setVerificationError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/external-apis');
      setWeatherConfig(res.data.weatherActive);
      setStockConfig(res.data.stockActive);
      setHistoryLogs(res.data.allConfigs || []);
    } catch (err: any) {
      addToast('error', 'FETCH FAILED', err.response?.data?.error || 'Failed to load external APIs');
    } finally {
      setLoading(false);
    }
  };

  const checkHealth = async () => {
    try {
      setHealthChecking(true);
      const res = await api.get('/api/admin/external-apis/health');
      setHealthStatus({
        weatherStatus: res.data.weatherStatus,
        stockStatus: res.data.stockStatus,
        timestamp: res.data.timestamp
      });
    } catch (err: any) {
      addToast('error', 'HEALTH MONITORING ERROR', 'Failed to fetch API health status.');
    } finally {
      setHealthChecking(false);
    }
  };

  useEffect(() => {
    fetchData();
    checkHealth();
  }, []);

  const handleToggle = async (serviceName: string, currentStatus: boolean) => {
    try {
      const res = await api.patch('/api/admin/external-apis/toggle', {
        serviceName,
        enabled: !currentStatus
      });
      if (serviceName === 'Weather API') {
        setWeatherConfig(prev => prev ? { ...prev, enabled: res.data.config.enabled } : null);
      } else {
        setStockConfig(prev => prev ? { ...prev, enabled: res.data.config.enabled } : null);
      }
      addToast('success', 'STATUS UPDATED', `${serviceName} toggle updated to ${!currentStatus ? 'ENABLED' : 'DISABLED'}`);
      checkHealth();
      fetchData();
    } catch (err: any) {
      addToast('error', 'TOGGLE FAILED', err.response?.data?.error || 'Failed to update API toggle state.');
    }
  };

  const handleTestConnection = async (serviceName: string, provider: string, apiKeyCurrent?: string) => {
    try {
      addToast('success', 'CONNECTION TEST', `Initiating ping to ${serviceName} (${provider})...`);
      const res = await api.post('/api/admin/external-apis/verify', {
        serviceName,
        provider,
        apiKey: apiKeyCurrent || 'N/A' // placeholder for stock API
      });
      addToast('success', 'CONNECTED', res.data.message);
      checkHealth();
      fetchData();
    } catch (err: any) {
      addToast('error', 'CONNECTION FAILED', err.response?.data?.error || 'Failed to ping service endpoint.');
    }
  };

  const openRotationModal = (serviceName: string, provider: string) => {
    setFormData({
      serviceName,
      provider,
      apiKey: '',
      reason: ''
    });
    setVerificationStatus('idle');
    setVerificationError('');
    setShowKey(false);
    setModalOpen(true);
  };

  const handleVerifyNewKey = async () => {
    if (formData.serviceName === 'Weather API' && !formData.apiKey.trim()) {
      addToast('error', 'INPUT REQUIRED', 'Please provide a valid API key.');
      return;
    }

    try {
      setVerifying(true);
      setVerificationStatus('idle');
      setVerificationError('');
      
      const res = await api.post('/api/admin/external-apis/verify', {
        serviceName: formData.serviceName,
        provider: formData.provider,
        apiKey: formData.apiKey
      });

      setVerificationStatus('success');
      addToast('success', 'VERIFIED', res.data.message);
    } catch (err: any) {
      setVerificationStatus('failed');
      setVerificationError(err.response?.data?.error || 'Verification connection failed.');
      addToast('error', 'VERIFICATION FAILED', err.response?.data?.error || 'Invalid API key or network failure.');
    } finally {
      setVerifying(false);
    }
  };

  const handleActivateNewKey = async () => {
    if (verificationStatus !== 'success') {
      addToast('error', 'VERIFICATION REQUIRED', 'You must verify the connection successfully before activation.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.post('/api/admin/external-apis/rotate', {
        serviceName: formData.serviceName,
        provider: formData.provider,
        apiKey: formData.apiKey,
        reason: formData.reason
      });

      addToast('success', 'ACTIVATED', res.data.message);
      setModalOpen(false);
      fetchData();
      checkHealth();
    } catch (err: any) {
      addToast('error', 'ACTIVATION FAILED', err.response?.data?.error || 'Failed to activate key.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 font-manrope">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Synchronizing APIs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 font-manrope text-white">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-color)] pb-10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-3 flex items-center gap-4 text-white font-lemon">
            <Settings className="w-10 h-10 text-primary" />
            External API Manager
          </h1>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.3em] italic">
            Credential Rotation, Fallback States & Outbound Routing Controls
          </p>
        </div>
      </div>

      {/* HEALTH MONITORING WIDGET */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 rounded-[2.5rem] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Outbound Health Summary</span>
            <h2 className="text-2xl font-extrabold uppercase tracking-tight font-lemon">EXTERNAL API STATUS</h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              <span>Last Health Check:</span>
              <span className="text-white font-mono bg-white/5 px-2.5 py-1 rounded-md border border-[var(--border-color)]">
                {healthStatus.timestamp ? new Date(healthStatus.timestamp).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Weather status */}
            <div className="bg-[var(--background-deep)] border border-[var(--border-color)] py-4 px-6 rounded-2xl flex items-center gap-4">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Weather API:</span>
              <span className={cn(
                "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border",
                healthStatus.weatherStatus === 'Connected' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                healthStatus.weatherStatus === 'Disabled' ? "bg-white/5 border-white/10 text-white/50" :
                "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                {healthStatus.weatherStatus}
              </span>
            </div>
            
            {/* Stock status */}
            <div className="bg-[var(--background-deep)] border border-[var(--border-color)] py-4 px-6 rounded-2xl flex items-center gap-4">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Stock API:</span>
              <span className={cn(
                "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-md border",
                healthStatus.stockStatus === 'Connected' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                healthStatus.stockStatus === 'Disabled' ? "bg-white/5 border-white/10 text-white/50" :
                "bg-red-500/10 border-red-500/20 text-red-500"
              )}>
                {healthStatus.stockStatus}
              </span>
            </div>

            <button
              onClick={checkHealth}
              disabled={healthChecking}
              className="p-4 bg-primary/10 border border-primary/20 hover:bg-primary/20 text-primary rounded-2xl transition-all"
            >
              <RefreshCw className={cn("w-5 h-5", healthChecking && "animate-spin")} />
            </button>
          </div>
        </div>
      </div>

      {/* API INVENTORY DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Weather API Card */}
        {weatherConfig && (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 sm:p-10 rounded-[3rem] space-y-6 flex flex-col justify-between relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div>
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-white font-lemon">WEATHER API</h3>
                  <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mt-1">Provider: {weatherConfig.provider}</p>
                </div>
                {/* ON/OFF toggle switch */}
                <button
                  onClick={() => handleToggle('Weather API', weatherConfig.enabled)}
                  className="flex items-center gap-2"
                >
                  {weatherConfig.enabled ? (
                    <ToggleRight className="w-12 h-12 text-green-500 hover:scale-105 transition-transform" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-[var(--text-secondary)] hover:scale-105 transition-transform" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold">Connection Status</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", weatherConfig.enabled ? "bg-green-500" : "bg-red-500")} />
                    <span className="font-extrabold text-[10px] uppercase tracking-wider">{weatherConfig.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold">Registered Date</span>
                  <p className="font-semibold">{weatherConfig.registered ? new Date(weatherConfig.registered).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold">Current Masked API Key</span>
                  <p className="font-mono bg-[var(--background-deep)] border border-[var(--border-color)] py-2.5 px-4 rounded-xl text-xs select-all text-white font-bold">{weatherConfig.apiKeyMasked}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold">Last Tested</span>
                  <p className="font-semibold text-white/95">{weatherConfig.lastTested ? new Date(weatherConfig.lastTested).toLocaleString() : 'N/A'}</p>
                </div>

                {/* Weather API Diagnostic Panel */}
                <div className="col-span-2 mt-4 bg-[#111111]/40 border border-[#E5E7EB]/10 p-5 rounded-2xl space-y-3">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest block border-b border-[#E5E7EB]/10 pb-2 mb-2">
                    🔍 WEATHER API DIAGNOSTIC PANEL
                  </span>
                  <div className="grid grid-cols-2 gap-y-3 text-[11px] text-white">
                    <div>
                      <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold block mb-0.5">Provider</span>
                      <span className="font-semibold">{weatherConfig.provider}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold block mb-0.5">Active Key Source</span>
                      <span className="font-semibold text-yellow-400">{weatherConfig.source || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold block mb-0.5">Masked Key</span>
                      <span className="font-mono text-white/95 bg-[#111111] px-2 py-1 rounded border border-white/5 select-all font-bold block tracking-wider">{weatherConfig.apiKeyMasked}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold block mb-0.5">Last Test Run</span>
                      <span className="font-semibold">{weatherConfig.lastTested ? new Date(weatherConfig.lastTested).toLocaleString() : 'Never'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold block mb-0.5">Last HTTP Status</span>
                      <span className={cn(
                        "font-mono font-bold px-2 py-0.5 rounded text-[10px]",
                        weatherConfig.lastHttpStatus === 200 ? "text-green-400 bg-green-400/10" :
                        weatherConfig.lastHttpStatus ? "text-red-400 bg-red-400/10" : "text-[var(--text-secondary)] bg-white/5"
                      )}>
                        {weatherConfig.lastHttpStatus || 'N/A'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold block mb-0.5">Last Response Message</span>
                      <span className={cn(
                        "font-semibold block break-words text-xs leading-relaxed",
                        weatherConfig.lastHttpStatus === 200 ? "text-green-400" :
                        weatherConfig.lastHttpStatus ? "text-red-400" : "text-white/80"
                      )}>
                        {weatherConfig.lastResponseMsg || 'No connection test executed'}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[var(--border-color)]">
              <button
                onClick={() => handleTestConnection('Weather API', weatherConfig.provider)}
                className="py-3 px-4 bg-white/5 border border-[var(--border-color)] hover:bg-white/10 text-white font-bold rounded-xl transition-all uppercase text-[9px] tracking-widest flex items-center justify-center gap-1.5"
              >
                Test Connection
              </button>
              <button
                onClick={() => openRotationModal('Weather API', weatherConfig.provider)}
                className="py-3 px-4 bg-primary text-white font-black rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20 uppercase text-[9px] tracking-widest flex items-center justify-center gap-1.5"
              >
                Replace Key
              </button>
            </div>
          </div>
        )}

        {/* Stock Market API Card */}
        {stockConfig && (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 sm:p-10 rounded-[3rem] space-y-6 flex flex-col justify-between relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
                <div>
                  <h3 className="text-xl font-extrabold uppercase tracking-tight text-white font-lemon">STOCK MARKET API</h3>
                  <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mt-1">Provider: {stockConfig.provider}</p>
                </div>
                {/* ON/OFF toggle switch */}
                <button
                  onClick={() => handleToggle('Stock Market API', stockConfig.enabled)}
                  className="flex items-center gap-2"
                >
                  {stockConfig.enabled ? (
                    <ToggleRight className="w-12 h-12 text-green-500 hover:scale-105 transition-transform" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-[var(--text-secondary)] hover:scale-105 transition-transform" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold">Connection Status</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", stockConfig.enabled ? "bg-green-500" : "bg-red-500")} />
                    <span className="font-extrabold text-[10px] uppercase tracking-wider">{stockConfig.enabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold">Registered Date</span>
                  <p className="font-semibold">{stockConfig.registered ? new Date(stockConfig.registered).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold">API Credentials</span>
                  <div className="bg-[#111111]/40 border border-[#E5E7EB]/10 py-3 px-4 rounded-xl text-[10px] font-bold text-[#FF9500] uppercase tracking-wider leading-relaxed">
                    Provider handles queries via yahoo-finance2 library directly. API Credentials are not required.
                  </div>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold">Last Tested</span>
                  <p className="font-semibold text-white/95">{stockConfig.lastTested ? new Date(stockConfig.lastTested).toLocaleString() : 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 pt-6 border-t border-[var(--border-color)]">
              <button
                onClick={() => handleTestConnection('Stock Market API', stockConfig.provider)}
                className="py-3 px-4 bg-white/5 border border-[var(--border-color)] hover:bg-white/10 text-white font-bold rounded-xl transition-all uppercase text-[9px] tracking-widest flex items-center justify-center gap-1.5"
              >
                Test Connection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* API HISTORY LOG */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-8 sm:p-10 rounded-[3rem] space-y-8">
        <div className="flex items-center gap-4 border-b border-[var(--border-color)] pb-6">
          <History className="w-8 h-8 text-primary" />
          <div>
            <h3 className="text-xl font-extrabold uppercase tracking-tight text-white font-lemon">Credential History & Audit Logs</h3>
            <p className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider mt-1">Audit log of key rotations and activations</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] font-bold uppercase tracking-wider text-[9px]">
                <th className="py-4 px-4">Service</th>
                <th className="py-4 px-4">Provider</th>
                <th className="py-4 px-4">Key Mask</th>
                <th className="py-4 px-4">Start Date</th>
                <th className="py-4 px-4">End Date</th>
                <th className="py-4 px-4">Reason for Rotation</th>
                <th className="py-4 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {historyLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[var(--text-secondary)] uppercase font-bold tracking-wider">
                    No rotation logs recorded in this session.
                  </td>
                </tr>
              ) : (
                historyLogs.map((log) => {
                  return (
                    <tr key={log._id} className="border-b border-[var(--border-color)] hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-4 px-4 font-black uppercase text-white tracking-wide">{log.serviceName}</td>
                      <td className="py-4 px-4 font-semibold text-[var(--text-secondary)] uppercase">{log.provider}</td>
                      <td className="py-4 px-4 font-mono text-[var(--text-secondary)] text-[10px]">
                        {log.serviceName === 'Weather API' ? 'Weather API Key' : 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(log.startDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[var(--text-secondary)]">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5" />
                          {log.endDate ? new Date(log.endDate).toLocaleDateString() : 'Active'}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[var(--text-secondary)] max-w-xs truncate" title={log.reason || 'None provided'}>
                        {log.reason || 'Initialization'}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={cn(
                          "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded",
                          log.status === 'ACTIVE' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                          log.status === 'FAILED' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                          "bg-white/5 text-white/50 border border-white/10"
                        )}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROTATION MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-[var(--background-deep)] border border-[var(--glass-border)] p-8 sm:p-10 rounded-[2.5rem] shadow-2xl flex flex-col gap-6"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">Rotation Pipeline</span>
                <h3 className="text-2xl font-extrabold uppercase text-white font-lemon">Replace API Key</h3>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                  Service: {formData.serviceName} ({formData.provider})
                </p>
              </div>

              <div className="space-y-5 py-4 border-y border-[var(--border-color)]">
                {/* Proposed API Key */}
                <div className="space-y-2 relative">
                  <label className="text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-widest block">Proposed API Key</label>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      placeholder="Paste replacement API credentials..."
                      value={formData.apiKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                      className="w-full bg-[#111111]/60 border border-[var(--border-color)] rounded-xl py-3.5 pl-4 pr-12 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-primary transition-all font-mono font-bold"
                    />
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white"
                    >
                      {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Reason for rotation */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-[var(--text-secondary)] tracking-widest block">Reason for Rotation</label>
                  <input
                    type="text"
                    placeholder="e.g., Quota Exhausted / Security Compromise / Monthly Rotation"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full bg-[#111111]/60 border border-[var(--border-color)] rounded-xl py-3.5 px-4 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                {/* Pipeline connection verification status */}
                <div className="pt-2">
                  {verificationStatus === 'idle' && (
                    <div className="bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2">
                      <PlayCircle className="w-4 h-4 text-primary animate-pulse" />
                      Verification pending. Key must pass active connection verification.
                    </div>
                  )}
                  {verificationStatus === 'success' && (
                    <div className="bg-green-500/10 border border-green-500/20 py-3 px-4 rounded-xl text-[10px] font-bold text-green-500 uppercase tracking-wider flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      Active Ping Connection Successful. Credentials verified.
                    </div>
                  )}
                  {verificationStatus === 'failed' && (
                    <div className="bg-red-500/10 border border-red-500/20 py-3 px-4 rounded-xl text-[10px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      Verification Failed: {verificationError}
                    </div>
                  )}
                </div>
              </div>

              {/* Action options */}
              <div className="flex gap-4 items-center justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="py-3 px-6 bg-white/5 border border-[var(--border-color)] hover:bg-white/10 text-white font-bold rounded-xl transition-all uppercase text-[9px] tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyNewKey}
                  disabled={verifying || !formData.apiKey.trim()}
                  className="py-3 px-6 bg-[#FF9500] hover:bg-[#E08300] text-white font-black rounded-xl transition-all uppercase text-[9px] tracking-widest flex items-center gap-2"
                >
                  {verifying && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Test Connection
                </button>
                <button
                  onClick={handleActivateNewKey}
                  disabled={saving || verificationStatus !== 'success'}
                  className="py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all uppercase text-[9px] tracking-widest flex items-center gap-2 shadow-lg shadow-green-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Activate Key
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ExternalApiManager;
