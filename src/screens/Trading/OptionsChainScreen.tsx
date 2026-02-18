// ODIN Mobile — Options Chain Screen
// Displays simulated option chains with Black-Scholes pricing, Greeks, and strategy quick-buttons

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert } from 'react-native';
import { COLORS, TIER_CONFIG, TierKey } from '../../constants/colors';
import { usePaperTradeStore } from '../../stores/paperTradeStore';
import { useMarketDataStore } from '../../stores/marketDataStore';
import { useCatalystStore } from '../../stores/catalystStore';
import { generateOptionsChain, IVService } from '../../services/blackScholesService';
import { OptionContract, OptionsChain, STRATEGY_TEMPLATES, OptionPosition, OptionLeg, StrategyType } from '../../constants/tradingTypes';
import { Catalyst } from '../../constants/types';
import { fmtPrice, fmtGreek, fmtIV, fmtDollar, pnlColor } from '../../utils/tradingUtils';
import { daysUntil } from '../../utils/formatting';

interface Props {
  ticker?: string;
  catalystId?: string;
}

export function OptionsChainScreen({ ticker: initTicker, catalystId }: Props) {
  const { catalysts } = useCatalystStore();
  const { fetchQuote, getPrice, quotes } = useMarketDataStore();
  const { buyOption, account } = usePaperTradeStore();

  const [selectedTicker, setSelectedTicker] = useState(initTicker || '');
  const [tab, setTab] = useState<'CALLS' | 'PUTS' | 'STRATEGIES'>('CALLS');
  const [contracts, setContracts] = useState(1);

  const catalyst = catalysts.find(c => c.id === catalystId || c.ticker === selectedTicker);
  const price = getPrice(selectedTicker.toUpperCase()) || 0;

  useEffect(() => {
    if (selectedTicker) fetchQuote(selectedTicker.toUpperCase());
  }, [selectedTicker]);

  // Generate options chain
  const chain = useMemo(() => {
    if (!catalyst || price <= 0) return null;
    return generateOptionsChain(selectedTicker.toUpperCase(), price, catalyst);
  }, [selectedTicker, price, catalyst]);

  const iv = catalyst ? IVService.deriveIV(catalyst) : 0;
  const days = catalyst ? daysUntil(catalyst.date) : 0;

  const handleBuyOption = (contract: OptionContract) => {
    const cost = contract.premium * contracts * 100;
    if (cost > account.balance) {
      Alert.alert('Insufficient Funds', `Need ${fmtDollar(cost)} for ${contracts} contract(s)`);
      return;
    }

    const position: OptionPosition = {
      id: `opt-${Date.now()}`,
      ticker: contract.ticker,
      strategy: contract.type,
      legs: [{
        type: contract.type,
        strike: contract.strike,
        expirationDate: contract.expirationDate,
        position: 'LONG',
        contracts,
        premiumPerContract: contract.premium,
        currentPremium: contract.premium,
        greeks: contract.greeks,
      }],
      totalCost: cost,
      currentValue: cost,
      unrealizedPnL: 0,
      catalystId,
      openedAt: new Date().toISOString(),
    };

    const success = buyOption(position);
    if (success) {
      Alert.alert('Option Order Filled',
        `Bought ${contracts}x ${contract.type} $${contract.strike} @ ${fmtPrice(contract.premium)}\nTotal: ${fmtDollar(cost)}`
      );
    }
  };

  const handleStrategy = (strategy: typeof STRATEGY_TEMPLATES[0]) => {
    if (!chain || price <= 0) return;

    // Find ATM strike
    const atm = chain.calls.reduce((closest, c) =>
      Math.abs(c.strike - price) < Math.abs(closest.strike - price) ? c : closest
    );

    const increment = chain.calls.length > 1 ? Math.abs(chain.calls[1].strike - chain.calls[0].strike) : 2.5;

    const legs: OptionLeg[] = strategy.legs.map(legTemplate => {
      const strikeTarget = atm.strike + (legTemplate.strikeOffset * increment);
      const options = legTemplate.type === 'CALL' ? chain.calls : chain.puts;
      const contract = options.reduce((closest, o) =>
        Math.abs(o.strike - strikeTarget) < Math.abs(closest.strike - strikeTarget) ? o : closest
      );

      return {
        type: legTemplate.type,
        strike: contract.strike,
        expirationDate: contract.expirationDate,
        position: legTemplate.position,
        contracts,
        premiumPerContract: contract.premium,
        currentPremium: contract.premium,
        greeks: contract.greeks,
      };
    });

    const totalCost = legs.reduce((sum, l) => {
      const mult = l.position === 'LONG' ? 1 : -1;
      return sum + (l.premiumPerContract * l.contracts * 100 * mult);
    }, 0);

    if (totalCost > account.balance) {
      Alert.alert('Insufficient Funds', `${strategy.label} costs ${fmtDollar(totalCost)}`);
      return;
    }

    const position: OptionPosition = {
      id: `opt-${Date.now()}`,
      ticker: selectedTicker.toUpperCase(),
      strategy: strategy.type as StrategyType,
      legs,
      totalCost: Math.abs(totalCost),
      currentValue: Math.abs(totalCost),
      unrealizedPnL: 0,
      catalystId,
      openedAt: new Date().toISOString(),
    };

    const success = buyOption(position);
    if (success) {
      Alert.alert(`${strategy.label} Opened`,
        `${legs.length} leg(s) filled\nTotal cost: ${fmtDollar(Math.abs(totalCost))}`
      );
    }
  };

  const renderOptionRow = (contract: OptionContract) => {
    const isITM = contract.type === 'CALL' ? contract.strike < price : contract.strike > price;
    const isATM = Math.abs(contract.strike - price) < (price * 0.03);

    return (
      <TouchableOpacity
        key={contract.id}
        style={[styles.optionRow, isATM && styles.optionRowATM, isITM && styles.optionRowITM]}
        onPress={() => handleBuyOption(contract)}
      >
        <Text style={[styles.optionStrike, isATM && { color: COLORS.accentLight }]}>
          ${contract.strike.toFixed(2)}
          {isATM ? ' ◀ ATM' : ''}
        </Text>
        <Text style={styles.optionPremium}>{fmtPrice(contract.premium)}</Text>
        <Text style={styles.optionGreek}>{contract.greeks.delta.toFixed(2)}</Text>
        <Text style={styles.optionGreek}>{contract.greeks.theta.toFixed(3)}</Text>
        <Text style={styles.optionGreek}>{contract.greeks.vega.toFixed(3)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTicker}>{selectedTicker.toUpperCase() || 'Select Catalyst'}</Text>
        {price > 0 && <Text style={styles.headerPrice}>{fmtPrice(price)}</Text>}
      </View>

      {/* Catalyst/IV Info */}
      {catalyst && (
        <View style={styles.ivCard}>
          <View style={styles.ivRow}>
            <View>
              <Text style={styles.ivLabel}>IMPLIED VOL</Text>
              <Text style={styles.ivValue}>{fmtIV(iv)}</Text>
            </View>
            <View>
              <Text style={styles.ivLabel}>DAYS TO CATALYST</Text>
              <Text style={styles.ivValue}>{days}d</Text>
            </View>
            <View>
              <Text style={styles.ivLabel}>EXPIRY</Text>
              <Text style={styles.ivValue}>{catalyst.date}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Tab Selector */}
      <View style={styles.tabs}>
        {(['CALLS', 'PUTS', 'STRATEGIES'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contract Count */}
      <View style={styles.contractSelector}>
        <Text style={styles.contractLabel}>Contracts:</Text>
        {[1, 2, 5, 10].map(n => (
          <TouchableOpacity
            key={n}
            style={[styles.contractBtn, contracts === n && styles.contractBtnActive]}
            onPress={() => setContracts(n)}
          >
            <Text style={[styles.contractBtnText, contracts === n && { color: COLORS.accent }]}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Options Chain Table */}
      {tab !== 'STRATEGIES' && chain && (
        <View>
          <View style={styles.chainHeader}>
            <Text style={styles.chainHeaderText}>Strike</Text>
            <Text style={styles.chainHeaderText}>Premium</Text>
            <Text style={styles.chainHeaderText}>Delta</Text>
            <Text style={styles.chainHeaderText}>Theta</Text>
            <Text style={styles.chainHeaderText}>Vega</Text>
          </View>
          {(tab === 'CALLS' ? chain.calls : chain.puts).map(renderOptionRow)}
          <Text style={styles.tapHint}>Tap any row to buy {contracts} contract(s)</Text>
        </View>
      )}

      {/* Strategy Templates */}
      {tab === 'STRATEGIES' && (
        <View>
          {STRATEGY_TEMPLATES.map(strategy => (
            <TouchableOpacity
              key={strategy.type}
              style={styles.strategyCard}
              onPress={() => handleStrategy(strategy)}
            >
              <View style={styles.strategyHeader}>
                <Text style={styles.strategyLabel}>{strategy.label}</Text>
                <View style={styles.strategyLegs}>
                  <Text style={styles.strategyLegCount}>{strategy.legs.length} leg{strategy.legs.length > 1 ? 's' : ''}</Text>
                </View>
              </View>
              <Text style={styles.strategyDesc}>{strategy.description}</Text>
              <View style={styles.strategyMeta}>
                <View style={styles.strategyMetaItem}>
                  <Text style={styles.strategyMetaLabel}>Max Loss</Text>
                  <Text style={[styles.strategyMetaValue, { color: COLORS.crl }]}>{strategy.maxLoss}</Text>
                </View>
                <View style={styles.strategyMetaItem}>
                  <Text style={styles.strategyMetaLabel}>Max Gain</Text>
                  <Text style={[styles.strategyMetaValue, { color: COLORS.approve }]}>{strategy.maxGain}</Text>
                </View>
              </View>
              <Text style={styles.strategyBestFor}>Best for: {strategy.bestFor}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerTicker: { color: COLORS.accentLight, fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  headerPrice: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '700' },

  ivCard: { marginHorizontal: 16, backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  ivRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ivLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  ivValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800' },

  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.bgInput },
  tabActive: { backgroundColor: COLORS.accentBg, borderWidth: 1, borderColor: COLORS.accent },
  tabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  tabTextActive: { color: COLORS.accentLight },

  contractSelector: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, gap: 8 },
  contractLabel: { color: COLORS.textMuted, fontSize: 12 },
  contractBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border },
  contractBtnActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accentBg },
  contractBtnText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },

  chainHeader: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  chainHeaderText: { flex: 1, color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  optionRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  optionRowATM: { backgroundColor: COLORS.accentBg },
  optionRowITM: { backgroundColor: 'rgba(34,197,94,0.05)' },
  optionStrike: { flex: 1, color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  optionPremium: { flex: 1, color: COLORS.coin, fontSize: 13, fontWeight: '700' },
  optionGreek: { flex: 1, color: COLORS.textSecondary, fontSize: 11 },

  tapHint: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },

  strategyCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  strategyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  strategyLabel: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800' },
  strategyLegs: { backgroundColor: COLORS.bgInput, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  strategyLegCount: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  strategyDesc: { color: COLORS.textSecondary, fontSize: 12, marginBottom: 10, lineHeight: 18 },
  strategyMeta: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  strategyMetaItem: {},
  strategyMetaLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  strategyMetaValue: { fontSize: 12, fontWeight: '700' },
  strategyBestFor: { color: COLORS.textMuted, fontSize: 11, fontStyle: 'italic' },
});
