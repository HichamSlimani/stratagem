import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Figtree, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const body = Figtree({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Stratagem - On-chain duel of wits',
  description:
    'Two players seal a secret tactic, a Referee AI adjudicates the clash under validator consensus, and the round advances a best-of-N match on GenLayer.',
};

export const viewport: Viewport = {
  themeColor: '#0e0e12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
