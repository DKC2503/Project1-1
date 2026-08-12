import React, { Suspense } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Newspaper, 
  Briefcase, 
  Users, 
  User, 
  LogOut, 
  Shield, 
  FileSearch, 
  Database, 
  ChevronRight, 
  ChevronDown, 
  ShieldCheck, 
  Award, 
  Settings, 
  Zap, 
  TrendingUp, 
  Sun, 
  Moon, 
  Bell, 
  Menu, 
  X, 
  Loader2,
  CheckCircle2,
  Check,
  CheckCheck,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../hooks/useAuthStore';
import { useDialogStore } from '../hooks/useDialogStore';
import { useToastStore } from '../hooks/useToastStore';
import { cn } from '../lib/utils';
import api from '../config/api';

interface UserAvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  portalTheme?: 'dark' | 'light';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, size = 'md', portalTheme = 'dark' }) => {
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
          "rounded-full object-cover border shadow-inner shrink-0",
          sizeClasses[size],
          portalTheme === 'light' ? "border-[#E5E7EB]" : "border-[var(--glass-border)]"
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

const getNotificationMeta = (notif: { title?: string; message?: string }) => {
  const title = (notif.title || '').toLowerCase();
  const msg = (notif.message || '').toLowerCase();

  if (title.includes('breaking') || msg.includes('breaking')) {
    return {
      type: 'BREAKING ARTICLE',
      icon: Zap,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10 border-primary/25',
      glowGradient: 'from-primary/15'
    };
  }
  if (title.includes('approved') || msg.includes('approved') || title.includes('published') || msg.includes('published')) {
    return {
      type: 'ARTICLE APPROVED',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/25',
      glowGradient: 'from-emerald-500/15'
    };
  }
  if (title.includes('rejected') || msg.includes('rejected') || title.includes('revision') || msg.includes('revision') || title.includes('resubmit')) {
    return {
      type: title.includes('revision') ? 'REVISION REQUESTED' : title.includes('resubmit') ? 'ARTICLE RESUBMITTED' : 'ARTICLE REJECTED',
      icon: AlertTriangle,
      iconColor: 'text-rose-400',
      iconBg: 'bg-rose-500/10 border-rose-500/25',
      glowGradient: 'from-rose-500/15'
    };
  }
  if (title.includes('submitted') || msg.includes('submitted') || title.includes('review') || msg.includes('review')) {
    return {
      type: 'NEW ARTICLE SUBMITTED',
      icon: FileText,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/25',
      glowGradient: 'from-amber-500/15'
    };
  }
  return {
    type: 'SYSTEM NOTIFICATION',
    icon: Bell,
    iconColor: 'text-[var(--text-secondary)]',
    iconBg: 'bg-white/5 border-white/10',
    glowGradient: 'from-white/5'
  };
};

const formatNotificationTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (60 * 1000));
  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffMins < 1) return 'JUST NOW';
  if (diffMins < 60) return `${diffMins}M`;
  if (diffHours < 24) return `${diffHours}H`;
  if (diffDays === 1) return '1D';
  if (diffDays < 7) return `${diffDays}D`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase();
};

interface PortalLayoutProps {
  role: 'ADMIN' | 'AUTHOR';
}

const PortalLayout: React.FC<PortalLayoutProps> = ({ role }) => {
  const { role: storedRole, user, logout } = useAuthStore();
  const dialog = useDialogStore();
  const { addToast } = useToastStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [portalTheme, setPortalTheme] = React.useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('portal-theme') as 'dark' | 'light') || 'dark';
  });

  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = React.useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Identity Settings Modal State
  const [identityModalOpen, setIdentityModalOpen] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [identitySaving, setIdentitySaving] = React.useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data ?? []);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds for live updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (showNotifDropdown && !(e.target as HTMLElement).closest('.notifications-container')) {
        setShowNotifDropdown(false);
      }
      if (showAccountDropdown && !(e.target as HTMLElement).closest('.account-dropdown-container')) {
        setShowAccountDropdown(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNotifDropdown(false);
        setShowAccountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifDropdown, showAccountDropdown]);

  React.useEffect(() => {
    setShowNotifDropdown(false);
    setShowAccountDropdown(false);
  }, [location.pathname]);

  const unreadCount = (notifications ?? []).filter(n => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  React.useEffect(() => {
    // Apply portal theme on mount and change
    document.documentElement.classList.toggle('light', portalTheme === 'light');
    document.documentElement.classList.toggle('dark', portalTheme === 'dark');
    localStorage.setItem('portal-theme', portalTheme);

    return () => {
      // Restore public website theme on unmount
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    };
  }, [portalTheme]);

  const togglePortalTheme = () => {
    setPortalTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  if (!storedRole || !user) {
    return <Navigate to="/" replace />;
  }

  // Permission Logic
  const canAccessAdmin = ['super_admin', 'admin', 'editor', 'reviewer'].includes(storedRole);
  const canAccessAuthor = ['author', 'admin', 'super_admin'].includes(storedRole);

  if (role === 'ADMIN' && !canAccessAdmin) return <Navigate to="/" replace />;
  if (role === 'AUTHOR' && !canAccessAuthor) return <Navigate to="/" replace />;

  const allAdminLinks = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, color: 'text-primary', roles: ['super_admin', 'admin'] },
    { name: 'Editorial Queue', href: '/admin/pending', icon: FileSearch, color: 'text-orange-500', roles: ['super_admin', 'admin', 'editor', 'reviewer'] },
    { name: 'Publishing Center', href: '/admin/studio', icon: Newspaper, color: 'text-red-500', roles: ['super_admin', 'admin', 'editor'] },
    { name: 'Content Manager', href: '/admin/articles', icon: Database, color: 'text-blue-500', roles: ['super_admin', 'admin', 'editor'] },
    { name: 'Flash News', href: '/admin/flash-news', icon: Zap, color: 'text-orange-500', roles: ['super_admin', 'admin'] },
    { name: 'Analytics', href: '/admin/analytics', icon: LayoutDashboard, color: 'text-success', roles: ['super_admin', 'admin'] },
    { name: 'Users & Roles', href: '/admin/users', icon: Users, color: 'text-purple-500', roles: ['super_admin', 'admin'] },
    { name: 'Performance & Credits', href: `/${role?.toLowerCase() || 'author'}/merit`, icon: Award, color: 'text-orange-500', roles: ['super_admin', 'admin', 'editor', 'reviewer', 'author'] },
    { name: 'Security Logs', href: '/admin/history', icon: Shield, color: 'text-cyan-500', roles: ['super_admin', 'admin'] },
    { name: 'Credit Settings', href: '/admin/settings/credits', icon: Zap, color: 'text-yellow-500', roles: ['super_admin'] },
    { name: 'System Settings', href: '/admin/settings/system', icon: Settings, color: 'text-primary', roles: ['super_admin'] },
    { name: 'Storage Management', href: '/admin/settings/storage', icon: Database, color: 'text-green-500', roles: ['super_admin', 'admin'] },
    { name: 'Database Settings', href: '/admin/settings/database', icon: Database, color: 'text-blue-500', roles: ['super_admin', 'admin'] },
    { name: 'External API Manager', href: '/admin/settings/external-apis', icon: Settings, color: 'text-orange-500', roles: ['super_admin', 'admin'] },
    { name: 'Recruitment', href: '/admin/settings/recruitment', icon: Briefcase, color: 'text-amber-500', roles: ['super_admin', 'admin'] },
  ];

  const authorLinks = [
    { name: 'My Dashboard', href: '/author', icon: LayoutDashboard, color: 'text-primary' },
    { name: 'Performance', href: '/author/performance', icon: TrendingUp, color: 'text-success' },
    { name: 'New Article', href: '/author/new', icon: Newspaper, color: 'text-orange-500' },
  ];

  const links = role === 'ADMIN' 
    ? allAdminLinks.filter(l => l.roles.includes(storedRole)) 
    : authorLinks;

  const handleLogout = async () => {
    const confirmed = await dialog.confirm('Are you sure you want to sign out?', 'Sign Out', 'Sign Out', 'Cancel');
    if (confirmed) {
      logout();
      navigate('/');
    }
  };

  const handleSaveIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      addToast('error', 'INPUT REQUIRED', 'Please enter a display name.');
      return;
    }
    try {
      setIdentitySaving(true);
      const res = await api.put('/api/users/profile/name', { name: editName.trim() });
      useAuthStore.getState().updateUser(res.data.user);
      addToast('success', 'IDENTITY UPDATED', 'Your display name has been successfully updated.');
      setIdentityModalOpen(false);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Failed to update display name.';
      addToast('error', 'UPDATE FAILED', errMsg);
    } finally {
      setIdentitySaving(false);
    }
  };

  return (
    <div className="portal-container relative min-h-screen bg-[var(--background-deep)] flex overflow-hidden">

      {/* Portal Sidebar (Desktop) */}
      <aside className={cn(
        "hidden lg:flex w-80 h-screen sticky top-0 flex-col p-8 z-50 transition-all duration-300 flex-shrink-0",
        portalTheme === 'light' 
          ? "bg-white border-r border-[#E5E7EB] shadow-[1px_0_10px_rgba(0,0,0,0.02)]" 
          : "bg-[var(--background-deep)]/40 backdrop-blur-3xl border-r border-[var(--glass-border)]"
      )}>
        <div 
          className="flex items-center gap-4 mb-16 group cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <img src="/logo.webp" alt="N%" className="h-10 w-auto group-hover:scale-110 transition-transform" />
          <div className="flex flex-col leading-none">
            <div className="text-xl font-bold tracking-tighter font-manrope">
              <span className="text-[var(--text-primary)]">NEWS</span>
              <span className="text-[#FFD84D]">PERCENT</span>
            </div>
            <span className="text-[8px] text-primary font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-2.5 h-2.5" />
              {storedRole?.includes('admin') || ['editor', 'reviewer'].includes(storedRole || '') ? 'ADMINISTRATION' : 'AUTHOR CENTER'}
            </span>
          </div>
        </div>

        <nav className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <motion.div key={link.name} whileHover={{ x: 5 }}>
                <button
                  onClick={() => navigate(link.href)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? (portalTheme === 'light' 
                          ? "bg-primary/5 border border-primary/10 text-primary" 
                          : "bg-[var(--glass)] border border-[var(--glass-border)] shadow-2xl") 
                      : (portalTheme === 'light' 
                          ? "text-[#555555] hover:bg-[#F9F8F6] hover:text-[#111111]" 
                          : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]")
                  )}
                >
                  {isActive && portalTheme !== 'light' && (
                    <motion.div 
                      layoutId="activeGlow"
                      className={cn("absolute inset-0 bg-gradient-to-r opacity-10", 
                        link.color === 'text-primary' ? 'from-red-500' :
                        link.color === 'text-orange-500' ? 'from-orange-500' :
                        link.color === 'text-blue-500' ? 'from-blue-500' :
                        link.color === 'text-success' ? 'from-green-500' :
                        link.color === 'text-purple-500' ? 'from-purple-500' : 'from-cyan-500'
                      )} 
                    />
                  )}
                  <div className="flex items-center gap-4 relative z-10 text-left">
                    <Icon className={cn("w-5 h-5 transition-colors", isActive ? link.color : "group-hover:" + link.color)} />
                    <span className={cn("text-[10px] font-normal uppercase tracking-widest transition-colors", isActive ? "text-[var(--text-primary)]" : "group-hover:text-[var(--text-primary)]")}>
                      {link.name}
                    </span>
                  </div>
                  {isActive && <ChevronRight className={cn("w-4 h-4 relative z-10", link.color)} />}
                </button>
              </motion.div>
            );
          })}
        </nav>
      </aside>

      {/* Portal Sidebar (Mobile/Tablet Drawer) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed inset-y-0 left-0 w-80 h-full flex flex-col p-8 z-[100] transition-all duration-300 lg:hidden shadow-2xl",
                portalTheme === 'light' 
                  ? "bg-white border-r border-[#E5E7EB]" 
                  : "bg-[#0D0D11]/95 backdrop-blur-3xl border-r border-white/10"
              )}
            >
              {/* Close Button */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[var(--surface-hover)] transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>

              <div 
                className="flex items-center gap-4 mb-16 group cursor-pointer" 
                onClick={() => { navigate('/'); setIsSidebarOpen(false); }}
              >
                <img src="/logo.webp" alt="N%" className="h-10 w-auto group-hover:scale-110 transition-transform" />
                <div className="flex flex-col leading-none">
                  <div className="text-xl font-bold tracking-tighter font-manrope">
                    <span className="text-[var(--text-primary)]">NEWS</span>
                    <span className="text-[#FFD84D]">PERCENT</span>
                  </div>
                  <span className="text-[8px] text-primary font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {storedRole?.includes('admin') || ['editor', 'reviewer'].includes(storedRole || '') ? 'ADMINISTRATION' : 'AUTHOR CENTER'}
                  </span>
                </div>
              </div>

              <nav className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {links.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.href;
                  return (
                    <motion.div key={link.name} whileHover={{ x: 5 }}>
                      <button
                        onClick={() => { navigate(link.href); setIsSidebarOpen(false); }}
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                          isActive 
                            ? (portalTheme === 'light' 
                                ? "bg-primary/5 border border-primary/10 text-primary" 
                                : "bg-[var(--glass)] border border-[var(--glass-border)] shadow-2xl") 
                            : (portalTheme === 'light' 
                                ? "text-[#555555] hover:bg-[#F9F8F6] hover:text-[#111111]" 
                                : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]")
                        )}
                      >
                        {isActive && portalTheme !== 'light' && (
                          <motion.div 
                            layoutId="activeGlowMobile"
                            className={cn("absolute inset-0 bg-gradient-to-r opacity-10", 
                              link.color === 'text-primary' ? 'from-red-500' :
                              link.color === 'text-orange-500' ? 'from-orange-500' :
                              link.color === 'text-blue-500' ? 'from-blue-500' :
                              link.color === 'text-success' ? 'from-green-500' :
                              link.color === 'text-purple-500' ? 'from-purple-500' : 'from-cyan-500'
                            )} 
                          />
                        )}
                        <div className="flex items-center gap-4 relative z-10 text-left">
                          <Icon className={cn("w-5 h-5 transition-colors", isActive ? link.color : "group-hover:" + link.color)} />
                          <span className={cn("text-[10px] font-normal uppercase tracking-widest transition-colors", isActive ? "text-[var(--text-primary)]" : "group-hover:text-[var(--text-primary)]")}>
                            {link.name}
                          </span>
                        </div>
                        {isActive && <ChevronRight className={cn("w-4 h-4 relative z-10", link.color)} />}
                      </button>
                    </motion.div>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Dashboard Top Header Bar */}
        <header className={cn(
          "h-20 border-b flex items-center justify-between px-4 sm:px-12 shrink-0 relative z-50 transition-all duration-300",
          portalTheme === 'light' 
            ? "bg-white/95 backdrop-blur-md border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.02)]" 
            : "bg-[var(--background-deep)]/70 backdrop-blur-xl border-[var(--glass-border)]"
        )}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-hover)]/30 text-[var(--text-primary)] hover:border-primary/40 transition-all shrink-0 cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
              portalTheme === 'light' ? "text-[#555555] opacity-80" : "text-[var(--text-secondary)] opacity-60"
            )}>
              NewsPercent CMS Hub
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Notifications Widget */}
            <div className="relative notifications-container">
              <button 
                onClick={() => setShowNotifDropdown(prev => !prev)}
                className={cn(
                  "p-2.5 rounded-full border transition-all duration-300 flex items-center justify-center relative select-none cursor-pointer outline-none",
                  portalTheme === 'light'
                    ? "bg-[#F9F8F6] border-[#E5E7EB] text-[#555555] hover:text-primary hover:border-primary/30"
                    : "bg-white/[0.04] border-white/10 text-[var(--text-secondary)] hover:text-white hover:border-white/20 hover:bg-white/[0.08]",
                  showNotifDropdown && (portalTheme === 'light' 
                    ? "border-primary text-primary bg-primary/5 ring-2 ring-primary/10" 
                    : "border-primary/50 text-primary bg-primary/10 ring-2 ring-primary/20")
                )}
                title="Notifications"
                aria-label="Toggle notifications"
                aria-expanded={showNotifDropdown}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[9px] font-black flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-[var(--background-deep)] light:border-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "fixed inset-x-4 top-[84px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:w-[440px]",
                      "rounded-[24px] border shadow-[0_24px_60px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.06)_inset,0_1px_0_0_rgba(255,255,255,0.12)_inset]",
                      "flex flex-col z-[100] overflow-hidden select-none",
                      portalTheme === 'light'
                        ? "bg-white/95 backdrop-blur-2xl border-[#E5E7EB] text-[#111111] shadow-[0_20px_50px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)_inset]"
                        : "bg-[#0B0B0E]/90 backdrop-blur-2xl border-white/10 text-white"
                    )}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] light:border-[#E5E7EB] bg-white/[0.02] light:bg-black/[0.02]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] font-manrope text-[var(--text-primary)]">
                          NOTIFICATIONS
                        </span>
                        {unreadCount > 0 ? (
                          <span className="min-w-[20px] h-5 px-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary/20 text-primary border border-primary/30 flex items-center justify-center shadow-[0_0_12px_rgba(255,77,45,0.2)]">
                            {unreadCount}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 light:text-emerald-600 border border-emerald-500/20">
                            ALL READ
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setShowNotifDropdown(false)}
                        className="p-1.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/[0.06] light:hover:bg-black/[0.05] transition-colors"
                        title="Close panel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Scrollable Notification List */}
                    <div className="max-h-[380px] overflow-y-auto p-3 space-y-2 glass-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] light:bg-black/[0.03] border border-white/10 light:border-black/10 flex items-center justify-center text-[var(--text-secondary)]">
                            <Bell className="w-5 h-5 opacity-40" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[11px] font-black uppercase tracking-[0.15em] text-[var(--text-primary)]">
                              No Notifications
                            </p>
                            <p className="text-[10px] text-[var(--text-secondary)] opacity-70 tracking-wide">
                              You're all caught up with editorial updates.
                            </p>
                          </div>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const meta = getNotificationMeta(notif);
                          const Icon = meta.icon;
                          return (
                            <div 
                              key={notif._id}
                              onClick={() => {
                                if (!notif.isRead) handleMarkAsRead(notif._id);
                              }}
                              className={cn(
                                "group relative p-3.5 rounded-[18px] transition-all duration-200 cursor-pointer text-left border overflow-hidden",
                                notif.isRead 
                                  ? (portalTheme === 'light' 
                                      ? "bg-transparent border-transparent hover:bg-black/[0.03] text-[#555555]" 
                                      : "bg-transparent border-transparent hover:bg-white/[0.03] text-[var(--text-secondary)] opacity-70 hover:opacity-100")
                                  : (portalTheme === 'light' 
                                      ? "bg-primary/[0.04] border-primary/20 text-[#111111] shadow-[0_2px_8px_rgba(255,77,45,0.06)]" 
                                      : "bg-white/[0.05] border-white/[0.12] text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:bg-white/[0.08]")
                              )}
                            >
                              {/* Unread subtle accent gradient */}
                              {!notif.isRead && (
                                <div className={cn("absolute inset-0 bg-gradient-to-r opacity-5 pointer-events-none", meta.glowGradient)} />
                              )}

                              <div className="flex items-start gap-3 relative z-10">
                                {/* Icon Pill */}
                                <div className={cn(
                                  "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105",
                                  meta.iconBg
                                )}
                                >
                                  <Icon className={cn("w-4 h-4", meta.iconColor)} />
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 min-w-0">
                                  {/* Type and Timestamp row */}
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      {!notif.isRead && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary ring-2 ring-primary/30 shrink-0" />
                                      )}
                                      <span className={cn(
                                        "text-[8px] font-black uppercase tracking-widest truncate",
                                        notif.isRead ? "text-[var(--text-secondary)] opacity-70" : "text-primary font-extrabold"
                                      )}>
                                        {meta.type}
                                      </span>
                                    </div>
                                    <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-secondary)] opacity-60 shrink-0 font-mono">
                                      {formatNotificationTime(notif.createdAt)}
                                    </span>
                                  </div>

                                  {/* Title */}
                                  <h4 className={cn(
                                    "text-[11px] uppercase tracking-wide leading-snug truncate",
                                    notif.isRead 
                                      ? "font-bold text-[var(--text-secondary)]" 
                                      : "font-black text-[var(--text-primary)]"
                                  )}>
                                    {notif.title}
                                  </h4>

                                  {/* Description */}
                                  <p className={cn(
                                    "text-[10px] leading-relaxed mt-0.5 line-clamp-2",
                                    notif.isRead
                                      ? "text-[var(--text-secondary)] opacity-70 font-normal"
                                      : "text-[var(--text-secondary)] font-medium"
                                  )}>
                                    {notif.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-white/[0.08] light:border-[#E5E7EB] bg-white/[0.02] light:bg-black/[0.02] flex items-center justify-center">
                      {unreadCount > 0 ? (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="w-full py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.18em] text-primary hover:text-white bg-primary/[0.08] hover:bg-primary border border-primary/20 hover:border-primary shadow-[0_2px_12px_rgba(255,77,45,0.1)] hover:shadow-[0_4px_20px_rgba(255,77,45,0.35)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          MARK ALL AS READ
                        </button>
                      ) : (
                        <div className="py-1 text-center">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] opacity-40 flex items-center justify-center gap-1.5">
                            <Check className="w-3 h-3 text-primary" /> ALL NOTIFICATIONS READ
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={togglePortalTheme}
              className={cn(
                "p-2.5 rounded-full border transition-all flex items-center justify-center",
                portalTheme === 'light'
                  ? "bg-[#F9F8F6] border-[#E5E7EB] text-[#555555] hover:text-primary hover:border-primary/30"
                  : "bg-[var(--surface-hover)] border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-primary"
              )}
              title={`Switch to ${portalTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {portalTheme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </button>

            {/* Profile / Account Dropdown Menu */}
            <div className="relative account-dropdown-container">
              <button 
                onClick={() => setShowAccountDropdown(prev => !prev)}
                className={cn(
                  "flex items-center gap-2.5 pl-4 border-l transition-all select-none cursor-pointer group outline-none py-1.5",
                  portalTheme === 'light' 
                    ? "border-l-[#E5E7EB] hover:opacity-85" 
                    : "border-l-[var(--glass-border)] hover:opacity-85"
                )}
                title="Account Menu"
              >
                <UserAvatar src={user?.profileImage} name={user?.name} size="sm" portalTheme={portalTheme} />
                <span className="hidden md:inline text-xs font-extrabold text-[var(--text-primary)] uppercase truncate max-w-[120px] font-manrope">
                  {user?.name}
                </span>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-[var(--text-secondary)] opacity-60 transition-transform duration-300",
                  showAccountDropdown && "transform rotate-180"
                )} />
              </button>

              <AnimatePresence>
                {showAccountDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      "absolute right-0 mt-3 w-64 rounded-3xl border shadow-2xl p-5 z-[100] transition-all",
                      portalTheme === 'light'
                        ? "bg-white border-[#E5E7EB] text-[#333333]"
                        : "bg-[var(--card-bg)] border-[var(--glass-border)] text-[var(--text-primary)]"
                    )}
                  >
                    {/* Header info inside dropdown */}
                    <div className="flex items-center gap-3.5 pb-4 mb-3 border-b border-[var(--glass-border)] light:border-b-[#E5E7EB] overflow-hidden">
                      <UserAvatar src={user?.profileImage} name={user?.name} size="md" portalTheme={portalTheme} />
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="text-xs font-black text-[var(--text-primary)] uppercase truncate font-manrope">
                          {user?.name}
                        </span>
                        <span className="text-[8px] text-[var(--text-secondary)] font-extrabold uppercase tracking-widest mt-1 opacity-60">
                          {storedRole?.includes('admin') || ['editor', 'reviewer'].includes(storedRole || '') ? 'ADMINISTRATOR' : 'AUTHOR'}
                        </span>
                      </div>
                    </div>

                    {/* Actions list */}
                    <div className="space-y-1">
                      <button 
                        onClick={() => {
                          setShowAccountDropdown(false);
                          setEditName(user?.name || '');
                          setIdentityModalOpen(true);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 text-left text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all",
                          portalTheme === 'light' 
                            ? "hover:bg-[#F9F8F6] text-[#555555] hover:text-[#111111]" 
                            : "hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-white"
                        )}
                      >
                        <User className="w-4 h-4 text-primary" /> Identity Settings
                      </button>

                      <div className="h-[1px] my-2 bg-[var(--glass-border)] light:bg-[#E5E7EB]" />

                      <button 
                        onClick={() => {
                          setShowAccountDropdown(false);
                          handleLogout();
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 text-left text-[10px] font-black uppercase tracking-widest rounded-xl transition-all text-red-500",
                          portalTheme === 'light' 
                            ? "hover:bg-red-50/50" 
                            : "hover:bg-red-500/10"
                        )}
                      >
                        <LogOut className="w-4 h-4 text-red-500" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Main Pages Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-12 custom-scrollbar relative z-10">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">Syncing Segment...</p>
              </div>
            }>
              <Outlet />
            </Suspense>
          </motion.div>
        </main>
      </div>

      {/* Identity Settings Modal */}
      <AnimatePresence>
        {identityModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !identitySaving && setIdentityModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "relative w-full max-w-md border p-6 sm:p-8 rounded-[2rem] shadow-2xl z-10 space-y-6",
                portalTheme === 'light'
                  ? "bg-white border-[#E5E7EB] text-[#333333]"
                  : "bg-[#0D0D11]/90 border-white/10 text-white"
              )}
            >
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  <User className="w-6 h-6 text-primary" /> Identity Settings
                </h3>
                <p className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest mt-1">
                  Change display name only
                </p>
              </div>

              <form onSubmit={handleSaveIdentity} className="space-y-4">
                {/* Current Name display */}
                <div className="space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Current Name</span>
                  <div className="text-sm font-extrabold uppercase font-mono tracking-wider">
                    {user?.name}
                  </div>
                </div>

                {/* Name Edit Input */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-primary">
                    New Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. KARTHIK"
                    disabled={identitySaving}
                    className={cn(
                      "w-full rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-primary transition-all font-mono",
                      portalTheme === 'light'
                        ? "bg-[#F9F8F6] border border-[#E5E7EB] text-[#333333]"
                        : "bg-white/5 border border-white/10 text-white"
                    )}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIdentityModalOpen(false)}
                    disabled={identitySaving}
                    className={cn(
                      "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all",
                      portalTheme === 'light'
                        ? "bg-[#F9F8F6] hover:bg-[#F0EEEB] text-[#555555] border border-[#E5E7EB]"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={identitySaving || !editName.trim() || editName.trim() === user?.name}
                    className="flex-1 py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center transition-all text-white"
                  >
                    {identitySaving ? 'Saving...' : 'Save Changes'}
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

export default PortalLayout;
