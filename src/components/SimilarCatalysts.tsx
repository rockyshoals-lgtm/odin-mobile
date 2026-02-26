/**
 * SimilarCatalysts — Horizontal Scrollable Recommendations
 *
 * P2-003: Shows 3-5 catalysts in same therapeutic area, similar
 * ODIN tier, or same sponsor. Tappable cards that navigate to
 * catalyst detail.
 *
 * @module SimilarCatalysts
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, TIER_CONFIG, TierKey } from '../constants/colors';
import { Catalyst } from '../constants/types';
import { useCatalystStore } from '../stores/catalystStore';
import { fmtProb, fmtDaysUntil } from '../utils/formatting';

interface Props {
  catalyst: Catalyst;
  onSelectCatalyst?: (catalyst: Catalyst) => void;
}

export function SimilarCatalysts({ catalyst, onSelectCatalyst }: Props) {
  const catalysts = useCatalystStore((s) => s.catalysts);

  const similar = useMemo(() => {
    const now = new Date();
    const candidates = catalysts.filter(
      (c) =>
        c.id !== catalyst.id &&
        new Date(c.date) >= now && // Only upcoming
        c.type === 'PDUFA' &&
        c.prob > 0
    );

    // Score similarity: same TA +3, same tier +2, same company +2
    const scored = candidates.map((c) => {
      let score = 0;
      if (c.ta === catalyst.ta) score += 3;
      if (c.tier === catalyst.tier) score += 2;
      if (c.company === catalyst.company) score += 2;
      return { catalyst: c, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.catalyst);
  }, [catalysts, catalyst]);

  if (similar.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SIMILAR CATALYSTS</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {similar.map((c) => {
          const tierConfig = TIER_CONFIG[c.tier as TierKey] || TIER_CONFIG.TIER_4;
          return (
            <TouchableOpacity
              key={c.id}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => onSelectCatalyst?.(c)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTicker}>{c.ticker}</Text>
                <View style={[styles.cardTierBadge, { backgroundColor: tierConfig.bg, borderColor: tierConfig.color }]}>
                  <Text style={[styles.cardTierText, { color: tierConfig.color }]}>{c.tier}</Text>
                </View>
              </View>
              <Text style={styles.cardDrug} numberOfLines={1}>{c.drug}</Text>
              <Text style={styles.cardTa} numberOfLines={1}>{c.ta}</Text>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardProb, { color: tierConfig.color }]}>{fmtProb(c.prob)}</Text>
                <Text style={styles.cardDate}>{fmtDaysUntil(c.date)}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  scrollContent: {
    gap: 10,
    paddingRight: 4,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 12,
    width: 150,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTicker: {
    color: COLORS.accentLight,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardTierBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  cardTierText: {
    fontSize: 8,
    fontWeight: '700',
  },
  cardDrug: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardTa: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardProb: {
    fontSize: 13,
    fontWeight: '800',
  },
  cardDate: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
});
