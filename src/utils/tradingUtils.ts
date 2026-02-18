// ODIN Mobile — Trading Formatting & Helper Utilities

export function fmtDollar(amount: number | undefined | null): string {
  const val = amount ?? 0;
  if (Math.abs(val) >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  if (Math.abs(val) >= 1e3) return `$${(val / 1e3).toFixed(1)}K`;
  return `$${val.toFixed(2)}`;
}

export function fmtPnL(amount: number | undefined | null): string {
  const val = amount ?? 0;
  const sign = val >= 0 ? '+' : '';
  return `${sign}${fmtDollar(val)}`;
}

export function fmtPnLPct(pct: number | undefined | null): string {
  const val = pct ?? 0;
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

export function fmtPrice(price: number | undefined | null): string {
  const val = price ?? 0;
  return `$${val.toFixed(2)}`;
}

export function fmtGreek(value: number, type: 'delta' | 'gamma' | 'theta' | 'vega'): string {
  switch (type) {
    case 'delta': return value.toFixed(3);
    case 'gamma': return value.toFixed(4);
    case 'theta': return `$${value.toFixed(3)}/day`;
    case 'vega': return `$${value.toFixed(3)}`;
    default: return value.toFixed(3);
  }
}

export function fmtIV(iv: number): string {
  return `${(iv * 100).toFixed(1)}%`;
}

export function fmtShares(qty: number): string {
  return `${qty} share${qty !== 1 ? 's' : ''}`;
}

export function fmtContracts(qty: number): string {
  return `${qty} contract${qty !== 1 ? 's' : ''} (${qty * 100} shares)`;
}

export function fmtMarketCap(cap: number): string {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(0)}M`;
  return `$${cap.toLocaleString()}`;
}

export function pnlColor(value: number): string {
  if (value > 0) return '#22c55e';
  if (value < 0) return '#ef4444';
  return '#6b7280';
}

export function maxSharesAtPrice(balance: number, price: number): number {
  if (price <= 0) return 0;
  return Math.floor(balance / price);
}

export function calculateOrderCost(quantity: number, price: number): number {
  return Math.round(quantity * price * 100) / 100;
}
