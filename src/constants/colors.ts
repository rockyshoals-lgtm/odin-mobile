// ODIN Mobile — Theme & Tier Colors
// Matches pdufa.bio web dark terminal aesthetic

export const COLORS = {
  // Background layers
  bg: '#030712',          // gray-950
  bgCard: '#0f1117',      // slightly lighter for cards
  bgElevated: '#1a1d27',  // bottom sheets, modals
  bgInput: '#1f2937',     // input fields, search bars

  // Text
  textPrimary: '#f9fafb',   // gray-50
  textSecondary: '#9ca3af', // gray-400
  textMuted: '#6b7280',     // gray-500
  textDisabled: '#4b5563',  // gray-600

  // Borders
  border: '#1f2937',        // gray-800
  borderLight: '#374151',   // gray-700
  borderFocus: '#3b82f6',   // blue-500

  // Tier colors
  tier1: '#22c55e',  // green-500
  tier2: '#eab308',  // yellow-500
  tier3: '#f97316',  // orange-500
  tier4: '#ef4444',  // red-500

  // Tier backgrounds (20% opacity)
  tier1Bg: 'rgba(34, 197, 94, 0.15)',
  tier2Bg: 'rgba(234, 179, 8, 0.15)',
  tier3Bg: 'rgba(249, 115, 22, 0.15)',
  tier4Bg: 'rgba(239, 68, 68, 0.15)',

  // Accent
  accent: '#3b82f6',      // blue-500
  accentLight: '#60a5fa', // blue-400
  accentBg: 'rgba(59, 130, 246, 0.15)',

  // CEWS
  cews: '#a855f7',         // purple-500
  cewsBg: 'rgba(168, 85, 247, 0.15)',

  // Catalyst type colors
  earnings: '#06b6d4',     // cyan-500
  earningsBg: 'rgba(6, 182, 212, 0.15)',
  readout: '#a855f7',      // purple-500
  readoutBg: 'rgba(168, 85, 247, 0.15)',
  pdufa: '#3b82f6',        // blue-500
  pdufaBg: 'rgba(59, 130, 246, 0.15)',

  // Outcome colors
  approve: '#22c55e',
  crl: '#ef4444',
  delayed: '#eab308',

  // ODIN coins
  coin: '#f59e0b',        // amber-500
  coinBg: 'rgba(245, 158, 11, 0.15)',

  // Status
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
} as const;

export const TIER_CONFIG = {
  TIER_1: { color: COLORS.tier1, bg: COLORS.tier1Bg, label: 'T1', fullLabel: 'TIER 1' },
  TIER_2: { color: COLORS.tier2, bg: COLORS.tier2Bg, label: 'T2', fullLabel: 'TIER 2' },
  TIER_3: { color: COLORS.tier3, bg: COLORS.tier3Bg, label: 'T3', fullLabel: 'TIER 3' },
  TIER_4: { color: COLORS.tier4, bg: COLORS.tier4Bg, label: 'T4', fullLabel: 'TIER 4' },
  CEWS_OVERRIDE: { color: COLORS.cews, bg: COLORS.cewsBg, label: 'CEWS', fullLabel: 'CEWS OVERRIDE' },
} as const;

export const FONTS = {
  mono: 'JetBrainsMono',
  monoFallback: 'Courier',
  body: 'Inter',
  bodyFallback: 'System',
} as const;

export type TierKey = keyof typeof TIER_CONFIG;
