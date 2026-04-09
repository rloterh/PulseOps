import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedListViewsBar } from './saved-list-views-bar';

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

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@/features/list-views/actions/create-saved-list-view-action', () => ({
  createSavedListViewAction: vi.fn(),
}));

vi.mock('@/features/list-views/actions/delete-saved-list-view-action', () => ({
  deleteSavedListViewAction: vi.fn(),
}));

describe('SavedListViewsBar', () => {
  beforeEach(() => {
    useActionStateMock.mockReset();
    useFormStatusMock.mockReturnValue({ pending: false });
  });

  it('renders inline delete errors for saved views', () => {
    useActionStateMock
      .mockReturnValueOnce([{}, vi.fn()])
      .mockReturnValueOnce([{ error: 'Delete failed' }, vi.fn()]);

    render(
      createElement(SavedListViewsBar, {
        resourceType: 'incidents',
        pageHref: '/incidents',
        filtersPayload: '{"status":"open"}',
        maxViews: 5,
        views: [
          {
            id: 'view-1',
            name: 'Morning triage',
            resourceType: 'incidents',
            filters: { status: 'open' },
            href: '/incidents?view=view-1',
            isActive: false,
          },
        ],
      }),
    );

    expect(screen.getByText('Delete failed')).toBeInTheDocument();
  });
});
