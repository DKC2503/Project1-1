import React, { useEffect, useState } from 'react';
import { 
  Database, 
  Server, 
  RefreshCw, 
  Activity, 
  Plus, 
  X, 
  CheckCircle2, 
  ShieldAlert,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import api from '../config/api';
import { useToastStore } from '../hooks/useToastStore';
import { cn } from '../lib/utils';

interface ClusterInfo {
  clusterId: string;
  clusterName: string;
  databaseName: string;
  host: string;
  status: 'Connected' | 'Disconnected';
  createdAt: string;
  isActive: boolean;
  documentCount: number;
  notes: string;
  maskedUri: string;
}

interface DBStatusResponse {
  activeCluster: ClusterInfo;
  registeredClusters: ClusterInfo[];
}

const DatabaseSettingsPage: React.FC = () => {
  const [data, setData] = useState<DBStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUri, setNewUri] = useState('');
  const [notes, setNotes] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; databaseName?: string; hostName?: string } | null>(null);
  const [registering, setRegistering] = useState(false);
  const { addToast } = useToastStore();

  // Removal state
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedClusterToRemove, setSelectedClusterToRemove] = useState<ClusterInfo | null>(null);
  const [removingClusterId, setRemovingClusterId] = useState<string | null>(null);
  const [testingClusterId, setTestingClusterId] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/admin/database/status');
      setData(res.data);
    } catch (err: any) {
      addToast('error', 'FETCH FAILED', err.response?.data?.error || 'Failed to load database status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async () => {
    if (!newUri) {
      addToast('warning', 'URI REQUIRED', 'Please enter a MongoDB URI to test.');
      return;
    }
    try {
      setTesting(true);
      setTestResult(null);
      const res = await api.post('/api/admin/database/test', { uri: newUri });
      if (res.data.success) {
        setTestResult({
          success: true,
          message: 'Connection Successful',
          databaseName: res.data.databaseName,
          hostName: res.data.hostName
        });
        addToast('success', 'CONNECTION SUCCESSFUL', 'The connection tests passed successfully.');
      } else {
        setTestResult({
          success: false,
          message: res.data.error || 'Connection Failed'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.error || 'Connection diagnostics failed'
      });
      addToast('error', 'CONNECTION FAILED', err.response?.data?.error || 'Connection diagnostics failed');
    } finally {
      setTesting(false);
    }
  };

  const handleRegisterCluster = async () => {
    if (!newUri) {
      addToast('warning', 'URI REQUIRED', 'Please enter a MongoDB URI to register.');
      return;
    }
    try {
      setRegistering(true);
      const res = await api.post('/api/admin/database/register', { uri: newUri, notes });
      if (res.data.success) {
        addToast('success', 'CLUSTER REGISTERED', 'New database cluster registered successfully.');
        setShowModal(false);
        setNewUri('');
        setNotes('');
        setTestResult(null);
        fetchStatus();
      }
    } catch (err: any) {
      addToast('error', 'REGISTRATION FAILED', err.response?.data?.error || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handleActivateCluster = async (clusterId: string) => {
    try {
      setLoading(true);
      const res = await api.post('/api/admin/database/activate', { clusterId });
      if (res.data.success) {
        addToast('success', 'WRITE CLUSTER ACTIVATED', 'Primary active write cluster updated successfully.');
        fetchStatus();
      }
    } catch (err: any) {
      addToast('error', 'ACTIVATION FAILED', err.response?.data?.error || 'Failed to activate cluster.');
      setLoading(false);
    }
  };

  const handleTestExistingConnection = async (cluster: ClusterInfo) => {
    try {
      setTestingClusterId(cluster.clusterId);
      const res = await api.post('/api/admin/database/test', { clusterId: cluster.clusterId });
      if (res.data.success) {
        addToast('success', 'CONNECTION VERIFIED', `Reachable! Database: ${res.data.databaseName}`);
      }
    } catch (err: any) {
      addToast('error', 'CONNECTION FAILED', err.response?.data?.error || 'Failed to verify connection.');
    } finally {
      setTestingClusterId(null);
    }
  };

  const handleTriggerRemove = (cluster: ClusterInfo) => {
    if (cluster.isActive) {
      addToast('warning', 'ACTIVE CLUSTER', 'Active cluster cannot be removed. Please activate another cluster first.');
      return;
    }
    setSelectedClusterToRemove(cluster);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedClusterToRemove) return;
    try {
      setRemovingClusterId(selectedClusterToRemove.clusterId);
      const res = await api.post('/api/admin/database/remove', { 
        clusterId: selectedClusterToRemove.clusterId 
      });
      if (res.data.success) {
        addToast('success', 'CLUSTER REMOVED', 'Database cluster configuration removed successfully.');
        setShowRemoveModal(false);
        setSelectedClusterToRemove(null);
        fetchStatus();
      }
    } catch (err: any) {
      addToast('error', 'REMOVAL FAILED', err.response?.data?.error || 'Failed to remove database cluster.');
    } finally {
      setRemovingClusterId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Loading Database Diagnostics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border-color)] pb-10">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-3 flex items-center gap-4">
            <Server className="w-10 h-10 text-primary" />
            MongoDB Multi-Cluster Settings
          </h1>
          <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-[0.3em] italic">
            Orchestrate multiple database shards with transparent reads and dynamic write routing
          </p>
        </div>
        <button
          onClick={() => {
            setNewUri('');
            setNotes('');
            setTestResult(null);
            setShowModal(true);
          }}
          className="bg-primary hover:bg-primary-hover text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl flex items-center gap-2 transition duration-300 transform active:scale-95 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Register New Cluster
        </button>
      </div>

      {data && (
        <div className="space-y-12">
          {/* Active Write Cluster Information Card */}
          <div className="bg-gradient-to-br from-[var(--card-bg)] to-[var(--surface-hover)] border-2 border-primary/20 p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-2xl border border-primary/25">
                    <Database className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Active Write Target</span>
                    <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-2">
                      {data.activeCluster.clusterName}
                      <span className="bg-primary/10 text-primary border border-primary/30 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                        ACTIVE WRITE
                      </span>
                    </h3>
                  </div>
                </div>

                <hr className="border-[var(--border-color)] opacity-60" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Database Name</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{data.activeCluster.databaseName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Connected Nodes Host</span>
                    <span className="text-xs font-semibold text-[var(--text-primary)] break-all">{data.activeCluster.host}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Stored Documents</span>
                    <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-green-500" />
                      {data.activeCluster.documentCount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Connection String (Masked)</span>
                  <div className="font-mono text-[9px] text-[var(--text-secondary)] break-all block bg-[var(--card-bg)] p-3 rounded-xl border border-[var(--border-color)]">
                    {data.activeCluster.maskedUri}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Cluster List Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight flex items-center gap-3">
                <Server className="w-6 h-6 text-[var(--text-secondary)]" />
                Cluster Inventory
              </h2>
              <span className="text-[9px] font-black text-[var(--text-secondary)] bg-[var(--surface-hover)] border border-[var(--border-color)] px-3 py-1 rounded-full uppercase tracking-wider">
                {data.registeredClusters.length} Registered Clusters
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {data.registeredClusters.map((cluster, index) => (
                <div 
                  key={cluster.clusterId} 
                  className={cn(
                    "bg-[var(--card-bg)] border rounded-[2rem] p-6 space-y-4 flex flex-col justify-between transition duration-300 hover:shadow-xl",
                    cluster.isActive ? "border-primary shadow-lg shadow-primary/5" : "border-[var(--border-color)]"
                  )}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-3 rounded-xl border",
                          cluster.isActive ? "bg-primary/10 border-primary/20 text-primary" : "bg-[var(--surface-hover)] border-[var(--border-color)] text-[var(--text-secondary)]"
                        )}>
                          <Database className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase block">Cluster #{index + 1}</span>
                          <h4 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                            {cluster.clusterName}
                          </h4>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={cn(
                          "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                          cluster.status === 'Connected' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        )}>
                          <span className={cn("w-1 h-1 rounded-full", cluster.status === 'Connected' ? "bg-green-500" : "bg-red-500")} />
                          {cluster.status}
                        </span>
                      </div>
                    </div>

                    {cluster.notes && (
                      <p className="text-[10px] text-[var(--text-secondary)] bg-[var(--surface-hover)] p-3 rounded-xl border border-[var(--border-color)] italic">
                        {cluster.notes}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Database</span>
                        <span className="font-semibold text-[var(--text-primary)]">{cluster.databaseName}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">Total Objects</span>
                        <span className="font-semibold text-[var(--text-primary)]">{cluster.documentCount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="text-[9px] text-[var(--text-secondary)] space-y-1">
                      <span className="font-bold uppercase tracking-wider block">Endpoint</span>
                      <span className="block font-mono break-all bg-[var(--surface-hover)] p-2 rounded-lg border border-[var(--border-color)]">
                        {cluster.maskedUri}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-3 border-t border-[var(--border-color)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Registered: {new Date(cluster.createdAt).toLocaleDateString()}
                      </span>
                      
                      {cluster.isActive && (
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary italic flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary animate-pulse" />
                          Active Write Node
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        disabled={testingClusterId === cluster.clusterId}
                        onClick={() => handleTestExistingConnection(cluster)}
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition duration-300 transform active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {testingClusterId === cluster.clusterId ? 'Testing...' : 'Test Connection'}
                      </button>

                      {!cluster.isActive && (
                        <button
                          disabled={removingClusterId === cluster.clusterId}
                          onClick={() => handleTriggerRemove(cluster)}
                          className="text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition duration-300 transform active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Remove
                        </button>
                      )}

                      {!cluster.isActive && (
                        <button
                          disabled={cluster.status !== 'Connected'}
                          onClick={() => handleActivateCluster(cluster.clusterId)}
                          className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border transition duration-300",
                            cluster.status === 'Connected' 
                              ? "border-primary text-primary hover:bg-primary hover:text-white transform active:scale-95 cursor-pointer" 
                              : "border-[var(--border-color)] text-[var(--text-secondary)] opacity-50 cursor-not-allowed"
                          )}
                        >
                          Make Active
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal - Register New Cluster */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 relative flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Database className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Register MongoDB Cluster</h3>
                  <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Expand storage without database migration</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-[var(--surface-hover)] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <hr className="border-[var(--border-color)]" />

            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider block">MongoDB URI</label>
                <input
                  type="text"
                  placeholder="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
                  value={newUri}
                  onChange={(e) => {
                    setNewUri(e.target.value);
                    setTestResult(null);
                  }}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-color)] focus:border-primary text-xs font-mono p-4 rounded-xl outline-none text-[var(--text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider block">Administrative Notes (Optional)</label>
                <textarea
                  placeholder="e.g. Dedicated backup storage, Article archives, secondary write node..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[var(--surface-hover)] border border-[var(--border-color)] focus:border-primary text-xs p-4 rounded-xl outline-none text-[var(--text-primary)] h-20 resize-none"
                />
              </div>
            </div>

            {/* Test Connection Result Log */}
            {testResult && (
              <div className={cn(
                "p-4 rounded-xl border flex flex-col gap-2",
                testResult.success ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
              )}>
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  )}
                  <span className={cn(
                    "text-xs font-black uppercase tracking-wider",
                    testResult.success ? "text-green-500" : "text-red-500"
                  )}>
                    {testResult.message}
                  </span>
                </div>
                {testResult.success && testResult.databaseName && (
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-[var(--text-secondary)] mt-1 border-t border-[var(--border-color)] pt-2">
                    <div>
                      <span className="font-bold uppercase tracking-wider block">Database Name</span>
                      <span className="font-semibold text-[var(--text-primary)]">{testResult.databaseName}</span>
                    </div>
                    <div>
                      <span className="font-bold uppercase tracking-wider block">Resolved Host</span>
                      <span className="font-semibold text-[var(--text-primary)] break-all">{testResult.hostName}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-4 border-t border-[var(--border-color)] pt-6">
              <button
                disabled={testing || registering}
                onClick={handleTestConnection}
                className={cn(
                  "px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest border transition duration-300 flex items-center gap-2",
                  testing 
                    ? "bg-[var(--surface-hover)] border-[var(--border-color)] text-[var(--text-secondary)] cursor-not-allowed" 
                    : "border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer"
                )}
              >
                {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {testing ? 'Testing...' : 'Test Connection'}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  Cancel
                </button>
                <button
                  disabled={registering || testing || !newUri}
                  onClick={handleRegisterCluster}
                  className={cn(
                    "px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white transition duration-300 flex items-center gap-2 shadow-lg shadow-primary/10",
                    (registering || testing || !newUri)
                      ? "bg-primary/50 cursor-not-allowed"
                      : "bg-primary hover:bg-primary-hover cursor-pointer"
                  )}
                >
                  {registering && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {registering ? 'Registering...' : 'Register Cluster'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Remove Cluster Confirmation */}
      {showRemoveModal && selectedClusterToRemove && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] w-full max-w-xl rounded-[2.5rem] shadow-2xl p-8 relative flex flex-col gap-6 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-xl text-red-500 border border-red-500/25">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">Remove Database Cluster</h3>
                <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider">Warning: Deauthorizing cluster registry</p>
              </div>
            </div>

            <hr className="border-[var(--border-color)]" />

            <div className="space-y-4 text-xs leading-relaxed text-[var(--text-primary)]">
              <p className="font-bold text-sm">
                Are you sure you want to remove the cluster <span className="text-primary font-black">"{selectedClusterToRemove.clusterName}"</span> from NewsPercent?
              </p>
              <p className="text-[var(--text-secondary)]">
                This action will only remove the cluster configuration, credentials, and metadata from the local configuration system.
              </p>
              <div className="bg-[var(--surface-hover)] border border-[var(--border-color)] p-4 rounded-2xl space-y-1">
                <span className="font-black text-[9px] text-[var(--text-secondary)] uppercase tracking-wider block mb-1">This action will NOT:</span>
                <ul className="list-disc pl-4 space-y-1 text-[var(--text-secondary)] text-[11px]">
                  <li>Delete the MongoDB Atlas cluster</li>
                  <li>Delete any database data</li>
                  <li>Delete any articles</li>
                  <li>Delete any users</li>
                  <li>Delete any analytics</li>
                </ul>
              </div>

              {/* Storage Warning if documents exist */}
              {selectedClusterToRemove.documentCount > 0 && (
                <div className="bg-yellow-500/10 border-2 border-yellow-500/20 p-4 rounded-2xl flex gap-3 items-start animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-black text-[9px] text-yellow-500 uppercase tracking-widest block">Storage Warning</span>
                    <p className="text-[11px] font-semibold text-[var(--text-primary)]">
                      This cluster contains NewsPercent data. Removing the configuration will not delete the data from MongoDB Atlas.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-[var(--border-color)] pt-6">
              <button
                disabled={removingClusterId !== null}
                onClick={() => {
                  setShowRemoveModal(false);
                  setSelectedClusterToRemove(null);
                }}
                className="px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
              >
                Cancel
              </button>
              <button
                disabled={removingClusterId !== null}
                onClick={handleConfirmRemove}
                className={cn(
                  "px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest text-white transition duration-300 flex items-center gap-2 shadow-lg shadow-red-500/10",
                  removingClusterId !== null
                    ? "bg-red-500/50 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 cursor-pointer"
                )}
              >
                {removingClusterId !== null && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {removingClusterId !== null ? 'Removing...' : 'Confirm Removal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseSettingsPage;
