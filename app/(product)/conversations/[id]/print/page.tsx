import { redirect } from "next/navigation";
import { getConversationForExport } from "@/lib/actions/conversations";

export const dynamic = "force-dynamic";

const styles = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    max-width: 720px;
    margin: 0 auto;
    padding: 40px 24px;
    color: #2A2118;
    background: #fff;
    line-height: 1.6;
  }
  h1 {
    font-size: 1.75rem;
    font-weight: bold;
    margin: 0 0 4px;
  }
  .meta {
    color: #6B5D4D;
    font-size: 0.875rem;
    margin-bottom: 32px;
  }
  .message {
    margin-bottom: 24px;
  }
  .message-role {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6B5D4D;
    margin-bottom: 6px;
  }
  .message-text {
    font-size: 1rem;
    line-height: 1.7;
    white-space: pre-wrap;
    margin: 0;
  }
  .user-message .message-role {
    color: #2A2118;
  }
  .figure-message {
    background: #FBF8F2;
    border-left: 3px solid #D59E3C;
    padding: 16px;
    border-radius: 4px;
  }
  .confidence {
    display: inline-block;
    font-size: 0.7rem;
    background: #EEE6D6;
    color: #6B5D4D;
    padding: 2px 8px;
    border-radius: 12px;
    margin-top: 8px;
  }
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #E5DCCB;
    font-size: 0.75rem;
    color: #6B5D4D;
  }
  .print-btn {
    display: block;
    margin: 0 auto 32px;
    padding: 10px 24px;
    background: #D59E3C;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }
  .print-btn:hover {
    background: #99700F;
  }
  @media print {
    .print-btn { display: none; }
    body { padding: 0; }
  }
`;

export default async function PrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getConversationForExport(id);

  if (result.kind === "unauthenticated" || result.kind === "not-found") {
    redirect("/conversations");
  }
  if (result.kind === "error") {
    redirect("/conversations");
  }

  const { data } = result;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{data.title} — Legends Library</title>
        {/* eslint-disable-next-line react/no-danger */}
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        {/* onClick as a plain string attribute works in HTML without "use client" */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-expect-error — onClick string is valid HTML attribute for print pages */}
        <button className="print-btn" onClick="window.print()">
          Save as PDF
        </button>

        <h1>{data.title}</h1>
        <p className="meta">
          {data.figureName ?? "Unknown figure"}
          {data.createdAt
            ? ` · ${new Date(data.createdAt).toLocaleDateString()}`
            : ""}
          {" · "}Legends Library — legendslibrary.ai
        </p>

        {data.messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${
              msg.role === "user" ? "user-message" : "figure-message"
            }`}
          >
            <div className="message-role">
              {msg.role === "user" ? "You" : (data.figureName ?? "Figure")}
            </div>
            <p className="message-text">{msg.text}</p>
            {msg.confidence && (
              <span className="confidence">{msg.confidence}</span>
            )}
          </div>
        ))}

        <div className="footer">
          AI reconstruction grounded in primary sources — not real statements
          from the person depicted. · legendslibrary.ai
        </div>

        {/* Auto-trigger print on page load */}
        <script
          dangerouslySetInnerHTML={{
            __html: "window.onload = function() { window.print(); };",
          }}
        />
      </body>
    </html>
  );
}
