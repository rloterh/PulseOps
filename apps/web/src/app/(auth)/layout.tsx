import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_rgba(249,252,251,1),_rgba(238,245,243,1))] text-[var(--color-fg)]">
      {children}
    </main>
  );
}
