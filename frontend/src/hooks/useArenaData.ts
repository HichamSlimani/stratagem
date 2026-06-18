'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Duel, fetchDuels, fetchStats, IS_DEPLOYED, Stats } from '@/lib/contract';

const POLL_MS = 90_000;

interface Classified {
  message: string;
  diagnostic: boolean;
}

function classifyError(e: unknown): Classified {
  const msg = String(e);
  if (/contract not found|execution reverted|no contract|not found|0x0{40}/i.test(msg)) {
    return {
      message:
        'No Stratagem contract is live at the configured address on Bradbury yet. The arena opens once the parent deploys it.',
      diagnostic: true,
    };
  }
  if (/rate limit|429|too many/i.test(msg)) {
    return { message: 'The network is rate limiting reads. Retrying shortly.', diagnostic: false };
  }
  return {
    message: 'The arena feed is unreachable. Check your connection and retry.',
    diagnostic: false,
  };
}

export interface ArenaData {
  stats: Stats | null;
  duels: Duel[];
  loading: boolean;
  error: string | null;
  diagnostic: boolean;
  refresh: () => Promise<void>;
  setBusy: (busy: boolean) => void;
}

export function useArenaData(): ArenaData {
  const [stats, setStats] = useState<Stats | null>(null);
  const [duels, setDuels] = useState<Duel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState(false);

  const alive = useRef(true);
  const busy = useRef(false);

  const load = useCallback(async () => {
    // Skip the network entirely until a real address is wired in: this keeps
    // the configured-zero placeholder from spamming failed reads.
    if (!IS_DEPLOYED) {
      if (!alive.current) return;
      setError(
        'No Stratagem contract is live at the configured address on Bradbury yet. The arena opens once the parent deploys it.',
      );
      setDiagnostic(true);
      setLoading(false);
      return;
    }
    try {
      const [st, ds] = await Promise.all([fetchStats(), fetchDuels(0)]);
      if (!alive.current) return;
      setStats(st);
      setDuels(ds);
      setError(null);
      setDiagnostic(false);
    } catch (e) {
      if (!alive.current) return;
      const c = classifyError(e);
      setError(c.message);
      setDiagnostic(c.diagnostic);
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const setBusy = useCallback((b: boolean) => {
    busy.current = b;
  }, []);

  useEffect(() => {
    alive.current = true;
    load();
    const id = setInterval(() => {
      if (busy.current) return; // pause polling entirely while a tx is in flight
      load();
    }, POLL_MS);
    return () => {
      alive.current = false;
      clearInterval(id);
    };
  }, [load]);

  return { stats, duels, loading, error, diagnostic, refresh, setBusy };
}
