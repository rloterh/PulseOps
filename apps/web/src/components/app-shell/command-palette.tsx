'use client';

import type { Route } from 'next';
import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { APP_NAV_ITEMS } from '@/features/shell/constants/navigation';
import { useShellUiStore } from '@/features/shell/stores/shell-ui.store';
import { AppIcon } from './app-icon';

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { isCommandPaletteOpen, closeCommandPalette, toggleCommandPalette } =
    useShellUiStore();

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      toggleCommandPalette();
    }

    if (event.key === 'Escape') {
      closeCommandPalette();
    }
  });

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  const results = APP_NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(deferredQuery.trim().toLowerCase()),
  );

  if (!isCommandPaletteOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close command palette"
        onClick={() => {
          closeCommandPalette();
        }}
        className="fixed inset-0 z-40 bg-[#020617]/48 backdrop-blur-[2px]"
      />
      <div className="fixed inset-x-4 top-8 z-50 mx-auto max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#07111d]/96 text-white shadow-[0_40px_100px_rgba(2,6,23,0.58)]">
        <div className="flex items-center gap-3 border-b border-white/8 px-4 py-4">
          <AppIcon name="search" className="text-white/44" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Search dashboard, jobs, incidents, customers..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/34"
          />
          <button
            type="button"
            onClick={closeCommandPalette}
            className="rounded-full border border-white/10 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-white/52 transition hover:bg-white/8 hover:text-white"
          >
            Esc
          </button>
        </div>

        <div className="max-h-[24rem] overflow-y-auto p-3">
          {results.length > 0 ? (
            <div className="space-y-1.5">
              {results.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    router.push(item.href as Route);
                    closeCommandPalette();
                  }}
                  className="flex w-full items-center justify-between rounded-[1.1rem] px-3 py-3 text-left transition hover:bg-white/8"
                >
                  <span className="flex items-center gap-3">
                    <AppIcon name={item.icon} className="text-white/62" />
                    <span>
                      <span className="block text-sm font-medium text-white">
                        {item.label}
                      </span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-white/34">
                        Navigate
                      </span>
                    </span>
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-white/32">
                    {item.href}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-10 text-center">
              <p className="text-sm font-medium text-white">No matches found</p>
              <p className="mt-2 text-sm text-white/46">
                Try another route name like Dashboard, Jobs, or Team.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
