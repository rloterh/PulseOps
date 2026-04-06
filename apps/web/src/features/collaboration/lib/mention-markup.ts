import type { MentionToken } from '@/features/collaboration/types/collaboration.types';

const mentionPattern = /@\[([^\]]+)\]\(([0-9a-fA-F-]{36})\)/g;

export function extractMentionTokens(body: string): MentionToken[] {
  const mentions = new Map<string, MentionToken>();

  for (const match of body.matchAll(mentionPattern)) {
    const label = match[1]?.trim();
    const userId = match[2]?.trim();

    if (!label || !userId) {
      continue;
    }

    mentions.set(userId, {
      userId,
      label,
    });
  }

  return Array.from(mentions.values());
}

export function stripMentionMarkup(body: string) {
  return body.replaceAll(mentionPattern, (_, label: string) => `@${label}`);
}

export function injectMentionMarkup(body: string, mention: MentionToken) {
  const token = `@[${mention.label}](${mention.userId})`;
  const normalized = body.trimEnd();

  return normalized.length > 0 ? `${normalized} ${token}` : token;
}

export function splitMentionMarkup(body: string) {
  const segments: (
    | { type: 'text'; value: string }
    | { type: 'mention'; value: string; userId: string }
  )[] = [];

  let lastIndex = 0;

  for (const match of body.matchAll(mentionPattern)) {
    const fullMatch = match[0];
    const label = match[1];
    const userId = match[2];
    const startIndex = match.index;

    if (label === undefined || userId === undefined) {
      continue;
    }

    if (startIndex > lastIndex) {
      segments.push({
        type: 'text',
        value: body.slice(lastIndex, startIndex),
      });
    }

    segments.push({
      type: 'mention',
      value: `@${label}`,
      userId,
    });

    lastIndex = startIndex + fullMatch.length;
  }

  if (lastIndex < body.length) {
    segments.push({
      type: 'text',
      value: body.slice(lastIndex),
    });
  }

  return segments;
}
