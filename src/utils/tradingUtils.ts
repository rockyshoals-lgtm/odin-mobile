// ODIN Mobile — Trading Formatting & Helper Utilities

export function fmtDollar(amount: number): string {
  if (Math.abs(amount) >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (Math.abs(amount) >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}

export function fmtPnL(amount: number): string {
  const sign = amount >= 0 ? '+' : '';
  return `${sign}${fmtDollar(amount)}`;
}

export function fmtPnLPct(pct: number): string {
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function fmtPrice(price: number): string {
  return `$${price.toFixed(2)}`;
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
