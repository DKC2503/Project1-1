import { useState } from 'react';
import SiteHeader from '../components/SiteHeader';
import CategoryNav from '../components/CategoryNav';
import StockTicker from '../components/StockTicker';
import FlashNewsTicker from '../components/FlashNewsTicker';
import Footer from '../components/Footer';
import LoadingScreen from '../components/LoadingScreen';
import HeroSection from '../sections/HeroSection';
import LatestNewsSection from '../sections/LatestNewsSection';
import CategoryFeed from '../sections/CategoryFeed';
import EditorsPickSection from '../sections/EditorsPickSection';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';

import { useIsMobile } from '../hooks/useIsMobile';
import { MobileHome } from '../components/mobile/MobileHome';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  console.log("[HOME] Rendering. isLoading:", isLoading, "isMobile:", isMobile);
  useAnalytics();

  if (isMobile) {
    return <MobileHome />;
  }

  return (
    <div className="relative min-h-screen bg-[var(--background-deep)] transition-colors duration-300">
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen onComplete={() => {
            console.log("[HOME] LoadingScreen complete. Setting isLoading to false.");
            setIsLoading(false);
          }} />
        )}
      </AnimatePresence>
      
      {/* HEADER SECTION */}
      <SiteHeader />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Stock Ticker */}
        <StockTicker />

        {/* 1. Category Navigation */}
        <CategoryNav />

        {/* 2. Flash News Ticker (Below Categories) */}
        <FlashNewsTicker />

        {/* 3. Hero Section (15/70/15 Layout) */}
        <HeroSection />
        
        {/* 4. Latest News Feed */}
        <div className="py-12 border-t border-[var(--glass-border)]">
          <LatestNewsSection />
        </div>

        {/* 5. Top Headlines & Editor's Picks */}
        <EditorsPickSection />

        {/* 6. Specific Categories */}
        <div className="space-y-24 pb-24">
          <CategoryFeed category="National" />
          <CategoryFeed category="Global" />
          <CategoryFeed category="Politics" />
          <CategoryFeed category="Business" />
          <CategoryFeed category="Sports" />
          <CategoryFeed category="Entertainment" />
        </div>
      </motion.main>

      <Footer />
    </div>
  );
};

export default Home;
