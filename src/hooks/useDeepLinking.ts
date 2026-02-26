/**
 * Deep Linking Hook — URL Handler for ODIN Mobile
 *
 * Handles incoming URLs from both custom scheme (odin://) and
 * universal links (https://pdufa.bio/...). Parses the URL and
 * navigates to the correct screen with parameters.
 *
 * Supported URL patterns:
 * - pdufa.bio/catalyst/:id   → CatalystDetail screen
 * - pdufa.bio/track-record   → TrackRecord tab
 * - odin://catalyst/:id      → CatalystDetail screen
 * - odin://watchlist          → Watchlist tab
 * - odin://home               → Home/Catalysts tab
 *
 * @module useDeepLinking
 */

import { useEffect, useCallback, useRef } from 'react';
import * as Linking from 'expo-linking';
import { trackEvent } from '../services/analyticsService';

/** Parsed deep link result */
export interface DeepLinkTarget {
  screen: 'CatalystDetail' | 'TrackRecord' | 'Watchlist' | 'Home' | 'Unknown';
  params?: Record<string, string>;
}

/** Callback when a deep link is resolved */
export type DeepLinkHandler = (target: DeepLinkTarget) => void;

/**
 * Hook that listens for incoming deep links and calls the handler
 * with parsed navigation targets.
 *
 * @param onDeepLink - Callback invoked with the parsed target
 *
 * @example
 * ```tsx
 * useDeepLinking((target) => {
 *   if (target.screen === 'CatalystDetail' && target.params?.id) {
 *     openCatalystDetail(target.params.id);
 *   }
 * });
 * ```
 */
export function useDeepLinking(onDeepLink: DeepLinkHandler): void {
  const handlerRef = useRef(onDeepLink);
  handlerRef.current = onDeepLink;

  const handleUrl = useCallback(({ url }: { url: string }) => {
    if (!url) return;

    console.log('[DeepLink] Received URL:', url);
    const target = parseDeepLink(url);

    trackEvent('deep_link_received', {
      url,
      screen: target.screen,
      catalystId: target.params?.id,
    });

    handlerRef.current(target);
  }, []);

  useEffect(() => {
    // ── Handle initial URL (app opened via link) ───────────
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('[DeepLink] Initial URL:', url);
        handleUrl({ url });
      }
    });

    // ── Handle URLs while app is running ───────────────────
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [handleUrl]);
}

/**
 * Parse a deep link URL into a navigation target.
 *
 * @param url - Raw URL string (odin:// or https://pdufa.bio/...)
 * @returns Parsed target with screen name and parameters
 */
export function parseDeepLink(url: string): DeepLinkTarget {
  try {
    const parsed = Linking.parse(url);
    const { hostname, path, scheme } = parsed;

    // Normalize: combine hostname and path for consistent parsing
    const fullPath = [hostname, path].filter(Boolean).join('/');

    // ── odin:// scheme routes ─────────────────────────────
    if (scheme === 'odin' || scheme === 'exp+odin-mobile') {
      // odin://catalyst/:id
      if (fullPath.startsWith('catalyst/')) {
        const id = fullPath.replace('catalyst/', '');
        return { screen: 'CatalystDetail', params: { id } };
      }

      // odin://watchlist
      if (fullPath === 'watchlist' || hostname === 'watchlist') {
        return { screen: 'Watchlist' };
      }

      // odin://home
      if (fullPath === 'home' || hostname === 'home') {
        return { screen: 'Home' };
      }

      // odin://track-record
      if (fullPath.includes('track-record')) {
        return { screen: 'TrackRecord' };
      }
    }

    // ── https://pdufa.bio routes ──────────────────────────
    if (hostname === 'pdufa.bio' || hostname === 'www.pdufa.bio') {
      const segments = (path || '').split('/').filter(Boolean);

      // /catalyst/:id
      if (segments[0] === 'catalyst' && segments[1]) {
        return { screen: 'CatalystDetail', params: { id: segments[1] } };
      }

      // /track-record or /odin-track-record
      if (segments[0] === 'track-record' || segments[0] === 'odin-track-record') {
        return { screen: 'TrackRecord' };
      }

      // /pdufa-calendar or /pdufa-dates-2026
      if (
        segments[0] === 'pdufa-calendar' ||
        segments[0] === 'pdufa-dates-2026' ||
        segments[0] === 'pdufa-calendar-2026'
      ) {
        return { screen: 'Home' };
      }
    }

    return { screen: 'Unknown' };
  } catch (error) {
    console.warn('[DeepLink] Parse error:', error);
    return { screen: 'Unknown' };
  }
}

/**
 * Generate an ODIN deep link URL for a catalyst.
 *
 * @param catalystId - The catalyst ID
 * @returns Deep link URL string
 */
export function makeCatalystDeepLink(catalystId: string): string {
  return `odin://catalyst/${catalystId}`;
}

/**
 * Generate the pdufa.bio web URL for a catalyst.
 *
 * @param catalystId - The catalyst ID (e.g. 'aldx-reproxalap-2026-03-16')
 * @returns Web URL string
 */
export function makeCatalystWebUrl(catalystId: string): string {
  // Extract the ticker-based slug from the catalyst ID
  // e.g. 'aldx-reproxalap-2026-03-16' → 'aldx-pdufa'
  const ticker = catalystId.split('-')[0]?.toLowerCase();
  return `https://pdufa.bio/${ticker}-pdufa`;
}
