// Maps figure slugs to their illustrated header/portrait image paths (root-relative).
// Add entries as new figure images are generated.
export const FIGURE_HEADERS: Record<string, string> = {
  // Public-domain launch roster (wave 2) + live figures.
  "abraham-lincoln": "/images/figures/header-lincoln.png",
  "benjamin-franklin": "/images/figures/header-franklin.png",
  "frederick-douglass": "/images/figures/header-douglass.png",
  "rosa-parks": "/images/figures/header-rosa-parks.png",
  "susan-b-anthony": "/images/figures/header-susan-anthony.png",
  "marcus-aurelius": "/images/figures/header-marcus.png",
  "theodore-roosevelt": "/images/figures/header-roosevelt.png",
  "alexander-hamilton": "/images/figures/header-hamilton.png",
  "thomas-jefferson": "/images/figures/header-jefferson.png",
  "george-washington": "/images/figures/header-washington.png",
  "martin-luther-king": "/images/figures/header-mlk.png",
  "charlie-kirk": "/images/figures/header-charlie-kirk.png",
  "jesus-of-nazareth": "/images/figures/header-jesus.png",
  "jesus": "/images/figures/header-jesus.png",
};

// Maps figure slugs to background images for question/hot-takes cards.
export const QUESTION_BACKGROUNDS: Record<string, string> = {
  "martin-luther-king": "/images/questions/mlk-black-america.png?v=2",
  "marcus-aurelius": "/images/questions/marcus-anxiety.png?v=2",
};
