"use server";

/**
 * Group-admin server actions (WS5). The admin manages their organization's
 * seats: invite by email, remove members, revoke pending invites. Members claim
 * a seat the first time they load an authenticated page.
 *
 * Authority is verified server-side: the caller's identity comes from the
 * cookie-bound auth client, and tier/group columns (service-role only) are
 * written through the service client. A "group" is keyed by the admin's user id
 * (profiles.group_id == admin's id).
 */

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { tallySeats } from "@/lib/group/seats";

interface AdminContext {
  adminId: string;
  groupId: string;
  tier: string;
  seatCount: number;
  svc: ReturnType<typeof createServiceClient>;
}

async function requireGroupAdmin(): Promise<AdminContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in.");

  const svc = createServiceClient();
  const { data: profile } = await svc
    .from("profiles")
    .select("id, group_id, group_role, seat_count, tier")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.group_role !== "admin" || !profile.group_id) {
    throw new Error("Only a group admin can manage seats.");
  }
  return {
    adminId: profile.id as string,
    groupId: profile.group_id as string,
    tier: profile.tier as string,
    seatCount: (profile.seat_count as number) ?? 0,
    svc,
  };
}

async function countSeats(
  svc: ReturnType<typeof createServiceClient>,
  groupId: string
): Promise<{ members: number; pending: number }> {
  const [{ count: members }, { count: pending }] = await Promise.all([
    svc
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId),
    svc
      .from("group_invites")
      .select("id", { count: "exact", head: true })
      .eq("group_id", groupId)
      .is("accepted_at", null),
  ]);
  return { members: members ?? 0, pending: pending ?? 0 };
}

export async function inviteToGroup(rawEmail: string): Promise<void> {
  const email = rawEmail.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
  const { groupId, seatCount, svc } = await requireGroupAdmin();

  const { members, pending } = await countSeats(svc, groupId);
  if (tallySeats(seatCount, members, pending).available <= 0) {
    throw new Error(
      "No seats available. Remove a member or revoke a pending invite first."
    );
  }

  const { error } = await svc
    .from("group_invites")
    .upsert(
      { group_id: groupId, email },
      { onConflict: "group_id,email", ignoreDuplicates: true }
    );
  if (error) {
    console.error("inviteToGroup: insert failed", error);
    throw new Error("Could not send the invite. Please try again.");
  }
  revalidatePath("/group");
}

export async function revokeInvite(rawEmail: string): Promise<void> {
  const email = rawEmail.trim().toLowerCase();
  const { groupId, svc } = await requireGroupAdmin();
  const { error } = await svc
    .from("group_invites")
    .delete()
    .eq("group_id", groupId)
    .eq("email", email)
    .is("accepted_at", null);
  if (error) throw new Error("Could not revoke the invite.");
  revalidatePath("/group");
}

export async function removeFromGroup(memberId: string): Promise<void> {
  const { adminId, groupId, svc } = await requireGroupAdmin();
  if (memberId === adminId) {
    throw new Error("The group admin can't remove themselves.");
  }
  const { data: member } = await svc
    .from("profiles")
    .select("id, group_id")
    .eq("id", memberId)
    .maybeSingle();
  if (!member || member.group_id !== groupId) {
    throw new Error("That member isn't in your group.");
  }
  const { error } = await svc
    .from("profiles")
    .update({ group_id: null, group_role: null, seat_count: null, tier: "free" })
    .eq("id", memberId);
  if (error) throw new Error("Could not remove the member.");
  revalidatePath("/group");
}

/**
 * Claim a pending seat for the current user, if one was extended to their email
 * and the group still has room. Idempotent and safe to call on every
 * authenticated page load — it no-ops when the user is already in a group or has
 * no pending invite.
 */
export async function claimGroupInvites(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return;

  const svc = createServiceClient();
  const { data: me } = await svc
    .from("profiles")
    .select("id, group_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || me.group_id) return; // already in a group (or no profile yet)

  const { data: invites } = await svc
    .from("group_invites")
    .select("id, group_id")
    .ilike("email", user.email)
    .is("accepted_at", null)
    .order("created_at", { ascending: true });
  if (!invites || invites.length === 0) return;

  for (const invite of invites) {
    const { data: admin } = await svc
      .from("profiles")
      .select("seat_count, tier")
      .eq("group_id", invite.group_id)
      .eq("group_role", "admin")
      .maybeSingle();
    if (!admin) continue;

    const { members, pending } = await countSeats(svc, invite.group_id as string);
    // This invite is one of `pending`; converting it to a member is seat-neutral,
    // so we only need the group not to be overbooked.
    const tally = tallySeats((admin.seat_count as number) ?? 0, members, pending);
    if (tally.used > tally.total) continue;

    await svc
      .from("profiles")
      .update({
        group_id: invite.group_id,
        group_role: "member",
        tier: admin.tier,
      })
      .eq("id", user.id);
    await svc
      .from("group_invites")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invite.id);
    revalidatePath("/account");
    return; // one seat per user
  }
}
