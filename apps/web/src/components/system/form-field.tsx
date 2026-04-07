export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium text-[var(--color-fg)]">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-[var(--color-fg-muted)]">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium leading-5 text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function getFieldAriaProps({
  id,
  hint,
  error,
}: {
  id: string;
  hint?: string;
  error?: string;
}) {
  const describedBy = [
    hint ? `${id}-hint` : null,
    error ? `${id}-error` : null,
  ].filter(Boolean);

  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy.length > 0 ? describedBy.join(' ') : undefined,
  };
}
