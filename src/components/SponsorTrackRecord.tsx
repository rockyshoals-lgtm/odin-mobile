/**
 * SponsorTrackRecord — Company's PDUFA History Mini-Card
 *
 * P2-003: Shows the sponsor's last 5 PDUFA outcomes with approval rate.
 * Data is sourced from CATALYSTS_DATA filtered by company name.
 *
 * @module SponsorTrackRecord
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { Catalyst } from '../constants/types';
import { useCatalystStore } from '../stores/catalystStore';

interface Props {
  company: string;
  currentCatalystId: string;
}

export function SponsorTrackRecord({ company, currentCatalystId }: Props) {
  const catalysts = useCatalystStore((s) => s.catalysts);

  const { pastCatalysts, approvalRate } = useMemo(() => {
    const now = new Date();
    const companyPast = catalysts
      .filter(
        (c) =>
          c.company === company &&
          c.id !== currentCatalystId &&
          c.type === 'PDUFA' &&
          new Date(c.date) < now
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const total = companyPast.length;
    const approved = companyPast.filter((c) => c.tier === 'TIER_1' || c.tier === 'TIER_2').length;
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

    return { pastCatalysts: companyPast, approvalRate: rate };
  }, [catalysts, company, currentCatalystId]);

  if (pastCatalysts.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SPONSOR TRACK RECORD</Text>
      <Text style={styles.subtitle}>
        {company} — {pastCatalysts.length} past PDUFA{pastCatalysts.length !== 1 ? 's' : ''}
      </Text>

      {/* Approval Rate Bar */}
      <View style={styles.rateRow}>
        <View style={styles.rateBarBg}>
          <View style={[styles.rateBarFill, { width: `${approvalRate}%` }]} />
        </View>
        <Text style={styles.rateText}>{approvalRate}%</Text>
      </View>

      {/* Past Catalysts List */}
      {pastCatalysts.map((c) => {
        const isHighTier = c.tier === 'TIER_1' || c.tier === 'TIER_2';
        return (
          <View key={c.id} style={styles.pastRow}>
            <Text style={[styles.pastIcon, { color: isHighTier ? COLORS.approve : COLORS.crl }]}>
              {isHighTier ? '✓' : '✗'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.pastDrug} numberOfLines={1}>{c.drug}</Text>
              <Text style={styles.pastDate}>{c.date}</Text>
            </View>
            <Text style={[styles.pastTier, { color: isHighTier ? COLORS.approve : COLORS.crl }]}>
              {c.tier}
            </Text>
          </View>
        );
      })}
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
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 10,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rateBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  rateBarFill: {
    height: '100%',
    backgroundColor: COLORS.approve,
    borderRadius: 3,
  },
  rateText: {
    color: COLORS.approve,
    fontSize: 13,
    fontWeight: '800',
    width: 36,
    textAlign: 'right',
  },
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pastIcon: {
    fontSize: 14,
    fontWeight: '900',
    width: 18,
    textAlign: 'center',
  },
  pastDrug: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  pastDate: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  pastTier: {
    fontSize: 10,
    fontWeight: '700',
  },
});
