import type { Route } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';

const dashboardRoutes: { href: Route; label: string }[] = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/branches', label: 'Branches' },
  { href: '/incidents', label: 'Incidents' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/billing', label: 'Billing' },
  { href: '/customers', label: 'Customers' },
  { href: '/settings', label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-[var(--color-border)] bg-[var(--color-sidebar)] p-6 lg:border-b-0 lg:border-r">
        <div className="space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              PulseOps
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">
              Operations shell
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-fg-muted)]">
              Sprint 0 keeps the navigation aligned to the real product modules.
            </p>
          </div>
          <nav className="grid gap-2">
            {dashboardRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="rounded-[var(--radius-lg)] px-3 py-2 text-sm text-[var(--color-fg-muted)] transition hover:bg-white hover:text-[var(--color-fg)]"
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
