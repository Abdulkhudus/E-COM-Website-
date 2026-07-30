"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, LogIn, Loader2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth, signInWithGoogle } from "@/lib/firebase";

// ─── QuantitySelector ─────────────────────────────────────────────────────────
// Props: the product_id string from the parent Server Component.

interface QuantitySelectorProps {
  productId: string;
}

export default function QuantitySelector({ productId }: QuantitySelectorProps) {
  const { user, loading: authLoading } = useAuth();
  const { addToCart, openDrawer } = useCart();

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded]   = useState(false);

  const decrement = () => setQty((q) => Math.max(1, q - 1));
  const increment = () => setQty((q) => Math.min(99, q + 1));

  async function handleAddToCart() {
    // If not signed in, trigger Google sign-in first
    if (!user) {
      await signInWithGoogle();
      return;
    }
    try {
      setAdding(true);
      await addToCart(productId, qty);
      setAdded(true);
      openDrawer();
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("[QuantitySelector] addToCart:", err);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ── Quantity row ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-foreground">Quantity</span>

        <div className="inline-flex items-center overflow-hidden rounded-xl border border-border bg-surface">
          {/* Minus */}
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={decrement}
            disabled={qty <= 1}
            className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Minus size={16} strokeWidth={2.5} />
          </button>

          {/* Value */}
          <span className="flex h-10 w-12 items-center justify-center border-x border-border text-sm font-bold text-foreground">
            {qty}
          </span>

          {/* Plus */}
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={increment}
            disabled={qty >= 99}
            className="flex h-10 w-10 items-center justify-center text-muted transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Plus size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ── Add to Cart / Sign in ─────────────────────────────────────── */}
      {!authLoading && !user ? (
        /* Not signed in — show sign-in CTA instead */
        <button
          type="button"
          onClick={signInWithGoogle}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-primary bg-surface px-6 py-3.5 text-base font-semibold text-primary shadow-sm transition-all duration-200 hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <LogIn size={18} strokeWidth={2} />
          Sign in to Add to Cart
        </button>
      ) : (
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={adding || authLoading}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:opacity-70"
        >
          {adding ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ShoppingCart size={18} strokeWidth={2.25} />
          )}
          {adding ? "Adding…" : added ? "Added!" : "Add to Cart"}
        </button>
      )}
    </div>
  );
}
