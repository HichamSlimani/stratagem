'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import { FAUCET } from '@/lib/contract';

export interface ConfirmContent {
  title: string;
  body: string;
  confirmLabel: string;
  accent: 'p1' | 'p2' | 'flare';
}

export function ConfirmDialog({
  open,
  content,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  content: ConfirmContent | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const accentRing =
    content?.accent === 'p1'
      ? 'glow-p1'
      : content?.accent === 'p2'
        ? 'glow-p2'
        : 'glow-flare';
  const confirmBg =
    content?.accent === 'p1'
      ? 'bg-p1 text-black hover:bg-p1/90'
      : content?.accent === 'p2'
        ? 'bg-p2 text-black hover:bg-p2/90'
        : 'bg-flare text-black hover:bg-flare/90';

  return (
    <AnimatePresence>
      {open && content && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          role="dialog"
          aria-modal="true"
          aria-label={content.title}
        >
          <motion.div
            className={`w-full max-w-md rounded-2xl border border-arena-line bg-arena-panel p-6 ${accentRing}`}
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-2 text-flare">
              <ShieldAlert size={20} />
              <h3 className="font-display text-2xl tracking-wide text-arena-chalk">{content.title}</h3>
            </div>
            <p className="mb-2 text-sm leading-relaxed text-arena-fog">{content.body}</p>
            <p className="mb-5 text-xs leading-relaxed text-arena-fog">
              This submits a transaction on Bradbury Testnet. Network fees apply.{' '}
              <a
                href={FAUCET}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-p1 underline-offset-2 hover:underline"
              >
                Grab test GEN <ExternalLink size={11} />
              </a>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onCancel}
                className="rounded-lg border border-arena-line px-4 py-2 text-sm font-semibold text-arena-fog transition hover:border-arena-fog hover:text-arena-chalk"
              >
                Stand down
              </button>
              <button
                onClick={onConfirm}
                className={`rounded-lg px-4 py-2 text-sm font-bold transition ${confirmBg}`}
              >
                {content.confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
