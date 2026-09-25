import React from 'react';
import { Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import type { NewsArticle } from '../services/newsService';
import { cn } from '../lib/utils';
 
interface NewsCardProps {
  article: NewsArticle;
  variant?: 'large' | 'compact' | 'minimal';
}
 
const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'compact' }) => {
  const { slug } = useParams<{ slug: string }>();
  const isBreakingCategory = slug?.toLowerCase() === 'breaking';

  return (
    <Link to={`/article/${article.id}`} className="flex flex-col h-full group">
      <motion.div
        whileHover={{ y: -6, transition: { duration: 0.3 } }}
        className={cn(
          "cursor-pointer liquid-glass transition-all duration-300 shadow-sm flex flex-col h-full flex-1",
          "light:bg-white light:border-[#E8E2D8] light:shadow-sm light:hover:shadow-xl",
          variant === 'large' ? "rounded-[2.5rem] overflow-hidden" : "rounded-3xl overflow-hidden",
          variant === 'minimal' ? "flex flex-row gap-4 p-4" : ""
        )}
      >
      {/* Thumbnail */}
      <div className={cn(
        "relative overflow-hidden flex-shrink-0 flex-grow-0",
        variant === 'large' ? "w-full aspect-[16/9]" : 
        variant === 'minimal' ? "w-24 h-24 rounded-2xl" : "w-full aspect-[4/3]"
      )}>
        <img
          src={article.featuredImage}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background-deep)]/70 via-transparent to-transparent opacity-60 light:from-black/40" />
        {variant !== 'minimal' && (
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className="px-4 py-1.5 bg-primary text-white text-[9px] font-black tracking-widest uppercase rounded-full shadow-lg">
              {article.category}
            </span>
            {!isBreakingCategory && (article.isBreakingNews || article.isMainBreaking || article.isBigBreaking) && (
              <span className="px-3 py-1.5 bg-red-600 text-white text-[9px] font-black tracking-widest uppercase rounded-full shadow-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Breaking
              </span>
            )}
          </div>
        )}
      </div>
 
      {/* Content */}
      <div className={cn(
        "flex flex-col flex-1",
        variant === 'large' ? "p-6 sm:p-10 md:p-12" : 
        variant === 'minimal' ? "justify-center py-1" : "p-6 sm:p-8"
      )}>
        {variant === 'minimal' && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest block">{article.category}</span>
            {!isBreakingCategory && (article.isBreakingNews || article.isMainBreaking || article.isBigBreaking) && (
              <span className="text-[8px] font-black bg-red-600/10 border border-red-500/20 text-red-500 uppercase tracking-widest px-1.5 py-0.5 rounded">
                Breaking
              </span>
            )}
          </div>
        )}

        <div className={cn(
          "flex items-center gap-6 text-[9px] font-black text-[var(--text-secondary)] mb-4 tracking-widest uppercase",
          variant === 'minimal' && "hidden"
        )}>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-primary" />
            {article.author}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {article.publishDate}
          </div>
        </div>

        <h2 
          title={article.title}
          aria-label={article.title}
          className={cn(
            "text-[var(--text-primary)] font-bold leading-tight group-hover:text-primary transition-colors mb-4 font-lemon-milk",
            variant === 'large' ? "text-4xl md:text-5xl tracking-tighter line-clamp-2 md:line-clamp-3 lg:line-clamp-4" : 
            variant === 'minimal' ? "text-sm leading-snug line-clamp-2" : "text-2xl tracking-tight line-clamp-2 md:line-clamp-3 lg:line-clamp-4"
          )}
        >
          {article.title}
        </h2>

        {variant !== 'minimal' && (
          <p className={cn(
            "text-[var(--text-secondary)] leading-relaxed line-clamp-2 lg:line-clamp-3 font-medium",
            "light:text-[#374151]",
            variant === 'large' ? "text-xl max-w-3xl" : "text-sm"
          )}>
            {article.summary}
          </p>
        )}
      </div>
    </motion.div>
    </Link>
  );
};

export default NewsCard;
