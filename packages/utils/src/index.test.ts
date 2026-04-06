import { describe, expect, it } from 'vitest';
import { cn } from './index';

describe('cn', () => {
  it('joins truthy class names', () => {
    expect(cn('alpha', false, undefined, 'beta')).toBe('alpha beta');
  });
});
