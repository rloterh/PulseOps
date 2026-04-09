import { createElement } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IncidentEscalationPanel } from './incident-escalation-panel';

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

vi.mock('@/actions/incidents/create-incident-escalation-action', () => ({
  createIncidentEscalationAction: vi.fn(),
}));

vi.mock('@/actions/incidents/acknowledge-incident-escalation-action', () => ({
  acknowledgeIncidentEscalationAction: vi.fn(),
}));

describe('IncidentEscalationPanel', () => {
  beforeEach(() => {
    useActionStateMock.mockReset();
    useFormStatusMock.mockReturnValue({ pending: false });
  });

  it('renders create-action errors in the panel', () => {
    useActionStateMock.mockReturnValueOnce([{ error: 'Create failed' }, vi.fn()]);

    render(
      createElement(IncidentEscalationPanel, {
        incidentId: 'incident-1',
        escalationLevel: 0,
        escalations: [],
        assignees: [
          {
            id: 'user-1',
            label: 'Alex Morgan',
            role: 'manager',
            email: 'alex@example.com',
            avatarUrl: null,
            isCurrentUser: false,
          },
        ],
        currentAssigneeUserId: null,
        viewerId: 'viewer-1',
        viewerRole: 'manager',
      }),
    );

    expect(screen.getByText('Create failed')).toBeInTheDocument();
  });

  it('renders acknowledge-action errors in the panel', () => {
    useActionStateMock
      .mockReturnValueOnce([{}, vi.fn()])
      .mockReturnValueOnce([{ error: 'Ack failed' }, vi.fn()]);

    render(
      createElement(IncidentEscalationPanel, {
        incidentId: 'incident-1',
        escalationLevel: 2,
        escalations: [
          {
            id: 'escalation-1',
            escalationLevel: 2,
            status: 'pending',
            reason: 'Customer impact is expanding.',
            targetLabel: 'Major incident desk',
            targetUserId: 'viewer-1',
            triggeredByName: 'Sam Lee',
            acknowledgedByName: null,
            triggeredAtLabel: '5 minutes ago',
            acknowledgedAtLabel: null,
            completedAtLabel: null,
          },
        ],
        assignees: [],
        currentAssigneeUserId: null,
        viewerId: 'viewer-1',
        viewerRole: 'manager',
      }),
    );

    expect(screen.getByText('Ack failed')).toBeInTheDocument();
  });
});
