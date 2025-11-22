import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAnalysis } from '@/lib/hooks/use-analysis';

const MAJOR_PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'];

export default function MarketsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { analyzing, analyzePair, runMarketAnalysis } = useAnalysis();

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const data = await Promise.all(
        MAJOR_PAIRS.map(async (pair) => {
          const [predictions, indicators, fvgs] = await Promise.all([
            supabase
              .from('ai_predictions')
              .select('*')
              .eq('pair', pair)
              .order('predicted_at', { ascending: false })
              .limit(1)
              .single(),
            supabase
              .from('technical_indicators')
              .select('*')
              .eq('pair', pair)
              .order('indicator_timestamp', { ascending: false })
              .limit(1)
              .single(),
            supabase
              .from('fair_value_gaps')
              .select('*')
              .eq('pair', pair)
              .eq('is_filled', false)
              .limit(1),
          ]);

          return {
            pair,
            prediction: predictions.data,
            indicators: indicators.data,
            activeFVGs: fvgs.data?.length || 0,
          };
        })
      );

      setMarketData(data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMarketData();
    setRefreshing(false);
  };

  const handleAnalyzePair = async (pair: string) => {
    try {
      Alert.alert(
        'Analyze Pair',
        `Trigger analysis for ${pair}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Analyze',
            onPress: async () => {
              try {
                await analyzePair(pair);
                Alert.alert('Success', `Analysis started for ${pair}. Results will appear shortly.`);
                // Refresh data after a delay to get new results
                setTimeout(() => fetchMarketData(), 3000);
              } catch (error) {
                Alert.alert('Error', 'Failed to trigger analysis. Make sure your API is running.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRunAllAnalysis = async () => {
    try {
      Alert.alert(
        'Run Market Analysis',
        'Analyze all major pairs? This may take a few minutes.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Run Analysis',
            onPress: async () => {
              try {
                await runMarketAnalysis();
                Alert.alert('Success', 'Market analysis started. Results will update shortly.');
                setTimeout(() => fetchMarketData(), 5000);
              } catch (error) {
                Alert.alert('Error', 'Failed to run market analysis. Make sure your API is running.');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const PairCard = ({ data }: any) => {
    const { pair, prediction, indicators } = data;
    const recColor =
      prediction?.recommendation === 'strong_buy' || prediction?.recommendation === 'buy'
        ? '#22c55e'
        : prediction?.recommendation === 'strong_sell' || prediction?.recommendation === 'sell'
        ? '#ef4444'
        : '#f59e0b';

    return (
      <TouchableOpacity
        style={[styles.pairCard, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}
      >
        <View style={styles.pairHeader}>
          <Text style={[styles.pairName, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            {pair}
          </Text>
          {prediction && (
            <View style={[styles.recommendationBadge, { backgroundColor: recColor }]}>
              <Text style={styles.recommendationText}>
                {prediction.recommendation.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {indicators && (
          <View style={styles.indicatorsGrid}>
            <View style={styles.indicator}>
              <Text style={[styles.indicatorLabel, { color: isDark ? '#999' : '#666' }]}>
                RSI
              </Text>
              <Text
                style={[
                  styles.indicatorValue,
                  {
                    color:
                      indicators.rsi_14 > 70
                        ? '#ef4444'
                        : indicators.rsi_14 < 30
                        ? '#22c55e'
                        : isDark
                        ? '#fff'
                        : '#1a1a1a',
                  },
                ]}
              >
                {indicators.rsi_14?.toFixed(1) || 'N/A'}
              </Text>
            </View>
            <View style={styles.indicator}>
              <Text style={[styles.indicatorLabel, { color: isDark ? '#999' : '#666' }]}>
                ADX
              </Text>
              <Text style={[styles.indicatorValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                {indicators.adx_14?.toFixed(1) || 'N/A'}
              </Text>
            </View>
            <View style={styles.indicator}>
              <Text style={[styles.indicatorLabel, { color: isDark ? '#999' : '#666' }]}>
                MACD
              </Text>
              <Text
                style={[
                  styles.indicatorValue,
                  {
                    color:
                      indicators.macd_histogram > 0
                        ? '#22c55e'
                        : indicators.macd_histogram < 0
                        ? '#ef4444'
                        : isDark
                        ? '#fff'
                        : '#1a1a1a',
                  },
                ]}
              >
                {indicators.macd_histogram > 0 ? '↑' : '↓'}
              </Text>
            </View>
          </View>
        )}

        {prediction && (
          <View style={styles.predictionInfo}>
            <View style={styles.predictionItem}>
              <Text style={[styles.predictionLabel, { color: isDark ? '#999' : '#666' }]}>
                Win Prob
              </Text>
              <Text style={[styles.predictionValue, { color: '#2563eb' }]}>
                {prediction.win_probability}%
              </Text>
            </View>
            <View style={styles.predictionItem}>
              <Text style={[styles.predictionLabel, { color: isDark ? '#999' : '#666' }]}>
                Expected R:R
              </Text>
              <Text style={[styles.predictionValue, { color: '#22c55e' }]}>
                1:{prediction.expected_rr.toFixed(2)}
              </Text>
            </View>
            <View style={styles.predictionItem}>
              <Text style={[styles.predictionLabel, { color: isDark ? '#999' : '#666' }]}>
                Confidence
              </Text>
              <Text
                style={[
                  styles.predictionValue,
                  {
                    color:
                      prediction.confidence === 'high'
                        ? '#22c55e'
                        : prediction.confidence === 'medium'
                        ? '#f59e0b'
                        : '#ef4444',
                  },
                ]}
              >
                {prediction.confidence.toUpperCase()}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.analyzeButton, { borderColor: isDark ? '#2563eb' : '#2563eb' }]}
          onPress={() => handleAnalyzePair(pair)}
          disabled={analyzing}
        >
          <Text style={styles.analyzeButtonText}>
            {analyzing ? 'Analyzing...' : '🔄 Analyze'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            Market Analysis
          </Text>
          <TouchableOpacity
            style={[styles.runAllButton, analyzing && styles.runAllButtonDisabled]}
            onPress={handleRunAllAnalysis}
            disabled={analyzing}
          >
            {analyzing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.runAllButtonText}>Run All</Text>
            )}
          </TouchableOpacity>
        </View>
        {marketData.map((data) => (
          <PairCard key={data.pair} data={data} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  runAllButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  runAllButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  runAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pairCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pairHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pairName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  recommendationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  recommendationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  indicatorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  indicator: {
    alignItems: 'center',
  },
  indicatorLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  predictionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  predictionItem: {
    alignItems: 'center',
  },
  predictionLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  analyzeButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});
