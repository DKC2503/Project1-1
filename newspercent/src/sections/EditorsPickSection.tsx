import React, { useState, useEffect } from 'react';
import { Bookmark, Share2, MessageSquare, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchNews, type NewsArticle } from '../services/newsService';

const EditorsPickSection: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchNews();
      setArticles(data);
    };
    load();
  }, []);

  if (articles.length < 4) return null;

  const featured = articles[0];
  const supporting = articles.slice(1, 4);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-20 border-t border-[var(--glass-border)]">
      <div className="flex items-center justify-between mb-6 sm:mb-12">
         <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-primary rounded-full" />
            <h2 className="text-xl sm:text-3xl md:text-5xl font-normal tracking-tight uppercase text-[var(--text-primary)]">
               Editor's <span className="text-primary">Choice</span>
            </h2>
         </div>
         <div className="hidden md:flex gap-4">
            <button className="p-3 liquid-glass rounded-full hover:text-primary transition-colors"><Bookmark className="w-5 h-5" /></button>
            <button className="p-3 liquid-glass rounded-full hover:text-primary transition-colors"><Share2 className="w-5 h-5" /></button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Large Featured Magazine Style */}
        <Link to={`/article/${featured.id}`} className="lg:col-span-7 group cursor-pointer block">
           <div className="relative aspect-[16/10] rounded-[2rem] sm:rounded-[3rem] overflow-hidden mb-6 sm:mb-8 shadow-2xl">
              <img 
                src={featured.featuredImage} 
                alt={featured.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background-deep)] via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8">
                 <span className="px-3 py-1 bg-primary text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 sm:mb-4 inline-block shadow-[0_0_20px_rgba(255,59,48,0.4)]">
                   Special Report
                 </span>
                 <h3 className="text-lg sm:text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight font-manrope group-hover:text-primary transition-colors">
                   {featured.title}
                 </h3>
              </div>
           </div>
           <div className="px-2 sm:px-4">
              <p className="text-[var(--text-secondary)] text-sm sm:text-xl leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                 {featured.summary}
              </p>
              <div className="flex items-center gap-6">
                 <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-primary">
                    <MessageSquare className="w-4 h-4" /> 12 Comments
                 </div>
                 <div className="text-[9px] sm:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    {featured.readingTime}
                  </div>
               </div>
            </div>
         </Link>
 
         {/* Supporting Stories */}
         <div className="lg:col-span-5 flex flex-col gap-6 sm:gap-8">
            {supporting.map((article) => (
              <Link to={`/article/${article.id}`} key={article._id || article.id} className="flex gap-4 sm:gap-6 group cursor-pointer pb-6 sm:pb-8 border-b border-[var(--glass-border)] last:border-0 last:pb-0 block">
                 <div className="w-20 h-20 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                    <img 
                     src={article.featuredImage} 
                     alt={article.title} 
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                 </div>
                 <div className="flex flex-col justify-center">
                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest mb-1">{article.category}</span>
                    <h4 className="text-sm sm:text-lg font-bold text-[var(--text-primary)] leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-[9px] sm:text-[10px] text-[var(--text-secondary)] mt-2 font-medium uppercase tracking-widest">
                      By {article.author} • {article.publishDate}
                    </p>
                 </div>
              </Link>
            ))}
            
            <button className="w-full mt-2 py-4 sm:py-5 liquid-glass rounded-2xl flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-primary transition-all">
               Explore All Picks <ArrowRight className="w-4 h-4" />
            </button>
         </div>
      </div>
    </section>
  );
};

export default EditorsPickSection;
