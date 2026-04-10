import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DateTimePickerField } from './date-time-picker-field';

describe('DateTimePickerField', () => {
  it('renders a premium trigger and updates the hidden form value when a day is selected', () => {
    const { container } = render(
      <DateTimePickerField
        id="reportedAt"
        name="reportedAt"
        defaultValue="2026-04-10T09:30"
        variant="reported"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /incident timing/i }));
    fireEvent.click(screen.getByRole('button', { name: /Saturday, 18 April 2026/i }));

    expect(container.querySelector('input[name="reportedAt"]')).toHaveValue('2026-04-18T09:30');
  });

  it('updates the selected time controls and clears optional values', () => {
    const { container } = render(
      <DateTimePickerField id="dueAt" name="dueAt" defaultValue="2026-04-10T09:30" variant="due" />,
    );

    fireEvent.click(screen.getByRole('button', { name: /target timing/i }));
    fireEvent.change(screen.getByLabelText('Hour'), { target: { value: '14' } });
    fireEvent.change(screen.getByLabelText('Minute'), { target: { value: '45' } });

    expect(container.querySelector('input[name="dueAt"]')).toHaveValue('2026-04-10T14:45');

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(container.querySelector('input[name="dueAt"]')).toHaveValue('');
  });

  it('keeps required flows from rendering the clear action', () => {
    render(
      <DateTimePickerField
        id="reportedAt"
        name="reportedAt"
        defaultValue="2026-04-10T09:30"
        variant="reported"
        allowClear={false}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /incident timing/i }));

    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument();
  });

  it('supports keyboard navigation across the calendar and returns focus on close', async () => {
    const { container } = render(
      <DateTimePickerField
        id="reportedAt"
        name="reportedAt"
        defaultValue="2026-04-10T09:30"
        variant="reported"
      />,
    );

    const trigger = screen.getByRole('button', { name: /incident timing/i });

    fireEvent.keyDown(trigger, { key: 'ArrowDown' });

    const initialDay = screen.getByRole('button', { name: /Friday, 10 April 2026/i });
    await waitFor(() => {
      expect(initialDay).toHaveFocus();
    });

    fireEvent.keyDown(initialDay, { key: 'ArrowRight' });

    const nextDay = screen.getByRole('button', { name: /Saturday, 11 April 2026/i });
    await waitFor(() => {
      expect(nextDay).toHaveFocus();
    });

    fireEvent.keyDown(nextDay, { key: 'Enter' });

    expect(container.querySelector('input[name="reportedAt"]')).toHaveValue('2026-04-11T09:30');

    fireEvent.keyDown(nextDay, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: /incident timing picker/i })).not.toBeInTheDocument();
    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
});
