// Maps figure slugs to their illustrated header/portrait image paths (root-relative).
// Add entries as new figure images are generated.
export const FIGURE_HEADERS: Record<string, string> = {
  "alexander-hamilton": "/images/figures/header-hamilton.png",
  "benjamin-franklin": "/images/figures/header-franklin.png",
  "thomas-jefferson": "/images/figures/header-jefferson.png",
  "marcus-aurelius": "/images/figures/header-marcus.png",
  "theodore-roosevelt": "/images/figures/header-roosevelt.png",
  "winston-churchill": "/images/figures/header-churchill.png",
  "martin-luther-king": "/images/figures/header-mlk.png",
  "george-washington": "/images/figures/header-washington.png",
  "charlie-kirk": "/images/figures/header-charlie-kirk.png",
  "jesus-of-nazareth": "/images/figures/header-jesus.png",
  "jesus": "/images/figures/header-jesus.png",
};

// Maps figure slugs to background images for question/hot-takes cards.
export const QUESTION_BACKGROUNDS: Record<string, string> = {
  "winston-churchill": "/images/questions/churchill-ukraine.png?v=2",
  "alexander-hamilton": "/images/questions/hamilton-bitcoin.png?v=2",
  "martin-luther-king": "/images/questions/mlk-black-america.png?v=2",
  "marcus-aurelius": "/images/questions/marcus-anxiety.png?v=2",
};
