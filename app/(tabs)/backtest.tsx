import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth-store';
import { format } from 'date-fns';

export default function BacktestScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const user = useAuthStore((state) => state.user);
  const [backtests, setBacktests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBacktests();
    }
  }, [user]);

  const fetchBacktests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('backtest_runs')
        .select(`
          *,
          backtest_results (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBacktests(data || []);
    } catch (error) {
      console.error('Error fetching backtests:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBacktests();
    setRefreshing(false);
  };

  const BacktestCard = ({ backtest }: any) => {
    const results = backtest.backtest_results?.[0];

    return (
      <View style={[styles.backtestCard, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
        <View style={styles.backtestHeader}>
          <Text style={[styles.backtestName, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            {backtest.backtest_name}
          </Text>
          <Text style={[styles.backtestDate, { color: isDark ? '#666' : '#999' }]}>
            {format(new Date(backtest.created_at), 'MMM dd, yyyy')}
          </Text>
        </View>

        <View style={styles.backtestInfo}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#999' : '#666' }]}>Period</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              {format(new Date(backtest.start_date), 'MM/dd/yy')} -{' '}
              {format(new Date(backtest.end_date), 'MM/dd/yy')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: isDark ? '#999' : '#666' }]}>
              Initial Capital
            </Text>
            <Text style={[styles.infoValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              ${backtest.initial_capital.toLocaleString()}
            </Text>
          </View>
        </View>

        {results && (
          <>
            <View style={styles.resultsGrid}>
              <View style={styles.resultCard}>
                <Text style={[styles.resultLabel, { color: isDark ? '#999' : '#666' }]}>
                  Total Trades
                </Text>
                <Text style={[styles.resultValue, { color: '#2563eb' }]}>
                  {results.total_trades}
                </Text>
              </View>
              <View style={styles.resultCard}>
                <Text style={[styles.resultLabel, { color: isDark ? '#999' : '#666' }]}>
                  Win Rate
                </Text>
                <Text style={[styles.resultValue, { color: '#f59e0b' }]}>
                  {results.win_rate.toFixed(1)}%
                </Text>
              </View>
              <View style={styles.resultCard}>
                <Text style={[styles.resultLabel, { color: isDark ? '#999' : '#666' }]}>
                  Net Profit
                </Text>
                <Text
                  style={[
                    styles.resultValue,
                    { color: results.net_profit >= 0 ? '#22c55e' : '#ef4444' },
                  ]}
                >
                  ${results.net_profit.toFixed(2)}
                </Text>
              </View>
              <View style={styles.resultCard}>
                <Text style={[styles.resultLabel, { color: isDark ? '#999' : '#666' }]}>
                  Profit Factor
                </Text>
                <Text style={[styles.resultValue, { color: '#22c55e' }]}>
                  {results.profit_factor.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.additionalStats}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>
                  Max Drawdown
                </Text>
                <Text style={[styles.statValue, { color: '#ef4444' }]}>
                  ${results.max_drawdown.toFixed(2)} ({results.max_drawdown_percent.toFixed(1)}%)
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>
                  Avg Win / Loss
                </Text>
                <Text style={[styles.statValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                  ${results.average_win.toFixed(2)} / ${Math.abs(results.average_loss).toFixed(2)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: isDark ? '#999' : '#666' }]}>
                  Sharpe Ratio
                </Text>
                <Text style={[styles.statValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                  {results.sharpe_ratio.toFixed(2)}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>
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
            Backtest Results
          </Text>
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => alert('Create new backtest - Coming soon')}
          >
            <Text style={styles.newButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
        ) : backtests.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
            <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
              No backtests found
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#666' : '#999' }]}>
              Create your first backtest to analyze your trading strategy
            </Text>
          </View>
        ) : (
          backtests.map((backtest) => <BacktestCard key={backtest.id} backtest={backtest} />)
        )}
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
  newButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  backtestCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backtestHeader: {
    marginBottom: 12,
  },
  backtestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  backtestDate: {
    fontSize: 12,
  },
  backtestInfo: {
    gap: 8,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  resultCard: {
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  additionalStats: {
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
