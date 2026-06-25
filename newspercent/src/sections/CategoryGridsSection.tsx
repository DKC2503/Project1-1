import React, { useState, useEffect } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchNews, type NewsArticle } from '../services/newsService';

const CATEGORIES = [
  { name: 'National', slug: 'national', accent: '#FF3B30' },
  { name: 'Global', slug: 'global', accent: '#007AFF' },
  { name: 'Politics', slug: 'politics', accent: '#AF52DE' },
  { name: 'Business', slug: 'business', accent: '#1D4ED8' },
  { name: 'Sports', slug: 'sports', accent: '#00D26A' },
  { name: 'Entertainment', slug: 'entertainment', accent: '#FF2D55' },
];

const CategoryGridsSection: React.FC = () => {
  const [newsData, setNewsData] = useState<Record<string, NewsArticle[]>>({});

  useEffect(() => {
    const loadAll = async () => {
      const results: Record<string, NewsArticle[]> = {};
      for (const cat of CATEGORIES) {
        results[cat.slug] = await fetchNews(cat.name);
      }
      setNewsData(results);
    };
    loadAll();
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-8 py-20">
      <div className="flex items-center gap-4 mb-16">
        <Zap className="w-8 h-8 text-primary" />
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase text-[var(--text-primary)] font-manrope">
          Industry <span className="text-primary">Intelligence</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {CATEGORIES.map((cat) => (
          <div key={cat.slug} className="space-y-8">
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.accent }} />
                <h3 className="text-xl font-bold uppercase tracking-tight text-[var(--text-primary)] font-manrope">{cat.name}</h3>
              </div>
              <Link 
                to={`/category/${cat.slug}`}
                className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-primary transition-colors flex items-center gap-2"
              >
                View Full Feed <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(newsData[cat.slug] || []).slice(0, 4).map((article) => (
                <Link to={`/article/${article.id}`} key={article._id || article.id} className="group cursor-pointer block">
                  <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative shadow-lg">
                    <img src={article.featuredImage} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-[9px] text-[var(--text-secondary)] mt-2 uppercase font-bold tracking-widest">{article.publishDate}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategoryGridsSection;
