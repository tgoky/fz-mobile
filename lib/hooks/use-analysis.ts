import { useState } from 'react';
import { apiService, AnalyzePairRequest } from '../services/api-service';

export function useAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePair = async (pair: string, timeframes?: string[]) => {
    setAnalyzing(true);
    setError(null);

    try {
      const request: AnalyzePairRequest = {
        pair,
        timeframes: timeframes || ['30m', '4H', '1D'],
        forceRefresh: true,
      };

      const result = await apiService.analyzePair(request);

      if (!result.success) {
        throw new Error(result.message || 'Analysis failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  };

  const runMarketAnalysis = async () => {
    setAnalyzing(true);
    setError(null);

    try {
      const result = await apiService.runMarketAnalysis();

      if (!result.success) {
        throw new Error(result.message || 'Market analysis failed');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setAnalyzing(false);
    }
  };

  return {
    analyzing,
    error,
    analyzePair,
    runMarketAnalysis,
  };
}
