export function ModulePlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-6 py-8 shadow-[0_24px_70px_rgba(2,6,23,0.28)]">
        <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/72">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/56 sm:text-base">
          {description}
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          'Ready for richer tables and filters',
          'Already wrapped by the protected shell',
          'Can absorb real Sprint 3 domain logic without information-architecture churn',
        ].map((item) => (
          <article
            key={item}
            className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-5"
          >
            <p className="text-sm leading-6 text-white/60">{item}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
