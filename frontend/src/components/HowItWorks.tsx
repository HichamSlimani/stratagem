'use client';

import { Megaphone, UserPlus, Lock, Swords, Trophy } from 'lucide-react';

const STEPS = [
  {
    icon: Megaphone,
    accent: 'text-p1',
    title: 'Call the duel',
    body: 'P1 names a premise and sets best of 3 or 5. The match opens with a single empty corner.',
  },
  {
    icon: UserPlus,
    accent: 'text-p2',
    title: 'A challenger answers',
    body: 'The first wallet to take the right corner becomes P2 and the match goes live.',
  },
  {
    icon: Lock,
    accent: 'text-flare',
    title: 'Seal in secret',
    body: 'Each corner commits a concealed tactic. Neither move is shown until both are in.',
  },
  {
    icon: Swords,
    accent: 'text-p1',
    title: 'The Referee adjudicates',
    body: 'Validators each re-judge the clash. They must agree on the winner exactly, with the margin within tolerance.',
  },
  {
    icon: Trophy,
    accent: 'text-p2',
    title: 'The match advances',
    body: 'A near-even clash is forced to a draw. First corner to clinch the majority wins it all.',
  },
];

export function HowItWorks() {
  return (
    <section aria-label="How the duel works" className="rounded-2xl border border-arena-line bg-arena-panel/40 p-6">
      <h2 className="mb-1 font-display text-3xl tracking-wide text-arena-chalk">
        The rite of the duel
      </h2>
      <p className="mb-6 text-sm text-arena-fog">
        Five beats from a called premise to a settled match, every ruling adjudicated under
        validator consensus on GenLayer.
      </p>
      <ol className="grid gap-4 md:grid-cols-5">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="relative rounded-xl border border-arena-line bg-arena-bg/60 p-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-arena-fog">
                beat {i + 1}
              </span>
              <Icon size={22} className={`my-2 ${s.accent}`} />
              <h3 className="font-display text-xl tracking-wide text-arena-chalk">{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-arena-fog">{s.body}</p>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 rounded-lg border border-arena-line bg-arena-bg/60 px-4 py-3 text-xs leading-relaxed text-arena-fog">
        A note on secrecy: sealed moves are hidden from every contract view until both corners
        commit, but raw chain state is technically readable on this testnet. Treat it as a public
        arena, not a vault. This is a documented testnet limitation.
      </p>
    </section>
  );
}
