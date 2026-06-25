import api from '../config/api';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down';
}

export interface MarketIntelResponse {
  success: boolean;
  source: string;
  data: StockData[];
  message?: string;
}

export const fetchMarketIntel = async (): Promise<MarketIntelResponse> => {
  try {
    const res = await api.get('/api/market/intel');
    if (res.data && res.data.success) {
      return {
        success: true,
        source: res.data.source,
        data: Array.isArray(res.data.data) ? res.data.data : [],
        message: res.data.message
      };
    }
    return {
      success: false,
      source: 'error',
      data: [],
      message: res.data?.message || 'Market data temporarily unavailable'
    };
  } catch (err: any) {
    console.error('[MarketService] Error fetching market intel:', err.message);
    return {
      success: false,
      source: 'error',
      data: [],
      message: 'Market data temporarily unavailable'
    };
  }
};
