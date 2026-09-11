import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft,
  Calendar
} from 'lucide-react';
import api from '../config/api';
import MainNavbar from '../components/MainNavbar';
import Footer from '../components/Footer';
import ShareButton from '../components/ShareButton';
import { useAnalytics } from '../hooks/useAnalytics';
import ArticleLoader from '../components/ArticleLoader';
import { useToastStore } from '../hooks/useToastStore';
import { cn } from '../lib/utils';
import { useIsMobile } from '../hooks/useIsMobile';
import { MobileArticleView } from '../components/mobile/MobileArticleView';

const ArticleView: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Likes and bookmarks states
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const { addToast } = useToastStore();
  const isLight = !document.documentElement.classList.contains('dark');

  useAnalytics(id, article?.category);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await api.get(`/api/articles/${id}`);
        setArticle(res.data);
        setLikesCount(res.data.likes || 0);
        
        // Sync local storage states
        const likedList = JSON.parse(localStorage.getItem('liked_articles') || '[]');
        setIsLiked(likedList.includes(res.data._id));
      } catch (err) {
        console.error('Error fetching article:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
    window.scrollTo(0, 0);
  }, [id]);

  const handleLike = async () => {
    if (!article || likeLoading) return;
    
    const likedList = JSON.parse(localStorage.getItem('liked_articles') || '[]');
    const alreadyLiked = likedList.includes(article._id);
    
    // Optimistic Update
    setIsLiked(!alreadyLiked);
    setLikesCount(prev => alreadyLiked ? Math.max(0, prev - 1) : prev + 1);
    
    try {
      setLikeLoading(true);
      if (alreadyLiked) {
        await api.delete(`/api/articles/${article._id}/like`);
        const index = likedList.indexOf(article._id);
        if (index > -1) likedList.splice(index, 1);
        localStorage.setItem('liked_articles', JSON.stringify(likedList));
        addToast('success', 'ARTICLE UNLIKED', 'Like removed from this article.');
      } else {
        await api.post(`/api/articles/${article._id}/like`);
        likedList.push(article._id);
        localStorage.setItem('liked_articles', JSON.stringify(likedList));
        addToast('success', 'ARTICLE LIKED', 'Thank you for liking this article!');
      }
    } catch (err) {
      // Revert optimistic update
      setIsLiked(alreadyLiked);
      setLikesCount(prev => alreadyLiked ? prev + 1 : Math.max(0, prev - 1));
      addToast('error', 'ACTION FAILED', 'Could not sync like status.');
    } finally {
      setLikeLoading(false);
    }
  };

  const isMobile = useIsMobile();

  if (loading) return <ArticleLoader />;
  if (!article) return <div className="min-h-screen bg-[var(--background-deep)] flex items-center justify-center text-red-500 font-bold uppercase tracking-widest italic">Node Link Terminated: Article Not Found</div>;

  if (isMobile) {
    return <MobileArticleView article={article} onBack={() => navigate(-1)} />;
  }

  return (
    <div className="min-h-screen bg-[var(--background-deep)] transition-colors duration-300">
      <MainNavbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-8 pt-24 sm:pt-32 pb-12 sm:pb-20 font-manrope">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-primary transition-colors mb-6 uppercase text-[10px] font-bold tracking-[0.2em]"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Intelligence Feed
        </button>

        <header className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-[9px] font-bold uppercase tracking-wider inline-flex items-center">
              {article.category}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold text-[var(--text-primary)] mb-5 leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-[var(--glass-border)]">
            <div className="flex flex-col">
              <span className="text-[var(--text-primary)] font-bold text-sm uppercase tracking-tight">{article.authorName}</span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[var(--text-secondary)] text-[8px] font-bold uppercase tracking-[0.2em] opacity-40">Published</span>
              <span className="text-[var(--text-primary)] text-[11px] font-bold mt-1 flex items-center gap-2">
                <Calendar className="w-3 h-3 text-primary opacity-60" /> {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </header>

        {article.featuredImage && (
          <div className="mb-10 sm:mb-12 rounded-[2rem] sm:rounded-[3rem] overflow-hidden border border-[var(--glass-border)] shadow-2xl group relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
            <img 
              src={article.featuredImage} 
              alt={article.title}
              className="w-full aspect-[16/9] object-cover transition-transform duration-[2s] group-hover:scale-105"
            />
          </div>
        )}

        <div className="prose dark:prose-invert prose-red max-w-none mb-20 font-manrope leading-[1.8] text-[var(--text-secondary)] light:text-[#374151]">
          <div dangerouslySetInnerHTML={{ __html: article.content }} className="article-content" />
        </div>

        {/* Premium Engagement Bar */}
        <div 
          className={cn(
            "flex flex-row items-center justify-center gap-6 p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] transition-all duration-300 mb-16",
            isLight 
              ? "bg-[#FFFFFF] border border-[#DADADA] shadow-[0_10px_35px_rgba(0,0,0,0.03)]" 
              : "bg-[var(--card-bg)] border border-[var(--glass-border)] shadow-[var(--card-shadow)]"
          )}
        >
          <button 
            onClick={handleLike}
            disabled={likeLoading}
            className={cn(
              "flex-1 sm:flex-initial max-w-xs py-4 px-8 border rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-widest cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95",
              isLight
                ? isLiked 
                  ? "bg-[#FFEBE5] border-[#FF5722]/30 text-[#FF5722] hover:bg-[#FFE0D6]"
                  : "bg-[#FFFFFF] border-[#DADADA] text-[#111111] hover:bg-[#F5F5F5] hover:border-[#CFCFCF]"
                : isLiked
                  ? "bg-red-500/10 border-red-500/30 text-red-500 hover:bg-red-500/20"
                  : "bg-[var(--surface-hover)] border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-primary/5 hover:border-primary/40 hover:text-primary"
            )}
            aria-label={isLiked ? `Unlike this article. Total likes: ${likesCount}` : `Like this article. Total likes: ${likesCount}`}
            title="Like this article if you found it valuable."
          >
            {isLiked ? (
              <span className="scale-110 animate-bounce text-sm">❤️</span>
            ) : (
              <span className="scale-110 group-hover:scale-125 transition-transform duration-300 text-sm">👍</span>
            )}
            <span>{isLiked ? 'YOU LIKED THIS ARTICLE' : 'LIKE THIS ARTICLE'}</span>
          </button>

          <ShareButton 
            articleId={article._id} 
            title={article.title} 
            shares={article.shares} 
            className="flex-1 sm:flex-initial max-w-xs py-4 px-8 border rounded-2xl"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ArticleView;
