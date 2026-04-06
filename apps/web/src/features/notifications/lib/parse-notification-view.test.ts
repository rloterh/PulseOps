import { describe, expect, it } from 'vitest';
import { parseNotificationView } from './parse-notification-view';

describe('parseNotificationView', () => {
  it('returns valid notification views', () => {
    expect(parseNotificationView('all')).toBe('all');
    expect(parseNotificationView('unread')).toBe('unread');
    expect(parseNotificationView('archived')).toBe('archived');
  });

  it('falls back to all for invalid values', () => {
    expect(parseNotificationView(undefined)).toBe('all');
    expect(parseNotificationView(['unread'])).toBe('all');
    expect(parseNotificationView('billing')).toBe('all');
  });
});
