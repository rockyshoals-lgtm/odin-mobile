import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPrediction, CommunitySentiment } from '../constants/types';

const COIN_TIERS = [
  { name: 'INITIATE', min: 0 },
  { name: 'ANALYST', min: 250 },
  { name: 'STRATEGIST', min: 1000 },
  { name: 'ORACLE', min: 2500 },
  { name: 'TITAN', min: 5000 },
  { name: 'LEGEND', min: 10000 },
];

interface PredictionState {
  predictions: Record<string, UserPrediction>;
  sentiment: Record<string, CommunitySentiment>;
  odinCoins: number;

  submitVote: (catalystId: string, prediction: UserPrediction['prediction'], confidence: UserPrediction['confidence']) => void;
  setSentiment: (catalystId: string, data: CommunitySentiment) => void;
  setSentimentBatch: (data: Record<string, CommunitySentiment>) => void;
  hasPredicted: (catalystId: string) => boolean;
  getCoinTier: () => string;
  getNextTier: () => { name: string; coinsNeeded: number } | null;
}

export const usePredictionStore = create<PredictionState>()(
  persist(
    (set, get) => ({
      predictions: {},
      sentiment: {},
      odinCoins: 0,

      submitVote: (catalystId, prediction, confidence) => {
        const coinReward = confidence === 'AGGRESSIVE' ? 20 : confidence === 'STANDARD' ? 10 : 5;
        set(state => ({
          predictions: {
            ...state.predictions,
            [catalystId]: { catalystId, prediction, confidence, votedAt: new Date().toISOString() },
          },
          odinCoins: state.odinCoins + coinReward,
        }));
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

      getNextTier: () => {
        const { odinCoins } = get();
        for (const tier of COIN_TIERS) {
          if (odinCoins < tier.min) return { name: tier.name, coinsNeeded: tier.min - odinCoins };
        }
        return null;
      },
    }),
    {
      name: 'prediction-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
