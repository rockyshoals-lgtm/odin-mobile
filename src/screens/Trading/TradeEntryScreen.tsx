// ODIN Mobile — Trade Entry Screen
// Buy/sell order form with live price, balance check, one-click execution

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Pressable, BackHandler } from 'react-native';
import { COLORS } from '../../constants/colors';
import { usePaperTradeStore } from '../../stores/paperTradeStore';
import { useMarketDataStore } from '../../stores/marketDataStore';
import { useCatalystStore } from '../../stores/catalystStore';
import { fmtDollar, fmtPrice, fmtPnLPct, maxSharesAtPrice, pnlColor } from '../../utils/tradingUtils';
import { Catalyst } from '../../constants/types';

interface Props {
  ticker?: string;
  catalystId?: string;
  initialSide?: 'BUY' | 'SELL';
  onClose: () => void;
}

export function TradeEntryScreen({ ticker: initialTicker, catalystId, initialSide = 'BUY', onClose }: Props) {
  const { account, buyStock, sellStock, getPosition } = usePaperTradeStore();
  const { fetchQuote, getQuote, quotes } = useMarketDataStore();
  const { catalysts } = useCatalystStore();

  const [ticker, setTicker] = useState(initialTicker || '');
  const [side, setSide] = useState<'BUY' | 'SELL'>(initialSide);

  // Android back button closes the trade modal
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => handler.remove();
  }, [onClose]);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const quote = quotes[ticker.toUpperCase()];
  const price = quote?.price || 0;
  const position = getPosition(ticker.toUpperCase());
  const catalyst = catalysts.find(c => c.ticker === ticker.toUpperCase());

  const qty = parseInt(quantity) || 0;
  const orderCost = qty * price;
  const canAfford = orderCost <= account.balance;
  const canSell = position ? qty <= position.quantity : false;
  const maxBuy = price > 0 ? maxSharesAtPrice(account.balance, price) : 0;
  const maxSellQty = position?.quantity || 0;

  useEffect(() => {
    if (ticker.length >= 1) {
      fetchQuote(ticker.toUpperCase());
    }
  }, [ticker]);

  const handleTrade = () => {
    const t = ticker.toUpperCase();
    if (!t || qty <= 0 || price <= 0) return;

    if (side === 'BUY') {
      if (!canAfford) {
        Alert.alert('Insufficient Funds', `Need ${fmtDollar(orderCost)} but only ${fmtDollar(account.balance)} available.`);
        return;
      }
      const company = catalyst?.company || quote?.ticker || t;
      const success = buyStock(t, company, qty, price, catalystId);
      if (success) {
        Alert.alert('Order Filled', `Bought ${qty} shares of ${t} @ ${fmtPrice(price)}\nTotal: ${fmtDollar(orderCost)}`, [
          { text: 'OK', onPress: onClose },
        ]);
      }
    } else {
      if (!canSell) {
        Alert.alert('Insufficient Shares', `You only hold ${maxSellQty} shares of ${t}.`);
        return;
      }
      const success = sellStock(t, qty, price);
      if (success) {
        const pnl = qty * (price - (position?.averageEntryPrice || 0));
        Alert.alert('Order Filled', `Sold ${qty} shares of ${t} @ ${fmtPrice(price)}\nP&L: ${pnl >= 0 ? '+' : ''}${fmtDollar(pnl)}`, [
          { text: 'OK', onPress: onClose },
        ]);
      }
    }
  };

  const setMaxQuantity = () => {
    if (side === 'BUY') setQuantity(maxBuy.toString());
    else setQuantity(maxSellQty.toString());
  };

  const quickAmounts = [100, 500, 1000, 2500, 5000];

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handleBar} />
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>PAPER TRADE</Text>

          {/* Ticker Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>TICKER</Text>
            <TextInput
              style={styles.tickerInput}
              value={ticker}
              onChangeText={setTicker}
              placeholder="VNDA"
              placeholderTextColor={COLORS.textDisabled}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          {/* Live Price */}
          {price > 0 && (
            <View style={styles.priceCard}>
              <View>
                <Text style={styles.priceLabel}>LIVE PRICE</Text>
                <Text style={styles.priceValue}>{fmtPrice(price)}</Text>
              </View>
              <View style={styles.priceRight}>
                {quote && (
                  <Text style={[styles.priceChange, { color: pnlColor(quote.changePct) }]}>
                    {quote.changePct >= 0 ? '+' : ''}{(quote.changePct ?? 0).toFixed(2)}%
                  </Text>
                )}
                {quote?.marketCap ? (
                  <Text style={styles.marketCap}>Mkt Cap: {fmtDollar(quote.marketCap)}</Text>
                ) : null}
              </View>
            </View>
          )}

          {/* Buy / Sell Toggle */}
          <View style={styles.sideToggle}>
            <TouchableOpacity
              style={[styles.sideBtn, side === 'BUY' && styles.sideBtnBuyActive]}
              onPress={() => setSide('BUY')}
            >
              <Text style={[styles.sideBtnText, side === 'BUY' && { color: COLORS.approve }]}>BUY</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sideBtn, side === 'SELL' && styles.sideBtnSellActive]}
              onPress={() => setSide('SELL')}
            >
              <Text style={[styles.sideBtnText, side === 'SELL' && { color: COLORS.crl }]}>SELL</Text>
            </TouchableOpacity>
          </View>

          {/* Position info (if holding) */}
          {position && (
            <View style={styles.positionInfo}>
              <Text style={styles.positionText}>
                You hold {position.quantity} shares @ {fmtPrice(position.averageEntryPrice)}
              </Text>
              <Text style={[styles.positionPnl, { color: pnlColor(position.unrealizedPnL) }]}>
                P&L: {position.unrealizedPnL >= 0 ? '+' : ''}{fmtDollar(position.unrealizedPnL)} ({fmtPnLPct(position.unrealizedPnLPct)})
              </Text>
            </View>
          )}

          {/* Quantity Input */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>SHARES</Text>
              <TouchableOpacity onPress={setMaxQuantity}>
                <Text style={styles.maxBtn}>MAX ({side === 'BUY' ? maxBuy : maxSellQty})</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.qtyInput}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="0"
              placeholderTextColor={COLORS.textDisabled}
              keyboardType="number-pad"
            />
          </View>

          {/* Quick Dollar Amounts */}
          {side === 'BUY' && price > 0 && (
            <View style={styles.quickAmounts}>
              {quickAmounts.map(amt => {
                const shares = Math.floor(amt / price);
                if (shares <= 0) return null;
                return (
                  <TouchableOpacity
                    key={amt}
                    style={styles.quickBtn}
                    onPress={() => setQuantity(shares.toString())}
                  >
                    <Text style={styles.quickBtnText}>${amt >= 1000 ? `${amt/1000}K` : amt}</Text>
                    <Text style={styles.quickBtnShares}>{shares} shr</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Order Preview */}
          {qty > 0 && price > 0 && (
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>ORDER PREVIEW</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>{side} {qty} × {ticker.toUpperCase()}</Text>
                <Text style={styles.previewValue}>{fmtDollar(orderCost)}</Text>
              </View>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Available Cash</Text>
                <Text style={styles.previewValue}>{fmtDollar(account.balance)}</Text>
              </View>
              {side === 'BUY' && (
                <View style={styles.previewRow}>
                  <Text style={styles.previewLabel}>After Trade</Text>
                  <Text style={[styles.previewValue, !canAfford && { color: COLORS.crl }]}>
                    {fmtDollar(account.balance - orderCost)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Execute Button */}
          <TouchableOpacity
            style={[
              styles.executeBtn,
              side === 'BUY' ? styles.executeBuy : styles.executeSell,
              (qty <= 0 || price <= 0 || (side === 'BUY' && !canAfford) || (side === 'SELL' && !canSell)) && styles.executeDisabled,
            ]}
            onPress={handleTrade}
            disabled={qty <= 0 || price <= 0 || (side === 'BUY' && !canAfford) || (side === 'SELL' && !canSell)}
          >
            <Text style={styles.executeBtnText}>
              {side === 'BUY' ? '📈' : '📉'} {side} {qty > 0 ? `${qty} SHARES` : 'ENTER QUANTITY'}
              {qty > 0 && price > 0 ? ` • ${fmtDollar(orderCost)}` : ''}
            </Text>
          </TouchableOpacity>

          {/* Odin Capital Announcement */}
          <View style={styles.liveTradeAnnouncement}>
            <Text style={styles.liveTradeTitle}>⚡ LIVE TRADING — MARCH 5</Text>
            <Text style={styles.liveTradeDesc}>
              Real money trading through Odin Capital is launching soon. Paper trade now to sharpen your edge.
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: COLORS.bgElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    minHeight: '60%',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handleBar: { width: 40, height: 4, backgroundColor: COLORS.borderLight, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  closeBtn: { position: 'absolute', top: 12, right: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.bgInput, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 16 },

  title: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },

  inputGroup: { marginBottom: 16 },
  label: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  maxBtn: { color: COLORS.accentLight, fontSize: 11, fontWeight: '700' },

  tickerInput: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 10,
    padding: 14,
    color: COLORS.accentLight,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qtyInput: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 10,
    padding: 14,
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  priceLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  priceValue: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900' },
  priceRight: { alignItems: 'flex-end' },
  priceChange: { fontSize: 14, fontWeight: '700' },
  marketCap: { color: COLORS.textMuted, fontSize: 10, marginTop: 2 },

  sideToggle: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  sideBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sideBtnBuyActive: { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: COLORS.approve },
  sideBtnSellActive: { backgroundColor: 'rgba(239,68,68,0.15)', borderColor: COLORS.crl },
  sideBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '800', letterSpacing: 1 },

  positionInfo: {
    backgroundColor: COLORS.accentBg,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  positionText: { color: COLORS.accentLight, fontSize: 12, fontWeight: '600' },
  positionPnl: { fontSize: 12, fontWeight: '700', marginTop: 2 },

  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  quickBtn: {
    backgroundColor: COLORS.bgInput,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickBtnText: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  quickBtnShares: { color: COLORS.textMuted, fontSize: 9, marginTop: 2 },

  previewCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewTitle: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  previewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  previewLabel: { color: COLORS.textSecondary, fontSize: 13 },
  previewValue: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },

  executeBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  executeBuy: { backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 1.5, borderColor: COLORS.approve },
  executeSell: { backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1.5, borderColor: COLORS.crl },
  executeDisabled: { opacity: 0.4 },
  executeBtnText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  liveTradeAnnouncement: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.25)',
    alignItems: 'center',
  },
  liveTradeTitle: { color: '#eab308', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 4 },
  liveTradeDesc: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 16 },
});
