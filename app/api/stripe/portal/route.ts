import { redirect } from "next/navigation";
import { getSiteUrl, getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/stripe/portal — open the Stripe billing portal for the signed-in
 * subscriber ("Manage Subscription" on /account). Reading stripe_customer_id
 * with the user-scoped client is fine — RLS lets users read their own profile.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  const customer = profile?.stripe_customer_id;
  if (typeof customer !== "string" || customer.length === 0) {
    // Never subscribed — nothing to manage.
    redirect("/pricing");
  }

  let portalUrl: string | null = null;
  try {
    const session = await getStripe().billingPortal.sessions.create({
      customer,
      return_url: `${getSiteUrl()}/account`,
    });
    portalUrl = session.url;
  } catch (error) {
    console.error("stripe billing portal session creation failed", error);
  }

  // redirect() throws NEXT_REDIRECT, so it must live outside the try block.
  if (!portalUrl) redirect("/account?portal=error");
  redirect(portalUrl);
}
