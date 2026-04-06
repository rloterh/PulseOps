import { describe, expect, it } from 'vitest';
import {
  extractMentionTokens,
  injectMentionMarkup,
  splitMentionMarkup,
  stripMentionMarkup,
} from './mention-markup';

describe('mention-markup', () => {
  it('extracts unique mention tokens from body text', () => {
    expect(
      extractMentionTokens(
        'Check with @[Alex Doe](11111111-1111-1111-1111-111111111111) and @[Alex Doe](11111111-1111-1111-1111-111111111111).',
      ),
    ).toEqual([
      {
        userId: '11111111-1111-1111-1111-111111111111',
        label: 'Alex Doe',
      },
    ]);
  });

  it('strips mention markup into readable text', () => {
    expect(
      stripMentionMarkup(
        'Follow up with @[Riley Ops](22222222-2222-2222-2222-222222222222) before dispatch.',
      ),
    ).toBe('Follow up with @Riley Ops before dispatch.');
  });

  it('injects mention markup into existing body text', () => {
    expect(
      injectMentionMarkup('Need approval from', {
        userId: '33333333-3333-3333-3333-333333333333',
        label: 'Taylor Lead',
      }),
    ).toBe(
      'Need approval from @[Taylor Lead](33333333-3333-3333-3333-333333333333)',
    );
  });

  it('splits markup into text and mention segments', () => {
    expect(
      splitMentionMarkup(
        'Ping @[Morgan](44444444-4444-4444-4444-444444444444) if the vendor slips.',
      ),
    ).toEqual([
      { type: 'text', value: 'Ping ' },
      {
        type: 'mention',
        value: '@Morgan',
        userId: '44444444-4444-4444-4444-444444444444',
      },
      { type: 'text', value: ' if the vendor slips.' },
    ]);
  });
});
