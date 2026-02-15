// ODIN Mobile — Formatting Utilities

export function fmtProb(prob: number): string {
  return `${(prob * 100).toFixed(1)}%`;
}

export function fmtProbInt(prob: number): string {
  return `${Math.round(prob * 100)}%`;
}

export function fmtDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function fmtDateFull(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function fmtDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = d.getDate();
  return `${month} ${day}`;
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function fmtDaysUntil(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days === 0) return 'TODAY';
  if (days === 1) return 'TOMORROW';
  if (days < 0) return `${Math.abs(days)}d AGO`;
  return `${days}d`;
}

export function fmtMoney(amount: number): string {
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`;
  return `$${amount.toFixed(2)}`;
}

export function fmtChange(changePct: number): string {
  const sign = changePct >= 0 ? '+' : '';
  return `${sign}${changePct.toFixed(2)}%`;
}
