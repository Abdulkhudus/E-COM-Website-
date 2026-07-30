"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X, Zap } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavbarProps {
  /** Number of items currently in the cart (placeholder = 0). */
  cartItemCount?: number;
}

// ─── Nav links config ─────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
] as const;

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar({ cartItemCount = 0 }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* ── Left: Logo / Store Name ──────────────────────────────────── */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-primary transition-opacity hover:opacity-80"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Zap size={16} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Live<span className="text-primary">Wire</span>
          </span>
        </Link>

        {/* ── Centre: Desktop Nav Links ─────────────────────────────────── */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-1"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* ── Right: Cart + Hamburger ───────────────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2">
          {/* Cart button */}
          <Link
            href="/cart"
            aria-label={`Cart — ${cartItemCount} item${cartItemCount !== 1 ? "s" : ""}`}
            className="relative rounded-md p-2 text-muted transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <ShoppingCart size={20} strokeWidth={1.75} />
            {cartItemCount > 0 && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-white"
              >
                {cartItemCount > 99 ? "99+" : cartItemCount}
              </span>
            )}
          </Link>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="rounded-md p-2 text-muted transition-colors hover:bg-secondary hover:text-secondary-foreground md:hidden"
          >
            {menuOpen ? (
              <X size={20} strokeWidth={1.75} />
            ) : (
              <Menu size={20} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown Menu ─────────────────────────────────────────── */}
      {menuOpen && (
        <div
          id="mobile-menu"
          role="navigation"
          aria-label="Mobile navigation"
          className="border-t border-border bg-surface px-4 pb-4 pt-2 md:hidden"
        >
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-secondary hover:text-secondary-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
