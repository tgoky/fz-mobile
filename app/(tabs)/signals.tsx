import React, { useState } from 'react';
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
import { useSignals } from '@/lib/hooks/use-signals';
import { format } from 'date-fns';

export default function SignalsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { signals, loading, refetch } = useSignals(filter);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const FilterButton = ({ label, value }: { label: string; value?: string }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        {
          backgroundColor:
            filter === value
              ? '#2563eb'
              : isDark
              ? '#2a2a2a'
              : '#fff',
        },
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          {
            color:
              filter === value
                ? '#fff'
                : isDark
                ? '#fff'
                : '#1a1a1a',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SignalCard = ({ signal }: any) => {
    const isLong = signal.side === 'buy';
    const statusColor =
      signal.status === 'active'
        ? '#22c55e'
        : signal.status === 'completed'
        ? '#2563eb'
        : signal.status === 'cancelled'
        ? '#ef4444'
        : '#f59e0b';

    return (
      <View style={[styles.signalCard, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
        <View style={styles.signalHeader}>
          <View style={styles.headerLeft}>
            <Text style={[styles.signalPair, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              {signal.pair}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{signal.status.toUpperCase()}</Text>
            </View>
          </View>
          <View style={[styles.sideBadge, { backgroundColor: isLong ? '#22c55e' : '#ef4444' }]}>
            <Text style={styles.sideText}>{signal.side.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.signalInfo}>
          <Text style={[styles.signalDate, { color: isDark ? '#666' : '#999' }]}>
            {format(new Date(signal.created_at), 'MMM dd, yyyy HH:mm')}
          </Text>

          <View style={styles.priceInfo}>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: isDark ? '#999' : '#666' }]}>Entry</Text>
              <Text style={[styles.priceValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                {signal.entry_price.toFixed(5)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: isDark ? '#999' : '#666' }]}>SL</Text>
              <Text style={[styles.priceValue, { color: '#ef4444' }]}>
                {signal.stop_loss.toFixed(5)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: isDark ? '#999' : '#666' }]}>TP</Text>
              <Text style={[styles.priceValue, { color: '#22c55e' }]}>
                {signal.take_profit.toFixed(5)}
              </Text>
            </View>
          </View>

          {signal.profit_loss !== null && (
            <View style={styles.profitSection}>
              <Text
                style={[
                  styles.profitText,
                  { color: signal.profit_loss >= 0 ? '#22c55e' : '#ef4444' },
                ]}
              >
                P/L: ${signal.profit_loss.toFixed(2)}
                {signal.profit_pips && ` (${signal.profit_pips.toFixed(1)} pips)`}
              </Text>
            </View>
          )}

          {signal.confidence_label && (
            <View style={styles.metaInfo}>
              <Text style={[styles.metaText, { color: isDark ? '#666' : '#999' }]}>
                Confidence:{' '}
                <Text
                  style={{
                    color:
                      signal.confidence_label === 'high'
                        ? '#22c55e'
                        : signal.confidence_label === 'medium'
                        ? '#f59e0b'
                        : '#ef4444',
                    fontWeight: 'bold',
                  }}
                >
                  {signal.confidence_label.toUpperCase()}
                </Text>
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterButton label="All" value={undefined} />
          <FilterButton label="Pending" value="pending" />
          <FilterButton label="Active" value="active" />
          <FilterButton label="Completed" value="completed" />
          <FilterButton label="Cancelled" value="cancelled" />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
          ) : signals.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
              <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
                No signals found
              </Text>
            </View>
          ) : (
            signals.map((signal) => <SignalCard key={signal.id} signal={signal} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signalPair: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
  signalInfo: {
    gap: 12,
  },
  signalDate: {
    fontSize: 12,
  },
  priceInfo: {
    gap: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 14,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  profitSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  profitText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  metaText: {
    fontSize: 12,
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
