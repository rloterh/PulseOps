import { shouldPreferLazyHydration } from '@/lib/performance/lazy';

describe('shouldPreferLazyHydration', () => {
  it('keeps above-the-fold interactive UI eager', () => {
    expect(
      shouldPreferLazyHydration({
        estimatedKb: 100,
        aboveTheFold: true,
        interactive: true,
      }),
    ).toBe(false);
  });

  it('prefers lazy loading for heavier non-critical UI', () => {
    expect(
      shouldPreferLazyHydration({
        estimatedKb: 64,
        aboveTheFold: false,
        interactive: false,
      }),
    ).toBe(true);
  });
});
