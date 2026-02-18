import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Linking, Alert, Share, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { usePredictionStore } from '../../stores/predictionStore';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { usePaperTradeStore } from '../../stores/paperTradeStore';
import { fmtDollar, fmtPnLPct } from '../../utils/tradingUtils';

const BETA_APK_URL = 'https://github.com/rockyshoals-lgtm/odin-mobile/releases/latest';
const BETA_MESSAGE = `Check out ODIN — FDA Catalyst Intelligence app. We're beta testing it right now.\n\nPaper trade biotech catalysts with $100K, see ODIN approval probabilities, and experiment with options.\n\nDownload the APK: ${BETA_APK_URL}\n\n— ODIN Inner Circle`;

export function SettingsScreen() {
  const { odinCoins, getCoinTier, getCoinTierEmoji, getNextTier, currentStreak, longestStreak, getStreakMultiplier } = usePredictionStore();
  const { watchedIds } = useWatchlistStore();

  const { account, tradeHistory, getPortfolioMetrics, resetAccount } = usePaperTradeStore();
  const metrics = getPortfolioMetrics();

  const [notifPDUFA, setNotifPDUFA] = useState(true);
  const [notif7Day, setNotif7Day] = useState(true);
  const [notifCEWS, setNotifCEWS] = useState(true);
  const [notifOutcome, setNotifOutcome] = useState(true);
  const [notifPrice, setNotifPrice] = useState(false);

  const nextTier = getNextTier();
  const coinTier = getCoinTier();
  const streakMult = getStreakMultiplier();

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
                <Text style={styles.coinTier}>{getCoinTierEmoji()} {coinTier}</Text>
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

        {/* Streak Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREDICTION STREAK</Text>
          <View style={styles.streakCard}>
            <View style={styles.streakStatsRow}>
              <View style={styles.streakStatItem}>
                <Text style={styles.streakStatEmoji}>{currentStreak >= 7 ? '🔥' : currentStreak >= 3 ? '⚡' : '✨'}</Text>
                <Text style={styles.streakStatValue}>{currentStreak}</Text>
                <Text style={styles.streakStatLabel}>Current</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakStatItem}>
                <Text style={styles.streakStatEmoji}>🏆</Text>
                <Text style={styles.streakStatValue}>{longestStreak}</Text>
                <Text style={styles.streakStatLabel}>Best</Text>
              </View>
              <View style={styles.streakDivider} />
              <View style={styles.streakStatItem}>
                <Text style={styles.streakStatEmoji}>💰</Text>
                <Text style={[styles.streakStatValue, streakMult > 1 && { color: COLORS.coin }]}>{streakMult}x</Text>
                <Text style={styles.streakStatLabel}>Multiplier</Text>
              </View>
            </View>

            <View style={styles.streakInfo}>
              <Text style={styles.streakInfoText}>
                {currentStreak >= 7
                  ? '🔥 LEGENDARY! 2x coin bonus active!'
                  : currentStreak >= 3
                  ? '⚡ Nice! 1.5x coin bonus active. 7-day streak unlocks 2x!'
                  : 'Predict daily to build your streak and earn bonus coins!'}
              </Text>
            </View>

            {/* Streak milestones */}
            <View style={styles.milestonesRow}>
              <View style={[styles.milestone, currentStreak >= 1 && styles.milestoneActive]}>
                <Text style={styles.milestoneNum}>1</Text>
              </View>
              <View style={[styles.milestoneBar, currentStreak >= 3 && styles.milestoneBarActive]} />
              <View style={[styles.milestone, currentStreak >= 3 && styles.milestoneActive]}>
                <Text style={styles.milestoneNum}>3</Text>
                <Text style={styles.milestoneLabel}>1.5x</Text>
              </View>
              <View style={[styles.milestoneBar, currentStreak >= 7 && styles.milestoneBarActive]} />
              <View style={[styles.milestone, currentStreak >= 7 && styles.milestoneActive]}>
                <Text style={styles.milestoneNum}>7</Text>
                <Text style={styles.milestoneLabel}>2x</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Paper Trading Track Record */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAPER TRADING TRACK RECORD</Text>
          <View style={styles.tradeRecordCard}>
            <View style={styles.tradeRecordRow}>
              <View style={styles.tradeRecordStat}>
                <Text style={styles.tradeRecordValue}>{fmtDollar(metrics.totalValue)}</Text>
                <Text style={styles.tradeRecordLabel}>Portfolio Value</Text>
              </View>
              <View style={styles.tradeRecordStat}>
                <Text style={[styles.tradeRecordValue, { color: (metrics.totalGain ?? 0) >= 0 ? COLORS.approve : COLORS.crl }]}>
                  {fmtDollar(metrics.totalGain)}
                </Text>
                <Text style={styles.tradeRecordLabel}>Total P&L</Text>
              </View>
            </View>
            <View style={styles.tradeRecordRow}>
              <View style={styles.tradeRecordStat}>
                <Text style={styles.tradeRecordValue}>{metrics.totalTrades}</Text>
                <Text style={styles.tradeRecordLabel}>Total Trades</Text>
              </View>
              <View style={styles.tradeRecordStat}>
                <Text style={styles.tradeRecordValue}>{fmtPnLPct(metrics.winRate * 100)}</Text>
                <Text style={styles.tradeRecordLabel}>Win Rate</Text>
              </View>
              <View style={styles.tradeRecordStat}>
                <Text style={[styles.tradeRecordValue, { color: COLORS.approve }]}>{fmtDollar(metrics.largestWin)}</Text>
                <Text style={styles.tradeRecordLabel}>Best Trade</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => Alert.alert(
                'Reset Paper Account',
                'This will reset your $100,000 paper trading account and clear all positions and history.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: resetAccount },
                ]
              )}
            >
              <Text style={styles.resetButtonText}>Reset Paper Account ($100K)</Text>
            </TouchableOpacity>
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

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Streak Reminders</Text>
              <Text style={styles.settingDesc}>Don't lose your prediction streak!</Text>
            </View>
            <Switch
              value={true}
              trackColor={{ false: COLORS.bgInput, true: COLORS.coinBg }}
              thumbColor={COLORS.coin}
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutLogo}>ODIN</Text>
            <Text style={styles.aboutVersion}>PDUFA.BIO Mobile v1.2.0-beta.1</Text>
            <Text style={styles.aboutEngine}>Engine: ODIN v10.69 | 63 Parameters</Text>
            <Text style={styles.aboutAccuracy}>96.0% Verified Accuracy | 50 Events</Text>

            <View style={styles.aboutDivider} />

            <TouchableOpacity style={styles.aboutLink} onPress={() => Linking.openURL('https://pdufa.bio')}>
              <Text style={styles.aboutLinkText}>Visit pdufa.bio</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Beta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INNER CIRCLE BETA</Text>
          <View style={styles.shareCard}>
            <Text style={styles.shareTitle}>Share ODIN with Your Circle</Text>
            <Text style={styles.shareDesc}>
              Send the beta APK to your trusted crew. This build is for inner circle only —
              share responsibly.
            </Text>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={async () => {
                try {
                  await Share.share({
                    message: BETA_MESSAGE,
                    title: 'ODIN — FDA Catalyst Intelligence (Beta)',
                  });
                } catch (err) {
                  // user cancelled
                }
              }}
            >
              <Text style={styles.shareButtonText}>SHARE APK WITH A BUD</Text>
            </TouchableOpacity>
            <Text style={styles.shareNote}>
              They'll need to enable "Install unknown apps" on Android
            </Text>
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
              including total loss. ODIN Coins are cosmetic reputation tokens with no monetary value.
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

  // Streak Card
  streakCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  streakStatsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 12 },
  streakStatItem: { alignItems: 'center' },
  streakStatEmoji: { fontSize: 20, marginBottom: 4 },
  streakStatValue: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900' },
  streakStatLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  streakDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  streakInfo: { backgroundColor: COLORS.bgInput, borderRadius: 8, padding: 10, marginBottom: 12 },
  streakInfoText: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center' },

  milestonesRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  milestone: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  milestoneActive: { backgroundColor: COLORS.accentBg, borderColor: COLORS.accent },
  milestoneNum: { color: COLORS.textMuted, fontSize: 12, fontWeight: '800' },
  milestoneLabel: { color: COLORS.coin, fontSize: 8, fontWeight: '700' },
  milestoneBar: { width: 40, height: 2, backgroundColor: COLORS.border },
  milestoneBarActive: { backgroundColor: COLORS.accent },

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

  // Trade Record
  tradeRecordCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.accent + '30' },
  tradeRecordRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  tradeRecordStat: { alignItems: 'center' },
  tradeRecordValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '900' },
  tradeRecordLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  resetButton: { backgroundColor: COLORS.bgInput, borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 4 },
  resetButtonText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },

  // Share Beta
  shareCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.approve + '30', alignItems: 'center' },
  shareTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  shareDesc: { color: COLORS.textSecondary, fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  shareButton: { backgroundColor: COLORS.accentBg, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, borderWidth: 1, borderColor: COLORS.accent, marginBottom: 8 },
  shareButtonText: { color: COLORS.accentLight, fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  shareNote: { color: COLORS.textMuted, fontSize: 10, textAlign: 'center' },

  disclaimerCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: COLORS.crl + '30' },
  disclaimerText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
});
