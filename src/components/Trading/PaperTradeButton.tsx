// ODIN Mobile — One-Click Paper Trade Button
// Appears on CatalystDetail to quickly enter a stock or options trade

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TradeEntryScreen } from '../../screens/Trading/TradeEntryScreen';
import { OptionsChainScreen } from '../../screens/Trading/OptionsChainScreen';
import { usePaperTradeStore } from '../../stores/paperTradeStore';
import { fmtDollar } from '../../utils/tradingUtils';

interface Props {
  ticker: string;
  catalystId: string;
}

export function PaperTradeButton({ ticker, catalystId }: Props) {
  const [showTrade, setShowTrade] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { account, hasPosition, getPosition } = usePaperTradeStore();
  const position = getPosition(ticker);

  return (
    <View style={styles.container}>
      {/* Quick Trade Header */}
      <TouchableOpacity style={styles.mainBtn} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.mainBtnIcon}>💰</Text>
        <Text style={styles.mainBtnText}>PAPER TRADE</Text>
        <Text style={styles.mainBtnBalance}>{fmtDollar(account.balance)} available</Text>
      </TouchableOpacity>

      {/* Expanded Actions */}
      {expanded && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowTrade(true)}>
            <Text style={styles.actionEmoji}>📈</Text>
            <Text style={styles.actionLabel}>Buy Stock</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowOptions(true)}>
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionLabel}>Buy Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowOptions(true)}>
            <Text style={styles.actionEmoji}>📉</Text>
            <Text style={styles.actionLabel}>Buy Put</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowOptions(true)}>
            <Text style={styles.actionEmoji}>⚡</Text>
            <Text style={styles.actionLabel}>Straddle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Position indicator */}
      {position && (
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>
            You hold {position.quantity} shares ({position.unrealizedPnL >= 0 ? '+' : ''}{fmtDollar(position.unrealizedPnL)})
          </Text>
        </View>
      )}

      {/* Trade Modal */}
      <Modal visible={showTrade} animationType="slide" transparent>
        <TradeEntryScreen ticker={ticker} catalystId={catalystId} onClose={() => setShowTrade(false)} />
      </Modal>

      {/* Options Modal */}
      <Modal visible={showOptions} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: COLORS.bg, paddingTop: 60 }}>
          <TouchableOpacity style={styles.closeOptionsBtn} onPress={() => setShowOptions(false)}>
            <Text style={styles.closeOptionsBtnText}>✕ Close</Text>
          </TouchableOpacity>
          <OptionsChainScreen ticker={ticker} catalystId={catalystId} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },

  mainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.coin + '40',
    gap: 8,
  },
  mainBtnIcon: { fontSize: 18 },
  mainBtnText: { color: COLORS.coin, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  mainBtnBalance: { color: COLORS.textMuted, fontSize: 11, marginLeft: 'auto' },

  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionEmoji: { fontSize: 18, marginBottom: 4 },
  actionLabel: { color: COLORS.textSecondary, fontSize: 10, fontWeight: '700' },

  positionBadge: {
    backgroundColor: COLORS.accentBg,
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  positionText: { color: COLORS.accentLight, fontSize: 11, fontWeight: '600' },

  closeOptionsBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
  closeOptionsBtnText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
});
