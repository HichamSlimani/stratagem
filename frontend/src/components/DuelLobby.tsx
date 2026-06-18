'use client';

import { motion } from 'framer-motion';
import { Duel } from '@/lib/contract';
import { clinchTarget, handle, sameAddr, statusLabel } from '@/lib/format';
import { TicketSkeleton } from './Skeleton';
import { EmptyLobby } from './EmptyState';

function StatusTag({ duel }: { duel: Duel }) {
  const tone =
    duel.status === 'OPEN'
      ? 'border-flare/50 text-flare'
      : duel.status === 'DONE'
        ? 'border-arena-line text-arena-fog'
        : 'border-p1/50 text-p1';
  return (
    <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest ${tone}`}>
      {statusLabel(duel)}
    </span>
  );
}

function MiniPips({ score, target, side }: { score: number; target: number; side: 'p1' | 'p2' }) {
  const color = side === 'p1' ? 'bg-p1' : 'bg-p2';
  return (
    <span className="flex gap-1">
      {Array.from({ length: target }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < score ? color : 'bg-arena-line'}`}
        />
      ))}
    </span>
  );
}

// A "fight-ticket" row, not a uniform grid card: two handles flanking a center
// score strip with a torn-ticket edge.
function FightTicket({
  duel,
  focused,
  address,
  onFocus,
}: {
  duel: Duel;
  focused: boolean;
  address: string | null;
  onFocus: () => void;
}) {
  const target = clinchTarget(duel.rounds);
  const mine = sameAddr(duel.p1, address) || sameAddr(duel.p2, address);

  return (
    <motion.button
      layout
      onClick={onFocus}
      whileHover={{ y: -2 }}
      className={`clip-ticket grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 border bg-arena-panel/70 px-4 py-3 text-left transition ${focused ? 'border-flare glow-flare' : 'border-arena-line hover:border-arena-fog'}`}
    >
      <div className="min-w-0">
        <p className="truncate font-mono text-sm text-p1">{handle(duel.p1)}</p>
        <MiniPips score={duel.p1Score} target={target} side="p1" />
      </div>
      <div className="flex flex-col items-center">
        <span className="font-display text-lg tracking-widest text-arena-fog">VS</span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-arena-fog">
          bo{duel.rounds}
        </span>
      </div>
      <div className="min-w-0 text-right">
        <p className="truncate font-mono text-sm text-p2">{handle(duel.p2)}</p>
        <span className="flex justify-end">
          <MiniPips score={duel.p2Score} target={target} side="p2" />
        </span>
      </div>
      <div className="col-span-3 mt-1 flex items-center justify-between border-t border-arena-line/60 pt-2">
        <span className="truncate font-body text-xs text-arena-chalk">{duel.title}</span>
        <span className="flex shrink-0 items-center gap-1">
          {mine && (
            <span className="font-mono text-[9px] uppercase tracking-widest text-flare">yours</span>
          )}
          <StatusTag duel={duel} />
        </span>
      </div>
    </motion.button>
  );
}

export function DuelLobby({
  duels,
  loading,
  focusedId,
  address,
  onFocus,
  onCallFirst,
}: {
  duels: Duel[];
  loading: boolean;
  focusedId: string | null;
  address: string | null;
  onFocus: (id: string) => void;
  onCallFirst: () => void;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <TicketSkeleton />
        <TicketSkeleton />
        <TicketSkeleton />
      </div>
    );
  }

  if (duels.length === 0) {
    return <EmptyLobby onOpen={onCallFirst} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {duels.map((d) => (
        <FightTicket
          key={d.id}
          duel={d}
          focused={d.id === focusedId}
          address={address}
          onFocus={() => onFocus(d.id)}
        />
      ))}
    </div>
  );
}
