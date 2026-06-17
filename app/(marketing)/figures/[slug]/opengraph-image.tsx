import { ImageResponse } from "next/og";
import { getFigureBySlug } from "@/lib/marketing/data";
import { FIGURE_HEADERS } from "@/lib/marketing/assets";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function OGImage({ params }: Props) {
  const { slug } = await params;
  const figure = await getFigureBySlug(slug);

  const name = figure?.name ?? "Legends Library";
  const tagline =
    figure?.tagline ?? "Ask history's greatest minds anything.";

  const headerImg = figure ? FIGURE_HEADERS[slug] : undefined;
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://legendslibrary.ai";
  const imgSrc = headerImg ? `${baseUrl}${headerImg}` : undefined;

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
        {/* Background portrait */}
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
              width: "50%",
              objectFit: "cover",
              objectPosition: "center top",
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: imgSrc
              ? "linear-gradient(to right, #1a1007 45%, transparent 75%)"
              : "#1a1007",
          }}
        />

        {/* Text */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "64px 72px",
            maxWidth: 640,
          }}
        >
          <p
            style={{
              fontSize: 20,
              color: "#c9a227",
              margin: 0,
              fontStyle: "italic",
              letterSpacing: "0.05em",
            }}
          >
            Hot takes. Cold sources.
          </p>
          <p
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#ffffff",
              margin: "16px 0 0",
              lineHeight: 1.1,
            }}
          >
            {name}
          </p>
          <p
            style={{
              fontSize: 26,
              color: "#d4bfa0",
              margin: "20px 0 0",
              lineHeight: 1.4,
            }}
          >
            {tagline}
          </p>
          <p
            style={{
              fontSize: 18,
              color: "#7a6a55",
              margin: "36px 0 0",
              letterSpacing: "0.08em",
            }}
          >
            legendslibrary.ai
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
