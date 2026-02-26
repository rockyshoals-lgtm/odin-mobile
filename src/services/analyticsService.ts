/**
 * Analytics Service — Cross-Platform Event Tracking
 *
 * Foundation for tracking user behavior across the ODIN mobile app.
 * Generates an anonymous user ID stored in AsyncStorage.
 * Logs events to console for now — designed to plug into GA4 or
 * Mixpanel when ready.
 *
 * @module analyticsService
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ── Constants ────────────────────────────────────────────────

const USER_ID_KEY = 'odin-analytics-user-id';
const SESSION_KEY = 'odin-analytics-session';

/** All tracked event names */
export type AnalyticsEvent =
  | 'app_launched'
  | 'catalyst_viewed'
  | 'catalyst_added_to_watchlist'
  | 'catalyst_removed_from_watchlist'
  | 'web_link_opened'
  | 'deep_link_received'
  | 'filter_applied'
  | 'prediction_submitted'
  | 'trade_executed'
  | 'screen_viewed'
  | 'search_performed'
  | 'api_fetch_completed';

/** Properties attached to events */
export interface EventProperties {
  catalystId?: string;
  ticker?: string;
  tier?: string;
  url?: string;
  source?: string;
  filterType?: string;
  filterValue?: string;
  screen?: string;
  query?: string;
  dataSource?: 'api' | 'cache' | 'bundled';
  duration?: number;
  [key: string]: string | number | boolean | undefined;
}

// ── State ────────────────────────────────────────────────────

let _userId: string | null = null;
let _sessionId: string | null = null;
let _sessionStart: number = Date.now();

// ── Public API ───────────────────────────────────────────────

/**
 * Initialize analytics — generates or restores anonymous user ID.
 * Call once at app startup.
 */
export async function initAnalytics(): Promise<string> {
  // Restore or generate user ID
  let storedId = await AsyncStorage.getItem(USER_ID_KEY);
  if (!storedId) {
    storedId = generateUUID();
    await AsyncStorage.setItem(USER_ID_KEY, storedId);
    console.log('[Analytics] New user ID generated:', storedId);
  }
  _userId = storedId;

  // Create new session
  _sessionId = generateUUID();
  _sessionStart = Date.now();
  await AsyncStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ id: _sessionId, start: _sessionStart })
  );

  console.log('[Analytics] Session started:', _sessionId);
  return _userId;
}

/**
 * Track an analytics event with optional properties.
 *
 * @param event - Event name from AnalyticsEvent union
 * @param properties - Optional key-value properties
 *
 * @example
 * ```ts
 * trackEvent('catalyst_viewed', { catalystId: 'aldx-reproxalap-2026-03-16', ticker: 'ALDX', tier: 'TIER_1' });
 * trackEvent('web_link_opened', { url: 'https://pdufa.bio/aldx-pdufa' });
 * trackEvent('filter_applied', { filterType: 'tier', filterValue: 'TIER_1' });
 * ```
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  const payload = {
    event,
    properties: {
      ...properties,
      userId: _userId,
      sessionId: _sessionId,
      platform: Platform.OS,
      appVersion: '1.2.0',
      engineVersion: 'v10.69',
      timestamp: new Date().toISOString(),
      sessionDuration: Math.round((Date.now() - _sessionStart) / 1000),
    },
  };

  // ── Console logging (swap for GA4/Mixpanel SDK later) ────
  if (__DEV__) {
    console.log(`[Analytics] ${event}`, payload.properties);
  }

  // ── Future: send to analytics backend ────────────────────
  // Example GA4:
  //   analytics().logEvent(event, payload.properties);
  //
  // Example Mixpanel:
  //   mixpanel.track(event, payload.properties);
  //
  // Example PostHog:
  //   posthog.capture(event, payload.properties);
}

/**
 * Track a screen view event.
 *
 * @param screenName - Name of the screen
 */
export function trackScreen(screenName: string): void {
  trackEvent('screen_viewed', { screen: screenName });
}

/**
 * Get the anonymous user ID (or null if not initialized).
 */
export function getUserId(): string | null {
  return _userId;
}

/**
 * Get the current session ID.
 */
export function getSessionId(): string | null {
  return _sessionId;
}

/**
 * Reset analytics state — generates new user ID.
 * Use when user explicitly requests data reset.
 */
export async function resetAnalytics(): Promise<void> {
  await AsyncStorage.removeItem(USER_ID_KEY);
  await AsyncStorage.removeItem(SESSION_KEY);
  _userId = null;
  _sessionId = null;
  console.log('[Analytics] Reset complete');
}

// ── Internal helpers ─────────────────────────────────────────

/**
 * Generate a v4-style UUID without external dependencies.
 */
function generateUUID(): string {
  const hex = '0123456789abcdef';
  let uuid = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uuid += '-';
    } else if (i === 14) {
      uuid += '4';
    } else if (i === 19) {
      uuid += hex[(Math.random() * 4) | 8];
    } else {
      uuid += hex[(Math.random() * 16) | 0];
    }
  }
  return uuid;
}
