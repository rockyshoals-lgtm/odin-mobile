import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, StatusBar, RefreshControl, Modal, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TIER_CONFIG } from '../../constants/colors';
import { Catalyst } from '../../constants/types';
import { useCatalystStore } from '../../stores/catalystStore';
import { CatalystCard } from './CatalystCard';
import { CatalystDetail } from './CatalystDetail';
import { FilterSheet } from '../../components/Common/FilterSheet';

const TYPE_LABELS: Record<string, string> = { PDUFA: '💊 PDUFA', READOUT: '🔬 Readout', Earnings: '📊 Earnings' };

export function CatalystsScreen() {
  const { 
    getFiltered, 
    filterTier, 
    setFilterTier, 
    filterTA, 
    setFilterTA, 
    filterType, 
    setFilterType, 
    searchQuery, 
    setSearchQuery, 
    dateRange, 
    setDateRange 
  } = useCatalystStore();
  
  const [selectedCatalyst, setSelectedCatalyst] = useState<Catalyst | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // Android back button closes detail modal or filter sheet
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedCatalyst) {
        setSelectedCatalyst(null);
        return true;
      }
      if (filterSheetVisible) {
        setFilterSheetVisible(false);
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [selectedCatalyst, filterSheetVisible]);

  const filtered = useMemo(() => getFiltered(), [getFiltered, filterTier, filterTA, filterType, searchQuery, dateRange]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderCard = useCallback(({ item }: { item: Catalyst }) => (
    <CatalystCard catalyst={item} onPress={setSelectedCatalyst} />
  ), []);

  const handleClearAllFilters = useCallback(() => {
    setFilterTier(null);
    setFilterTA(null);
    setFilterType(null);
    setDateRange(30);
  }, [setFilterTier, setFilterTA, setFilterType, setDateRange]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterTier !== null) count++;
    if (filterTA !== null) count++;
    if (filterType !== null) count++;
    if (dateRange !== 30) count++;
    return count;
  }, [filterTier, filterTA, filterType, dateRange]);

  // Get active filter chips
  const getActiveFilterChips = useMemo(() => {
    const chips: Array<{ label: string; onRemove: () => void; color?: string }> = [];
    
    if (dateRange !== 30) {
      chips.push({
        label: dateRange === 365 ? '1 Year' : dateRange === 180 ? '6 Months' : `${dateRange} Days`,
        onRemove: () => setDateRange(30),
      });
    }
    
    if (filterTier) {
      const config = TIER_CONFIG[filterTier];
      chips.push({
        label: config.label,
        onRemove: () => setFilterTier(null),
        color: config.color,
      });
    }
    
    if (filterType) {
      chips.push({
        label: TYPE_LABELS[filterType] || filterType,
        onRemove: () => setFilterType(null),
      });
    }
    
    if (filterTA) {
      chips.push({
        label: filterTA,
        onRemove: () => setFilterTA(null),
      });
    }
    
    return chips;
  }, [filterTier, filterType, filterTA, dateRange, setFilterTier, setFilterType, setFilterTA, setDateRange]);

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ticker, drug, company..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearch}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Button */}
        <TouchableOpacity 
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]} 
          onPress={() => setFilterSheetVisible(true)}
        >
          <Text style={styles.filterIcon}>☰</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active Filter Chips */}
      {getActiveFilterChips.length > 0 && (
        <View style={styles.activeFiltersRow}>
          {getActiveFilterChips.map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.filterChip, chip.color && { borderColor: chip.color + '80' }]}
              onPress={chip.onRemove}
            >
              <Text style={[styles.filterChipText, chip.color && { color: chip.color }]}>
                {chip.label}
              </Text>
              <Text style={[styles.filterChipClose, chip.color && { color: chip.color }]}>✕</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.clearAllChip} onPress={handleClearAllFilters}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

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
            <Text style={styles.emptySubtext}>
              {activeFilterCount > 0 ? 'Try adjusting or clearing your filters' : 'No events found in this date range'}
            </Text>
            {activeFilterCount > 0 && (
              <TouchableOpacity style={styles.emptyButton} onPress={handleClearAllFilters}>
                <Text style={styles.emptyButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Filter Sheet Modal */}
      <FilterSheet
        visible={filterSheetVisible}
        onClose={() => setFilterSheetVisible(false)}
        filterTier={filterTier}
        setFilterTier={setFilterTier}
        filterTA={filterTA}
        setFilterTA={setFilterTA}
        filterType={filterType}
        setFilterType={setFilterType}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onClearAll={handleClearAllFilters}
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
    paddingBottom: 12,
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
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 8,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 14,
    paddingVertical: 10,
  },
  clearSearch: {
    padding: 4,
  },
  clearSearchText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: COLORS.accentBg,
    borderColor: COLORS.accent,
  },
  filterIcon: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: COLORS.bg,
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipClose: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  clearAllChip: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearAllText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
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
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: COLORS.accentBg,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  emptyButtonText: {
    color: COLORS.accentLight,
    fontSize: 14,
    fontWeight: '700',
  },
});
