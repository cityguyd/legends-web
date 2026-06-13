import { test, expect } from "@playwright/test";

// End-to-end funnel against the real Next app + a mock engine (e2e/mock-engine.mjs).
// Figure data comes from the E2E_MOCK_DATA fixture seam in lib/marketing/data.ts;
// the anonymous daily limit is enforced by the engine (429), which the web app
// maps to the anon-daily LimitModal.
//
// Selectors were reconciled against the shipped components (Tasks 13–14):
//   - Composer placeholder is "Ask your question…" (generic, not figure-specific).
//   - The Ask button is labelled "Ask".
//   - FigureHeader's disclosure strip reads "…not the real person."
//   - ResponseCard shows the "Strong" badge for confidence tier "strong".
//   - The anon-daily LimitModal CTA is "Sign Up Free".

test("anonymous asks, hits limit, sees signup modal", async ({ page }) => {
  await page.goto("/chat/martin-luther-king");

  // Persistent disclosure strip is always visible on the chat page.
  await expect(page.getByText(/not the real person/i)).toBeVisible();

  const composer = page.getByPlaceholder(/ask your question/i);
  const askButton = page.getByRole("button", { name: /^ask$/i });

  // The composer is a React-controlled input whose Ask button stays disabled
  // until onChange fires. pressSequentially sends real key events so React's
  // state updates (a bare fill() can bypass React's value tracker and leave the
  // button disabled). Submit with Enter for the same reason.
  async function ask(question: string) {
    await composer.click();
    await composer.fill("");
    await composer.pressSequentially(question);
    await expect(askButton).toBeEnabled();
    await composer.press("Enter");
  }

  // Three successful questions — each produces a "Strong" response card.
  for (let i = 0; i < 3; i++) {
    await ask(`question ${i}`);
    await expect(page.getByText("Strong").nth(i)).toBeVisible();
  }

  // Fourth question — the mock engine returns 429 → anon-daily limit modal.
  // Scope to the dialog: "Sign Up Free" also appears in the sidebar, so assert
  // on the modal itself (its heading + CTA) to prove the limit modal opened.
  await ask("one more");
  const modal = page.getByRole("dialog");
  await expect(modal).toBeVisible();
  await expect(modal.getByText(/used your 3 free questions/i)).toBeVisible();
  await expect(
    modal.getByRole("link", { name: /sign up free/i })
  ).toBeVisible();
});

test("coming soon figure redirects to profile with notify modal", async ({
  page,
}) => {
  // george-washington is wave 2 in the fixture seam → chat page redirects to
  // the public profile, which offers a "Notify me…" affordance.
  await page.goto("/chat/george-washington");
  await expect(page).toHaveURL(/\/figures\/george-washington/);
  await expect(page.getByRole("button", { name: /notify me/i })).toBeVisible();
});
