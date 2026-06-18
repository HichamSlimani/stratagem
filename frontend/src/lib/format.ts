import { Duel, Side } from './contract';

export function shortAddr(addr: string | null | undefined, size = 4): string {
  if (!addr) return '';
  const a = String(addr);
  if (a.length <= size * 2 + 2) return a;
  return `${a.slice(0, size + 2)}...${a.slice(-size)}`;
}

export function figure(n: number): string {
  if (!Number.isFinite(n)) return '0';
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function sameAddr(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

// A duelist handle: a short hex tag, or a placeholder for an empty seat.
export function handle(addr: string | null | undefined): string {
  if (!addr) return 'open seat';
  return shortAddr(addr, 3);
}

// The seat the connected wallet holds in a given duel, or null for spectators.
export function seatOf(duel: Duel, address: string | null | undefined): Side | null {
  if (sameAddr(duel.p1, address)) return 'P1';
  if (sameAddr(duel.p2, address)) return 'P2';
  return null;
}

// Pips required to clinch a best-of-N match.
export function clinchTarget(rounds: number): number {
  return Math.floor(rounds / 2) + 1;
}

export function statusLabel(duel: Duel): string {
  if (duel.status === 'OPEN') return 'Awaiting a challenger';
  if (duel.status === 'DONE') return 'Match settled';
  return `Round ${duel.currentRound} live`;
}

// How many sealed moves are in for the live round (0, 1, or 2).
export function sealedCount(duel: Duel): number {
  return (duel.pendingP1 ? 1 : 0) + (duel.pendingP2 ? 1 : 0);
}
