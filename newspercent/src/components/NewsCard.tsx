import React from 'react';
import { Clock, User, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { NewsArticle } from '../services/newsService';
import { cn } from '../lib/utils';
import ShareButton from './ShareButton';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'large' | 'compact' | 'minimal';
}

const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'compact' }) => {
  return (
    <Link to={`/article/${article.id}`} className="block group">
      <motion.div
        whileHover={{ y: -6, transition: { duration: 0.3 } }}
        className={cn(
          "cursor-pointer liquid-glass transition-all duration-300 shadow-sm transition-all",
          "light:bg-white light:border-[#E8E2D8] light:shadow-sm light:hover:shadow-xl",
          variant === 'large' ? "rounded-[2.5rem] overflow-hidden" : "rounded-3xl overflow-hidden",
          variant === 'minimal' ? "flex flex-row gap-4 p-4" : ""
        )}
      >
      {/* Thumbnail */}
      <div className={cn(
        "relative overflow-hidden flex-shrink-0",
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
          <div className="absolute top-6 left-6">
            <span className="px-4 py-1.5 bg-primary text-white text-[9px] font-black tracking-widest uppercase rounded-full shadow-lg">
              {article.category}
            </span>
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
          <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-2 block">{article.category}</span>
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

        <h2 className={cn(
          "text-[var(--text-primary)] font-bold leading-tight group-hover:text-primary transition-colors mb-4 font-lemon-milk",
          variant === 'large' ? "text-4xl md:text-5xl tracking-tighter" : 
          variant === 'minimal' ? "text-sm leading-snug" : "text-2xl tracking-tight"
        )}>
          {article.title}
        </h2>

        {variant !== 'minimal' && (
          <p className={cn(
            "text-[var(--text-secondary)] leading-relaxed mb-8 line-clamp-3 font-medium",
            "light:text-[#374151]",
            variant === 'large' ? "text-xl max-w-3xl" : "text-sm"
          )}>
            {article.summary}
          </p>
        )}

        <div className={cn(
          "flex items-center justify-between mt-auto pt-6 border-t border-[var(--glass-border)]",
          variant === 'minimal' && "hidden"
        )}>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
              {article.readingTime}
            </span>
            <ShareButton 
              articleId={article.id} 
              title={article.title} 
              shares={article.shares} 
              variant="full"
              className="bg-transparent border-none p-0 h-auto"
            />
          </div>
          <div className="w-10 h-10 rounded-full bg-[var(--surface-hover)] border border-[var(--glass-border)] flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-300 light:bg-[#F9F8F6]">
            <ArrowUpRight className="w-5 h-5 text-[var(--text-primary)] group-hover:text-white" />
          </div>
        </div>
      </div>
    </motion.div>
    </Link>
  );
};

export default NewsCard;
