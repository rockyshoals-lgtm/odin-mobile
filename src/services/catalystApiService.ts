/**
 * Catalyst API Service — Unified Data Fetching
 *
 * Fetches catalyst data from the pdufa.bio API endpoint, with
 * AsyncStorage caching (1-hour TTL) and fallback to the bundled
 * CATALYSTS_DATA when the network is unavailable.
 *
 * @module catalystApiService
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Catalyst } from '../constants/types';
import { CATALYSTS_DATA } from '../constants/catalysts';

/** Remote API endpoint for catalyst data */
const API_URL = 'https://pdufa.bio/api/catalysts-v10-69.json';

/** AsyncStorage cache key (versioned to engine) */
const CACHE_KEY = 'odin-catalysts-cache-v10-69';

/** Cache time-to-live: 1 hour in milliseconds */
const CACHE_TTL = 1000 * 60 * 60;

/** Network request timeout in milliseconds */
const FETCH_TIMEOUT = 8000;

/** Shape of the cached data envelope */
interface CacheEnvelope {
  data: Catalyst[];
  timestamp: number;
  version: string;
}

/** Shape of the API response */
interface ApiResponse {
  version: string;
  updated_at: string;
  catalysts: Catalyst[];
}

/** Result of a fetch operation */
export interface FetchResult {
  catalysts: Catalyst[];
  source: 'api' | 'cache' | 'bundled';
  version: string;
  updatedAt: string | null;
}

/**
 * Fetch catalyst data with caching and graceful fallback.
 *
 * Priority order:
 * 1. Fresh API data (if cache is stale or missing)
 * 2. Cached data (if within TTL)
 * 3. Bundled CATALYSTS_DATA (offline fallback)
 *
 * @returns {Promise<FetchResult>} Catalyst array with source metadata
 */
export async function fetchCatalysts(): Promise<FetchResult> {
  try {
    // ── Check cache first ──────────────────────────────────
    const cached = await getCachedData();
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('[CatalystAPI] Using cached data', {
        age: Math.round((Date.now() - cached.timestamp) / 1000) + 's',
        count: cached.data.length,
      });
      return {
        catalysts: cached.data,
        source: 'cache',
        version: cached.version,
        updatedAt: new Date(cached.timestamp).toISOString(),
      };
    }

    // ── Fetch fresh data from API ──────────────────────────
    console.log('[CatalystAPI] Fetching from API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(API_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'X-Client': 'odin-mobile/1.2.0',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const json: ApiResponse = await response.json();

    if (!json.catalysts || !Array.isArray(json.catalysts)) {
      throw new Error('Invalid API response shape');
    }

    // ── Cache the fresh data ───────────────────────────────
    const envelope: CacheEnvelope = {
      data: json.catalysts,
      timestamp: Date.now(),
      version: json.version || 'unknown',
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(envelope));

    console.log('[CatalystAPI] Fresh data cached', {
      count: json.catalysts.length,
      version: json.version,
    });

    return {
      catalysts: json.catalysts,
      source: 'api',
      version: json.version,
      updatedAt: json.updated_at,
    };
  } catch (error) {
    // ── Fallback: try stale cache ──────────────────────────
    const staleCache = await getCachedData();
    if (staleCache) {
      console.warn('[CatalystAPI] API failed, using stale cache:', error);
      return {
        catalysts: staleCache.data,
        source: 'cache',
        version: staleCache.version,
        updatedAt: new Date(staleCache.timestamp).toISOString(),
      };
    }

    // ── Final fallback: bundled data ───────────────────────
    console.warn('[CatalystAPI] All sources failed, using bundled data:', error);
    return {
      catalysts: CATALYSTS_DATA,
      source: 'bundled',
      version: 'bundled-v10.69',
      updatedAt: null,
    };
  }
}

/**
 * Force refresh catalyst data from the API, bypassing cache.
 * Useful for pull-to-refresh.
 */
export async function refreshCatalysts(): Promise<FetchResult> {
  await AsyncStorage.removeItem(CACHE_KEY);
  return fetchCatalysts();
}

/**
 * Get the current cache age in seconds, or null if no cache exists.
 */
export async function getCacheAge(): Promise<number | null> {
  const cached = await getCachedData();
  if (!cached) return null;
  return Math.round((Date.now() - cached.timestamp) / 1000);
}

/**
 * Clear the catalyst cache entirely.
 */
export async function clearCatalystCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
  console.log('[CatalystAPI] Cache cleared');
}

// ── Internal helpers ─────────────────────────────────────────

async function getCachedData(): Promise<CacheEnvelope | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const envelope: CacheEnvelope = JSON.parse(raw);
    if (!envelope.data || !Array.isArray(envelope.data)) return null;
    return envelope;
  } catch {
    return null;
  }
}
