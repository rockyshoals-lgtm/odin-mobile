// ODIN Mobile — Greeks Display Component
// Shows option Greeks in a 2x2 grid with descriptions

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { OptionGreeks } from '../../constants/tradingTypes';

interface GreeksDisplayProps {
  greeks: OptionGreeks;
}

export function GreeksDisplay({ greeks }: GreeksDisplayProps) {
  const greekItems = [
    {
      label: 'Delta (Δ)',
      value: (greeks?.delta ?? 0).toFixed(4),
      description: 'Price sensitivity',
    },
    {
      label: 'Gamma (Γ)',
      value: (greeks?.gamma ?? 0).toFixed(4),
      description: 'Delta change rate',
    },
    {
      label: 'Theta (Θ)',
      value: (greeks?.theta ?? 0).toFixed(4),
      description: 'Time decay $/day',
    },
    {
      label: 'Vega (ν)',
      value: (greeks?.vega ?? 0).toFixed(4),
      description: 'IV sensitivity',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Option Greeks</Text>
      <View style={styles.grid}>
        {greekItems.map((item, idx) => (
          <View key={idx} style={styles.greekCard}>
            <Text style={styles.greekLabel}>{item.label}</Text>
            <Text style={styles.greekValue}>{item.value}</Text>
            <Text style={styles.greekDescription}>{item.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 12,
  },

  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  greekCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 12,
    gap: 4,
    alignItems: 'center',
  },

  greekLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  greekValue: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: '900',
    marginVertical: 2,
  },

  greekDescription: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '500',
    textAlign: 'center',
  },
});
