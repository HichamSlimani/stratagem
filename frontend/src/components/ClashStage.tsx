'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Lock, Check, Swords, UserPlus, Crown, Trophy, Hourglass } from 'lucide-react';
import { Duel, HistoryEntry } from '@/lib/contract';
import { clinchTarget, handle, sameAddr, seatOf } from '@/lib/format';

function lastResolved(duel: Duel): HistoryEntry | null {
  return duel.history.length ? duel.history[duel.history.length - 1] : null;
}

// The central clash meter: a needle pivoting from center toward the winning
// side, its travel proportional to the round margin. A DRAW holds at center.
function MarginMeter({ entry }: { entry: HistoryEntry | null }) {
  let pct = 50; // center
  if (entry && entry.winner === 'P1') pct = 50 - (entry.margin / 100) * 46;
  if (entry && entry.winner === 'P2') pct = 50 + (entry.margin / 100) * 46;

  return (
    <div className="w-full">
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-arena-grid">
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-p1/30 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-p2/30 to-transparent" />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-arena-fog/40" />
        <motion.div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full glow-flare"
          style={{
            background:
              entry?.winner === 'P1'
                ? '#2ce6e6'
                : entry?.winner === 'P2'
                  ? '#ff3da6'
                  : '#ffe23d',
          }}
          initial={false}
          animate={{ left: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
        <span className="text-p1">P1</span>
        <span className="text-flare">
          {entry ? `${entry.winner} +${entry.margin}` : 'awaiting clash'}
        </span>
        <span className="text-p2">P2</span>
      </div>
    </div>
  );
}

function SideCommit({
  side,
  sealed,
  active,
}: {
  side: 'P1' | 'P2';
  sealed: boolean;
  active: boolean;
}) {
  const color = side === 'P1' ? 'text-p1' : 'text-p2';
  if (!active) {
    return <span className="font-mono text-[11px] uppercase tracking-widest text-arena-fog">idle</span>;
  }
  return sealed ? (
    <span className={`inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest ${color}`}>
      <Lock size={12} /> sealed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-widest text-arena-fog">
      <Hourglass size={12} /> thinking
    </span>
  );
}

export function ClashStage({
  duel,
  address,
  busy,
  onJoin,
  onSeal,
  onClash,
}: {
  duel: Duel | null;
  address: string | null;
  busy: boolean;
  onJoin: () => void;
  onSeal: (side: 'P1' | 'P2') => void;
  onClash: () => void;
}) {
  if (!duel) {
    return (
      <div className="rounded-2xl border border-arena-line bg-arena-panel/50 p-10 text-center">
        <Swords size={28} className="mx-auto mb-3 text-flare" />
        <h2 className="font-display text-3xl tracking-wide text-arena-chalk">No duel in the ring</h2>
        <p className="mt-2 text-sm text-arena-fog">
          Pick a fight ticket below, or call a fresh duel to take the left corner.
        </p>
      </div>
    );
  }

  const seat = seatOf(duel, address);
  const target = clinchTarget(duel.rounds);
  const entry = lastResolved(duel);
  const bothSealed = duel.pendingP1 && duel.pendingP2;
  const isDone = duel.status === 'DONE';
  const isOpen = duel.status === 'OPEN';
  const isActive = duel.status === 'ACTIVE';

  const youSealed =
    (seat === 'P1' && duel.pendingP1) || (seat === 'P2' && duel.pendingP2);

  return (
    <section
      aria-label="Live duel stage"
      className="overflow-hidden rounded-2xl border border-arena-line bg-arena-panel/60"
    >
      <div className="border-b border-arena-line px-5 py-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-arena-fog">
          {duel.id} {String.fromCharCode(183)} best of {duel.rounds} {String.fromCharCode(183)}{' '}
          {isDone ? 'settled' : isOpen ? 'open' : `round ${duel.currentRound}`}
        </p>
        <h2 className="mt-1 font-display text-2xl leading-tight tracking-wide text-arena-chalk sm:text-3xl">
          {duel.title}
        </h2>
      </div>

      <div className="grid grid-cols-2">
        {/* P1 side */}
        <div className="relative border-r border-arena-line bg-gradient-to-b from-p1/10 to-transparent p-5">
          <div className="flex items-center gap-1.5 text-p1">
            <span className="font-display text-xl tracking-widest">P1</span>
            {duel.winner === 'P1' && <Crown size={16} className="text-flare" />}
          </div>
          <p className="mt-1 font-mono text-xs text-arena-chalk">{handle(duel.p1)}</p>
          {sameAddr(duel.p1, address) && (
            <span className="mt-1 inline-block rounded-full bg-p1/15 px-2 py-0.5 font-mono text-[10px] uppercase text-p1">
              your corner
            </span>
          )}
          <p className="mt-4 font-display text-5xl text-p1">{duel.p1Score}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-arena-fog">
            of {target} to clinch
          </p>
          <div className="mt-3">
            <SideCommit side="P1" sealed={duel.pendingP1} active={isActive} />
          </div>
        </div>

        {/* P2 side */}
        <div className="relative bg-gradient-to-b from-p2/10 to-transparent p-5 text-right">
          <div className="flex items-center justify-end gap-1.5 text-p2">
            {duel.winner === 'P2' && <Crown size={16} className="text-flare" />}
            <span className="font-display text-xl tracking-widest">P2</span>
          </div>
          <p className="mt-1 font-mono text-xs text-arena-chalk">{handle(duel.p2)}</p>
          {sameAddr(duel.p2, address) && (
            <span className="mt-1 inline-block rounded-full bg-p2/15 px-2 py-0.5 font-mono text-[10px] uppercase text-p2">
              your corner
            </span>
          )}
          <p className="mt-4 font-display text-5xl text-p2">{duel.p2Score}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-arena-fog">
            of {target} to clinch
          </p>
          <div className="mt-3 flex justify-end">
            <SideCommit side="P2" sealed={duel.pendingP2} active={isActive} />
          </div>
        </div>
      </div>

      {/* central clash meter */}
      <div className="border-t border-arena-line px-5 py-5">
        <MarginMeter entry={entry} />
        {entry && (
          <p className="mt-3 text-center text-xs italic leading-snug text-arena-fog">
            Round {entry.round}: &ldquo;{entry.ruling}&rdquo;
          </p>
        )}
      </div>

      {/* action footer */}
      <div className="border-t border-arena-line bg-arena-bg/60 px-5 py-4">
        <AnimatePresence mode="wait">
          {isDone ? (
            <motion.div
              key="done"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-flare"
            >
              <Trophy size={18} />
              <span className="font-display text-2xl tracking-wide">
                {duel.winner} takes the match
              </span>
            </motion.div>
          ) : isOpen ? (
            <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2">
              {sameAddr(duel.p1, address) ? (
                <p className="text-sm text-arena-fog">
                  You hold the left corner. Waiting for a challenger to answer.
                </p>
              ) : (
                <button
                  onClick={onJoin}
                  disabled={busy || !address}
                  className="inline-flex items-center gap-2 rounded-lg bg-p2 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-p2/90 disabled:opacity-50"
                >
                  <UserPlus size={16} /> {address ? 'Take the right corner' : 'Connect to challenge'}
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
              {seat && !youSealed && (
                <button
                  onClick={() => onSeal(seat)}
                  disabled={busy}
                  className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-black transition disabled:opacity-50 ${seat === 'P1' ? 'bg-p1 hover:bg-p1/90' : 'bg-p2 hover:bg-p2/90'}`}
                >
                  <Lock size={16} /> Seal your move for round {duel.currentRound}
                </button>
              )}
              {seat && youSealed && (
                <p className="inline-flex items-center gap-2 text-sm text-arena-chalk">
                  <Check size={16} className="text-p1" /> Your move is sealed. Hidden until both
                  corners commit.
                </p>
              )}
              {!seat && (
                <p className="text-sm text-arena-fog">
                  You are spectating this duel. Only the two corners can seal moves.
                </p>
              )}
              {bothSealed && (
                <button
                  onClick={onClash}
                  disabled={busy || !address}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-p1 to-p2 px-6 py-2.5 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-50 animate-clashpulse"
                >
                  <Swords size={16} /> Run the clash
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
