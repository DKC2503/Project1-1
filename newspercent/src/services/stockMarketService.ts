export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap?: string;
  peRatio?: number;
  dividendYield?: string;
  volume?: string;
  sector?: string;
  high52w?: number;
  low52w?: number;
  isIndex?: boolean;
}

export interface StockHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const INDICES: StockData[] = [
  { symbol: 'NIFTY 50', name: 'Nifty 50', price: 22453.80, change: 156.40, changePercent: 0.70, isIndex: true },
  { symbol: 'SENSEX', name: 'Sensex', price: 73917.03, change: 412.21, changePercent: 0.56, isIndex: true },
  { symbol: 'BANK NIFTY', name: 'Bank Nifty', price: 47835.80, change: 245.30, changePercent: 0.51, isIndex: true },
  { symbol: 'NASDAQ', name: 'Nasdaq Composite', price: 16274.94, change: -24.30, changePercent: -0.15, isIndex: true },
  { symbol: 'S&P 500', name: 'S&P 500', price: 5204.34, change: 12.10, changePercent: 0.23, isIndex: true },
  { symbol: 'DOW JONES', name: 'Dow Jones IA', price: 39127.14, change: -43.10, changePercent: -0.11, isIndex: true },
  { symbol: 'NIKKEI 225', name: 'Nikkei 225', price: 39452.63, change: 321.40, changePercent: 0.82, isIndex: true },
];

const STOCK_DB: Record<string, StockData> = {
  // Indian
  'RELIANCE': { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2984.40, change: 45.20, changePercent: 1.54, marketCap: '20.1T', peRatio: 24.5, dividendYield: '0.30%', volume: '4.2M', sector: 'Energy', high52w: 3024.90, low52w: 2210.30 },
  'TCS': { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3942.10, change: 12.40, changePercent: 0.31, marketCap: '14.2T', peRatio: 28.1, dividendYield: '1.20%', volume: '1.8M', sector: 'IT Services', high52w: 4254.00, low52w: 3156.00 },
  'INFY': { symbol: 'INFY', name: 'Infosys Ltd.', price: 1482.30, change: -5.40, changePercent: -0.36, marketCap: '6.1T', peRatio: 22.4, dividendYield: '2.40%', volume: '5.2M', sector: 'IT Services', high52w: 1733.00, low52w: 1215.00 },
  'HDFCBANK': { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1442.90, change: 2.10, changePercent: 0.15, marketCap: '10.9T', peRatio: 16.8, dividendYield: '1.10%', volume: '12.4M', sector: 'Banking', high52w: 1757.00, low52w: 1363.00 },
  'ICICIBANK': { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 1084.20, change: 15.30, changePercent: 1.43, marketCap: '7.6T', peRatio: 18.2, dividendYield: '0.80%', volume: '8.4M', sector: 'Banking', high52w: 1113.00, low52w: 898.00 },
  'SBIN': { symbol: 'SBIN', name: 'State Bank of India', price: 764.40, change: -1.20, changePercent: -0.16, marketCap: '6.8T', peRatio: 10.4, dividendYield: '1.50%', volume: '14.2M', sector: 'Banking', high52w: 792.00, low52w: 543.00 },
  // Global
  'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', price: 189.43, change: 1.23, changePercent: 0.65, marketCap: '2.95T', peRatio: 28.4, dividendYield: '0.51%', volume: '52.3M', sector: 'Technology', high52w: 199.62, low52w: 164.08 },
  'TSLA': { symbol: 'TSLA', name: 'Tesla, Inc.', price: 175.43, change: -4.32, changePercent: -2.40, marketCap: '558B', peRatio: 42.1, dividendYield: 'N/A', volume: '102M', sector: 'Automobile', high52w: 299.29, low52w: 152.37 },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft Corp.', price: 420.55, change: 2.15, changePercent: 0.51, marketCap: '3.12T', peRatio: 36.8, dividendYield: '0.71%', volume: '22.1M', sector: 'Technology', high52w: 430.82, low52w: 309.45 },
  'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 894.52, change: 12.34, changePercent: 1.40, marketCap: '2.21T', peRatio: 74.5, dividendYield: '0.02%', volume: '45.1M', sector: 'Semiconductors', high52w: 974.00, low52w: 262.00 },
  'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 154.21, change: 0.89, changePercent: 0.58, marketCap: '1.92T', peRatio: 26.2, dividendYield: 'N/A', volume: '18.4M', sector: 'Technology', high52w: 160.22, low52w: 104.30 },
  'META': { symbol: 'META', name: 'Meta Platforms Inc.', price: 506.74, change: 4.12, changePercent: 0.82, marketCap: '1.29T', peRatio: 32.4, dividendYield: '0.40%', volume: '15.2M', sector: 'Technology', high52w: 531.49, low52w: 207.00 },
  'AMZN': { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 185.07, change: 0.95, changePercent: 0.52, marketCap: '1.91T', peRatio: 62.4, dividendYield: 'N/A', volume: '31.2M', sector: 'Consumer Cyclical', high52w: 191.70, low52w: 96.69 },
};

export const fetchStocks = async (): Promise<StockData[]> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    return INDICES.map(stock => {
      const movement = (Math.random() - 0.5) * 5;
      const newPrice = stock.price + movement;
      return {
        ...stock,
        price: Number(newPrice.toFixed(2)),
        change: Number((stock.change + movement).toFixed(2)),
        changePercent: Number(((stock.change + movement) / stock.price * 100).toFixed(2))
      };
    });
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return INDICES;
  }
};

export const fetchStockHistory = async (symbol: string, timeframe: string): Promise<StockHistory[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const timeframeMap: Record<string, number> = {
    '1D': 24, '7D': 7, '1M': 30, '6M': 26, '1Y': 52, '5Y': 60
  };
  
  const points = timeframeMap[timeframe] || 24;
  const history: StockHistory[] = [];
  
  // Find base price from DB or fallback
  const stockInfo = STOCK_DB[symbol.toUpperCase()] || INDICES.find(i => i.symbol === symbol);
  let basePrice = stockInfo?.price || 150;
  
  for (let i = 0; i < points; i++) {
    const volatility = basePrice * 0.02;
    const change = (Math.random() - 0.48) * volatility; // Slight upward bias
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + (Math.random() * volatility * 0.5);
    const low = Math.min(open, close) - (Math.random() * volatility * 0.5);
    
    let dateLabel = '';
    if (timeframe === '1D') dateLabel = `${i}:00`;
    else if (timeframe === '7D') dateLabel = `Day ${i+1}`;
    else if (timeframe === '1M') dateLabel = `Day ${i+1}`;
    else dateLabel = `Point ${i+1}`;

    history.push({
      date: dateLabel,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });
    basePrice = close;
  }
  return history;
};

export const searchStock = async (query: string): Promise<StockData | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const key = query.toUpperCase();
  return STOCK_DB[key] || INDICES.find(i => i.symbol === key) || null;
};

export const getIndexList = () => INDICES;
export const getPopularStocks = () => Object.values(STOCK_DB);
