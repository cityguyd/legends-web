"use server";

/**
 * Server actions for the /account page.
 *
 * deleteAccount is the only place outside the Stripe webhook that touches the
 * service-role client: auth.admin.deleteUser requires it. The session user is
 * re-verified server-side first, so a user can only ever delete themselves.
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";
import { cancelSubscriptionIfPresent } from "@/lib/stripe/subscription";

/**
 * Escape hatch after checkout: webhooks can lag a page load, so this simply
 * re-renders /account, re-reading profiles.tier.
 */
export async function refreshSubscriptionStatus(): Promise<void> {
  revalidatePath("/account");
}

export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const service = createServiceClient();

  // Cancel any active Stripe subscription before removing the user.
  const { data: profile } = await service
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .maybeSingle();

  const subscriptionId =
    typeof profile?.stripe_subscription_id === "string"
      ? profile.stripe_subscription_id
      : null;

  await cancelSubscriptionIfPresent(subscriptionId, getStripe());

  // Service role deletes the auth user; the profiles row (and conversations
  // via user_id) cascade from auth.users.
  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("deleteAccount failed", error);
    throw new Error("Account deletion failed. Please try again.");
  }

  // Clear the now-orphaned session cookies; ignore failures (the session is
  // already invalid server-side).
  try {
    await supabase.auth.signOut();
  } catch {
    // Non-fatal.
  }

  redirect("/");
}
