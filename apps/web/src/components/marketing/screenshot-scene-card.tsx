import type { ScreenshotScene } from '@/content/marketing/content';

export function ScreenshotSceneCard({ scene }: { scene: ScreenshotScene }) {
  return (
    <article className="overflow-hidden rounded-[var(--radius-2xl)] border border-white/60 bg-white/82 shadow-[var(--shadow-card)]">
      <div className="border-b border-white/50 bg-[linear-gradient(165deg,rgba(16,32,30,0.98),rgba(27,67,59,0.94))] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200/75">
          {scene.eyebrow}
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          {scene.title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-white/70">
          {scene.description}
        </p>
      </div>
      <div className="grid gap-4 p-6 sm:grid-cols-3">
        {scene.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-fg-muted)]">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
