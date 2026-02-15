import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface JackpotPoolCardProps {
  totalPool: number;
  userContribution: number;
  weekId: string;
}

export function JackpotPoolCard({ totalPool, userContribution, weekId }: JackpotPoolCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <Text style={styles.trophyEmoji}>🏆</Text>
          <View>
            <Text style={styles.title}>WEEKLY JACKPOT POOL</Text>
            <Text style={styles.weekLabel}>{weekId}</Text>
          </View>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Pool amount */}
      <View style={styles.poolRow}>
        <Text style={styles.poolAmount}>{totalPool.toLocaleString()}</Text>
        <Text style={styles.poolLabel}>ODIN Coins</Text>
      </View>

      {/* Prize breakdown */}
      <View style={styles.prizeRow}>
        <View style={styles.prizeItem}>
          <Text style={styles.prizeRank}>🥇 1st</Text>
          <Text style={styles.prizeAmount}>{Math.round(totalPool * 0.5).toLocaleString()}</Text>
        </View>
        <View style={styles.prizeDivider} />
        <View style={styles.prizeItem}>
          <Text style={styles.prizeRank}>🥈 2nd</Text>
          <Text style={styles.prizeAmount}>{Math.round(totalPool * 0.3).toLocaleString()}</Text>
        </View>
        <View style={styles.prizeDivider} />
        <View style={styles.prizeItem}>
          <Text style={styles.prizeRank}>🥉 3rd</Text>
          <Text style={styles.prizeAmount}>{Math.round(totalPool * 0.2).toLocaleString()}</Text>
        </View>
      </View>

      {/* User contribution */}
      <View style={styles.contributionRow}>
        <Text style={styles.contributionLabel}>Your contribution</Text>
        <Text style={styles.contributionAmount}>{userContribution} coins</Text>
      </View>

      <Text style={styles.footer}>Top predictors by accuracy win the pool each Sunday</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trophyEmoji: {
    fontSize: 22,
  },
  title: {
    color: COLORS.coin,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  weekLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.approve,
  },
  liveText: {
    color: COLORS.approve,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  poolRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 12,
  },
  poolAmount: {
    color: COLORS.coin,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  poolLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.bgInput,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  prizeItem: {
    alignItems: 'center',
    flex: 1,
  },
  prizeRank: {
    fontSize: 12,
    marginBottom: 2,
  },
  prizeAmount: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  prizeDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
  },
  contributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  contributionLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  contributionAmount: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    color: COLORS.textMuted,
    fontSize: 10,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
