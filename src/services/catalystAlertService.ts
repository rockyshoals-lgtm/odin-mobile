// ODIN Mobile — Catalyst Alert Scheduler
// Schedules T-60/T-45/T-30/T-14/T-7/T-3/T-1 notifications for catalysts
// Buy window alerts (T-60 to T-30) and sell window alerts (T-7 to T-1)

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Catalyst } from '../constants/types';

const isExpoGo = Constants.appOwnership === 'expo';
let Notifications: typeof import('expo-notifications') | null = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch {}
}

const ALERT_PREFS_KEY = 'odin-catalyst-alert-prefs';
const SCHEDULED_ALERTS_KEY = 'odin-scheduled-alerts';

// ─── Alert Schedule Config ────────────────────────────────

export interface CatalystAlertTrigger {
  daysBeforeCatalyst: number;
  label: string;
  phase: 'BUY_WINDOW' | 'SELL_WINDOW' | 'CATALYST_DAY';
  emoji: string;
  message: string;
}

export const ALERT_SCHEDULE: CatalystAlertTrigger[] = [
  { daysBeforeCatalyst: 60, label: 'T-60', phase: 'BUY_WINDOW', emoji: '🟢', message: 'Buy window opens — consider entering position' },
  { daysBeforeCatalyst: 45, label: 'T-45', phase: 'BUY_WINDOW', emoji: '🟢', message: 'Mid buy window — optimal entry period' },
  { daysBeforeCatalyst: 30, label: 'T-30', phase: 'BUY_WINDOW', emoji: '🟡', message: 'Buy window closing — last chance for early entry' },
  { daysBeforeCatalyst: 14, label: 'T-14', phase: 'SELL_WINDOW', emoji: '🟠', message: 'Catalyst approaching — review your position' },
  { daysBeforeCatalyst: 7,  label: 'T-7',  phase: 'SELL_WINDOW', emoji: '🔴', message: 'Sell window — consider trimming or exiting' },
  { daysBeforeCatalyst: 3,  label: 'T-3',  phase: 'SELL_WINDOW', emoji: '🔴', message: 'Catalyst imminent — final exit opportunity' },
  { daysBeforeCatalyst: 1,  label: 'T-1',  phase: 'CATALYST_DAY', emoji: '⚡', message: 'Catalyst TOMORROW — last call for positioning' },
  { daysBeforeCatalyst: 0,  label: 'T-DAY', phase: 'CATALYST_DAY', emoji: '🎯', message: 'Catalyst TODAY — binary event incoming' },
];

// ─── Alert Preferences ────────────────────────────────────

export interface CatalystAlertPrefs {
  enabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  phoneEnabled: boolean;
  email: string;
  phone: string;

  // Which triggers to fire
  buyWindowAlerts: boolean;  // T-60, T-45, T-30
  sellWindowAlerts: boolean; // T-14, T-7, T-3
  catalystDayAlerts: boolean; // T-1, T-DAY

  // Alert time (hour of day in 24h format)
  alertHour: number;
  alertMinute: number;

  // Only alert on watched catalysts?
  watchedOnly: boolean;

  // Minimum tier to alert on
  minTier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
}

export const DEFAULT_ALERT_PREFS: CatalystAlertPrefs = {
  enabled: true,
  pushEnabled: true,
  emailEnabled: false,
  phoneEnabled: false,
  email: '',
  phone: '',
  buyWindowAlerts: true,
  sellWindowAlerts: true,
  catalystDayAlerts: true,
  alertHour: 8,
  alertMinute: 0,
  watchedOnly: false,
  minTier: 'TIER_4', // alert on all tiers by default
};

// ─── Tier ranking for filtering ────────────────────────────

const TIER_RANK: Record<string, number> = {
  'TIER_1': 1,
  'TIER_2': 2,
  'TIER_3': 3,
  'TIER_4': 4,
};

// ─── Catalyst Alert Service ────────────────────────────────

class CatalystAlertService {
  // ─── Preferences ────────────────────────────────────

  async getPrefs(): Promise<CatalystAlertPrefs> {
    try {
      const stored = await AsyncStorage.getItem(ALERT_PREFS_KEY);
      if (stored) return { ...DEFAULT_ALERT_PREFS, ...JSON.parse(stored) };
    } catch {}
    return { ...DEFAULT_ALERT_PREFS };
  }

  async savePrefs(prefs: CatalystAlertPrefs): Promise<void> {
    try {
      await AsyncStorage.setItem(ALERT_PREFS_KEY, JSON.stringify(prefs));
    } catch {}
  }

  // ─── Permission Request ─────────────────────────────

  async requestPermission(): Promise<boolean> {
    if (!Notifications) return false;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') return true;

      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    if (!Notifications) return 'denied';
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch {
      return 'denied';
    }
  }

  // ─── Schedule Alerts for All Catalysts ──────────────

  async scheduleAllAlerts(catalysts: Catalyst[]): Promise<number> {
    if (!Notifications) return 0;

    const prefs = await this.getPrefs();
    if (!prefs.enabled || !prefs.pushEnabled) return 0;

    // Cancel all previously scheduled catalyst alerts
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch {}

    const now = new Date();
    let scheduledCount = 0;

    for (const catalyst of catalysts) {
      // Skip earnings for now (they don't have buy/sell windows)
      if (catalyst.type === 'Earnings') continue;

      // Tier filter
      const catalystRank = TIER_RANK[catalyst.tier] ?? 4;
      const minRank = TIER_RANK[prefs.minTier] ?? 4;
      if (catalystRank > minRank) continue;

      const catalystDate = new Date(catalyst.date);

      for (const trigger of ALERT_SCHEDULE) {
        // Check if this trigger phase is enabled
        if (trigger.phase === 'BUY_WINDOW' && !prefs.buyWindowAlerts) continue;
        if (trigger.phase === 'SELL_WINDOW' && !prefs.sellWindowAlerts) continue;
        if (trigger.phase === 'CATALYST_DAY' && !prefs.catalystDayAlerts) continue;

        // Calculate alert date
        const alertDate = new Date(catalystDate);
        alertDate.setDate(alertDate.getDate() - trigger.daysBeforeCatalyst);
        alertDate.setHours(prefs.alertHour, prefs.alertMinute, 0, 0);

        // Skip if alert date is in the past
        if (alertDate <= now) continue;

        // Schedule the notification
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${trigger.emoji} ${trigger.label} | ${catalyst.ticker} — ${catalyst.type}`,
              body: `${trigger.message}\n${catalyst.drug} • ${catalyst.indication}\nCatalyst: ${catalyst.date}`,
              data: {
                type: 'catalyst_alert',
                ticker: catalyst.ticker,
                catalystId: catalyst.id,
                triggerLabel: trigger.label,
                phase: trigger.phase,
              },
              ...(Platform.OS === 'android' && { channelId: 'portfolio' }),
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: alertDate,
            },
          });
          scheduledCount++;
        } catch (err) {
          // Max 64 scheduled notifications on iOS — stop if we hit the limit
          console.warn('[CatalystAlerts] Schedule failed:', err);
          break;
        }
      }
    }

    // Save record of scheduled count
    try {
      await AsyncStorage.setItem(SCHEDULED_ALERTS_KEY, JSON.stringify({
        count: scheduledCount,
        lastScheduled: new Date().toISOString(),
      }));
    } catch {}

    return scheduledCount;
  }

  // ─── Get Scheduled Info ─────────────────────────────

  async getScheduledInfo(): Promise<{ count: number; lastScheduled: string } | null> {
    try {
      const stored = await AsyncStorage.getItem(SCHEDULED_ALERTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return null;
  }

  // ─── Get Pending Notifications Count ────────────────

  async getPendingCount(): Promise<number> {
    if (!Notifications) return 0;
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.length;
    } catch {
      return 0;
    }
  }
}

export const catalystAlertService = new CatalystAlertService();
