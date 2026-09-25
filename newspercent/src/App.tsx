import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './hooks/useAuthStore';
import { useToastStore } from './hooks/useToastStore';
import api from './config/api';
import Home from './pages/Home';

const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ArticleView = lazy(() => import('./pages/ArticleView'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Careers = lazy(() => import('./pages/Careers'));
const Advertise = lazy(() => import('./pages/Advertise'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const EditorialPolicy = lazy(() => import('./pages/EditorialPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const WeatherDashboard = lazy(() => import('./pages/WeatherDashboard'));

import PortalLayout from './components/PortalLayout';
const AdminOverview = lazy(() => import('./pages/AdminOverview'));
const ArticleReviewQueue = lazy(() => import('./pages/ArticleReviewQueue'));
const ContentEngine = lazy(() => import('./pages/ContentEngine'));
const AdminPublishingCommand = lazy(() => import('./pages/AdminPublishingCommand'));
const NodeManagement = lazy(() => import('./pages/NodeManagement'));
const SecurityProtocols = lazy(() => import('./pages/SecurityProtocols'));
const SystemSettings = lazy(() => import('./pages/SystemSettings'));
const CreditSettings = lazy(() => import('./pages/CreditSettings'));
const StorageSettings = lazy(() => import('./pages/StorageSettings'));
const DatabaseSettings = lazy(() => import('./pages/DatabaseSettings'));
const ExternalApiManager = lazy(() => import('./pages/ExternalApiManager'));
const RecruitmentAdmin = lazy(() => import('./pages/RecruitmentAdmin'));
const AuthorOverview = lazy(() => import('./pages/AuthorOverview'));
const CreateArticle = lazy(() => import('./pages/CreateArticle'));
const AuthorPerformance = lazy(() => import('./pages/AuthorPerformance'));
const PerformanceDashboard = lazy(() => import('./pages/PerformanceDashboard'));
const AdminPerformance = lazy(() => import('./pages/AdminPerformance'));
const AnalyticsDashboard = lazy(() => import('./pages/AnalyticsDashboard'));
const FlashNewsControl = lazy(() => import('./pages/FlashNewsControl'));
const NotFound = lazy(() => import('./pages/NotFound'));

import ToastContainer from './components/ToastContainer';
const GlobalDialogProvider = lazy(() => import('./components/ui/GlobalDialogProvider'));
import { useSystemSettingsStore } from './hooks/useSystemSettingsStore';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, token, isInitialized } = useAuthStore();
  
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[var(--background-deep)] flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-primary border-r-2 border-primary/20 rounded-full animate-spin" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();
  const { addToast } = useToastStore();
  const { fetchSettings } = useSystemSettingsStore();

  useEffect(() => {
    checkAuth();
    fetchSettings();
    
    // Server Health Check
    const checkServer = async () => {
      try {
        await api.get('/api/health');
      } catch (err: any) {
        console.error("[APP] Health check FAILURE:", err.message);
        addToast('error', 'CRITICAL', 'SERVER OFFLINE');
      }
    };
    checkServer();
  }, [checkAuth, fetchSettings, addToast]);

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
      <Suspense fallback={null}>
        <GlobalDialogProvider />
      </Suspense>
      {settings?.emergencyMode && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white z-[9999] p-2 text-center text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          MAINTENANCE MODE ACTIVE
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        </div>
      )}
      <Suspense fallback={
        <div className="min-h-screen bg-[var(--background-deep)] flex flex-col items-center justify-center gap-6">
          <div className="w-10 h-10 border-t-2 border-primary border-r-2 border-primary/20 rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Decrypting Segment...</p>
        </div>
      }>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeWithLog />} />
          <Route path="/about" element={<AboutWithLog />} />
          <Route path="/contact" element={<ContactWithLog />} />
          <Route path="/careers" element={<CareersWithLog />} />
          <Route path="/advertise" element={<AdvertiseWithLog />} />
          <Route path="/privacy" element={<PrivacyPolicyWithLog />} />
          <Route path="/editorial" element={<EditorialPolicyWithLog />} />
          <Route path="/terms" element={<TermsConditionsWithLog />} />
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
            <Route path="settings/recruitment" element={<RecruitmentAdmin />} />
          </Route>

          <Route path="/author" element={<ProtectedRoute allowedRoles={['author', 'super_admin', 'admin']}><PortalLayout role="AUTHOR" /></ProtectedRoute>}>
            <Route index element={<AuthorOverview />} />
            <Route path="new" element={<CreateArticle />} />
            <Route path="performance" element={<AuthorPerformance />} />
            <Route path="merit" element={<PerformanceDashboard />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

// Temporary log wrappers
const HomeWithLog = () => { console.log("[RENDER] Home"); return <Home />; };
const AboutWithLog = () => { console.log("[RENDER] About"); return <About />; };
const ContactWithLog = () => { console.log("[RENDER] Contact"); return <Contact />; };
const CareersWithLog = () => { console.log("[RENDER] Careers"); return <Careers />; };
const AdvertiseWithLog = () => { console.log("[RENDER] Advertise"); return <Advertise />; };
const PrivacyPolicyWithLog = () => { console.log("[RENDER] PrivacyPolicy"); return <PrivacyPolicy />; };
const EditorialPolicyWithLog = () => { console.log("[RENDER] EditorialPolicy"); return <EditorialPolicy />; };
const TermsConditionsWithLog = () => { console.log("[RENDER] TermsConditions"); return <TermsConditions />; };
const ArticleViewWithLog = () => { console.log("[RENDER] ArticleView"); return <ArticleView />; };
const CategoryPageWithLog = () => { console.log("[RENDER] CategoryPage"); return <CategoryPage />; };
const WeatherDashboardWithLog = () => { console.log("[RENDER] WeatherDashboard"); return <Suspense fallback={<div className="min-h-screen bg-[var(--background-deep)] flex items-center justify-center text-xs font-black uppercase text-[var(--text-secondary)] tracking-widest animate-pulse">Loading Weather...</div>}><WeatherDashboard /></Suspense>; };
const AdminOverviewWithLog = () => { console.log("[RENDER] AdminOverview"); return <AdminOverview />; };

export default App;
