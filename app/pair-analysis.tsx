import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiService } from '@/lib/services/api-service';
import { Ionicons } from '@expo/vector-icons';

interface AnalysisStep {
  step_number: number;
  title: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details: string[];
  icon: string;
}

interface FVG {
  pair: string;
  timeframe: string;
  gap_type: 'bullish' | 'bearish';
  top: number;
  bottom: number;
  strength: number;
  is_filled: boolean;
}

interface LiquidityZone {
  pair: string;
  timeframe: string;
  zone_type: 'buy_side' | 'sell_side';
  level: number;
  touch_count: number;
  is_swept: boolean;
}

interface AnalysisData {
  pair: string;
  current_price: number;
  recommendation: string;
  side: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  risk_reward: number;
  confidence: number;
  setups_found: number;
  analysis_steps?: AnalysisStep[];
  detected_fvgs?: {
    '4h': FVG[];
    daily: FVG[];
    '30m': FVG[];
  };
  detected_liquidity_zones?: LiquidityZone[];
}

export default function PairAnalysisScreen() {
  const { pair } = useLocalSearchParams<{ pair: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [pair]);

  const loadAnalysis = async () => {
    if (!pair) return;

    setLoading(true);
    try {
      const result = await apiService.analyzePair(pair);
      setAnalysis(result);
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to load analysis. Make sure Python backend is running:\n\npython -m uvicorn src.main:app --reload --port 8000 --host 0.0.0.0'
      );
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return 'checkmark-circle';
      case 'warning': return 'warning';
      case 'error': return 'close-circle';
      default: return 'information-circle';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Analyzing {pair}...</Text>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No analysis data available</Text>
      </View>
    );
  }

  const totalFVGs = (analysis.detected_fvgs?.['4h']?.length || 0) +
                    (analysis.detected_fvgs?.daily?.length || 0) +
                    (analysis.detected_fvgs?.['30m']?.length || 0);

  const bullishFVGs = [
    ...(analysis.detected_fvgs?.['4h'] || []),
    ...(analysis.detected_fvgs?.daily || []),
    ...(analysis.detected_fvgs?.['30m'] || []),
  ].filter(f => f.gap_type === 'bullish').length;

  const buyLiqZones = analysis.detected_liquidity_zones?.filter(z => z.zone_type === 'buy_side').length || 0;
  const sellLiqZones = analysis.detected_liquidity_zones?.filter(z => z.zone_type === 'sell_side').length || 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{pair}</Text>
          <Text style={styles.headerSubtitle}>Detailed Analysis</Text>
        </View>
      </View>

      {/* Trade Recommendation Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Trade Recommendation</Text>
        <View style={styles.recommendationContainer}>
          <View style={[
            styles.sideBadge,
            { backgroundColor: analysis.side === 'buy' ? '#10b98120' : '#ef444420' }
          ]}>
            <Ionicons
              name={analysis.side === 'buy' ? 'trending-up' : 'trending-down'}
              size={20}
              color={analysis.side === 'buy' ? '#10b981' : '#ef4444'}
            />
            <Text style={[
              styles.sideText,
              { color: analysis.side === 'buy' ? '#10b981' : '#ef4444' }
            ]}>
              {analysis.side.toUpperCase()}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Entry:</Text>
            <Text style={styles.priceValue}>{analysis.entry_price.toFixed(5)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Stop Loss:</Text>
            <Text style={[styles.priceValue, { color: '#ef4444' }]}>
              {analysis.stop_loss.toFixed(5)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Take Profit:</Text>
            <Text style={[styles.priceValue, { color: '#10b981' }]}>
              {analysis.take_profit.toFixed(5)}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Risk:Reward:</Text>
            <Text style={styles.priceValue}>1:{analysis.risk_reward.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Confidence:</Text>
            <Text style={styles.priceValue}>{(analysis.confidence * 100).toFixed(0)}%</Text>
          </View>
        </View>
      </View>

      {/* Analysis Steps */}
      {analysis.analysis_steps && analysis.analysis_steps.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔍 Analysis Steps</Text>
          <Text style={styles.cardSubtitle}>Step-by-step breakdown</Text>

          {analysis.analysis_steps.map((step, index) => (
            <View
              key={index}
              style={[
                styles.stepCard,
                { borderLeftColor: getStatusColor(step.status) }
              ]}
            >
              <View style={styles.stepHeader}>
                <Ionicons
                  name={getStatusIcon(step.status) as any}
                  size={20}
                  color={getStatusColor(step.status)}
                />
                <Text style={styles.stepTitle}>
                  {step.icon} Step {step.step_number}: {step.title}
                </Text>
              </View>
              {step.details.map((detail, detailIndex) => (
                <View key={detailIndex} style={styles.detailRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.detailText}>{detail}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Detected Structures */}
      {analysis.detected_fvgs && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Detected Market Structures</Text>
          <Text style={styles.cardSubtitle}>Fair Value Gaps & Liquidity Zones</Text>

          {/* FVGs Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Fair Value Gaps</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalFVGs} total</Text>
              </View>
            </View>

            <View style={styles.fvgGrid}>
              {/* 4H FVGs */}
              <View style={styles.fvgCard}>
                <Text style={styles.fvgTimeframe}>4H Timeframe</Text>
                <Text style={styles.fvgCount}>{analysis.detected_fvgs['4h']?.length || 0}</Text>
                <View style={styles.fvgTypes}>
                  <View style={styles.fvgType}>
                    <Ionicons name="trending-up" size={12} color="#10b981" />
                    <Text style={styles.fvgTypeText}>
                      {analysis.detected_fvgs['4h']?.filter(f => f.gap_type === 'bullish').length || 0}
                    </Text>
                  </View>
                  <View style={styles.fvgType}>
                    <Ionicons name="trending-down" size={12} color="#ef4444" />
                    <Text style={styles.fvgTypeText}>
                      {analysis.detected_fvgs['4h']?.filter(f => f.gap_type === 'bearish').length || 0}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Daily FVGs */}
              <View style={styles.fvgCard}>
                <Text style={styles.fvgTimeframe}>Daily Timeframe</Text>
                <Text style={styles.fvgCount}>{analysis.detected_fvgs.daily?.length || 0}</Text>
                <View style={styles.fvgTypes}>
                  <View style={styles.fvgType}>
                    <Ionicons name="trending-up" size={12} color="#10b981" />
                    <Text style={styles.fvgTypeText}>
                      {analysis.detected_fvgs.daily?.filter(f => f.gap_type === 'bullish').length || 0}
                    </Text>
                  </View>
                  <View style={styles.fvgType}>
                    <Ionicons name="trending-down" size={12} color="#ef4444" />
                    <Text style={styles.fvgTypeText}>
                      {analysis.detected_fvgs.daily?.filter(f => f.gap_type === 'bearish').length || 0}
                    </Text>
                  </View>
                </View>
              </View>

              {/* 30min FVGs */}
              <View style={styles.fvgCard}>
                <Text style={styles.fvgTimeframe}>30min Timeframe</Text>
                <Text style={styles.fvgCount}>{analysis.detected_fvgs['30m']?.length || 0}</Text>
                <View style={styles.fvgTypes}>
                  <View style={styles.fvgType}>
                    <Ionicons name="trending-up" size={12} color="#10b981" />
                    <Text style={styles.fvgTypeText}>
                      {analysis.detected_fvgs['30m']?.filter(f => f.gap_type === 'bullish').length || 0}
                    </Text>
                  </View>
                  <View style={styles.fvgType}>
                    <Ionicons name="trending-down" size={12} color="#ef4444" />
                    <Text style={styles.fvgTypeText}>
                      {analysis.detected_fvgs['30m']?.filter(f => f.gap_type === 'bearish').length || 0}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Liquidity Zones */}
          {analysis.detected_liquidity_zones && analysis.detected_liquidity_zones.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>💧 Liquidity Zones</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{analysis.detected_liquidity_zones.length} total</Text>
                </View>
              </View>

              <View style={styles.liqGrid}>
                <View style={[styles.liqCard, styles.buyLiqCard]}>
                  <View style={styles.liqHeader}>
                    <Text style={styles.liqLabel}>Buy-Side Liquidity</Text>
                    <Ionicons name="trending-up" size={16} color="#10b981" />
                  </View>
                  <Text style={styles.liqCount}>{buyLiqZones}</Text>
                  <Text style={styles.liqSubtext}>Equal highs detected</Text>
                </View>

                <View style={[styles.liqCard, styles.sellLiqCard]}>
                  <View style={styles.liqHeader}>
                    <Text style={styles.liqLabel}>Sell-Side Liquidity</Text>
                    <Ionicons name="trending-down" size={16} color="#ef4444" />
                  </View>
                  <Text style={styles.liqCount}>{sellLiqZones}</Text>
                  <Text style={styles.liqSubtext}>Equal lows detected</Text>
                </View>
              </View>
            </View>
          )}

          {/* Summary Stats */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Bullish Structures</Text>
              <Text style={styles.summaryValue}>{bullishFVGs + buyLiqZones}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Bearish Structures</Text>
              <Text style={styles.summaryValue}>{(totalFVGs - bullishFVGs) + sellLiqZones}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#71717a',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#18181b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#71717a',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#18181b',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 16,
  },
  recommendationContainer: {
    marginTop: 12,
  },
  sideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  sideText: {
    fontSize: 18,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: '#27272a',
    marginVertical: 8,
  },
  stepCard: {
    backgroundColor: '#09090b',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 8,
  },
  bullet: {
    color: '#71717a',
    fontSize: 14,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#d4d4d8',
    lineHeight: 18,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  badge: {
    backgroundColor: '#27272a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    color: '#71717a',
  },
  fvgGrid: {
    gap: 12,
  },
  fvgCard: {
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: '#3f3f46',
    borderRadius: 8,
    padding: 12,
  },
  fvgTimeframe: {
    fontSize: 11,
    color: '#a1a1aa',
    marginBottom: 8,
  },
  fvgCount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  fvgTypes: {
    flexDirection: 'row',
    gap: 12,
  },
  fvgType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fvgTypeText: {
    fontSize: 11,
    color: '#a1a1aa',
  },
  liqGrid: {
    gap: 12,
  },
  liqCard: {
    borderRadius: 8,
    padding: 16,
  },
  buyLiqCard: {
    backgroundColor: '#10b98110',
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  sellLiqCard: {
    backgroundColor: '#ef444410',
    borderWidth: 1,
    borderColor: '#ef444430',
  },
  liqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  liqLabel: {
    fontSize: 13,
    color: '#a1a1aa',
  },
  liqCount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  liqSubtext: {
    fontSize: 11,
    color: '#71717a',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#a1a1aa',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
});
