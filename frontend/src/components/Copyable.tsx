'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function Copyable({
  value,
  label,
  className = '',
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be blocked; ignore */
    }
  };

  return (
    <button
      onClick={copy}
      className={`group inline-flex items-center gap-1.5 font-mono text-xs text-arena-fog transition hover:text-arena-chalk ${className}`}
      aria-label={`Copy ${label ?? 'value'}`}
      title="Copy to clipboard"
    >
      <span>{label ?? value}</span>
      {copied ? <Check size={13} className="text-p1" /> : <Copy size={13} className="opacity-60 group-hover:opacity-100" />}
    </button>
  );
}
