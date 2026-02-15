import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WatchlistState {
  watchedIds: string[];
  toggle: (catalystId: string) => void;
  isWatched: (catalystId: string) => boolean;
  clear: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      watchedIds: [],

      toggle: (catalystId) => {
        const { watchedIds } = get();
        if (watchedIds.includes(catalystId)) {
          set({ watchedIds: watchedIds.filter(id => id !== catalystId) });
        } else {
          set({ watchedIds: [...watchedIds, catalystId] });
        }
      },

      isWatched: (catalystId) => get().watchedIds.includes(catalystId),

      clear: () => set({ watchedIds: [] }),
    }),
    {
      name: 'watchlist-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
