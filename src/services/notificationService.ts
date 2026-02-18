// ODIN Mobile — Push Notification Service
// Portfolio alerts: price moves, P&L thresholds, trade confirmations, daily summaries

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIF_PREFS_KEY = 'odin-notification-prefs';

// ─── Notification Preference Types ────────────────────────────

export interface PortfolioNotifPrefs {
  // Portfolio alerts
  dailySummary: boolean;          // End-of-day P&L summary
  tradeConfirmations: boolean;    // Confirm when trades execute
  priceAlerts: boolean;           // Significant price moves on held positions
  pnlThresholdAlerts: boolean;    // Alert when total P&L crosses thresholds
  catalystReminders: boolean;     // Remind before upcoming catalysts on held positions

  // Thresholds
  priceMovePct: number;           // Alert when position moves ±X% (default 5)
  pnlThresholdAmount: number;     // Alert when total P&L crosses ±$X (default 1000)
}

export const DEFAULT_NOTIF_PREFS: PortfolioNotifPrefs = {
  dailySummary: true,
  tradeConfirmations: true,
  priceAlerts: true,
  pnlThresholdAlerts: true,
  catalystReminders: true,
  priceMovePct: 5,
  pnlThresholdAmount: 1000,
};

// ─── Notification Channel Setup ───────────────────────────────

class NotificationService {
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // Configure notification handling
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[Notifications] Permission not granted');
        return false;
      }

      // Set up Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('portfolio', {
          name: 'Portfolio Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3b82f6',
        });

        await Notifications.setNotificationChannelAsync('trades', {
          name: 'Trade Confirmations',
          importance: Notifications.AndroidImportance.DEFAULT,
        });

        await Notifications.setNotificationChannelAsync('daily', {
          name: 'Daily Summary',
          importance: Notifications.AndroidImportance.LOW,
        });
      }

      this.initialized = true;
      return true;
    } catch (err) {
      console.warn('[Notifications] Init failed:', err);
      return false;
    }
  }

  // ─── Preference Management ────────────────────────────────

  async getPrefs(): Promise<PortfolioNotifPrefs> {
    try {
      const stored = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
      if (stored) return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(stored) };
    } catch {}
    return { ...DEFAULT_NOTIF_PREFS };
  }

  async savePrefs(prefs: PortfolioNotifPrefs): Promise<void> {
    await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
  }

  // ─── Send Notifications ───────────────────────────────────

  async sendTradeConfirmation(
    side: 'BUY' | 'SELL',
    ticker: string,
    quantity: number,
    price: number,
    total: number,
  ): Promise<void> {
    const prefs = await this.getPrefs();
    if (!prefs.tradeConfirmations) return;

    const emoji = side === 'BUY' ? '🟢' : '🔴';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} ${side} ${ticker}`,
        body: `${quantity} shares @ $${price.toFixed(2)} = $${total.toFixed(2)}`,
        data: { type: 'trade', ticker, side },
        ...(Platform.OS === 'android' && { channelId: 'trades' }),
      },
      trigger: null, // immediate
    });
  }

  async sendPriceAlert(
    ticker: string,
    currentPrice: number,
    changePct: number,
    direction: 'up' | 'down',
  ): Promise<void> {
    const prefs = await this.getPrefs();
    if (!prefs.priceAlerts) return;

    const emoji = direction === 'up' ? '🚀' : '📉';
    const sign = direction === 'up' ? '+' : '';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} ${ticker} ${sign}${changePct.toFixed(1)}%`,
        body: `Now at $${currentPrice.toFixed(2)}. Your position is moving.`,
        data: { type: 'price_alert', ticker },
        ...(Platform.OS === 'android' && { channelId: 'portfolio' }),
      },
      trigger: null,
    });
  }

  async sendPnLThresholdAlert(
    totalPnL: number,
    direction: 'profit' | 'loss',
    threshold: number,
  ): Promise<void> {
    const prefs = await this.getPrefs();
    if (!prefs.pnlThresholdAlerts) return;

    const emoji = direction === 'profit' ? '💰' : '⚠️';
    const sign = totalPnL >= 0 ? '+' : '';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} Portfolio ${direction === 'profit' ? 'Gain' : 'Loss'} Alert`,
        body: `Total P&L: ${sign}$${totalPnL.toFixed(2)} (crossed $${threshold.toFixed(0)} threshold)`,
        data: { type: 'pnl_threshold' },
        ...(Platform.OS === 'android' && { channelId: 'portfolio' }),
      },
      trigger: null,
    });
  }

  async sendCatalystReminder(
    ticker: string,
    drug: string,
    daysUntil: number,
    type: string,
  ): Promise<void> {
    const prefs = await this.getPrefs();
    if (!prefs.catalystReminders) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🧬 ${ticker} ${type} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
        body: `${drug} — You hold a position in this catalyst.`,
        data: { type: 'catalyst_reminder', ticker },
        ...(Platform.OS === 'android' && { channelId: 'portfolio' }),
      },
      trigger: null,
    });
  }

  async sendDailySummary(
    totalValue: number,
    dayChange: number,
    dayChangePct: number,
    openPositions: number,
  ): Promise<void> {
    const prefs = await this.getPrefs();
    if (!prefs.dailySummary) return;

    const emoji = dayChange >= 0 ? '📊' : '📊';
    const sign = dayChange >= 0 ? '+' : '';
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} Daily Portfolio Summary`,
        body: `Value: $${totalValue.toFixed(0)} (${sign}$${dayChange.toFixed(0)} / ${sign}${dayChangePct.toFixed(1)}%) | ${openPositions} open positions`,
        data: { type: 'daily_summary' },
        ...(Platform.OS === 'android' && { channelId: 'daily' }),
      },
      trigger: null,
    });
  }

  // ─── Schedule Daily Summary ───────────────────────────────

  async scheduleDailySummary(): Promise<void> {
    // Cancel existing
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prefs = await this.getPrefs();
    if (!prefs.dailySummary) return;

    // Schedule for 4:30 PM ET daily (after market close)
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Time for your daily ODIN review',
        body: 'Check how your paper portfolio performed today.',
        data: { type: 'daily_reminder' },
        ...(Platform.OS === 'android' && { channelId: 'daily' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 16,
        minute: 30,
      },
    });
  }
}

export const notificationService = new NotificationService();
