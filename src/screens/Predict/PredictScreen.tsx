import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TIER_CONFIG, TierKey } from '../../constants/colors';
import { useCatalystStore } from '../../stores/catalystStore';
import { usePredictionStore } from '../../stores/predictionStore';
import { TierBadge } from '../../components/Common/TierBadge';
import { fmtDateShort, fmtDaysUntil, fmtProb } from '../../utils/formatting';
import { Catalyst, UserPrediction } from '../../constants/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

const CONFIDENCE_LEVELS: { key: UserPrediction['confidence']; label: string; coins: string }[] = [
  { key: 'CONSERVATIVE', label: 'CONSERVATIVE', coins: '+5' },
  { key: 'STANDARD', label: 'STANDARD', coins: '+10' },
  { key: 'AGGRESSIVE', label: 'AGGRESSIVE', coins: '+20' },
];

export function PredictScreen() {
  const { catalysts } = useCatalystStore();
  const { predictions, submitVote, odinCoins, getCoinTier, hasPredicted, sentiment } = usePredictionStore();
  const [confidence, setConfidence] = useState<UserPrediction['confidence']>('STANDARD');

  // Filter to upcoming catalysts not yet voted on
  const upcoming = useMemo(() => {
    const now = new Date();
    return catalysts
      .filter(c => new Date(c.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [catalysts]);

  const handleVote = (catalyst: Catalyst, prediction: 'APPROVE' | 'CRL') => {
    submitVote(catalyst.id, prediction, confidence);
  };

  const renderVoteCard = ({ item: catalyst }: { item: Catalyst }) => {
    const tierConfig = TIER_CONFIG[catalyst.tier as TierKey] || TIER_CONFIG.TIER_4;
    const voted = hasPredicted(catalyst.id);
    const userVote = predictions[catalyst.id];
    const communityData = sentiment[catalyst.id];

    return (
      <View style={[styles.voteCard, { width: CARD_WIDTH }]}>
        {/* Top: Date + Countdown */}
        <View style={styles.cardTop}>
          <Text style={styles.cardDate}>{fmtDateShort(catalyst.date)}</Text>
          <Text style={[styles.cardCountdown, { color: tierConfig.color }]}>{fmtDaysUntil(catalyst.date)}</Text>
        </View>

        {/* Company + Drug */}
        <Text style={styles.cardTicker}>{catalyst.ticker}</Text>
        <Text style={styles.cardDrug}>{catalyst.drug}</Text>
        <Text style={styles.cardIndication}>{catalyst.indication}</Text>

        {/* ODIN Score */}
        <View style={styles.scoreRow}>
          <TierBadge tier={catalyst.tier} prob={catalyst.prob} size="lg" />
          <View style={styles.scoreInfo}>
            <Text style={[styles.scoreBig, { color: tierConfig.color }]}>{fmtProb(catalyst.prob)}</Text>
            <Text style={styles.scoreLabel}>ODIN Probability</Text>
          </View>
        </View>

        {/* Community Bar */}
        {communityData && (
          <View style={styles.communitySection}>
            <View style={styles.communityBar}>
              <View style={[styles.communityFillGreen, { flex: communityData.approvePct }]} />
              <View style={[styles.communityFillRed, { flex: 100 - communityData.approvePct }]} />
            </View>
            <Text style={styles.communityText}>
              Community: {communityData.approvePct}% Approve ({communityData.totalVotes} votes)
            </Text>
          </View>
        )}

        {/* Vote Area */}
        {voted ? (
          <View style={styles.votedArea}>
            <Text style={styles.votedEmoji}>{userVote?.prediction === 'APPROVE' ? '✅' : '🔴'}</Text>
            <Text style={styles.votedLabel}>You voted {userVote?.prediction}</Text>
            <Text style={styles.votedCoins}>+{userVote?.confidence === 'AGGRESSIVE' ? 20 : userVote?.confidence === 'STANDARD' ? 10 : 5} ODIN coins</Text>
          </View>
        ) : (
          <View style={styles.voteArea}>
            {/* Confidence Selector */}
            <View style={styles.confidenceRow}>
              {CONFIDENCE_LEVELS.map(level => (
                <TouchableOpacity
                  key={level.key}
                  style={[styles.confidenceBtn, confidence === level.key && styles.confidenceBtnActive]}
                  onPress={() => setConfidence(level.key)}
                >
                  <Text style={[styles.confidenceLabel, confidence === level.key && styles.confidenceLabelActive]}>{level.label}</Text>
                  <Text style={[styles.confidenceCoins, confidence === level.key && styles.confidenceCoinsActive]}>{level.coins}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Vote Buttons */}
            <View style={styles.voteButtons}>
              <TouchableOpacity style={styles.approveBtn} onPress={() => handleVote(catalyst, 'APPROVE')}>
                <Text style={styles.approveBtnText}>APPROVE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.crlBtn} onPress={() => handleVote(catalyst, 'CRL')}>
                <Text style={styles.crlBtnText}>CRL</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>PREDICT</Text>
          <Text style={styles.subtitle}>Cast your vote on upcoming catalysts</Text>
        </View>
        <View style={styles.coinDisplay}>
          <Text style={styles.coinAmount}>{odinCoins}</Text>
          <Text style={styles.coinLabel}>{getCoinTier()}</Text>
        </View>
      </View>

      {/* Vote Cards */}
      <FlatList
        data={upcoming}
        renderItem={renderVoteCard}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.carousel}
        ListEmptyComponent={
          <View style={[styles.emptyCard, { width: CARD_WIDTH }]}>
            <Text style={styles.emptyText}>No upcoming catalysts to vote on</Text>
          </View>
        }
      />

      {/* Stats footer */}
      <View style={styles.footer}>
        <View style={styles.footerStat}>
          <Text style={styles.footerValue}>{Object.keys(predictions).length}</Text>
          <Text style={styles.footerLabel}>Predictions</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerStat}>
          <Text style={styles.footerValue}>{odinCoins}</Text>
          <Text style={styles.footerLabel}>ODIN Coins</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerStat}>
          <Text style={styles.footerValue}>{getCoinTier()}</Text>
          <Text style={styles.footerLabel}>Rank</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: COLORS.textMuted, fontSize: 12 },
  coinDisplay: { alignItems: 'center', backgroundColor: COLORS.coinBg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: COLORS.coin },
  coinAmount: { color: COLORS.coin, fontSize: 18, fontWeight: '800' },
  coinLabel: { color: COLORS.coin, fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },

  carousel: { paddingHorizontal: 24, gap: 16 },
  voteCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 16,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardDate: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  cardCountdown: { fontSize: 14, fontWeight: '800' },
  cardTicker: { color: COLORS.accentLight, fontSize: 22, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  cardDrug: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 2 },
  cardIndication: { color: COLORS.textMuted, fontSize: 13, marginBottom: 16 },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  scoreInfo: {},
  scoreBig: { fontSize: 32, fontWeight: '900' },
  scoreLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },

  communitySection: { marginBottom: 16 },
  communityBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  communityFillGreen: { backgroundColor: COLORS.approve },
  communityFillRed: { backgroundColor: COLORS.crl },
  communityText: { color: COLORS.textMuted, fontSize: 11 },

  voteArea: {},
  confidenceRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  confidenceBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center', backgroundColor: COLORS.bgInput, borderWidth: 1, borderColor: COLORS.border },
  confidenceBtnActive: { backgroundColor: COLORS.accentBg, borderColor: COLORS.accent },
  confidenceLabel: { color: COLORS.textMuted, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  confidenceLabelActive: { color: COLORS.accentLight },
  confidenceCoins: { color: COLORS.textMuted, fontSize: 12, fontWeight: '800' },
  confidenceCoinsActive: { color: COLORS.coin },

  voteButtons: { flexDirection: 'row', gap: 12 },
  approveBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 2, borderColor: COLORS.approve },
  crlBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 2, borderColor: COLORS.crl },
  approveBtnText: { color: COLORS.approve, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  crlBtnText: { color: COLORS.crl, fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  votedArea: { alignItems: 'center', paddingVertical: 16, backgroundColor: COLORS.bgInput, borderRadius: 12 },
  votedEmoji: { fontSize: 28, marginBottom: 4 },
  votedLabel: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
  votedCoins: { color: COLORS.coin, fontSize: 13, fontWeight: '600', marginTop: 2 },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 16, gap: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerStat: { alignItems: 'center' },
  footerValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  footerLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  footerDivider: { width: 1, height: 30, backgroundColor: COLORS.border },

  emptyCard: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 15 },
});
