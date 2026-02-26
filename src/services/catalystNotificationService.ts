/**
 * Catalyst Notification Service — PDUFA Date Alerts
 *
 * P2-005: Schedules push notifications for watchlisted catalysts
 * at key milestones: T-7 (runup window), T-1 (eve reminder).
 *
 * Notifications are scheduled locally on-device using expo-notifications.
 * Each catalyst gets up to 2 scheduled notifications when added to watchlist,
 * and all are cancelled when removed.
 *
 * Notification IDs are stored in AsyncStorage for reliable cancellation.
 *
 * @module catalystNotificationService
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Catalyst } from '../constants/types';

// ── Constants ────────────────────────────────────────────────

const NOTIF_IDS_KEY = 'odin-catalyst-notif-ids';
const PDUFA_NOTIF_PREFS_KEY = 'odin-pdufa-notif-prefs';

const isExpoGo = Constants.appOwnership === 'expo';

// Only load expo-notifications in dev builds / production
let Notifications: typeof import('expo-notifications') | null = null;
if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
  } catch {
    // Module not available
  }
}

// ── Types ────────────────────────────────────────────────────

export interface PdufaNotifPrefs {
  t7Alerts: boolean;      // 7 days before PDUFA
  t1Alerts: boolean;      // 1 day before PDUFA
  outcomeAlerts: boolean; // When outcome is announced (future: server push)
}

export const DEFAULT_PDUFA_PREFS: PdufaNotifPrefs = {
  t7Alerts: true,
  t1Alerts: true,
  outcomeAlerts: true,
};

interface StoredNotifIds {
  [catalystId: string]: string[]; // Array of expo notification IDs
}

// ── Tier Display Helpers ─────────────────────────────────────

function getTierEmoji(tier: string): string {
  switch (tier) {
    case 'TIER_1': return '🟢';
    case 'TIER_2': return '🟡';
    case 'TIER_3': return '🟠';
    case 'TIER_4': return '🔴';
    default: return '⚪';
  }
}

function getTierLabel(tier: string, probability: number): string {
  return `${tier} (${Math.round(probability * 100)}%)`;
}

// ── Notification ID Storage ──────────────────────────────────

async function loadNotifIds(): Promise<StoredNotifIds> {
  try {
    const raw = await AsyncStorage.getItem(NOTIF_IDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveNotifIds(ids: StoredNotifIds): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIF_IDS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn('[CatalystNotif] Failed to save notif IDs:', err);
  }
}

// ── Public API ───────────────────────────────────────────────

/**
 * Schedule T-7 and T-1 notifications for a catalyst.
 * Called when a catalyst is added to the watchlist.
 */
export async function scheduleCatalystNotifications(catalyst: Catalyst): Promise<void> {
  if (!Notifications || isExpoGo) {
    console.log('[CatalystNotif] Skipping — notifications not available');
    return;
  }

  const prefs = await getPdufaNotifPrefs();
  const catalystDate = new Date(catalyst.date);
  const now = new Date();
  const scheduledIds: string[] = [];

  const ticker = catalyst.ticker || 'Unknown';
  const drug = catalyst.drug || 'Unknown drug';
  const tier = catalyst.tier || 'UNKNOWN';
  const probability = catalyst.prob || 0;
  const tierEmoji = getTierEmoji(tier);
  const tierLabel = getTierLabel(tier, probability);

  try {
    // ── T-7 Notification ──────────────────────────────────
    if (prefs.t7Alerts) {
      const t7Date = new Date(catalystDate);
      t7Date.setDate(t7Date.getDate() - 7);
      t7Date.setHours(9, 0, 0, 0); // 9 AM local

      if (t7Date > now) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `${tierEmoji} ${ticker} PDUFA in 7 days`,
            body: `${drug} — ${tierLabel}. Runup window opens. Review your position.`,
            data: {
              type: 'catalyst_t7',
              catalystId: catalyst.id,
              screen: 'CatalystDetail',
            },
            ...(Platform.OS === 'android' && { channelId: 'catalyst-alerts' }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: t7Date,
          },
        });
        scheduledIds.push(id);
        console.log(`[CatalystNotif] Scheduled T-7 for ${ticker}:`, t7Date.toISOString());
      }
    }

    // ── T-1 Notification ──────────────────────────────────
    if (prefs.t1Alerts) {
      const t1Date = new Date(catalystDate);
      t1Date.setDate(t1Date.getDate() - 1);
      t1Date.setHours(9, 0, 0, 0); // 9 AM local

      if (t1Date > now) {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: `⚡ ${ticker} PDUFA TOMORROW`,
            body: `${drug} — ${tierLabel}. Final check before FDA decision.`,
            data: {
              type: 'catalyst_t1',
              catalystId: catalyst.id,
              screen: 'CatalystDetail',
            },
            ...(Platform.OS === 'android' && { channelId: 'catalyst-alerts' }),
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: t1Date,
          },
        });
        scheduledIds.push(id);
        console.log(`[CatalystNotif] Scheduled T-1 for ${ticker}:`, t1Date.toISOString());
      }
    }

    // ── Store notification IDs for cancellation ───────────
    if (scheduledIds.length > 0) {
      const stored = await loadNotifIds();
      stored[catalyst.id] = scheduledIds;
      await saveNotifIds(stored);
      console.log(`[CatalystNotif] Stored ${scheduledIds.length} notif IDs for ${ticker}`);
    }
  } catch (err) {
    console.warn('[CatalystNotif] Schedule error:', err);
  }
}

/**
 * Cancel all scheduled notifications for a catalyst.
 * Called when a catalyst is removed from the watchlist.
 */
export async function cancelCatalystNotifications(catalystId: string): Promise<void> {
  if (!Notifications || isExpoGo) return;

  try {
    const stored = await loadNotifIds();
    const ids = stored[catalystId];

    if (ids && ids.length > 0) {
      for (const id of ids) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
      console.log(`[CatalystNotif] Cancelled ${ids.length} notifications for ${catalystId}`);
    }

    delete stored[catalystId];
    await saveNotifIds(stored);
  } catch (err) {
    console.warn('[CatalystNotif] Cancel error:', err);
  }
}

/**
 * Reschedule all watchlist notifications.
 * Useful after data refresh (dates may have changed) or app update.
 */
export async function rescheduleAllNotifications(
  catalysts: Catalyst[],
  watchedIds: string[]
): Promise<void> {
  if (!Notifications || isExpoGo) return;

  try {
    // Cancel all existing catalyst notifications
    const stored = await loadNotifIds();
    for (const catalystId of Object.keys(stored)) {
      await cancelCatalystNotifications(catalystId);
    }

    // Reschedule for all watched catalysts
    const watchedCatalysts = catalysts.filter(c => watchedIds.includes(c.id));
    for (const catalyst of watchedCatalysts) {
      await scheduleCatalystNotifications(catalyst);
    }

    console.log(`[CatalystNotif] Rescheduled for ${watchedCatalysts.length} watched catalysts`);
  } catch (err) {
    console.warn('[CatalystNotif] Reschedule error:', err);
  }
}

/**
 * Get the count of currently scheduled catalyst notifications.
 */
export async function getScheduledCount(): Promise<number> {
  try {
    const stored = await loadNotifIds();
    return Object.values(stored).reduce((sum, ids) => sum + ids.length, 0);
  } catch {
    return 0;
  }
}

// ── Preference Management ────────────────────────────────────

export async function getPdufaNotifPrefs(): Promise<PdufaNotifPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PDUFA_NOTIF_PREFS_KEY);
    if (raw) return { ...DEFAULT_PDUFA_PREFS, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_PDUFA_PREFS };
}

export async function savePdufaNotifPrefs(prefs: PdufaNotifPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(PDUFA_NOTIF_PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}
