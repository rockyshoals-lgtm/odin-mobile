import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Confetti particle
interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
}

const CONFETTI_COLORS = [
  COLORS.tier1, COLORS.coin, COLORS.accent, COLORS.accentLight,
  '#a855f7', '#ec4899', '#06b6d4', '#f59e0b',
];

interface CelebrationOverlayProps {
  visible: boolean;
  coinReward: number;
  streakCount: number;
  streakMultiplier: number;
  onDismiss: () => void;
}

export function CelebrationOverlay({ visible, coinReward, streakCount, streakMultiplier, onDismiss }: CelebrationOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 30 }, () => ({
      x: new Animated.Value(SCREEN_WIDTH / 2),
      y: new Animated.Value(SCREEN_HEIGHT / 2),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(1),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 6 + Math.random() * 8,
    }))
  );

  useEffect(() => {
    if (!visible) return;

    // Fade in
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 80, useNativeDriver: true }),
    ]).start();

    // Coin counter animation
    Animated.timing(coinAnim, { toValue: coinReward, duration: 800, useNativeDriver: false }).start();

    // Confetti burst
    particles.forEach((p) => {
      const targetX = Math.random() * SCREEN_WIDTH;
      const targetY = Math.random() * SCREEN_HEIGHT * 0.6;
      const duration = 600 + Math.random() * 800;

      Animated.parallel([
        Animated.timing(p.x, { toValue: targetX, duration, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(p.y, { toValue: targetY, duration: duration * 0.5, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: SCREEN_HEIGHT + 50, duration: duration * 1.5, useNativeDriver: true }),
        ]),
        Animated.timing(p.rotation, { toValue: 360 * (Math.random() > 0.5 ? 1 : -1), duration: duration * 2, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(duration),
          Animated.timing(p.scale, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ]).start();
    });

    // Auto-dismiss after 2.5s
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        onDismiss();
        // Reset particles
        particles.forEach(p => {
          p.x.setValue(SCREEN_WIDTH / 2);
          p.y.setValue(SCREEN_HEIGHT / 2);
          p.rotation.setValue(0);
          p.scale.setValue(1);
        });
        scaleAnim.setValue(0.3);
        coinAnim.setValue(0);
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const coinDisplay = coinAnim.interpolate({
    inputRange: [0, coinReward],
    outputRange: ['0', String(coinReward)],
  });

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} pointerEvents="box-only">
      {/* Confetti particles */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { rotate: p.rotation.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] }) },
                { scale: p.scale },
              ],
            },
          ]}
        />
      ))}

      {/* Center reward card */}
      <TouchableOpacity activeOpacity={0.9} onPress={onDismiss} style={styles.centerContainer}>
        <Animated.View style={[styles.rewardCard, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.rewardEmoji}>🎉</Text>
          <Text style={styles.rewardTitle}>VOTE LOCKED IN!</Text>

          <View style={styles.coinRewardRow}>
            <Text style={styles.coinRewardPlus}>+</Text>
            <Text style={styles.coinRewardAmount}>{coinReward}</Text>
            <Text style={styles.coinRewardLabel}>ODIN</Text>
          </View>

          {streakMultiplier > 1 && (
            <View style={styles.multiplierBadge}>
              <Text style={styles.multiplierText}>{streakMultiplier}x STREAK BONUS</Text>
            </View>
          )}

          {streakCount > 0 && (
            <View style={styles.streakRow}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={styles.streakText}>{streakCount} Day Streak</Text>
            </View>
          )}

          <Text style={styles.tapToDismiss}>Tap to continue</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.coin,
    minWidth: 260,
    shadowColor: COLORS.coin,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  rewardEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  rewardTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
  },
  coinRewardRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  coinRewardPlus: {
    color: COLORS.coin,
    fontSize: 24,
    fontWeight: '900',
  },
  coinRewardAmount: {
    color: COLORS.coin,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2,
    marginHorizontal: 4,
  },
  coinRewardLabel: {
    color: COLORS.coin,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  multiplierBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.coin,
    marginBottom: 12,
  },
  multiplierText: {
    color: COLORS.coin,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  streakFire: {
    fontSize: 20,
  },
  streakText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  tapToDismiss: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 12,
  },
});
