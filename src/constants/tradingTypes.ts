// ODIN Mobile — Paper Trading & Options Type Definitions
// Designed to be API-agnostic for future Alpaca integration

import { Catalyst } from './types';

// ─── Paper Trading ────────────────────────────────────────────

export interface PaperAccount {
  accountId: string;
  balance: number;           // cash available
  startingBalance: number;   // always 100000
  totalPortfolioValue: number;
  createdAt: string;         // ISO timestamp
  lastTradeDate: string;
}

export interface Position {
  id: string;
  ticker: string;
  company: string;
  quantity: number;
  averageEntryPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
  catalystId?: string;       // linked catalyst (for interval tracking)
  openedAt: string;
  lastUpdated: string;
}

export interface Trade {
  id: string;
  ticker: string;
  company: string;
  side: 'BUY' | 'SELL';
  type: 'STOCK' | 'OPTION';
  quantity: number;
  executedPrice: number;
  executedAt: string;
  totalValue: number;        // qty × price
  pnl?: number;              // realized P&L (on sells)
  pnlPct?: number;
  catalystId?: string;
  notes?: string;
}

// ─── Options Simulation ───────────────────────────────────────

export type OptionType = 'CALL' | 'PUT';
export type StrategyType = 'CALL' | 'PUT' | 'STRADDLE' | 'STRANGLE' | 'IRON_CONDOR' | 'BULL_CALL_SPREAD' | 'BEAR_PUT_SPREAD';

export interface OptionContract {
  id: string;
  ticker: string;
  type: OptionType;
  strike: number;
  expirationDate: string;
  premium: number;            // price per share
  impliedVolatility: number;  // 0-1
  daysToExpiration: number;
  greeks: OptionGreeks;
}

export interface OptionGreeks {
  delta: number;    // -1 to 1
  gamma: number;    // rate of delta change
  theta: number;    // time decay $/day
  vega: number;     // per 1% IV change
}

export interface OptionPosition {
  id: string;
  ticker: string;
  strategy: StrategyType;
  legs: OptionLeg[];
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  catalystId?: string;
  openedAt: string;
}

export interface OptionLeg {
  type: OptionType;
  strike: number;
  expirationDate: string;
  position: 'LONG' | 'SHORT';
  contracts: number;          // each = 100 shares
  premiumPerContract: number;
  currentPremium: number;
  greeks: OptionGreeks;
}

export interface OptionsChain {
  ticker: string;
  currentPrice: number;
  expirationDate: string;
  calls: OptionContract[];
  puts: OptionContract[];
  lastUpdated: string;
}

export interface TradeStrategy {
  type: StrategyType;
  label: string;
  description: string;
  legs: StrategyLegTemplate[];
  maxLoss: string;           // e.g., "Premium paid" or "Unlimited"
  maxGain: string;           // e.g., "Unlimited" or "Strike diff - premium"
  bestFor: string;           // e.g., "High conviction approval"
}

export interface StrategyLegTemplate {
  type: OptionType;
  position: 'LONG' | 'SHORT';
  strikeOffset: number;       // 0 = ATM, +1 = 1 strike OTM, etc.
}

// ─── Catalyst Returns ─────────────────────────────────────────

export type CatalystInterval = 'T-60' | 'T-45' | 'T-30' | 'T-14' | 'T-7' | 'T-1';

export interface CatalystIntervalReturn {
  interval: CatalystInterval;
  daysBeforeCatalyst: number;
  expectedReturnPct: number;
  medianReturnPct: number;
  stdDeviation: number;
  p10: number;               // 10th percentile
  p90: number;               // 90th percentile
  sampleSize: number;
  confidenceLevel: number;
}

// ─── Market Data ──────────────────────────────────────────────

export interface LiveQuote {
  ticker: string;
  price: number;
  previousClose: number;
  change: number;
  changePct: number;
  marketCap: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  lastFetch: number;         // timestamp ms
}

export interface CompanyProfile {
  ticker: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  exchange: string;
  lastUpdated: string;
}

// ─── Portfolio Metrics ────────────────────────────────────────

export interface PortfolioMetrics {
  totalValue: number;
  cashBalance: number;
  positionsValue: number;
  optionsValue: number;
  totalGain: number;
  totalGainPct: number;
  dayGain: number;
  dayGainPct: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  largestWin: number;
  largestLoss: number;
  avgTradePnL: number;
}

// ─── Strategy Templates ───────────────────────────────────────

export const STRATEGY_TEMPLATES: TradeStrategy[] = [
  {
    type: 'CALL',
    label: 'Buy Call',
    description: 'Bullish bet on approval — profit if stock rises above strike + premium',
    legs: [{ type: 'CALL', position: 'LONG', strikeOffset: 0 }],
    maxLoss: 'Premium paid',
    maxGain: 'Unlimited',
    bestFor: 'High conviction approval',
  },
  {
    type: 'PUT',
    label: 'Buy Put',
    description: 'Bearish bet on CRL — profit if stock drops below strike - premium',
    legs: [{ type: 'PUT', position: 'LONG', strikeOffset: 0 }],
    maxLoss: 'Premium paid',
    maxGain: 'Strike price - premium',
    bestFor: 'High conviction CRL / rejection',
  },
  {
    type: 'STRADDLE',
    label: 'Straddle',
    description: 'Bet on big move in either direction — buy ATM call + ATM put',
    legs: [
      { type: 'CALL', position: 'LONG', strikeOffset: 0 },
      { type: 'PUT', position: 'LONG', strikeOffset: 0 },
    ],
    maxLoss: 'Total premium paid',
    maxGain: 'Unlimited',
    bestFor: 'Uncertain direction, expecting big move',
  },
  {
    type: 'STRANGLE',
    label: 'Strangle',
    description: 'Cheaper than straddle — buy OTM call + OTM put',
    legs: [
      { type: 'CALL', position: 'LONG', strikeOffset: 2 },
      { type: 'PUT', position: 'LONG', strikeOffset: -2 },
    ],
    maxLoss: 'Total premium paid',
    maxGain: 'Unlimited',
    bestFor: 'Expecting huge move, budget-friendly',
  },
  {
    type: 'BULL_CALL_SPREAD',
    label: 'Bull Call Spread',
    description: 'Capped-risk bullish play — buy lower call, sell higher call',
    legs: [
      { type: 'CALL', position: 'LONG', strikeOffset: 0 },
      { type: 'CALL', position: 'SHORT', strikeOffset: 3 },
    ],
    maxLoss: 'Net premium paid',
    maxGain: 'Strike difference - net premium',
    bestFor: 'Moderate bullish outlook',
  },
  {
    type: 'BEAR_PUT_SPREAD',
    label: 'Bear Put Spread',
    description: 'Capped-risk bearish play — buy higher put, sell lower put',
    legs: [
      { type: 'PUT', position: 'LONG', strikeOffset: 0 },
      { type: 'PUT', position: 'SHORT', strikeOffset: -3 },
    ],
    maxLoss: 'Net premium paid',
    maxGain: 'Strike difference - net premium',
    bestFor: 'Moderate bearish / CRL hedge',
  },
];
