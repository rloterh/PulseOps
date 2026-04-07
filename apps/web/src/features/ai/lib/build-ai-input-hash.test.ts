import { describe, expect, it } from 'vitest';
import { buildAiInputHash } from '@/features/ai/lib/build-ai-input-hash';

describe('buildAiInputHash', () => {
  it('returns the same hash for identical payloads', () => {
    const payload = {
      scope: 'All branches',
      totals: {
        backlog: 4,
        incidents: 2,
      },
    };

    expect(buildAiInputHash(payload)).toBe(buildAiInputHash(payload));
  });

  it('changes when the payload changes', () => {
    expect(
      buildAiInputHash({
        scope: 'All branches',
        backlog: 4,
      }),
    ).not.toBe(
      buildAiInputHash({
        scope: 'All branches',
        backlog: 5,
      }),
    );
  });
});

