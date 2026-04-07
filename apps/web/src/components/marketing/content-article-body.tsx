import type { MarketingContentSection } from '@/content/marketing/content';

export function ContentArticleBody({
  sections,
}: {
  sections: MarketingContentSection[];
}) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.title} className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph}
              className="text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base"
            >
              {paragraph}
            </p>
          ))}
          {section.bullets ? (
            <ul className="space-y-3 pl-5 text-sm leading-7 text-[var(--color-fg-muted)] sm:text-base">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="list-disc">
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
          {section.callout ? (
            <div className="rounded-[var(--radius-xl)] border border-emerald-500/20 bg-[color-mix(in_oklab,var(--color-primary)_10%,white)] px-5 py-4 text-sm leading-7 text-[var(--color-fg)]">
              {section.callout}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
