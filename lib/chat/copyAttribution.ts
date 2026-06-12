const ATTRIBUTION = "\n\n— via Legends Library, legendslibrary.com";

export type CopyTier = "anonymous" | "free" | "pro";

export function withAttribution(text: string, tier: CopyTier): string {
  return tier === "pro" ? text : text + ATTRIBUTION;
}
