'use client';

import { useFormStatus } from 'react-dom';
import { createBillingPortalSessionAction } from '@/features/billing/actions/create-billing-portal-session-action';
import { createCheckoutSessionAction } from '@/features/billing/actions/create-checkout-session-action';
import { updateSubscriptionRenewalAction } from '@/features/billing/actions/update-subscription-renewal-action';
import type { PlanCode } from '@/lib/billing/plans';

function SubmitButton({
  className,
  label,
  pendingLabel,
  disabled = false,
}: {
  className: string;
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className={className}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function BillingPortalForm({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className: string;
}) {
  return (
    <form action={createBillingPortalSessionAction}>
      <SubmitButton
        className={className}
        label={label}
        pendingLabel={pendingLabel}
      />
    </form>
  );
}

export function BillingCheckoutForm({
  plan,
  label,
  pendingLabel,
  className,
  disabled = false,
}: {
  plan: Exclude<PlanCode, 'free'>;
  label: string;
  pendingLabel: string;
  className: string;
  disabled?: boolean;
}) {
  return (
    <form action={createCheckoutSessionAction}>
      <input type="hidden" name="plan" value={plan} />
      <SubmitButton
        className={className}
        label={label}
        pendingLabel={pendingLabel}
        disabled={disabled}
      />
    </form>
  );
}

export function BillingRenewalForm({
  intent,
  label,
  pendingLabel,
  className,
}: {
  intent: 'cancel' | 'resume';
  label: string;
  pendingLabel: string;
  className: string;
}) {
  return (
    <form action={updateSubscriptionRenewalAction}>
      <input type="hidden" name="intent" value={intent} />
      <SubmitButton
        className={className}
        label={label}
        pendingLabel={pendingLabel}
      />
    </form>
  );
}
