import type { Route } from 'next';
import Link from 'next/link';

const footerGroups = [
  {
    heading: 'Product',
    links: [
      { href: '/' as Route, label: 'Overview' },
      { href: '/pricing' as Route, label: 'Pricing' },
      { href: '/screenshots' as Route, label: 'Screenshots' },
    ],
  },
  {
    heading: 'Content',
    links: [
      { href: '/docs' as Route, label: 'Docs' },
      { href: '/help' as Route, label: 'Help center' },
      { href: '/blog' as Route, label: 'Blog' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/contact' as Route, label: 'Contact' },
      { href: '/sign-in' as Route, label: 'Sign in' },
      { href: '/sign-up' as Route, label: 'Start trial' },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/40 bg-[linear-gradient(180deg,rgba(236,246,243,0.45),rgba(232,243,240,0.9))]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_repeat(3,minmax(0,1fr))]">
          <div className="max-w-sm space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              PulseOps
            </p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Operational visibility that stays credible under pressure.
            </h2>
            <p className="text-sm leading-7 text-[var(--color-fg-muted)]">
              PulseOps helps multi-location service businesses run branches,
              incidents, audits, SLAs, billing, analytics, and AI guidance
              from one calm control layer.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.heading} className="space-y-4">
              <p className="text-sm font-semibold text-[var(--color-fg)]">
                {group.heading}
              </p>
              <ul className="space-y-3 text-sm text-[var(--color-fg-muted)]">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="transition hover:text-[var(--color-fg)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/40 pt-6 text-sm text-[var(--color-fg-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>Built for serious branch operations without enterprise-grade clutter.</p>
          <p>Public marketing and CMS foundation for Sprint 10.</p>
        </div>
      </div>
    </footer>
  );
}
