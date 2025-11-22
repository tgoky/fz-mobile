/**
 * API Service for communicating with the FZ backend
 * This calls the same API routes as the web version
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface AnalyzePairRequest {
  pair: string;
  timeframes?: string[];
  forceRefresh?: boolean;
}

export interface AnalyzePairResponse {
  success: boolean;
  message: string;
  data?: {
    signals?: any[];
    predictions?: any;
    indicators?: any;
  };
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Analyze a currency pair
   * Triggers the Python backend to analyze the pair and generate signals
   */
  async analyzePair(request: AnalyzePairRequest): Promise<AnalyzePairResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing pair:', error);
      throw error;
    }
  }

  /**
   * Get all available pairs
   */
  async getPairs(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/pairs`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.pairs || [];
    } catch (error) {
      console.error('Error fetching pairs:', error);
      throw error;
    }
  }

  /**
   * Trigger market analysis for all pairs
   */
  async runMarketAnalysis(): Promise<AnalyzePairResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze/market`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error running market analysis:', error);
      throw error;
    }
  }

  /**
   * Get analysis status
   */
  async getAnalysisStatus(): Promise<{
    isRunning: boolean;
    lastRun?: string;
    nextRun?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze/status`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting analysis status:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
