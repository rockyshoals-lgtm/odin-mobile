// ODIN Mobile — API Configuration
// Keys are embedded for beta testing; move to env vars for production

const API_CONFIG = {
  FMP_API_KEY: 'kyI0t6mDZD1YBTfxtKZSgkp6eILZR3v6',
  FINNBRAIN_API_KEY: '5813fe19-a03c-4873-a7be-354315c39b80',
  POLYGON_API_KEY: 'mJv1CAmZy15o5bkz_tFqcVoUh3KGjppp',

  // Base URLs
  FMP_BASE_URL: 'https://financialmodelingprep.com/stable',  // FMP stable API (v3 is legacy)
  FINNBRAIN_BASE_URL: 'https://api.finnbrain.io/v1',

  // Cache TTLs (ms)
  CACHE_QUOTE_TTL: 5 * 60 * 1000,        // 5 min for stock quotes
  CACHE_PROFILE_TTL: 60 * 60 * 1000,     // 1 hour for company profiles
  CACHE_TECHNICAL_TTL: 15 * 60 * 1000,   // 15 min for technicals

  // Feature Flags
  ENABLE_LIVE_PRICES: true,
  ENABLE_OPTIONS: true,
  ENABLE_PAPER_TRADING: true,

  // Paper trading
  STARTING_BALANCE: 100_000,
  RISK_FREE_RATE: 0.05,                  // 5% for Black-Scholes
} as const;

export default API_CONFIG;
