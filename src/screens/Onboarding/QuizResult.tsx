// ODIN Mobile — Quiz Result Screen
// Shows experience level + routes beginners to tutorial

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';
import { ExperienceLevel } from './OptionsQuiz';

const { width } = Dimensions.get('window');

interface ResultConfig {
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  advice: string;
  color: string;
  buttonText: string;
  showTutorial: boolean;
}

const RESULTS: Record<ExperienceLevel, ResultConfig> = {
  BEGINNER: {
    emoji: '🌱',
    title: 'FRESH EYES',
    subtitle: "Welcome to the arena",
    description: "No worries — everyone starts somewhere. Options can seem scary, but they're really just tools. We built something to walk you through everything before you start paper trading.",
    advice: "We recommend starting with our quick tutorial, then experimenting with paper money. Zero risk, all learning.",
    color: COLORS.tier1,
    buttonText: "TEACH ME EVERYTHING",
    showTutorial: true,
  },
  INTERMEDIATE: {
    emoji: '⚡',
    title: 'SOLID FOUNDATION',
    subtitle: "You know your way around",
    description: "You've got the basics down — calls, puts, maybe a straddle or two. ODIN's paper trading is perfect for sharpening your biotech catalyst strategies.",
    advice: "Try the interval returns feature to find optimal entry points, and experiment with straddles around PDUFA dates. Paper money means you can go wild.",
    color: COLORS.accent,
    buttonText: "LET'S TRADE",
    showTutorial: false,
  },
  ADVANCED: {
    emoji: '🔬',
    title: 'MARKET SURGEON',
    subtitle: "Greeks flow through your veins",
    description: "You're managing delta, selling premium, and reading skew. ODIN gives you the edge — 96% accuracy probability scoring on FDA catalysts, paired with your options expertise.",
    advice: "Go straight to the options chain. Check IV derived from ODIN's probability model and catalyst proximity. The straddle strategies around PDUFA dates are where the alpha is.",
    color: COLORS.coin,
    buttonText: "SHOW ME THE ALPHA",
    showTutorial: false,
  },
};

interface Props {
  level: ExperienceLevel;
  onStartTutorial: () => void;
  onSkipToApp: () => void;
}

export function QuizResult({ level, onStartTutorial, onSkipToApp }: Props) {
  const result = RESULTS[level];
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(contentFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Result badge */}
      <Animated.View style={[styles.badgeContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.resultEmoji}>{result.emoji}</Text>
        <View style={[styles.levelBadge, { borderColor: result.color + '60' }]}>
          <Text style={[styles.levelText, { color: result.color }]}>{result.title}</Text>
        </View>
        <Text style={styles.resultSubtitle}>{result.subtitle}</Text>
      </Animated.View>

      {/* Description */}
      <Animated.View style={[styles.content, { opacity: contentFade }]}>
        <View style={styles.descriptionCard}>
          <Text style={styles.description}>{result.description}</Text>
        </View>

        <View style={[styles.adviceCard, { borderColor: result.color + '30' }]}>
          <Text style={styles.adviceLabel}>ODIN RECOMMENDS</Text>
          <Text style={styles.adviceText}>{result.advice}</Text>
        </View>
      </Animated.View>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: contentFade }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { borderColor: result.color }]}
          onPress={result.showTutorial ? onStartTutorial : onSkipToApp}
          activeOpacity={0.8}
        >
          <Text style={[styles.primaryButtonText, { color: result.color }]}>{result.buttonText}</Text>
        </TouchableOpacity>

        {result.showTutorial && (
          <TouchableOpacity style={styles.skipButton} onPress={onSkipToApp}>
            <Text style={styles.skipText}>Skip — I'll figure it out</Text>
          </TouchableOpacity>
        )}

        {!result.showTutorial && (
          <TouchableOpacity style={styles.skipButton} onPress={onStartTutorial}>
            <Text style={styles.skipText}>Show me the tutorial anyway</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  levelBadge: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 8,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
  resultSubtitle: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  content: {
    marginBottom: 28,
  },
  descriptionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  adviceCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  adviceLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  adviceText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
