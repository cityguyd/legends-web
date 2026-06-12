import { exportConversations } from "@/lib/actions/conversations";

/**
 * GET /conversations/export — full JSON export of the user's saved
 * conversations (all tiers). The proxy redirects unauthenticated visitors to
 * /login before this runs; the 401 below is defense in depth.
 */
export async function GET() {
  const data = await exportConversations();
  if (data === null) {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition":
        'attachment; filename="legends-library-conversations.json"',
    },
  });
}
