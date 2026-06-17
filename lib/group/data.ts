import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { tallySeats } from "@/lib/group/seats";

export interface GroupMember {
  id: string;
  displayName: string | null;
  isAdmin: boolean;
}

export interface PendingInvite {
  email: string;
  createdAt: string;
}

export interface GroupAdminView {
  groupId: string;
  tier: string;
  seatCount: number;
  used: number;
  available: number;
  members: GroupMember[];
  pendingInvites: PendingInvite[];
}

/**
 * The current user's group, viewed as its admin. Returns null when the caller
 * isn't signed in or isn't a group admin — the page renders a fallback then.
 */
export async function getGroupAdminView(): Promise<GroupAdminView | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const svc = createServiceClient();
  const { data: me } = await svc
    .from("profiles")
    .select("id, group_id, group_role, seat_count, tier")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || me.group_role !== "admin" || !me.group_id) return null;

  const [{ data: memberRows }, { data: inviteRows }] = await Promise.all([
    svc
      .from("profiles")
      .select("id, display_name, group_role")
      .eq("group_id", me.group_id),
    svc
      .from("group_invites")
      .select("email, created_at")
      .eq("group_id", me.group_id)
      .is("accepted_at", null)
      .order("created_at", { ascending: true }),
  ]);

  const members: GroupMember[] = (memberRows ?? []).map((m) => ({
    id: m.id as string,
    displayName: (m.display_name as string | null) ?? null,
    isAdmin: m.group_role === "admin",
  }));
  const pendingInvites: PendingInvite[] = (inviteRows ?? []).map((i) => ({
    email: i.email as string,
    createdAt: i.created_at as string,
  }));

  const seatCount = (me.seat_count as number) ?? 0;
  const { used, available } = tallySeats(
    seatCount,
    members.length,
    pendingInvites.length
  );

  return {
    groupId: me.group_id as string,
    tier: me.tier as string,
    seatCount,
    used,
    available,
    members,
    pendingInvites,
  };
}
