import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TIER_CONFIG, TierKey } from '../../constants/colors';
import { VERIFIED_OUTCOMES, TIMESTAMPED_PREDICTIONS } from '../../constants/trackRecord';
import { fmtDateShort } from '../../utils/formatting';

export function TrackRecordScreen() {
  const stats = useMemo(() => {
    const total = VERIFIED_OUTCOMES.length;
    const correct = VERIFIED_OUTCOMES.filter(o => o.correct).length;
    const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : '0';
    const tier1 = VERIFIED_OUTCOMES.filter(o => o.odinTier === 'TIER_1');
    const tier1Correct = tier1.filter(o => o.correct).length;
    const tier1Acc = tier1.length > 0 ? ((tier1Correct / tier1.length) * 100).toFixed(0) : '0';
    const biggestWin = VERIFIED_OUTCOMES
      .filter(o => o.correct && o.stockMove.startsWith('+'))
      .sort((a, b) => parseFloat(b.stockMove) - parseFloat(a.stockMove))[0];

    return { total, correct, accuracy, tier1Acc, tier1Total: tier1.length, biggestWin: biggestWin?.stockMove || 'N/A', biggestTicker: biggestWin?.ticker || '' };
  }, []);

  const renderOutcome = ({ item }: { item: typeof VERIFIED_OUTCOMES[0] }) => {
    const tierConfig = TIER_CONFIG[item.odinTier as TierKey] || TIER_CONFIG.TIER_4;
    return (
      <View style={[styles.outcomeRow, { borderLeftColor: item.correct ? COLORS.approve : COLORS.crl }]}>
        <View style={styles.outcomeLeft}>
          <Text style={styles.outcomeDate}>{fmtDateShort(item.date)}</Text>
          <View style={styles.outcomeTicker}>
            <Text style={styles.outcomeTickerText}>{item.ticker}</Text>
            <Text style={[styles.outcomeBadge, { color: tierConfig.color }]}>{TIER_CONFIG[item.odinTier as TierKey]?.label || item.odinTier}</Text>
          </View>
          <Text style={styles.outcomeDrug} numberOfLines={1}>{item.drug}</Text>
        </View>
        <View style={styles.outcomeRight}>
          <View style={[styles.outcomePill, { backgroundColor: item.outcome === 'APPROVED' ? 'rgba(34,197,94,0.15)' : item.outcome === 'CRL' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)' }]}>
            <Text style={[styles.outcomePillText, { color: item.outcome === 'APPROVED' ? COLORS.approve : item.outcome === 'CRL' ? COLORS.crl : COLORS.delayed }]}>
              {item.outcome}
            </Text>
          </View>
          <Text style={[styles.outcomeMove, { color: item.stockMove.startsWith('+') ? COLORS.approve : COLORS.crl }]}>
            {item.stockMove}
          </Text>
          <Text style={{ fontSize: 14 }}>{item.correct ? '✓' : '✗'}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>TRACK RECORD</Text>
        <Text style={styles.subtitle}>Verified ODIN predictions</Text>
      </View>

      {/* Hero Stats */}
      <View style={styles.heroCard}>
        <View style={styles.heroMain}>
          <Text style={styles.heroAccuracy}>{stats.accuracy}%</Text>
          <Text style={styles.heroLabel}>OVERALL ACCURACY</Text>
        </View>
        <View style={styles.heroGrid}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.total}</Text>
            <Text style={styles.heroStatLabel}>Events</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{stats.correct}</Text>
            <Text style={styles.heroStatLabel}>Correct</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatValue, { color: COLORS.tier1 }]}>{stats.tier1Acc}%</Text>
            <Text style={styles.heroStatLabel}>T1 Accuracy</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatValue, { color: COLORS.coin }]}>{stats.biggestWin}</Text>
            <Text style={styles.heroStatLabel}>{stats.biggestTicker} Best</Text>
          </View>
        </View>
      </View>

      {/* Timestamped Predictions Count */}
      <View style={styles.proofBanner}>
        <Text style={styles.proofText}>
          {TIMESTAMPED_PREDICTIONS.length} UTC-Timestamped Predictions | SHA-256 Verified
        </Text>
      </View>

      {/* Outcome List */}
      <FlatList
        data={VERIFIED_OUTCOMES}
        renderItem={renderOutcome}
        keyExtractor={(item, i) => `${item.ticker}-${item.date}-${i}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: COLORS.textMuted, fontSize: 12 },

  heroCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  heroMain: { alignItems: 'center', marginBottom: 16 },
  heroAccuracy: { color: COLORS.approve, fontSize: 48, fontWeight: '900' },
  heroLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  heroGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  heroStat: { alignItems: 'center' },
  heroStatValue: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '800' },
  heroStatLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },

  proofBanner: {
    marginHorizontal: 16,
    backgroundColor: COLORS.accentBg,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  proofText: { color: COLORS.accentLight, fontSize: 11, fontWeight: '600', textAlign: 'center', letterSpacing: 0.3 },

  listContent: { paddingBottom: 100 },

  outcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    borderLeftWidth: 3,
  },
  outcomeLeft: { flex: 1 },
  outcomeDate: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginBottom: 2 },
  outcomeTicker: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  outcomeTickerText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800' },
  outcomeBadge: { fontSize: 10, fontWeight: '700' },
  outcomeDrug: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },
  outcomeRight: { alignItems: 'flex-end', gap: 4 },
  outcomePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  outcomePillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  outcomeMove: { fontSize: 13, fontWeight: '800' },
});
