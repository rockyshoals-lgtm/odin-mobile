import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { usePredictionStore } from '../../stores/predictionStore';
import { useWatchlistStore } from '../../stores/watchlistStore';

export function SettingsScreen() {
  const { odinCoins, getCoinTier, getNextTier } = usePredictionStore();
  const { watchedIds } = useWatchlistStore();

  const [notifPDUFA, setNotifPDUFA] = useState(true);
  const [notif7Day, setNotif7Day] = useState(true);
  const [notifCEWS, setNotifCEWS] = useState(true);
  const [notifOutcome, setNotifOutcome] = useState(true);
  const [notifPrice, setNotifPrice] = useState(false);

  const nextTier = getNextTier();
  const coinTier = getCoinTier();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>SETTINGS</Text>
        </View>

        {/* ODIN Coin Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ODIN STATUS</Text>
          <View style={styles.coinCard}>
            <View style={styles.coinRow}>
              <View>
                <Text style={styles.coinTier}>{coinTier}</Text>
                <Text style={styles.coinAmount}>{odinCoins} ODIN Coins</Text>
              </View>
              <View style={styles.coinBadge}>
                <Text style={styles.coinBadgeText}>{odinCoins}</Text>
              </View>
            </View>
            {nextTier && (
              <View style={styles.progressSection}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(100, (odinCoins / (odinCoins + nextTier.coinsNeeded)) * 100)}%` }]} />
                </View>
                <Text style={styles.progressText}>{nextTier.coinsNeeded} coins to {nextTier.name}</Text>
              </View>
            )}
            <Text style={styles.watchCount}>{watchedIds.length} catalysts watched</Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PUSH NOTIFICATIONS</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>PDUFA Outcomes</Text>
              <Text style={styles.settingDesc}>FDA approval/CRL decisions</Text>
            </View>
            <Switch
              value={notifOutcome}
              onValueChange={setNotifOutcome}
              trackColor={{ false: COLORS.bgInput, true: COLORS.accentBg }}
              thumbColor={notifOutcome ? COLORS.accent : COLORS.textMuted}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>7-Day Countdown</Text>
              <Text style={styles.settingDesc}>Alert 7 days before PDUFA</Text>
            </View>
            <Switch
              value={notif7Day}
              onValueChange={setNotif7Day}
              trackColor={{ false: COLORS.bgInput, true: COLORS.accentBg }}
              thumbColor={notif7Day ? COLORS.accent : COLORS.textMuted}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>CEWS Insider Signals</Text>
              <Text style={styles.settingDesc}>Executive trading alerts</Text>
            </View>
            <Switch
              value={notifCEWS}
              onValueChange={setNotifCEWS}
              trackColor={{ false: COLORS.bgInput, true: 'rgba(168,85,247,0.3)' }}
              thumbColor={notifCEWS ? COLORS.cews : COLORS.textMuted}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Price Spikes</Text>
              <Text style={styles.settingDesc}>{'>'}15% moves on watched tickers</Text>
            </View>
            <Switch
              value={notifPrice}
              onValueChange={setNotifPrice}
              trackColor={{ false: COLORS.bgInput, true: COLORS.accentBg }}
              thumbColor={notifPrice ? COLORS.accent : COLORS.textMuted}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutLogo}>ODIN</Text>
            <Text style={styles.aboutVersion}>PDUFA.BIO Mobile v1.0.0</Text>
            <Text style={styles.aboutEngine}>Engine: ODIN v10.69 | 63 Parameters</Text>
            <Text style={styles.aboutAccuracy}>96.0% Verified Accuracy | 50 Events</Text>

            <View style={styles.aboutDivider} />

            <TouchableOpacity style={styles.aboutLink} onPress={() => Linking.openURL('https://pdufa.bio')}>
              <Text style={styles.aboutLinkText}>Visit pdufa.bio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LEGAL</Text>
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerText}>
              PDUFA.BIO is not affiliated with the FDA. This app is not financial advice.
              ODIN probability scores are machine-learning model outputs based on historical
              data — they do NOT predict FDA approval or stock performance and should NEVER
              be the sole basis for investment decisions. All investment decisions carry risk,
              including total loss.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: 2 },

  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },

  coinCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.coin + '30' },
  coinRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  coinTier: { color: COLORS.coin, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  coinAmount: { color: COLORS.textSecondary, fontSize: 13 },
  coinBadge: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.coinBg, borderWidth: 2, borderColor: COLORS.coin, alignItems: 'center', justifyContent: 'center' },
  coinBadgeText: { color: COLORS.coin, fontSize: 14, fontWeight: '800' },
  progressSection: { marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: COLORS.coin, borderRadius: 2 },
  progressText: { color: COLORS.textMuted, fontSize: 11 },
  watchCount: { color: COLORS.textMuted, fontSize: 12 },

  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  settingInfo: { flex: 1, marginRight: 12 },
  settingLabel: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  settingDesc: { color: COLORS.textMuted, fontSize: 12, marginTop: 2 },

  aboutCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  aboutLogo: { color: COLORS.accentLight, fontSize: 28, fontWeight: '900', letterSpacing: 3 },
  aboutVersion: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  aboutEngine: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  aboutAccuracy: { color: COLORS.approve, fontSize: 12, fontWeight: '700', marginTop: 4 },
  aboutDivider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
  aboutLink: { paddingVertical: 8 },
  aboutLinkText: { color: COLORS.accentLight, fontSize: 14, fontWeight: '600' },

  disclaimerCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.crl + '30' },
  disclaimerText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
});
