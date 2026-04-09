'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { markAllNotificationsReadAction } from '@/features/notifications/actions/mark-all-notifications-read-action';
import type { NotificationActionState } from '@/features/notifications/types/notification.types';

const initialState: NotificationActionState = {};

function SubmitButton({
  buttonClassName,
  label,
}: {
  buttonClassName: string | undefined;
  label: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={
        buttonClassName ??
        'inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60'
      }
    >
      {pending ? 'Saving...' : label}
    </button>
  );
}

export function NotificationMarkAllReadForm({
  returnPath,
  buttonClassName,
  errorClassName,
  label = 'Mark all unread as read',
}: {
  returnPath: string;
  buttonClassName?: string;
  errorClassName?: string;
  label?: string;
}) {
  const [state, formAction] = useActionState(
    markAllNotificationsReadAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="returnPath" value={returnPath} />
      <SubmitButton buttonClassName={buttonClassName} label={label} />
      {state.error ? (
        <p
          className={
            errorClassName ??
            'max-w-xs rounded-[1rem] border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs leading-5 text-red-100'
          }
        >
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
