export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only fixed left-4 top-4 z-[100] rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary-fg)] shadow-[var(--shadow-floating)] focus:not-sr-only focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-fg)]"
    >
      Skip to main content
    </a>
  );
}
