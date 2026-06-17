"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: "#F7F2E9",
          color: "#2A2118",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "1.5rem",
        }}
      >
        <p
          style={{
            fontSize: "6rem",
            fontWeight: 700,
            color: "#D59E3C",
            opacity: 0.4,
            margin: 0,
            lineHeight: 1,
          }}
        >
          500
        </p>
        <h1
          style={{
            marginTop: "1rem",
            fontSize: "1.875rem",
            fontWeight: 700,
            color: "#2A2118",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            marginTop: "1rem",
            maxWidth: "28rem",
            color: "#6B5D4D",
            lineHeight: 1.6,
          }}
        >
          An unexpected error occurred. You can try again, or return to the
          homepage.
        </p>
        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <button
            type="button"
            onClick={reset}
            style={{
              borderRadius: "0.5rem",
              background: "#D59E3C",
              padding: "0.75rem 1.5rem",
              fontWeight: 600,
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Try Again
          </button>
          <a
            href="/"
            style={{
              borderRadius: "0.5rem",
              border: "1px solid #E5DCCB",
              background: "#ffffff",
              padding: "0.75rem 1.5rem",
              fontWeight: 600,
              color: "#2A2118",
              textDecoration: "none",
              fontSize: "1rem",
            }}
          >
            Back to Home
          </a>
        </div>
      </body>
    </html>
  );
}
