import React, { useState, useEffect } from 'react';
import { fetchMainBreaking, fetchCategoryBreaking, type NewsArticle } from '../services/newsService';
import { Link } from 'react-router-dom';
import SocialSidebar from '../components/SocialSidebar';
import { AlertTriangle, Loader2 } from 'lucide-react';

const MainBreakingFallback: React.FC = () => (
  <div className="w-full h-full min-h-[400px] sm:min-h-[500px] bg-white/5 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] flex flex-col justify-center items-center text-center p-8">
    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
    </div>
    <h3 className="text-lg font-bold text-white uppercase tracking-wider">No articles available</h3>
    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mt-2 max-w-sm">The editorial desk has not published any article node at this time.</p>
  </div>
);

const HeroSection: React.FC = () => {
  const [mainBreaking, setMainBreaking] = useState<NewsArticle | null>(null);
  const [categoryBreaking, setCategoryBreaking] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch main breaking and category breaking concurrently
        const [mainData, categoryData] = await Promise.all([
          fetchMainBreaking(),
          fetchCategoryBreaking()
        ]);
        setMainBreaking(mainData);
        
        // Extract non-null category breaking articles
        const catArticles = Object.values(categoryData).filter((a): a is NewsArticle => a !== null);
        setCategoryBreaking(catArticles);
      } catch (err) {
        console.error('Hero Load Error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Big breaking card skeleton (70%) */}
          <div className="w-full lg:w-[70%] h-[400px] sm:h-[500px] bg-white/5 animate-pulse rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          {/* Category cards skeleton (30%) */}
          <div className="w-full lg:w-[30%] grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-[90px] bg-white/5 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Ensure the main hero displays only the active, valid Main Breaking article
  const featured = mainBreaking;

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-6 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full min-h-[400px] sm:min-h-[500px]">
        
        {/* Social Sidebar */}
        <SocialSidebar />

        {/* Left Side: Big Breaking News (70% width) */}
        <div className="w-full lg:w-[70%] flex flex-col">
          {featured ? (
            <Link 
              to={`/article/${featured.id}`} 
              className="block relative flex-1 h-[400px] sm:h-[500px] rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden group shadow-2xl border border-[var(--glass-border)] hover:border-primary/40 transition-all duration-500"
            >
              {/* Header Overlay */}
              <div className="absolute top-0 left-0 right-0 p-6 sm:p-12 z-20 pointer-events-none">
                  <div className="flex items-center gap-3">
                     {(featured.isMainBreaking || featured.isBigBreaking || featured.isBreakingNews) && (
                       <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(255,59,48,0.8)]" />
                     )}
                     <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">
                       {featured.isMainBreaking || featured.isBigBreaking || featured.isBreakingNews
                         ? `BREAKING NEWS • ${featured.category}` 
                         : `Featured Briefing • ${featured.category}`}
                      </span>
                  </div>
              </div>

              <img 
                src={featured.featuredImage || '/logo.webp'} 
                alt={featured.title} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
                loading="lazy"
              />
              
              {/* Opaque Gradient for Legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background-deep)] via-[var(--background-deep)]/40 to-transparent opacity-100" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 z-10">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                  <span className="px-4 py-1.5 bg-primary text-white text-[9px] sm:text-[10px] font-black tracking-widest uppercase rounded-lg shadow-2xl">
                    {featured.category}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60">
                    By {featured.author || 'Field Agent'}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60">
                    •
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60">
                    {featured.publishDate}
                  </span>
                </div>
                
                <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] sm:leading-[1.05] tracking-tighter font-lemon-milk group-hover:text-primary transition-colors mb-4 sm:mb-6 max-w-4xl uppercase">
                  {featured.title}
                </h2>
                
                <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-3xl line-clamp-2 mb-6 sm:mb-8 font-medium">
                  {featured.summary}
                </p>
                
                <div className="flex items-center gap-4 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-primary group-hover:gap-6 transition-all">
                  READ FULL STORY 
                  <span className="h-px w-8 sm:w-12 bg-primary/40 group-hover:w-20 group-hover:bg-primary transition-all" />
                </div>
              </div>
            </Link>
          ) : (
            <MainBreakingFallback />
          )}
        </div>

        {/* Right Side: Category Breaking News (30% width) */}
        <div className="w-full lg:w-[30%] flex flex-col">
          <div className="w-full mb-3 flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Category Breaking News</span>
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
          </div>
          
          <div className="w-full flex-1 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-3 lg:max-h-[460px] lg:overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-1">
            {categoryBreaking.length > 0 ? (
              categoryBreaking.map(article => (
                <Link 
                  key={article.id} 
                  to={`/article/${article.id}`} 
                  className="p-3 bg-white/5 border border-[var(--glass-border)] hover:border-primary/40 rounded-2xl flex items-center gap-4 transition-all duration-300 group hover:-translate-y-0.5"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-white/5 bg-white/5 relative">
                    <img 
                      src={article.featuredImage || '/logo.webp'} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black tracking-widest uppercase rounded flex items-center gap-1 shadow-sm">
                          <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                          Breaking
                        </span>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest truncate">
                          {article.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                         <span className="text-[8px] font-black text-green-400 uppercase tracking-widest">Online</span>
                      </div>
                    </div>
                    <h4 className="text-[11px] font-black text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase font-lemon-milk mt-1">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1.5">
                      <span>{article.publishDate}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-[10px] text-white/30 uppercase font-black tracking-widest">
                No active category breaking stories
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
