import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { COLORS, TIER_CONFIG, TierKey } from '../../constants/colors';
import { Catalyst } from '../../constants/types';
import { TierBadge } from '../../components/Common/TierBadge';
import { fmtDateFull, fmtDaysUntil, fmtProb, daysUntil } from '../../utils/formatting';
import { useWatchlistStore } from '../../stores/watchlistStore';
import { usePredictionStore } from '../../stores/predictionStore';

interface Props {
  catalyst: Catalyst;
  onClose: () => void;
}

export function CatalystDetail({ catalyst, onClose }: Props) {
  const { isWatched, toggle } = useWatchlistStore();
  const { predictions, sentiment, submitVote, hasPredicted, reviewCatalyst } = usePredictionStore();
  const watched = isWatched(catalyst.id);
  const tierConfig = TIER_CONFIG[catalyst.tier as TierKey] || TIER_CONFIG.TIER_4;
  const days = daysUntil(catalyst.date);
  const userVote = predictions[catalyst.id];
  const communityData = sentiment[catalyst.id];

  // Track this as a "reviewed" catalyst for Daily Edge Quest
  React.useEffect(() => {
    reviewCatalyst(catalyst.id);
  }, [catalyst.id]);

  const handleVote = (prediction: 'APPROVE' | 'CRL') => {
    if (!hasPredicted(catalyst.id)) {
      submitVote(catalyst.id, prediction, 'STANDARD');
    }
  };

  const signals = catalyst.signals ? Object.entries(catalyst.signals) : [];

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handleBar} />

        <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.tickerRow}>
                <Text style={styles.ticker}>{catalyst.ticker}</Text>
                <Text style={styles.type}>{catalyst.type}</Text>
              </View>
              <Text style={styles.company}>{catalyst.company}</Text>
              <Text style={styles.drug}>{catalyst.drug}</Text>
              <Text style={styles.indication}>{catalyst.indication}</Text>
            </View>
            <TierBadge tier={catalyst.tier} prob={catalyst.prob} size="lg" />
          </View>

          {/* Date + Countdown */}
          <View style={styles.dateBox}>
            <View>
              <Text style={styles.dateLabel}>PDUFA DATE</Text>
              <Text style={styles.dateValue}>{fmtDateFull(catalyst.date)}</Text>
            </View>
            <View style={[styles.countdownBox, { borderColor: days <= 7 ? COLORS.crl : days <= 14 ? COLORS.delayed : COLORS.border }]}>
              <Text style={[styles.countdownValue, { color: days <= 7 ? COLORS.crl : days <= 14 ? COLORS.delayed : COLORS.accentLight }]}>
                {fmtDaysUntil(catalyst.date)}
              </Text>
              <Text style={styles.countdownLabel}>remaining</Text>
            </View>
          </View>

          {/* ODIN Score */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ODIN PROBABILITY</Text>
            <View style={styles.probDisplay}>
              <Text style={[styles.probBig, { color: tierConfig.color }]}>{fmtProb(catalyst.prob)}</Text>
              <View style={[styles.tierTag, { backgroundColor: tierConfig.bg, borderColor: tierConfig.color }]}>
                <Text style={[styles.tierTagText, { color: tierConfig.color }]}>{tierConfig.fullLabel}</Text>
              </View>
            </View>
            {/* Prob bar */}
            <View style={styles.probBarBg}>
              <View style={[styles.probBarFill, { width: `${catalyst.prob * 100}%`, backgroundColor: tierConfig.color }]} />
            </View>
          </View>

          {/* Signal Breakdown */}
          {signals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SIGNAL BREAKDOWN</Text>
              {signals.map(([key, val]) => (
                <View key={key} style={styles.signalRow}>
                  <Text style={styles.signalKey}>{key.replace(/_/g, ' ')}</Text>
                  <Text style={[styles.signalVal, { color: val > 0 ? COLORS.approve : val < 0 ? COLORS.crl : COLORS.textMuted }]}>
                    {val > 0 ? '+' : ''}{(val as number).toFixed(3)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Community Voting */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMMUNITY PREDICTION</Text>
            {communityData ? (
              <View>
                <View style={styles.communityBar}>
                  <View style={[styles.communityFillApprove, { flex: communityData.approvePct }]} />
                  <View style={[styles.communityFillCrl, { flex: 100 - communityData.approvePct }]} />
                </View>
                <View style={styles.communityLabels}>
                  <Text style={styles.communityApprove}>{communityData.approvePct}% APPROVE</Text>
                  <Text style={styles.communityCrl}>{100 - communityData.approvePct}% CRL</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noCommunity}>Be the first to vote!</Text>
            )}

            {/* Vote Buttons */}
            {userVote ? (
              <View style={styles.votedBadge}>
                <Text style={styles.votedText}>You voted: {userVote.prediction}</Text>
              </View>
            ) : (
              <View style={styles.voteButtons}>
                <TouchableOpacity style={[styles.voteBtn, styles.approveBtn]} onPress={() => handleVote('APPROVE')}>
                  <Text style={styles.voteBtnText}>APPROVE</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.voteBtn, styles.crlBtn]} onPress={() => handleVote('CRL')}>
                  <Text style={styles.voteBtnText}>CRL</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Designations */}
          {catalyst.designations && catalyst.designations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>DESIGNATIONS</Text>
              <View style={styles.designationRow}>
                {catalyst.designations.map((d, i) => (
                  <View key={i} style={styles.designationBadge}>
                    <Text style={styles.designationText}>{d}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, watched && styles.actionBtnActive]} onPress={() => toggle(catalyst.id)}>
              <Text style={styles.actionBtnText}>{watched ? '★ Watching' : '☆ Watch'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
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
    maxHeight: '90%',
    minHeight: '60%',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  scroll: { flex: 1 },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: COLORS.textSecondary, fontSize: 16 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  tickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  ticker: { color: COLORS.accentLight, fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  type: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700', backgroundColor: COLORS.bgInput, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  company: { color: COLORS.textSecondary, fontSize: 13, marginBottom: 4 },
  drug: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  indication: { color: COLORS.textMuted, fontSize: 13 },

  dateBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: 10, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border },
  dateLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  dateValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  countdownBox: { alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  countdownValue: { fontSize: 18, fontWeight: '800' },
  countdownLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600' },

  section: { marginBottom: 20 },
  sectionTitle: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },

  probDisplay: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  probBig: { fontSize: 36, fontWeight: '900' },
  tierTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1 },
  tierTagText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  probBarBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden' },
  probBarFill: { height: '100%', borderRadius: 3 },

  signalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  signalKey: { color: COLORS.textSecondary, fontSize: 13, textTransform: 'capitalize' },
  signalVal: { fontSize: 13, fontWeight: '700' },

  communityBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  communityFillApprove: { backgroundColor: COLORS.approve },
  communityFillCrl: { backgroundColor: COLORS.crl },
  communityLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  communityApprove: { color: COLORS.approve, fontSize: 12, fontWeight: '700' },
  communityCrl: { color: COLORS.crl, fontSize: 12, fontWeight: '700' },
  noCommunity: { color: COLORS.textMuted, fontSize: 13, fontStyle: 'italic' },

  voteButtons: { flexDirection: 'row', gap: 12, marginTop: 12 },
  voteBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  approveBtn: { backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 1, borderColor: COLORS.approve },
  crlBtn: { backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: COLORS.crl },
  voteBtnText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800', letterSpacing: 1 },

  votedBadge: { backgroundColor: COLORS.accentBg, borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 10 },
  votedText: { color: COLORS.accentLight, fontSize: 14, fontWeight: '700' },

  designationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  designationBadge: { backgroundColor: COLORS.accentBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  designationText: { color: COLORS.accentLight, fontSize: 11, fontWeight: '600' },

  actions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border },
  actionBtnActive: { backgroundColor: COLORS.coinBg, borderColor: COLORS.coin },
  actionBtnText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
});
