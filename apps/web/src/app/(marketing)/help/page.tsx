import type { Route } from 'next';
import { ContentListCard } from '@/components/marketing/content-list-card';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';
import { getHelpArticles } from '@/lib/content/marketing-content';
import { buildMarketingMetadata } from '@/lib/seo/build-marketing-metadata';

export const metadata = buildMarketingMetadata({
  title: 'Help Center',
  description:
    'Find onboarding, analytics, and billing help articles for the current PulseOps product surface.',
});

export default function HelpIndexPage() {
  const articles = getHelpArticles();

  return (
    <main className="px-6 py-14 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <MarketingSectionHeading
          eyebrow="Help center"
          title="Support content that matches the live product."
          description="The help center is designed for onboarding, troubleshooting, and operational how-to content without splitting into a second product language."
        />
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-3">
        {articles.map((article) => (
          <ContentListCard
            key={article.slug}
            eyebrow={article.category}
            title={article.title}
            description={article.excerpt}
            href={`/help/${article.slug}` as Route}
          />
        ))}
      </section>
    </main>
  );
}
