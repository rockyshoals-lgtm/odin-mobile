/**
 * Watchlist Store — Persistent Watchlist with Hydration Safety
 *
 * Uses Zustand persist middleware + AsyncStorage with explicit
 * hydration tracking and backup writes to prevent data loss.
 *
 * P2-007 fix: Added _hydrated flag, onRehydrateStorage callback,
 * explicit AsyncStorage backup on every mutation, and partialize
 * to only persist watchedIds.
 *
 * @module watchlistStore
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Constants ────────────────────────────────────────────────
const STORE_NAME = 'watchlist-store';
const BACKUP_KEY = 'odin-watchlist-backup';

// ── Types ────────────────────────────────────────────────────

interface WatchlistState {
  watchedIds: string[];
  _hydrated: boolean;
  toggle: (catalystId: string) => void;
  isWatched: (catalystId: string) => boolean;
  clear: () => void;
  getCount: () => number;
}

// ── Backup Helper ────────────────────────────────────────────

/**
 * Write watchedIds to a separate AsyncStorage key as a safety net.
 * This runs on every mutation so we never lose data.
 */
async function backupWatchlist(ids: string[]): Promise<void> {
  try {
    await AsyncStorage.setItem(BACKUP_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn('[Watchlist] Backup write failed:', err);
  }
}

/**
 * Restore watchlist from the backup key if Zustand hydration
 * returns empty but we have a backup.
 */
async function restoreFromBackup(): Promise<string[] | null> {
  try {
    const raw = await AsyncStorage.getItem(BACKUP_KEY);
    if (!raw) return null;
    const ids = JSON.parse(raw);
    if (Array.isArray(ids) && ids.length > 0) {
      console.log('[Watchlist] Restored from backup:', ids.length, 'items');
      return ids;
    }
    return null;
  } catch {
    return null;
  }
}

// ── Store ────────────────────────────────────────────────────

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchedIds: [],
      _hydrated: false,

      toggle: (catalystId: string) => {
        // Block mutations until hydration completes
        if (!get()._hydrated) {
          console.warn('[Watchlist] Ignoring toggle — store not hydrated yet');
          return;
        }

        const { watchedIds } = get();
        let nextIds: string[];

        if (watchedIds.includes(catalystId)) {
          nextIds = watchedIds.filter(id => id !== catalystId);
        } else {
          nextIds = [...watchedIds, catalystId];
        }

        set({ watchedIds: nextIds });

        // Explicit backup write (fire-and-forget)
        backupWatchlist(nextIds);
      },

      isWatched: (catalystId: string) => get().watchedIds.includes(catalystId),

      clear: () => {
        set({ watchedIds: [] });
        backupWatchlist([]);
      },

      getCount: () => get().watchedIds.length,
    }),
    {
      name: STORE_NAME,
      storage: createJSONStorage(() => AsyncStorage),

      // Only persist watchedIds — not functions or internal flags
      partialize: (state) => ({ watchedIds: state.watchedIds }),

      // Called when hydration completes
      onRehydrateStorage: () => {
        console.log('[Watchlist] Hydration starting...');

        return async (state, error) => {
          if (error) {
            console.error('[Watchlist] Hydration error:', error);

            // Attempt to restore from backup
            const backup = await restoreFromBackup();
            if (backup) {
              useWatchlistStore.setState({ watchedIds: backup, _hydrated: true });
              return;
            }
          }

          // Check if Zustand returned empty but we have a backup
          if (!state?.watchedIds || state.watchedIds.length === 0) {
            const backup = await restoreFromBackup();
            if (backup) {
              useWatchlistStore.setState({ watchedIds: backup, _hydrated: true });
              return;
            }
          }

          // Normal hydration — mark as ready
          console.log('[Watchlist] Hydration complete:', state?.watchedIds?.length ?? 0, 'items');
          useWatchlistStore.setState({ _hydrated: true });
        };
      },
    }
  )
);

/**
 * Wait for watchlist hydration to complete.
 * Useful in App.tsx init sequence to prevent rendering
 * before persisted data is loaded.
 *
 * @returns Promise that resolves when store is hydrated
 */
export function waitForWatchlistHydration(): Promise<void> {
  return new Promise((resolve) => {
    // Already hydrated
    if (useWatchlistStore.getState()._hydrated) {
      resolve();
      return;
    }

    // Wait for hydration
    const unsub = useWatchlistStore.subscribe((state) => {
      if (state._hydrated) {
        unsub();
        resolve();
      }
    });

    // Safety timeout — don't block forever
    setTimeout(() => {
      unsub();
      if (!useWatchlistStore.getState()._hydrated) {
        console.warn('[Watchlist] Hydration timeout — forcing ready state');
        useWatchlistStore.setState({ _hydrated: true });
      }
      resolve();
    }, 3000);
  });
}
