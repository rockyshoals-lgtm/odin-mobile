// ODIN Mobile — Trade History Screen
// Shows all historical trades with filtering and P&L tracking

import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { usePaperTradeStore } from '../../stores/paperTradeStore';
import { fmtDollar, fmtPnL, pnlColor } from '../../utils/tradingUtils';
import { Trade } from '../../constants/tradingTypes';

type FilterTab = 'ALL' | 'BUYS' | 'SELLS';

export function TradeHistoryScreen() {
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const { tradeHistory } = usePaperTradeStore();

  const filteredTrades = useMemo(() => {
    switch (filterTab) {
      case 'BUYS':
        return tradeHistory.filter(t => t.side === 'BUY');
      case 'SELLS':
        return tradeHistory.filter(t => t.side === 'SELL');
      case 'ALL':
      default:
        return tradeHistory;
    }
  }, [tradeHistory, filterTab]);

  const renderTradeRow = ({ item }: { item: Trade }) => {
    const sideColor = item.side === 'BUY' ? COLORS.approve : COLORS.error;
    const isClosedTrade = item.side === 'SELL' && item.pnl !== undefined;
    const timestamp = new Date(item.executedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.tradeRow}>
        <View style={styles.tradeMainInfo}>
          <View style={styles.tradeHeader}>
            <Text style={styles.tradeTicker}>{item.ticker}</Text>
            <View
              style={[
                styles.sideBadge,
                { backgroundColor: sideColor },
              ]}
            >
              <Text style={styles.sideBadgeText}>{item.side}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>{timestamp}</Text>
        </View>

        <View style={styles.tradeDetailColumn}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Qty</Text>
            <Text style={styles.detailValue}>{item.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price</Text>
            <Text style={styles.detailValue}>{fmtDollar(item.executedPrice)}</Text>
          </View>
        </View>

        <View style={styles.tradeValueColumn}>
          <Text style={styles.totalValue}>{fmtDollar(item.totalValue)}</Text>
          {isClosedTrade && (
            <Text style={[styles.pnlValue, { color: pnlColor(item.pnl || 0) }]}>
              {fmtPnL(item.pnl || 0)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📊</Text>
      <Text style={styles.emptyStateText}>No trades yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Start trading to see your history here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>TRADE HISTORY</Text>
          <Text style={styles.subtitle}>Total: {tradeHistory.length} trades</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        {(['ALL', 'BUYS', 'SELLS'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterTab,
              filterTab === tab && styles.filterTabActive,
            ]}
            onPress={() => setFilterTab(tab)}
          >
            <Text
              style={[
                styles.filterTabText,
                filterTab === tab && styles.filterTabTextActive,
              ]}
            >
              {tab === 'ALL'
                ? 'All'
                : tab === 'BUYS'
                  ? 'Buy Orders'
                  : 'Sell Orders'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trade History List */}
      <FlatList
        data={filteredTrades}
        renderItem={renderTradeRow}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          filteredTrades.length === 0 && styles.listContentEmpty,
        ]}
        scrollEnabled={filteredTrades.length > 0}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.bgInput,
  },
  filterTabActive: {
    backgroundColor: COLORS.accentBg,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  filterTabText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  filterTabTextActive: {
    color: COLORS.accentLight,
  },

  // List
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Trade Row
  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  tradeMainInfo: {
    flex: 1,
    gap: 4,
  },
  tradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tradeTicker: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sideBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },

  // Trade Detail Columns
  tradeDetailColumn: {
    gap: 4,
  },
  detailRow: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  tradeValueColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  totalValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  pnlValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyStateText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyStateSubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
