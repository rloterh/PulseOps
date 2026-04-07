import { notFound } from 'next/navigation';
import { ContentArticleBody } from '@/components/marketing/content-article-body';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';
import {
  getHelpArticleBySlug,
  getHelpArticles,
} from '@/lib/content/marketing-content';
import { buildMarketingMetadata } from '@/lib/seo/build-marketing-metadata';

export function generateStaticParams() {
  return getHelpArticles().map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getHelpArticleBySlug(slug);

  if (!article) {
    return buildMarketingMetadata({
      title: 'Help Center',
      description: 'PulseOps help article.',
    });
  }

  return buildMarketingMetadata({
    title: article.title,
    description: article.description,
  });
}

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getHelpArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="px-6 py-14 lg:px-10">
      <article className="mx-auto max-w-4xl rounded-[var(--radius-2xl)] border border-white/60 bg-white/84 p-8 shadow-[var(--shadow-card)]">
        <MarketingSectionHeading
          eyebrow={article.category}
          title={article.title}
          description={article.excerpt}
        />
        <div className="mt-10">
          <ContentArticleBody sections={article.sections} />
        </div>
      </article>
    </main>
  );
}
