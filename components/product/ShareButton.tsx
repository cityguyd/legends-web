"use client";

import { useState } from "react";
import { toggleShareConversation } from "@/lib/actions/conversations";

interface ShareButtonProps {
  conversationId: string;
  initialIsShared: boolean;
}

export function ShareButton({
  conversationId,
  initialIsShared,
}: ShareButtonProps) {
  const [isShared, setIsShared] = useState(initialIsShared);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleShareConversation(conversationId);
    if (result.ok) {
      setIsShared(result.isShared ?? false);
      if (result.isShared) {
        const url = `${window.location.origin}/share/${conversationId}`;
        await navigator.clipboard.writeText(url).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`text-sm font-semibold transition-colors hover:underline disabled:opacity-50 ${
        isShared ? "text-gold-dark" : "text-sub hover:text-gold-dark"
      }`}
    >
      {loading ? "…" : copied ? "Copied!" : isShared ? "Shared ✓" : "Share"}
    </button>
  );
}
