import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationPanel } from './notification-panel';

const {
  closeNotificationsMock,
  useActionStateMock,
  useFormStatusMock,
  usePathnameMock,
  useShellUiStoreMock,
} = vi.hoisted(() => ({
  closeNotificationsMock: vi.fn(),
  useActionStateMock: vi.fn(),
  useFormStatusMock: vi.fn(() => ({ pending: false })),
  usePathnameMock: vi.fn(() => '/dashboard'),
  useShellUiStoreMock: vi.fn(),
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

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: () => void;
    className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@/features/shell/stores/shell-ui.store', () => ({
  useShellUiStore: useShellUiStoreMock,
}));

vi.mock('@/features/notifications/actions/mark-all-notifications-read-action', () => ({
  markAllNotificationsReadAction: vi.fn(),
}));

vi.mock('@/features/notifications/actions/mark-notification-read-action', () => ({
  markNotificationReadAction: vi.fn(),
}));

vi.mock('@/features/notifications/actions/open-notification-action', () => ({
  openNotificationAction: vi.fn(),
}));

describe('NotificationPanel', () => {
  beforeEach(() => {
    closeNotificationsMock.mockReset();
    useActionStateMock.mockReset();
    useFormStatusMock.mockReturnValue({ pending: false });
    usePathnameMock.mockReturnValue('/dashboard');
    useShellUiStoreMock.mockReturnValue({
      isNotificationsOpen: true,
      closeNotifications: closeNotificationsMock,
    });
  });

  it('renders compact read controls when notifications are open', () => {
    useActionStateMock
      .mockReturnValueOnce([{}, vi.fn()])
      .mockReturnValueOnce([{}, vi.fn()]);

    render(
      createElement(NotificationPanel, {
        notifications: {
          unreadCount: 1,
          items: [
            {
              id: 'notification-1',
              title: 'New incident update',
              body: 'The record moved into investigation.',
              createdAtLabel: 'Just now',
              kind: 'incident',
              eventType: 'status_change',
              unread: true,
              archived: false,
              href: '/incidents/incident-1',
              branchName: 'HQ',
            },
          ],
        },
      }),
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Mark all read')).toBeInTheDocument();
    expect(screen.getByText('Mark read')).toBeInTheDocument();
  });

  it('renders inline read-action errors in the shell panel', () => {
    useActionStateMock
      .mockReturnValueOnce([{}, vi.fn()])
      .mockReturnValueOnce([{ error: 'Mark read failed' }, vi.fn()]);

    render(
      createElement(NotificationPanel, {
        notifications: {
          unreadCount: 1,
          items: [
            {
              id: 'notification-1',
              title: 'New incident update',
              body: 'The record moved into investigation.',
              createdAtLabel: 'Just now',
              kind: 'incident',
              eventType: 'status_change',
              unread: true,
              archived: false,
              href: '/incidents/incident-1',
              branchName: 'HQ',
            },
          ],
        },
      }),
    );

    expect(screen.getByText('Mark read failed')).toBeInTheDocument();
  });
});
