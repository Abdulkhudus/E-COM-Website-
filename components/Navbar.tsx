"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Menu,
  X,
  Zap,
  LogIn,
  LogOut,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useAuth, signInWithGoogle, signOutUser } from "@/lib/firebase";

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

// ─── UserMenu ─────────────────────────────────────────────────────────────────
// Isolated so it can manage its own dropdown open/close state independently
// from the hamburger menu state in Navbar.

function UserMenu() {
  const { user, loading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [signingIn, setSigningIn]       = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignIn() {
    try {
      setSigningIn(true);
      await signInWithGoogle();
    } catch {
      // signInWithGoogle already logs the error internally
    } finally {
      setSigningIn(false);
    }
  }

  async function handleSignOut() {
    setDropdownOpen(false);
    await signOutUser();
  }

  // ── Auth state resolving ─────────────────────────────────────────────────
  if (loading) {
    return (
      <span className="flex h-9 w-9 items-center justify-center text-muted">
        <Loader2 size={18} className="animate-spin" />
      </span>
    );
  }

  // ── Signed out ───────────────────────────────────────────────────────────
  if (!user) {
    return (
      <button
        type="button"
        onClick={handleSignIn}
        disabled={signingIn}
        aria-label="Sign in with Google"
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-all hover:border-primary hover:text-primary disabled:opacity-60"
      >
        {signingIn ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <LogIn size={14} strokeWidth={2} />
        )}
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  // ── Signed in ────────────────────────────────────────────────────────────
  const displayName = user.displayName ?? "Account";
  const photoURL    = user.photoURL;
  const initials    = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        aria-label="Account menu"
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5 text-sm font-medium text-foreground shadow-sm transition-all hover:border-primary"
      >
        {/* Avatar */}
        {photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoURL}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {initials}
          </span>
        )}
        <span className="hidden max-w-[100px] truncate sm:inline">
          {displayName.split(" ")[0]}
        </span>
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`hidden shrink-0 text-muted transition-transform duration-200 sm:block ${
            dropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {dropdownOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
        >
          {/* User info header */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            {photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoURL}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-border"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {initials}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>

          {/* Sign out */}
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-muted transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <LogOut size={15} strokeWidth={2} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

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

        {/* ── Right: Auth + Cart + Hamburger ───────────────────────────── */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Auth control — sign-in button or user avatar+dropdown */}
          <UserMenu />

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
