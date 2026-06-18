import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: '#0e0e12',
          panel: '#16161d',
          grid: '#1d1d27',
          line: '#2a2a37',
          fog: '#8a8aa0',
          chalk: '#e9e9f2',
        },
        p1: {
          DEFAULT: '#2ce6e6',
          deep: '#0c8f8f',
          glow: 'rgba(44,230,230,0.55)',
        },
        p2: {
          DEFAULT: '#ff3da6',
          deep: '#a31466',
          glow: 'rgba(255,61,166,0.55)',
        },
        flare: '#ffe23d',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Bebas Neue', 'sans-serif'],
        body: ['var(--font-body)', 'Figtree', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      keyframes: {
        clashpulse: {
          '0%,100%': { opacity: '0.4', transform: 'scale(0.96)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' },
        },
        flicker: {
          '0%,100%': { opacity: '1' },
          '45%': { opacity: '0.78' },
          '55%': { opacity: '0.92' },
        },
      },
      animation: {
        clashpulse: 'clashpulse 2.4s ease-in-out infinite',
        sweep: 'sweep 2.2s linear infinite',
        flicker: 'flicker 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
