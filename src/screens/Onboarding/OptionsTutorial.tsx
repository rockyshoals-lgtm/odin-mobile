// ODIN Mobile — Options Tutorial (Swipeable Cards)
// Instagram story-style walkthrough: Options, Calls, Puts, IV, Straddles
// Written like you're explaining to a 5-year-old

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width;

interface TutorialCard {
  id: string;
  emoji: string;
  title: string;
  analogy: string;
  explanation: string;
  example: string;
  odinTip: string;
  color: string;
}

const CARDS: TutorialCard[] = [
  {
    id: 'options',
    emoji: '🎟️',
    title: 'What Are Options?',
    analogy: "Imagine you find a house you love. You pay the owner $1,000 to hold it for you for 30 days at today's price. That $1,000 is non-refundable — but if the house price jumps $50K, you just saved $49K. If it drops? You only lost the $1,000 ticket.",
    explanation: "An option is a contract that gives you the RIGHT (but not obligation) to buy or sell a stock at a specific price before a specific date. You pay a small premium upfront for this right.",
    example: "Stock is at $50. You pay $2 for the right to buy it at $50 anytime in the next 30 days. If the stock goes to $65, your $2 bet just made you $13. If it drops? You lose the $2, that's it.",
    odinTip: "In biotech, options let you bet on FDA decisions without risking a full stock position. ODIN tells you the probability — you choose your bet size.",
    color: COLORS.accent,
  },
  {
    id: 'calls',
    emoji: '📈',
    title: 'Call Options (Betting UP)',
    analogy: "A call is like a coupon that says: 'I can buy this item at $50 no matter what the store raises the price to.' If the price goes to $80, your coupon is worth $30. If the price drops to $30, you just throw the coupon away.",
    explanation: "A CALL gives you the right to BUY a stock at a set price (the 'strike price'). You buy calls when you think the stock is going UP. Your max loss is just what you paid for the call.",
    example: "Drug XYZ is at $40. ODIN says 90% chance of FDA approval. You buy a $40 call for $3. If approved, stock rockets to $70 — your call is worth $30. You turned $3 into $30 (10x return). If rejected, you lose $3.",
    odinTip: "ODIN's tier system helps you pick which catalysts are worth buying calls on. Tier 1 = highest conviction = strongest call plays.",
    color: COLORS.tier1,
  },
  {
    id: 'puts',
    emoji: '📉',
    title: 'Put Options (Betting DOWN)',
    analogy: "A put is like an insurance policy on your car. You pay a small amount now, and if something bad happens (crash = stock drops), the insurance pays you. If nothing bad happens, you just lose the premium.",
    explanation: "A PUT gives you the right to SELL a stock at a set price. You buy puts when you think the stock is going DOWN, or to protect a stock you already own. It's basically portfolio insurance.",
    example: "You own stock at $50. ODIN shows a Tier 4 catalyst (risky). You buy a $45 put for $2 as protection. If the FDA rejects and the stock falls to $20, your put lets you sell at $45 — saving you $23.",
    odinTip: "For Tier 3 and Tier 4 catalysts, puts can be your safety net. Even if you're bullish, a small put position protects against CRL (Complete Response Letter) risk.",
    color: COLORS.tier4,
  },
  {
    id: 'iv',
    emoji: '🌊',
    title: "Implied Volatility (IV)",
    analogy: "Think of IV like the weather forecast before a big event. 'There's a 70% chance of a massive storm' — that uncertainty makes everyone rush to buy umbrellas, driving up prices. After the event? Umbrella prices crash back down. That crash = IV crush.",
    explanation: "IV measures how much the market EXPECTS a stock to move. High IV = big expected move = expensive options. Before a PDUFA date, IV skyrockets because everyone knows a huge move is coming. After the decision, IV plummets — this is called 'IV crush.'",
    example: "Before PDUFA: IV is 200%, a $5 call costs $8. Day after PDUFA: IV drops to 60%, and even if the stock barely moved, that $8 call might only be worth $3. The volatility premium evaporated.",
    odinTip: "ODIN calculates IV from the catalyst's tier and days-to-event. Watch for IV crush — it can eat your profits even on correct predictions. Straddles can help you profit regardless of direction.",
    color: COLORS.coin,
  },
  {
    id: 'straddles',
    emoji: '🦅',
    title: 'Straddles (Betting on MOVEMENT)',
    analogy: "Imagine betting on a coin flip — but instead of picking heads or tails, you bet that the coin will be flipped at all. You don't care which way it lands, just that something dramatic happens. A straddle is like that.",
    explanation: "A STRADDLE = buying a call AND a put at the same strike price. You profit if the stock makes a BIG move in EITHER direction. Perfect when you know a catalyst will cause movement but aren't sure which way.",
    example: "Stock at $50 before PDUFA. You buy a $50 call ($4) and a $50 put ($4) = $8 total. If the stock jumps to $70 (approval), call is worth $20, put is worthless = $12 profit. If it crashes to $25 (rejection), put is worth $25, call is worthless = $17 profit. Only lose if the stock stays near $50.",
    odinTip: "Straddles shine on Tier 2 and Tier 3 catalysts where the probability is uncertain. ODIN helps you find catalysts where a big move is likely but the direction is unclear — that's straddle territory.",
    color: COLORS.cews,
  },
];

interface Props {
  onComplete: () => void;
}

export function OptionsTutorial({ onComplete }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / CARD_WIDTH);
    if (index !== activeIndex && index >= 0 && index < CARDS.length) {
      setActiveIndex(index);
    }
  };

  const goNext = () => {
    if (activeIndex < CARDS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    }
  };

  const renderCard = ({ item, index }: { item: TutorialCard; index: number }) => (
    <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
      <View style={styles.cardScroll}>
        {/* Card number */}
        <Text style={styles.cardNumber}>{index + 1} / {CARDS.length}</Text>

        {/* Emoji + Title */}
        <Text style={styles.cardEmoji}>{item.emoji}</Text>
        <Text style={styles.cardTitle}>{item.title}</Text>

        {/* The Analogy — the "like you're 5" part */}
        <View style={[styles.analogyCard, { borderColor: item.color + '40' }]}>
          <Text style={styles.analogyLabel}>THINK OF IT LIKE...</Text>
          <Text style={styles.analogyText}>{item.analogy}</Text>
        </View>

        {/* Technical explanation */}
        <View style={styles.explanationCard}>
          <Text style={styles.explanationLabel}>THE REAL DEAL</Text>
          <Text style={styles.explanationText}>{item.explanation}</Text>
        </View>

        {/* Example */}
        <View style={styles.exampleCard}>
          <Text style={styles.exampleLabel}>EXAMPLE</Text>
          <Text style={styles.exampleText}>{item.example}</Text>
        </View>

        {/* ODIN Tip */}
        <View style={[styles.odinTipCard, { borderColor: COLORS.accent + '40' }]}>
          <Text style={styles.odinTipLabel}>ODIN TIP</Text>
          <Text style={styles.odinTipText}>{item.odinTip}</Text>
        </View>
      </View>
    </View>
  );

  const isLast = activeIndex === CARDS.length - 1;

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>OPTIONS 101</Text>
        <TouchableOpacity onPress={onComplete}>
          <Text style={styles.skipAll}>Skip All</Text>
        </TouchableOpacity>
      </View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {CARDS.map((card, i) => (
          <View
            key={card.id}
            style={[
              styles.dot,
              i === activeIndex && styles.dotActive,
              i < activeIndex && styles.dotDone,
              { backgroundColor: i === activeIndex ? card.color : i < activeIndex ? card.color + '60' : COLORS.bgInput },
            ]}
          />
        ))}
      </View>

      {/* Swipeable cards */}
      <FlatList
        ref={flatListRef}
        data={CARDS}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        {isLast ? (
          <TouchableOpacity style={styles.doneButton} onPress={onComplete} activeOpacity={0.8}>
            <Text style={styles.doneButtonText}>I'M READY TO TRADE</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={goNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>NEXT: {CARDS[activeIndex + 1]?.title.toUpperCase()}</Text>
            <Text style={styles.nextArrow}>→</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.swipeHint}>← Swipe to navigate →</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  topTitle: {
    color: COLORS.accentLight,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  skipAll: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  dotDone: {
    opacity: 0.6,
  },

  // Cards
  cardContainer: {
    paddingHorizontal: 20,
  },
  cardScroll: {
    flex: 1,
  },
  cardNumber: {
    color: COLORS.textDisabled,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },

  // Analogy
  analogyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  analogyLabel: {
    color: COLORS.coin,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  analogyText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },

  // Explanation
  explanationCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  explanationLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  explanationText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
  },

  // Example
  exampleCard: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  exampleLabel: {
    color: COLORS.tier1,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  exampleText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 19,
  },

  // ODIN Tip
  odinTipCard: {
    backgroundColor: COLORS.accentBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  odinTipLabel: {
    color: COLORS.accentLight,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  odinTipText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    lineHeight: 19,
    fontWeight: '500',
  },

  // Bottom nav
  bottomNav: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 8,
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  nextButtonText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  nextArrow: {
    color: COLORS.accentLight,
    fontSize: 16,
    fontWeight: '800',
  },
  doneButton: {
    backgroundColor: COLORS.accentBg,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  doneButtonText: {
    color: COLORS.accentLight,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },
  swipeHint: {
    color: COLORS.textDisabled,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
});
