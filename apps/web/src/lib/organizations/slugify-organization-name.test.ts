import { describe, expect, it } from 'vitest';
import { slugifyOrganizationName } from './slugify-organization-name';

describe('slugifyOrganizationName', () => {
  it('normalizes names into clean workspace slugs', () => {
    expect(slugifyOrganizationName('Acme Operations')).toBe('acme-operations');
    expect(slugifyOrganizationName('  North & West Hub  ')).toBe('north-west-hub');
  });

  it('falls back to workspace when the input does not contain slug characters', () => {
    expect(slugifyOrganizationName('***')).toBe('workspace');
  });
});
