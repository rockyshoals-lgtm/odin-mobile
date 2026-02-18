import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { daysUntil, fmtDaysUntil } from '../../utils/formatting';

interface CountdownChipProps {
  date: string;
}

export function CountdownChip({ date }: CountdownChipProps) {
  const days = daysUntil(date);
  const label = fmtDaysUntil(date);

  let bg: string = COLORS.bgInput;
  let color: string = COLORS.textSecondary;

  if (days <= 0) {
    bg = 'rgba(34, 197, 94, 0.2)';
    color = COLORS.approve;
  } else if (days <= 7) {
    bg = 'rgba(239, 68, 68, 0.2)';
    color = COLORS.crl;
  } else if (days <= 14) {
    bg = 'rgba(234, 179, 8, 0.2)';
    color = COLORS.delayed;
  }

  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
