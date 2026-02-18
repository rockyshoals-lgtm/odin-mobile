// ODIN Mobile — Portfolio Screen
// Shows account summary, open positions, P&L, and trade stats

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { usePaperTradeStore } from '../../stores/paperTradeStore';
import { useMarketDataStore } from '../../stores/marketDataStore';
import { fmtDollar, fmtPnL, fmtPnLPct, fmtPrice, fmtMarketCap, pnlColor } from '../../utils/tradingUtils';
import { Position } from '../../constants/tradingTypes';

export function PortfolioScreen({ onTrade }: { onTrade?: (ticker: string) => void }) {
  const { account, positions, optionPositions, tradeHistory, getPortfolioMetrics, updatePrices, resetAccount } = usePaperTradeStore();
  const { fetchQuotes, isRefreshing, quotes } = useMarketDataStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const metrics = getPortfolioMetrics();
  const positionList = Object.values(positions);
  const optionList = Object.values(optionPositions);

  // Refresh prices for held positions
  const refreshPrices = async () => {
    setRefreshing(true);
    const tickers = positionList.map(p => p.ticker);
    if (tickers.length > 0) {
      await fetchQuotes(tickers);
      // Update positions with fresh prices
      const newPrices: Record<string, number> = {};
      tickers.forEach(t => {
        const q = useMarketDataStore.getState().quotes[t];
        if (q) newPrices[t] = q.price;
      });
      if (Object.keys(newPrices).length > 0) updatePrices(newPrices);
    }
    setRefreshing(false);
  };

  useEffect(() => { refreshPrices(); }, []);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshPrices} tintColor={COLORS.accent} />}
    >
      {/* Account Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>PORTFOLIO VALUE</Text>
        <Text style={styles.summaryValue}>{fmtDollar(metrics.totalValue)}</Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryPnL, { color: pnlColor(metrics.totalGain) }]}>
            {fmtPnL(metrics.totalGain)} ({fmtPnLPct(metrics.totalGainPct)})
          </Text>
          <Text style={styles.summarySubtext}>all time</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{fmtDollar(metrics.cashBalance)}</Text>
            <Text style={styles.statLabel}>Cash</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{fmtDollar(metrics.positionsValue)}</Text>
            <Text style={styles.statLabel}>Stocks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{fmtDollar(metrics.optionsValue)}</Text>
            <Text style={styles.statLabel}>Options</Text>
          </View>
        </View>
      </View>

      {/* Trade Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TRADE STATS</Text>
        <View style={styles.tradeStatsCard}>
          <View style={styles.tradeStatRow}>
            <Text style={styles.tradeStatLabel}>Total Trades</Text>
            <Text style={styles.tradeStatValue}>{metrics.totalTrades}</Text>
          </View>
          <View style={styles.tradeStatRow}>
            <Text style={styles.tradeStatLabel}>Win Rate</Text>
            <Text style={[styles.tradeStatValue, { color: (metrics?.winRate ?? 0) >= 50 ? COLORS.approve : COLORS.crl }]}>
              {(metrics?.winRate ?? 0).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.tradeStatRow}>
            <Text style={styles.tradeStatLabel}>Largest Win</Text>
            <Text style={[styles.tradeStatValue, { color: COLORS.approve }]}>{fmtPnL(metrics.largestWin)}</Text>
          </View>
          <View style={styles.tradeStatRow}>
            <Text style={styles.tradeStatLabel}>Largest Loss</Text>
            <Text style={[styles.tradeStatValue, { color: COLORS.crl }]}>{fmtPnL(metrics.largestLoss)}</Text>
          </View>
        </View>
      </View>

      {/* Open Positions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OPEN POSITIONS ({positionList.length})</Text>
        {positionList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>📈</Text>
            <Text style={styles.emptyText}>No open positions</Text>
            <Text style={styles.emptySubtext}>Tap "Paper Trade" on any catalyst to start trading</Text>
          </View>
        ) : (
          positionList.map(pos => (
            <TouchableOpacity
              key={pos.id}
              style={styles.positionCard}
              onPress={() => onTrade?.(pos.ticker)}
            >
              <View style={styles.posTopRow}>
                <View>
                  <Text style={styles.posTicker}>{pos.ticker}</Text>
                  <Text style={styles.posCompany}>{pos.company}</Text>
                </View>
                <View style={styles.posRight}>
                  <Text style={styles.posValue}>{fmtDollar(pos.currentValue)}</Text>
                  <Text style={[styles.posPnL, { color: pnlColor(pos.unrealizedPnL) }]}>
                    {fmtPnL(pos.unrealizedPnL)} ({fmtPnLPct(pos.unrealizedPnLPct)})
                  </Text>
                </View>
              </View>
              <View style={styles.posBottomRow}>
                <Text style={styles.posDetail}>{pos.quantity} shares @ {fmtPrice(pos.averageEntryPrice)}</Text>
                <Text style={styles.posDetail}>Now: {fmtPrice(pos.currentPrice)}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Option Positions */}
      {optionList.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OPTION POSITIONS ({optionList.length})</Text>
          {optionList.map(opt => (
            <View key={opt.id} style={styles.positionCard}>
              <View style={styles.posTopRow}>
                <View>
                  <Text style={styles.posTicker}>{opt.ticker}</Text>
                  <Text style={styles.posCompany}>{opt.strategy}</Text>
                </View>
                <View style={styles.posRight}>
                  <Text style={styles.posValue}>{fmtDollar(opt.currentValue)}</Text>
                  <Text style={[styles.posPnL, { color: pnlColor(opt.unrealizedPnL) }]}>
                    {fmtPnL(opt.unrealizedPnL)}
                  </Text>
                </View>
              </View>
              <View style={styles.posBottomRow}>
                {opt.legs.map((leg, i) => (
                  <Text key={i} style={styles.posDetail}>
                    {leg.position} {leg.contracts}x {leg.type} ${leg.strike}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Recent Trades */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>RECENT TRADES</Text>
        {tradeHistory.length === 0 ? (
          <Text style={styles.emptySubtext}>No trades yet</Text>
        ) : (
          tradeHistory.slice(0, 10).map(trade => (
            <View key={trade.id} style={styles.tradeRow}>
              <View style={[styles.tradeSide, { backgroundColor: trade.side === 'BUY' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }]}>
                <Text style={[styles.tradeSideText, { color: trade.side === 'BUY' ? COLORS.approve : COLORS.crl }]}>{trade.side}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.tradeTicker}>{trade.ticker} • {trade.type}</Text>
                <Text style={styles.tradeDetail}>{trade.quantity} @ {fmtPrice(trade.executedPrice)}</Text>
              </View>
              <View style={styles.tradeRight}>
                <Text style={styles.tradeTotal}>{fmtDollar(trade.totalValue)}</Text>
                {trade.pnl !== undefined && (
                  <Text style={[styles.tradePnl, { color: pnlColor(trade.pnl) }]}>{fmtPnL(trade.pnl)}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  summaryCard: {
    margin: 16,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  summaryLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  summaryValue: { color: COLORS.textPrimary, fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 16 },
  summaryPnL: { fontSize: 16, fontWeight: '700' },
  summarySubtext: { color: COLORS.textMuted, fontSize: 12 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  statLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },

  section: { marginBottom: 24, paddingHorizontal: 16 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },

  tradeStatsCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  tradeStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tradeStatLabel: { color: COLORS.textSecondary, fontSize: 13 },
  tradeStatValue: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },

  emptyCard: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyEmoji: { fontSize: 32, marginBottom: 8 },
  emptyText: { color: COLORS.textSecondary, fontSize: 15, fontWeight: '600' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },

  positionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  posTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  posTicker: { color: COLORS.accentLight, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  posCompany: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  posRight: { alignItems: 'flex-end' },
  posValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  posPnL: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  posBottomRow: { flexDirection: 'row', justifyContent: 'space-between' },
  posDetail: { color: COLORS.textMuted, fontSize: 11 },

  tradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tradeSide: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  tradeSideText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  tradeTicker: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600' },
  tradeDetail: { color: COLORS.textMuted, fontSize: 11 },
  tradeRight: { alignItems: 'flex-end' },
  tradeTotal: { color: COLORS.textSecondary, fontSize: 12 },
  tradePnl: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
