/**
 * Unit tests for lib/marketing/parsers.ts
 *
 * Fixture data mirrors the engine output shape from
 * legends-library/legends/featured.py:
 *   [{ figure_id, figure_name, answer, citations: [{title, url, year, snippet}], confidence }]
 */
import { describe, expect, it } from "vitest";
import {
  parseCitations,
  parseFeaturedQuestionRow,
  parseFigureRow,
  parseResponses,
  truncateExcerpt,
} from "@/lib/marketing/parsers";

// ── truncateExcerpt ──────────────────────────────────────────────────────────

describe("truncateExcerpt", () => {
  it("passes through text at exactly 300 chars", () => {
    const text = "a".repeat(300);
    expect(truncateExcerpt(text)).toBe(text);
  });

  it("truncates text over 300 chars and appends ellipsis", () => {
    const text = "a".repeat(350);
    const result = truncateExcerpt(text);
    expect(result).toHaveLength(301); // 300 chars + "…" (1 char)
    expect(result.endsWith("…")).toBe(true);
  });
});

// ── parseCitations ───────────────────────────────────────────────────────────

describe("parseCitations", () => {
  it("returns empty array for non-array input", () => {
    expect(parseCitations(null)).toEqual([]);
    expect(parseCitations("nope")).toEqual([]);
    expect(parseCitations({})).toEqual([]);
  });

  it("parses a well-formed citation", () => {
    const raw = [
      {
        title: "Letter to Birmingham Jail",
        url: "https://example.com/letter",
        year: 1963,
        snippet: "Injustice anywhere is a threat to justice everywhere.",
      },
    ];
    const result = parseCitations(raw);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: "Letter to Birmingham Jail",
      url: "https://example.com/letter",
      year: 1963,
      snippet: "Injustice anywhere is a threat to justice everywhere.",
    });
  });

  it("drops entries missing title", () => {
    const raw = [{ url: "https://example.com", year: 1963, snippet: "text" }];
    expect(parseCitations(raw)).toEqual([]);
  });

  it("gracefully handles a citation missing optional url — sets null", () => {
    const raw = [{ title: "No URL Source", year: 1965, snippet: "Some text" }];
    const result = parseCitations(raw);
    expect(result[0].url).toBeNull();
  });

  it("truncates snippet longer than 300 chars", () => {
    const longSnippet = "x".repeat(400);
    const raw = [{ title: "Long Source", url: null, year: 2000, snippet: longSnippet }];
    const result = parseCitations(raw);
    expect(result[0].snippet).toHaveLength(301);
    expect(result[0].snippet!.endsWith("…")).toBe(true);
  });
});

// ── parseResponses ───────────────────────────────────────────────────────────

describe("parseResponses", () => {
  it("returns empty array for non-array input", () => {
    expect(parseResponses(null)).toEqual([]);
    expect(parseResponses("nope")).toEqual([]);
  });

  it("parses a valid 2-response debate fixture", () => {
    const raw = [
      {
        figure_id: "uuid-mlk",
        figure_name: "Martin Luther King Jr.",
        answer: "Nonviolence is the answer.",
        citations: [
          {
            title: "Letter from Birmingham Jail",
            url: "https://example.com/letter",
            year: 1963,
            snippet: "Injustice anywhere is a threat.",
          },
        ],
        confidence: "strong",
      },
      {
        figure_id: "uuid-jesus",
        figure_name: "Jesus of Nazareth",
        answer: "Blessed are the peacemakers.",
        citations: [],
        confidence: "inferred",
      },
    ];
    const result = parseResponses(raw);
    expect(result).toHaveLength(2);

    expect(result[0].figureId).toBe("uuid-mlk");
    expect(result[0].figureName).toBe("Martin Luther King Jr.");
    expect(result[0].answer).toBe("Nonviolence is the answer.");
    expect(result[0].confidence).toBe("strong");
    expect(result[0].citations).toHaveLength(1);

    expect(result[1].figureId).toBe("uuid-jesus");
    expect(result[1].confidence).toBe("inferred");
    expect(result[1].citations).toHaveLength(0);
  });

  it("keeps entries with confidence 'refused' — badge handles rendering", () => {
    const raw = [
      {
        figure_id: "uuid-mlk",
        figure_name: "MLK",
        answer: "I cannot answer this.",
        citations: [],
        confidence: "refused",
      },
    ];
    const result = parseResponses(raw);
    expect(result).toHaveLength(1);
    expect(result[0].confidence).toBe("refused");
  });

  it("drops entries missing answer", () => {
    const raw = [
      { figure_id: "uuid-x", figure_name: "X", citations: [], confidence: "strong" },
      { figure_id: "uuid-y", figure_name: "Y", answer: "", citations: [], confidence: "strong" },
    ];
    expect(parseResponses(raw)).toHaveLength(0);
  });

  it("defaults confidence to 'inferred' when field is missing", () => {
    const raw = [
      { figure_id: "uuid-x", figure_name: "X", answer: "Some answer.", citations: [] },
    ];
    const result = parseResponses(raw);
    expect(result[0].confidence).toBe("inferred");
  });

  it("sets figureId and figureName to null when missing", () => {
    const raw = [{ answer: "An anonymous answer.", citations: [], confidence: "strong" }];
    const result = parseResponses(raw);
    expect(result[0].figureId).toBeNull();
    expect(result[0].figureName).toBeNull();
  });
});

// ── parseFeaturedQuestionRow ─────────────────────────────────────────────────

describe("parseFeaturedQuestionRow", () => {
  it("returns null when slug is missing", () => {
    expect(parseFeaturedQuestionRow({ question: "What is justice?" })).toBeNull();
  });

  it("returns null when question is missing", () => {
    expect(parseFeaturedQuestionRow({ slug: "justice" })).toBeNull();
  });

  it("returns null for null input", () => {
    expect(parseFeaturedQuestionRow(null)).toBeNull();
  });

  it("parses a valid row", () => {
    const row = {
      slug: "what-is-justice",
      question: "What is justice?",
      format: "debate",
    };
    const result = parseFeaturedQuestionRow(row);
    expect(result).not.toBeNull();
    expect(result!.slug).toBe("what-is-justice");
    expect(result!.question).toBe("What is justice?");
    expect(result!.format).toBe("debate");
  });

  it("leaves format undefined when missing from row", () => {
    const row = { slug: "justice", question: "What is justice?" };
    const result = parseFeaturedQuestionRow(row);
    expect(result!.format).toBeUndefined();
  });
});

// ── parseFigureRow ───────────────────────────────────────────────────────────

describe("parseFigureRow", () => {
  it("returns null when slug is missing", () => {
    expect(parseFigureRow({ name: "MLK" })).toBeNull();
  });

  it("returns null when name is missing", () => {
    expect(parseFigureRow({ slug: "mlk" })).toBeNull();
  });

  it("parses a valid row with all optional fields", () => {
    const row = {
      slug: "martin-luther-king",
      name: "Martin Luther King Jr.",
      era: "1929-1968",
      region: "USA",
      category: ["Civil Rights"],
      wave: 1,
      tagline: "Civil rights leader",
      portrait_url: "https://cdn.example.com/mlk.jpg",
      featured_order: 1,
    };
    const result = parseFigureRow(row);
    expect(result).not.toBeNull();
    expect(result!.slug).toBe("martin-luther-king");
    expect(result!.wave).toBe(1);
    expect(result!.category).toEqual(["Civil Rights"]);
  });

  it("defaults wave to LIVE_WAVE_DEFAULT when missing", () => {
    const result = parseFigureRow({ slug: "x", name: "X" });
    expect(result!.wave).toBe(1);
  });

  it("filters non-string values out of category array", () => {
    const result = parseFigureRow({ slug: "x", name: "X", category: [1, "Civil Rights", null] });
    expect(result!.category).toEqual(["Civil Rights"]);
  });
});
