'use client';

import { cn } from '@pulseops/utils';
import type { AppShellContext } from '@/features/shell/types/shell.types';
import { useShellUiStore } from '@/features/shell/stores/shell-ui.store';
import { AppLogo } from './app-logo';
import { AppSidebarNav } from './app-sidebar-nav';
import { AppIcon } from './app-icon';

export function AppSidebar({ shell }: { shell: AppShellContext }) {
  const { isDesktopSidebarCollapsed, toggleDesktopSidebar } = useShellUiStore();

  return (
    <aside
      className={cn(
        'hidden border-r border-white/8 bg-[linear-gradient(180deg,#04101d_0%,#071523_48%,#030d18_100%)] text-white lg:flex lg:flex-col',
        isDesktopSidebarCollapsed ? 'lg:w-[6.1rem]' : 'lg:w-[18.5rem]',
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 pb-4 pt-5">
        <AppLogo compact={isDesktopSidebarCollapsed} />
        <button
          type="button"
          onClick={toggleDesktopSidebar}
          className="inline-flex size-10 items-center justify-center rounded-full border border-white/8 bg-white/6 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <AppIcon name="menu" />
        </button>
      </div>

      {!isDesktopSidebarCollapsed ? (
        <div className="px-5 pb-4">
          <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.04] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/36">
              Workspace
            </p>
            <p className="mt-3 text-sm font-medium text-white">
              {shell.tenantName}
            </p>
            <p className="mt-1 text-sm text-white/46">
              {shell.branches.length} active branch
              {shell.branches.length === 1 ? '' : 'es'}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <AppSidebarNav collapsed={isDesktopSidebarCollapsed} />
      </div>
    </aside>
  );
}
