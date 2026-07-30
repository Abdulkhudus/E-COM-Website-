import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ─── Site-wide metadata ───────────────────────────────────────────────────────
// Child pages override `title` via the template; they only need to export a
// plain string and it will become "<Page Name> | LiveWire".

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://livewire.store";
const SITE_NAME = "LiveWire";
const DEFAULT_DESCRIPTION =
  "LiveWire — curated tech accessories, audio gear, and lifestyle products delivered fast. Discover unbeatable prices and premium quality.";

export const metadata: Metadata = {
  // ── Title ──────────────────────────────────────────────────────────────────
  title: {
    default: `${SITE_NAME} — Shop Smarter`,
    template: `%s | ${SITE_NAME}`,
  },

  // ── Description ────────────────────────────────────────────────────────────
  description: DEFAULT_DESCRIPTION,

  // ── Canonical & robots ────────────────────────────────────────────────────
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },

  // ── Icons ─────────────────────────────────────────────────────────────────
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },

  // ── Open Graph ────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Shop Smarter`,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.png", // drop a 1200×630 image in /public when ready
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} store`,
      },
    ],
  },

  // ── Twitter / X card ──────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@livewirestore",   // update to real handle when available
    creator: "@livewirestore",
    title: `${SITE_NAME} — Shop Smarter`,
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },
};

// ─── Root layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
