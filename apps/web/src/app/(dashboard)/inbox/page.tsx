import type { Route } from 'next';
import Link from 'next/link';
import { markAllNotificationsReadAction } from '@/features/notifications/actions/mark-all-notifications-read-action';
import { markNotificationReadAction } from '@/features/notifications/actions/mark-notification-read-action';
import { openNotificationAction } from '@/features/notifications/actions/open-notification-action';
import { NotificationArchiveForm } from '@/features/notifications/components/notification-archive-form';
import { parseNotificationView } from '@/features/notifications/lib/parse-notification-view';
import { getInboxNotifications } from '@/features/notifications/queries/get-inbox-notifications';
import { requireTenantMember } from '@/lib/auth/require-tenant-member';

function getInboxViewHref(view: 'all' | 'unread' | 'archived'): Route {
  if (view === 'all') {
    return '/inbox';
  }

  return `/inbox?view=${view}` as Route;
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const context = await requireTenantMember();
  const resolvedSearchParams = await searchParams;
  const view = parseNotificationView(resolvedSearchParams.view);
  const inbox = await getInboxNotifications({
    tenantId: context.tenantId,
    viewerId: context.viewerId,
    view,
  });
  const returnPath = getInboxViewHref(view);

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-5 rounded-[2rem] border border-white/8 bg-[linear-gradient(135deg,rgba(6,16,29,0.94),rgba(8,27,44,0.84))] px-6 py-6 shadow-[0_26px_80px_rgba(2,6,23,0.42)] md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/74">
              Inbox
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Triage watcher activity and record updates
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58 sm:text-base">
              The inbox gathers branch activity for records you follow, including comments, assignments, and status movement. Archive what is handled and keep unread items visible until the team has triaged them.
            </p>
          </div>

          {inbox.unreadCount > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <input type="hidden" name="returnPath" value={returnPath} />
              <button
                type="submit"
                className="inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Mark all unread as read
              </button>
            </form>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Link
            href={getInboxViewHref('all')}
            className={`rounded-[1.4rem] border px-4 py-4 transition ${
              view === 'all'
                ? 'border-emerald-300/20 bg-emerald-300/10'
                : 'border-white/8 bg-white/[0.04] hover:bg-white/[0.06]'
            }`}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/42">Open</p>
            <p className="mt-3 text-2xl font-semibold text-white">{inbox.totalCount}</p>
            <p className="mt-2 text-sm text-white/56">Active notifications waiting in the working feed.</p>
          </Link>
          <Link
            href={getInboxViewHref('unread')}
            className={`rounded-[1.4rem] border px-4 py-4 transition ${
              view === 'unread'
                ? 'border-emerald-300/20 bg-emerald-300/10'
                : 'border-white/8 bg-white/[0.04] hover:bg-white/[0.06]'
            }`}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/42">Unread</p>
            <p className="mt-3 text-2xl font-semibold text-white">{inbox.unreadCount}</p>
            <p className="mt-2 text-sm text-white/56">Needs acknowledgement from the current operator.</p>
          </Link>
          <Link
            href={getInboxViewHref('archived')}
            className={`rounded-[1.4rem] border px-4 py-4 transition ${
              view === 'archived'
                ? 'border-emerald-300/20 bg-emerald-300/10'
                : 'border-white/8 bg-white/[0.04] hover:bg-white/[0.06]'
            }`}
          >
            <p className="text-xs uppercase tracking-[0.18em] text-white/42">Archived</p>
            <p className="mt-3 text-2xl font-semibold text-white">{inbox.archivedCount}</p>
            <p className="mt-2 text-sm text-white/56">Handled notifications kept for traceability.</p>
          </Link>
        </div>
      </header>

      {inbox.items.length === 0 ? (
        <section className="rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-12 text-center shadow-[0_20px_70px_rgba(2,6,23,0.2)]">
          <h2 className="text-xl font-semibold tracking-tight text-white">No notifications in this view</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/56 sm:text-base">
            New comments, assignments, and status changes will land here as the team works through incidents, jobs, and tasks.
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {inbox.items.map((item) => (
            <article
              key={item.id}
              className={`rounded-[1.6rem] border px-5 py-5 shadow-[0_20px_60px_rgba(2,6,23,0.22)] ${
                item.unread
                  ? 'border-emerald-300/18 bg-emerald-300/[0.08]'
                  : 'border-white/8 bg-white/[0.04]'
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/38">
                    <span>{item.kind}</span>
                    <span>{item.branchName ?? 'Branch activity'}</span>
                    <span>{item.createdAtLabel}</span>
                    {item.unread ? (
                      <span className="rounded-full bg-emerald-300 px-2 py-1 text-[10px] font-semibold text-neutral-950">
                        Unread
                      </span>
                    ) : null}
                    {item.archived ? (
                      <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold text-white/58">
                        Archived
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">
                    {item.title}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-white/62">
                    {item.body}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <form action={openNotificationAction}>
                    <input type="hidden" name="notificationId" value={item.id} />
                    <input type="hidden" name="href" value={item.href} />
                    <input type="hidden" name="returnPath" value={returnPath} />
                    <button
                      type="submit"
                      className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
                    >
                      Open record
                    </button>
                  </form>
                  {item.unread ? (
                    <form action={markNotificationReadAction}>
                      <input type="hidden" name="notificationId" value={item.id} />
                      <input type="hidden" name="returnPath" value={returnPath} />
                      <button
                        type="submit"
                        className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                      >
                        Mark read
                      </button>
                    </form>
                  ) : null}
                  <NotificationArchiveForm
                    archived={item.archived}
                    notificationId={item.id}
                    returnPath={returnPath}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
