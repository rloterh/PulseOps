import type { ReactNode } from 'react';

export function WidgetCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_20px_70px_rgba(2,6,23,0.28)]">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-white/46">{description}</p>
      </div>
      {children}
    </section>
  );
}
