import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses RLS. SERVER ONLY.
 *
 * NEVER import this module from a client component. The `server-only` package
 * is not installed in this project, so the runtime guard below is the
 * equivalent: it crashes immediately if this code ever reaches a browser
 * bundle instead of silently leaking the service-role key.
 */
// (vitest's jsdom environment also defines `window` — exempt it.)
if (typeof window !== "undefined" && !process.env.VITEST) {
  throw new Error(
    "lib/supabase/service.ts is server-only and must never be bundled for the browser"
  );
}

/**
 * Created lazily (function, not module-level singleton) so builds succeed
 * without env vars set; callers only pay at request time.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
