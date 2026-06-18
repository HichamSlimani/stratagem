'use client';

import { Swords } from 'lucide-react';

// Bespoke empty state in Stratagem's own voice (never a generic "No items yet").
export function EmptyLobby({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-arena-line bg-arena-panel/40 px-6 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-arena-line">
        <Swords size={24} className="text-flare" />
      </div>
      <h3 className="mb-2 font-display text-3xl tracking-wide text-arena-chalk">
        The chalk circle is empty
      </h3>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-arena-fog">
        No duels have been called yet. Name a premise, set the rounds, and stand in the left corner.
        The first challenger to answer takes the right.
      </p>
      <button
        onClick={onOpen}
        className="rounded-lg bg-gradient-to-r from-p1 to-p2 px-5 py-2.5 text-sm font-bold text-black transition hover:opacity-90"
      >
        Call the first duel
      </button>
    </div>
  );
}
