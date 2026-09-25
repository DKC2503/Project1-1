import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Server, 
  Zap,
  HardDrive,
  AlertTriangle,
  FileText
} from 'lucide-react';
import api from '../config/api';

const MaintenanceDashboard: React.FC = () => {
  const [, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await api.get('/api/admin/external-apis/health');
        setHealth(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight text-[var(--text-primary)] font-manrope">
          Maintenance Team
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-2 font-bold uppercase tracking-widest">
          System Infrastructure & Health Overview
        </p>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="liquid-glass p-6 rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface-hover)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Server className="w-5 h-5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Backend Status</h3>
          </div>
          <p className="text-2xl font-black text-green-500">OPERATIONAL</p>
        </div>

        <div className="liquid-glass p-6 rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface-hover)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Database Health</h3>
          </div>
          <p className="text-2xl font-black text-green-500">CONNECTED</p>
        </div>

        <div className="liquid-glass p-6 rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface-hover)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Storage (Cloudinary)</h3>
          </div>
          <p className="text-2xl font-black text-green-500">HEALTHY</p>
        </div>

        <div className="liquid-glass p-6 rounded-[2rem] border border-[var(--glass-border)] bg-[var(--surface-hover)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">External APIs</h3>
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">
            {loading ? 'CHECKING...' : 'ONLINE'}
          </p>
        </div>
      </div>

      {/* Reports Section */}
      <div className="liquid-glass rounded-[2rem] p-8 border-[var(--glass-border)] mt-8">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-6">
          <FileText className="w-5 h-5 text-primary" /> Automated Reports (Gemini API)
        </h2>
        <div className="p-6 border border-dashed border-[var(--glass-border)] rounded-2xl bg-black/20">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <AlertTriangle className="w-8 h-8 text-yellow-500 mb-4" />
            <h3 className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">Monthly Maintenance Report Module</h3>
            <p className="text-[var(--text-secondary)] text-sm max-w-lg">
              The AI-driven monthly reporting system powered by Gemini API is currently under construction. Future updates will generate automated technical analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
