'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signInAction } from '../actions/sign-in-action';
import type { AuthActionState } from '../types';
import { FormSubmitButton } from './form-submit-button';

const initialState: AuthActionState = {};

export function SignInForm() {
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={searchParams.get('next') ?? ''} />

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-[var(--color-fg)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
          placeholder="you@workspace.com"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-[var(--color-fg)]"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
          placeholder="Enter your password"
        />
      </div>

      {state.error ? (
        <p className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      <FormSubmitButton pendingLabel="Signing in...">Sign in</FormSubmitButton>

      <p className="text-sm text-[var(--color-fg-muted)]">
        New to PulseOps?{' '}
        <Link href="/sign-up" className="font-medium text-[var(--color-primary)]">
          Create an account
        </Link>
      </p>
    </form>
  );
}
