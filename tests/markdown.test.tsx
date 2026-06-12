import { render, screen } from "@testing-library/react";
import { Markdown } from "@/components/marketing/Markdown";

function renderMd(text: string) {
  return render(<Markdown source={text} />);
}

describe("Markdown renderer — headings", () => {
  test("# renders h1", () => {
    renderMd("# Hello World");
    expect(screen.getByRole("heading", { level: 1, name: "Hello World" })).toBeInTheDocument();
  });

  test("## renders h2", () => {
    renderMd("## Section Title");
    expect(screen.getByRole("heading", { level: 2, name: "Section Title" })).toBeInTheDocument();
  });

  test("### renders h3", () => {
    renderMd("### Sub Section");
    expect(screen.getByRole("heading", { level: 3, name: "Sub Section" })).toBeInTheDocument();
  });
});

describe("Markdown renderer — paragraphs", () => {
  test("plain text renders as paragraph", () => {
    const { container } = renderMd("Just a paragraph.");
    expect(container.querySelector("p")).toHaveTextContent("Just a paragraph.");
  });

  test("two blocks separated by blank line become two paragraphs", () => {
    const { container } = renderMd("First paragraph.\n\nSecond paragraph.");
    const paras = container.querySelectorAll("p");
    expect(paras).toHaveLength(2);
    expect(paras[0]).toHaveTextContent("First paragraph.");
    expect(paras[1]).toHaveTextContent("Second paragraph.");
  });
});

describe("Markdown renderer — unordered list", () => {
  test("lines starting with - render as <ul>", () => {
    const { container } = renderMd("- Alpha\n- Beta\n- Gamma");
    expect(container.querySelector("ul")).not.toBeNull();
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Alpha");
    expect(items[1]).toHaveTextContent("Beta");
    expect(items[2]).toHaveTextContent("Gamma");
  });

  test("lines starting with * also render as <ul>", () => {
    const { container } = renderMd("* One\n* Two");
    expect(container.querySelector("ul")).not.toBeNull();
    const items = container.querySelectorAll("li");
    expect(items).toHaveLength(2);
  });
});

describe("Markdown renderer — inline formatting", () => {
  test("**bold** renders as <strong>", () => {
    const { container } = renderMd("This is **bold** text.");
    expect(container.querySelector("strong")).toHaveTextContent("bold");
  });

  test("*italic* renders as <em>", () => {
    const { container } = renderMd("This is *italic* text.");
    expect(container.querySelector("em")).toHaveTextContent("italic");
  });
});

describe("Markdown renderer — heading not separated by blank line", () => {
  test("## heading immediately followed by text still renders the heading", () => {
    // No blank line between ## heading and the following paragraph.
    renderMd("## My Heading\nSome text right below.");
    // The heading should be rendered as h2 (not swallowed into a paragraph).
    expect(
      screen.getByRole("heading", { level: 2, name: "My Heading" })
    ).toBeInTheDocument();
    // The following text should appear as a paragraph (not lost).
    expect(screen.getByText("Some text right below.")).toBeInTheDocument();
  });

  test("### heading immediately followed by text still renders heading", () => {
    renderMd("### Sub\nDetail text here.");
    expect(
      screen.getByRole("heading", { level: 3, name: "Sub" })
    ).toBeInTheDocument();
    expect(screen.getByText("Detail text here.")).toBeInTheDocument();
  });
});
