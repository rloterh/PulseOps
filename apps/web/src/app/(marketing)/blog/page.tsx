import type { Route } from 'next';
import { ContentListCard } from '@/components/marketing/content-list-card';
import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';
import { getBlogPosts } from '@/lib/content/marketing-content';
import { buildMarketingMetadata } from '@/lib/seo/build-marketing-metadata';

export const metadata = buildMarketingMetadata({
  title: 'Blog',
  description:
    'Operational best practices, AI operations guidance, and product storytelling from PulseOps.',
});

export default function BlogIndexPage() {
  const posts = getBlogPosts();

  return (
    <main className="px-6 py-14 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <MarketingSectionHeading
          eyebrow="Blog"
          title="Operational thinking for serious service teams."
          description="PulseOps uses the blog layer for best practices, release storytelling, and case-study-ready narratives that support the product, docs, and SEO surface."
        />
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-3">
        {posts.map((post) => (
          <ContentListCard
            key={post.slug}
            eyebrow={post.category}
            title={post.title}
            description={post.excerpt}
            href={`/blog/${post.slug}` as Route}
            meta={`${post.publishedAt} · ${post.readTime}`}
          />
        ))}
      </section>
    </main>
  );
}
