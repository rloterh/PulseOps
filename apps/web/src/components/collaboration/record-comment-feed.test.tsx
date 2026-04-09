import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecordCommentFeed } from './record-comment-feed';

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

vi.mock('@/features/collaboration/actions/delete-record-comment-action', () => ({
  deleteRecordCommentAction: vi.fn(),
}));

describe('RecordCommentFeed', () => {
  beforeEach(() => {
    useActionStateMock.mockReset();
    useFormStatusMock.mockReturnValue({ pending: false });
  });

  it('renders delete-comment errors', () => {
    useActionStateMock.mockReturnValueOnce([
      { error: 'Comment removal failed' },
      vi.fn(),
    ]);

    render(
      createElement(RecordCommentFeed, {
        entityType: 'incident',
        entityId: 'incident-1',
        returnPath: '/incidents/incident-1',
        comments: [
          {
            id: 'comment-1',
            entityType: 'incident',
            entityId: 'incident-1',
            kind: 'comment',
            body: 'Need eyes on this.',
            bodyText: 'Need eyes on this.',
            authorUserId: 'user-1',
            authorName: 'Alex Morgan',
            createdAtLabel: 'Just now',
            isEdited: false,
            canDelete: true,
            mentions: [],
          },
        ],
      }),
    );

    expect(screen.getByText('Comment removal failed')).toBeInTheDocument();
  });
});
