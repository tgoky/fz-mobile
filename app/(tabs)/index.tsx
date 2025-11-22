import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSignals } from '@/lib/hooks/use-signals';
import { useUserSettings } from '@/lib/hooks/use-user-settings';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signals, loading: signalsLoading, refetch } = useSignals('active');
  const { settings } = useUserSettings();
  const [stats, setStats] = useState({
    totalSignals: 0,
    activeSignals: 0,
    winRate: 0,
    totalProfit: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: allSignals } = await supabase
        .from('trade_signals')
        .select('*');

      const active = allSignals?.filter(s => s.status === 'active').length || 0;
      const completed = allSignals?.filter(s => s.status === 'completed') || [];
      const wins = completed.filter(s => (s.profit_loss || 0) > 0).length;
      const totalProfit = completed.reduce((sum, s) => sum + (s.profit_loss || 0), 0);
      const winRate = completed.length > 0 ? (wins / completed.length) * 100 : 0;

      setStats({
        totalSignals: allSignals?.length || 0,
        activeSignals: active,
        winRate,
        totalProfit,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), fetchStats()]);
    setRefreshing(false);
  };

  const StatCard = ({ title, value, subtitle, color }: any) => (
    <View style={[styles.statCard, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
      <Text style={[styles.statTitle, { color: isDark ? '#999' : '#666' }]}>{title}</Text>
      <Text style={[styles.statValue, { color: color || (isDark ? '#fff' : '#1a1a1a') }]}>
        {value}
      </Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: isDark ? '#666' : '#999' }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );

  const SignalCard = ({ signal }: any) => {
    const isLong = signal.side === 'buy';
    const rr = ((signal.take_profit - signal.entry_price) / (signal.entry_price - signal.stop_loss)).toFixed(2);

    return (
      <View style={[styles.signalCard, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
        <View style={styles.signalHeader}>
          <View>
            <Text style={[styles.signalPair, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              {signal.pair}
            </Text>
            <Text style={[styles.signalDate, { color: isDark ? '#666' : '#999' }]}>
              {format(new Date(signal.created_at), 'MMM dd, HH:mm')}
            </Text>
          </View>
          <View style={[styles.sideBadge, { backgroundColor: isLong ? '#22c55e' : '#ef4444' }]}>
            <Text style={styles.sideText}>{signal.side.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.signalDetails}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: isDark ? '#999' : '#666' }]}>Entry</Text>
            <Text style={[styles.detailValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              {signal.entry_price.toFixed(5)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: isDark ? '#999' : '#666' }]}>SL</Text>
            <Text style={[styles.detailValue, { color: '#ef4444' }]}>
              {signal.stop_loss.toFixed(5)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: isDark ? '#999' : '#666' }]}>TP</Text>
            <Text style={[styles.detailValue, { color: '#22c55e' }]}>
              {signal.take_profit.toFixed(5)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: isDark ? '#999' : '#666' }]}>R:R</Text>
            <Text style={[styles.detailValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              1:{rr}
            </Text>
          </View>
        </View>

        {signal.confidence_label && (
          <View style={styles.confidenceBadge}>
            <Text style={[styles.confidenceText, {
              color: signal.confidence_label === 'high' ? '#22c55e' :
                     signal.confidence_label === 'medium' ? '#f59e0b' : '#ef4444'
            }]}>
              {signal.confidence_label.toUpperCase()} CONFIDENCE
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
          Account Overview
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Equity"
            value={`$${settings?.equity.toLocaleString() || '10,000'}`}
            color="#2563eb"
          />
          <StatCard
            title="Active Signals"
            value={stats.activeSignals}
            subtitle={`${stats.totalSignals} total`}
            color="#22c55e"
          />
          <StatCard
            title="Win Rate"
            value={`${stats.winRate.toFixed(1)}%`}
            color="#f59e0b"
          />
          <StatCard
            title="Total P/L"
            value={`$${stats.totalProfit.toFixed(2)}`}
            color={stats.totalProfit >= 0 ? '#22c55e' : '#ef4444'}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
          Active Signals
        </Text>

        {signalsLoading ? (
          <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
        ) : signals.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
            <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
              No active signals
            </Text>
          </View>
        ) : (
          signals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statSubtitle: {
    fontSize: 11,
    marginTop: 4,
  },
  signalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  signalPair: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  signalDate: {
    fontSize: 12,
    marginTop: 2,
  },
  sideBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sideText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  signalDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  confidenceBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loader: {
    marginTop: 32,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
