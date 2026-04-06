import type { ReactNode } from 'react';
import { Sidebar } from '@/features/dashboard/components/sidebar';
import { Topbar } from '@/features/dashboard/components/topbar';
import { requireUser } from '@/lib/auth/require-user';
import { requireCurrentMembership } from '@/lib/organizations/require-current-membership';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const membership = await requireCurrentMembership(user.id);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar />
      <div className="min-w-0">
        <Topbar
          workspaceName={membership.organization.name}
          role={membership.role}
          userEmail={user.email}
        />
        {children}
      </div>
    </div>
  );
}
