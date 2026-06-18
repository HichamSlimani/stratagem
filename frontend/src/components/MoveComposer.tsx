'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EyeOff, Lock, X } from 'lucide-react';
import { MOVE_LIMIT } from '@/lib/contract';

export interface ComposerTarget {
  duelId: string;
  side: 'P1' | 'P2';
  title: string;
  round: number;
}

export function MoveComposer({
  target,
  busy,
  onSubmit,
  onClose,
}: {
  target: ComposerTarget | null;
  busy: boolean;
  onSubmit: (move: string) => void;
  onClose: () => void;
}) {
  const [move, setMove] = useState('');

  useEffect(() => {
    if (target) setMove('');
  }, [target]);

  const len = move.trim().length;
  const valid = len >= MOVE_LIMIT.min && len <= MOVE_LIMIT.max;
  const accent = target?.side === 'P1' ? 'p1' : 'p2';

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-3 pb-3"
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        >
          <div
            className={`w-full max-w-2xl rounded-2xl border bg-arena-panel p-5 shadow-2xl ${accent === 'p1' ? 'border-p1/50 glow-p1' : 'border-p2/50 glow-p2'}`}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${accent === 'p1' ? 'text-p1' : 'text-p2'}`}>
                  sealing as {target.side} {String.fromCharCode(183)} round {target.round}
                </p>
                <h3 className="font-display text-2xl tracking-wide text-arena-chalk">
                  {target.title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-arena-line p-1.5 text-arena-fog transition hover:text-arena-chalk"
                aria-label="Close composer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-2 flex items-center gap-2 rounded-lg border border-arena-line bg-arena-bg px-3 py-2 text-xs text-arena-fog">
              <EyeOff size={14} className="shrink-0 text-flare" />
              Your tactic stays concealed in the views until both corners commit. Then the Referee
              AI judges both at once.
            </div>

            <label htmlFor="move" className="sr-only">
              Your sealed tactic
            </label>
            <textarea
              id="move"
              value={move}
              onChange={(e) => setMove(e.target.value)}
              maxLength={MOVE_LIMIT.max}
              rows={4}
              placeholder="Lay out the concealed tactic you would deploy. Be specific and decisive."
              className="w-full resize-none rounded-lg border border-arena-line bg-arena-bg px-3 py-2.5 font-body text-sm text-arena-chalk outline-none transition focus:border-flare"
            />
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`font-mono text-xs ${len > MOVE_LIMIT.max ? 'text-p2' : 'text-arena-fog'}`}
              >
                {len}/{MOVE_LIMIT.max}
              </span>
              <button
                onClick={() => onSubmit(move.trim())}
                disabled={!valid || busy}
                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-bold text-black transition disabled:opacity-50 ${accent === 'p1' ? 'bg-p1 hover:bg-p1/90' : 'bg-p2 hover:bg-p2/90'}`}
              >
                <Lock size={15} /> Seal this move
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
