'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Loader2 } from 'lucide-react';
import { TxState } from '@/hooks/useTransaction';
import { EXPLORER } from '@/lib/contract';

// Honest, plain-language status names streamed while a write settles.
const PHASE_COPY: Record<string, string> = {
  wallet: 'Waiting on your wallet signature',
  submitted: 'Move submitted to Bradbury',
  consensus: 'Validators are adjudicating the clash',
  confirmed: 'Ruling confirmed on chain',
  error: 'The clash did not settle',
};

function Bar({ active, done }: { active: boolean; done: boolean }) {
  return (
    <div className="h-1 flex-1 overflow-hidden rounded-full bg-arena-line">
      <motion.div
        className="h-full bg-gradient-to-r from-p1 to-p2"
        initial={{ width: '0%' }}
        animate={{ width: done ? '100%' : active ? '60%' : '0%' }}
        transition={{ duration: 0.6 }}
      />
    </div>
  );
}

// A live overlay that narrates the full tx lifecycle and, during a clash,
// streams the leader draft (winner / margin / ruling) as it arrives.
export function ConsensusReveal({ tx, onClose }: { tx: TxState; onClose: () => void }) {
  const show = tx.phase !== 'idle';
  const order = ['wallet', 'submitted', 'consensus', 'confirmed'];
  const idx = order.indexOf(tx.phase === 'error' ? 'consensus' : tx.phase);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Transaction status"
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-arena-line bg-arena-panel p-6"
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 16 }}
          >
            <div className="mb-5 flex items-center gap-2">
              {tx.phase !== 'confirmed' && tx.phase !== 'error' && (
                <Loader2 size={18} className="animate-spin text-p1" />
              )}
              <h3 className="font-display text-2xl tracking-wide text-arena-chalk">
                {PHASE_COPY[tx.phase] ?? 'Working'}
              </h3>
            </div>

            <div className="mb-4 flex items-center gap-1.5">
              {order.map((_, i) => (
                <Bar key={i} active={i === idx && tx.phase !== 'confirmed'} done={i < idx || tx.phase === 'confirmed'} />
              ))}
            </div>

            {tx.liveStatus && tx.phase !== 'error' && (
              <p className="mb-3 font-mono text-xs text-arena-fog">
                chain status: <span className="text-arena-chalk">{tx.liveStatus}</span>
              </p>
            )}

            {/* leader-draft peek streaming the round result */}
            <AnimatePresence>
              {tx.draft && tx.draft.winner && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-3 rounded-xl border border-flare/30 bg-arena-bg p-3"
                >
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-flare">
                    leader draft (pending validator agreement)
                  </p>
                  <p className="text-sm text-arena-chalk">
                    Leaning{' '}
                    <span
                      className={
                        tx.draft.winner === 'P1'
                          ? 'text-p1'
                          : tx.draft.winner === 'P2'
                            ? 'text-p2'
                            : 'text-flare'
                      }
                    >
                      {tx.draft.winner}
                    </span>
                    {tx.draft.margin != null ? ` by ${tx.draft.margin}` : ''}
                  </p>
                  {tx.draft.ruling && (
                    <p className="mt-1 text-xs italic leading-snug text-arena-fog">
                      &ldquo;{tx.draft.ruling}&rdquo;
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {tx.error && (
              <p className="mb-3 rounded-lg border border-p2/40 bg-p2/5 px-3 py-2 text-sm text-arena-chalk">
                {tx.error}
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              {tx.hash ? (
                <a
                  href={`${EXPLORER}/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs text-p1 hover:underline"
                >
                  view tx <ExternalLink size={12} />
                </a>
              ) : (
                <span />
              )}
              {(tx.phase === 'confirmed' || tx.phase === 'error') && (
                <button
                  onClick={onClose}
                  className="rounded-lg bg-arena-chalk px-4 py-2 text-sm font-bold text-black transition hover:bg-white"
                >
                  {tx.phase === 'confirmed' ? 'Back to the arena' : 'Close'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
