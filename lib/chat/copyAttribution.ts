const ATTRIBUTION = "\n\n— via Legends Library, legendslibrary.com";

export function withAttribution(
  text: string,
  tier: "anonymous" | "free" | "pro"
): string {
  return tier === "pro" ? text : text + ATTRIBUTION;
}
