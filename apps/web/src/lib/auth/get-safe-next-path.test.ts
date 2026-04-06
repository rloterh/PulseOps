import { describe, expect, it } from 'vitest';
import { getSafeNextPath } from './get-safe-next-path';

describe('getSafeNextPath', () => {
  it('returns the provided internal path when it is safe', () => {
    expect(getSafeNextPath('/dashboard')).toBe('/dashboard');
    expect(getSafeNextPath('/settings?tab=profile')).toBe('/settings?tab=profile');
  });

  it('falls back when the value is missing or external', () => {
    expect(getSafeNextPath(undefined)).toBe('/dashboard');
    expect(getSafeNextPath(null)).toBe('/dashboard');
    expect(getSafeNextPath('https://example.com')).toBe('/dashboard');
    expect(getSafeNextPath('//evil.example')).toBe('/dashboard');
  });
});
