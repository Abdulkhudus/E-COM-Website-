"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

// ─── QuantitySelector ─────────────────────────────────────────────────────────
// Interactive client component: quantity +/- and Add to Cart button.
// Cart logic is a no-op for now — ready to wire up later.

export default function QuantitySelector() {
  const [qty, setQty] = useState(1);

  const decrement = () => setQty((q) => Math.max(1, q - 1));
  const increment = () => setQty((q) => Math.min(99, q + 1));

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

      {/* ── Add to Cart ───────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => {
          /* TODO: wire up cart logic */
        }}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
      >
        <ShoppingCart size={18} strokeWidth={2.25} />
        Add to Cart
      </button>
    </div>
  );
}
