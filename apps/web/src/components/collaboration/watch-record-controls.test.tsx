import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WatchRecordControls } from './watch-record-controls';

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

vi.mock('@/features/collaboration/actions/watch-record-action', () => ({
  watchRecordAction: vi.fn(),
}));

vi.mock('@/features/collaboration/actions/unwatch-record-action', () => ({
  unwatchRecordAction: vi.fn(),
}));

vi.mock('@/features/collaboration/actions/toggle-watch-mute-action', () => ({
  toggleWatchMuteAction: vi.fn(),
}));

describe('WatchRecordControls', () => {
  beforeEach(() => {
    useActionStateMock.mockReset();
    useFormStatusMock.mockReturnValue({ pending: false });
  });

  it('renders watch-action errors', () => {
    useActionStateMock.mockReturnValueOnce([
      { error: 'Watch update failed' },
      vi.fn(),
    ]);

    render(
      createElement(WatchRecordControls, {
        entityType: 'incident',
        entityId: 'incident-1',
        returnPath: '/incidents/incident-1',
        watchState: {
          isWatching: false,
          isMuted: false,
        },
      }),
    );

    expect(screen.getByText('Watch update failed')).toBeInTheDocument();
  });
});
