import React, { useEffect, useState } from 'react';
import { 
    Zap, 
    Plus, 
    Trash2, 
    RefreshCw, 
    Loader2, 
    XCircle,
    Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../config/api';
import { useToastStore } from '../hooks/useToastStore';
import { cn } from '../lib/utils';

import { useDialogStore } from '../hooks/useDialogStore';

const FlashNewsControl: React.FC = () => {
    const [flashItems, setFlashItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newHeadline, setNewHeadline] = useState('');
    const { addToast } = useToastStore();
    const dialog = useDialogStore();

    const fetchFlash = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/flash');
            setFlashItems(res.data ?? []);
        } catch (err) {
            addToast('error', 'UPLINK FAILED', 'Could not retrieve live flash feed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlash();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newHeadline.trim()) return;

        try {
            await api.post('/api/admin/flash', { headline: newHeadline });
            addToast('success', 'FLASH BROADCAST', 'Short headline added to live ticker.');
            setNewHeadline('');
            setIsAdding(false);
            fetchFlash();
        } catch (err) {
            addToast('error', 'TRANSMISSION FAILED', 'Security protocols blocked the flash update.');
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await dialog.confirmDelete('Are you sure you want to purge this flash headline?', 'Flash Deletion', 'Delete Flash', 'Cancel');
        if (!confirmed) return;
        try {
            await api.delete(`/api/admin/flash/${id}`);
            addToast('success', 'PURGE COMPLETE', 'Headline removed from database.');
            fetchFlash();
        } catch (err) {
            addToast('error', 'PURGE FAILED', 'Insufficient clearance.');
        }
    };

    const toggleActive = async (id: string, active: boolean) => {
        try {
            await api.patch(`/api/admin/flash/${id}`, { active });
            addToast('success', 'STATUS UPDATED', `Headline is now ${active ? 'active' : 'offline'}.`);
            fetchFlash();
        } catch (err) {
            addToast('error', 'SYNC FAILED', 'Status change rejected.');
        }
    };

    if (loading && flashItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Synchronizing Flash Mainframe...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20 font-manrope">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-orange-500/5 border border-orange-500/10 p-10 rounded-[3rem] relative overflow-hidden group">
                <div className="relative z-10">
                    <h1 className="text-4xl font-normal tracking-tight text-white uppercase font-lemon">Flash News Control</h1>
                    <p className="text-orange-500 font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2 italic">
                        <Zap className="w-3 h-3" /> Short Headline Ticker Management System
                    </p>
                </div>
                <div className="flex gap-4 relative z-10">
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-black font-black rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center gap-3 uppercase text-[10px] tracking-widest"
                    >
                        <Plus className="w-4 h-4" /> New Flash
                    </button>
                    <button 
                        onClick={fetchFlash}
                        className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </button>
                </div>
            </header>

            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="liquid-glass p-8 rounded-[3rem] border-white/5">
                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Active Headlines</p>
                    <p className="text-4xl font-black text-orange-500 italic">{flashItems.filter(a => a.active).length}</p>
                </div>
                <div className="liquid-glass p-8 rounded-[3rem] border-white/5">
                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Maximum Capacity</p>
                    <p className="text-4xl font-black text-white italic">20 / 20</p>
                </div>
                <div className="liquid-glass p-8 rounded-[3rem] border-white/5">
                    <p className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mb-2">Ticker Velocity</p>
                    <p className="text-4xl font-black text-primary italic">NORMAL</p>
                </div>
            </div>

            {/* Headlines List */}
            <div className="liquid-glass rounded-[3rem] border-white/5 overflow-hidden">
                <div className="p-8 border-b border-white/5">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Live Ticker Inventory
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-white/2 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6">Headline Text</th>
                                <th className="px-8 py-6">Timeline</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {flashItems.map((item) => (
                                <tr key={item._id} className="hover:bg-white/2 transition-colors">
                                    <td className="px-8 py-6">
                                        <button 
                                            onClick={() => toggleActive(item._id, !item.active)}
                                            className={cn(
                                                "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                                                item.active ? "bg-success/10 border-success/20 text-success" : "bg-white/5 border-white/10 text-[var(--text-secondary)]"
                                            )}
                                        >
                                            <Power className="w-2.5 h-2.5" />
                                            {item.active ? 'On Air' : 'Offline'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-white uppercase max-w-2xl">{item.headline}</p>
                                    </td>
                                    <td className="px-8 py-6 text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                                        {new Date(item.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button 
                                            onClick={() => handleDelete(item._id)}
                                            className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {flashItems.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-40 italic">
                                        No flash headlines in database.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-xl bg-[var(--background-deep)] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Initialize Flash</h3>
                                        <p className="text-orange-500 font-bold text-[10px] tracking-widest uppercase mt-2 italic opacity-60">Broadcast instant news bullet</p>
                                    </div>
                                    <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-white/5 rounded-xl text-[var(--text-secondary)]">
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] ml-2">Headline Payload</label>
                                        <input 
                                            autoFocus
                                            type="text"
                                            value={newHeadline}
                                            onChange={(e) => setNewHeadline(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-orange-500 transition-all font-bold"
                                            placeholder="Enter flash news headline (e.g. Market reaches all-time high)..."
                                            required
                                            maxLength={150}
                                        />
                                        <div className="flex justify-between px-2">
                                            <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest italic">Maximum 150 characters</p>
                                            <p className={cn("text-[8px] font-black uppercase tracking-widest", newHeadline.length > 140 ? "text-primary" : "text-[var(--text-secondary)]")}>
                                                {newHeadline.length} / 150
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setIsAdding(false)}
                                            className="px-10 py-4 bg-white/5 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            className="px-10 py-4 bg-orange-500 text-black font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl shadow-orange-500/20 hover:bg-orange-400 transition-all"
                                        >
                                            Broadcast Flash
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FlashNewsControl;
