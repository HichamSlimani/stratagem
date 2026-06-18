'use client';

import { Wallet, LogOut, Droplets, AlertTriangle } from 'lucide-react';
import { WalletState } from '@/hooks/useWallet';
import { shortAddr } from '@/lib/format';
import { FAUCET } from '@/lib/contract';

// A compact wallet chip meant to tuck into the scoreboard corner, not a full
// brand-left / wallet-right top bar.
export function WalletControl({ wallet }: { wallet: WalletState }) {
  const { address, balance, connecting, onChain, connect, disconnect } = wallet;

  if (!address) {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className="inline-flex items-center gap-2 rounded-full border border-p1/50 bg-p1/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-p1 transition hover:bg-p1/20 disabled:opacity-60"
      >
        <Wallet size={14} />
        {connecting ? 'Linking...' : 'Connect wallet'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <a
        href={FAUCET}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden items-center gap-1.5 rounded-full border border-flare/40 px-3 py-1.5 text-xs font-semibold text-flare transition hover:bg-flare/10 sm:inline-flex"
        title="Open the Bradbury faucet"
      >
        <Droplets size={13} /> Faucet
      </a>
      <div className="flex flex-col items-end rounded-full border border-arena-line bg-arena-bg/80 px-3 py-1.5">
        <span className="font-mono text-xs text-arena-chalk">{shortAddr(address, 4)}</span>
        <span className="font-mono text-[10px] text-arena-fog">
          {balance != null ? `${balance} GEN` : '...'}
        </span>
      </div>
      {!onChain && (
        <span
          className="inline-flex items-center gap-1 rounded-full border border-p2/50 px-2 py-1 text-[10px] font-bold uppercase text-p2"
          title="Switch your wallet to Bradbury Testnet"
        >
          <AlertTriangle size={12} /> Wrong net
        </span>
      )}
      <button
        onClick={disconnect}
        className="rounded-full border border-arena-line p-2 text-arena-fog transition hover:border-p2/50 hover:text-p2"
        aria-label="Disconnect wallet"
        title="Disconnect"
      >
        <LogOut size={14} />
      </button>
    </div>
  );
}
