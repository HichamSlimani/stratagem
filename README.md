# Stratagem

> An on-chain duel of wits. Two players seal a secret tactic, a Referee AI adjudicates the clash under validator consensus, and the round advances a best-of-N match toward a winner.

Stratagem is not a bracket and it is not one-sided persuasion. It is simultaneous, sealed-move adjudication: both corners commit a concealed tactic for the same premise, neither move is revealed, and only when both are in does the Referee weigh them against each other. Validators each re-judge the clash and must agree on the winner before the round settles.

## Why this needs GenLayer

The hard part of a duel of wits is the ruling. "Which concealed tactic actually beats the other, and by how much?" is a subjective judgment that no fixed formula settles fairly. Stratagem puts that judgment on chain: the Referee is an LLM prompt, and the outcome is only accepted when independent validators converge on the same winner with the margin inside tolerance. The contract owns the state transition that needs consensus; the frontend only renders it.

## The clash, end to end

1. P1 calls a duel: a premise (1-80 chars) and a length, best of 3 or 5.
2. A second wallet takes the right corner as P2. The match goes live.
3. Each corner seals a concealed move (1-300 chars). The move is hidden from every contract view until both have committed.
4. Anyone runs the clash. The Referee returns a strict JSON ruling: `winner` in `{P1, P2, DRAW}`, `margin` 0-100, and a short ruling sentence.
5. Validators re-run the judgment. The winner must match exactly; the margin must land within `max(15, 15 * max(a,b) // 100)`. A clash judged closer than the closeness floor is forced to a draw.
6. Scores advance. The first corner to reach `rounds // 2 + 1` clinches the match.

## Consensus design

| Concern | How Stratagem handles it |
| --- | --- |
| Non-deterministic LLM output | Custom leader plus validator functions via `gl.vm.run_nondet_unsafe`; validators independently re-judge rather than trust the leader draft. |
| Winner agreement | Exact match required on `winner`; no consensus on a disputed victor. |
| Margin drift | Tolerance band `abs(a - b) <= max(15, 15 * max(a,b) // 100)`. |
| Coin-flip rounds | Deterministic backstop forces `DRAW` when the agreed margin is below the closeness floor of 12. |
| Prompt injection | Both moves are delimited and treated as untrusted data; a move that tries to rewrite the rules or claim victory loses that round. |
| Malformed rulings | Classified `[LLM_ERROR]` so validators disagree and rotate the leader instead of locking bad state. |

## Layout

```
contracts/contract.py        Stratagem intelligent contract (GenVM Python)
tests/integration/           StudioNet consensus test for the full clash flow
frontend/                     Next.js App Router, static export, neon versus arena
scripts/no-emoji.js          repository emoji guard
gltest.config.yaml           gltest paths
```

## Run it

Contract checks:

```
genvm-lint check contracts/contract.py --json
gltest tests/integration/ -v -s --network studionet
```

Frontend:

```
cd frontend
npm install
npm run dev      # local arena
npm run build    # static export to out/
```

## A note on secrecy

Sealed moves are withheld from every contract view while a round is in progress, and only revealed in history once the round resolves. Raw chain state is still technically readable on this testnet, so treat the arena as public rather than a cryptographic vault. This is a documented testnet limitation.

## Coordinates

```ini
live      = https://hichamslimani.github.io/stratagem/
network   = GenLayer Bradbury Testnet
contract  = TBD (set by the parent after deployment)
explorer  = https://explorer-bradbury.genlayer.com
faucet    = https://testnet-faucet.genlayer.foundation/
```
