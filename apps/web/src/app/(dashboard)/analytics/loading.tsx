export default function LoadingAnalyticsPage() {
  return (
    <div className="grid gap-6">
      <div className="space-y-3 rounded-[2rem] border border-white/8 bg-white/[0.04] px-6 py-8">
        <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-64 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
      </div>

      <div className="h-28 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/[0.04]" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-40 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/[0.04]" />
        <div className="h-40 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/[0.04]" />
        <div className="h-40 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/[0.04]" />
        <div className="h-40 animate-pulse rounded-[1.5rem] border border-white/8 bg-white/[0.04]" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="h-[22rem] animate-pulse rounded-[1.5rem] border border-white/8 bg-white/[0.04]" />
        <div className="h-[22rem] animate-pulse rounded-[1.5rem] border border-white/8 bg-white/[0.04]" />
      </div>
    </div>
  );
}
