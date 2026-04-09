'use client';

import { useActionState, useState } from 'react';
import { createOrganizationAction } from '../actions/create-organization-action';
import type { CreateOrganizationActionState } from '../types';
import { FormSubmitButton } from '@/features/auth/components/form-submit-button';
import { slugifyOrganizationName } from '@/lib/organizations/slugify-organization-name';

const initialState: CreateOrganizationActionState = {};

export function CreateOrganizationForm() {
  const [state, formAction] = useActionState(
    createOrganizationAction,
    initialState,
  );
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-[var(--color-fg)]">
          Workspace name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="organization"
          value={name}
          onChange={(event) => {
            const nextName = event.target.value;
            setName(nextName);
            if (!slugTouched) {
              setSlug(slugifyOrganizationName(nextName));
            }
          }}
          required
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
          placeholder="Acme Operations"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium text-[var(--color-fg)]">
          Workspace slug
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          autoComplete="off"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugifyOrganizationName(event.target.value));
          }}
          required
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
          placeholder="acme-operations"
        />
        <p className="text-xs leading-5 text-[var(--color-fg-muted)]">
          Lowercase letters, numbers, and hyphens only.
        </p>
      </div>

      {state.error ? (
        <p className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <FormSubmitButton pendingLabel="Creating workspace...">
        Create workspace
      </FormSubmitButton>
    </form>
  );
}
