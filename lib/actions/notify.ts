"use server";

/**
 * Server action behind the "Notify me when this figure arrives" modal on
 * Coming Soon figures.
 *
 * `notify_signups` has RLS enabled with no anon policy *by design*: captures
 * run server-side through the service-role client only, so the public anon API
 * can't be used to stuff the table. Repeat submits are a no-op via the
 * unique(email, figure_id) constraint.
 */

import { createServiceClient } from "@/lib/supabase/service";

export async function notifyMe(
  figureSlug: string,
  rawEmail: string
): Promise<void> {
  const email = rawEmail.trim().toLowerCase();
  // The <input type="email" required> is the primary gate; this is a cheap
  // server-side backstop, not full validation.
  if (!email || !email.includes("@")) {
    throw new Error("A valid email is required.");
  }

  const service = createServiceClient();

  const { data: figure, error: figureError } = await service
    .from("figures")
    .select("id")
    .eq("slug", figureSlug)
    .maybeSingle();

  if (figureError) {
    console.error("notifyMe: figure lookup failed", figureError);
    throw new Error("Could not record your signup. Please try again.");
  }
  if (!figure) {
    throw new Error(`Unknown figure: ${figureSlug}`);
  }

  const { error: insertError } = await service.from("notify_signups").upsert(
    { email, figure_id: figure.id as string },
    { onConflict: "email,figure_id", ignoreDuplicates: true }
  );

  if (insertError) {
    console.error("notifyMe: insert failed", insertError);
    throw new Error("Could not record your signup. Please try again.");
  }
}
