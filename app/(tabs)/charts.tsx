import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService, OHLCData } from '@/lib/services/api-service';
import { LineChart } from 'react-native-chart-kit';

const PAIRS = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'];
const TIMEFRAMES = ['M30', 'H1', 'H4', 'D1'];

export default function ChartsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedPair, setSelectedPair] = useState('EURUSD');
  const [selectedTimeframe, setSelectedTimeframe] = useState('H4');
  const [chartData, setChartData] = useState<OHLCData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChartData();
  }, [selectedPair, selectedTimeframe]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getOHLC(selectedPair, selectedTimeframe);
      setChartData(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load chart data. Make sure Python backend is running.');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const getChartConfig = () => ({
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    backgroundGradientFrom: isDark ? '#2a2a2a' : '#f5f5f5',
    backgroundGradientTo: isDark ? '#1a1a1a' : '#ffffff',
    decimalPlaces: 5,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '2',
      strokeWidth: '1',
      stroke: '#2563eb',
    },
  });

  const prepareChartData = () => {
    if (!chartData || chartData.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [0] }],
      };
    }

    // Take last 20 candles for better visualization
    const recentData = chartData.slice(-20);
    const labels = recentData.map((candle, idx) => {
      if (idx % 4 === 0) return candle.time.split('T')[1]?.substring(0, 5) || '';
      return '';
    });

    const closePrices = recentData.map((candle) => candle.close);

    return {
      labels,
      datasets: [
        {
          data: closePrices,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  };

  const CandleStick = ({ candle, index }: { candle: OHLCData; index: number }) => {
    const isBullish = candle.close >= candle.open;
    const bodyHeight = Math.abs(candle.close - candle.open) * 10000;
    const wickTop = (candle.high - Math.max(candle.open, candle.close)) * 10000;
    const wickBottom = (Math.min(candle.open, candle.close) - candle.low) * 10000;

    return (
      <View style={styles.candleContainer}>
        {/* Upper Wick */}
        <View
          style={[
            styles.wick,
            {
              height: Math.max(wickTop, 1),
              backgroundColor: isBullish ? '#22c55e' : '#ef4444',
            },
          ]}
        />
        {/* Body */}
        <View
          style={[
            styles.candleBody,
            {
              height: Math.max(bodyHeight, 2),
              backgroundColor: isBullish ? '#22c55e' : '#ef4444',
            },
          ]}
        />
        {/* Lower Wick */}
        <View
          style={[
            styles.wick,
            {
              height: Math.max(wickBottom, 1),
              backgroundColor: isBullish ? '#22c55e' : '#ef4444',
            },
          ]}
        />
      </View>
    );
  };

  const renderStats = () => {
    if (!chartData || chartData.length === 0) return null;

    const latestCandle = chartData[chartData.length - 1];
    const previousCandle = chartData[chartData.length - 2];
    const change = latestCandle && previousCandle ? latestCandle.close - previousCandle.close : 0;
    const changePercent = previousCandle ? (change / previousCandle.close) * 100 : 0;

    return (
      <View style={[styles.statsContainer, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>Open</Text>
          <Text style={[styles.statValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            {latestCandle?.open.toFixed(5)}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>High</Text>
          <Text style={[styles.statValue, { color: '#22c55e' }]}>
            {latestCandle?.high.toFixed(5)}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>Low</Text>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>
            {latestCandle?.low.toFixed(5)}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>Close</Text>
          <Text style={[styles.statValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            {latestCandle?.close.toFixed(5)}
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>Change</Text>
          <Text style={[styles.statValue, { color: change >= 0 ? '#22c55e' : '#ef4444' }]}>
            {change >= 0 ? '+' : ''}
            {change.toFixed(5)} ({changePercent >= 0 ? '+' : ''}
            {changePercent.toFixed(2)}%)
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
    >
      <View style={styles.content}>
        {/* Pair Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            Select Pair
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.buttonRow}>
              {PAIRS.map((pair) => (
                <TouchableOpacity
                  key={pair}
                  style={[
                    styles.pairButton,
                    {
                      backgroundColor:
                        selectedPair === pair
                          ? '#2563eb'
                          : isDark
                          ? '#2a2a2a'
                          : '#fff',
                    },
                  ]}
                  onPress={() => setSelectedPair(pair)}
                >
                  <Text
                    style={[
                      styles.pairButtonText,
                      {
                        color: selectedPair === pair ? '#fff' : isDark ? '#fff' : '#1a1a1a',
                      },
                    ]}
                  >
                    {pair}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Timeframe Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            Timeframe
          </Text>
          <View style={styles.buttonRow}>
            {TIMEFRAMES.map((tf) => (
              <TouchableOpacity
                key={tf}
                style={[
                  styles.timeframeButton,
                  {
                    backgroundColor:
                      selectedTimeframe === tf
                        ? '#2563eb'
                        : isDark
                        ? '#2a2a2a'
                        : '#fff',
                  },
                ]}
                onPress={() => setSelectedTimeframe(tf)}
              >
                <Text
                  style={[
                    styles.timeframeButtonText,
                    {
                      color:
                        selectedTimeframe === tf ? '#fff' : isDark ? '#fff' : '#1a1a1a',
                    },
                  ]}
                >
                  {tf}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Stats */}
        {renderStats()}

        {/* Chart */}
        <View style={[styles.chartContainer, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
          ) : chartData.length > 0 ? (
            <>
              <Text style={[styles.chartTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                {selectedPair} - {selectedTimeframe}
              </Text>
              <LineChart
                data={prepareChartData()}
                width={Dimensions.get('window').width - 64}
                height={220}
                chartConfig={getChartConfig()}
                bezier
                style={styles.chart}
              />

              {/* Candlestick Preview (Last 10 candles) */}
              <View style={styles.candlesWrapper}>
                <Text style={[styles.candlesTitle, { color: isDark ? '#999' : '#666' }]}>
                  Recent Candles
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.candlesRow}>
                    {chartData.slice(-10).map((candle, index) => (
                      <CandleStick key={index} candle={candle} index={index} />
                    ))}
                  </View>
                </ScrollView>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
                No chart data available
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? '#666' : '#999' }]}>
                Make sure Python backend is running
              </Text>
            </View>
          )}
        </View>
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pairButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pairButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  candlesWrapper: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  candlesTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  candlesRow: {
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 8,
  },
  candleContainer: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wick: {
    width: 2,
  },
  candleBody: {
    width: 12,
    minHeight: 2,
  },
  loader: {
    marginVertical: 32,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
