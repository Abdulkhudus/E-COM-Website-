"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Trash2, Plus, Minus, ShoppingBag, LogIn, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/lib/firebase";
import { signInWithGoogle } from "@/lib/firebase";

// ─── CartDrawer ───────────────────────────────────────────────────────────────

export default function CartDrawer() {
  const { user, loading: authLoading } = useAuth();
  const {
    items,
    loading,
    itemCount,
    subtotal,
    drawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Close on Escape key
  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Focus trap reference
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (drawerOpen) closeRef.current?.focus();
  }, [drawerOpen]);

  if (!drawerOpen) return null;

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity"
      />

      {/* ── Drawer panel ─────────────────────────────────────────────────── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="fixed inset-y-0 right-0 z-50 flex w-full sm:max-w-md flex-col bg-surface shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" strokeWidth={2} />
            <h2 className="text-base font-bold text-foreground">
              Your Cart
              {itemCount > 0 && (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close cart"
            onClick={closeDrawer}
            className="rounded-md p-2 text-muted transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* Auth loading */}
          {authLoading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={28} className="animate-spin text-muted" />
            </div>
          )}

          {/* Not signed in */}
          {!authLoading && !user && (
            <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
              <ShoppingBag size={48} className="text-muted opacity-40" />
              <div>
                <p className="font-semibold text-foreground">Sign in to view your cart</p>
                <p className="mt-1 text-sm text-muted">
                  Your saved items will appear here after signing in.
                </p>
              </div>
              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <LogIn size={15} strokeWidth={2} />
                Sign in with Google
              </button>
            </div>
          )}

          {/* Cart loading */}
          {!authLoading && user && loading && (
            <div className="flex h-full items-center justify-center">
              <Loader2 size={28} className="animate-spin text-muted" />
            </div>
          )}

          {/* Empty cart */}
          {!authLoading && user && !loading && items.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <ShoppingBag size={48} className="text-muted opacity-40" />
              <p className="font-semibold text-foreground">Your cart is empty</p>
              <p className="text-sm text-muted">Browse products and add something!</p>
              <Link
                href="/products"
                onClick={closeDrawer}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Shop Now
              </Link>
            </div>
          )}

          {/* Cart items */}
          {!authLoading && user && !loading && items.length > 0 && (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-xl border border-border bg-background p-3"
                >
                  {/* Product image */}
                  <Link
                    href={`/products/${item.product?.slug ?? item.product_id}`}
                    onClick={closeDrawer}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary"
                  >
                    {item.product?.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name ?? "Product"}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag size={24} className="text-muted opacity-30" />
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col gap-1.5">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                      {item.product?.name ?? item.product_id}
                    </p>
                    <p className="text-sm font-bold text-primary">
                      {item.product
                        ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
                            item.product.price * item.quantity
                          )
                        : "—"}
                    </p>

                    {/* Quantity controls + remove */}
                    <div className="mt-auto flex items-center justify-between">
                      {/* +/- stepper */}
                      <div className="inline-flex items-center overflow-hidden rounded-lg border border-border">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                        >
                          <Minus size={13} strokeWidth={2.5} />
                        </button>
                        <span className="flex h-9 w-8 items-center justify-center border-x border-border text-xs font-bold text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          disabled={item.quantity >= 99}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="flex h-9 w-9 items-center justify-center text-muted transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30"
                        >
                          <Plus size={13} strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeFromCart(item.id)}
                        className="rounded-md p-2 text-muted transition-colors hover:bg-secondary hover:text-error"
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — subtotal + checkout */}
        {user && !loading && items.length > 0 && (
          <div className="border-t border-border px-5 py-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-muted">Subtotal</span>
              <span className="text-lg font-extrabold text-foreground">{subtotal}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeDrawer}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
