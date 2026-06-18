'use client';

import { motion } from 'framer-motion';
import { Duel } from '@/lib/contract';
import { clinchTarget, handle, sameAddr } from '@/lib/format';
import { WalletState } from '@/hooks/useWallet';
import { WalletControl } from './WalletControl';

// Best-of-N score pips for one side. Filled pips are won rounds; the target pip
// that would clinch the match gets a flare ring.
function Pips({ score, target, side }: { score: number; target: number; side: 'p1' | 'p2' }) {
  const color = side === 'p1' ? 'bg-p1' : 'bg-p2';
  const ring = side === 'p1' ? 'ring-p1/40' : 'ring-p2/40';
  return (
    <div className="flex items-center gap-1.5" aria-label={`${side} score ${score} of ${target}`}>
      {Array.from({ length: target }).map((_, i) => {
        const won = i < score;
        return (
          <motion.span
            key={i}
            initial={false}
            animate={{ scale: won ? 1 : 0.7, opacity: won ? 1 : 0.35 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className={`h-2.5 w-2.5 rounded-full ${won ? color : 'bg-arena-line'} ${i === target - 1 ? `ring-2 ${ring} ring-offset-2 ring-offset-arena-bg` : ''}`}
          />
        );
      })}
    </div>
  );
}

export function Scoreboard({
  duel,
  wallet,
}: {
  duel: Duel | null;
  wallet: WalletState;
}) {
  const target = duel ? clinchTarget(duel.rounds) : 0;
  const youP1 = duel ? sameAddr(duel.p1, wallet.address) : false;
  const youP2 = duel ? sameAddr(duel.p2, wallet.address) : false;

  return (
    <header className="sticky top-0 z-50 border-b border-arena-line bg-arena-bg/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3">
        {/* P1 flank (left) */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-p1">
              P1 {youP1 ? '(you)' : ''}
            </span>
            <span className="font-mono text-sm text-arena-chalk">
              {duel ? handle(duel.p1) : 'left corner'}
            </span>
          </div>
          {duel && <Pips score={duel.p1Score} target={target} side="p1" />}
        </div>

        {/* center: wordmark + best-of-N */}
        <div className="flex flex-col items-center">
          <span className="font-display text-2xl leading-none tracking-[0.25em] text-arena-chalk">
            <span className="text-p1">STRA</span>
            <span className="text-flare">/</span>
            <span className="text-p2">TAGEM</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-arena-fog">
            {duel ? `best of ${duel.rounds}` : 'duel of wits'}
          </span>
        </div>

        {/* P2 flank (right) + wallet corner chip */}
        <div className="flex items-center justify-end gap-3">
          {duel && <Pips score={duel.p2Score} target={target} side="p2" />}
          <div className="hidden flex-col text-right sm:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-p2">
              {youP2 ? '(you) ' : ''}P2
            </span>
            <span className="font-mono text-sm text-arena-chalk">
              {duel ? handle(duel.p2) : 'right corner'}
            </span>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 border-t border-arena-line/60 px-4 py-2">
        <span className="truncate font-body text-xs text-arena-fog">
          {duel ? duel.title : 'Seal a tactic. Let the Referee AI settle the clash on chain.'}
        </span>
        <WalletControl wallet={wallet} />
      </div>
    </header>
  );
}
