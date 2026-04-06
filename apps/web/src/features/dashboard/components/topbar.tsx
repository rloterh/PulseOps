import { signOutAction } from '@/features/auth/actions/sign-out-action';
import type { Database } from '@pulseops/supabase/types';

function formatRole(role: Database['public']['Enums']['organization_role']) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function Topbar({
  workspaceName,
  role,
  userEmail,
}: {
  workspaceName: string;
  role: Database['public']['Enums']['organization_role'];
  userEmail: string | undefined;
}) {
  return (
    <header className="border-b border-[var(--color-border)] bg-white/80 px-6 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Active workspace
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">{workspaceName}</h1>
            <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-fg-muted)]">
              {formatRole(role)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-right sm:block">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-fg-muted)]">
              Signed in as
            </p>
            <p className="mt-1 text-sm font-medium text-[var(--color-fg)]">
              {userEmail ?? 'Unknown user'}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-fg)] transition hover:bg-[var(--color-surface-muted)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
