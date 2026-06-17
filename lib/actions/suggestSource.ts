"use server";

/**
 * Server action behind the "Know a source we missed?" form on the refusal card.
 *
 * When the engine refuses (no source addresses the question), the user can tell
 * us about a source that does. Those suggestions land in `source_suggestions`
 * (migration 009) for later review. Like `notifyMe`, captures run server-side
 * through the service-role client only — the table has RLS enabled with no anon
 * policy, so the public API can't be used to stuff it.
 */

import { createServiceClient } from "@/lib/supabase/service";

export async function suggestSource(
  figureSlug: string,
  question: string,
  rawSource: string,
  rawEmail?: string
): Promise<void> {
  const suggestedSource = rawSource.trim();
  if (!suggestedSource) {
    throw new Error("A source link or description is required.");
  }

  // Email is optional; validate only when the user typed something.
  const email = rawEmail?.trim().toLowerCase() || null;
  if (email && !email.includes("@")) {
    throw new Error("Enter a valid email, or leave it blank.");
  }

  const service = createServiceClient();

  // Resolve the figure id when we can, but never drop a suggestion just because
  // the slug didn't match — the slug + question are still useful on their own.
  let figureId: string | null = null;
  if (figureSlug) {
    const { data } = await service
      .from("figures")
      .select("id")
      .eq("slug", figureSlug)
      .maybeSingle();
    figureId = (data?.id as string | undefined) ?? null;
  }

  const { error } = await service.from("source_suggestions").insert({
    figure_id: figureId,
    figure_slug: figureSlug || null,
    question: question?.trim() || null,
    suggested_source: suggestedSource,
    email,
  });

  if (error) {
    console.error("suggestSource: insert failed", error);
    throw new Error("Could not record your suggestion. Please try again.");
  }
}
