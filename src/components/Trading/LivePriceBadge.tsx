// ODIN Mobile — Live Price Badge
// Compact price + change indicator for catalyst cards

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useMarketDataStore } from '../../stores/marketDataStore';
import { fmtPrice, fmtMarketCap, pnlColor } from '../../utils/tradingUtils';

interface Props {
  ticker: string;
  compact?: boolean;
}

export function LivePriceBadge({ ticker, compact = false }: Props) {
  const { fetchQuote, quotes, shouldRefresh } = useMarketDataStore();
  const quote = quotes[ticker];

  useEffect(() => {
    if (shouldRefresh(ticker)) {
      fetchQuote(ticker);
    }
  }, [ticker]);

  if (!quote) {
    return compact ? null : (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const price = quote.price ?? 0;
  const changePct = quote.changePct ?? 0;
  const change = quote.change ?? 0;
  const marketCap = quote.marketCap ?? 0;
  const high = quote.high ?? 0;
  const low = quote.low ?? 0;
  const volume = quote.volume ?? 0;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactPrice}>{fmtPrice(price)}</Text>
        <Text style={[styles.compactChange, { color: pnlColor(changePct) }]}>
          {changePct >= 0 ? '▲' : '▼'} {Math.abs(changePct).toFixed(1)}%
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>LIVE PRICE</Text>
          <Text style={styles.price}>{fmtPrice(price)}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.change, { color: pnlColor(changePct) }]}>
            {changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%
          </Text>
          <Text style={styles.marketCap}>Mkt Cap: {fmtMarketCap(marketCap)}</Text>
        </View>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detail}>H: {fmtPrice(high)}</Text>
        <Text style={styles.detail}>L: {fmtPrice(low)}</Text>
        <Text style={styles.detail}>Vol: {volume > 0 ? (volume / 1e6).toFixed(1) + 'M' : '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact mode (for CatalystCard)
  compactContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  compactPrice: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700' },
  compactChange: { fontSize: 10, fontWeight: '700' },

  // Full mode (for CatalystDetail)
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  label: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  price: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '900' },
  right: { alignItems: 'flex-end' },
  change: { fontSize: 14, fontWeight: '700' },
  marketCap: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },
  detailRow: { flexDirection: 'row', gap: 12 },
  detail: { color: COLORS.textMuted, fontSize: 10 },

  loading: { paddingVertical: 2 },
  loadingText: { color: COLORS.textMuted, fontSize: 11 },
});
