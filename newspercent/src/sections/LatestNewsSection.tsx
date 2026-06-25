import React, { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import TrendingSidebar from '../components/TrendingSidebar';
import { fetchNews, type NewsArticle } from '../services/newsService';

const LatestNewsSection: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchNews();
      setArticles(data);
    };
    load();
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-12">
        {/* Main Feed */}
        <div className="lg:col-span-7 space-y-12">
          <div className="flex items-center justify-between border-b border-glass-border pb-4">
            <h2 className="text-2xl font-bold tracking-tight uppercase font-manrope">Latest Feed</h2>
            <div className="flex gap-6 text-[10px] font-bold tracking-widest text-text-secondary uppercase">
              <span className="text-primary cursor-pointer">All News</span>
              <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Featured</span>
              <span className="hover:text-[var(--text-primary)] cursor-pointer transition-colors">Popular</span>
            </div>
          </div>

          {articles.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-secondary)] font-bold uppercase tracking-wider">
              No articles available
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {articles.map((article) => (
                <NewsCard key={article._id || article.id} article={article} />
              ))}
            </div>
          )}

          <button className="w-full py-5 border border-glass-border rounded-2xl text-[10px] font-bold tracking-widest uppercase text-text-secondary hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-all">
            Load More Stories
          </button>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3">
          <TrendingSidebar />
        </div>
      </div>
    </section>
  );
};

export default LatestNewsSection;
