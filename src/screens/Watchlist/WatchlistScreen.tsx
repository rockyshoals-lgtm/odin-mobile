import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { useCatalystStore } from '../../stores/catalystStore';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { CatalystCard } from '../Catalysts/CatalystCard';
import { CatalystDetail } from '../Catalysts/CatalystDetail';
import { Catalyst } from '../../constants/types';

type SortOption = 'date' | 'ticker' | 'tier';

export function WatchlistScreen() {
  const { catalysts } = useCatalystStore();
  const { watchedIds } = useWatchlistStore();
  const [selectedCatalyst, setSelectedCatalyst] = useState<Catalyst | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Android back button closes detail modal or sort menu
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (selectedCatalyst) {
        setSelectedCatalyst(null);
        return true;
      }
      if (showSortMenu) {
        setShowSortMenu(false);
        return true;
      }
      return false;
    });
    return () => handler.remove();
  }, [selectedCatalyst, showSortMenu]);

  const watchedCatalysts = useMemo(() => {
    const filtered = catalysts.filter(c => watchedIds.includes(c.id));
    
    // Sort based on selected option
    switch (sortBy) {
      case 'date':
        return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'ticker':
        return filtered.sort((a, b) => a.ticker.localeCompare(b.ticker));
      case 'tier':
        return filtered.sort((a, b) => {
          const tierOrder = { TIER_1: 1, TIER_2: 2, TIER_3: 3, TIER_4: 4 };
          const aTier = tierOrder[a.tier as keyof typeof tierOrder] || 999;
          const bTier = tierOrder[b.tier as keyof typeof tierOrder] || 999;
          return aTier - bTier;
        });
      default:
        return filtered;
    }
  }, [catalysts, watchedIds, sortBy]);

  const sortOptions: Array<{ value: SortOption; label: string; icon: string }> = [
    { value: 'date', label: 'Date', icon: '📅' },
    { value: 'ticker', label: 'Ticker', icon: '🔤' },
    { value: 'tier', label: 'Priority', icon: '⭐' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>WATCHLIST</Text>
          <Text style={styles.subtitle}>
            {watchedCatalysts.length > 0 
              ? `${watchedCatalysts.length} catalyst${watchedCatalysts.length !== 1 ? 's' : ''} tracked`
              : 'No catalysts tracked yet'
            }
          </Text>
        </View>
        
        {watchedCatalysts.length > 0 && (
          <TouchableOpacity 
            style={styles.sortBtn} 
            onPress={() => setShowSortMenu(!showSortMenu)}
          >
            <Text style={styles.sortIcon}>↕️</Text>
            <Text style={styles.sortText}>Sort</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sort Menu */}
      {showSortMenu && watchedCatalysts.length > 0 && (
        <View style={styles.sortMenu}>
          {sortOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[styles.sortOption, sortBy === option.value && styles.sortOptionActive]}
              onPress={() => {
                setSortBy(option.value);
                setShowSortMenu(false);
              }}
            >
              <Text style={styles.sortOptionIcon}>{option.icon}</Text>
              <Text style={[styles.sortOptionText, sortBy === option.value && styles.sortOptionTextActive]}>
                {option.label}
              </Text>
              {sortBy === option.value && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Watchlist Content */}
      {watchedCatalysts.length > 0 ? (
        <FlatList
          data={watchedCatalysts}
          renderItem={({ item }) => <CatalystCard catalyst={item} onPress={setSelectedCatalyst} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>☆</Text>
          <Text style={styles.emptyTitle}>Start Building Your Watchlist</Text>
          <Text style={styles.emptyText}>
            Tap the star icon ★ on any catalyst card to add it here.{' \n\n'}
            You'll get push notifications when watched events are approaching.
          </Text>
          <View style={styles.emptyTip}>
            <Text style={styles.emptyTipIcon}>💡</Text>
            <Text style={styles.emptyTipText}>
              <Text style={styles.emptyTipBold}>Pro tip:</Text> Start with high-priority (Tier 1) catalysts for the biggest opportunities.
            </Text>
          </View>
        </View>
      )}

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
    backgroundColor: COLORS.bg 
  },
  header: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20, 
    paddingTop: 4, 
    paddingBottom: 12,
  },
  title: { 
    color: COLORS.textPrimary, 
    fontSize: 22, 
    fontWeight: '900', 
    letterSpacing: 2 
  },
  subtitle: { 
    color: COLORS.textMuted, 
    fontSize: 12,
    marginTop: 2,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortIcon: {
    fontSize: 14,
  },
  sortText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  sortMenu: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  sortOptionActive: {
    backgroundColor: COLORS.accentBg,
  },
  sortOptionIcon: {
    fontSize: 16,
  },
  sortOptionText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  sortOptionTextActive: {
    color: COLORS.accentLight,
    fontWeight: '700',
  },
  checkmark: {
    color: COLORS.accentLight,
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: { 
    paddingTop: 6, 
    paddingBottom: 100 
  },
  emptyState: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 40 
  },
  emptyIcon: { 
    fontSize: 64, 
    color: COLORS.coin, 
    marginBottom: 16 
  },
  emptyTitle: { 
    color: COLORS.textPrimary, 
    fontSize: 20, 
    fontWeight: '800', 
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: { 
    color: COLORS.textMuted, 
    fontSize: 14, 
    textAlign: 'center', 
    lineHeight: 22,
  },
  emptyTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.accentBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
  },
  emptyTipIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  emptyTipText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  emptyTipBold: {
    color: COLORS.accentLight,
    fontWeight: '700',
  },
});
