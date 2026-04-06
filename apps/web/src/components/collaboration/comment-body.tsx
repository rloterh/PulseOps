import { splitMentionMarkup } from '@/features/collaboration/lib/mention-markup';

export function CommentBody({ body }: { body: string }) {
  const paragraphs = body.split(/\n{2,}/);

  return (
    <div className="space-y-3 text-sm leading-7 text-white/70">
      {paragraphs.map((paragraph, index) => (
        <p key={`${paragraph}-${String(index)}`} className="whitespace-pre-wrap">
          {splitMentionMarkup(paragraph).map((segment, segmentIndex) =>
            segment.type === 'mention' ? (
              <span
                key={`${segment.userId}-${String(segmentIndex)}`}
                className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-xs font-medium text-emerald-100"
              >
                {segment.value}
              </span>
            ) : (
              <span key={`${segment.value}-${String(segmentIndex)}`}>{segment.value}</span>
            ),
          )}
        </p>
      ))}
    </div>
  );
}
