'use client';

import { useEffect, useEffectEvent } from 'react';
import type { AppShellContext } from '@/features/shell/types/shell.types';
import { useShellUiStore } from '@/features/shell/stores/shell-ui.store';
import { AppLogo } from './app-logo';
import { AppSidebarNav } from './app-sidebar-nav';
import { AppIcon } from './app-icon';
import { BranchSwitcher } from './branch-switcher';

export function MobileNavDrawer({ shell }: { shell: AppShellContext }) {
  const { isMobileNavOpen, closeMobileNav } = useShellUiStore();
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeMobileNav();
    }
  });

  useEffect(() => {
    if (!isMobileNavOpen) {
      return undefined;
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMobileNav, handleKeyDown, isMobileNavOpen]);

  if (!isMobileNavOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close mobile navigation"
        onClick={closeMobileNav}
        className="fixed inset-0 z-40 bg-[#020617]/52 backdrop-blur-[2px] lg:hidden"
      />
      <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(86vw,23rem)] flex-col border-r border-white/10 bg-[#07111d]/98 px-5 py-5 text-white shadow-[0_28px_85px_rgba(2,6,23,0.6)] lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <AppLogo />
          <button
            type="button"
            onClick={closeMobileNav}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <AppIcon name="close" />
          </button>
        </div>

        <div className="mt-6">
          <BranchSwitcher
            branches={shell.branches}
            activeBranchId={shell.activeBranchId}
            compact
          />
        </div>

        <div className="mt-6 flex-1 overflow-y-auto">
          <AppSidebarNav onNavigate={closeMobileNav} />
        </div>
      </aside>
    </>
  );
}
