import type { ReactNode } from 'react';
import Link from 'next/link';

export function AnalyticsPageShell({
  title,
  subtitle,
  scopeLabel,
  rangeLabel,
  compareLabel,
  children,
}: {
  title: string;
  subtitle: string;
  scopeLabel: string;
  rangeLabel: string;
  compareLabel: string | null;
  children: ReactNode;
}) {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(10,18,32,0.92),rgba(13,70,95,0.28))] px-6 py-8 shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/70">
              Analytics
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58 sm:text-base">
              {subtitle}
            </p>
          </div>
          <div className="grid gap-2 rounded-[1.4rem] border border-white/8 bg-black/18 px-4 py-3 text-sm text-white/65">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                Scope
              </p>
              <p className="mt-1 font-medium text-white">{scopeLabel}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                Period
              </p>
              <p className="mt-1 font-medium text-white">{rangeLabel}</p>
              {compareLabel ? (
                <p className="mt-1 text-xs text-white/48">Compared with {compareLabel}</p>
              ) : null}
            </div>
          </div>
        </div>

        <nav className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/analytics"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950"
          >
            Overview
          </Link>
          <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/58">
            Branch comparison in next slice
          </span>
          <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/58">
            SLA metrics in next slice
          </span>
        </nav>
      </section>

      {children}
    </main>
  );
}
