import React, { useEffect, useState, useMemo } from 'react';
import { 
  UserPlus, 
  Search,
  Shield, 
  User, 
  Trash2, 
  Edit2, 
  Power, 
  X,
  AlertCircle,
  Clock,
  Users,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  SearchX,
  PenTool,
  CheckSquare
} from 'lucide-react';
import api from '../config/api';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../hooks/useAuthStore';
import { useToastStore } from '../hooks/useToastStore';
import { useDialogStore } from '../hooks/useDialogStore';
import CyberSelect from '../components/CyberSelect';
import FeaturedImageUpload from '../components/FeaturedImageUpload';

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, size = 'md' }) => {
  const [imgError, setImgError] = React.useState(false);
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'User'}
        onError={() => setImgError(true)}
        className={cn(
          "rounded-full object-cover border border-[var(--glass-border)] shadow-inner shrink-0",
          sizeClasses[size]
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold uppercase shadow-inner shrink-0 border text-primary bg-primary/10 border-primary/20",
        sizeClasses[size]
      )}
    >
      {initials}
    </div>
  );
};

interface UserNode {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'reviewer' | 'author';
  isActive: boolean;
  profileImage?: string;
  createdAt: string | number;
  lastLogin: string | number | null;
}

const TeamManagement: React.FC = () => {
  const [users, setUsers] = useState<UserNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { role: currentUserRole, user: currentUser, setAuth, token } = useAuthStore();
  const { addToast } = useToastStore();
  const dialog = useDialogStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profileImage: '',
    role: 'author' as 'admin' | 'author' | 'editor' | 'reviewer'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/admin/users');
      setUsers(res.data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Intelligence network access denied. Systems non-responsive.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const stats = useMemo(() => {
    const userList = Array.isArray(users) ? users : [];
    const totalUsers = userList.length;
    const authors = userList.filter(u => u.role === 'author').length;
    const admins = userList.filter(u => ['admin', 'super_admin'].includes(u.role)).length;
    const activeUsers = userList.filter(u => u.isActive).length;
    return { totalUsers, authors, admins, activeUsers };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const userList = Array.isArray(users) ? users : [];
    return userList.filter(u => 
      u?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[UI] Confirm Access Clicked");
    console.log("[UI] Form Data:", formData);
    console.log("[UI] Validation Started");

    if (!formData.name.trim()) {
      console.log("[VALIDATION] Name Missing");
      return addToast('error', 'VALIDATION ERROR', 'Name is required');
    }
    if (!formData.email.trim()) {
      console.log("[VALIDATION] Email Missing");
      return addToast('error', 'VALIDATION ERROR', 'Email is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      console.log("[VALIDATION] Email Invalid");
      return addToast('error', 'VALIDATION ERROR', 'Invalid email address');
    }
    if (!formData.role) {
      console.log("[VALIDATION] Role Missing");
      return addToast('error', 'VALIDATION ERROR', 'Role is required');
    }

    console.log("[UI] Validation Passed");
    console.log("[UI] Sending Request");
    console.log("[FRONTEND] Submit Started");
    console.log("[API] Request Payload:", formData);
    console.log("[AUTH] Token Present:", !!localStorage.getItem("token"));
    console.log("[API]", editingUser ? `PATCH /api/admin/users/${editingUser._id}` : "POST /api/admin/users");

    try {
      if (editingUser) {
        const res = await api.patch(`/api/admin/users/${editingUser._id}`, formData);
        console.log("[FRONTEND] API Response:", res.data);
        
        // Handle standardized response if present, else fallback to direct object
        const updatedUser = res.data.user || res.data;
        setUsers(users.map(u => u._id === editingUser._id ? updatedUser : u));
        
        // If editing self, sync auth state to update navbar/sidebar avatar immediately
        if (currentUser && currentUser._id === updatedUser._id) {
          setAuth(updatedUser, token || '');
        }
        
        console.log("[CREATE USER UI] Success Toast Triggered");
        addToast('success', 'SYNC COMPLETE', 'User updated successfully.');
      } else {
        const res = await api.post('/api/admin/users', formData);
        console.log("[FRONTEND] API Response:", res.data);
        
        if (res.data.success) {
          setUsers([res.data.user, ...users]);
          console.log("[CREATE USER UI] Success Toast Triggered");
          addToast(res.data.warning ? 'warning' : 'success', 'ACCESS GRANTED', res.data.message || 'User created successfully.');
        } else {
          // This block might be redundant if the API throws for errors, but good for safety
          console.log("[CREATE USER UI] Error Toast Triggered");
          addToast('error', 'ACCESS DENIED', res.data.error || 'User creation failed.');
        }
      }
      closeModal();
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      console.log("[FRONTEND] API Error:", err);
      console.error("[API] Error Details:", err.response?.data);
      
      const responseData = err.response?.data;
      const errorMessage = responseData?.error || responseData?.message || err.message || 'Unknown error';
      
      console.log("[CREATE USER UI] Error Toast Triggered");
      addToast('error', 'UPLINK ERROR', errorMessage);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const confirmed = await dialog.confirmDelete('Are you sure you want to completely terminate this node?', 'Node Termination', 'Terminate Node', 'Cancel');
    if (!confirmed) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      addToast('success', 'NODE PURGED', 'Node completely purged from system.');
    } catch (err: any) {
      addToast('error', 'TERMINATION FAILED', err.response?.data?.error || 'Termination failed.');
    }
  };

  const toggleUserStatus = async (user: UserNode) => {
    try {
      const res = await api.patch(`/api/admin/users/${user._id}`, { isActive: !user.isActive });
      setUsers(users.map(u => u._id === user._id ? res.data : u));
      addToast('success', 'STATUS UPDATED', user.isActive ? 'Node disabled.' : 'Node activated.');
    } catch (err: any) {
      addToast('error', 'SYNC FAILED', err.response?.data?.error || 'Sync failed.');
    }
  };

  const openModal = (role: 'admin' | 'author' | 'editor' | 'reviewer', user?: UserNode & { profileImage?: string }) => {
    if (user) {
      setEditingUser(user);
      setFormData({ name: user.name, email: user.email, profileImage: user.profileImage || '', role: user.role as any });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', profileImage: '', role });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const canManage = (_targetUser: UserNode) => {
    if (currentUserRole === 'super_admin' || currentUserRole === 'admin') return true;
    return false;
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'super_admin': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'admin': return <ShieldCheck className="w-4 h-4 text-orange-500" />;
      case 'editor': return <PenTool className="w-4 h-4 text-blue-500" />;
      case 'reviewer': return <CheckSquare className="w-4 h-4 text-cyan-500" />;
      default: return <User className="w-4 h-4 text-purple-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'super_admin': return "text-red-500";
      case 'admin': return "text-orange-500";
      case 'editor': return "text-blue-500";
      case 'reviewer': return "text-cyan-500";
      default: return "text-purple-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Loading clearance database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-12 liquid-glass border-red-500/20 rounded-[3rem]">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8 animate-pulse">
           <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold text-white uppercase tracking-tight mb-4">System Error</h2>
        <p className="text-[var(--text-secondary)] max-w-md mb-10 leading-relaxed font-medium">{error}</p>
        <button 
          onClick={fetchUsers}
          className="flex items-center gap-3 px-10 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-red-500/20 uppercase text-[10px] tracking-widest"
        >
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  const roleOptions = [
    { value: 'author', label: 'Author', icon: User, colorClass: 'text-purple-500' },
    { value: 'editor', label: 'Editor', icon: PenTool, colorClass: 'text-blue-500' },
    { value: 'reviewer', label: 'Reviewer', icon: CheckSquare, colorClass: 'text-cyan-500' },
    { value: 'admin', label: 'Admin', icon: ShieldCheck, colorClass: 'text-orange-500' },
  ];

  return (
    <div className="space-y-12 pb-20 font-manrope">
      <header className={cn(
        "flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-10 rounded-[3rem] relative overflow-hidden group border",
        "bg-purple-500/5 border-purple-500/10",
        "light:bg-gradient-to-br light:from-[#FFF7F3] light:to-white light:border-[#E8E2D8]"
      )}>
        <div className="relative z-10">
          <h1 className="text-4xl font-normal tracking-tight text-[var(--text-primary)] uppercase font-lemon">Team Management</h1>
          <p className="text-purple-500 font-bold text-[10px] tracking-widest uppercase mt-3 flex items-center gap-2">
            <Users className="w-3 h-3" /> CMS Team Directory
          </p>
        </div>
        <div className="flex flex-wrap gap-4 relative z-10 w-full md:w-auto">
          {['super_admin', 'admin'].includes(currentUserRole || '') && (
            <button 
              onClick={() => openModal('admin')}
              className="flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-orange-600/20 transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest"
            >
              <ShieldCheck className="w-4 h-4" /> Add Admin
            </button>
          )}
          {['super_admin', 'admin'].includes(currentUserRole || '') && (
            <button 
              onClick={() => openModal('author')}
              className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-widest"
            >
              <UserPlus className="w-4 h-4" /> Add Author
            </button>
          )}
        </div>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Authors', value: stats.authors, icon: User, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Admins', value: stats.admins, icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-500/10' },
          { label: 'Active Users', value: stats.activeUsers, icon: Shield, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <div key={i} className="liquid-glass p-8 rounded-[2rem] border-[var(--glass-border)] transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl border border-[var(--glass-border)] group-hover:scale-110 transition-transform", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <span className="text-2xl font-black text-[var(--text-primary)]">{stat.value}</span>
            </div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="liquid-glass rounded-[3rem] overflow-hidden border-[var(--glass-border)] shadow-2xl">
        <div className="p-8 border-b border-[var(--glass-border)] flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-6 w-full md:w-auto">
              <div>
                 <h2 className="text-base font-bold text-[var(--text-primary)] uppercase tracking-wider">Team Directory</h2>
                 <p className="text-[10px] text-[var(--text-secondary)] font-medium uppercase tracking-widest mt-1">
                   {filteredUsers.length} personnel matching current filters
                 </p>
              </div>
           </div>
           
           <div className="relative w-full md:w-96">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
              <input 
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-2xl py-4 pl-14 pr-6 text-sm text-[var(--text-primary)] focus:outline-none focus:border-purple-600 transition-all font-manrope"
              />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[var(--surface-hover)]">
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Name</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Email</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Role</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] text-center">Status</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Last Login</th>
                <th className="p-8 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--glass-border)]">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-[var(--surface-hover)] transition-colors group">
                  <td className="p-8 font-bold text-[var(--text-primary)] font-manrope">
                    <div className="flex items-center gap-3">
                      <UserAvatar src={user.profileImage} name={user.name} size="sm" />
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td className="p-8 text-sm text-[var(--text-secondary)]">{user.email}</td>
                  <td className="p-8">
                    <div className="flex items-center gap-3">
                       {getRoleIcon(user.role)}
                       <span className={cn(
                         "text-[10px] font-bold uppercase tracking-widest",
                         getRoleColor(user.role)
                       )}>
                          {user.role.includes('admin') ? 'ADMIN' : user.role.toUpperCase()}
                       </span>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-center">
                       <div className={cn(
                         "flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                         user.isActive ? "bg-success/10 border-success/20 text-success" : "bg-red-500/10 border-red-500/20 text-red-500"
                       )}>
                          <div className={cn("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-success animate-pulse" : "bg-red-500")} />
                          {user.isActive ? 'Active' : 'Disabled'}
                       </div>
                    </div>
                  </td>
                  <td className="p-8">
                     <div className="flex items-center gap-2 text-[10px] font-medium text-[var(--text-secondary)]">
                        <Clock className="w-3.5 h-3.5 opacity-40" />
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                     </div>
                  </td>
                  <td className="p-8">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                       {canManage(user) ? (
                         <>
                            <button 
                              onClick={() => toggleUserStatus(user)}
                              title={user.isActive ? "Disable User" : "Enable User"}
                              className={cn(
                                "p-3 rounded-xl transition-all border",
                                user.isActive ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white" : "bg-success/10 border-success/20 text-success hover:bg-success hover:text-white"
                              )}
                            >
                               <Power className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openModal(user.role as any, user)}
                              title="Edit User"
                              className="p-3 bg-[var(--surface-hover)] border border-[var(--glass-border)] hover:bg-purple-600 hover:text-white hover:border-purple-600 rounded-xl text-[var(--text-secondary)] transition-all"
                            >
                               <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user._id)}
                              title="Delete User"
                              className="p-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl text-red-500 transition-all"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </>
                       ) : (
                         <span className="text-[9px] font-bold text-red-500/40 uppercase tracking-widest py-3 italic">Restricted Node</span>
                       )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-40">
                      <SearchX className="w-16 h-16 text-purple-500" />
                      <div>
                        <p className="text-xl font-bold text-[var(--text-primary)] uppercase">No personnel found</p>
                        <p className="text-sm text-[var(--text-secondary)] mt-2">Try adjusting your search query</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/90 backdrop-blur-3xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[500px] liquid-glass p-12 rounded-[3rem] border-white/10 shadow-2xl overflow-hidden"
            >
              <button onClick={closeModal} className="absolute top-8 right-8 text-[var(--text-secondary)] hover:text-purple-500 transition-colors p-2 bg-white/5 rounded-full z-20">
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mb-10">
                <div className={cn(
                  "w-16 h-16 rounded-2xl border flex items-center justify-center mb-6 shadow-2xl",
                  formData.role === 'admin' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" : "bg-purple-500/10 border-purple-500/20 text-purple-500"
                )}>
                   {editingUser ? <Edit2 className="w-8 h-8" /> : formData.role === 'admin' ? <ShieldCheck className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight font-manrope">
                  {editingUser ? `Sync: ${editingUser.name}` : `Recruit ${formData.role.replace('_', ' ')}`}
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold tracking-widest uppercase mt-3 opacity-60">Authorize Intelligence Distribution</p>
              </div>

              <form onSubmit={handleSaveUser} className="space-y-6 relative z-10 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                
                <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-purple-500 ml-2">Profile Image</label>
                   <FeaturedImageUpload 
                     onChange={(url: string) => setFormData({...formData, profileImage: url})} 
                     value={formData.profileImage}
                     uploadType={formData.role === 'admin' ? 'admin' : 'author'}
                   />
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-purple-500 ml-2">Full Name</label>
                   <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Agent Identification Name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-purple-600 transition-all font-manrope"
                   />
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-bold uppercase tracking-widest text-purple-500 ml-2">Email Address</label>
                   <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="agent@newspercent.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-purple-600 transition-all font-manrope"
                   />
                </div>

                {(!editingUser || ['super_admin', 'admin'].includes(currentUserRole || '')) && (
                  <div className="space-y-3">
                     <label className="text-[10px] font-bold uppercase tracking-widest text-purple-500 ml-2">Clearance Level</label>
                     <CyberSelect 
                      value={formData.role} 
                      onChange={(val) => setFormData({...formData, role: val as any})} 
                      options={roleOptions} 
                      position="relative"
                     />
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                   <button 
                    type="button" 
                    onClick={closeModal}
                    className="flex-1 py-4 border border-white/10 text-[var(--text-secondary)] font-bold rounded-2xl hover:bg-white/5 transition-all uppercase text-[10px] tracking-widest"
                   >
                     Cancel
                   </button>
                   <button 
                    type="submit"
                    className={cn(
                      "flex-1 py-4 text-white font-bold rounded-2xl shadow-xl transition-all uppercase text-[10px] tracking-widest",
                      formData.role === 'admin' ? "bg-orange-600 hover:bg-orange-700 shadow-orange-600/20" : "bg-purple-600 hover:bg-purple-700 shadow-purple-600/20"
                    )}
                   >
                     {editingUser ? 'Update Link' : 'Confirm Access'}
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

export default TeamManagement;
