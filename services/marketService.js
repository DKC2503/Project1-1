const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const settingsService = require('./settingsService');

const SYMBOLS = [
  '^NSEI', '^BSESN', 'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'WIPRO.NS', 'LT.NS',
  '^GSPC', '^IXIC', '^DJI', 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'TSLA', 'META'
];

let cache = {
  data: null,
  timestamp: 0,
  isRefreshing: false
};

const marketService = {
  getMarketData: async () => {
    const ExternalApiConfig = require('../models/ExternalApiConfig');
    const activeConfig = await ExternalApiConfig.findOne({ serviceName: 'Stock Market API', status: 'ACTIVE' });
    
    const settings = await settingsService.getSettings();
    const isEnabled = activeConfig ? activeConfig.enabled : settings.marketApiEnabled;
    if (!isEnabled) {
      return {
        success: false,
        source: 'disabled',
        message: 'Market API is currently disabled by the administrator.',
        data: []
      };
    }

    const now = Date.now();
    const CACHE_DURATION = 60 * 1000; // 60 seconds

    if (cache.data) {
      const isExpired = now - cache.timestamp >= CACHE_DURATION;
      if (isExpired && !cache.isRefreshing) {
        // Trigger background refresh without blocking
        cache.isRefreshing = true;
        marketService.refreshInBackground().catch(err => {
          console.error('[MarketService] Background refresh error:', err.message);
        }).finally(() => {
          cache.isRefreshing = false;
        });
      }
      return {
        success: true,
        source: isExpired ? 'stale' : 'cache',
        data: cache.data,
        timestamp: cache.timestamp,
        message: isExpired ? 'Showing latest available market data' : undefined
      };
    }

    // No cache yet (initial load), fetch synchronously
    try {
      cache.isRefreshing = true;
      const data = await marketService.fetchFromAPI();
      cache.data = data;
      cache.timestamp = now;
      return {
        success: true,
        source: 'api',
        data,
        timestamp: now
      };
    } catch (err) {
      console.error('[MarketService] Initial fetch error:', err.message);
      return {
        success: false,
        source: 'error',
        data: [],
        message: 'Market data temporarily unavailable'
      };
    } finally {
      cache.isRefreshing = false;
    }
  },

  fetchFromAPI: async () => {
    const ExternalApiConfig = require('../models/ExternalApiConfig');
    const activeConfig = await ExternalApiConfig.findOne({ serviceName: 'Stock Market API', status: 'ACTIVE' });
    
    const settings = await settingsService.getSettings();
    const isEnabled = activeConfig ? activeConfig.enabled : settings.marketApiEnabled;
    if (!isEnabled) {
      throw new Error('Market API is currently disabled by the administrator.');
    }
    const quotes = await yahooFinance.quote(SYMBOLS);
    return quotes.map(q => ({
      symbol: q.symbol,
      name: q.shortName || q.longName || q.symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      trend: (q.regularMarketChange || 0) >= 0 ? 'up' : 'down'
    }));
  },

  refreshInBackground: async () => {
    const ExternalApiConfig = require('../models/ExternalApiConfig');
    const activeConfig = await ExternalApiConfig.findOne({ serviceName: 'Stock Market API', status: 'ACTIVE' });
    
    const settings = await settingsService.getSettings();
    const isEnabled = activeConfig ? activeConfig.enabled : settings.marketApiEnabled;
    if (!isEnabled) {
      console.log('[MarketService] Background refresh skipped: Market API disabled.');
      return;
    }
    console.log('[MarketService] Refreshing market data in background...');
    const data = await marketService.fetchFromAPI();
    cache.data = data;
    cache.timestamp = Date.now();
    console.log('[MarketService] Background refresh complete.');
  }
};

module.exports = marketService;
