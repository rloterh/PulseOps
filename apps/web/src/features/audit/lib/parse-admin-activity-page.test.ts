import { describe, expect, it } from 'vitest';
import { parseAdminActivityPage } from '@/features/audit/lib/parse-admin-activity-page';

describe('parseAdminActivityPage', () => {
  it('returns the default page when the param is missing', () => {
    expect(parseAdminActivityPage({})).toBe(1);
  });

  it('returns the parsed page when it is valid', () => {
    expect(parseAdminActivityPage({ page: '3' })).toBe(3);
  });

  it('falls back when the page is invalid', () => {
    expect(parseAdminActivityPage({ page: '0' })).toBe(1);
    expect(parseAdminActivityPage({ page: '-2' })).toBe(1);
    expect(parseAdminActivityPage({ page: 'abc' })).toBe(1);
  });
});
