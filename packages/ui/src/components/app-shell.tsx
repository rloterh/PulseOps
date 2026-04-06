import type { ReactNode } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)]">
      {children}
    </div>
  );
}
