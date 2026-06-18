import { createClient } from 'genlayer-js';
import { testnetBradbury } from 'genlayer-js/chains';

// ---------------------------------------------------------------------------
// Live STRATAGEM contract on GenLayer Bradbury Testnet.
// PARENT: overwrite CONTRACT_ADDRESS with the deployed address after deploy.
// ---------------------------------------------------------------------------
export const CONTRACT_ADDRESS = '0x9f455597d35bEdF37AAbfBE63026cEb6cBde8de8';
export const DEPLOY_TX: string = '0xfd307c4fb9b3c55271938739b288d39f41bfaeb10cc97543e2aee1261c393f7b';

// A string-typed zero so the equality check below is a runtime string compare,
// not a literal-narrowed comparison (avoids TS2367 once the parent swaps in a
// real address). If a DEPLOY_TX is added later, type it `string` too.
const ZERO: string = '0x0000000000000000000000000000000000000000';
export const IS_DEPLOYED = CONTRACT_ADDRESS.toLowerCase() !== ZERO.toLowerCase();

export const EXPLORER = 'https://explorer-bradbury.genlayer.com';
export const FAUCET = 'https://testnet-faucet.genlayer.foundation/';

export const readClient = createClient({ chain: testnetBradbury });

export const makeWalletClient = (account: `0x${string}`) =>
  createClient({ chain: testnetBradbury, account });

export type WalletClient = ReturnType<typeof makeWalletClient>;

const ADDRESS = CONTRACT_ADDRESS as `0x${string}`;

// ---- limits mirrored from the contract ------------------------------------

export const TITLE_LIMIT = { min: 1, max: 80 } as const;
export const MOVE_LIMIT = { min: 1, max: 300 } as const;
export const ALLOWED_ROUNDS = [3, 5] as const;
export const CLOSENESS_FLOOR = 12;

// ---- shapes returned by the contract views --------------------------------

export type DuelStatus = 'OPEN' | 'ACTIVE' | 'DONE';
export type Side = 'P1' | 'P2';
export type RoundWinner = 'P1' | 'P2' | 'DRAW';

export interface HistoryEntry {
  round: number;
  winner: RoundWinner;
  margin: number;
  ruling: string;
  p1Move: string;
  p2Move: string;
}

export interface Duel {
  id: string;
  title: string;
  rounds: number;
  status: DuelStatus;
  p1: string;
  p2: string;
  p1Score: number;
  p2Score: number;
  currentRound: number;
  pendingP1: boolean;
  pendingP2: boolean;
  history: HistoryEntry[];
  winner: '' | 'P1' | 'P2';
}

export interface Stats {
  duels: number;
  clashes: number;
}

// ---- resilient reads -------------------------------------------------------

export async function withRpcRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      // "not found" is included: a freshly deployed contract or a not-yet-indexed
      // read can transiently 404 before the node catches up, so we retry it.
      if (!/rate limit|429|timeout|network|fetch|too many|not found/i.test(String(e))) throw e;
      // backoff: 2.5s, 5s, 10s, 20s
      await new Promise((r) => setTimeout(r, 2500 * 2 ** i));
    }
  }
  throw last;
}

function toRecord<T>(value: unknown): T {
  if (value instanceof Map) {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of value.entries()) obj[String(k)] = normalize(v);
    return obj as T;
  }
  return value as T;
}

function normalize(value: unknown): unknown {
  if (value instanceof Map) return toRecord(value);
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === 'bigint') return value.toString();
  return value;
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'bigint') return Number(v);
  const n = Number(String(v ?? '0'));
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return String(v ?? '');
}

function asStatus(v: unknown): DuelStatus {
  const s = str(v).toUpperCase();
  if (s === 'ACTIVE') return 'ACTIVE';
  if (s === 'DONE') return 'DONE';
  return 'OPEN';
}

function asRoundWinner(v: unknown): RoundWinner {
  const s = str(v).toUpperCase();
  if (s === 'P1') return 'P1';
  if (s === 'P2') return 'P2';
  return 'DRAW';
}

function asMatchWinner(v: unknown): '' | 'P1' | 'P2' {
  const s = str(v).toUpperCase();
  if (s === 'P1') return 'P1';
  if (s === 'P2') return 'P2';
  return '';
}

function asHistory(raw: unknown): HistoryEntry[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((item) => {
    const r = toRecord<Record<string, unknown>>(item);
    return {
      round: num(r.round),
      winner: asRoundWinner(r.winner),
      margin: num(r.margin),
      ruling: str(r.ruling),
      p1Move: str(r.p1_move),
      p2Move: str(r.p2_move),
    };
  });
}

function asDuel(raw: unknown): Duel {
  const r = toRecord<Record<string, unknown>>(raw);
  const pending = toRecord<Record<string, unknown>>(r.pending);
  return {
    id: str(r.id),
    title: str(r.title),
    rounds: num(r.rounds),
    status: asStatus(r.status),
    p1: str(r.p1),
    p2: str(r.p2),
    p1Score: num(r.p1_score),
    p2Score: num(r.p2_score),
    currentRound: num(r.current_round),
    pendingP1: Boolean(pending?.p1),
    pendingP2: Boolean(pending?.p2),
    history: asHistory(r.history),
    winner: asMatchWinner(r.winner),
  };
}

export async function fetchStats(): Promise<Stats> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({ address: ADDRESS, functionName: 'get_stats', args: [] }),
  );
  const r = toRecord<Record<string, unknown>>(normalize(raw));
  return { duels: num(r.duels), clashes: num(r.clashes) };
}

export async function fetchDuels(start = 0): Promise<Duel[]> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({
      address: ADDRESS,
      functionName: 'get_duels',
      args: [BigInt(start)],
    }),
  );
  const arr = (normalize(raw) as unknown[]) ?? [];
  return arr.map(asDuel);
}

export async function fetchDuel(duelId: string): Promise<Duel> {
  const raw = await withRpcRetry(() =>
    readClient.readContract({
      address: ADDRESS,
      functionName: 'get_duel',
      args: [duelId],
    }),
  );
  return asDuel(normalize(raw));
}

// ---- writes ----------------------------------------------------------------

export function openDuel(client: WalletClient, title: string, rounds: number) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'open_duel',
    args: [title, rounds],
    value: 0n,
  });
}

export function joinDuel(client: WalletClient, duelId: string) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'join_duel',
    args: [duelId],
    value: 0n,
  });
}

export function commitMove(client: WalletClient, duelId: string, move: string) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'commit_move',
    args: [duelId, move],
    value: 0n,
  });
}

export function runClash(client: WalletClient, duelId: string) {
  return client.writeContract({
    address: ADDRESS,
    functionName: 'clash',
    args: [duelId],
    value: 0n,
  });
}

// ---- transaction polling ---------------------------------------------------

const STATUS_NAME: Record<string, string> = {
  '1': 'PENDING',
  '2': 'PROPOSING',
  '3': 'COMMITTING',
  '4': 'REVEALING',
  '5': 'ACCEPTED',
  '6': 'UNDETERMINED',
  '7': 'FINALIZED',
  '8': 'CANCELED',
  '12': 'VALIDATORS_TIMEOUT',
  '13': 'LEADER_TIMEOUT',
};

export const statusName = (s: unknown): string =>
  STATUS_NAME[String(s)] ?? String(s ?? 'PENDING').toUpperCase();

// LEADER_TIMEOUT / VALIDATORS_TIMEOUT are intentionally NON-terminal: the
// network rotates the leader and retries, so we keep polling through them.
const TERMINAL = new Set(['ACCEPTED', 'FINALIZED', 'UNDETERMINED', 'CANCELED']);

export interface LeaderDraft {
  winner: RoundWinner | '';
  margin?: number;
  ruling?: string;
}

function pick(obj: unknown, key: string): unknown {
  if (obj instanceof Map) return obj.get(key);
  if (obj && typeof obj === 'object') return (obj as Record<string, unknown>)[key];
  return undefined;
}

function asDraftWinner(v: unknown): RoundWinner | '' {
  const s = str(v).toUpperCase();
  if (s === 'P1') return 'P1';
  if (s === 'P2') return 'P2';
  if (s === 'DRAW') return 'DRAW';
  return '';
}

export function extractLeaderDraft(tx: unknown): LeaderDraft | null {
  try {
    const receipts = pick(pick(tx, 'consensus_data'), 'leader_receipt');
    const first = Array.isArray(receipts) ? receipts[0] : receipts;
    const b64 = pick(pick(first, 'eq_outputs'), '0');
    if (typeof b64 !== 'string' || b64.length === 0) return null;
    const text = atob(b64);
    for (let i = text.length - 1; i >= 0; i--) {
      if (text[i] !== '{') continue;
      try {
        const obj = JSON.parse(text.slice(i)) as Record<string, unknown>;
        if (obj && typeof obj === 'object' && 'winner' in obj) {
          return {
            winner: asDraftWinner(obj.winner),
            margin: obj.margin !== undefined ? num(obj.margin) : undefined,
            ruling: obj.ruling !== undefined ? str(obj.ruling) : undefined,
          };
        }
      } catch {
        /* keep scanning toward the start for a parseable object */
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function pollUntilDecided(
  client: WalletClient,
  hash: `0x${string}`,
  onUpdate?: (status: string, draft: LeaderDraft | null) => void,
): Promise<{ status: string; draft: LeaderDraft | null }> {
  let draft: LeaderDraft | null = null;
  for (let i = 0; i < 150; i++) {
    const tx = await client
      .getTransaction({ hash } as Parameters<typeof client.getTransaction>[0])
      .catch(() => null);
    const status = statusName(tx ? (tx as { status?: unknown }).status : 'PENDING');
    draft = extractLeaderDraft(tx) ?? draft;
    onUpdate?.(status, draft);
    if (TERMINAL.has(status)) return { status, draft };
    await new Promise((r) => setTimeout(r, 8000));
  }
  return { status: 'TIMEOUT', draft };
}
