import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, StatusBar, RefreshControl, Modal, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TIER_CONFIG } from '../../constants/colors';
import { Catalyst } from '../../constants/types';
import { useCatalystStore } from '../../stores/catalystStore';
import { CatalystCard } from './CatalystCard';
import { CatalystDetail } from './CatalystDetail';

const TIER_FILTERS = [null, 'TIER_1', 'TIER_2', 'TIER_3', 'TIER_4'] as const;
const DATE_RANGES = [30, 60, 90] as const;
const TA_LIST = ['Oncology', 'CNS', 'Cardiology', 'Immunology', 'Rare Disease', 'Infectious Disease', 'Dermatology', 'Ophthalmology', 'Hematology', 'Metabolic'];

export function CatalystsScreen() {
  const { getFiltered, filterTier, setFilterTier, filterTA, setFilterTA, searchQuery, setSearchQuery, dateRange, setDateRange } = useCatalystStore();
  const [selectedCatalyst, setSelectedCatalyst] = useState<Catalyst | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Android back button closes detail modal
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedCatalyst) {
        setSelectedCatalyst(null);
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [selectedCatalyst]);

  const filtered = useMemo(() => getFiltered(), [getFiltered, filterTier, filterTA, searchQuery, dateRange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderCard = useCallback(({ item }: { item: Catalyst }) => (
    <CatalystCard catalyst={item} onPress={setSelectedCatalyst} />
  ), []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>ODIN</Text>
          <Text style={styles.subtitle}>FDA Catalyst Intelligence</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length}</Text>
          <Text style={styles.countLabel}>Events</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search ticker, drug, company..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Date Range Tabs */}
      <View style={styles.filterRow}>
        {DATE_RANGES.map(range => (
          <TouchableOpacity
            key={range}
            style={[styles.rangeTab, dateRange === range && styles.rangeTabActive]}
            onPress={() => setDateRange(range)}
          >
            <Text style={[styles.rangeText, dateRange === range && styles.rangeTextActive]}>
              {range}d
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.divider} />
        {/* Tier Filters */}
        {TIER_FILTERS.map(tier => {
          const isActive = filterTier === tier;
          const config = tier ? TIER_CONFIG[tier] : null;
          return (
            <TouchableOpacity
              key={tier || 'all'}
              style={[styles.tierTab, isActive && styles.tierTabActive, isActive && config && { borderColor: config.color }]}
              onPress={() => setFilterTier(tier)}
            >
              <Text style={[styles.tierText, isActive && config && { color: config.color }, isActive && !config && { color: COLORS.accentLight }]}>
                {tier ? config?.label : 'ALL'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* TA Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.taPills} contentContainerStyle={styles.taPillsContent}>
        <TouchableOpacity
          style={[styles.taPill, !filterTA && styles.taPillActive]}
          onPress={() => setFilterTA(null)}
        >
          <Text style={[styles.taPillText, !filterTA && styles.taPillTextActive]}>All TAs</Text>
        </TouchableOpacity>
        {TA_LIST.map(ta => (
          <TouchableOpacity
            key={ta}
            style={[styles.taPill, filterTA === ta && styles.taPillActive]}
            onPress={() => setFilterTA(filterTA === ta ? null : ta)}
          >
            <Text style={[styles.taPillText, filterTA === ta && styles.taPillTextActive]}>{ta}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Catalyst List */}
      <FlatList
        data={filtered}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accentLight} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No catalysts match your filters</Text>
            <Text style={styles.emptySubtext}>Try adjusting the date range or tier filter</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal visible={!!selectedCatalyst} animationType="slide" transparent>
        {selectedCatalyst && (
          <CatalystDetail catalyst={selectedCatalyst} onClose={() => setSelectedCatalyst(null)} />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  logo: {
    color: COLORS.accentLight,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  countText: {
    color: COLORS.accentLight,
    fontSize: 20,
    fontWeight: '800',
  },
  countLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 6,
    marginBottom: 6,
  },
  rangeTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.bgInput,
  },
  rangeTabActive: {
    backgroundColor: COLORS.accentBg,
  },
  rangeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  rangeTextActive: {
    color: COLORS.accentLight,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  tierTab: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tierTabActive: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    borderColor: COLORS.accentLight,
  },
  tierText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  taPills: {
    maxHeight: 34,
    marginBottom: 6,
  },
  taPillsContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  taPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  taPillActive: {
    backgroundColor: COLORS.accentBg,
    borderColor: COLORS.accent,
  },
  taPillText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  taPillTextActive: {
    color: COLORS.accentLight,
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
});
