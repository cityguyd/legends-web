import { redirect } from "next/navigation";
import { getSiteUrl, getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/server";

/**
 * GET/POST /api/stripe/checkout — start a Premium subscription checkout.
 * The pricing page and account page link here as plain anchors, hence GET;
 * POST behaves identically for form-based callers.
 */
async function startCheckout(): Promise<never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/pricing");

  // Guard: already Pro — no need to open a second checkout.
  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.tier === "pro") redirect("/account");

  // Guard: STRIPE_PRICE_ID must be set; missing means a deployment config gap.
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) {
    console.error(
      "stripe checkout: STRIPE_PRICE_ID is not set — cannot start checkout"
    );
    redirect("/pricing?checkout=error");
  }

  const siteUrl = getSiteUrl();
  let checkoutUrl: string | null = null;
  try {
    const sessionParams: Parameters<
      ReturnType<typeof getStripe>["checkout"]["sessions"]["create"]
    >[0] = {
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: user.id,
      success_url: `${siteUrl}/dashboard?upgraded=1`,
      cancel_url: `${siteUrl}/pricing`,
    };

    // Reuse existing Stripe customer when we already have one, so payment
    // methods and billing history are unified under a single customer object.
    const existingCustomerId =
      typeof profile?.stripe_customer_id === "string"
        ? profile.stripe_customer_id
        : null;
    if (existingCustomerId) {
      sessionParams.customer = existingCustomerId;
    }

    const session = await getStripe().checkout.sessions.create(sessionParams);
    checkoutUrl = session.url;
  } catch (error) {
    console.error("stripe checkout session creation failed", error);
  }

  // redirect() throws NEXT_REDIRECT, so it must live outside the try block.
  if (!checkoutUrl) redirect("/pricing?checkout=error");
  redirect(checkoutUrl);
}

export async function GET() {
  return startCheckout();
}

export async function POST() {
  return startCheckout();
}
