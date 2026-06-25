import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

import TopHeader from '../components/TopHeader';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import TrendingTopics from '../components/TrendingTopics';
import LatestNewsSection from '../sections/LatestNewsSection';
import NewsCard from '../components/NewsCard';
import LoadingAction from '../components/LoadingAction';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchNews, type NewsArticle } from '../services/newsService';
import { useThemeStore } from '../hooks/useThemeStore';
import { useAnalytics } from '../hooks/useAnalytics';
import { analyticsService } from '../services/analyticsService';

interface CategoryConfig {
  name: string;
  accent: string;
  description: string;
  layout: 'standard' | 'academic' | 'analysis';
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  national: { name: 'National', accent: '#FF3B30', description: 'In-depth coverage of regional developments and nationwide policies.', layout: 'standard' },
  global: { name: 'Global', accent: '#007AFF', description: 'Real-time updates from international corridors and global power shifts.', layout: 'standard' },
  politics: { name: 'Politics', accent: '#6B21A8', description: 'Diplomatic maneuvers, legislative battles, and executive power plays.', layout: 'standard' },
  business: { name: 'Business', accent: '#1D4ED8', description: 'Market intelligence, economic forecasts, and corporate strategy.', layout: 'standard' },
  sports: { name: 'Sports', accent: '#00D26A', description: 'From the field to the boardroom: every goal, every victory.', layout: 'standard' },
  entertainment: { name: 'Entertainment', accent: '#DB2777', description: 'Cultural icons, cinematic shifts, and the digital zeitgeist.', layout: 'standard' },
  automobile: { name: 'Automobile', accent: '#FF9500', description: 'The future of mobility: electric shifts and high-performance engineering.', layout: 'standard' },
  lifestyle: { name: 'Lifestyle', accent: '#AF52DE', description: 'Modern living, wellness, and the culture of tomorrow.', layout: 'standard' },
  movies: { name: 'Movies', accent: '#FF2D55', description: 'Cinematic insights, industry shifts, and digital storytelling.', layout: 'standard' },
  startups: { name: 'Startups', accent: '#5856D6', description: 'The engine of innovation: founding, scaling, and disrupting.', layout: 'standard' },
  studies: { name: 'Studies', accent: '#C89B3C', description: 'Academic research, scientific breakthroughs, and pedagogical shifts.', layout: 'academic' },
  'case-studies': { name: 'Case Studies', accent: '#34C759', description: 'Strategic deep-dives into successful business models and failures.', layout: 'analysis' },
  technology: { name: 'Technology', accent: '#D92D20', description: 'Computing, artificial intelligence, and the silicon frontier.', layout: 'standard' },
};

import { useIsMobile } from '../hooks/useIsMobile';
import { MobileCategoryView } from '../components/mobile/MobileCategoryView';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { setIsLoading } = useThemeStore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const config = CATEGORY_CONFIGS[slug || 'national'] || CATEGORY_CONFIGS.national;
  const isMobile = useIsMobile();

  useAnalytics(undefined, config.name);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      analyticsService.track({
        type: 'SEARCH',
        searchQuery: searchQuery.trim(),
        category: config.name
      });
    }
  };

  useEffect(() => {
    const loadCategory = async () => {
      setIsLoading(true);
      // Simulate network delay for premium feel and to show loading action
      await new Promise(resolve => setTimeout(resolve, 1200));
      const data = await fetchNews(config.name);
      setArticles(data);
      setIsLoading(false);
      window.scrollTo(0, 0);
    };

    loadCategory();
  }, [slug, config.name, setIsLoading]);

  if (isMobile) {
    return (
      <MobileCategoryView
        categoryName={config.name}
        categoryDescription={config.description}
        initialArticles={articles}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--background-deep)] transition-colors duration-300">
      <LoadingAction />

      
      <TopHeader />
      <MainNavbar />

      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="pt-32"
      >
        {/* Category Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 lg:items-end">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1" style={{ backgroundColor: config.accent }} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: config.accent }}>
                  Intelligence Feed
                </span>
              </div>
              <h1 className="text-5xl md:text-8xl font-normal tracking-tighter uppercase text-[var(--text-primary)] mb-6">
                {config.name}
              </h1>
              <p className="text-[var(--text-secondary)] text-xl max-w-2xl leading-relaxed font-medium">
                {config.description}
              </p>
            </div>
            
            {/* Category Search Widget */}
            <div className="w-full lg:w-96 liquid-glass p-6 rounded-[2rem] border-primary/20 light:bg-white light:border-[#E8E2D8]">
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">Search {config.name}</p>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={`Topics in ${config.name.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full bg-[var(--background-deep)]/50 border border-[var(--glass-border)] rounded-xl py-3 px-10 text-sm focus:outline-none focus:border-primary transition-all text-[var(--text-primary)]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Featured Article Section */}
        {articles.length > 0 ? (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  Lead Story
                </h3>
                <NewsCard article={articles[0]} variant="large" />
              </div>
              <div className="lg:col-span-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-secondary)] mb-8">
                  Editorial Picks
                </h3>
                <div className="space-y-6">
                  {articles.slice(1, 4).map(article => (
                    <NewsCard key={article.id} article={article} variant="minimal" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-20 text-center">
            <div className="py-12 border border-dashed border-[var(--glass-border)] rounded-[2rem] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              No articles available
            </div>
          </section>
        )}

        {/* Special Layout: Academic (Studies) */}
        {config.layout === 'academic' && (
          <section className="bg-[var(--background-mid)]/50 py-10 sm:py-20 border-y border-[var(--glass-border)] light:bg-[#F9F8F6]">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
               <div className="flex items-center gap-4 mb-12">
                 <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Research Abstracts</h2>
                 <div className="flex-1 h-px bg-[var(--glass-border)]" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[1,2,3].map(i => (
                    <div key={i} className="liquid-glass p-8 rounded-3xl border-primary/10 light:bg-white light:border-[#E8E2D8]">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">Scientific Journal</span>
                      <h4 className="text-lg font-bold text-[var(--text-primary)] mt-3 mb-4 leading-tight hover:text-primary transition-colors cursor-pointer">
                        Neuroplasticity and Artificial Intelligence: A 2026 Comprehensive Study
                      </h4>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[var(--glass-border)]">
                        <span className="text-[9px] text-[var(--text-secondary)] uppercase font-bold">PDF Available</span>
                        <span className="text-primary font-bold text-10px">Read Paper →</span>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </section>
        )}

        {/* Trending Strip */}
        <div className="mt-20">
          <TrendingTopics />
        </div>

        {/* Latest Feed */}
        <LatestNewsSection />

        {/* Newsletter Section */}
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-20">
          <div className="liquid-glass p-6 sm:p-12 md:p-20 rounded-[2rem] sm:rounded-[3rem] text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-[var(--text-primary)] mb-6 uppercase">
                Stay Ahead in <span className="italic" style={{ color: config.accent }}>{config.name}</span>
              </h2>
              <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
                Premium insights and deep-dives from our {config.name.toLowerCase()} desk, delivered every morning.
              </p>
              <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-[var(--glass)] border border-[var(--glass-border)] rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary transition-all backdrop-blur-md text-[var(--text-primary)]"
                />
                <button 
                  className="text-white font-bold px-10 py-4 rounded-2xl shadow-[0_15px_30px_rgba(255,59,48,0.4)] transition-all transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: config.accent }}
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </motion.main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
