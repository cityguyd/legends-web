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

  const siteUrl = getSiteUrl();
  let checkoutUrl: string | null = null;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      client_reference_id: user.id,
      success_url: `${siteUrl}/dashboard?upgraded=1`,
      cancel_url: `${siteUrl}/pricing`,
    });
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
