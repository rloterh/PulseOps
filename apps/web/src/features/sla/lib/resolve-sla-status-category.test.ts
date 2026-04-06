import { describe, expect, it } from 'vitest';
import { resolveSlaStatusCategory } from './resolve-sla-status-category';

describe('resolveSlaStatusCategory', () => {
  it('marks active incident statuses as active', () => {
    expect(resolveSlaStatusCategory('incident', 'investigating')).toBe('active');
  });

  it('marks terminal incident statuses as terminal', () => {
    expect(resolveSlaStatusCategory('incident', 'resolved')).toBe('terminal');
    expect(resolveSlaStatusCategory('incident', 'closed')).toBe('terminal');
  });

  it('marks terminal job statuses as terminal', () => {
    expect(resolveSlaStatusCategory('job', 'completed')).toBe('terminal');
    expect(resolveSlaStatusCategory('job', 'cancelled')).toBe('terminal');
  });

  it('marks terminal task statuses as terminal', () => {
    expect(resolveSlaStatusCategory('task', 'completed')).toBe('terminal');
    expect(resolveSlaStatusCategory('task', 'cancelled')).toBe('terminal');
  });

  it('recognizes future paused statuses across entity types', () => {
    expect(resolveSlaStatusCategory('incident', 'waiting_on_customer')).toBe('paused');
    expect(resolveSlaStatusCategory('job', 'waiting_on_third_party')).toBe('paused');
    expect(resolveSlaStatusCategory('task', 'on_hold')).toBe('paused');
  });
});
