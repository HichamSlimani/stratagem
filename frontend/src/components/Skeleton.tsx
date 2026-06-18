export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-arena-grid ${className}`}
      aria-hidden
    >
      <div className="absolute inset-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export function TicketSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-arena-line bg-arena-panel/60 p-4">
      <Skeleton className="h-10 w-28" />
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-10 w-28" />
    </div>
  );
}
