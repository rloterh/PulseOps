'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { cn } from '@pulseops/utils';
import type { NotificationItem } from '@/features/notifications/types/notification.types';
import { useShellUiStore } from '@/features/shell/stores/shell-ui.store';
import { AppIcon } from './app-icon';

const kindLabel: Record<NotificationItem['kind'], string> = {
  incident: 'Incident',
  job: 'Job',
  system: 'System',
  billing: 'Billing',
};

export function NotificationPanel({ items }: { items: NotificationItem[] }) {
  const { isNotificationsOpen, closeNotifications } = useShellUiStore();

  if (!isNotificationsOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Close notifications"
        onClick={() => {
          closeNotifications();
        }}
        className="fixed inset-0 z-40 bg-[#020617]/42 backdrop-blur-[1px]"
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[25rem] flex-col border-l border-white/10 bg-[#07111d]/96 px-5 py-5 text-white shadow-[0_30px_90px_rgba(2,6,23,0.58)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/42">
              Notifications
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              Operational feed
            </h2>
          </div>
          <button
            type="button"
            onClick={closeNotifications}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <AppIcon name="close" />
          </button>
        </div>

        <div className="mt-6 flex-1 space-y-3 overflow-y-auto pr-1">
          {items.map((item) => {
            const cardClasses = cn(
              'block rounded-[1.3rem] border px-4 py-4 transition',
              item.unread
                ? 'border-emerald-300/22 bg-emerald-300/8'
                : 'border-white/8 bg-white/[0.04] hover:bg-white/[0.06]',
            );

            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                      {item.body}
                    </p>
                  </div>
                  {item.unread ? (
                    <span className="mt-1 inline-flex size-2 rounded-full bg-emerald-300" />
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-white/38">
                  <span>{kindLabel[item.kind]}</span>
                  <span>{item.createdAtLabel}</span>
                </div>
              </>
            );

            return item.href ? (
              <Link
                key={item.id}
                href={item.href as Route}
                onClick={closeNotifications}
                className={cardClasses}
              >
                {content}
              </Link>
            ) : (
              <div key={item.id} className={cardClasses}>
                {content}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
