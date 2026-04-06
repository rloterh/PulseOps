import type { Route } from 'next';
import Link from 'next/link';

const dashboardRoutes: { href: Route; label: string; description: string }[] = [
  { href: '/dashboard', label: 'Overview', description: 'Workspace status' },
  { href: '/branches', label: 'Branches', description: 'Site placeholders' },
  { href: '/jobs', label: 'Jobs', description: 'Reserved route' },
  { href: '/incidents', label: 'Incidents', description: 'Reserved route' },
  { href: '/analytics', label: 'Analytics', description: 'Reserved route' },
  { href: '/billing', label: 'Billing', description: 'Reserved route' },
  { href: '/customers', label: 'Customers', description: 'Reserved route' },
  { href: '/settings', label: 'Settings', description: 'User profile' },
];

export function Sidebar() {
  return (
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
            Auth, tenancy, onboarding, and the first protected dashboard slice
            are now live.
          </p>
        </div>
        <nav className="grid gap-2">
          {dashboardRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="rounded-[var(--radius-lg)] px-3 py-3 transition hover:bg-white"
            >
              <p className="text-sm font-medium text-[var(--color-fg)]">
                {route.label}
              </p>
              <p className="mt-1 text-xs text-[var(--color-fg-muted)]">
                {route.description}
              </p>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
