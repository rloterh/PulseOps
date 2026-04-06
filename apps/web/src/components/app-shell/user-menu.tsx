'use client';

import { useState } from 'react';
import { signOutAction } from '@/features/auth/actions/sign-out-action';
import type { ShellViewer } from '@/features/shell/types/shell.types';
import { AppIcon } from './app-icon';

function getInitials(value: string | null | undefined) {
  const text = value?.trim();

  if (!text) {
    return 'PO';
  }

  return text
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase() ?? '')
    .join('');
}

export function UserMenu({ viewer }: { viewer: ShellViewer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((open) => !open);
        }}
        className="inline-flex items-center gap-3 rounded-full border border-white/8 bg-white/6 px-2 py-2 text-left text-white transition hover:bg-white/10"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(74,222,128,0.32),rgba(14,116,144,0.55))] text-xs font-semibold tracking-[0.12em] text-white">
          {getInitials(viewer.fullName)}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-medium">
            {viewer.fullName ?? 'PulseOps user'}
          </span>
          <span className="block truncate text-xs text-white/44">
            {viewer.email}
          </span>
        </span>
        <AppIcon name="chevron-down" className="hidden text-white/40 sm:block" />
      </button>

      {isOpen ? (
        <>
          <button
            type="button"
            aria-label="Close user menu"
            className="fixed inset-0 z-30"
            onClick={() => {
              setIsOpen(false);
            }}
          />
          <div className="absolute right-0 top-[calc(100%+0.75rem)] z-40 w-[18rem] overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#07111d]/96 p-2 text-white shadow-[0_30px_90px_rgba(2,6,23,0.58)]">
            <div className="rounded-[1rem] border border-white/8 bg-white/[0.04] px-3 py-3">
              <p className="text-sm font-medium text-white">
                {viewer.fullName ?? 'PulseOps user'}
              </p>
              <p className="mt-1 text-sm text-white/48">{viewer.email}</p>
            </div>

            <div className="mt-2 rounded-[1rem] border border-white/8 bg-white/[0.03] px-3 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/38">
                Current role
              </p>
              <p className="mt-2 text-sm font-medium capitalize text-white">
                {viewer.role}
              </p>
            </div>

            <form action={signOutAction} className="mt-2">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-sm font-medium text-white/82 transition hover:bg-white/8 hover:text-white"
              >
                <AppIcon name="logout" />
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </>
      ) : null}
    </div>
  );
}
