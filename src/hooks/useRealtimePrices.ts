// ODIN Mobile — Realtime Price Polling Hook
// Auto-refreshes quotes for visible tickers every 30 seconds during market hours

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useMarketDataStore } from '../stores/marketDataStore';
import { usePaperTradeStore } from '../stores/paperTradeStore';

const POLL_INTERVAL = 30_000; // 30 seconds
const MARKET_OPEN_HOUR = 9;   // 9:30 AM ET (approx)
const MARKET_CLOSE_HOUR = 16;  // 4:00 PM ET

function isMarketHours(): boolean {
  const now = new Date();
  const etHour = now.getUTCHours() - 5; // rough ET offset
  const day = now.getDay();
  if (day === 0 || day === 6) return false; // weekend
  return etHour >= MARKET_OPEN_HOUR && etHour < MARKET_CLOSE_HOUR;
}

/**
 * Auto-polls prices for all tickers in the user's portfolio + watchlist.
 * Only active during market hours and when app is in foreground.
 * Updates both the market data store and paper trade positions.
 */
export function useRealtimePrices(additionalTickers: string[] = []) {
  const { fetchQuotes } = useMarketDataStore();
  const { positions, updatePrices } = usePaperTradeStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');

  useEffect(() => {
    // Gather all tickers we care about
    const getTickerList = (): string[] => {
      const positionTickers = Object.keys(positions);
      const all = [...new Set([...positionTickers, ...additionalTickers])];
      return all.filter(t => t.length > 0);
    };

    const refreshPrices = async () => {
      if (appStateRef.current !== 'active') return;
      const tickers = getTickerList();
      if (tickers.length === 0) return;

      try {
        const quotes = await fetchQuotes(tickers);
        // Update paper trade position prices
        if (quotes) {
          const priceMap: Record<string, number> = {};
          const storeQuotes = useMarketDataStore.getState().quotes;
          tickers.forEach(t => {
            const q = storeQuotes[t];
            if (q?.price) priceMap[t] = q.price;
          });
          if (Object.keys(priceMap).length > 0) {
            updatePrices(priceMap);
          }
        }
      } catch (err) {
        console.warn('[RealtimePrices] Refresh failed:', err);
      }
    };

    // Initial fetch
    refreshPrices();

    // Start polling
    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (isMarketHours()) {
          refreshPrices();
        }
      }, POLL_INTERVAL);
    };

    startPolling();

    // Listen for app state changes (pause when backgrounded)
    const handleAppState = (state: AppStateStatus) => {
      appStateRef.current = state;
      if (state === 'active') {
        refreshPrices(); // immediate refresh when foregrounded
        startPolling();
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription.remove();
    };
  }, [Object.keys(positions).join(','), additionalTickers.join(',')]);
}
