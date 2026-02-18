// ODIN Mobile — Black-Scholes Options Pricing Engine
// Provides call/put pricing, Greeks, and IV derivation from catalyst data

import { Catalyst } from '../constants/types';
import { OptionGreeks, OptionContract, OptionsChain, CatalystInterval } from '../constants/tradingTypes';
import API_CONFIG from '../config/apiKeys';
import { daysUntil } from '../utils/formatting';

const PI = Math.PI;

// ─── Normal Distribution ──────────────────────────────────────

function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2);
  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);
  return 0.5 * (1 + sign * y);
}

function normalPDF(x: number): number {
  return (1 / Math.sqrt(2 * PI)) * Math.exp(-0.5 * x * x);
}

// ─── Black-Scholes Core ───────────────────────────────────────

export class BlackScholes {
  /**
   * S = spot price, K = strike, T = time to expiry (years),
   * r = risk-free rate, sigma = implied volatility
   */
  static callPrice(S: number, K: number, T: number, r: number, sigma: number): number {
    if (T <= 0) return Math.max(S - K, 0);
    if (sigma <= 0) return Math.max(S * Math.exp(-r * T) - K * Math.exp(-r * T), 0);
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    return Math.max(S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2), 0.01);
  }

  static putPrice(S: number, K: number, T: number, r: number, sigma: number): number {
    if (T <= 0) return Math.max(K - S, 0);
    if (sigma <= 0) return Math.max(K * Math.exp(-r * T) - S, 0);
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    return Math.max(K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1), 0.01);
  }

  // ─── Greeks ─────────────────────────────────────────────────

  static delta(S: number, K: number, T: number, r: number, sigma: number, type: 'CALL' | 'PUT'): number {
    if (T <= 0 || sigma <= 0) return type === 'CALL' ? (S > K ? 1 : 0) : (S < K ? -1 : 0);
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    return type === 'CALL' ? normalCDF(d1) : normalCDF(d1) - 1;
  }

  static gamma(S: number, K: number, T: number, r: number, sigma: number): number {
    if (T <= 0 || sigma <= 0) return 0;
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    return normalPDF(d1) / (S * sigma * Math.sqrt(T));
  }

  static theta(S: number, K: number, T: number, r: number, sigma: number, type: 'CALL' | 'PUT'): number {
    if (T <= 0) return 0;
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    const part1 = -S * normalPDF(d1) * sigma / (2 * Math.sqrt(T));
    const part2 = type === 'CALL'
      ? -r * K * Math.exp(-r * T) * normalCDF(d2)
      : r * K * Math.exp(-r * T) * normalCDF(-d2);
    return (part1 + part2) / 365;
  }

  static vega(S: number, K: number, T: number, r: number, sigma: number): number {
    if (T <= 0 || sigma <= 0) return 0;
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    return S * normalPDF(d1) * Math.sqrt(T) / 100;
  }

  static greeks(S: number, K: number, T: number, r: number, sigma: number, type: 'CALL' | 'PUT'): OptionGreeks {
    return {
      delta: this.delta(S, K, T, r, sigma, type),
      gamma: this.gamma(S, K, T, r, sigma),
      theta: this.theta(S, K, T, r, sigma, type),
      vega: this.vega(S, K, T, r, sigma),
    };
  }
}

// ─── Implied Volatility Derivation ────────────────────────────

export class IVService {
  /**
   * Derive IV from catalyst proximity + ODIN tier/probability.
   * Biotech stocks near FDA events have elevated IV — this models that.
   */
  static deriveIV(catalyst: Catalyst): number {
    const days = daysUntil(catalyst.date);

    // Base IV for small-cap biotech: 40-60%
    let iv = 0.50;

    // Tier adjustment: T1 (high prob) = less uncertainty, T4 = max uncertainty
    switch (catalyst.tier) {
      case 'TIER_1': iv -= 0.08; break;
      case 'TIER_2': iv -= 0.03; break;
      case 'TIER_3': iv += 0.05; break;
      case 'TIER_4': iv += 0.15; break;
    }

    // Proximity IV spike (volatility crush incoming)
    if (days <= 3)       iv *= 2.0;   // extreme pre-event IV
    else if (days <= 7)  iv *= 1.7;
    else if (days <= 14) iv *= 1.4;
    else if (days <= 30) iv *= 1.2;
    else if (days <= 45) iv *= 1.1;

    // Prob distance from 50/50 reduces IV slightly (more certain = less vol)
    const probDistance = Math.abs(catalyst.prob - 0.5);
    iv *= (1 - probDistance * 0.2);

    return Math.min(Math.max(iv, 0.15), 2.0); // clamp 15% - 200%
  }

  /**
   * Calculate historical volatility from close prices
   */
  static historicalVolatility(prices: number[]): number {
    if (prices.length < 2) return 0.50; // default
    const returns: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / returns.length;
    return Math.sqrt(variance) * Math.sqrt(252); // annualized
  }
}

// ─── Options Chain Generator ──────────────────────────────────

export function generateOptionsChain(
  ticker: string,
  currentPrice: number,
  catalyst: Catalyst,
): OptionsChain {
  const iv = IVService.deriveIV(catalyst);
  const days = Math.max(daysUntil(catalyst.date), 1);
  const T = days / 365;
  const r = API_CONFIG.RISK_FREE_RATE;

  // Generate strikes around current price (±30% in $2.50 increments for small caps)
  const increment = currentPrice < 20 ? 1 : currentPrice < 50 ? 2.5 : 5;
  const strikes: number[] = [];
  const lowerBound = Math.max(1, Math.floor((currentPrice * 0.7) / increment) * increment);
  const upperBound = Math.ceil((currentPrice * 1.3) / increment) * increment;

  for (let s = lowerBound; s <= upperBound; s += increment) {
    strikes.push(Math.round(s * 100) / 100);
  }

  const calls: OptionContract[] = strikes.map((K, idx) => {
    const premium = BlackScholes.callPrice(currentPrice, K, T, r, iv);
    return {
      id: `${ticker}-C-${K}-${catalyst.date}`,
      ticker,
      type: 'CALL' as const,
      strike: K,
      expirationDate: catalyst.date,
      premium: Math.round(premium * 100) / 100,
      impliedVolatility: iv,
      daysToExpiration: days,
      greeks: BlackScholes.greeks(currentPrice, K, T, r, iv, 'CALL'),
    };
  });

  const puts: OptionContract[] = strikes.map((K, idx) => {
    const premium = BlackScholes.putPrice(currentPrice, K, T, r, iv);
    return {
      id: `${ticker}-P-${K}-${catalyst.date}`,
      ticker,
      type: 'PUT' as const,
      strike: K,
      expirationDate: catalyst.date,
      premium: Math.round(premium * 100) / 100,
      impliedVolatility: iv,
      daysToExpiration: days,
      greeks: BlackScholes.greeks(currentPrice, K, T, r, iv, 'PUT'),
    };
  });

  return {
    ticker,
    currentPrice,
    expirationDate: catalyst.date,
    calls,
    puts,
    lastUpdated: new Date().toISOString(),
  };
}
