type StripeCancel = {
  subscriptions: { cancel: (id: string) => Promise<unknown> };
};

/**
 * Cancels a Stripe subscription before account deletion.
 *
 * Already-cancelled and not-found errors are silent (the goal is already met).
 * All other Stripe errors are logged but also non-fatal: we never want an
 * infrastructure hiccup to leave a user unable to delete their own account.
 */
export async function cancelSubscriptionIfPresent(
  subscriptionId: string | null,
  stripe: StripeCancel
): Promise<void> {
  if (!subscriptionId) return;

  try {
    await stripe.subscriptions.cancel(subscriptionId);
  } catch (err: unknown) {
    const isGone =
      err instanceof Error &&
      (err.message.includes("No such subscription") ||
        err.message.includes("already been canceled"));
    if (!isGone) {
      console.error(
        `deleteAccount: Stripe subscription cancel failed for ${subscriptionId} — proceeding with deletion`,
        err
      );
    }
  }
}
