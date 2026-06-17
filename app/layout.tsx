import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://legendslibrary.ai'),
  title: {
    default: 'Legends Library',
    template: '%s — Legends Library',
  },
  description: "Ask history's greatest minds anything.",
  openGraph: {
    siteName: 'Legends Library',
    type: 'website',
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: 'Legends Library' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-default.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Legends Library",
              "url": "https://legendslibrary.ai",
              "description": "Ask history's greatest minds anything — answers grounded in primary sources.",
              "slogan": "Hot takes. Cold sources.",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
