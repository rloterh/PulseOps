'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { archiveNotificationAction } from '@/features/notifications/actions/archive-notification-action';
import { unarchiveNotificationAction } from '@/features/notifications/actions/unarchive-notification-action';
import type { NotificationActionState } from '@/features/notifications/types/notification.types';

const initialState: NotificationActionState = {};

function SubmitButton({ archived }: { archived: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving...' : archived ? 'Restore' : 'Archive'}
    </button>
  );
}

export function NotificationArchiveForm({
  archived,
  notificationId,
  returnPath,
}: {
  archived: boolean;
  notificationId: string;
  returnPath: string;
}) {
  const [state, formAction] = useActionState(
    archived ? unarchiveNotificationAction : archiveNotificationAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="notificationId" value={notificationId} />
      <input type="hidden" name="returnPath" value={returnPath} />
      <SubmitButton archived={archived} />
      {state.error ? (
        <p className="max-w-xs rounded-[1rem] border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-100">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
