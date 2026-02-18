// ODIN Mobile — Trade Execution Service
// Validates and executes paper trades with P&L calculation
// Designed to be swappable with Alpaca API when LLC is formed

import { Trade, OptionGreeks } from '../constants/tradingTypes';

export interface OrderValidation {
  valid: boolean;
  error?: string;
}

export interface ExecutedTrade extends Trade {
  id: string;
  timestamp: string;
}

export interface PnLCalculation {
  pnl: number;
  pnlPct: number;
}

class TradeExecutionService {
  /**
   * Validates an order before execution
   * @param ticker Stock ticker symbol
   * @param side 'BUY' or 'SELL'
   * @param quantity Number of shares
   * @param price Price per share
   * @param availableBalance Available cash balance
   * @returns Validation result with error message if invalid
   */
  validateOrder(
    ticker: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    price: number,
    availableBalance: number
  ): OrderValidation {
    // Validate ticker
    if (!ticker || ticker.trim() === '') {
      return { valid: false, error: 'Ticker is required' };
    }

    // Validate side
    if (side !== 'BUY' && side !== 'SELL') {
      return { valid: false, error: 'Side must be BUY or SELL' };
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { valid: false, error: 'Quantity must be a positive integer' };
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
      return { valid: false, error: 'Price must be a positive number' };
    }

    // Validate balance for BUY orders
    if (side === 'BUY') {
      const orderCost = quantity * price;
      if (orderCost > availableBalance) {
        return {
          valid: false,
          error: `Insufficient balance. Need $${orderCost.toFixed(2)}, have $${availableBalance.toFixed(2)}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Executes a market order
   * @param ticker Stock ticker symbol
   * @param side 'BUY' or 'SELL'
   * @param quantity Number of shares
   * @param price Execution price
   * @returns Executed trade object
   */
  executeMarketOrder(
    ticker: string,
    side: 'BUY' | 'SELL',
    quantity: number,
    price: number
  ): ExecutedTrade {
    const now = new Date().toISOString();
    const totalValue = quantity * price;

    return {
      id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ticker: ticker.toUpperCase(),
      company: ticker.toUpperCase(),
      side,
      type: 'STOCK',
      quantity,
      executedPrice: Math.round(price * 100) / 100,
      executedAt: now,
      totalValue: Math.round(totalValue * 100) / 100,
      timestamp: now,
    };
  }

  /**
   * Calculates profit/loss for a trade
   * @param entryPrice Price at which position was entered
   * @param exitPrice Price at which position was exited
   * @param quantity Number of shares
   * @returns PnL amount and percentage
   */
  calculatePnL(
    entryPrice: number,
    exitPrice: number,
    quantity: number
  ): PnLCalculation {
    const pnl = (exitPrice - entryPrice) * quantity;
    const pnlPct = entryPrice > 0 ? (pnl / (entryPrice * quantity)) * 100 : 0;

    return {
      pnl: Math.round(pnl * 100) / 100,
      pnlPct: Math.round(pnlPct * 100) / 100,
    };
  }

  /**
   * Calculates option greeks placeholder values
   * Note: In production, these would come from Black-Scholes or live market data
   * @param strikePrice The strike price of the option
   * @param currentPrice Current underlying asset price
   * @param timeToExpiration Days to expiration
   * @param volatility Implied volatility (0-1)
   * @returns Estimated Greeks
   */
  calculateOptionGreeks(
    strikePrice: number,
    currentPrice: number,
    timeToExpiration: number,
    volatility: number
  ): OptionGreeks {
    // Simplified delta calculation
    const moneyness = currentPrice / strikePrice;
    const delta = Math.min(Math.max(Math.log(moneyness) / 2, -1), 1);

    // Simplified gamma (decreases as we move away from ATM)
    const gamma = Math.exp(-Math.pow(Math.log(moneyness), 2) / 2) * 0.4;

    // Simplified theta (negative for long options, time decay)
    const theta = -(volatility * currentPrice) / Math.sqrt(Math.max(timeToExpiration, 1));

    // Simplified vega (positive for long options)
    const vega = currentPrice * Math.sqrt(Math.max(timeToExpiration, 1)) * 0.01;

    return {
      delta: Math.round(delta * 1000) / 1000,
      gamma: Math.round(gamma * 10000) / 10000,
      theta: Math.round(theta * 1000) / 1000,
      vega: Math.round(vega * 1000) / 1000,
    };
  }
}

// Export singleton instance
export const tradeExecutionService = new TradeExecutionService();
