// ODIN Mobile — Market Data Store
// Caches live quotes and company profiles with TTL-based refresh

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LiveQuote, CompanyProfile } from '../constants/tradingTypes';
import { marketDataService } from '../services/marketDataService';
import API_CONFIG from '../config/apiKeys';

interface MarketDataState {
  quotes: Record<string, LiveQuote>;
  profiles: Record<string, CompanyProfile>;
  lastGlobalRefresh: number;
  isRefreshing: boolean;

  // Actions
  fetchQuote: (ticker: string) => Promise<LiveQuote | null>;
  fetchQuotes: (tickers: string[]) => Promise<void>;
  fetchProfile: (ticker: string) => Promise<CompanyProfile | null>;
  getQuote: (ticker: string) => LiveQuote | undefined;
  getPrice: (ticker: string) => number;
  getMarketCap: (ticker: string) => number;
  shouldRefresh: (ticker: string) => boolean;
  refreshAll: (tickers: string[]) => Promise<void>;
}

export const useMarketDataStore = create<MarketDataState>()(
  persist(
    (set, get) => ({
      quotes: {},
      profiles: {},
      lastGlobalRefresh: 0,
      isRefreshing: false,

      fetchQuote: async (ticker: string) => {
        const state = get();
        // Check cache
        const cached = state.quotes[ticker];
        if (cached && Date.now() - cached.lastFetch < API_CONFIG.CACHE_QUOTE_TTL) {
          return cached;
        }
        // Fetch fresh
        const quote = await marketDataService.getQuote(ticker);
        if (quote) {
          set(s => ({ quotes: { ...s.quotes, [ticker]: quote } }));
        }
        return quote;
      },

      fetchQuotes: async (tickers: string[]) => {
        set({ isRefreshing: true });
        const staleTickrs = tickers.filter(t => get().shouldRefresh(t));
        if (staleTickrs.length === 0) {
          set({ isRefreshing: false });
          return;
        }
        const quotes = await marketDataService.getQuotes(staleTickrs);
        set(s => ({
          quotes: { ...s.quotes, ...quotes },
          lastGlobalRefresh: Date.now(),
          isRefreshing: false,
        }));
      },

      fetchProfile: async (ticker: string) => {
        const state = get();
        const cached = state.profiles[ticker];
        if (cached && Date.now() - new Date(cached.lastUpdated).getTime() < API_CONFIG.CACHE_PROFILE_TTL) {
          return cached;
        }
        const profile = await marketDataService.getCompanyProfile(ticker);
        if (profile) {
          set(s => ({ profiles: { ...s.profiles, [ticker]: profile } }));
        }
        return profile;
      },

      getQuote: (ticker: string) => get().quotes[ticker],

      getPrice: (ticker: string) => get().quotes[ticker]?.price || 0,

      getMarketCap: (ticker: string) => get().quotes[ticker]?.marketCap || 0,

      shouldRefresh: (ticker: string) => {
        const quote = get().quotes[ticker];
        if (!quote) return true;
        return Date.now() - quote.lastFetch > API_CONFIG.CACHE_QUOTE_TTL;
      },

      refreshAll: async (tickers: string[]) => {
        set({ isRefreshing: true });
        try {
          const quotes = await marketDataService.getQuotes(tickers);
          set(s => ({
            quotes: { ...s.quotes, ...quotes },
            lastGlobalRefresh: Date.now(),
            isRefreshing: false,
          }));
        } catch {
          set({ isRefreshing: false });
        }
      },
    }),
    {
      name: 'market-data-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        quotes: state.quotes,
        profiles: state.profiles,
        lastGlobalRefresh: state.lastGlobalRefresh,
      }),
    }
  )
);
