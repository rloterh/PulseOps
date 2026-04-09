'use client';

import type { Route } from 'next';
import { useEffect, useEffectEvent } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@pulseops/utils';
import { IconButton } from '@/components/system/icon-button';
import { openNotificationAction } from '@/features/notifications/actions/open-notification-action';
import { NotificationMarkAllReadForm } from '@/features/notifications/components/notification-mark-all-read-form';
import { NotificationMarkReadForm } from '@/features/notifications/components/notification-mark-read-form';
import type { NotificationFeed, NotificationItem } from '@/features/notifications/types/notification.types';
import { useShellUiStore } from '@/features/shell/stores/shell-ui.store';
import { AppIcon } from './app-icon';

const kindLabel: Record<NotificationItem['kind'], string> = {
  incident: 'Incident',
  job: 'Job',
  task: 'Task',
};

export function NotificationPanel({
  notifications,
}: {
  notifications: NotificationFeed;
}) {
  const pathname = usePathname();
  const { isNotificationsOpen, closeNotifications } = useShellUiStore();
  const returnPath = pathname;
  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeNotifications();
    }
  });

  useEffect(() => {
    if (!isNotificationsOpen) {
      return undefined;
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, isNotificationsOpen]);

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
      <aside
        aria-labelledby="notifications-panel-title"
        aria-modal="true"
        role="dialog"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[25rem] flex-col border-l border-white/10 bg-[#07111d]/96 px-5 py-5 text-white shadow-[0_30px_90px_rgba(2,6,23,0.58)]"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/42">
              Notifications
            </p>
            <h2 id="notifications-panel-title" className="mt-2 text-xl font-semibold tracking-tight">
              Operational feed
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {notifications.unreadCount > 0 ? (
              <NotificationMarkAllReadForm
                returnPath={returnPath}
                label="Mark all read"
                buttonClassName="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                errorClassName="max-w-xs rounded-[1rem] border border-red-400/25 bg-red-500/10 px-3 py-2 text-[11px] leading-5 text-red-100"
              />
            ) : null}
            <IconButton
              label="Close notifications"
              onClick={closeNotifications}
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <AppIcon name="close" />
            </IconButton>
          </div>
        </div>

        <div className="mt-6 flex-1 space-y-3 overflow-y-auto pr-1">
          {notifications.items.length === 0 ? (
            <div className="rounded-[1.3rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-8 text-center">
              <p className="text-sm font-medium text-white">No notifications yet</p>
              <p className="mt-2 text-sm leading-6 text-white/54">
                Record updates, mentions, and watcher activity will appear here as the workspace gets active.
              </p>
              <Link
                href={'/inbox' as Route}
                onClick={closeNotifications}
                className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Open inbox
              </Link>
            </div>
          ) : null}

          {notifications.items.map((item) => {
            const cardClasses = cn(
              'rounded-[1.3rem] border px-4 py-4 transition',
              item.unread
                ? 'border-emerald-300/22 bg-emerald-300/8'
                : 'border-white/8 bg-white/[0.04] hover:bg-white/[0.06]',
            );

            return (
              <div key={item.id} className={cardClasses}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-white/58">
                      {item.body}
                    </p>
                  </div>
                  {item.unread ? (
                    <span aria-hidden="true" className="mt-1 inline-flex size-2 rounded-full bg-emerald-300" />
                  ) : null}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-white/38">
                  <span>{item.branchName ?? kindLabel[item.kind]}</span>
                  <span>{item.createdAtLabel}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-white/36">
                    {kindLabel[item.kind]}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.unread ? (
                      <NotificationMarkReadForm
                        notificationId={item.id}
                        returnPath={returnPath}
                        buttonClassName="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        errorClassName="max-w-xs rounded-[1rem] border border-red-400/25 bg-red-500/10 px-3 py-2 text-[11px] leading-5 text-red-100"
                      />
                    ) : null}
                    <form action={openNotificationAction}>
                      <input type="hidden" name="notificationId" value={item.id} />
                      <input type="hidden" name="href" value={item.href} />
                      <input type="hidden" name="returnPath" value={returnPath} />
                      <button
                        type="submit"
                        onClick={closeNotifications}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/10"
                      >
                        Open
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-white/8 pt-4">
          <Link
            href={'/inbox' as Route}
            onClick={closeNotifications}
            className="inline-flex w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Open inbox
          </Link>
        </div>
      </aside>
    </>
  );
}
