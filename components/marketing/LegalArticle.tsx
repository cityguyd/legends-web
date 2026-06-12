import { readFile } from "node:fs/promises";
import path from "node:path";
import { Markdown } from "@/components/marketing/Markdown";

/** Reads a markdown file from /content and renders it as a legal article. */
export async function LegalArticle({ file }: { file: string }) {
  const source = await readFile(
    path.join(process.cwd(), "content", file),
    "utf8"
  );
  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Markdown source={source} />
    </article>
  );
}
