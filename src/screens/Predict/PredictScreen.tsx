import React, { useState, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated, ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TIER_CONFIG, TierKey } from '../../constants/colors';
import { useCatalystStore } from '../../stores/catalystStore';
import { usePredictionStore } from '../../stores/predictionStore';
import { TierBadge } from '../../components/Common/TierBadge';
import { StreakBanner } from '../../components/Common/StreakBanner';
import { DailyQuestCard } from '../../components/Common/DailyQuestCard';
import { JackpotPoolCard } from '../../components/Common/JackpotPoolCard';
import { CelebrationOverlay } from '../../components/Common/CelebrationOverlay';
import { fmtDateShort, fmtDaysUntil, fmtProb } from '../../utils/formatting';
import { Catalyst, UserPrediction } from '../../constants/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.55; // TikTok-style tall cards

const CONFIDENCE_LEVELS: { key: UserPrediction['confidence']; label: string; coins: string; desc: string }[] = [
  { key: 'CONSERVATIVE', label: 'SAFE', coins: '+5', desc: 'Low risk' },
  { key: 'STANDARD', label: 'STANDARD', coins: '+10', desc: 'Balanced' },
  { key: 'AGGRESSIVE', label: 'ALPHA', coins: '+20', desc: 'High conviction' },
];

export function PredictScreen() {
  const { catalysts } = useCatalystStore();
  const {
    predictions, submitVote, odinCoins, getCoinTier, getCoinTierEmoji,
    hasPredicted, sentiment, currentStreak, longestStreak,
    getStreakMultiplier, showCelebration, lastCoinReward, dismissCelebration,
    getDailyQuestProgress, claimDailyBonus, getWeeklyPoolInfo,
  } = usePredictionStore();

  const [confidence, setConfidence] = useState<UserPrediction['confidence']>('STANDARD');
  const [activeIndex, setActiveIndex] = useState(0);

  // Filter to upcoming catalysts
  const upcoming = useMemo(() => {
    const now = new Date();
    return catalysts
      .filter(c => new Date(c.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [catalysts]);

  const handleVote = useCallback((catalyst: Catalyst, prediction: 'APPROVE' | 'CRL') => {
    submitVote(catalyst.id, prediction, confidence);
  }, [confidence, submitVote]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const streakMult = getStreakMultiplier();
  const questProgress = getDailyQuestProgress();
  const jackpotInfo = getWeeklyPoolInfo();

  const renderVerticalCard = ({ item: catalyst, index }: { item: Catalyst; index: number }) => {
    const tierConfig = TIER_CONFIG[catalyst.tier as TierKey] || TIER_CONFIG.TIER_4;
    const voted = hasPredicted(catalyst.id);
    const userVote = predictions[catalyst.id];
    const communityData = sentiment[catalyst.id];

    return (
      <View style={[styles.verticalCard, { height: CARD_HEIGHT }]}>
        {/* Card number indicator */}
        <View style={styles.cardIndicator}>
          <Text style={styles.cardIndex}>{index + 1} / {upcoming.length}</Text>
          <Text style={styles.swipeHint}>Swipe ↓ for more</Text>
        </View>

        {/* Catalyst Header */}
        <View style={styles.cardHeader}>
          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>{fmtDateShort(catalyst.date)}</Text>
          </View>
          <View style={[styles.countdownChip, { backgroundColor: tierConfig.bg }]}>
            <Text style={[styles.countdownText, { color: tierConfig.color }]}>{fmtDaysUntil(catalyst.date)}</Text>
          </View>
          <View style={[styles.typeChip, { backgroundColor: catalyst.type === 'PDUFA' ? COLORS.accentBg : COLORS.cewsBg }]}>
            <Text style={[styles.typeChipText, { color: catalyst.type === 'PDUFA' ? COLORS.accentLight : COLORS.cews }]}>{catalyst.type}</Text>
          </View>
        </View>

        {/* Ticker + Drug */}
        <Text style={styles.ticker}>{catalyst.ticker}</Text>
        <Text style={styles.drugName}>{catalyst.drug}</Text>
        <Text style={styles.indication}>{catalyst.indication}</Text>
        <Text style={styles.ta}>{catalyst.ta}</Text>

        {/* Big ODIN Score */}
        <View style={styles.scoreSection}>
          <TierBadge tier={catalyst.tier} prob={catalyst.prob} size="lg" />
          <View style={styles.scoreRight}>
            <Text style={[styles.bigProb, { color: tierConfig.color }]}>{fmtProb(catalyst.prob)}</Text>
            <Text style={styles.probLabel}>ODIN PROBABILITY</Text>
            {streakMult > 1 && (
              <Text style={styles.multiplierHint}>🔥 {streakMult}x coin bonus active</Text>
            )}
          </View>
        </View>

        {/* Community Sentiment */}
        {communityData && (
          <View style={styles.communitySection}>
            <View style={styles.communityBar}>
              <View style={[styles.communityGreen, { flex: communityData.approvePct }]} />
              <View style={[styles.communityRed, { flex: 100 - communityData.approvePct }]} />
            </View>
            <View style={styles.communityLabels}>
              <Text style={[styles.communityPct, { color: COLORS.approve }]}>{communityData.approvePct}%</Text>
              <Text style={styles.communityTotal}>{communityData.totalVotes} votes</Text>
              <Text style={[styles.communityPct, { color: COLORS.crl }]}>{100 - communityData.approvePct}%</Text>
            </View>
          </View>
        )}

        {/* Vote / Voted Section */}
        {voted ? (
          <View style={styles.votedArea}>
            <View style={styles.votedBadge}>
              <Text style={styles.votedEmoji}>{userVote?.prediction === 'APPROVE' ? '✅' : '🔴'}</Text>
              <Text style={styles.votedText}>You voted {userVote?.prediction}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.voteSection}>
            {/* Confidence Selector */}
            <View style={styles.confidenceRow}>
              {CONFIDENCE_LEVELS.map(level => {
                const isActive = confidence === level.key;
                const displayCoins = streakMult > 1
                  ? `+${Math.round(parseInt(level.coins.slice(1)) * streakMult)}`
                  : level.coins;
                return (
                  <TouchableOpacity
                    key={level.key}
                    style={[styles.confBtn, isActive && styles.confBtnActive]}
                    onPress={() => setConfidence(level.key)}
                  >
                    <Text style={[styles.confLabel, isActive && styles.confLabelActive]}>{level.label}</Text>
                    <Text style={[styles.confCoins, isActive && styles.confCoinsActive]}>{displayCoins}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Big Vote Buttons */}
            <View style={styles.voteRow}>
              <TouchableOpacity
                style={styles.approveBtn}
                onPress={() => handleVote(catalyst, 'APPROVE')}
                activeOpacity={0.7}
              >
                <Text style={styles.approveBtnEmoji}>✓</Text>
                <Text style={styles.approveBtnText}>APPROVE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.crlBtn}
                onPress={() => handleVote(catalyst, 'CRL')}
                activeOpacity={0.7}
              >
                <Text style={styles.crlBtnEmoji}>✗</Text>
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
      {/* Header with coin display */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>PREDICT</Text>
          <Text style={styles.subtitle}>Swipe through upcoming catalysts</Text>
        </View>
        <View style={styles.coinChip}>
          <Text style={styles.coinEmoji}>{getCoinTierEmoji()}</Text>
          <View>
            <Text style={styles.coinAmount}>{odinCoins}</Text>
            <Text style={styles.coinTier}>{getCoinTier()}</Text>
          </View>
        </View>
      </View>

      {/* Streak Banner */}
      <StreakBanner streak={currentStreak} multiplier={streakMult} longestStreak={longestStreak} />

      {/* Daily Quest */}
      <DailyQuestCard
        reviewed={questProgress.reviewed}
        total={questProgress.total}
        completed={questProgress.completed}
        bonusClaimed={questProgress.bonusClaimed}
        onClaim={claimDailyBonus}
      />

      {/* TikTok-style vertical catalyst feed */}
      <FlatList
        data={upcoming}
        renderItem={renderVerticalCard}
        keyExtractor={item => item.id}
        pagingEnabled
        snapToInterval={CARD_HEIGHT + 12}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        ListFooterComponent={
          <JackpotPoolCard
            totalPool={jackpotInfo.totalPool}
            userContribution={jackpotInfo.userContribution}
            weekId={jackpotInfo.weekId}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>No upcoming catalysts</Text>
            <Text style={styles.emptySubtext}>Check back soon for new PDUFA dates</Text>
          </View>
        }
      />

      {/* Stats footer */}
      <View style={styles.footer}>
        <View style={styles.footerStat}>
          <Text style={styles.footerValue}>{Object.keys(predictions).length}</Text>
          <Text style={styles.footerLabel}>Votes</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerStat}>
          <Text style={[styles.footerValue, { color: COLORS.coin }]}>{odinCoins}</Text>
          <Text style={styles.footerLabel}>Coins</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerStat}>
          <Text style={[styles.footerValue, currentStreak >= 7 ? { color: COLORS.crl } : currentStreak >= 3 ? { color: COLORS.coin } : {}]}>
            {currentStreak > 0 ? `🔥${currentStreak}` : '—'}
          </Text>
          <Text style={styles.footerLabel}>Streak</Text>
        </View>
        <View style={styles.footerDivider} />
        <View style={styles.footerStat}>
          <Text style={styles.footerValue}>{getCoinTier()}</Text>
          <Text style={styles.footerLabel}>Rank</Text>
        </View>
      </View>

      {/* Celebration Overlay */}
      <CelebrationOverlay
        visible={showCelebration}
        coinReward={lastCoinReward}
        streakCount={currentStreak}
        streakMultiplier={streakMult}
        onDismiss={dismissCelebration}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  subtitle: { color: COLORS.textMuted, fontSize: 11 },
  coinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.coinBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.coin,
  },
  coinEmoji: { fontSize: 18 },
  coinAmount: { color: COLORS.coin, fontSize: 16, fontWeight: '800' },
  coinTier: { color: COLORS.coin, fontSize: 8, fontWeight: '600', letterSpacing: 0.5 },

  // Feed
  feedContent: { paddingHorizontal: 16, paddingBottom: 8 },

  // Vertical card (TikTok-style)
  verticalCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  cardIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIndex: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  swipeHint: { color: COLORS.textDisabled, fontSize: 9, fontStyle: 'italic' },

  cardHeader: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  dateChip: { backgroundColor: COLORS.bgInput, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  dateChipText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  countdownChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  countdownText: { fontSize: 12, fontWeight: '800' },
  typeChip: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },

  ticker: { color: COLORS.accentLight, fontSize: 24, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  drugName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  indication: { color: COLORS.textMuted, fontSize: 13, marginBottom: 2 },
  ta: { color: COLORS.textDisabled, fontSize: 11, fontWeight: '600', marginBottom: 10 },

  // Score section
  scoreSection: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  scoreRight: {},
  bigProb: { fontSize: 34, fontWeight: '900' },
  probLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  multiplierHint: { color: COLORS.coin, fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Community
  communitySection: { marginBottom: 10 },
  communityBar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  communityGreen: { backgroundColor: COLORS.approve },
  communityRed: { backgroundColor: COLORS.crl },
  communityLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  communityPct: { fontSize: 11, fontWeight: '700' },
  communityTotal: { color: COLORS.textMuted, fontSize: 10 },

  // Voted
  votedArea: { alignItems: 'center', paddingVertical: 12 },
  votedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.bgInput,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  votedEmoji: { fontSize: 22 },
  votedText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },

  // Vote section
  voteSection: {},
  confidenceRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  confBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confBtnActive: { backgroundColor: COLORS.accentBg, borderColor: COLORS.accent },
  confLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  confLabelActive: { color: COLORS.accentLight },
  confCoins: { color: COLORS.textMuted, fontSize: 13, fontWeight: '800' },
  confCoinsActive: { color: COLORS.coin },

  voteRow: { flexDirection: 'row', gap: 12 },
  approveBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 2,
    borderColor: COLORS.approve,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  crlBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 2,
    borderColor: COLORS.crl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  approveBtnEmoji: { color: COLORS.approve, fontSize: 18, fontWeight: '900' },
  approveBtnText: { color: COLORS.approve, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  crlBtnEmoji: { color: COLORS.crl, fontSize: 18, fontWeight: '900' },
  crlBtnText: { color: COLORS.crl, fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  footerStat: { alignItems: 'center' },
  footerValue: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '800' },
  footerLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
  footerDivider: { width: 1, height: 24, backgroundColor: COLORS.border },

  // Empty
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
});
