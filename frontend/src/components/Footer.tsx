'use client';

import { ExternalLink } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER, FAUCET, IS_DEPLOYED } from '@/lib/contract';
import { Copyable } from './Copyable';

// A two-block credits-roll strip: the arena identity on one side, the on-chain
// coordinates on the other.
export function Footer() {
  return (
    <footer className="mt-12 border-t border-arena-line bg-arena-bg/80">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-2">
        <div>
          <p className="font-display text-3xl tracking-[0.2em]">
            <span className="text-p1">STRA</span>
            <span className="text-flare">/</span>
            <span className="text-p2">TAGEM</span>
          </p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-arena-fog">
            An on-chain duel of wits. Two sealed tactics, one Referee AI, and a best-of-N match
            settled by validator consensus. No house, no bracket, no bystanders deciding the round.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <span className="font-mono text-[10px] uppercase tracking-widest text-arena-fog">
            arena coordinates
          </span>
          <div className="font-mono text-xs text-arena-chalk">
            {IS_DEPLOYED ? (
              <Copyable value={CONTRACT_ADDRESS} label={CONTRACT_ADDRESS} />
            ) : (
              <span className="text-arena-fog">contract: pending parent deploy</span>
            )}
          </div>
          <a
            href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-p1 hover:underline"
          >
            Bradbury explorer <ExternalLink size={12} />
          </a>
          <a
            href={FAUCET}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-flare hover:underline"
          >
            Testnet faucet <ExternalLink size={12} />
          </a>
        </div>
      </div>
      <div className="border-t border-arena-line/60 py-3 text-center font-mono text-[10px] uppercase tracking-widest text-arena-fog">
        Built on GenLayer {String.fromCharCode(183)} Bradbury Testnet {String.fromCharCode(183)} fees apply to every move
      </div>
    </footer>
  );
}
