'use client';

import { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useArenaData } from '@/hooks/useArenaData';
import { useTransaction } from '@/hooks/useTransaction';
import {
  commitMove,
  joinDuel,
  openDuel,
  runClash,
  WalletClient,
} from '@/lib/contract';
import { figure } from '@/lib/format';
import { ToastProvider, useToast } from '@/components/Toast';
import { DataErrorBoundary } from '@/components/DataErrorBoundary';
import { Scoreboard } from '@/components/Scoreboard';
import { ClashStage } from '@/components/ClashStage';
import { MoveComposer, ComposerTarget } from '@/components/MoveComposer';
import { DuelLobby } from '@/components/DuelLobby';
import { OpenDuelForm } from '@/components/OpenDuelForm';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';
import { ErrorState } from '@/components/ErrorState';
import { ConsensusReveal } from '@/components/ConsensusReveal';
import { ConfirmDialog, ConfirmContent } from '@/components/ConfirmDialog';

interface PendingWrite {
  content: ConfirmContent;
  send: (client: WalletClient) => Promise<unknown>;
  successText: string;
  focusNewest?: boolean;
}

function Arena() {
  const wallet = useWallet();
  const arena = useArenaData();
  const tx = useTransaction();
  const toast = useToast();

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [composer, setComposer] = useState<ComposerTarget | null>(null);
  const [pending, setPending] = useState<PendingWrite | null>(null);

  // Default focus: first live duel, else the newest one.
  useEffect(() => {
    if (focusedId && arena.duels.some((d) => d.id === focusedId)) return;
    if (arena.duels.length === 0) {
      setFocusedId(null);
      return;
    }
    const live = arena.duels.find((d) => d.status === 'ACTIVE');
    setFocusedId((live ?? arena.duels[0]).id);
  }, [arena.duels, focusedId]);

  const focused = useMemo(
    () => arena.duels.find((d) => d.id === focusedId) ?? null,
    [arena.duels, focusedId],
  );

  const busy = tx.state.phase === 'wallet' || tx.state.phase === 'submitted' || tx.state.phase === 'consensus';

  const requireWallet = (): `0x${string}` | null => {
    if (!wallet.address) {
      toast.push('info', 'Connect a wallet to make a move in the arena.');
      return null;
    }
    if (!wallet.onChain) {
      toast.push('error', 'Switch your wallet to Bradbury Testnet first.');
    }
    return wallet.address;
  };

  const submit = (p: PendingWrite) => {
    const account = requireWallet();
    if (!account) return;
    setPending(p);
  };

  const confirmRun = () => {
    const account = wallet.address;
    const p = pending;
    setPending(null);
    if (!account || !p) return;
    tx.run({
      account,
      send: p.send,
      onBusy: arena.setBusy,
      onConfirmed: async () => {
        toast.push('success', p.successText);
        await arena.refresh();
      },
    });
  };

  // ---- action handlers ----
  const handleOpen = (title: string, rounds: number) => {
    submit({
      content: {
        title: 'Call this duel?',
        body: `You will stand in the left corner as P1 of a best-of-${rounds} match: "${title}".`,
        confirmLabel: 'Open the duel',
        accent: 'flare',
      },
      send: (c) => openDuel(c, title, rounds),
      successText: 'Duel called. Waiting for a challenger to take P2.',
      focusNewest: true,
    });
  };

  const handleJoin = () => {
    if (!focused) return;
    submit({
      content: {
        title: 'Take the right corner?',
        body: `You will become P2 in "${focused.title}" and the match will go live.`,
        confirmLabel: 'Join as P2',
        accent: 'p2',
      },
      send: (c) => joinDuel(c, focused.id),
      successText: 'You are in. The match is live, seal your first move.',
    });
  };

  const handleSealOpen = (side: 'P1' | 'P2') => {
    if (!requireWallet() || !focused) return;
    setComposer({
      duelId: focused.id,
      side,
      title: focused.title,
      round: focused.currentRound,
    });
  };

  const handleCommit = (move: string) => {
    const c = composer;
    if (!c) return;
    setComposer(null);
    submit({
      content: {
        title: 'Seal this move?',
        body: 'Your tactic is locked in for this round and stays concealed until both corners commit.',
        confirmLabel: 'Seal it',
        accent: c.side === 'P1' ? 'p1' : 'p2',
      },
      send: (client) => commitMove(client, c.duelId, move),
      successText: 'Move sealed. Hidden until your opponent commits too.',
    });
  };

  const handleClash = () => {
    if (!focused) return;
    submit({
      content: {
        title: 'Run the clash?',
        body: 'Both sealed moves go to the Referee AI. Validators will re-judge and must agree on the winner before the round settles.',
        confirmLabel: 'Adjudicate now',
        accent: 'flare',
      },
      send: (c) => runClash(c, focused.id),
      successText: 'The round is settled. The scoreboard advances.',
    });
  };

  const showError = arena.error && (arena.diagnostic || arena.duels.length === 0);

  return (
    <div className="min-h-screen">
      <Scoreboard duel={focused} wallet={wallet} />

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {wallet.error && (
          <p className="rounded-lg border border-p2/40 bg-p2/5 px-4 py-2 text-sm text-arena-chalk">
            {wallet.error}
          </p>
        )}

        {/* live clash stage (hero) */}
        <ClashStage
          duel={focused}
          address={wallet.address}
          busy={busy}
          onJoin={handleJoin}
          onSeal={handleSealOpen}
          onClash={handleClash}
        />

        {/* stats strip, derived client-side */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Duels called" value={figure(arena.stats?.duels ?? arena.duels.length)} accent="p1" />
          <StatCard label="Clashes judged" value={figure(arena.stats?.clashes ?? 0)} accent="p2" />
          <StatCard
            label="Live matches"
            value={figure(arena.duels.filter((d) => d.status === 'ACTIVE').length)}
            accent="flare"
          />
          <StatCard
            label="Settled matches"
            value={figure(arena.duels.filter((d) => d.status === 'DONE').length)}
            accent="p1"
          />
        </div>

        {/* lobby + open form */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-3xl tracking-wide text-arena-chalk">Open duels</h2>
              <span className="font-mono text-xs text-arena-fog">tap a ticket to step in</span>
            </div>
            {showError ? (
              <ErrorState message={arena.error!} diagnostic={arena.diagnostic} onRetry={arena.refresh} />
            ) : (
              <DuelLobby
                duels={arena.duels}
                loading={arena.loading}
                focusedId={focusedId}
                address={wallet.address}
                onFocus={setFocusedId}
                onCallFirst={() =>
                  document.getElementById('title')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }
              />
            )}
          </div>
          <OpenDuelForm busy={busy} canWrite={!!wallet.address} onOpen={handleOpen} />
        </section>

        <HowItWorks />
      </main>

      <Footer />

      <MoveComposer target={composer} busy={busy} onSubmit={handleCommit} onClose={() => setComposer(null)} />
      <ConfirmDialog
        open={!!pending}
        content={pending?.content ?? null}
        onConfirm={confirmRun}
        onCancel={() => setPending(null)}
      />
      <ConsensusReveal tx={tx.state} onClose={tx.reset} />
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: 'p1' | 'p2' | 'flare' }) {
  const color = accent === 'p1' ? 'text-p1' : accent === 'p2' ? 'text-p2' : 'text-flare';
  return (
    <div className="rounded-xl border border-arena-line bg-arena-panel/60 p-4">
      <p className={`font-display text-4xl leading-none ${color}`}>{value}</p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-arena-fog">{label}</p>
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <DataErrorBoundary>
        <Arena />
      </DataErrorBoundary>
    </ToastProvider>
  );
}
