import { MarketingSectionHeading } from '@/components/marketing/marketing-section-heading';
import { ScreenshotSceneCard } from '@/components/marketing/screenshot-scene-card';
import { getScreenshotScenes } from '@/lib/content/marketing-content';
import { buildMarketingMetadata } from '@/lib/seo/build-marketing-metadata';

export const metadata = buildMarketingMetadata({
  title: 'Screenshots',
  description:
    'Case-study-ready product scenes for PulseOps across dashboard, analytics, incidents, and buyer-facing flows.',
});

export default function ScreenshotsPage() {
  const scenes = getScreenshotScenes();

  return (
    <main className="px-6 py-14 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <MarketingSectionHeading
          eyebrow="Screenshots"
          title="Portfolio-ready product scenes for case studies and public storytelling."
          description="Sprint 10 turns screenshots into a stable public gallery so product proof can be reused in portfolios, case studies, recruiting packets, and future public pages."
        />
      </section>

      <section className="mx-auto mt-10 grid max-w-6xl gap-6">
        {scenes.map((scene) => (
          <ScreenshotSceneCard key={scene.slug} scene={scene} />
        ))}
      </section>
    </main>
  );
}
