import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationArchiveForm } from './notification-archive-form';
import { NotificationMarkAllReadForm } from './notification-mark-all-read-form';
import { NotificationMarkReadForm } from './notification-mark-read-form';

const { useActionStateMock, useFormStatusMock } = vi.hoisted(() => ({
  useActionStateMock: vi.fn(),
  useFormStatusMock: vi.fn(() => ({ pending: false })),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual('react');

  return {
    ...actual,
    useActionState: useActionStateMock,
  };
});

vi.mock('react-dom', async () => {
  const actual = await vi.importActual('react-dom');

  return {
    ...actual,
    useFormStatus: useFormStatusMock,
  };
});

vi.mock('@/features/notifications/actions/archive-notification-action', () => ({
  archiveNotificationAction: vi.fn(),
}));

vi.mock('@/features/notifications/actions/unarchive-notification-action', () => ({
  unarchiveNotificationAction: vi.fn(),
}));

vi.mock('@/features/notifications/actions/mark-notification-read-action', () => ({
  markNotificationReadAction: vi.fn(),
}));

vi.mock('@/features/notifications/actions/mark-all-notifications-read-action', () => ({
  markAllNotificationsReadAction: vi.fn(),
}));

describe('notification feedback forms', () => {
  beforeEach(() => {
    useActionStateMock.mockReset();
    useFormStatusMock.mockReturnValue({ pending: false });
  });

  it('renders archive-action errors', () => {
    useActionStateMock.mockReturnValueOnce([
      { error: 'Archive failed' },
      vi.fn(),
    ]);

    render(
      createElement(NotificationArchiveForm, {
        archived: false,
        notificationId: 'notification-1',
        returnPath: '/inbox',
      }),
    );

    expect(screen.getByText('Archive failed')).toBeInTheDocument();
  });

  it('renders mark-read errors', () => {
    useActionStateMock.mockReturnValueOnce([
      { error: 'Mark read failed' },
      vi.fn(),
    ]);

    render(
      createElement(NotificationMarkReadForm, {
        notificationId: 'notification-1',
        returnPath: '/inbox',
      }),
    );

    expect(screen.getByText('Mark read failed')).toBeInTheDocument();
  });

  it('renders mark-all-read errors', () => {
    useActionStateMock.mockReturnValueOnce([
      { error: 'Mark all failed' },
      vi.fn(),
    ]);

    render(
      createElement(NotificationMarkAllReadForm, {
        returnPath: '/inbox',
      }),
    );

    expect(screen.getByText('Mark all failed')).toBeInTheDocument();
  });
});
