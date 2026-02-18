// ODIN Mobile — Catalyst Interval Returns Card
// Shows expected returns at T-60, T-45, T-30, T-14, T-7, T-1

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, TIER_CONFIG, TierKey } from '../../constants/colors';
import { Catalyst } from '../../constants/types';
import { CatalystReturnsService } from '../../services/catalystReturnsService';
import { CatalystIntervalReturn } from '../../constants/tradingTypes';
import { daysUntil } from '../../utils/formatting';

interface Props {
  catalyst: Catalyst;
  currentPrice?: number;
}

export function IntervalReturnsCard({ catalyst, currentPrice }: Props) {
  const returns = CatalystReturnsService.getIntervalReturns(catalyst);
  if (!returns || returns.length === 0) return null;

  const optimal = CatalystReturnsService.getOptimalEntry(catalyst);
  const days = daysUntil(catalyst.date);
  const tierConfig = TIER_CONFIG[catalyst.tier as TierKey] || TIER_CONFIG.TIER_4;

  // Max return for bar scaling
  const maxReturn = Math.max(...returns.map(r => r.expectedReturnPct), 1);

  // Current interval (highlight where we are now)
  const getCurrentInterval = (): string | null => {
    if (days > 60) return null;
    if (days > 45) return 'T-60';
    if (days > 30) return 'T-45';
    if (days > 14) return 'T-30';
    if (days > 7) return 'T-14';
    if (days > 1) return 'T-7';
    return 'T-1';
  };

  const currentInterval = getCurrentInterval();

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>EXPECTED RETURNS BY ENTRY</Text>
        <View style={[styles.optimalBadge, { borderColor: tierConfig.color }]}>
          <Text style={[styles.optimalText, { color: tierConfig.color }]}>Optimal: {optimal}</Text>
        </View>
      </View>

      {returns.map(r => {
        const isCurrent = r.interval === currentInterval;
        const isOptimal = r.interval === optimal;
        const barWidth = (r.expectedReturnPct / maxReturn) * 100;
        const dollarReturn = currentPrice ? Math.round((currentPrice * r.expectedReturnPct / 100) * 100) / 100 : null;

        return (
          <View key={r.interval} style={[styles.row, isCurrent && styles.rowCurrent]}>
            <View style={styles.intervalCol}>
              <Text style={[styles.interval, isCurrent && { color: COLORS.accentLight, fontWeight: '900' }]}>
                {r.interval}
                {isCurrent ? ' ◀' : ''}
              </Text>
              <Text style={styles.daysLabel}>{r.daysBeforeCatalyst}d before</Text>
            </View>

            <View style={styles.barCol}>
              <View style={styles.barBg}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.min(barWidth, 100)}%`,
                      backgroundColor: isOptimal ? tierConfig.color : COLORS.accent,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.returnCol}>
              <Text style={[styles.returnPct, isOptimal && { color: tierConfig.color }]}>
                +{r.expectedReturnPct.toFixed(1)}%
              </Text>
              {dollarReturn !== null && (
                <Text style={styles.returnDollar}>+${dollarReturn.toFixed(2)}/shr</Text>
              )}
            </View>

            <View style={styles.rangeCol}>
              <Text style={styles.rangeText}>{r.p10.toFixed(0)}% – {r.p90.toFixed(0)}%</Text>
            </View>
          </View>
        );
      })}

      <Text style={styles.disclaimer}>
        Based on ODIN historical data across {returns[0]?.sampleSize || 150}+ events. Past performance ≠ future results.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  optimalBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, borderWidth: 1 },
  optimalText: { fontSize: 10, fontWeight: '700' },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowCurrent: { backgroundColor: COLORS.accentBg, marginHorizontal: -14, paddingHorizontal: 14, borderRadius: 6 },

  intervalCol: { width: 60 },
  interval: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  daysLabel: { color: COLORS.textMuted, fontSize: 9 },

  barCol: { flex: 1, marginHorizontal: 8 },
  barBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  returnCol: { width: 70, alignItems: 'flex-end' },
  returnPct: { color: COLORS.approve, fontSize: 13, fontWeight: '800' },
  returnDollar: { color: COLORS.textMuted, fontSize: 9 },

  rangeCol: { width: 65, alignItems: 'flex-end' },
  rangeText: { color: COLORS.textMuted, fontSize: 9 },

  disclaimer: { color: COLORS.textMuted, fontSize: 9, marginTop: 10, fontStyle: 'italic', lineHeight: 14 },
});
