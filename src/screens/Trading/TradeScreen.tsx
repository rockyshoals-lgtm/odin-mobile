// ODIN Mobile — Main Trade Tab
// Contains Portfolio, Options Chain, and Trade History as sub-sections

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { usePaperTradeStore } from '../../stores/paperTradeStore';
import { PortfolioScreen } from './PortfolioScreen';
import { OptionsChainScreen } from './OptionsChainScreen';
import { TradeEntryScreen } from './TradeEntryScreen';
import { fmtDollar, pnlColor } from '../../utils/tradingUtils';

type SubTab = 'PORTFOLIO' | 'OPTIONS';

export function TradeScreen() {
  const [subTab, setSubTab] = useState<SubTab>('PORTFOLIO');
  const [showTradeEntry, setShowTradeEntry] = useState(false);
  const [tradeTicker, setTradeTicker] = useState<string | undefined>();
  const { getTotalValue, getPortfolioMetrics } = usePaperTradeStore();

  const metrics = getPortfolioMetrics();

  const handleTrade = (ticker?: string) => {
    setTradeTicker(ticker);
    setShowTradeEntry(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>TRADE</Text>
          <Text style={styles.subtitle}>Paper Trading</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceValue}>{fmtDollar(metrics.totalValue)}</Text>
          <Text style={[styles.balancePnL, { color: pnlColor(metrics.totalGain) }]}>
            {metrics.totalGain >= 0 ? '+' : ''}{fmtDollar(metrics.totalGain)}
          </Text>
        </View>
      </View>

      {/* Sub Tabs */}
      <View style={styles.subTabs}>
        {(['PORTFOLIO', 'OPTIONS'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.subTab, subTab === t && styles.subTabActive]}
            onPress={() => setSubTab(t)}
          >
            <Text style={[styles.subTabText, subTab === t && styles.subTabTextActive]}>
              {t === 'PORTFOLIO' ? '📊 Portfolio' : '⚡ Options'}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.newTradeBtn} onPress={() => handleTrade()}>
          <Text style={styles.newTradeBtnText}>+ Trade</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {subTab === 'PORTFOLIO' && <PortfolioScreen onTrade={handleTrade} />}
      {subTab === 'OPTIONS' && <OptionsChainScreen />}

      {/* Trade Entry Modal */}
      <Modal visible={showTradeEntry} animationType="slide" transparent>
        <TradeEntryScreen
          ticker={tradeTicker}
          onClose={() => {
            setShowTradeEntry(false);
            setTradeTicker(undefined);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  headerLeft: {},
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: COLORS.coin, fontSize: 11, fontWeight: '600', marginTop: 2 },
  headerRight: { alignItems: 'flex-end' },
  balanceLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  balanceValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '900' },
  balancePnL: { fontSize: 12, fontWeight: '700' },

  subTabs: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  subTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: COLORS.bgInput },
  subTabActive: { backgroundColor: COLORS.accentBg, borderWidth: 1, borderColor: COLORS.accent },
  subTabText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  subTabTextActive: { color: COLORS.accentLight },

  newTradeBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1,
    borderColor: COLORS.approve,
  },
  newTradeBtnText: { color: COLORS.approve, fontSize: 12, fontWeight: '800' },
});
