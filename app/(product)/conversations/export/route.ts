import { exportConversations } from "@/lib/actions/conversations";

/**
 * GET /conversations/export — full JSON export of the user's saved
 * conversations (all tiers). The proxy redirects unauthenticated visitors to
 * /login before this runs; the 401 below is defense in depth.
 */
export async function GET() {
  const result = await exportConversations();
  if (result.kind === "unauthenticated") {
    return Response.json({ error: "unauthenticated" }, { status: 401 });
  }
  if (result.kind === "error") {
    return Response.json({ error: "export-failed" }, { status: 500 });
  }
  return new Response(JSON.stringify(result.data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": 'attachment; filename="legends-conversations.json"',
    },
  });
}
