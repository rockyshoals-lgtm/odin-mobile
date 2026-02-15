import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TIER_CONFIG, TierKey } from '../../constants/colors';

interface TierBadgeProps {
  tier: string;
  prob?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function TierBadge({ tier, prob, size = 'md' }: TierBadgeProps) {
  const config = TIER_CONFIG[tier as TierKey] || TIER_CONFIG.TIER_4;
  const dimensions = size === 'lg' ? 56 : size === 'md' ? 44 : 32;
  const fontSize = size === 'lg' ? 11 : size === 'md' ? 9 : 7;
  const probSize = size === 'lg' ? 16 : size === 'md' ? 13 : 10;

  return (
    <View style={[styles.badge, {
      width: dimensions,
      height: dimensions,
      borderRadius: dimensions / 2,
      backgroundColor: config.bg,
      borderColor: config.color,
    }]}>
      <Text style={[styles.tierLabel, { fontSize, color: config.color }]}>
        {config.label}
      </Text>
      {prob !== undefined && (
        <Text style={[styles.probLabel, { fontSize: probSize, color: config.color }]}>
          {Math.round(prob * 100)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierLabel: {
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: -1,
  },
  probLabel: {
    fontWeight: '800',
    marginTop: -2,
  },
});
