import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { COLORS, TIER_CONFIG } from '../../constants/colors';

const TIER_FILTERS = [null, 'TIER_1', 'TIER_2', 'TIER_3', 'TIER_4'] as const;
const DATE_RANGES = [30, 60, 90, 180, 365] as const;
const TYPE_FILTERS = [null, 'PDUFA', 'READOUT', 'Earnings'] as const;
const TYPE_LABELS: Record<string, string> = { PDUFA: '💊 PDUFA', READOUT: '🔬 Readout', Earnings: '📊 Earnings' };
const TA_LIST = ['Oncology', 'CNS', 'Cardiology', 'Immunology', 'Rare Disease', 'Infectious Disease', 'Dermatology', 'Ophthalmology', 'Hematology', 'Metabolic', 'GI/Hepatology'];

type TierFilter = typeof TIER_FILTERS[number];
type TypeFilter = typeof TYPE_FILTERS[number];

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filterTier: TierFilter;
  setFilterTier: (tier: TierFilter) => void;
  filterTA: string | null;
  setFilterTA: (ta: string | null) => void;
  filterType: TypeFilter;
  setFilterType: (type: TypeFilter) => void;
  dateRange: number;
  setDateRange: (range: number) => void;
  onClearAll: () => void;
}

export function FilterSheet({
  visible,
  onClose,
  filterTier,
  setFilterTier,
  filterTA,
  setFilterTA,
  filterType,
  setFilterType,
  dateRange,
  setDateRange,
  onClearAll,
}: FilterSheetProps) {
  const hasActiveFilters = filterTier !== null || filterTA !== null || filterType !== null || dateRange !== 30;

  const handleClearAll = () => {
    onClearAll();
  };

  const handleApply = () => {
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter Catalysts</Text>
              {hasActiveFilters && (
                <Text style={styles.activeCount}>Active filters applied</Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Date Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <View style={styles.optionsRow}>
                {DATE_RANGES.map(range => (
                  <TouchableOpacity
                    key={range}
                    style={[styles.option, dateRange === range && styles.optionActive]}
                    onPress={() => setDateRange(range)}
                  >
                    <Text style={[styles.optionText, dateRange === range && styles.optionTextActive]}>
                      {range === 365 ? '1 Year' : range === 180 ? '6 Months' : `${range} Days`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tier Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tier Priority</Text>
              <View style={styles.optionsRow}>
                {TIER_FILTERS.map(tier => {
                  const isActive = filterTier === tier;
                  const config = tier ? TIER_CONFIG[tier] : null;
                  return (
                    <TouchableOpacity
                      key={tier || 'all'}
                      style={[
                        styles.option,
                        isActive && styles.optionActive,
                        isActive && config && { borderColor: config.color, backgroundColor: config.color + '15' },
                      ]}
                      onPress={() => setFilterTier(tier)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          isActive && config && { color: config.color },
                          isActive && !config && { color: COLORS.accentLight },
                        ]}
                      >
                        {tier ? config?.label : 'All Tiers'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Catalyst Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Catalyst Type</Text>
              <View style={styles.optionsRow}>
                {TYPE_FILTERS.map(type => {
                  const isActive = filterType === type;
                  const bgColor = type === 'Earnings' ? COLORS.earningsBg : type === 'READOUT' ? COLORS.readoutBg : type === 'PDUFA' ? COLORS.pdufaBg : COLORS.accentBg;
                  const fgColor = type === 'Earnings' ? COLORS.earnings : type === 'READOUT' ? COLORS.readout : type === 'PDUFA' ? COLORS.pdufa : COLORS.accentLight;
                  return (
                    <TouchableOpacity
                      key={type || 'all-types'}
                      style={[
                        styles.option,
                        isActive && { backgroundColor: bgColor, borderColor: fgColor },
                      ]}
                      onPress={() => setFilterType(type as any)}
                    >
                      <Text style={[styles.optionText, isActive && { color: fgColor }]}>
                        {type ? TYPE_LABELS[type] || type : '🎯 All Types'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Therapeutic Area */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Therapeutic Area</Text>
              <View style={styles.optionsGrid}>
                <TouchableOpacity
                  style={[styles.taOption, !filterTA && styles.taOptionActive]}
                  onPress={() => setFilterTA(null)}
                >
                  <Text style={[styles.taOptionText, !filterTA && styles.taOptionTextActive]}>All Areas</Text>
                </TouchableOpacity>
                {TA_LIST.map(ta => (
                  <TouchableOpacity
                    key={ta}
                    style={[styles.taOption, filterTA === ta && styles.taOptionActive]}
                    onPress={() => setFilterTA(filterTA === ta ? null : ta)}
                  >
                    <Text style={[styles.taOptionText, filterTA === ta && styles.taOptionTextActive]}>{ta}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerBtn, styles.clearBtn]}
              onPress={handleClearAll}
              disabled={!hasActiveFilters}
            >
              <Text style={[styles.clearBtnText, !hasActiveFilters && styles.btnDisabled]}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerBtn, styles.applyBtn]} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeCount: {
    color: COLORS.accentLight,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: COLORS.accentBg,
    borderColor: COLORS.accent,
  },
  optionText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  optionTextActive: {
    color: COLORS.accentLight,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taOptionActive: {
    backgroundColor: COLORS.accentBg,
    borderColor: COLORS.accent,
  },
  taOptionText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  taOptionTextActive: {
    color: COLORS.accentLight,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtn: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearBtnText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: COLORS.accentBg,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  applyBtnText: {
    color: COLORS.accentLight,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  btnDisabled: {
    opacity: 0.4,
  },
});
