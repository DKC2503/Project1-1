import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './hooks/useAuthStore';
import { useToastStore } from './hooks/useToastStore';
import api from './config/api';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ArticleView from './pages/ArticleView';
import About from './pages/About';
import Contact from './pages/Contact';

const WeatherDashboard = lazy(() => import('./pages/WeatherDashboard'));
import PortalLayout from './components/PortalLayout';
import AdminOverview from './pages/AdminOverview';
import ArticleReviewQueue from './pages/ArticleReviewQueue';
import ContentEngine from './pages/ContentEngine';
import AdminPublishingCommand from './pages/AdminPublishingCommand';
import NodeManagement from './pages/NodeManagement';
import SecurityProtocols from './pages/SecurityProtocols';
import SystemSettings from './pages/SystemSettings';
import CreditSettings from './pages/CreditSettings';
import StorageSettings from './pages/StorageSettings';
import DatabaseSettings from './pages/DatabaseSettings';
import ExternalApiManager from './pages/ExternalApiManager';
import AuthorOverview from './pages/AuthorOverview';
import CreateArticle from './pages/CreateArticle';
import AuthorPerformance from './pages/AuthorPerformance';
import PerformanceDashboard from './pages/PerformanceDashboard';
import AdminPerformance from './pages/AdminPerformance';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import FlashNewsControl from './pages/FlashNewsControl';
import ToastContainer from './components/ToastContainer';
import LoadingScreen from './components/LoadingScreen';
import GlobalDialogProvider from './components/ui/GlobalDialogProvider';
import { useSystemSettingsStore } from './hooks/useSystemSettingsStore';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, token } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth, isInitialized, role } = useAuthStore();
  const { addToast } = useToastStore();
  const { fetchSettings } = useSystemSettingsStore();

  console.log("[APP] Starting Render. isInitialized:", isInitialized);

  useEffect(() => {
    console.log("[APP] Initial Load Effect: Running checkAuth and fetchSettings");
    checkAuth().then(() => console.log("[APP] checkAuth complete"));
    fetchSettings().then(() => console.log("[APP] fetchSettings complete"));
    
    // Server Health Check
    const checkServer = async () => {
      try {
        console.log("[APP] Health check... Ping http://localhost:5000/api/health");
        const res = await api.get('/api/health');
        console.log("[APP] Health check SUCCESS:", res.data);
      } catch (err: any) {
        console.error("[APP] Health check FAILURE:", err.message);
        addToast('error', 'CRITICAL', 'SERVER OFFLINE');
      }
    };
    checkServer();
  }, [checkAuth, fetchSettings, addToast]);

  if (!isInitialized) {
    console.log("[APP] isInitialized is FALSE. Showing LoadingScreen.");
    return <LoadingScreen onComplete={() => {
      console.log("[APP] LoadingScreen onComplete triggered. Proceeding to App content.");
    }} />;
  }

  console.log("[APP] isInitialized is TRUE. Rendering Router. User Role:", role);

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

let wasPortal = false;

function AppContent() {
  const location = useLocation();
  const { settings } = useSystemSettingsStore();
  console.log("[ROUTER] Current Route:", location.pathname);

  useEffect(() => {
    const isPortalRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/author');
    if (isPortalRoute) {
      if (!wasPortal) {
        localStorage.setItem('portal-theme', 'dark');
        wasPortal = true;
      }
      const savedTheme = localStorage.getItem('portal-theme') || 'dark';
      document.documentElement.classList.toggle('light', savedTheme === 'light');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      wasPortal = false;
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [location.pathname]);

  return (
    <>
      <ToastContainer />
      <GlobalDialogProvider />
      {settings?.emergencyMode && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white z-[9999] p-2 text-center text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          MAINTENANCE MODE ACTIVE
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </div>
      )}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomeWithLog />} />
        <Route path="/about" element={<AboutWithLog />} />
        <Route path="/contact" element={<ContactWithLog />} />
        <Route path="/article/:id" element={<ArticleViewWithLog />} />
        <Route path="/category/:slug" element={<CategoryPageWithLog />} />
        <Route path="/weather" element={<WeatherDashboardWithLog />} />

        {/* Unified Portal (Roles handled within Layout/Routes) */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['super_admin', 'admin', 'editor', 'reviewer']}><PortalLayout role="ADMIN" /></ProtectedRoute>}>
          <Route index element={<AdminOverviewWithLog />} />
          <Route path="pending" element={<ArticleReviewQueue />} />
          <Route path="studio" element={<AdminPublishingCommand />} />
          <Route path="articles" element={<ContentEngine />} />
          <Route path="flash-news" element={<FlashNewsControl />} />
          <Route path="users" element={<NodeManagement />} />
          <Route path="history" element={<SecurityProtocols />} />
          <Route path="merit" element={<AdminPerformance />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="settings/system" element={<SystemSettings />} />
          <Route path="settings/credits" element={<CreditSettings />} />
          <Route path="settings/storage" element={<StorageSettings />} />
          <Route path="settings/database" element={<DatabaseSettings />} />
          <Route path="settings/external-apis" element={<ExternalApiManager />} />
        </Route>

        <Route path="/author" element={<ProtectedRoute allowedRoles={['author', 'super_admin', 'admin']}><PortalLayout role="AUTHOR" /></ProtectedRoute>}>
          <Route index element={<AuthorOverview />} />
          <Route path="new" element={<CreateArticle />} />
          <Route path="performance" element={<AuthorPerformance />} />
          <Route path="merit" element={<PerformanceDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// Temporary log wrappers
const HomeWithLog = () => { console.log("[RENDER] Home"); return <Home />; };
const AboutWithLog = () => { console.log("[RENDER] About"); return <About />; };
const ContactWithLog = () => { console.log("[RENDER] Contact"); return <Contact />; };
const ArticleViewWithLog = () => { console.log("[RENDER] ArticleView"); return <ArticleView />; };
const CategoryPageWithLog = () => { console.log("[RENDER] CategoryPage"); return <CategoryPage />; };
const WeatherDashboardWithLog = () => { console.log("[RENDER] WeatherDashboard"); return <Suspense fallback={<div className="min-h-screen bg-[var(--background-deep)] flex items-center justify-center text-xs font-black uppercase text-[var(--text-secondary)] tracking-widest animate-pulse">Loading Weather...</div>}><WeatherDashboard /></Suspense>; };
const AdminOverviewWithLog = () => { console.log("[RENDER] AdminOverview"); return <AdminOverview />; };

export default App;
