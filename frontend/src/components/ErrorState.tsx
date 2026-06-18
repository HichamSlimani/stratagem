'use client';

import { RefreshCw, ExternalLink, Radio } from 'lucide-react';
import { CONTRACT_ADDRESS, EXPLORER } from '@/lib/contract';

export function ErrorState({
  message,
  diagnostic,
  onRetry,
}: {
  message: string;
  diagnostic: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-p2/40 bg-arena-panel/70 p-8 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-p2/50 text-p2">
        <Radio size={22} />
      </div>
      <h3 className="mb-2 font-display text-2xl tracking-wide text-arena-chalk">
        The arena feed dropped
      </h3>
      <p className="mb-5 text-sm leading-relaxed text-arena-fog">{message}</p>
      {diagnostic && (
        <p className="mb-5 break-all rounded-lg border border-arena-line bg-arena-bg px-3 py-2 font-mono text-xs text-arena-fog">
          configured address: {CONTRACT_ADDRESS}
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-p1 px-4 py-2 text-sm font-bold text-black transition hover:bg-p1/90"
        >
          <RefreshCw size={15} /> Retry the feed
        </button>
        <a
          href={`${EXPLORER}/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-arena-line px-4 py-2 text-sm font-semibold text-arena-fog transition hover:border-arena-fog hover:text-arena-chalk"
        >
          Open explorer <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
