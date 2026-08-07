import api from '../config/api';

export interface NewsArticle {
  id: string;
  _id?: string; // MongoDB stability
  category: string;
  title: string;
  summary: string;
  author: string;
  publishDate: string;
  featuredImage: string;
  status: 'PENDING' | 'PUBLISHED' | 'REJECTED';
  aiScore?: number;
  humanScore?: number;
  plagiarism?: number;
  shares?: number;
  isBreakingNews?: boolean;
  isMainBreaking?: boolean;
  isCategoryBreaking?: string | null;
  isBigBreaking?: boolean;
  rawPublishDate?: string;
}

const mapArticle = (article: any): NewsArticle => {
  let category = article.category || 'UNKNOWN';
  if (category.toLowerCase() === 'breaking' || category.toLowerCase() === 'breaking news') {
    category = article.isCategoryBreaking || article.breakingCategory || 'Global';
  }
  
  return {
    id: article._id,
    _id: article._id,
    category: category,
    title: article.title || 'Untitled Intelligence',
    summary: article.subtitle || (article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : 'Intelligence briefing pending...'),
    author: article.authorName || 'Field Agent',
    publishDate: new Date(article.publishedAt || article.createdAt).toLocaleDateString(),
    featuredImage: article.featuredImage || '/logo.webp',
    status: article.status === 'PUBLISHED' ? 'PUBLISHED' : 'PENDING',
    shares: article.shares || 0,
    isBreakingNews: article.isBreakingNews || false,
    isMainBreaking: article.isMainBreaking || false,
    isCategoryBreaking: article.isCategoryBreaking || null,
    isBigBreaking: article.isBigBreaking || false,
    rawPublishDate: article.publishedAt || article.createdAt
  };
};

export const fetchNews = async (category?: string, search?: string): Promise<NewsArticle[]> => {
  try {
    const params: any = {};
    if (category) {
      params.category = category;
    }
    if (search) {
      params.search = search;
    }
    const res = await api.get('/api/news', { params });
    const rawData = (res.data ?? []) as any[];
    
    const mappedData = rawData.map(mapArticle) as NewsArticle[];
    
    let data = mappedData;
    
    if (category && category !== 'Home') {
      if (category.toLowerCase() === 'breaking') {
        data = data.filter(article => article.isBreakingNews || article.isMainBreaking || article.isBigBreaking);
      } else {
        data = data.filter(article => article.category.toLowerCase() === category.toLowerCase());
      }
    }
    
    return data;
  } catch (error) {
    console.error('News Service Error:', error);
    return [];
  }
};

export const shareArticle = async (id: string): Promise<number | null> => {
  try {
    const res = await api.post(`/api/articles/${id}/share`);
    return res.data.shares;
  } catch (err) {
    console.error('Share API Error:', err);
    return null;
  }
};

export const fetchMainBreaking = async (): Promise<NewsArticle | null> => {
  try {
    const res = await api.get('/api/breaking/main');
    if (res.data && res.data.article) {
      return mapArticle(res.data.article);
    }
    return null;
  } catch (error) {
    console.error('Fetch Main Breaking Error:', error);
    return null;
  }
};

export const fetchBigBreaking = async (): Promise<NewsArticle | null> => {
  try {
    const res = await api.get('/api/big-breaking');
    if (res.data && res.data.article) {
      return mapArticle(res.data.article);
    }
    return null;
  } catch (error) {
    console.error('Fetch Big Breaking Error:', error);
    return null;
  }
};

export const fetchCategoryBreaking = async (): Promise<Record<string, NewsArticle | null>> => {
  try {
    const res = await api.get('/api/breaking/categories');
    if (res.data && res.data.categories) {
      const categories = res.data.categories;
      const result: Record<string, NewsArticle | null> = {};
      for (const cat in categories) {
        const article = categories[cat];
        if (article) {
          result[cat] = mapArticle(article);
        } else {
          result[cat] = null;
        }
      }
      return result;
    }
    return {};
  } catch (error) {
    console.error('Fetch Category Breaking Error:', error);
    return {};
  }
};
