import type { Route } from 'next';
import Link from 'next/link';

const navigation = [
  { href: '/' as Route, label: 'Product' },
  { href: '/pricing' as Route, label: 'Pricing' },
  { href: '/docs' as Route, label: 'Docs' },
  { href: '/help' as Route, label: 'Help' },
  { href: '/blog' as Route, label: 'Blog' },
  { href: '/screenshots' as Route, label: 'Screenshots' },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-[color-mix(in_oklab,var(--color-bg)_80%,white)]/88 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[1.35rem] border border-emerald-500/18 bg-[linear-gradient(145deg,rgba(20,184,166,0.18),rgba(5,46,22,0.82))] shadow-[var(--shadow-card)]">
            <span className="text-sm font-semibold tracking-[0.08em] text-white">
              PO
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-fg)]">
              PulseOps
            </p>
            <p className="truncate text-xs text-[var(--color-fg-muted)]">
              AI-powered operations command center
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-[var(--color-fg-muted)] lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-[var(--color-fg)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden text-sm font-medium text-[var(--color-fg-muted)] transition hover:text-[var(--color-fg)] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-fg)] px-5 text-sm font-semibold text-white transition hover:opacity-92"
          >
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
