import Link from "next/link";
import { MobileMenu } from "@/components/marketing/MobileMenu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/figures", label: "Figures" },
  { href: "/how-it-works", label: "How it Works" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
];

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <header className="relative sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
          <Link href="/" className="flex flex-col">
            <span className="font-display text-xl font-bold text-ink">
              Legends Library
            </span>
            <span className="text-xs italic text-gold-dark">
              Hot takes, cold sources.
            </span>
          </Link>

          <nav className="hidden md:block" aria-label="Main">
            <ul className="flex items-center gap-6 text-sm font-medium">
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
            </ul>
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-ink hover:text-gold-dark"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold-dark"
            >
              Sign Up Free
            </Link>
          </div>

          <MobileMenu links={navLinks} />
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <p className="font-display text-lg font-bold text-ink">
                Legends Library
              </p>
              <p className="mt-1 text-sm italic text-gold-dark">
                Hot takes, cold sources.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Product</p>
              <ul className="mt-3 space-y-2 text-sm text-sub">
                <li>
                  <Link href="/figures" className="hover:text-gold-dark">
                    Figures
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="hover:text-gold-dark">
                    How it Works
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-gold-dark">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Company</p>
              <ul className="mt-3 space-y-2 text-sm text-sub">
                <li>
                  <Link href="/about" className="hover:text-gold-dark">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Legal</p>
              <ul className="mt-3 space-y-2 text-sm text-sub">
                <li>
                  <Link href="/terms" className="hover:text-gold-dark">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-gold-dark">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="hover:text-gold-dark">
                    Disclaimer
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <p className="mt-10 border-t border-border pt-6 text-xs text-sub">
            Conversations are AI reconstructions grounded in primary sources —
            not the real person.
          </p>
        </div>
      </footer>
    </div>
  );
}
