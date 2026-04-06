'use client';

import type { AppShellContext } from '@/features/shell/types/shell.types';
import type { NotificationItem } from '@/features/notifications/types/notification.types';
import { useShellUiStore } from '@/features/shell/stores/shell-ui.store';
import { AppIcon } from './app-icon';
import { BranchSwitcher } from './branch-switcher';
import { NotificationPanel } from './notification-panel';
import { UserMenu } from './user-menu';

export function AppTopbar({
  shell,
  notifications,
}: {
  shell: AppShellContext;
  notifications: NotificationItem[];
}) {
  const {
    openMobileNav,
    openCommandPalette,
    toggleNotifications,
    isNotificationsOpen,
  } = useShellUiStore();
  const unreadCount = notifications.filter((item) => item.unread).length;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#020817]/78 px-4 py-4 backdrop-blur-xl md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openMobileNav}
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/8 bg-white/6 text-white transition hover:bg-white/10 lg:hidden"
            >
              <AppIcon name="menu" />
            </button>

            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/75">
                Active workspace
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <h1 className="truncate text-xl font-semibold tracking-tight text-white">
                  {shell.tenantName}
                </h1>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-white/52">
                  {shell.viewer.role}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="hidden lg:block">
              <BranchSwitcher
                branches={shell.branches}
                activeBranchId={shell.activeBranchId}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openCommandPalette}
                className="inline-flex min-h-11 items-center gap-3 rounded-full border border-white/8 bg-white/6 px-4 text-sm text-white/72 transition hover:bg-white/10 hover:text-white"
              >
                <AppIcon name="spark" />
                <span className="hidden sm:inline">Command palette</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-white/42">
                  Ctrl K
                </span>
              </button>

              <button
                type="button"
                onClick={toggleNotifications}
                aria-pressed={isNotificationsOpen}
                className="relative inline-flex size-11 items-center justify-center rounded-full border border-white/8 bg-white/6 text-white transition hover:bg-white/10"
              >
                <AppIcon name="bell" />
                {unreadCount > 0 ? (
                  <span className="absolute right-2 top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-300 px-1 text-[10px] font-semibold text-neutral-950">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              <UserMenu viewer={shell.viewer} />
            </div>
          </div>
        </div>
      </header>

      <NotificationPanel items={notifications} />
    </>
  );
}
