import { notFound } from 'next/navigation';
import { ContentArticleBody } from '@/components/marketing/content-article-body';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';
import {
  getSeoPageByFamilyAndSlug,
  getSeoPagesByFamily,
} from '@/lib/content/marketing-content';
import { buildMarketingMetadata } from '@/lib/seo/build-marketing-metadata';

export function generateStaticParams() {
  return getSeoPagesByFamily('compare').map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSeoPageByFamilyAndSlug('compare', slug);

  if (!page) {
    return buildMarketingMetadata({
      title: 'Compare',
      description: 'PulseOps comparison page.',
    });
  }

  return buildMarketingMetadata({
    title: page.title,
    description: page.description,
  });
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getSeoPageByFamilyAndSlug('compare', slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="px-6 py-14 lg:px-10">
      <article className="mx-auto max-w-4xl rounded-[var(--radius-2xl)] border border-white/60 bg-white/84 p-8 shadow-[var(--shadow-card)]">
        <MarketingSectionHeading
          eyebrow={page.eyebrow}
          title={page.title}
          description={page.description}
        />
        <div className="mt-10">
          <ContentArticleBody sections={page.sections} />
        </div>
      </article>
    </main>
  );
}
