import api from '../config/api';

export interface CreditProfile {
  totalCredits: number;
  monthlyCredits: number;
  yearlyCredits: number;
  rankingScore: number;
  badges: string[];
  achievements: string[];
  articlesPublished: number;
  totalViews: number;
}

export interface CreditTransaction {
  _id: string;
  creditType: string;
  description: string;
  credits: number;
  source: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  _id: string;
  name: string;
  role: string;
  totalCredits: number;
  badges: string[];
  rankingScore: number;
  articlesPublished: number;
  totalViews: number;
}

export const creditService = {
  getProfile: async (): Promise<CreditProfile> => {
    const res = await api.get('/api/credits/me');
    return res.data;
  },

  getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
    const res = await api.get('/api/credits/leaderboard');
    return res.data;
  },

  getHistory: async (userId: string): Promise<CreditTransaction[]> => {
    const res = await api.get(`/api/credits/history/${userId}`);
    return res.data;
  },

  exportArticle: async (id: string, title: string) => {
    const res = await api.get(`/api/admin/export/article/${id}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/[^a-z0-9]/gi, '_')}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
