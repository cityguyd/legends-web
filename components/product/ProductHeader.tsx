import Link from "next/link";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/conversations", label: "Conversations" },
  { href: "/figures", label: "Figures" },
];

/** Signed-in header for the dashboard / conversations pages. */
export function ProductHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/dashboard" className="flex flex-col">
          <span className="font-display text-xl font-bold text-ink">
            Legends Library
          </span>
          <span className="text-xs italic text-gold-dark">
            Hot takes, cold sources.
          </span>
        </Link>

        <nav aria-label="Main">
          <ul className="flex items-center gap-4 text-sm font-medium sm:gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-ink transition-colors hover:text-gold-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/pricing"
                className="rounded-lg bg-gold px-4 py-2 font-semibold text-white transition-colors hover:bg-gold-dark"
              >
                Upgrade
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
