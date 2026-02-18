import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Catalyst, FilterTier, SortField, SortDirection } from '../constants/types';

type CatalystType = 'PDUFA' | 'READOUT' | 'Earnings' | null;

interface CatalystState {
  catalysts: Catalyst[];
  filterTier: FilterTier;
  filterTA: string | null;
  filterType: CatalystType;
  searchQuery: string;
  sortField: SortField;
  sortDirection: SortDirection;
  dateRange: 30 | 60 | 90 | 180 | 365;
  lastFetch: number;

  setCatalysts: (catalysts: Catalyst[]) => void;
  setFilterTier: (tier: FilterTier) => void;
  setFilterTA: (ta: string | null) => void;
  setFilterType: (type: CatalystType) => void;
  setSearchQuery: (query: string) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (dir: SortDirection) => void;
  setDateRange: (range: 30 | 60 | 90 | 180 | 365) => void;
  getFiltered: () => Catalyst[];
}

export const useCatalystStore = create<CatalystState>()(
  persist(
    (set, get) => ({
      catalysts: [],
      filterTier: null,
      filterTA: null,
      filterType: null,
      searchQuery: '',
      sortField: 'date',
      sortDirection: 'asc',
      dateRange: 60,
      lastFetch: 0,

      setCatalysts: (catalysts) => set({ catalysts, lastFetch: Date.now() }),
      setFilterTier: (filterTier) => set({ filterTier }),
      setFilterTA: (filterTA) => set({ filterTA }),
      setFilterType: (filterType) => set({ filterType }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSortField: (sortField) => set({ sortField }),
      setSortDirection: (sortDirection) => set({ sortDirection }),
      setDateRange: (dateRange) => set({ dateRange }),

      getFiltered: () => {
        const { catalysts, filterTier, filterTA, filterType, searchQuery, sortField, sortDirection, dateRange } = get();
        let filtered = [...catalysts];

        // Date range filter — only show upcoming events
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + dateRange);
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        // PDUFAs: keep up to 3 days past (decision may still be pending)
        // Others: only future
        filtered = filtered.filter(c => {
          const d = new Date(c.date + 'T00:00:00');
          if (d > cutoff) return false;
          if (c.type === 'PDUFA') {
            const pastLimit = new Date(now);
            pastLimit.setDate(pastLimit.getDate() - 3);
            return d >= pastLimit;
          }
          return d >= now;
        });

        // Type filter
        if (filterType) {
          filtered = filtered.filter(c => c.type === filterType);
        }

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
