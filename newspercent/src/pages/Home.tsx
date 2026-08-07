import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import NewsCard from '../components/NewsCard';
import { fetchNews, type NewsArticle } from '../services/newsService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnalytics } from '../hooks/useAnalytics';

import { useIsMobile } from '../hooks/useIsMobile';
import { MobileHome } from '../components/mobile/MobileHome';

interface SearchResultsSectionProps {
  query: string;
}

const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({ query }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchNews(undefined, query);
      setArticles(data);
      setLoading(false);
    };
    load();
  }, [query]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 pb-20 pt-8">
      <div className="space-y-12">
        <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
          <h2 className="text-xl sm:text-3xl font-black tracking-tight uppercase font-manrope text-[var(--text-primary)]">
            Search Results for: <span className="text-primary italic">{query}</span>
          </h2>
          <span className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] uppercase">
            {articles.length} {articles.length === 1 ? 'Result' : 'Results'} Found
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-t-2 border-primary border-r-2 border-primary/20 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Searching database...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[var(--glass-border)] rounded-[2rem]">
            <p className="text-[var(--text-secondary)] font-bold uppercase tracking-wider">No matching articles found</p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">Try adjusting your search query or keywords</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <NewsCard key={article._id || article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const isMobile = useIsMobile();
  console.log("[HOME] Rendering. isLoading:", isLoading, "isMobile:", isMobile, "searchQuery:", searchQuery);
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

        {searchQuery ? (
          /* Search Results View */
          <SearchResultsSection query={searchQuery} />
        ) : (
          /* Normal Curated Homepage View */
          <>
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
          </>
        )}
      </motion.main>

      <Footer />
    </div>
  );
};

export default Home;
