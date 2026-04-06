import Link from 'next/link';

export function AppLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <div className="flex size-11 items-center justify-center rounded-[1.35rem] border border-white/12 bg-[linear-gradient(135deg,rgba(74,222,128,0.18),rgba(19,78,74,0.34))] shadow-[0_20px_45px_rgba(3,7,18,0.28)]">
        <span className="text-sm font-semibold tracking-[0.08em] text-white">
          PO
        </span>
      </div>
      {!compact ? (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[0.12em] text-white">
            PulseOps
          </p>
          <p className="truncate text-xs text-white/48">
            Operations command center
          </p>
        </div>
      ) : null}
    </Link>
  );
}
