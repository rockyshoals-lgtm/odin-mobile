// ODIN Mobile — Options Experience Quiz
// 5 fun questions to gauge user's comfort with options trading
// Determines: BEGINNER, INTERMEDIATE, or ADVANCED

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

interface QuizAnswer {
  text: string;
  points: number;  // 0 = beginner, 1 = intermediate, 2 = advanced
  emoji: string;
}

interface QuizQuestion {
  question: string;
  subtext: string;
  emoji: string;
  answers: QuizAnswer[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    question: "You hear 'stock option' — first thought?",
    subtext: "Be honest, no judgment here",
    emoji: "🧠",
    answers: [
      { text: "Something to do with stocks... I think?", points: 0, emoji: "🤷" },
      { text: "The right to buy or sell at a set price", points: 1, emoji: "📝" },
      { text: "Greek letters and expiry curves", points: 2, emoji: "📊" },
    ],
  },
  {
    question: "What's a 'call' in trading?",
    subtext: "Not the kind you make on your phone",
    emoji: "📞",
    answers: [
      { text: "No clue — calling my broker?", points: 0, emoji: "😅" },
      { text: "A bet the stock goes up", points: 1, emoji: "📈" },
      { text: "Long delta, I sell covered calls for income", points: 2, emoji: "💰" },
    ],
  },
  {
    question: "Someone says 'IV crush' — you think...",
    subtext: "This one separates the wheat from the chaff",
    emoji: "💥",
    answers: [
      { text: "An energy drink flavor?", points: 0, emoji: "🥤" },
      { text: "Volatility drops after an event like earnings", points: 1, emoji: "🎯" },
      { text: "Time to sell premium before the catalyst", points: 2, emoji: "🧊" },
    ],
  },
  {
    question: "A biotech has a PDUFA in 7 days. Your move?",
    subtext: "ODIN says 85% approval probability",
    emoji: "🧬",
    answers: [
      { text: "What's a PDUFA? Just buy the stock?", points: 0, emoji: "🆕" },
      { text: "Buy calls, maybe a straddle to hedge", points: 1, emoji: "⚖️" },
      { text: "Sell puts, analyze the skew, check open interest", points: 2, emoji: "🔬" },
    ],
  },
  {
    question: "What are the Greeks to you?",
    subtext: "Delta, Gamma, Theta, Vega...",
    emoji: "🏛️",
    answers: [
      { text: "People from Greece, right?", points: 0, emoji: "🇬🇷" },
      { text: "They measure option sensitivity to stuff", points: 1, emoji: "📐" },
      { text: "I manage my portfolio delta-neutral", points: 2, emoji: "⚡" },
    ],
  },
];

interface Props {
  onComplete: (level: ExperienceLevel) => void;
}

export function OptionsQuiz({ onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const question = QUESTIONS[currentQ];
  const progress = (currentQ + 1) / QUESTIONS.length;

  const handleAnswer = (answerIndex: number, points: number) => {
    if (selectedAnswer !== null) return; // prevent double-tap
    setSelectedAnswer(answerIndex);

    const newScores = [...scores, points];

    // Brief highlight, then transition
    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        // Slide out
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(slideAnim, { toValue: -width, duration: 300, useNativeDriver: true }),
        ]).start(() => {
          setScores(newScores);
          setCurrentQ(currentQ + 1);
          setSelectedAnswer(null);
          slideAnim.setValue(width * 0.3);
          // Slide in
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }),
          ]).start();
        });
      } else {
        // Quiz complete — calculate level
        setScores(newScores);
        const totalScore = newScores.reduce((sum, s) => sum + s, 0);
        let level: ExperienceLevel;
        if (totalScore <= 2) level = 'BEGINNER';
        else if (totalScore <= 6) level = 'INTERMEDIATE';
        else level = 'ADVANCED';

        // Quick fade out then deliver result
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          onComplete(level);
        });
      }
    }, 400);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>OPTIONS IQ CHECK</Text>
        <Text style={styles.headerSub}>Question {currentQ + 1} of {QUESTIONS.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Question card */}
      <Animated.View style={[styles.questionCard, { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }]}>
        <Text style={styles.questionEmoji}>{question.emoji}</Text>
        <Text style={styles.questionText}>{question.question}</Text>
        <Text style={styles.questionSubtext}>{question.subtext}</Text>

        {/* Answers */}
        <View style={styles.answersContainer}>
          {question.answers.map((answer, i) => {
            const isSelected = selectedAnswer === i;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.answerButton,
                  isSelected && styles.answerSelected,
                ]}
                onPress={() => handleAnswer(i, answer.points)}
                activeOpacity={0.7}
                disabled={selectedAnswer !== null}
              >
                <Text style={styles.answerEmoji}>{answer.emoji}</Text>
                <Text style={[styles.answerText, isSelected && styles.answerTextSelected]}>
                  {answer.text}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>

      {/* Bottom hint */}
      <View style={styles.bottomHint}>
        <Text style={styles.hintText}>
          {currentQ === 0 ? "This helps us customize your ODIN experience" :
           currentQ === QUESTIONS.length - 1 ? "Last one!" :
           "Tap your honest answer"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: COLORS.accentLight,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
  progressBg: {
    height: 4,
    backgroundColor: COLORS.bgInput,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 32,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  questionCard: {
    flex: 1,
    alignItems: 'center',
  },
  questionEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  questionText: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  questionSubtext: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 32,
  },
  answersContainer: {
    width: '100%',
    gap: 12,
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  answerSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentBg,
  },
  answerEmoji: {
    fontSize: 22,
    marginRight: 12,
  },
  answerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    lineHeight: 20,
  },
  answerTextSelected: {
    color: COLORS.accentLight,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  bottomHint: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  hintText: {
    color: COLORS.textDisabled,
    fontSize: 11,
  },
});
