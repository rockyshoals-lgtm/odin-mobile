import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPrediction, CommunitySentiment } from '../constants/types';

const COIN_TIERS = [
  { name: 'INITIATE', min: 0, emoji: '🔰' },
  { name: 'ANALYST', min: 250, emoji: '📊' },
  { name: 'STRATEGIST', min: 1000, emoji: '🧠' },
  { name: 'ORACLE', min: 2500, emoji: '🔮' },
  { name: 'TITAN', min: 5000, emoji: '⚡' },
  { name: 'LEGEND', min: 10000, emoji: '👑' },
];

// Daily Edge Quests — review 3 catalysts to unlock bonus
interface DailyQuest {
  date: string; // YYYY-MM-DD
  catalystsReviewed: string[]; // catalyst IDs
  completed: boolean;
  bonusClaimed: boolean;
}

// Jackpot Pool — weekly coin prize for top predictors
interface JackpotPool {
  weekId: string; // YYYY-WW
  totalPool: number;
  contributions: number;
  topPredictors: { rank: number; coins: number }[];
}

interface PredictionState {
  predictions: Record<string, UserPrediction>;
  sentiment: Record<string, CommunitySentiment>;
  odinCoins: number;

  // Streak system (Duolingo-style)
  currentStreak: number;
  longestStreak: number;
  lastPredictionDate: string | null; // YYYY-MM-DD
  streakFreezeAvailable: boolean;

  // Daily Edge Quests
  dailyQuest: DailyQuest | null;

  // Celebration state
  lastCoinReward: number; // for animation
  showCelebration: boolean;

  // Jackpot Pool
  weeklyPoolContribution: number;

  submitVote: (catalystId: string, prediction: UserPrediction['prediction'], confidence: UserPrediction['confidence']) => number;
  setSentiment: (catalystId: string, data: CommunitySentiment) => void;
  setSentimentBatch: (data: Record<string, CommunitySentiment>) => void;
  hasPredicted: (catalystId: string) => boolean;
  getCoinTier: () => string;
  getCoinTierEmoji: () => string;
  getNextTier: () => { name: string; coinsNeeded: number } | null;
  getStreakMultiplier: () => number;
  dismissCelebration: () => void;

  // Daily Quest
  reviewCatalyst: (catalystId: string) => void;
  claimDailyBonus: () => void;
  getDailyQuestProgress: () => { reviewed: number; total: number; completed: boolean; bonusClaimed: boolean };

  // Jackpot
  getWeeklyPoolInfo: () => { weekId: string; totalPool: number; userContribution: number };
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getWeekId(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const week = Math.ceil(diff / oneWeek);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      predictions: {},
      sentiment: {},
      odinCoins: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastPredictionDate: null,
      streakFreezeAvailable: true,
      dailyQuest: null,
      lastCoinReward: 0,
      showCelebration: false,
      weeklyPoolContribution: 0,

      submitVote: (catalystId, prediction, confidence) => {
        const today = getTodayStr();
        const { lastPredictionDate, currentStreak, longestStreak, streakFreezeAvailable } = get();

        // Calculate streak
        let newStreak = currentStreak;
        if (lastPredictionDate === today) {
          // Already predicted today, streak stays
        } else if (lastPredictionDate) {
          const lastDate = new Date(lastPredictionDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (86400000));
          if (diffDays === 1) {
            newStreak = currentStreak + 1; // Consecutive day!
          } else if (diffDays === 2 && streakFreezeAvailable) {
            newStreak = currentStreak + 1; // Streak freeze used
          } else {
            newStreak = 1; // Streak broken
          }
        } else {
          newStreak = 1; // First prediction
        }

        // Streak multiplier: 7+ day streak = 2x, 3+ = 1.5x
        const streakMult = newStreak >= 7 ? 2.0 : newStreak >= 3 ? 1.5 : 1.0;
        const baseCoin = confidence === 'AGGRESSIVE' ? 20 : confidence === 'STANDARD' ? 10 : 5;
        const coinReward = Math.round(baseCoin * streakMult);

        // Pool contribution (5% of coins go to weekly jackpot)
        const poolContribution = Math.round(coinReward * 0.05);

        set(state => ({
          predictions: {
            ...state.predictions,
            [catalystId]: { catalystId, prediction, confidence, votedAt: new Date().toISOString() },
          },
          odinCoins: state.odinCoins + coinReward,
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, longestStreak),
          lastPredictionDate: today,
          streakFreezeAvailable: lastPredictionDate && (new Date(today).getTime() - new Date(lastPredictionDate).getTime()) > 86400000 * 1.5 ? false : state.streakFreezeAvailable,
          lastCoinReward: coinReward,
          showCelebration: true,
          weeklyPoolContribution: state.weeklyPoolContribution + poolContribution,
        }));

        return coinReward;
      },

      setSentiment: (catalystId, data) => {
        set(state => ({
          sentiment: { ...state.sentiment, [catalystId]: data },
        }));
      },

      setSentimentBatch: (data) => set({ sentiment: data }),

      hasPredicted: (catalystId) => !!get().predictions[catalystId],

      getCoinTier: () => {
        const { odinCoins } = get();
        for (let i = COIN_TIERS.length - 1; i >= 0; i--) {
          if (odinCoins >= COIN_TIERS[i].min) return COIN_TIERS[i].name;
        }
        return 'INITIATE';
      },

      getCoinTierEmoji: () => {
        const { odinCoins } = get();
        for (let i = COIN_TIERS.length - 1; i >= 0; i--) {
          if (odinCoins >= COIN_TIERS[i].min) return COIN_TIERS[i].emoji;
        }
        return '🔰';
      },

      getNextTier: () => {
        const { odinCoins } = get();
        for (const tier of COIN_TIERS) {
          if (odinCoins < tier.min) return { name: tier.name, coinsNeeded: tier.min - odinCoins };
        }
        return null;
      },

      getStreakMultiplier: () => {
        const { currentStreak } = get();
        return currentStreak >= 7 ? 2.0 : currentStreak >= 3 ? 1.5 : 1.0;
      },

      dismissCelebration: () => set({ showCelebration: false }),

      // Daily Quest
      reviewCatalyst: (catalystId) => {
        const today = getTodayStr();
        set(state => {
          const quest = state.dailyQuest?.date === today
            ? state.dailyQuest
            : { date: today, catalystsReviewed: [], completed: false, bonusClaimed: false };

          if (quest.catalystsReviewed.includes(catalystId)) return state;

          const reviewed = [...quest.catalystsReviewed, catalystId];
          return {
            dailyQuest: {
              ...quest,
              catalystsReviewed: reviewed,
              completed: reviewed.length >= 3,
            },
          };
        });
      },

      claimDailyBonus: () => {
        const { dailyQuest } = get();
        if (!dailyQuest?.completed || dailyQuest.bonusClaimed) return;

        set(state => ({
          odinCoins: state.odinCoins + 50, // Daily quest bonus
          dailyQuest: { ...state.dailyQuest!, bonusClaimed: true },
          lastCoinReward: 50,
          showCelebration: true,
        }));
      },

      getDailyQuestProgress: () => {
        const { dailyQuest } = get();
        const today = getTodayStr();
        if (!dailyQuest || dailyQuest.date !== today) {
          return { reviewed: 0, total: 3, completed: false, bonusClaimed: false };
        }
        return {
          reviewed: dailyQuest.catalystsReviewed.length,
          total: 3,
          completed: dailyQuest.completed,
          bonusClaimed: dailyQuest.bonusClaimed,
        };
      },

      getWeeklyPoolInfo: () => {
        return {
          weekId: getWeekId(),
          totalPool: 5000 + Math.floor(Math.random() * 3000), // Simulated community pool
          userContribution: get().weeklyPoolContribution,
        };
      },
    }),
    {
      name: 'prediction-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
