import React, { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { fetchNews, type NewsArticle } from '../services/newsService';
import { Link } from 'react-router-dom';

const TrendingSidebar: React.FC = () => {
  const [trending, setTrending] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchNews();
      // Sort by views or shares if available, otherwise just use latest
      // Assuming articles have an id and title
      const sorted = data.sort((a: any, b: any) => (b.views || b.shares || 0) - (a.views || a.shares || 0)).slice(0, 5);
      setTrending(sorted);
    };
    load();
  }, []);

  return (
    <div className="hidden lg:block sticky top-32 space-y-8">
      <div className="liquid-glass p-8 rounded-[2rem] border-[var(--glass-border)]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black tracking-widest text-primary flex items-center gap-2 uppercase font-manrope">
            <TrendingUp className="w-4 h-4" />
            Trending Now
          </h3>
        </div>
        
        <div className="space-y-6">
          {trending.map((article, i) => (
            <Link to={`/article/${article.id}`} key={article._id || article.id} className="group cursor-pointer flex gap-5 block">
              <span className="text-3xl font-black text-[var(--text-secondary)] opacity-30 group-hover:text-primary transition-colors tabular-nums mt-[-4px]">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="flex-1 border-b border-[var(--glass-border)] pb-5 group-hover:border-primary/40 transition-colors">
                <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-primary transition-colors leading-snug line-clamp-3">
                  {article.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingSidebar;
