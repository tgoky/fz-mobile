import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/lib/store/auth-store';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import type { Database } from '@/lib/database.types';

type TradeJournal = Database['public']['Tables']['trade_journal']['Row'];
type TradeJournalInsert = Database['public']['Tables']['trade_journal']['Insert'];

export default function JournalScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const user = useAuthStore((state) => state.user);
  const [journalEntries, setJournalEntries] = useState<TradeJournal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TradeJournal | null>(null);
  const [formData, setFormData] = useState({
    pair: 'EURUSD',
    side: 'buy' as 'buy' | 'sell',
    entry_price: '',
    stop_loss: '',
    take_profit: '',
    exit_price: '',
    profit_loss: '',
    setup_notes: '',
    trade_notes: '',
    lessons_learned: '',
    outcome: 'pending' as 'win' | 'loss' | 'breakeven' | 'pending',
  });

  useEffect(() => {
    if (user) {
      fetchJournalEntries();
    }
  }, [user]);

  const fetchJournalEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trade_journal')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setJournalEntries(data || []);
    } catch (error) {
      console.error('Error fetching journal:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJournalEntries();
    setRefreshing(false);
  };

  const openAddModal = () => {
    setEditingEntry(null);
    setFormData({
      pair: 'EURUSD',
      side: 'buy',
      entry_price: '',
      stop_loss: '',
      take_profit: '',
      exit_price: '',
      profit_loss: '',
      setup_notes: '',
      trade_notes: '',
      lessons_learned: '',
      outcome: 'pending',
    });
    setModalVisible(true);
  };

  const openEditModal = (entry: TradeJournal) => {
    setEditingEntry(entry);
    setFormData({
      pair: entry.pair,
      side: entry.side,
      entry_price: entry.entry_price.toString(),
      stop_loss: entry.stop_loss.toString(),
      take_profit: entry.take_profit.toString(),
      exit_price: entry.exit_price?.toString() || '',
      profit_loss: entry.profit_loss?.toString() || '',
      setup_notes: entry.setup_notes || '',
      trade_notes: entry.trade_notes || '',
      lessons_learned: entry.lessons_learned || '',
      outcome: entry.outcome || 'pending',
    });
    setModalVisible(true);
  };

  const saveEntry = async () => {
    if (!user) {
      Alert.alert('Error', 'Authentication is bypassed. Enable auth to save journal entries.');
      return;
    }

    if (!formData.entry_price || !formData.stop_loss || !formData.take_profit) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const entry: any = {
        user_id: user.id,
        pair: formData.pair,
        side: formData.side,
        entry_price: parseFloat(formData.entry_price),
        stop_loss: parseFloat(formData.stop_loss),
        take_profit: parseFloat(formData.take_profit),
        exit_price: formData.exit_price ? parseFloat(formData.exit_price) : null,
        profit_loss: formData.profit_loss ? parseFloat(formData.profit_loss) : null,
        setup_notes: formData.setup_notes || null,
        trade_notes: formData.trade_notes || null,
        lessons_learned: formData.lessons_learned || null,
        outcome: formData.outcome,
        entry_date: new Date().toISOString().split('T')[0],
      };

      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('trade_journal')
          .update(entry)
          .eq('id', editingEntry.id);

        if (error) throw error;
        Alert.alert('Success', 'Journal entry updated');
      } else {
        // Create new entry
        const { error } = await supabase.from('trade_journal').insert([entry]);

        if (error) throw error;
        Alert.alert('Success', 'Journal entry created');
      }

      setModalVisible(false);
      fetchJournalEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', 'Failed to save journal entry');
    }
  };

  const deleteEntry = async (id: string) => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this journal entry?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('trade_journal').delete().eq('id', id);

            if (error) throw error;
            Alert.alert('Success', 'Journal entry deleted');
            fetchJournalEntries();
          } catch (error) {
            console.error('Error deleting entry:', error);
            Alert.alert('Error', 'Failed to delete journal entry');
          }
        },
      },
    ]);
  };

  const JournalCard = ({ entry }: { entry: TradeJournal }) => {
    const outcomeColor =
      entry.outcome === 'win'
        ? '#22c55e'
        : entry.outcome === 'loss'
        ? '#ef4444'
        : entry.outcome === 'breakeven'
        ? '#f59e0b'
        : '#666';

    return (
      <TouchableOpacity
        style={[styles.journalCard, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}
        onPress={() => openEditModal(entry)}
        onLongPress={() => deleteEntry(entry.id)}
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardPair, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              {entry.pair}
            </Text>
            <Text style={[styles.cardDate, { color: isDark ? '#666' : '#999' }]}>
              {format(new Date(entry.entry_date), 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={styles.cardRight}>
            <View style={[styles.sideBadge, { backgroundColor: entry.side === 'buy' ? '#22c55e' : '#ef4444' }]}>
              <Text style={styles.sideText}>{entry.side.toUpperCase()}</Text>
            </View>
            {entry.outcome && (
              <View style={[styles.outcomeBadge, { backgroundColor: outcomeColor }]}>
                <Text style={styles.outcomeText}>{entry.outcome.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.cardPrices}>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: isDark ? '#999' : '#666' }]}>Entry</Text>
            <Text style={[styles.priceValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              {entry.entry_price.toFixed(5)}
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: isDark ? '#999' : '#666' }]}>SL</Text>
            <Text style={[styles.priceValue, { color: '#ef4444' }]}>
              {entry.stop_loss.toFixed(5)}
            </Text>
          </View>
          <View style={styles.priceItem}>
            <Text style={[styles.priceLabel, { color: isDark ? '#999' : '#666' }]}>TP</Text>
            <Text style={[styles.priceValue, { color: '#22c55e' }]}>
              {entry.take_profit.toFixed(5)}
            </Text>
          </View>
        </View>

        {entry.profit_loss !== null && (
          <View style={styles.profitContainer}>
            <Text
              style={[
                styles.profitText,
                { color: entry.profit_loss >= 0 ? '#22c55e' : '#ef4444' },
              ]}
            >
              P/L: ${entry.profit_loss.toFixed(2)}
            </Text>
          </View>
        )}

        {entry.setup_notes && (
          <Text style={[styles.notesText, { color: isDark ? '#999' : '#666' }]} numberOfLines={2}>
            {entry.setup_notes}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
            Authentication Required
          </Text>
          <Text style={[styles.emptySubtext, { color: isDark ? '#666' : '#999' }]}>
            Enable authentication in app/_layout.tsx to use the trade journal
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
          ) : journalEntries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: isDark ? '#666' : '#999' }]}>
                No journal entries yet
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? '#666' : '#999' }]}>
                Tap the + button to add your first trade
              </Text>
            </View>
          ) : (
            journalEntries.map((entry) => <JournalCard key={entry.id} entry={entry} />)
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
            <ScrollView>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
                {editingEntry ? 'Edit' : 'Add'} Journal Entry
              </Text>

              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: isDark ? '#fff' : '#1a1a1a' }]}
                placeholder="Pair (e.g., EURUSD)"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.pair}
                onChangeText={(text) => setFormData({ ...formData, pair: text.toUpperCase() })}
              />

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.sideButton, formData.side === 'buy' && styles.sideButtonActive]}
                  onPress={() => setFormData({ ...formData, side: 'buy' })}
                >
                  <Text style={[styles.sideButtonText, formData.side === 'buy' && styles.sideButtonTextActive]}>
                    BUY
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sideButton, formData.side === 'sell' && styles.sideButtonActive]}
                  onPress={() => setFormData({ ...formData, side: 'sell' })}
                >
                  <Text style={[styles.sideButtonText, formData.side === 'sell' && styles.sideButtonTextActive]}>
                    SELL
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: isDark ? '#fff' : '#1a1a1a' }]}
                placeholder="Entry Price *"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.entry_price}
                onChangeText={(text) => setFormData({ ...formData, entry_price: text })}
                keyboardType="decimal-pad"
              />

              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: isDark ? '#fff' : '#1a1a1a' }]}
                placeholder="Stop Loss *"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.stop_loss}
                onChangeText={(text) => setFormData({ ...formData, stop_loss: text })}
                keyboardType="decimal-pad"
              />

              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: isDark ? '#fff' : '#1a1a1a' }]}
                placeholder="Take Profit *"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.take_profit}
                onChangeText={(text) => setFormData({ ...formData, take_profit: text })}
                keyboardType="decimal-pad"
              />

              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: isDark ? '#fff' : '#1a1a1a' }]}
                placeholder="Exit Price (optional)"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.exit_price}
                onChangeText={(text) => setFormData({ ...formData, exit_price: text })}
                keyboardType="decimal-pad"
              />

              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: isDark ? '#fff' : '#1a1a1a' }]}
                placeholder="Profit/Loss (optional)"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.profit_loss}
                onChangeText={(text) => setFormData({ ...formData, profit_loss: text })}
                keyboardType="decimal-pad"
              />

              <TextInput
                style={[styles.textArea, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: isDark ? '#fff' : '#1a1a1a' }]}
                placeholder="Setup Notes"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.setup_notes}
                onChangeText={(text) => setFormData({ ...formData, setup_notes: text })}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.textArea, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: isDark ? '#fff' : '#1a1a1a' }]}
                placeholder="Trade Notes"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.trade_notes}
                onChangeText={(text) => setFormData({ ...formData, trade_notes: text })}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.textArea, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5', color: isDark ? '#fff' : '#1a1a1a' }]}
                placeholder="Lessons Learned"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={formData.lessons_learned}
                onChangeText={(text) => setFormData({ ...formData, lessons_learned: text })}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveEntry}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  journalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardPair: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDate: {
    fontSize: 12,
    marginTop: 2,
  },
  cardRight: {
    flexDirection: 'row',
    gap: 8,
  },
  sideBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sideText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  outcomeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  outcomeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardPrices: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  profitContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 8,
    alignItems: 'center',
  },
  profitText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notesText: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 32,
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  sideButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
  },
  sideButtonActive: {
    backgroundColor: '#2563eb',
  },
  sideButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sideButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563eb',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
