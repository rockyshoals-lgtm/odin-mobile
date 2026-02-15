import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

interface DailyQuestCardProps {
  reviewed: number;
  total: number;
  completed: boolean;
  bonusClaimed: boolean;
  onClaim: () => void;
}

export function DailyQuestCard({ reviewed, total, completed, bonusClaimed, onClaim }: DailyQuestCardProps) {
  const progress = Math.min(reviewed / total, 1);

  return (
    <View style={[styles.container, completed && !bonusClaimed && styles.containerReady]}>
      <View style={styles.headerRow}>
        <View style={styles.leftHeader}>
          <Text style={styles.questEmoji}>🎯</Text>
          <View>
            <Text style={styles.questTitle}>DAILY EDGE QUEST</Text>
            <Text style={styles.questDesc}>Review {total} catalysts to earn bonus</Text>
          </View>
        </View>
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>+50</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{reviewed}/{total}</Text>
      </View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.dot, i < reviewed && styles.dotDone]}>
            {i < reviewed ? (
              <Text style={styles.dotCheck}>✓</Text>
            ) : (
              <Text style={styles.dotNumber}>{i + 1}</Text>
            )}
          </View>
        ))}
        <View style={styles.arrowDot}>
          <Text style={styles.arrowText}>→</Text>
        </View>
        <View style={[styles.dot, styles.dotReward, bonusClaimed && styles.dotDone]}>
          <Text style={styles.dotCoin}>🪙</Text>
        </View>
      </View>

      {/* Claim button */}
      {completed && !bonusClaimed && (
        <TouchableOpacity style={styles.claimBtn} onPress={onClaim}>
          <Text style={styles.claimText}>CLAIM +50 ODIN COINS</Text>
        </TouchableOpacity>
      )}

      {bonusClaimed && (
        <View style={styles.claimedBanner}>
          <Text style={styles.claimedText}>✓ QUEST COMPLETE — SEE YOU TOMORROW</Text>
        </View>
      )}
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
    borderColor: COLORS.border,
  },
  containerReady: {
    borderColor: COLORS.coin,
    shadowColor: COLORS.coin,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questEmoji: {
    fontSize: 20,
  },
  questTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  questDesc: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
  rewardBadge: {
    backgroundColor: COLORS.coinBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.coin,
  },
  rewardText: {
    color: COLORS.coin,
    fontSize: 12,
    fontWeight: '900',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    backgroundColor: COLORS.accentBg,
    borderColor: COLORS.accent,
  },
  dotCheck: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: '800',
  },
  dotNumber: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  dotReward: {
    borderColor: COLORS.coin,
    backgroundColor: COLORS.coinBg,
  },
  dotCoin: {
    fontSize: 14,
  },
  arrowDot: {
    paddingHorizontal: 2,
  },
  arrowText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  claimBtn: {
    backgroundColor: COLORS.coinBg,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.coin,
    marginTop: 8,
  },
  claimText: {
    color: COLORS.coin,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  claimedBanner: {
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  claimedText: {
    color: COLORS.approve,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
