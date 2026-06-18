'use client';

import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { ALLOWED_ROUNDS, TITLE_LIMIT } from '@/lib/contract';

export function OpenDuelForm({
  busy,
  canWrite,
  onOpen,
}: {
  busy: boolean;
  canWrite: boolean;
  onOpen: (title: string, rounds: number) => void;
}) {
  const [title, setTitle] = useState('');
  const [rounds, setRounds] = useState<number>(3);

  const len = title.trim().length;
  const valid = len >= TITLE_LIMIT.min && len <= TITLE_LIMIT.max;

  return (
    <div className="rounded-2xl border border-arena-line bg-arena-panel/60 p-5">
      <div className="mb-3 flex items-center gap-2">
        <Megaphone size={18} className="text-flare" />
        <h3 className="font-display text-2xl tracking-wide text-arena-chalk">Call a new duel</h3>
      </div>
      <label htmlFor="title" className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-arena-fog">
        premise
      </label>
      <input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={TITLE_LIMIT.max}
        placeholder="e.g. Break a year-long siege without losing the garrison"
        className="w-full rounded-lg border border-arena-line bg-arena-bg px-3 py-2.5 font-body text-sm text-arena-chalk outline-none transition focus:border-flare"
      />
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-arena-fog">
            rounds
          </span>
          <div className="flex gap-2">
            {ALLOWED_ROUNDS.map((r) => (
              <button
                key={r}
                onClick={() => setRounds(r)}
                className={`rounded-lg border px-4 py-2 font-display text-xl tracking-widest transition ${rounds === r ? 'border-flare bg-flare/15 text-flare' : 'border-arena-line text-arena-fog hover:border-arena-fog'}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono text-xs text-arena-fog">
            {len}/{TITLE_LIMIT.max}
          </span>
          <button
            onClick={() => onOpen(title.trim(), rounds)}
            disabled={!valid || busy || !canWrite}
            className="rounded-lg bg-gradient-to-r from-p1 to-p2 px-5 py-2.5 text-sm font-bold text-black transition hover:opacity-90 disabled:opacity-50"
            title={!canWrite ? 'Connect a wallet to open a duel' : undefined}
          >
            Open duel as P1
          </button>
        </div>
      </div>
    </div>
  );
}
