import type { ReactNode } from 'react';
import Link from 'next/link';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      <header className="border-b border-[var(--color-border)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold tracking-[0.2em] uppercase">
            PulseOps
          </Link>
          <nav className="flex items-center gap-4 text-sm text-[var(--color-fg-muted)]">
            <Link href="/pricing">Pricing</Link>
            <Link href="/docs">Docs</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/sign-in" className="text-[var(--color-fg)]">
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
