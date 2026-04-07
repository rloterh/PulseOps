import { EmptyState } from '@/components/system/empty-state';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
      <div className="w-full">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          404
        </p>
        <EmptyState
          title="The route you requested does not exist."
          description="PulseOps now spans public marketing, billing, analytics, AI, and the protected operations workspace. This URL just does not map to a live route."
          actionHref="/"
          actionLabel="Return home"
        />
      </div>
    </main>
  );
}
