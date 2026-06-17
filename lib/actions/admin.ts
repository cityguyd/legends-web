"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceClient } from "@/lib/supabase/service";

export async function setFigureLive(
  figureId: string,
  live: boolean
): Promise<void> {
  await requireAdmin();
  const db = createServiceClient();
  const { error } = await db
    .from("figures")
    .update({ min_corpus_ok: live })
    .eq("id", figureId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function setQuestionPublished(
  slug: string,
  published: boolean
): Promise<void> {
  await requireAdmin();
  const db = createServiceClient();
  const { error } = await db
    .from("featured_questions")
    .update({ published })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/");
}

/**
 * Provision an organization plan for an existing account (the "email to close"
 * path for Group/Institution — WS5). Makes the user the group admin with the
 * given seat allowance. The group is keyed by their own user id.
 */
export async function provisionGroup(
  rawEmail: string,
  tier: string,
  seatCount: number
): Promise<void> {
  await requireAdmin();
  const email = rawEmail.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  if (tier !== "group" && tier !== "institution") {
    throw new Error("Tier must be 'group' or 'institution'.");
  }
  if (!Number.isFinite(seatCount) || seatCount <= 0) {
    throw new Error("Seat count must be a positive number.");
  }

  const db = createServiceClient();
  // profiles has no email column — resolve the auth user by email.
  const { data: list, error: listErr } = await db.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) throw new Error("Could not look up accounts.");
  const target = list.users.find(
    (u) => u.email?.toLowerCase() === email
  );
  if (!target) {
    throw new Error(`No account found for ${email}. Ask them to sign up first.`);
  }

  const { error } = await db
    .from("profiles")
    .update({
      tier,
      group_id: target.id,
      group_role: "admin",
      seat_count: Math.floor(seatCount),
    })
    .eq("id", target.id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/group");
}
