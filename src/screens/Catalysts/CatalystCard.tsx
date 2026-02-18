import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { COLORS, TIER_CONFIG, TierKey } from '../../constants/colors';
import { Catalyst } from '../../constants/types';
import { TierBadge } from '../../components/Common/TierBadge';
import { CountdownChip } from '../../components/Common/CountdownChip';
import { LivePriceBadge } from '../../components/Trading/LivePriceBadge';
import { fmtDateShort, fmtProb } from '../../utils/formatting';
import { useWatchlistStore } from '../../stores/watchlistStore';

interface CatalystCardProps {
  catalyst: Catalyst;
  onPress: (catalyst: Catalyst) => void;
}

export function CatalystCard({ catalyst, onPress }: CatalystCardProps) {
  const { isWatched, toggle } = useWatchlistStore();
  const watched = isWatched(catalyst.id);
  const tierConfig = TIER_CONFIG[catalyst.tier as TierKey] || TIER_CONFIG.TIER_4;
  const isPdufa = catalyst.type === 'PDUFA';
  const borderColor = isPdufa ? tierConfig.color : catalyst.type === 'Earnings' ? '#06b6d4' : '#a855f7';

  const designationBadges = catalyst.designations?.slice(0, 3) || [];

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: borderColor }]}
      onPress={() => onPress(catalyst)}
      activeOpacity={0.7}
    >
      {/* Top row: Date + Countdown + Watch */}
      <View style={styles.topRow}>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{fmtDateShort(catalyst.date)}{!isPdufa && ' (Est.)'}</Text>
          <CountdownChip date={catalyst.date} />
          <View style={[styles.typeBadge, { backgroundColor: catalyst.type === 'Earnings' ? COLORS.earningsBg : catalyst.type === 'READOUT' ? COLORS.readoutBg : COLORS.pdufaBg }]}>
            <Text style={[styles.typeText, { color: catalyst.type === 'Earnings' ? COLORS.earnings : catalyst.type === 'READOUT' ? COLORS.readout : COLORS.pdufa }]}>
              {catalyst.type === 'READOUT' ? `${catalyst.phase || ''} Readout`.trim() : catalyst.type}
            </Text>
          </View>
        </View>
        <Pressable onPress={() => toggle(catalyst.id)} hitSlop={12}>
          <Text style={{ fontSize: 18 }}>{watched ? '★' : '☆'}</Text>
        </Pressable>
      </View>

      {/* Middle: Company info + Tier badge */}
      <View style={styles.middleRow}>
        <View style={styles.companyInfo}>
          <View style={styles.tickerRow}>
            <Text style={styles.ticker}>{catalyst.ticker}</Text>
            <LivePriceBadge ticker={catalyst.ticker} compact />
            <Text style={styles.company}>{catalyst.company}</Text>
          </View>
          <Text style={styles.drug} numberOfLines={1}>{catalyst.drug}</Text>
          <Text style={styles.indication} numberOfLines={1}>{catalyst.indication}</Text>
        </View>
        {catalyst.type === 'PDUFA' && catalyst.prob > 0 && <TierBadge tier={catalyst.tier} prob={catalyst.prob} size="lg" />}
      </View>

      {/* Bottom: Designations + TA */}
      <View style={styles.bottomRow}>
        <Text style={styles.ta}>{catalyst.ta}</Text>
        {designationBadges.map((d, i) => (
          <View key={i} style={styles.desBadge}>
            <Text style={styles.desText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Probability bar — only for PDUFA with scored prob */}
      {catalyst.type === 'PDUFA' && catalyst.prob > 0 && (
        <View style={styles.probBarBg}>
          <View style={[styles.probBarFill, { width: `${catalyst.prob * 100}%`, backgroundColor: tierConfig.color }]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  companyInfo: {
    flex: 1,
    marginRight: 12,
  },
  tickerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 2,
  },
  ticker: {
    color: COLORS.accentLight,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  company: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  drug: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  indication: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  ta: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  desBadge: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  desText: {
    color: COLORS.accentLight,
    fontSize: 9,
    fontWeight: '600',
  },
  probBarBg: {
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  probBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
