import { ImageResponse } from "next/og";
import {
  getFeaturedQuestionBySlug,
  getFiguresByIds,
} from "@/lib/marketing/data";
import { FIGURE_HEADERS } from "@/lib/marketing/assets";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A primary-source-grounded take from Legends Library";

/** Trim to a word boundary under `max` chars, adding an ellipsis when cut. */
function clip(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > 40 ? lastSpace : max).trimEnd() + "…";
}

type Props = { params: Promise<{ slug: string }> };

export default async function OGImage({ params }: Props) {
  const { slug } = await params;
  const question = await getFeaturedQuestionBySlug(slug);

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://legendslibrary.ai";

  // Primary response drives the share card (single-figure analyses are the norm;
  // for debates we feature the first voice).
  const response = question?.responses?.[0];
  const figures = question ? await getFiguresByIds(question.figureIds) : [];
  const figure = figures.find((f) => f.id === response?.figureId) ?? figures[0];

  const figureName = figure?.name ?? response?.figureName ?? "Legends Library";
  const citation = response?.citations?.[0];
  const headerImg = figure ? FIGURE_HEADERS[figure.slug] : undefined;
  const imgSrc = headerImg ? `${baseUrl}${headerImg}` : undefined;

  const quote = response?.answer
    ? clip(response.answer, 150)
    : (question?.question ?? "Ask history's greatest minds anything.");

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          background: "#1a1007",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {imgSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imgSrc}
            alt=""
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              height: "100%",
              width: "46%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: imgSrc
              ? "linear-gradient(to right, #1a1007 48%, transparent 78%)"
              : "#1a1007",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 68px",
            maxWidth: 700,
          }}
        >
          {question?.question && (
            <p
              style={{
                fontSize: 22,
                color: "#c9a227",
                margin: 0,
                fontStyle: "italic",
                lineHeight: 1.3,
              }}
            >
              {clip(question.question, 90)}
            </p>
          )}
          <p
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "#ffffff",
              margin: "16px 0 0",
              lineHeight: 1.15,
            }}
          >
            “{quote}”
          </p>
          <p
            style={{
              fontSize: 25,
              color: "#d4bfa0",
              margin: "20px 0 0",
              fontWeight: 600,
            }}
          >
            — {figureName}
          </p>
          {citation?.title && (
            <p style={{ fontSize: 18, color: "#9c8a6e", margin: "6px 0 0" }}>
              {clip(citation.title, 60)}
              {citation.year ? `, ${citation.year}` : ""}
            </p>
          )}
          <p
            style={{
              fontSize: 19,
              color: "#a8927a",
              margin: "26px 0 0",
              lineHeight: 1.4,
              display: "flex",
              flexWrap: "wrap",
              maxWidth: 600,
              gap: "0 8px",
            }}
          >
            <span>
              {`To see ${figureName}'s full response or ask your own question, visit`}
            </span>
            <span
              style={{
                color: "#c9a227",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              legendslibrary.ai
            </span>
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
