import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchNews, type NewsArticle } from '../services/newsService';
import NewsCard from '../components/NewsCard';

interface CategoryFeedProps {
  category: string;
}

const CategoryFeed: React.FC<CategoryFeedProps> = ({ category }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchNews(category);
      setArticles(data);
    };
    load();
  }, [category]);

  if (articles.length === 0) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-16 border-t border-[var(--glass-border)]">
      <div className="flex items-center justify-between mb-6 sm:mb-12">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          <h2 className="text-xl sm:text-3xl font-black tracking-tight uppercase text-[var(--text-primary)] font-manrope">
            {category}
          </h2>
        </div>
        <Link 
          to={`/category/${category.toLowerCase()}`}
          className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-primary transition-colors flex items-center gap-2"
        >
          View More <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {articles.slice(0, 4).map((article) => (
          <NewsCard key={article._id || article.id} article={article} variant="compact" />
        ))}
      </div>
    </section>
  );
};

export default CategoryFeed;
