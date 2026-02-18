// ODIN Mobile — Paper Trading Store
// $100K starting balance, buy/sell stocks + options, full P&L tracking
// Designed to be swappable for Alpaca API when LLC is formed

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaperAccount, Position, Trade, OptionPosition, OptionLeg, PortfolioMetrics } from '../constants/tradingTypes';
import API_CONFIG from '../config/apiKeys';
import { notificationService } from '../services/notificationService';

interface PaperTradeState {
  // Account
  account: PaperAccount;
  positions: Record<string, Position>;      // ticker -> position
  optionPositions: Record<string, OptionPosition>; // id -> option position
  tradeHistory: Trade[];

  // UI state
  showTradeEntry: boolean;
  selectedTicker: string | null;

  // Actions — Stocks
  buyStock: (ticker: string, company: string, quantity: number, price: number, catalystId?: string) => boolean;
  sellStock: (ticker: string, quantity: number, price: number) => boolean;
  updatePrice: (ticker: string, price: number) => void;
  updatePrices: (prices: Record<string, number>) => void;

  // Actions — Options
  buyOption: (position: OptionPosition) => boolean;
  sellOption: (positionId: string, currentValue: number) => boolean;

  // Actions — UI
  setShowTradeEntry: (show: boolean) => void;
  setSelectedTicker: (ticker: string | null) => void;

  // Getters
  getPosition: (ticker: string) => Position | undefined;
  getPortfolioMetrics: () => PortfolioMetrics;
  getTotalValue: () => number;
  hasPosition: (ticker: string) => boolean;

  // Reset
  resetAccount: () => void;
}

const INITIAL_ACCOUNT: PaperAccount = {
  accountId: 'paper-odin-v1',
  balance: API_CONFIG.STARTING_BALANCE,
  startingBalance: API_CONFIG.STARTING_BALANCE,
  totalPortfolioValue: API_CONFIG.STARTING_BALANCE,
  createdAt: new Date().toISOString(),
  lastTradeDate: '',
};

export const usePaperTradeStore = create<PaperTradeState>()(
  persist(
    (set, get) => ({
      account: { ...INITIAL_ACCOUNT },
      positions: {},
      optionPositions: {},
      tradeHistory: [],
      showTradeEntry: false,
      selectedTicker: null,

      // ─── Buy Stock ────────────────────────────────────────────

      buyStock: (ticker, company, quantity, price, catalystId) => {
        const { account, positions, tradeHistory } = get();
        const cost = quantity * price;

        if (cost > account.balance) return false; // insufficient funds

        const existing = positions[ticker];
        const newPos: Position = existing
          ? {
              ...existing,
              quantity: existing.quantity + quantity,
              totalCost: existing.totalCost + cost,
              averageEntryPrice: (existing.totalCost + cost) / (existing.quantity + quantity),
              currentPrice: price,
              currentValue: (existing.quantity + quantity) * price,
              unrealizedPnL: 0,
              unrealizedPnLPct: 0,
              lastUpdated: new Date().toISOString(),
            }
          : {
              id: `pos-${ticker}-${Date.now()}`,
              ticker,
              company,
              quantity,
              averageEntryPrice: price,
              currentPrice: price,
              totalCost: cost,
              currentValue: cost,
              unrealizedPnL: 0,
              unrealizedPnLPct: 0,
              catalystId,
              openedAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
            };

        // Recalc unrealized P&L
        newPos.unrealizedPnL = newPos.currentValue - newPos.totalCost;
        newPos.unrealizedPnLPct = newPos.totalCost > 0 ? (newPos.unrealizedPnL / newPos.totalCost) * 100 : 0;

        const trade: Trade = {
          id: `trade-${Date.now()}`,
          ticker,
          company,
          side: 'BUY',
          type: 'STOCK',
          quantity,
          executedPrice: price,
          executedAt: new Date().toISOString(),
          totalValue: cost,
          catalystId,
        };

        set({
          account: {
            ...account,
            balance: account.balance - cost,
            lastTradeDate: new Date().toISOString(),
          },
          positions: { ...positions, [ticker]: newPos },
          tradeHistory: [trade, ...tradeHistory],
        });

        // Send trade confirmation notification
        notificationService.sendTradeConfirmation('BUY', ticker, quantity, price, cost).catch(() => {});

        return true;
      },

      // ─── Sell Stock ───────────────────────────────────────────

      sellStock: (ticker, quantity, price) => {
        const { account, positions, tradeHistory } = get();
        const pos = positions[ticker];
        if (!pos || pos.quantity < quantity) return false;

        const proceeds = quantity * price;
        const costBasis = quantity * pos.averageEntryPrice;
        const pnl = proceeds - costBasis;
        const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

        const remainingQty = pos.quantity - quantity;
        const updatedPositions = { ...positions };

        if (remainingQty <= 0) {
          delete updatedPositions[ticker];
        } else {
          updatedPositions[ticker] = {
            ...pos,
            quantity: remainingQty,
            totalCost: remainingQty * pos.averageEntryPrice,
            currentValue: remainingQty * price,
            unrealizedPnL: remainingQty * (price - pos.averageEntryPrice),
            unrealizedPnLPct: ((price - pos.averageEntryPrice) / pos.averageEntryPrice) * 100,
            lastUpdated: new Date().toISOString(),
          };
        }

        const trade: Trade = {
          id: `trade-${Date.now()}`,
          ticker,
          company: pos.company,
          side: 'SELL',
          type: 'STOCK',
          quantity,
          executedPrice: price,
          executedAt: new Date().toISOString(),
          totalValue: proceeds,
          pnl: Math.round(pnl * 100) / 100,
          pnlPct: Math.round(pnlPct * 100) / 100,
          catalystId: pos.catalystId,
        };

        set({
          account: {
            ...account,
            balance: account.balance + proceeds,
            lastTradeDate: new Date().toISOString(),
          },
          positions: updatedPositions,
          tradeHistory: [trade, ...tradeHistory],
        });

        // Send trade confirmation notification
        notificationService.sendTradeConfirmation('SELL', ticker, quantity, price, proceeds).catch(() => {});

        return true;
      },

      // ─── Update Prices ────────────────────────────────────────

      updatePrice: (ticker, price) => {
        const pos = get().positions[ticker];
        if (!pos) return;
        const currentValue = pos.quantity * price;
        const unrealizedPnL = currentValue - pos.totalCost;
        const unrealizedPnLPct = pos.totalCost > 0 ? (unrealizedPnL / pos.totalCost) * 100 : 0;
        set(s => ({
          positions: {
            ...s.positions,
            [ticker]: { ...pos, currentPrice: price, currentValue, unrealizedPnL, unrealizedPnLPct, lastUpdated: new Date().toISOString() },
          },
        }));
      },

      updatePrices: (prices) => {
        const { positions, account } = get();
        const updated = { ...positions };
        Object.entries(prices).forEach(([ticker, price]) => {
          if (updated[ticker]) {
            const pos = updated[ticker];
            const oldPct = pos.totalCost > 0 ? ((pos.currentValue - pos.totalCost) / pos.totalCost) * 100 : 0;
            const currentValue = pos.quantity * price;
            const unrealizedPnL = currentValue - pos.totalCost;
            const newPct = pos.totalCost > 0 ? (unrealizedPnL / pos.totalCost) * 100 : 0;
            updated[ticker] = {
              ...pos,
              currentPrice: price,
              currentValue,
              unrealizedPnL,
              unrealizedPnLPct: newPct,
              lastUpdated: new Date().toISOString(),
            };

            // Check for significant price move alerts (crosses threshold)
            const absPctChange = Math.abs(newPct - oldPct);
            if (absPctChange >= 5) {
              notificationService.sendPriceAlert(
                ticker, price, newPct, newPct > oldPct ? 'up' : 'down'
              ).catch(() => {});
            }
          }
        });

        // Check portfolio P&L threshold
        const stockValue = Object.values(updated).reduce((sum, p) => sum + p.currentValue, 0);
        const optValue = Object.values(get().optionPositions).reduce((sum, p) => sum + p.currentValue, 0);
        const totalValue = account.balance + stockValue + optValue;
        const totalPnL = totalValue - account.startingBalance;
        const absPnL = Math.abs(totalPnL);
        if (absPnL >= 1000 && absPnL % 1000 < 50) {
          const threshold = Math.floor(absPnL / 1000) * 1000;
          notificationService.sendPnLThresholdAlert(
            totalPnL, totalPnL >= 0 ? 'profit' : 'loss', threshold
          ).catch(() => {});
        }

        set({ positions: updated });
      },

      // ─── Options Trading ──────────────────────────────────────

      buyOption: (position) => {
        const { account, optionPositions, tradeHistory } = get();
        if (position.totalCost > account.balance) return false;

        const trade: Trade = {
          id: `trade-${Date.now()}`,
          ticker: position.ticker,
          company: position.ticker,
          side: 'BUY',
          type: 'OPTION',
          quantity: position.legs?.reduce((sum, l) => sum + l.contracts, 0) ?? 0,
          executedPrice: position.totalCost,
          executedAt: new Date().toISOString(),
          totalValue: position.totalCost,
          catalystId: position.catalystId,
          notes: `${position.strategy} strategy`,
        };

        set({
          account: { ...account, balance: account.balance - position.totalCost, lastTradeDate: new Date().toISOString() },
          optionPositions: { ...optionPositions, [position.id]: position },
          tradeHistory: [trade, ...tradeHistory],
        });
        return true;
      },

      sellOption: (positionId, currentValue) => {
        const { account, optionPositions, tradeHistory } = get();
        const pos = optionPositions[positionId];
        if (!pos) return false;

        const pnl = currentValue - pos.totalCost;
        const trade: Trade = {
          id: `trade-${Date.now()}`,
          ticker: pos.ticker,
          company: pos.ticker,
          side: 'SELL',
          type: 'OPTION',
          quantity: pos.legs?.reduce((sum, l) => sum + l.contracts, 0) ?? 0,
          executedPrice: currentValue,
          executedAt: new Date().toISOString(),
          totalValue: currentValue,
          pnl: Math.round(pnl * 100) / 100,
          notes: `Close ${pos.strategy}`,
        };

        const updated = { ...optionPositions };
        delete updated[positionId];

        set({
          account: { ...account, balance: account.balance + currentValue },
          optionPositions: updated,
          tradeHistory: [trade, ...tradeHistory],
        });
        return true;
      },

      // ─── UI ───────────────────────────────────────────────────

      setShowTradeEntry: (show) => set({ showTradeEntry: show }),
      setSelectedTicker: (ticker) => set({ selectedTicker: ticker }),

      // ─── Getters ──────────────────────────────────────────────

      getPosition: (ticker) => get().positions[ticker],
      hasPosition: (ticker) => !!get().positions[ticker],

      getTotalValue: () => {
        const { account, positions, optionPositions } = get();
        const stockValue = Object.values(positions).reduce((sum, p) => sum + p.currentValue, 0);
        const optValue = Object.values(optionPositions).reduce((sum, p) => sum + p.currentValue, 0);
        return account.balance + stockValue + optValue;
      },

      getPortfolioMetrics: () => {
        const { account, positions, optionPositions, tradeHistory } = get();
        const stockValue = Object.values(positions).reduce((sum, p) => sum + p.currentValue, 0);
        const optValue = Object.values(optionPositions).reduce((sum, p) => sum + p.currentValue, 0);
        const totalValue = account.balance + stockValue + optValue;
        const totalGain = totalValue - account.startingBalance;

        // Trade stats
        const closedTrades = tradeHistory.filter(t => t.side === 'SELL' && t.pnl !== undefined);
        const winners = closedTrades.filter(t => (t.pnl || 0) > 0);
        const losers = closedTrades.filter(t => (t.pnl || 0) < 0);

        return {
          totalValue,
          cashBalance: account.balance,
          positionsValue: stockValue,
          optionsValue: optValue,
          totalGain,
          totalGainPct: (totalGain / account.startingBalance) * 100,
          dayGain: 0, // would need yesterday's snapshot
          dayGainPct: 0,
          winRate: closedTrades.length > 0 ? (winners.length / closedTrades.length) * 100 : 0,
          totalTrades: tradeHistory.length,
          winningTrades: winners.length,
          losingTrades: losers.length,
          largestWin: winners.length > 0 ? Math.max(...winners.map(t => t.pnl || 0)) : 0,
          largestLoss: losers.length > 0 ? Math.min(...losers.map(t => t.pnl || 0)) : 0,
          avgTradePnL: closedTrades.length > 0
            ? closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / closedTrades.length
            : 0,
        };
      },

      // ─── Reset ────────────────────────────────────────────────

      resetAccount: () => {
        set({
          account: { ...INITIAL_ACCOUNT, createdAt: new Date().toISOString() },
          positions: {},
          optionPositions: {},
          tradeHistory: [],
        });
      },
    }),
    {
      name: 'paper-trade-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        account: state.account,
        positions: state.positions,
        optionPositions: state.optionPositions,
        tradeHistory: state.tradeHistory,
      }),
    }
  )
);
