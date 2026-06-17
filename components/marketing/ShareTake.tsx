"use client";

import { useState } from "react";

/**
 * "Share this take" — turns a featured-question permalink into an acquisition
 * event (WS4). Copy link / Download image / Share on X. The rich preview image
 * comes from the route's opengraph-image; "Download image" fetches that same
 * card for Instagram/manual posting.
 */
export function ShareTake({
  question,
  figureName,
}: {
  question: string;
  figureName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  function currentUrl(): string {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      // Reuse the page's OG card. Next serves it at a content-hashed URL, so we
      // read the exact URL from the og:image meta tag rather than guessing it.
      const meta = document.querySelector(
        'meta[property="og:image"]'
      ) as HTMLMetaElement | null;
      const imgUrl = meta?.content;
      if (!imgUrl) throw new Error("no share image available");
      const res = await fetch(imgUrl);
      if (!res.ok) throw new Error("image fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "legends-take.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* surface nothing destructive — the link/X paths still work */
    } finally {
      setDownloading(false);
    }
  }

  const shareText = figureName
    ? `"${question}" — ${figureName}, grounded in primary sources via Legends Library`
    : `"${question}" — grounded in primary sources via Legends Library`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(currentUrl())}`;

  const btn =
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-gold hover:text-gold-dark";

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <span className="text-sm font-semibold text-sub">Share this take:</span>
      <button type="button" onClick={handleCopy} className={btn}>
        {copied ? "Link copied ✓" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className={`${btn} disabled:opacity-50`}
      >
        {downloading ? "Preparing…" : "Download image"}
      </button>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
      >
        Share on X
      </a>
    </div>
  );
}
