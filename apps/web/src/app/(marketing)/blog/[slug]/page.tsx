import { notFound } from 'next/navigation';
import { ContentArticleBody } from '@/components/marketing/content-article-body';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/content/marketing-content';
import { buildMarketingMetadata } from '@/lib/seo/build-marketing-metadata';

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return buildMarketingMetadata({
      title: 'Blog',
      description: 'PulseOps blog article.',
    });
  }

  return buildMarketingMetadata({
    title: post.title,
    description: post.description,
  });
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="px-6 py-14 lg:px-10">
      <article className="mx-auto max-w-4xl rounded-[var(--radius-2xl)] border border-white/60 bg-white/84 p-8 shadow-[var(--shadow-card)]">
        <MarketingSectionHeading
          eyebrow={post.category}
          title={post.title}
          description={`${post.excerpt} ${post.publishedAt} · ${post.readTime}`}
        />
        <div className="mt-10">
          <ContentArticleBody sections={post.sections} />
        </div>
      </article>
    </main>
  );
}
