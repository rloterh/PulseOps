function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="grid gap-6">
      <div className="space-y-3 rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 shadow-[var(--shadow-card)]">
        <SkeletonBlock className="h-4 w-24" />
        <SkeletonBlock className="h-10 w-72 max-w-full" />
        <SkeletonBlock className="h-5 w-5/6 max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock className="h-36 border border-[var(--color-border)] bg-[var(--color-surface)]" />
        <SkeletonBlock className="h-36 border border-[var(--color-border)] bg-[var(--color-surface)]" />
        <SkeletonBlock className="h-36 border border-[var(--color-border)] bg-[var(--color-surface)]" />
        <SkeletonBlock className="h-36 border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <SkeletonBlock className="h-[22rem] border border-[var(--color-border)] bg-[var(--color-surface)]" />
        <SkeletonBlock className="h-[22rem] border border-[var(--color-border)] bg-[var(--color-surface)]" />
      </div>
    </div>
  );
}
