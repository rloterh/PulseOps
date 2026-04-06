'use client';

import { startTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@pulseops/utils';
import { useShellUiStore } from '@/features/shell/stores/shell-ui.store';
import type { BranchOption } from '@/features/shell/types/shell.types';
import { persistActiveBranchPreference } from '@/lib/tenancy/active-branch-preference';
import { AppIcon } from './app-icon';

export function BranchSwitcher({
  branches,
  activeBranchId,
  tone = 'dark',
  compact = false,
}: {
  branches: BranchOption[];
  activeBranchId: string | null;
  tone?: 'dark' | 'light';
  compact?: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { activeBranchId: selectedBranchId, setActiveBranchId } = useShellUiStore();

  useEffect(() => {
    setActiveBranchId(activeBranchId);
  }, [activeBranchId, setActiveBranchId]);

  const selectedBranch =
    branches.find((branch) => branch.id === selectedBranchId) ?? branches[0] ?? null;
  const buttonClasses =
    tone === 'dark'
      ? 'border-white/10 bg-white/6 text-white hover:bg-white/10'
      : 'border-[var(--color-border)] bg-white/90 text-[var(--color-fg)] hover:bg-white';
  const panelClasses =
    tone === 'dark'
      ? 'border-white/10 bg-[#07111d]/96 text-white shadow-[0_35px_85px_rgba(2,6,23,0.55)]'
      : 'border-[var(--color-border)] bg-white text-[var(--color-fg)] shadow-[var(--shadow-floating)]';

  if (branches.length === 0) {
    return (
      <div
        className={cn(
          'inline-flex min-h-10 items-center gap-2 rounded-[1rem] border px-3 py-2 text-sm',
          buttonClasses,
        )}
      >
        <AppIcon name="branches" />
        <span>No active branches</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((open) => !open);
        }}
        className={cn(
          'inline-flex min-h-10 items-center justify-between gap-3 rounded-[1rem] border px-3 py-2 text-left text-sm transition',
          compact ? 'w-full' : 'w-full min-w-[16rem] md:w-[18rem]',
          buttonClasses,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <AppIcon name="branches" />
          <span className="min-w-0">
            <span className="block truncate font-medium">
              {selectedBranch?.name ?? 'Select branch'}
            </span>
            <span
              className={cn(
                'block truncate text-xs',
                tone === 'dark' ? 'text-white/44' : 'text-[var(--color-fg-muted)]',
              )}
            >
              {selectedBranch?.locationLabel ?? 'No location configured'}
            </span>
          </span>
        </span>
        <AppIcon name="chevrons-up-down" className="opacity-70" />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close branch switcher"
            className="fixed inset-0 z-30"
            onClick={() => {
              setIsOpen(false);
            }}
          />
          <div
            className={cn(
              'absolute left-0 top-[calc(100%+0.7rem)] z-40 w-full overflow-hidden rounded-[1.35rem] border p-2',
              compact ? 'md:w-full' : 'md:w-[21rem]',
              panelClasses,
            )}
          >
            <div
              className={cn(
                'px-2 pb-2 pt-1 text-xs uppercase tracking-[0.18em]',
                tone === 'dark' ? 'text-white/40' : 'text-[var(--color-fg-muted)]',
              )}
            >
              Branches
            </div>
            <div className="space-y-1">
              {branches.map((branch) => {
                const selected = branch.id === selectedBranchId;

                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (branch.id === selectedBranchId) {
                        return;
                      }

                      setActiveBranchId(branch.id);
                      persistActiveBranchPreference(branch.id);
                      startTransition(() => {
                        router.refresh();
                      });
                    }}
                    className={cn(
                      'flex w-full items-start justify-between rounded-[1rem] px-3 py-3 text-left transition',
                      selected
                        ? tone === 'dark'
                          ? 'bg-white text-neutral-950'
                          : 'bg-[var(--color-sidebar)] text-[var(--color-fg)]'
                        : tone === 'dark'
                          ? 'text-white/82 hover:bg-white/8'
                          : 'text-[var(--color-fg)] hover:bg-[var(--color-surface-muted)]',
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {branch.name}
                      </span>
                      <span
                        className={cn(
                          'mt-1 block truncate text-xs',
                          selected
                            ? tone === 'dark'
                              ? 'text-neutral-500'
                              : 'text-[var(--color-fg-muted)]'
                            : tone === 'dark'
                              ? 'text-white/42'
                              : 'text-[var(--color-fg-muted)]',
                        )}
                      >
                        {branch.locationLabel ?? 'No location configured'}
                      </span>
                    </span>
                    {selected ? (
                      <span className="ml-3 rounded-full border border-current/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">
                        Active
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
