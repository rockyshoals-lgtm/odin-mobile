// ODIN Mobile — Push Notification Service
// Portfolio alerts: price moves, P&L thresholds, trade confirmations, daily summaries
// Gracefully degrades when running in Expo Go (SDK 53+ removed remote notif support)

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dynamic import — expo-notifications may not be fully functional in Expo Go
let Notifications: typeof import('expo-notifications') | null = null;
try {
  Notifications = require('expo-notifications');
} catch {
  console.warn('[Notifications] expo-notifications not available');
}

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

// ─── Safe wrapper — all notification calls are no-ops if not available ────

class NotificationService {
  private initialized = false;
  private available = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) return this.available;

    try {
      if (!Notifications) {
        console.warn('[Notifications] Module not loaded — skipping init');
        this.initialized = true;
        this.available = false;
        return false;
      }

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
        this.initialized = true;
        this.available = false;
        return false;
      }

      // Set up Android channels
      if (Platform.OS === 'android') {
        try {
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
        } catch (channelErr) {
          console.warn('[Notifications] Channel setup failed (Expo Go?):', channelErr);
        }
      }

      this.initialized = true;
      this.available = true;
      return true;
    } catch (err) {
      console.warn('[Notifications] Init failed (likely Expo Go):', err);
      this.initialized = true;
      this.available = false;
      return false;
    }
  }

  // ─── Preference Management (always works, doesn't need expo-notifications) ────

  async getPrefs(): Promise<PortfolioNotifPrefs> {
    try {
      const stored = await AsyncStorage.getItem(NOTIF_PREFS_KEY);
      if (stored) return { ...DEFAULT_NOTIF_PREFS, ...JSON.parse(stored) };
    } catch {}
    return { ...DEFAULT_NOTIF_PREFS };
  }

  async savePrefs(prefs: PortfolioNotifPrefs): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
    } catch {}
  }

  // ─── Safe schedule — wraps all notification sends ───────────

  private async safeSchedule(content: any, trigger: any = null): Promise<void> {
    if (!this.available || !Notifications) return;
    try {
      await Notifications.scheduleNotificationAsync({ content, trigger });
    } catch (err) {
      // Silently fail in Expo Go — notifications just won't show
      console.warn('[Notifications] Send failed (Expo Go?):', err);
    }
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
    await this.safeSchedule({
      title: `${emoji} ${side} ${ticker}`,
      body: `${quantity} shares @ $${price.toFixed(2)} = $${total.toFixed(2)}`,
      data: { type: 'trade', ticker, side },
      ...(Platform.OS === 'android' && { channelId: 'trades' }),
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
    await this.safeSchedule({
      title: `${emoji} ${ticker} ${sign}${changePct.toFixed(1)}%`,
      body: `Now at $${currentPrice.toFixed(2)}. Your position is moving.`,
      data: { type: 'price_alert', ticker },
      ...(Platform.OS === 'android' && { channelId: 'portfolio' }),
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
    await this.safeSchedule({
      title: `${emoji} Portfolio ${direction === 'profit' ? 'Gain' : 'Loss'} Alert`,
      body: `Total P&L: ${sign}$${totalPnL.toFixed(2)} (crossed $${threshold.toFixed(0)} threshold)`,
      data: { type: 'pnl_threshold' },
      ...(Platform.OS === 'android' && { channelId: 'portfolio' }),
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

    await this.safeSchedule({
      title: `🧬 ${ticker} ${type} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
      body: `${drug} — You hold a position in this catalyst.`,
      data: { type: 'catalyst_reminder', ticker },
      ...(Platform.OS === 'android' && { channelId: 'portfolio' }),
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

    const sign = dayChange >= 0 ? '+' : '';
    await this.safeSchedule({
      title: '📊 Daily Portfolio Summary',
      body: `Value: $${totalValue.toFixed(0)} (${sign}$${dayChange.toFixed(0)} / ${sign}${dayChangePct.toFixed(1)}%) | ${openPositions} open positions`,
      data: { type: 'daily_summary' },
      ...(Platform.OS === 'android' && { channelId: 'daily' }),
    });
  }

  // ─── Schedule Daily Summary ───────────────────────────────

  async scheduleDailySummary(): Promise<void> {
    if (!this.available || !Notifications) return;

    try {
      // Cancel existing scheduled notifications
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
    } catch (err) {
      console.warn('[Notifications] Schedule failed (Expo Go?):', err);
    }
  }
}

export const notificationService = new NotificationService();
