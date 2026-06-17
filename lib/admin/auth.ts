import { createClient } from "@/lib/supabase/server";

export async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error("unauthenticated");
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  if (!adminEmails.includes(user.email.toLowerCase()))
    throw new Error("forbidden");
  return user.email;
}
