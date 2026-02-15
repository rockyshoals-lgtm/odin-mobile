import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface StreakBannerProps {
  streak: number;
  multiplier: number;
  longestStreak: number;
}

export function StreakBanner({ streak, multiplier, longestStreak }: StreakBannerProps) {
  if (streak === 0) return null;

  const isHot = streak >= 7;
  const isWarm = streak >= 3;

  return (
    <View style={[styles.container, isHot && styles.containerHot, isWarm && !isHot && styles.containerWarm]}>
      <View style={styles.leftSection}>
        <Text style={styles.fireEmoji}>{isHot ? '🔥' : isWarm ? '⚡' : '✨'}</Text>
        <View>
          <Text style={[styles.streakCount, isHot && styles.streakCountHot]}>
            {streak} Day Streak
          </Text>
          <Text style={styles.bestStreak}>Best: {longestStreak}d</Text>
        </View>
      </View>

      {multiplier > 1 && (
        <View style={[styles.multiplierBadge, isHot && styles.multiplierBadgeHot]}>
          <Text style={[styles.multiplierText, isHot && styles.multiplierTextHot]}>
            {multiplier}x
          </Text>
        </View>
      )}

      {/* Streak dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: 7 }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < streak % 7 || (streak >= 7 && i < 7) ? styles.dotFilled : styles.dotEmpty,
              i < streak % 7 || (streak >= 7 && i < 7) ? (isHot ? styles.dotHot : styles.dotWarm) : {},
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  containerWarm: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  containerHot: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fireEmoji: {
    fontSize: 22,
  },
  streakCount: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  streakCountHot: {
    color: COLORS.crl,
  },
  bestStreak: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  multiplierBadge: {
    backgroundColor: COLORS.coinBg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.coin,
  },
  multiplierBadgeHot: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: COLORS.crl,
  },
  multiplierText: {
    color: COLORS.coin,
    fontSize: 14,
    fontWeight: '900',
  },
  multiplierTextHot: {
    color: COLORS.crl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotFilled: {
    backgroundColor: COLORS.coin,
  },
  dotEmpty: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dotWarm: {
    backgroundColor: COLORS.coin,
  },
  dotHot: {
    backgroundColor: COLORS.crl,
  },
});
