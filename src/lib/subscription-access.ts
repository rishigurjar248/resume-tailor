/** Compatibility layer for legacy callers. Billing/subscriptions are disabled. */
export interface SubscriptionSnapshot {
  subscription_plan?: string | null;
  subscription_status?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
  stripe_subscription_id?: string | null;
}

export function getSubscriptionAccessState(_subscription?: SubscriptionSnapshot | null) {
  return {
    billingState: 'free' as const,
    isTrialing: false,
    isPastDue: false,
    isWithinAccessWindow: true,
    hasStripeSubscription: false,
    hasProAccess: true,
    isCanceling: false,
    isExpiredProAccess: false,
    needsTrial: false,
    daysRemaining: 0,
    trialDaysRemaining: 0,
    currentPeriodEndLabel: null,
    trialEndLabel: null,
    effectivePlan: 'free' as const,
  };
}
