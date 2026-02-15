// ODIN Mobile — Core Type Definitions

export interface Catalyst {
  id: string;
  date: string;
  company: string;
  ticker: string;
  drug: string;
  indication: string;
  type: 'PDUFA' | 'READOUT' | 'AdCom' | 'sNDA';
  appType?: string;
  ta: string;
  phase?: string;
  designations?: string[];
  prob: number;
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
  signals?: Record<string, number>;
  totalAdj?: number;
  logit?: number;
  notes?: string;
}

export interface VerifiedOutcome {
  ticker: string;
  drug: string;
  indication: string;
  date: string;
  type: string;
  outcome: 'APPROVED' | 'CRL' | 'POSITIVE' | 'MISS' | 'BEAT' | 'DELAYED';
  odinScore: number;
  odinTier: string;
  odinAction: string;
  correct: boolean;
  stockMove: string;
  notes?: string;
}

export interface TimestampedPrediction {
  id: string;
  ticker: string;
  drug: string;
  indication: string;
  timestampUTC: string;
  odinVersion: string;
  prediction: string;
  tier: string;
  priceAtPrediction?: string;
  catalystDate: string;
  catalystType: string;
  outcome: string;
  outcomeDate: string;
  peakGain: string;
  hash?: string | null;
  status: string;
  note?: string;
  originStory?: string;
}

export interface UserPrediction {
  catalystId: string;
  prediction: 'APPROVE' | 'CRL' | 'BEAT' | 'MEET' | 'MISS';
  confidence: 'CONSERVATIVE' | 'STANDARD' | 'AGGRESSIVE';
  votedAt: string;
}

export interface CommunitySentiment {
  catalystId: string;
  approvePct: number;
  totalVotes: number;
}

export interface MarketQuote {
  ticker: string;
  price: number;
  change: number;
  changePct: number;
  marketCap?: number;
  volume?: number;
  lastFetch: number;
}

export interface InsiderTrade {
  date: string;
  insiderName: string;
  title: string;
  action: 'BUY' | 'SELL';
  shares: number;
  pricePerShare: number;
  totalValue: number;
}

export type TabName = 'Catalysts' | 'Watchlist' | 'Predict' | 'TrackRecord' | 'Settings';
export type FilterTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4' | null;
export type SortField = 'date' | 'prob' | 'ticker';
export type SortDirection = 'asc' | 'desc';
