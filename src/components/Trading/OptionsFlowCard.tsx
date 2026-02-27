/**
 * OptionsFlowCard — Mobile Options & Flow Section
 *
 * UOA-MOBILE-UI-001: Displays options signals for a catalyst:
 * - Options Pressure gauge/pill (0-100)
 * - Whale Bias text with direction arrow
 * - Vol Shock badge
 * - Expandable UOA event list
 * - PCR mini-chart (simplified for mobile)
 *
 * Fetches from pdufa.bio /api/options-signals endpoint.
 *
 * @module OptionsFlowCard
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';

// ── Types ────────────────────────────────────────────────────

interface UOASignal {
  rule_id: string;
  direction: string;
  strength: number | string;
  evidence?: string;
}

interface OptionsSignal {
  ticker: string;
  catalyst_id: string;
  date: string;
  odin_tier: string;
  odin_prob: number;
  odin_options_pressure: number | null;
  odin_options_pressure_label?: string;
  odin_whale_bias: number | null;
  odin_whale_bias_label?: string;
  odin_vol_shock: number | null;
  uoa_signals: UOASignal[];
  uoa_flags: string[];
  pcr_series_30d?: Array<{ date: string; put_call_ratio: number }>;
  data_source: string;
  last_updated: string;
}

interface Props {
  ticker: string;
  catalystId: string;
}

// ── Helpers ──────────────────────────────────────────────────

function pressureColor(value: number): string {
  if (value >= 80) return '#ef4444';
  if (value >= 60) return '#f97316';
  if (value >= 30) return '#eab308';
  return '#22c55e';
}

function pressureLabel(value: number): string {
  if (value >= 80) return 'EXTREME';
  if (value >= 60) return 'HIGH';
  if (value >= 30) return 'ELEVATED';
  return 'CALM';
}

function biasColor(value: number): string {
  if (value > 40) return '#22c55e';
  if (value > 15) return '#86efac';
  if (value < -40) return '#ef4444';
  if (value < -15) return '#fca5a5';
  return '#94a3b8';
}

function biasLabel(value: number): string {
  if (value > 40) return 'BULLISH';
  if (value > 15) return 'SLIGHTLY BULLISH';
  if (value < -40) return 'BEARISH';
  if (value < -15) return 'SLIGHTLY BEARISH';
  return 'NEUTRAL';
}

function biasArrow(value: number): string {
  if (value > 15) return '▲';
  if (value < -15) return '▼';
  return '→';
}

function volShockInfo(value: number) {
  if (value >= 70) return { text: 'HIGH VOL', color: '#ef4444' };
  if (value >= 40) return { text: 'ELEVATED', color: '#f97316' };
  if (value >= 20) return { text: 'MODERATE', color: '#eab308' };
  return { text: 'LOW VOL', color: '#6b7280' };
}

function flagIcon(flag: string): string {
  if (flag.includes('CALL')) return '📈';
  if (flag.includes('PUT')) return '📉';
  if (flag.includes('DIVERGENCE')) return '⚠️';
  return '🔔';
}

function flagLabel(flag: string): string {
  switch (flag) {
    case 'HIGH_CALL_PRESSURE': return 'Heavy Call Buying';
    case 'HIGH_PUT_PRESSURE': return 'Heavy Put Buying';
    case 'SENTIMENT_DIVERGENCE_ODIN_BULL_UOA_BEAR':
      return 'ODIN Bullish ↔ Options Bearish';
    case 'SENTIMENT_DIVERGENCE_ODIN_BEAR_UOA_BULL':
      return 'ODIN Bearish ↔ Options Bullish';
    default: return flag.replace(/_/g, ' ');
  }
}

function flagColor(flag: string): string {
  if (flag.includes('DIVERGENCE')) return '#f97316';
  if (flag.includes('CALL')) return '#22c55e';
  if (flag.includes('PUT')) return '#ef4444';
  return '#60a5fa';
}

// ── API Base URL ─────────────────────────────────────────────

const API_BASE = 'https://www.pdufa.bio';

// ── Component ───────────────────────────────────────────────

export function OptionsFlowCard({ ticker, catalystId }: Props) {
  const [signal, setSignal] = useState<OptionsSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchSignals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (ticker) params.set('ticker', ticker);
      if (catalystId) params.set('catalyst_id', catalystId);

      const res = await fetch(`${API_BASE}/api/options-signals?${params}`, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.signals && data.signals.length > 0) {
        setSignal(data.signals[0]);
      } else {
        setSignal(null);
      }
    } catch (err: any) {
      console.warn('[OptionsFlow] Fetch error:', err);
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [ticker, catalystId]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  // ── Loading State ─────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 OPTIONS & FLOW</Text>
        </View>
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={COLORS.accentLight} />
          <Text style={styles.loadingText}>Loading options data...</Text>
        </View>
      </View>
    );
  }

  // ── Error / No Data ───────────────────────────────────────

  if (error || !signal || signal.odin_options_pressure === null) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 OPTIONS & FLOW</Text>
        </View>
        <Text style={styles.unavailableText}>
          Options data unavailable for {ticker}.
        </Text>
      </View>
    );
  }

  // ── Data Ready ────────────────────────────────────────────

  const pressure = signal.odin_options_pressure ?? 0;
  const whaleBias = signal.odin_whale_bias ?? 0;
  const volShock = signal.odin_vol_shock ?? 0;
  const uoaFlags = signal.uoa_flags || [];
  const uoaSignals = signal.uoa_signals || [];
  const vs = volShockInfo(volShock);

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>📊 OPTIONS & FLOW</Text>
          {uoaFlags.length > 0 && (
            <View style={styles.alertBadge}>
              <Text style={styles.alertBadgeText}>
                {uoaFlags.length} ALERT{uoaFlags.length !== 1 ? 'S' : ''}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.expandArrow}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Collapsed Summary */}
      {!expanded && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pressure</Text>
            <Text style={[styles.summaryValue, { color: pressureColor(pressure) }]}>
              {Math.round(pressure)} — {pressureLabel(pressure)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Whale Bias</Text>
            <Text style={[styles.summaryValue, { color: biasColor(whaleBias) }]}>
              {biasArrow(whaleBias)} {biasLabel(whaleBias)}
            </Text>
          </View>
          {volShock >= 40 && (
            <>
              <View style={styles.summaryDivider} />
              <View style={[styles.volShockBadge, { borderColor: vs.color }]}>
                <Text style={[styles.volShockText, { color: vs.color }]}>
                  ⚡ {vs.text}
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Expanded Detail */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Options Pressure */}
          <View style={styles.metricSection}>
            <Text style={styles.miniLabel}>OPTIONS PRESSURE</Text>
            <View style={styles.pressureRow}>
              <Text style={[styles.pressureBig, { color: pressureColor(pressure) }]}>
                {Math.round(pressure)}
              </Text>
              <View style={[styles.pressurePill, { backgroundColor: pressureColor(pressure) + '20', borderColor: pressureColor(pressure) }]}>
                <Text style={[styles.pressurePillText, { color: pressureColor(pressure) }]}>
                  {pressureLabel(pressure)}
                </Text>
              </View>
            </View>
            {/* Pressure bar */}
            <View style={styles.pressureBarBg}>
              <View style={[styles.pressureBarFill, { width: `${Math.min(pressure, 100)}%`, backgroundColor: pressureColor(pressure) }]} />
            </View>
          </View>

          {/* Whale Bias */}
          <View style={styles.metricSection}>
            <Text style={styles.miniLabel}>WHALE BIAS</Text>
            <View style={styles.biasRow}>
              <Text style={[styles.biasArrowBig, { color: biasColor(whaleBias) }]}>
                {biasArrow(whaleBias)}
              </Text>
              <View>
                <Text style={[styles.biasLabelText, { color: biasColor(whaleBias) }]}>
                  {biasLabel(whaleBias)}
                </Text>
                <Text style={styles.biasScoreText}>
                  Score: {whaleBias > 0 ? '+' : ''}{whaleBias.toFixed(1)}
                </Text>
              </View>
            </View>
            {/* Bias bar */}
            <View style={styles.biasBarBg}>
              <View style={[styles.biasBarFill, {
                width: `${((whaleBias + 100) / 200) * 100}%`,
                backgroundColor: biasColor(whaleBias),
              }]} />
            </View>
            <View style={styles.biasBarLabels}>
              <Text style={styles.biasBarBearish}>BEARISH</Text>
              <Text style={styles.biasBarNeutral}>|</Text>
              <Text style={styles.biasBarBullish}>BULLISH</Text>
            </View>
          </View>

          {/* Vol Shock */}
          <View style={styles.metricSection}>
            <Text style={styles.miniLabel}>VOLATILITY SHOCK</Text>
            <View style={styles.volRow}>
              <Text style={[styles.volBig, { color: vs.color }]}>
                {Math.round(volShock)}
              </Text>
              <View style={[styles.volTag, { borderColor: vs.color }]}>
                <Text style={[styles.volTagText, { color: vs.color }]}>
                  {vs.text}
                </Text>
              </View>
            </View>
            <Text style={styles.volDescription}>
              {volShock >= 70
                ? 'Significant IV expansion — market pricing large move.'
                : volShock >= 40
                ? 'Above-normal vol — positioning building.'
                : 'Volatility within normal range.'}
            </Text>
          </View>

          {/* UOA Flags */}
          {uoaFlags.length > 0 && (
            <View style={styles.metricSection}>
              <Text style={styles.miniLabel}>UNUSUAL OPTIONS ACTIVITY</Text>
              {uoaFlags.map((flag, i) => (
                <View key={i} style={[styles.uoaFlagRow, { borderLeftColor: flagColor(flag) }]}>
                  <Text style={styles.uoaIcon}>{flagIcon(flag)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.uoaFlagLabel, { color: flagColor(flag) }]}>
                      {flagLabel(flag)}
                    </Text>
                    {flag.includes('DIVERGENCE') && (
                      <Text style={styles.uoaFlagSub}>
                        Options flow conflicts with ODIN probability — warrants review.
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* UOA Signal Details */}
          {uoaSignals.length > 0 && (
            <View style={styles.metricSection}>
              <Text style={styles.miniLabel}>SIGNAL DETAILS</Text>
              {uoaSignals.map((sig, i) => (
                <View key={i} style={styles.signalDetailRow}>
                  <Text style={[styles.signalRuleId, {
                    color: sig.direction === 'BULLISH' || sig.direction === 'CALL' ? '#22c55e' : '#ef4444'
                  }]}>
                    {sig.direction === 'BULLISH' || sig.direction === 'CALL' ? '▲' : '▼'} {sig.rule_id}
                  </Text>
                  <Text style={styles.signalStrength}>
                    {typeof sig.strength === 'number' ? sig.strength.toFixed(2) : sig.strength}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Data source */}
          <Text style={styles.footerText}>
            Data: {signal.data_source === 'sample' ? 'Simulated (dev)' : signal.data_source}
            {signal.last_updated && ` • ${new Date(signal.last_updated).toLocaleTimeString()}`}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  alertBadge: {
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  alertBadgeText: {
    color: '#f97316',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  expandArrow: {
    color: COLORS.textMuted,
    fontSize: 10,
  },

  // Summary row
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 14,
    flexWrap: 'wrap',
  },
  summaryItem: {
    gap: 2,
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 1,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    height: 26,
    backgroundColor: COLORS.border,
  },
  volShockBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  volShockText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Loading / error
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  loadingText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  unavailableText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    padding: 14,
  },

  // Expanded
  expandedContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  metricSection: {
    marginBottom: 18,
  },
  miniLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  // Pressure
  pressureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  pressureBig: {
    fontSize: 28,
    fontWeight: '900',
  },
  pressurePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  pressurePillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pressureBarBg: {
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  pressureBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Bias
  biasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  biasArrowBig: {
    fontSize: 24,
    fontWeight: '900',
  },
  biasLabelText: {
    fontWeight: '800',
    fontSize: 14,
  },
  biasScoreText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  biasBarBg: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  biasBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  biasBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  biasBarBearish: { color: '#ef4444', fontSize: 8, fontWeight: '600' },
  biasBarNeutral: { color: COLORS.textMuted, fontSize: 8 },
  biasBarBullish: { color: '#22c55e', fontSize: 8, fontWeight: '600' },

  // Vol shock
  volRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  volBig: {
    fontSize: 22,
    fontWeight: '900',
  },
  volTag: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  volTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  volDescription: {
    color: COLORS.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },

  // UOA flags
  uoaFlagRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    backgroundColor: COLORS.bgElevated,
    borderRadius: 6,
    borderLeftWidth: 3,
    marginTop: 6,
  },
  uoaIcon: {
    fontSize: 14,
  },
  uoaFlagLabel: {
    fontWeight: '700',
    fontSize: 12,
  },
  uoaFlagSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },

  // Signal details
  signalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  signalRuleId: {
    fontSize: 11,
    fontWeight: '700',
  },
  signalStrength: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  // Footer
  footerText: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: 8,
    textAlign: 'center',
  },
});
