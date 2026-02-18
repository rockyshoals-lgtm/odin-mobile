// ODIN Mobile — Market Data Service (FMP + FinnBrain)
// Handles live quotes, company profiles, historical prices, and sentiment

import axios from 'axios';
import API_CONFIG from '../config/apiKeys';
import { LiveQuote, CompanyProfile } from '../constants/tradingTypes';

class MarketDataService {
  // ─── FMP: Real-Time Quote ──────────────────────────────────

  async getQuote(ticker: string): Promise<LiveQuote | null> {
    try {
      const url = `${API_CONFIG.FMP_BASE_URL}/quote/${ticker}?apikey=${API_CONFIG.FMP_API_KEY}`;
      const { data } = await axios.get(url, { timeout: 10000 });
      if (!data || data.length === 0) return null;
      const q = data[0];
      return {
        ticker: q.symbol,
        price: q.price,
        previousClose: q.previousClose,
        change: q.change,
        changePct: q.changesPercentage,
        marketCap: q.marketCap,
        volume: q.volume,
        high: q.dayHigh,
        low: q.dayLow,
        open: q.open,
        lastFetch: Date.now(),
      };
    } catch (err) {
      console.warn(`[MarketData] Failed to fetch quote for ${ticker}:`, err);
      return null;
    }
  }

  // ─── FMP: Batch Quotes ─────────────────────────────────────

  async getQuotes(tickers: string[]): Promise<Record<string, LiveQuote>> {
    const results: Record<string, LiveQuote> = {};
    try {
      // FMP supports comma-separated tickers
      const batch = tickers.join(',');
      const url = `${API_CONFIG.FMP_BASE_URL}/quote/${batch}?apikey=${API_CONFIG.FMP_API_KEY}`;
      const { data } = await axios.get(url, { timeout: 15000 });
      if (Array.isArray(data)) {
        data.forEach((q: any) => {
          results[q.symbol] = {
            ticker: q.symbol,
            price: q.price,
            previousClose: q.previousClose,
            change: q.change,
            changePct: q.changesPercentage,
            marketCap: q.marketCap,
            volume: q.volume,
            high: q.dayHigh,
            low: q.dayLow,
            open: q.open,
            lastFetch: Date.now(),
          };
        });
      }
    } catch (err) {
      console.warn('[MarketData] Batch quote fetch failed:', err);
    }
    return results;
  }

  // ─── FMP: Company Profile ──────────────────────────────────

  async getCompanyProfile(ticker: string): Promise<CompanyProfile | null> {
    try {
      const url = `${API_CONFIG.FMP_BASE_URL}/profile/${ticker}?apikey=${API_CONFIG.FMP_API_KEY}`;
      const { data } = await axios.get(url, { timeout: 10000 });
      if (!data || data.length === 0) return null;
      const p = data[0];
      return {
        ticker: p.symbol,
        name: p.companyName,
        sector: p.sector,
        industry: p.industry,
        marketCap: p.mktCap,
        exchange: p.exchangeShortName,
        lastUpdated: new Date().toISOString(),
      };
    } catch (err) {
      console.warn(`[MarketData] Failed to fetch profile for ${ticker}:`, err);
      return null;
    }
  }

  // ─── FMP: Historical Prices (for volatility calc) ──────────

  async getHistoricalPrices(ticker: string, days: number = 60): Promise<number[]> {
    try {
      const url = `${API_CONFIG.FMP_BASE_URL}/historical-price-full/${ticker}?timeseries=${days}&apikey=${API_CONFIG.FMP_API_KEY}`;
      const { data } = await axios.get(url, { timeout: 15000 });
      if (!data?.historical) return [];
      return data.historical.map((h: any) => h.close).reverse();
    } catch (err) {
      console.warn(`[MarketData] Failed to fetch history for ${ticker}:`, err);
      return [];
    }
  }

  // ─── FMP: Market Cap (quick) ───────────────────────────────

  async getMarketCap(ticker: string): Promise<number | null> {
    try {
      const url = `${API_CONFIG.FMP_BASE_URL}/market-capitalization/${ticker}?apikey=${API_CONFIG.FMP_API_KEY}`;
      const { data } = await axios.get(url, { timeout: 10000 });
      if (!data || data.length === 0) return null;
      return data[0].marketCap;
    } catch (err) {
      console.warn(`[MarketData] Failed to fetch market cap for ${ticker}:`, err);
      return null;
    }
  }

  // ─── FinnBrain: Sentiment ──────────────────────────────────

  async getSentiment(ticker: string): Promise<{ sentiment: number; bullish: number; bearish: number } | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const url = `${API_CONFIG.FINNBRAIN_BASE_URL}/sentiments?tickers=${ticker}&date=${today}`;
      const { data } = await axios.get(url, {
        timeout: 10000,
        headers: { 'Authorization': `Bearer ${API_CONFIG.FINNBRAIN_API_KEY}` },
      });
      if (!data || data.length === 0) return null;
      const s = data[0];
      return {
        sentiment: s.sentimentScore || 0.5,
        bullish: s.bullishPercent || 50,
        bearish: s.bearishPercent || 50,
      };
    } catch (err) {
      console.warn(`[MarketData] FinnBrain sentiment failed for ${ticker}:`, err);
      return null;
    }
  }

  // ─── FinnBrain: Technical Signals ──────────────────────────

  async getTechnicalSignals(ticker: string): Promise<{
    rsi: number;
    macdSignal: string;
    trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  } | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const url = `${API_CONFIG.FINNBRAIN_BASE_URL}/technical-analysis?tickers=${ticker}&date=${today}`;
      const { data } = await axios.get(url, {
        timeout: 10000,
        headers: { 'Authorization': `Bearer ${API_CONFIG.FINNBRAIN_API_KEY}` },
      });
      if (!data || data.length === 0) return null;
      const t = data[0];
      const rsi = t.RSI || 50;
      return {
        rsi,
        macdSignal: t.MACD_Signal || 'NEUTRAL',
        trend: rsi > 60 ? 'BULLISH' : rsi < 40 ? 'BEARISH' : 'NEUTRAL',
      };
    } catch (err) {
      console.warn(`[MarketData] FinnBrain technicals failed for ${ticker}:`, err);
      return null;
    }
  }
}

export const marketDataService = new MarketDataService();
