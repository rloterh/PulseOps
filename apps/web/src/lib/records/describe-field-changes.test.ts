import { describe, expect, it } from 'vitest';
import { describeFieldChanges } from './describe-field-changes';

describe('describeFieldChanges', () => {
  it('returns an empty string when no values changed', () => {
    expect(
      describeFieldChanges([
        {
          label: 'Title',
          before: 'Ops triage',
          after: 'Ops triage',
        },
      ]),
    ).toBe('');
  });

  it('summarizes changed values and normalizes blank fields', () => {
    expect(
      describeFieldChanges([
        {
          label: 'Title',
          before: 'Old title',
          after: 'New title',
        },
        {
          label: 'Resolution',
          before: '',
          after: 'Vendor confirmed repair',
        },
      ]),
    ).toBe(
      'Title: Old title -> New title. Resolution: Not set -> Vendor confirmed repair.',
    );
  });
});
