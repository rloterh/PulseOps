export function EmptyAnalyticsState({
  title = 'No analytics data in this period',
  description = 'Try widening the reporting window or switching to another branch scope from the shell.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
      <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-white/54">{description}</p>
    </section>
  );
}
