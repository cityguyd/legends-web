"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileMenu({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink"
      >
        {open ? "✕" : "☰"}
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-full z-50 border-b border-border bg-surface px-6 py-4 shadow-md">
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-1 text-ink hover:text-gold-dark"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="border-t border-border pt-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block py-1 text-ink hover:text-gold-dark"
              >
                Log in
              </Link>
            </li>
            <li>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="inline-block rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white"
              >
                Sign Up Free
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}
