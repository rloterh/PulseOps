import type { BillingStatusPresentation } from '@/features/billing/lib/get-billing-status-presentation';

export function getBillingFlashPresentation(
  status?: string,
): BillingStatusPresentation | null {
  switch (status) {
    case 'checkout-success':
      return {
        tone: 'success',
        title: 'Checkout completed',
        description:
          'Stripe checkout finished successfully. The workspace subscription will stay in sync through the webhook path.',
      };
    case 'plan-updated':
      return {
        tone: 'success',
        title: 'Plan updated',
        description:
          'The workspace plan was updated successfully and the latest subscription state has been synced.',
      };
    case 'cancel-scheduled':
      return {
        tone: 'warning',
        title: 'Cancellation scheduled',
        description:
          'The subscription will stop renewing at the end of the current billing period unless you resume it before then.',
      };
    case 'cancel-resumed':
      return {
        tone: 'success',
        title: 'Renewal resumed',
        description:
          'Automatic renewal is active again and the workspace will stay on the paid plan unless you change it later.',
      };
    case 'no-change':
      return {
        tone: 'neutral',
        title: 'No billing change needed',
        description:
          'The selected plan already matches the active subscription, so nothing needed to change.',
      };
    case 'no-subscription':
      return {
        tone: 'warning',
        title: 'No active subscription found',
        description:
          'This workspace does not currently have a synced paid subscription to update or cancel.',
      };
    case 'billing-unavailable':
      return {
        tone: 'warning',
        title: 'Billing is not configured',
        description:
          'Stripe environment variables are missing in this environment, so checkout and portal actions are unavailable.',
      };
    case 'rate-limited':
      return {
        tone: 'warning',
        title: 'Billing action paused',
        description:
          'Too many billing actions were requested in a short window. Wait a moment, then try again from the billing page.',
      };
    case 'no-customer':
      return {
        tone: 'warning',
        title: 'No Stripe customer linked yet',
        description:
          'Start checkout once to create and link the Stripe customer, then the billing portal will be available for that workspace.',
      };
    case 'forbidden':
      return {
        tone: 'danger',
        title: 'Billing access denied',
        description:
          'Only organization owners and admins can manage subscriptions, plan changes, or the Stripe portal.',
      };
    case 'invalid-action':
      return {
        tone: 'warning',
        title: 'Billing action could not be completed',
        description:
          'The requested billing transition was not valid for the current subscription state.',
      };
    case 'checkout-canceled':
      return {
        tone: 'neutral',
        title: 'Checkout canceled',
        description:
          'Stripe checkout was canceled before a subscription was created. You can restart checkout whenever you are ready.',
      };
    case 'checkout-error':
      return {
        tone: 'warning',
        title: 'Checkout unavailable',
        description:
          'Stripe could not create a checkout session right now. Please try again in a moment.',
      };
    case 'invalid-plan':
      return {
        tone: 'warning',
        title: 'Plan selection unavailable',
        description:
          'The selected plan was not valid for checkout. Choose one of the supported paid plans and try again.',
      };
    default:
      return null;
  }
}
