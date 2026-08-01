import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Search, Menu, X } from 'lucide-react';
import { FaInstagram, FaYoutube, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
const LoginModal = lazy(() => import('./LoginModal'));

const SOCIAL_LINKS = {
  instagram: "https://www.instagram.com/news_percent?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
  youtube: "https://youtube.com/@newspercent?si=MSijbFoZuTzZ_UfA",
  twitter: "https://x.com/NewspercentNews?s=20",
  whatsapp: "https://whatsapp.com/channel/0029VayEkt9BKfhrtE3ncR2H",
  telegram: "https://t.me/newspercent",
  facebook: "https://www.facebook.com/profile.php?id=61573986024274",
  reddit: "https://www.reddit.com/user/Newspercent/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button"
};

const NAV_CATEGORIES = [
  { name: 'National', href: '/category/national' },
  { name: 'Global', href: '/category/global' },
  { name: 'Politics', href: '/category/politics' },
  { name: 'Business', href: '/category/business' },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Entertainment', href: '/category/entertainment' },
  { name: 'Automobile', href: '/category/automobile' },
  { name: 'Lifestyle', href: '/category/lifestyle' },
  { name: 'Movies', href: '/category/movies' },
  { name: 'Startups', href: '/category/startups' },
  { name: 'Studies', href: '/category/studies' },
  { name: 'Case Studies', href: '/category/case-studies' },
  { name: 'Technology', href: '/category/technology' },
];

let logoClickCount = 0;
let logoClickTimeout: any = null;

const MainNavbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const location = useLocation();
  const navigate = useNavigate();

  const height = useTransform(scrollY, [0, 50], [100, 75]);
  const logoScale = useTransform(scrollY, [0, 50], [1, 0.9]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (logoClickTimeout) {
      clearTimeout(logoClickTimeout);
    }
    logoClickCount += 1;
    if (logoClickCount === 3) {
      logoClickCount = 0;
      console.log("[AUTH] Secure entry point triggered");
      setIsLoginOpen(true);
    } else {
      logoClickTimeout = setTimeout(() => {
        logoClickCount = 0;
      }, 2000);
      navigate('/');
    }
  };



  const handleLinkClick = () => {
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <Suspense fallback={null}>
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </Suspense>
      
      <motion.nav
        style={{ height }}
        className={cn(
          "fixed top-0 sm:top-10 left-0 right-0 z-40 transition-all duration-300 flex items-center px-4 sm:px-10 border-b",
          isScrolled 
            ? "bg-[var(--background-deep)]/85 backdrop-blur-2xl border-[var(--glass-border)] shadow-xl light:bg-white light:backdrop-blur-none light:border-[#E8E2D8] light:shadow-sm" 
            : "bg-transparent border-transparent"
        )}
      >
        <div className="flex items-center w-full h-full justify-between">
          
          {/* COLUMN 1: BRANDING */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              to="/"
              onClick={handleLogoClick}
              className="flex items-center gap-3 select-none cursor-pointer flex-shrink-0"
            >
              <motion.div style={{ scale: logoScale }} className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-[var(--surface-hover)] light:bg-[#F9F8F6] rounded-xl sm:rounded-2xl transition-colors duration-500 flex-shrink-0">     
                  <img
                    src="/logo.webp"
                    alt="N%"
                    className="h-8 sm:h-12 w-auto min-w-[32px] sm:min-w-[48px] object-contain flex-shrink-0"
                  />
                </div>
                <div className="flex flex-col leading-none flex-shrink-0">
                  <div className="text-xl sm:text-3xl font-bold tracking-tight font-lemon-milk whitespace-nowrap">
                    <span className="text-[var(--text-primary)] font-lemon-milk">NEWS</span>
                    <span className="text-[#FFD84D] font-lemon-milk">PERCENT</span>
                  </div>
                  <span className="text-[8px] text-primary font-bold tracking-widest uppercase hidden md:block mt-1 opacity-80 whitespace-nowrap">
                    Trusted News. Real-Time Insights.
                  </span>
                </div>
              </motion.div>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 items-center relative overflow-hidden h-full px-4">
            <div 
              ref={scrollContainerRef}
              className="flex items-center gap-8 overflow-x-auto whitespace-nowrap scroll-smooth no-scrollbar w-full px-12"
            >
              {NAV_CATEGORIES.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest transition-all duration-500 relative group whitespace-nowrap px-6 py-2.5 rounded-xl border border-transparent font-manrope",
                    location.pathname === link.href 
                      ? "text-primary bg-primary/5 border-primary/20 shadow-sm light:bg-primary/10" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] light:hover:bg-[#F9F8F6]"
                  )}
                >
                  {link.name}
                  <span className={cn(
                    "absolute -bottom-px left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-primary transition-all duration-500",
                    location.pathname === link.href ? "w-1/2 shadow-[0_0_12px_rgba(255,69,58,0.6)] light:shadow-none" : "w-0 group-hover:w-4"
                  )} />
                </Link>
              ))}
            </div>
          </div>

          {/* COLUMN 3: ACTIONS & HAMBURGER */}
          <div className="flex items-center justify-end gap-2 sm:gap-4 flex-shrink-0">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 sm:p-3 bg-[var(--surface-hover)] border border-[var(--glass-border)] rounded-full hover:border-primary/40 transition-all lg:hidden"
              title="Open Navigation"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--text-primary)]" />
            </button>
            <button className="hidden lg:block p-2.5 text-[var(--text-secondary)] hover:text-primary hover:bg-primary/5 rounded-2xl transition-all duration-300 group light:hover:bg-[#F9F8F6]">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hamburger Sliding Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-45"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-[280px] sm:max-w-sm bg-[var(--background-deep)]/95 backdrop-blur-2xl border-l border-[var(--glass-border)] z-50 p-6 flex flex-col justify-between overflow-y-auto no-scrollbar font-manrope shadow-2xl"
            >
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-[var(--glass-border)]">
                  <div className="flex items-center gap-3">
                    <img src="/logo.webp" alt="Logo" className="h-8 w-auto object-contain" />
                    <span className="text-[var(--text-primary)] font-bold text-sm tracking-widest uppercase">N% NAV</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 hover:bg-[var(--surface-hover)] rounded-full transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary italic">Intelligence Categories</span>
                  <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                    {NAV_CATEGORIES.map((cat) => (
                      <Link
                        key={cat.name}
                        to={cat.href}
                        onClick={handleLinkClick}
                        className={cn(
                          "w-full text-left py-3 px-4 rounded-xl text-xs uppercase font-bold tracking-widest transition-all",
                          location.pathname === cat.href
                            ? "bg-primary/10 border border-primary/20 text-primary"
                            : "bg-[var(--background-mid)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--background-light)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-[var(--glass-border)] space-y-6">
                <div className="flex justify-around items-center">
                  <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-colors">
                    <FaInstagram className="w-5 h-5" />
                  </a>
                  <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-colors">
                    <FaYoutube className="w-5 h-5" />
                  </a>
                  <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-colors">
                    <FaXTwitter className="w-5 h-5" />
                  </a>
                  <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-colors">
                    <FaWhatsapp className="w-5 h-5" />
                  </a>
                  <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-primary transition-colors">
                    <FaTelegram className="w-5 h-5" />
                  </a>
                </div>
                <div className="text-center text-[8px] text-[var(--text-secondary)]/60 uppercase font-black tracking-widest leading-none">
                  NewsPercent © 2026. All Clearances Enforced.
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MainNavbar;
