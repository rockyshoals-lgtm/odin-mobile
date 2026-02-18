// ODIN Mobile — Market Data Service (FMP Stable API + FinnBrain)
// Handles live quotes, company profiles, historical prices, and sentiment

import axios from 'axios';
import API_CONFIG from '../config/apiKeys';
import { LiveQuote, CompanyProfile } from '../constants/tradingTypes';

const FMP_STABLE = 'https://financialmodelingprep.com/stable';

class MarketDataService {
  // ─── FMP: Real-Time Quote ──────────────────────────────────

  async getQuote(ticker: string): Promise<LiveQuote | null> {
    try {
      const url = `${FMP_STABLE}/quote?symbol=${ticker}&apikey=${API_CONFIG.FMP_API_KEY}`;
      const { data } = await axios.get(url, { timeout: 10000 });
      if (!data || !Array.isArray(data) || data.length === 0) return null;
      const q = data[0];
      return {
        ticker: q.symbol || ticker,
        price: q.price ?? 0,
        previousClose: q.previousClose ?? 0,
        change: q.change ?? 0,
        changePct: q.changePercentage ?? 0,
        marketCap: q.marketCap ?? 0,
        volume: q.volume ?? 0,
        high: q.dayHigh ?? 0,
        low: q.dayLow ?? 0,
        open: q.open ?? 0,
        lastFetch: Date.now(),
      };
    } catch (err) {
      console.warn(`[MarketData] Failed to fetch quote for ${ticker}:`, err);
      return null;
    }
  }

  // ─── FMP: Batch Quotes (sequential, since batch endpoint requires higher tier) ──

  async getQuotes(tickers: string[]): Promise<Record<string, LiveQuote>> {
    const results: Record<string, LiveQuote> = {};
    // Fetch in parallel, max 5 at a time to avoid rate limits
    const chunks: string[][] = [];
    for (let i = 0; i < tickers.length; i += 5) {
      chunks.push(tickers.slice(i, i + 5));
    }
    for (const chunk of chunks) {
      const promises = chunk.map(async (ticker) => {
        const quote = await this.getQuote(ticker);
        if (quote) results[ticker] = quote;
      });
      await Promise.all(promises);
    }
    return results;
  }

  // ─── FMP: Company Profile ──────────────────────────────────

  async getCompanyProfile(ticker: string): Promise<CompanyProfile | null> {
    try {
      const url = `${FMP_STABLE}/profile?symbol=${ticker}&apikey=${API_CONFIG.FMP_API_KEY}`;
      const { data } = await axios.get(url, { timeout: 10000 });
      if (!data || !Array.isArray(data) || data.length === 0) return null;
      const p = data[0];
      return {
        ticker: p.symbol || ticker,
        name: p.companyName || '',
        sector: p.sector || '',
        industry: p.industry || '',
        marketCap: p.marketCap ?? 0,
        exchange: p.exchange || '',
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
      const to = new Date().toISOString().split('T')[0];
      const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
      const url = `${FMP_STABLE}/historical-price-eod/full?symbol=${ticker}&from=${from}&to=${to}&apikey=${API_CONFIG.FMP_API_KEY}`;
      const { data } = await axios.get(url, { timeout: 15000 });
      if (!Array.isArray(data) || data.length === 0) return [];
      return data.map((h: any) => h.close).filter((c: any) => c != null).reverse();
    } catch (err) {
      console.warn(`[MarketData] Failed to fetch history for ${ticker}:`, err);
      return [];
    }
  }

  // ─── FMP: Market Cap (via quote) ───────────────────────────

  async getMarketCap(ticker: string): Promise<number | null> {
    const quote = await this.getQuote(ticker);
    return quote?.marketCap ?? null;
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
