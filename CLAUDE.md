@AGENTS.md

# Legends Library — Frontend Standards

## Figure cards and grid

The canonical spec for card dimensions, classes, and DB field requirements lives in:
`../legends-library/ADD_FIGURE.md` — **read it before touching FigureCard.tsx or the figures grid.**

After any card or figure change, run:
```
cd ../legends-library && .venv/Scripts/python.exe validate_figures.py
```
Deploy only when the validator exits with 0 errors and 0 warnings.

## Key card rules (see ADD_FIGURE.md for full spec)
- `<article>` must have `h-full w-full` — never remove either.
- Portrait circle is always `size-28`. Do not change to `size-24` or any other size.
- Grid `<li>` must have `className="flex"` so the article fills the cell.
