import type { ReactNode } from 'react';
import { AppSidebar } from '@/components/app-shell/app-sidebar';
import { AppTopbar } from '@/components/app-shell/app-topbar';
import { CommandPalette } from '@/components/app-shell/command-palette';
import { MobileNavDrawer } from '@/components/app-shell/mobile-nav-drawer';
import { getNotificationFeed } from '@/features/notifications/queries/get-notification-feed';
import { requireAppAccess } from '@/lib/auth/require-app-access';
import { getActiveBranchContext } from '@/lib/tenancy/get-active-branch-context';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await requireAppAccess();
  const shell = await getActiveBranchContext({ userId: user.id });
  const notifications = getNotificationFeed({
    tenantName: shell.tenantName,
    viewerName: shell.viewer.fullName,
    activeBranchName: shell.activeBranchName,
  });

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <div className="flex min-h-screen">
        <AppSidebar shell={shell} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar shell={shell} notifications={notifications} />
          <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
        </div>
      </div>
      <MobileNavDrawer shell={shell} />
      <CommandPalette />
    </div>
  );
}
