/**
 * API Service for communicating with the FZ FastAPI Backend
 * All endpoints match the Python forex-engine backend
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface HealthStatus {
  status: string;
  strategy_engine: string;
  data_loader: string;
}

export interface AnalyzeResult {
  pair: string;
  timeframe: string;
  recommendation: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_reward: number;
  confidence: number;
  patterns: any[];
  market_structures: {
    fvg?: any[];
    bos?: any[];
    order_blocks?: any[];
    liquidity?: any[];
  };
}

export interface Indicators {
  pair: string;
  timeframe: string;
  timestamp: string;
  rsi_14: number;
  macd: { value: number; signal: number; histogram: number };
  bb: { upper: number; middle: number; lower: number };
  atr_14: number;
  adx_14: number;
  ema_20: number;
  ema_50: number;
  ema_200: number;
  stochastic: { k: number; d: number };
}

export interface OHLCData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Prediction {
  pair: string;
  win_probability: number;
  expected_rr: number;
  confidence: 'high' | 'medium' | 'low';
  recommendation: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
}

export interface Signal {
  id: string;
  pair: string;
  side: 'buy' | 'sell';
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  created_at: string;
  status: string;
  confidence_score: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * GET / - Root endpoint with service info
   */
  async getServiceInfo() {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting service info:', error);
      throw error;
    }
  }

  /**
   * GET /api/health - Health check
   */
  async getHealth(): Promise<HealthStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }

  /**
   * GET /api/analyze/{pair} - Analyze specific pair
   */
  async analyzePair(pair: string): Promise<AnalyzeResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/analyze/${pair}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error analyzing pair:', error);
      throw error;
    }
  }

  /**
   * POST /api/scan-all - Scan all pairs
   */
  async scanAll(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/scan-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error scanning all pairs:', error);
      throw error;
    }
  }

  /**
   * GET /api/signals/recent - Get recent signals
   */
  async getRecentSignals(limit: number = 10): Promise<Signal[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/signals/recent?limit=${limit}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.signals || [];
    } catch (error) {
      console.error('Error getting recent signals:', error);
      throw error;
    }
  }

  /**
   * GET /api/ohlc/{pair} - Get OHLC candlestick data
   * @param timeframe M30, H1, H4, D1
   */
  async getOHLC(pair: string, timeframe: string = 'H4'): Promise<OHLCData[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ohlc/${pair}?timeframe=${timeframe}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error getting OHLC data:', error);
      throw error;
    }
  }

  /**
   * GET /api/indicators/{pair} - Get technical indicators
   */
  async getIndicators(pair: string, timeframe: string = 'H4'): Promise<Indicators> {
    try {
      const response = await fetch(`${this.baseUrl}/api/indicators/${pair}?timeframe=${timeframe}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting indicators:', error);
      throw error;
    }
  }

  /**
   * GET /api/predictions - Get ML predictions
   * @param pairs Comma-separated list of pairs, e.g., "EURUSD,GBPUSD"
   */
  async getPredictions(pairs?: string): Promise<Prediction[]> {
    try {
      const url = pairs
        ? `${this.baseUrl}/api/predictions?pairs=${pairs}`
        : `${this.baseUrl}/api/predictions`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.predictions || [];
    } catch (error) {
      console.error('Error getting predictions:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
