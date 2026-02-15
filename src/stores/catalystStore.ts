import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Catalyst, FilterTier, SortField, SortDirection } from '../constants/types';

interface CatalystState {
  catalysts: Catalyst[];
  filterTier: FilterTier;
  filterTA: string | null;
  searchQuery: string;
  sortField: SortField;
  sortDirection: SortDirection;
  dateRange: 30 | 60 | 90;
  lastFetch: number;

  setCatalysts: (catalysts: Catalyst[]) => void;
  setFilterTier: (tier: FilterTier) => void;
  setFilterTA: (ta: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (dir: SortDirection) => void;
  setDateRange: (range: 30 | 60 | 90) => void;
  getFiltered: () => Catalyst[];
}

export const useCatalystStore = create<CatalystState>()(
  persist(
    (set, get) => ({
      catalysts: [],
      filterTier: null,
      filterTA: null,
      searchQuery: '',
      sortField: 'date',
      sortDirection: 'asc',
      dateRange: 60,
      lastFetch: 0,

      setCatalysts: (catalysts) => set({ catalysts, lastFetch: Date.now() }),
      setFilterTier: (filterTier) => set({ filterTier }),
      setFilterTA: (filterTA) => set({ filterTA }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSortField: (sortField) => set({ sortField }),
      setSortDirection: (sortDirection) => set({ sortDirection }),
      setDateRange: (dateRange) => set({ dateRange }),

      getFiltered: () => {
        const { catalysts, filterTier, filterTA, searchQuery, sortField, sortDirection, dateRange } = get();
        let filtered = [...catalysts];

        // Date range filter
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + dateRange);
        const now = new Date();
        filtered = filtered.filter(c => {
          const d = new Date(c.date);
          return d >= now && d <= cutoff;
        });

        // Tier filter
        if (filterTier) {
          filtered = filtered.filter(c => c.tier === filterTier);
        }

        // TA filter
        if (filterTA) {
          filtered = filtered.filter(c => c.ta === filterTA);
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(c =>
            c.company.toLowerCase().includes(q) ||
            c.ticker.toLowerCase().includes(q) ||
            c.drug.toLowerCase().includes(q) ||
            c.indication.toLowerCase().includes(q)
          );
        }

        // Sort
        filtered.sort((a, b) => {
          let aVal: any, bVal: any;
          if (sortField === 'date') {
            aVal = new Date(a.date).getTime();
            bVal = new Date(b.date).getTime();
          } else if (sortField === 'prob') {
            aVal = a.prob;
            bVal = b.prob;
          } else {
            aVal = a.ticker;
            bVal = b.ticker;
          }
          const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return sortDirection === 'asc' ? cmp : -cmp;
        });

        return filtered;
      },
    }),
    {
      name: 'catalyst-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ catalysts: state.catalysts, lastFetch: state.lastFetch }),
    }
  )
);
