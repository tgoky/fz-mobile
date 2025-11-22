import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/lib/store/auth-store';
import { useUserSettings } from '@/lib/hooks/use-user-settings';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, signOut } = useAuthStore();
  const { settings, updateSettings, loading } = useUserSettings();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    equity: settings?.equity?.toString() || '10000',
    riskPercent: settings?.risk_percent?.toString() || '0.008',
    maxTradesPerDay: settings?.max_trades_per_day?.toString() || '3',
  });

  // Demo user for when auth is bypassed
  const displayUser = user || {
    email: 'demo@fzforex.com',
    id: 'demo-user-id-123456',
  };

  const handleSave = async () => {
    if (!user) {
      // In demo mode, just update local state
      Alert.alert('Demo Mode', 'Settings saved locally (auth is bypassed)');
      setEditing(false);
      return;
    }

    try {
      await updateSettings({
        equity: parseFloat(formData.equity),
        risk_percent: parseFloat(formData.riskPercent),
        max_trades_per_day: parseInt(formData.maxTradesPerDay),
      });
      Alert.alert('Success', 'Settings updated successfully');
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleSignOut = async () => {
    if (!user) {
      Alert.alert('Demo Mode', 'Authentication is currently bypassed. Enable auth in app/_layout.tsx to use sign out.');
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  const SettingRow = ({ label, value, editable, onChangeText }: any) => (
    <View style={styles.settingRow}>
      <Text style={[styles.settingLabel, { color: isDark ? '#999' : '#666' }]}>{label}</Text>
      {editing && editable ? (
        <TextInput
          style={[
            styles.settingInput,
            {
              backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
              color: isDark ? '#fff' : '#1a1a1a',
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
        />
      ) : (
        <Text style={[styles.settingValue, { color: isDark ? '#fff' : '#1a1a1a' }]}>
          {value}
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color="#2563eb" style={styles.loader} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
    >
      <View style={styles.content}>
        <View style={[styles.profileHeader, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayUser?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.email, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            {displayUser?.email}
            {!user && <Text style={{ fontSize: 12, color: '#f59e0b' }}> (Demo)</Text>}
          </Text>
          <Text style={[styles.userId, { color: isDark ? '#666' : '#999' }]}>
            ID: {displayUser?.id.substring(0, 8)}...
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
              Trading Settings
            </Text>
            {!editing ? (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActions}>
                <TouchableOpacity onPress={() => setEditing(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <SettingRow
            label="Account Equity"
            value={`$${formData.equity}`}
            editable
            onChangeText={(text: string) => setFormData({ ...formData, equity: text })}
          />
          <SettingRow
            label="Risk Per Trade"
            value={`${(parseFloat(formData.riskPercent) * 100).toFixed(2)}%`}
            editable
            onChangeText={(text: string) =>
              setFormData({ ...formData, riskPercent: (parseFloat(text) / 100).toString() })
            }
          />
          <SettingRow
            label="Max Trades/Day"
            value={formData.maxTradesPerDay}
            editable
            onChangeText={(text: string) => setFormData({ ...formData, maxTradesPerDay: text })}
          />
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            Preferred Pairs
          </Text>
          <Text style={[styles.pairsText, { color: isDark ? '#999' : '#666' }]}>
            {JSON.parse(settings?.preferred_pairs || '["EURUSD", "GBPUSD", "USDJPY"]').join(
              ', '
            )}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#2a2a2a' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1a1a1a' }]}>
            Preferred Timeframes
          </Text>
          <Text style={[styles.pairsText, { color: isDark ? '#999' : '#666' }]}>
            {JSON.parse(settings?.preferred_timeframes || '["30m", "4H", "1D"]').join(', ')}
          </Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDark ? '#666' : '#999' }]}>
            FZ Forex Mobile v1.0.0
          </Text>
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
  profileHeader: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userId: {
    fontSize: 12,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButton: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingInput: {
    padding: 8,
    borderRadius: 6,
    width: 120,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
  },
  pairsText: {
    fontSize: 14,
  },
  signOutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 12,
  },
  loader: {
    marginTop: 32,
  },
});
